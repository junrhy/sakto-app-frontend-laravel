import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Plus, Edit, Trash, Search, Calculator, DollarSign, History, Receipt } from "lucide-react";
import { Checkbox } from "@/Components/ui/checkbox";
import axios from 'axios';

interface Payment {
    id: number;
    loan_id: number;
    payment_date: string;
    amount: number;
}

interface Loan {
    id: number;
    borrower_name: string;
    amount: string;
    interest_rate: string;
    start_date: string;
    end_date: string;
    status: 'active' | 'paid' | 'defaulted';
    compounding_frequency: 'daily' | 'monthly' | 'quarterly' | 'annually';
    interest_type: 'fixed' | 'compounding';
    total_interest: string;
    total_balance: string;
    paid_amount: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
    payments?: Payment[];
    installment_frequency?: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually' | null;
    installment_amount?: string | null;
}

interface DeleteWarningInfo {
    activeLoans: number;
    totalAmount: number;
}

interface Bill {
    id: number;
    loan_id: number;
    due_date: string;
    principal: string;
    interest: string;
    total_amount: string;
    status: 'pending' | 'paid' | 'overdue';
    client_identifier: string;
    created_at: string;
    updated_at: string;
}

interface LoanDuration {
    label: string;
    days: number | null;
}

interface CreditScore {
    score: number;
    label: string;
    color: string;
}

interface InstallmentOption {
    label: string;
    value: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually';
    daysInterval: number;
}

const LOAN_DURATIONS: LoanDuration[] = [
    { label: 'Custom', days: null },
    { label: '1 Week', days: 7 },
    { label: '2 Weeks', days: 14 },
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 },
    { label: '2 Years', days: 730 },
    { label: '3 Years', days: 1095 },
    { label: '5 Years', days: 1825 },
    { label: '10 Years', days: 3650 },
    { label: '15 Years', days: 5475 },
    { label: '20 Years', days: 7300 },
    { label: '25 Years', days: 9125 },
    { label: '30 Years', days: 10950 },
];

const INSTALLMENT_OPTIONS: InstallmentOption[] = [
    { label: 'Weekly', value: 'weekly', daysInterval: 7 },
    { label: 'Bi-weekly', value: 'bi-weekly', daysInterval: 14 },
    { label: 'Monthly', value: 'monthly', daysInterval: 30 },
    { label: 'Quarterly', value: 'quarterly', daysInterval: 90 },
    { label: 'Annually', value: 'annually', daysInterval: 365 },
];

const formatAmount = (amount: string | number, currency: any): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const parts = numAmount.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousands_separator);
    return `${currency.symbol}${parts.join('.')}`;
};

const calculateCreditScore = (loan: Loan, payments: Payment[]): CreditScore => {
    // Base score starts at 650
    let score = 650;
    
    // Get loan payments for this specific loan
    const loanPayments = payments.filter(payment => payment.loan_id === loan.id);
    
    // Payment history impact (max +200 points)
    const paymentRatio = parseFloat(loan.paid_amount) / parseFloat(loan.total_balance);
    score += Math.round(paymentRatio * 200);
    
    // Loan status impact
    switch(loan.status) {
        case 'paid':
            score += 150; // Fully paid loans boost score significantly
            break;
        case 'active':
            // No impact for active loans
            break;
        case 'defaulted':
            score -= 300; // Major penalty for defaulted loans
            break;
    }
    
    // Final score adjustments
    score = Math.max(300, Math.min(850, score)); // Keep score between 300-850
    
    // Determine credit rating label and color
    let label: string;
    let color: string;
    
    if (score >= 800) {
        label = 'Excellent';
        color = 'text-green-600 dark:text-green-400';
    } else if (score >= 740) {
        label = 'Very Good';
        color = 'text-emerald-600 dark:text-emerald-400';
    } else if (score >= 670) {
        label = 'Good';
        color = 'text-blue-600 dark:text-blue-400';
    } else if (score >= 580) {
        label = 'Fair';
        color = 'text-yellow-600 dark:text-yellow-400';
    } else {
        label = 'Poor';
        color = 'text-red-600 dark:text-red-400';
    }
    
    return { score, label, color };
};

const calculateInstallmentAmount = (
    totalAmount: number,
    startDate: string,
    endDate: string,
    frequency: InstallmentOption['value']
): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysInterval = INSTALLMENT_OPTIONS.find(opt => opt.value === frequency)?.daysInterval || 30;
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const numberOfInstallments = Math.ceil(totalDays / daysInterval);
    return totalAmount / numberOfInstallments;
};

export default function Loan({ initialLoans, initialPayments, initialBills, appCurrency }: { initialLoans: Loan[], initialPayments: Payment[], initialBills: Bill[], appCurrency: any }) {
    const [loans, setLoans] = useState<Loan[]>(initialLoans);
    const [payments, setPayments] = useState<Payment[]>(initialPayments);
    const [bills, setBills] = useState<Bill[]>(initialBills);
    const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] = useState(false);
    const [isBillHistoryDialogOpen, setIsBillHistoryDialogOpen] = useState(false);
    const [currentLoan, setCurrentLoan] = useState<Loan | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [selectedLoans, setSelectedLoans] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [loanToDelete, setLoanToDelete] = useState<number | null>(null);
    const [isDeleteSelectedDialogOpen, setIsDeleteSelectedDialogOpen] = useState(false);
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isCreateBillDialogOpen, setIsCreateBillDialogOpen] = useState(false);
    const [billDueDate, setBillDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [paymentError, setPaymentError] = useState<string>("");
    const [dateError, setDateError] = useState<string>("");
    const [validationErrors, setValidationErrors] = useState({
        start_date: '',
        end_date: '',
        status: '',
        borrower_name: '',
        amount: '',
        interest_rate: ''
    });
    const [installmentAmount, setInstallmentAmount] = useState<string>('0');

    const handleAddLoan = () => {
        setCurrentLoan({
            id: 0,
            borrower_name: '',
            amount: '',
            interest_rate: '',
            start_date: '',
            end_date: '',
            status: 'active',
            interest_type: 'fixed',
            compounding_frequency: 'monthly',
            total_interest: '0',
            total_balance: '0',
            paid_amount: '0',
            client_identifier: '',
            created_at: '',
            updated_at: ''
        });
        setIsLoanDialogOpen(true);
    };

    const handleEditLoan = (loan: Loan) => {
        setCurrentLoan(loan);
        setIsLoanDialogOpen(true);
    };

    const handleDeleteLoan = async (id: number) => {
        setLoanToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteLoan = async () => {
        if (loanToDelete) {
            try {
                await axios.delete(`/loan/${loanToDelete}`);
                setLoans(loans.filter(loan => loan.id !== loanToDelete));
                setSelectedLoans(selectedLoans.filter(loanId => loanId !== loanToDelete));
                setIsDeleteDialogOpen(false);
                setLoanToDelete(null);
            } catch (error) {
                console.error('Error deleting loan:', error);
                // Add error handling here
            }
        }
    };

    const handleDeleteSelectedLoans = () => {
        setIsDeleteSelectedDialogOpen(true);
    };

    const confirmDeleteSelectedLoans = async () => {
        try {
            await axios.post('/loan/bulk-delete', { ids: selectedLoans });
            setLoans(loans.filter(loan => !selectedLoans.includes(loan.id)));
            setSelectedLoans([]);
            setIsDeleteSelectedDialogOpen(false);
        } catch (error) {
            console.error('Error deleting selected loans:', error);
            // Add error handling here
        }
    };

    const handleSaveLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear previous errors
        setValidationErrors({
            start_date: '',
            end_date: '',
            status: '',
            borrower_name: '',
            amount: '',
            interest_rate: ''
        });
        setDateError("");

        // Validate required fields
        let hasErrors = false;
        const newErrors = {
            start_date: '',
            end_date: '',
            status: '',
            borrower_name: '',
            amount: '',
            interest_rate: ''
        };

        if (!currentLoan?.borrower_name?.trim()) {
            newErrors.borrower_name = 'Borrower name is required';
            hasErrors = true;
        }

        if (!currentLoan?.amount) {
            newErrors.amount = 'Amount is required';
            hasErrors = true;
        } else if (isNaN(parseFloat(currentLoan.amount)) || parseFloat(currentLoan.amount) <= 0) {
            newErrors.amount = 'Amount must be a positive number';
            hasErrors = true;
        }

        if (!currentLoan?.interest_rate) {
            newErrors.interest_rate = 'Interest rate is required';
            hasErrors = true;
        } else if (isNaN(parseFloat(currentLoan.interest_rate)) || parseFloat(currentLoan.interest_rate) < 0) {
            newErrors.interest_rate = 'Interest rate must be a non-negative number';
            hasErrors = true;
        }

        if (!currentLoan?.start_date) {
            newErrors.start_date = 'Start date is required';
            hasErrors = true;
        }

        if (!currentLoan?.end_date) {
            newErrors.end_date = 'End date is required';
            hasErrors = true;
        }

        if (!currentLoan?.status) {
            newErrors.status = 'Status is required';
            hasErrors = true;
        }

        if (hasErrors) {
            setValidationErrors(newErrors);
            return;
        }

        // Validate date order
        if (currentLoan) {
            const startDate = new Date(currentLoan.start_date);
            const endDate = new Date(currentLoan.end_date);

            if (endDate < startDate) {
                setDateError("End date cannot be earlier than start date");
                return;
            }

            try {
                let installmentData = {};
                if (currentLoan.installment_frequency) {
                    const amount = calculateInstallmentAmount(
                        parseFloat(currentLoan.total_balance || currentLoan.amount),
                        currentLoan.start_date,
                        currentLoan.end_date,
                        currentLoan.installment_frequency
                    );
                    installmentData = {
                        installment_frequency: currentLoan.installment_frequency,
                        installment_amount: amount.toFixed(2)
                    };
                }

                const loanData = {
                    ...currentLoan,
                    amount: parseFloat(currentLoan.amount).toString(),
                    interest_rate: parseFloat(currentLoan.interest_rate).toString(),
                    ...installmentData
                };

                const response = await (currentLoan.id ? 
                    axios.put(`/loan/${currentLoan.id}`, loanData) :
                    axios.post('/loan', loanData));

                const savedLoan = response.data;
                
                if (currentLoan.id) {
                    setLoans(loans.map(loan => 
                        loan.id === savedLoan.data.loan.id ? savedLoan.data.loan : loan
                    ));
                } else {
                    setLoans([...loans, savedLoan]);
                }
                
                setIsLoanDialogOpen(false);
                setCurrentLoan(null);
            } catch (error) {
                console.error('Error saving loan:', error);
                // Add error handling here
            }
        }
    };

    const toggleLoanSelection = (id: number) => {
        setSelectedLoans(prev =>
        prev.includes(id) ? prev.filter(loanId => loanId !== id) : [...prev, id]
        );
    };

    const filteredLoans = useMemo(() => {
        return loans.filter(loan =>
            (loan.borrower_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (loan.status?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
        );
    }, [loans, searchTerm]);

    const paginatedLoans = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredLoans.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredLoans, currentPage]);

    const pageCount = Math.ceil(filteredLoans.length / itemsPerPage);

    const handlePayment = (loan: Loan) => {
        setCurrentLoan(loan);
        setPaymentAmount("");
        setIsPaymentDialogOpen(true);
    };

    const confirmPayment = async () => {
        if (currentLoan && paymentAmount) {
            const remainingBalance = parseFloat(currentLoan.total_balance) - parseFloat(currentLoan.paid_amount);
            const paymentAmountFloat = parseFloat(paymentAmount);

            // Clear any previous error
            setPaymentError("");

            // Validate payment amount
            if (paymentAmountFloat > remainingBalance) {
                setPaymentError(`Payment amount cannot exceed remaining balance of ${appCurrency.symbol}${remainingBalance.toFixed(2)}`);
                return;
            }

            try {
                const response = await axios.post(`/loan/${currentLoan.id}/payment`, {
                    amount: paymentAmountFloat,
                    payment_date: paymentDate
                });

                const newPayment = response.data.payment;
                
                setPayments(prevPayments => [...prevPayments, newPayment]);
                
                setIsPaymentDialogOpen(false);
                setCurrentLoan(null);
                setPaymentAmount("");
                setPaymentError("");
                
                console.log('Payment recorded successfully');
            } catch (error) {
                console.error('Error recording payment:', error);
                // Add error handling here
            }
        }
    };

    const handleShowPaymentHistory = (loan: Loan) => {
        console.log('Showing payment history for loan:', loan);
        console.log('Available payments:', payments);
        setCurrentLoan(loan);
        setIsPaymentHistoryDialogOpen(true);
    };

    const handleShowBillHistory = async (loan: Loan) => {
        try {
            setCurrentLoan(loan);
            setIsBillHistoryDialogOpen(true);
        } catch (error) {
            console.error('Error fetching bills:', error);
        }
    };

    const getDeleteWarningInfo = (loanIds: number[]): DeleteWarningInfo => {
        const selectedLoanDetails = loans.filter(loan => loanIds.includes(loan.id));
        return {
            activeLoans: selectedLoanDetails.filter(loan => loan.status === 'active').length,
            totalAmount: selectedLoanDetails.reduce((sum, loan) => sum + parseFloat(loan.amount), 0)
        };
    };

    const handleCreateBill = (loan: Loan) => {
        setCurrentLoan(loan);
        setIsCreateBillDialogOpen(true);
    };

    const confirmCreateBill = async () => {
        if (currentLoan) {
            try {
                const response = await axios.post(`/loan/bill/${currentLoan.id}`, {
                    due_date: billDueDate,
                    total_amount: (parseFloat(currentLoan.total_balance) - parseFloat(currentLoan.paid_amount)).toString(),
                    principal: currentLoan.amount,
                    interest: currentLoan.total_interest,
                    status: 'pending'
                });

                // Close dialog and reset state
                setIsCreateBillDialogOpen(false);
                setCurrentLoan(null);
                setBillDueDate(new Date().toISOString().split('T')[0]);

                console.log('Bill created successfully');
            } catch (error) {
                console.error('Error creating bill:', error);
                // Add error handling here
            }
        }
    };

    const handleDurationChange = (days: number | null) => {
        if (days === null) return;
        
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + days);
        
        setCurrentLoan({
            ...currentLoan!,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Loans
                </h2>
            }
        >
            <Head title="Loans" />

            <div className="p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <Card>
                    <CardHeader>
                    <CardTitle>Loans</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button 
                                onClick={handleAddLoan}
                                className="w-full sm:w-auto"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Loan
                            </Button>
                            <Button 
                                onClick={handleDeleteSelectedLoans} 
                                variant="destructive" 
                                disabled={selectedLoans.length === 0}
                                className="w-full sm:w-auto"
                            >
                                <Trash className="mr-2 h-4 w-4" /> Delete Selected
                            </Button>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search loans..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 w-full"
                            />
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={selectedLoans.length === paginatedLoans.length}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedLoans(paginatedLoans.map(loan => loan.id));
                                            } else {
                                                setSelectedLoans([]);
                                            }
                                        }}
                                    />
                                </TableHead>
                                <TableHead>Borrower Details</TableHead>
                                <TableHead>Loan Terms</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Financial Details</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedLoans.map((loan) => {
                                const totalRemaining = (parseFloat(loan.total_balance) - parseFloat(loan.paid_amount)).toFixed(2);
                                return (
                                    <TableRow key={loan.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedLoans.includes(loan.id)}
                                                onCheckedChange={() => toggleLoanSelection(loan.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="font-medium text-lg">{loan.borrower_name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        ID: {(() => {
                                                            const date = new Date(loan.created_at);
                                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                                            const year = date.getFullYear().toString().slice(-2);
                                                            const sequence = String(loan.id).padStart(4, '0');
                                                            return `${year}${month}-${sequence}`;
                                                        })()}
                                                        <span className="text-xs ml-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                                            BRW
                                                        </span>
                                                    </p>
                                                </div>
                                                {(() => {
                                                    const creditScore = calculateCreditScore(loan, payments);
                                                    return (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-sm text-gray-500">Credit Score:</span>
                                                                <span className={`font-medium ${creditScore.color}`}>
                                                                    {creditScore.score}
                                                                </span>
                                                            </div>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${creditScore.color} border-current`}>
                                                                {creditScore.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium">{formatAmount(loan.amount, appCurrency)}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-gray-500">
                                                        {parseFloat(loan.interest_rate)}% 
                                                        <span className="ml-1">
                                                            ({loan.interest_type === 'fixed' ? 'Fixed' : 'Compounding'})
                                                        </span>
                                                    </p>
                                                    {loan.interest_type === 'compounding' && (
                                                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full">
                                                            {loan.compounding_frequency.charAt(0).toUpperCase() + loan.compounding_frequency.slice(1)}
                                                        </span>
                                                    )}
                                                </div>
                                                {loan.installment_frequency && loan.installment_amount && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        <span className="font-medium">
                                                            {formatAmount(loan.installment_amount, appCurrency)}
                                                        </span>
                                                        <span className="ml-1">
                                                            per {loan.installment_frequency.replace('-', ' ')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="text-sm">Start: {new Date(loan.start_date).toLocaleDateString()}</p>
                                                <p className="text-sm">End: {new Date(loan.end_date).toLocaleDateString()}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Principal:</span>
                                                    <span className="font-medium">{formatAmount(loan.amount, appCurrency)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Interest:</span>
                                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                                        + {formatAmount(loan.total_interest, appCurrency)}
                                                    </span>
                                                </div>
                                                <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                                                    <div className="flex justify-between text-sm font-semibold">
                                                        <span>Total Balance:</span>
                                                        <span>{formatAmount(loan.total_balance, appCurrency)}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1 pt-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Paid Amount:</span>
                                                        <span className="text-green-600 dark:text-green-400">
                                                            - {formatAmount(loan.paid_amount, appCurrency)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm font-medium border-t border-gray-200 dark:border-gray-700 pt-1">
                                                        <span>Outstanding:</span>
                                                        <span className="text-red-600 dark:text-red-400">
                                                            {formatAmount((parseFloat(loan.total_balance) - parseFloat(loan.paid_amount)).toString(), appCurrency)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEditLoan(loan)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDeleteLoan(loan.id)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                                {(parseFloat(loan.total_balance) - parseFloat(loan.paid_amount)) > 0 && (
                                                    <Button variant="default" size="sm" onClick={() => handlePayment(loan)}>
                                                        <span className="ml-1">Pay</span>
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" onClick={() => handleShowPaymentHistory(loan)}>
                                                    <History className="h-4 w-4" />
                                                    <span className="ml-1">Payment</span>
                                                </Button>
                                                <Button 
                                                    variant="default" 
                                                    size="sm" 
                                                    className="bg-black hover:bg-gray-800" 
                                                    onClick={() => handleCreateBill(loan)}
                                                >
                                                    <span className="ml-1">Bill</span>
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleShowBillHistory(loan)}
                                                >
                                                    <History className="h-4 w-4" />
                                                    <span className="ml-1">Bill</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <div className="flex justify-between items-center mt-4">
                        <div>
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLoans.length)} of {filteredLoans.length} loans
                        </div>
                        <div className="flex space-x-2">
                        <Button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                            <Button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            variant={currentPage === page ? "default" : "outline"}
                            >
                            {page}
                            </Button>
                        ))}
                        <Button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                            disabled={currentPage === pageCount}
                        >
                            Next
                        </Button>
                        </div>
                    </div>
                    </CardContent>
                </Card>

                <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentLoan?.id ? 'Edit Loan' : 'Add Loan'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveLoan}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="borrowerName" className="text-right">
                                    Borrower Name <span className="text-red-500">*</span>
                                </Label>
                                <div className="col-span-3 space-y-1">
                                    <Input
                                        id="borrowerName"
                                        value={currentLoan?.borrower_name || ''}
                                        onChange={(e) => {
                                            setValidationErrors(prev => ({...prev, borrower_name: ''}));
                                            setCurrentLoan({ ...currentLoan!, borrower_name: e.target.value });
                                        }}
                                        className={validationErrors.borrower_name ? "border-red-500" : ""}
                                    />
                                    {validationErrors.borrower_name && (
                                        <p className="text-sm text-red-500">{validationErrors.borrower_name}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">
                                    Amount <span className="text-red-500">*</span>
                                </Label>
                                <div className="col-span-3 space-y-1">
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={currentLoan?.amount || ''}
                                        onChange={(e) => {
                                            setValidationErrors(prev => ({...prev, amount: ''}));
                                            setCurrentLoan({ ...currentLoan!, amount: e.target.value });
                                        }}
                                        className={validationErrors.amount ? "border-red-500" : ""}
                                    />
                                    {validationErrors.amount && (
                                        <p className="text-sm text-red-500">{validationErrors.amount}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="interestRate" className="text-right">
                                    Interest Rate <span className="text-red-500">*</span>
                                </Label>
                                <div className="col-span-3 space-y-1">
                                    <Input
                                        id="interestRate"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={currentLoan?.interest_rate || ''}
                                        onChange={(e) => {
                                            setValidationErrors(prev => ({...prev, interest_rate: ''}));
                                            setCurrentLoan({ ...currentLoan!, interest_rate: e.target.value });
                                        }}
                                        className={validationErrors.interest_rate ? "border-red-500" : ""}
                                    />
                                    {validationErrors.interest_rate && (
                                        <p className="text-sm text-red-500">{validationErrors.interest_rate}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="interestType" className="text-right">Interest Type</Label>
                                <Select
                                    value={currentLoan?.interest_type || 'fixed'}
                                    onValueChange={(value: 'fixed' | 'compounding') => setCurrentLoan({ 
                                        ...currentLoan!, 
                                        interest_type: value,
                                        compounding_frequency: value === 'fixed' ? 'monthly' : (currentLoan?.compounding_frequency || 'monthly')
                                    })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select interest type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Fixed Interest</SelectItem>
                                        <SelectItem value="compounding">Compounding Interest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="compoundingFrequency" className="text-right">
                                    Compounding Frequency
                                </Label>
                                <Select
                                    value={currentLoan?.compounding_frequency || ''}
                                    onValueChange={(value: 'daily' | 'monthly' | 'quarterly' | 'annually') => 
                                        setCurrentLoan({ ...currentLoan!, compounding_frequency: value })}
                                    disabled={currentLoan?.interest_type === 'fixed'}
                                >
                                    <SelectTrigger className={`col-span-3 ${
                                        currentLoan?.interest_type === 'fixed' ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                        <SelectItem value="annually">Annually</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="duration" className="text-right">Duration</Label>
                                <Select
                                    value={(() => {
                                        if (!currentLoan?.start_date || !currentLoan?.end_date) return '';
                                        const startDate = new Date(currentLoan.start_date);
                                        const endDate = new Date(currentLoan.end_date);
                                        const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                                        const matchingDuration = LOAN_DURATIONS.find(d => d.days === diffDays);
                                        return matchingDuration ? diffDays.toString() : 'null';
                                    })()}
                                    onValueChange={(value) => handleDurationChange(value === 'null' ? null : parseInt(value))}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select loan duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LOAN_DURATIONS.map((duration) => (
                                            <SelectItem 
                                                key={duration.label} 
                                                value={duration.days?.toString() ?? 'null'}
                                            >
                                                {duration.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="startDate" className="text-right">
                                    Start Date <span className="text-red-500">*</span>
                                </Label>
                                <div className="col-span-3 space-y-1">
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={currentLoan?.start_date || ''}
                                        onChange={(e) => {
                                            setDateError("");
                                            setValidationErrors(prev => ({...prev, start_date: ''}));
                                            setCurrentLoan({ 
                                                ...currentLoan!, 
                                                start_date: e.target.value,
                                            });
                                        }}
                                        className={validationErrors.start_date ? "border-red-500" : ""}
                                    />
                                    {validationErrors.start_date && (
                                        <p className="text-sm text-red-500">{validationErrors.start_date}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="endDate" className="text-right">
                                    End Date <span className="text-red-500">*</span>
                                </Label>
                                <div className="col-span-3 space-y-1">
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={currentLoan?.end_date || ''}
                                        onChange={(e) => {
                                            setDateError("");
                                            setValidationErrors(prev => ({...prev, end_date: ''}));
                                            setCurrentLoan({ 
                                                ...currentLoan!, 
                                                end_date: e.target.value,
                                            });
                                        }}
                                        className={validationErrors.end_date || dateError ? "border-red-500" : ""}
                                    />
                                    {validationErrors.end_date && (
                                        <p className="text-sm text-red-500">{validationErrors.end_date}</p>
                                    )}
                                    {dateError && (
                                        <p className="text-sm text-red-500">{dateError}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Status <span className="text-red-500">*</span>
                                </Label>
                                <div className="col-span-3 space-y-1">
                                    <Select
                                        value={currentLoan?.status || ''}
                                        onValueChange={(value: 'active' | 'paid' | 'defaulted') => {
                                            setValidationErrors(prev => ({...prev, status: ''}));
                                            setCurrentLoan({ ...currentLoan!, status: value });
                                        }}
                                    >
                                        <SelectTrigger className={`col-span-3 ${validationErrors.status ? "border-red-500" : ""}`}>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="defaulted">Defaulted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {validationErrors.status && (
                                        <p className="text-sm text-red-500">{validationErrors.status}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="installmentFrequency" className="text-right">
                                    Installment Frequency
                                </Label>
                                <div className="col-span-3">
                                    <Select
                                        value={currentLoan?.installment_frequency || ''}
                                        onValueChange={(value: InstallmentOption['value'] | 'none') => {
                                            if (value === 'none') {
                                                // Clear installment-related fields
                                                setInstallmentAmount('0');
                                                setCurrentLoan({ 
                                                    ...currentLoan!, 
                                                    installment_frequency: null,
                                                    installment_amount: null
                                                });
                                            } else if (currentLoan && currentLoan.total_balance && currentLoan.start_date && currentLoan.end_date) {
                                                const amount = calculateInstallmentAmount(
                                                    parseFloat(currentLoan.total_balance),
                                                    currentLoan.start_date,
                                                    currentLoan.end_date,
                                                    value as InstallmentOption['value']
                                                );
                                                setInstallmentAmount(amount.toFixed(2));
                                                setCurrentLoan({ 
                                                    ...currentLoan, 
                                                    installment_frequency: value as InstallmentOption['value'],
                                                    installment_amount: amount.toFixed(2)
                                                });
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No installments</SelectItem>
                                            {INSTALLMENT_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            {currentLoan?.installment_frequency && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Installment Amount</Label>
                                    <div className="col-span-3">
                                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-medium">
                                                        {formatAmount(currentLoan.installment_amount || installmentAmount, appCurrency)}
                                                    </span>
                                                    <span className="text-sm text-gray-500 ml-2">
                                                        per {currentLoan.installment_frequency.replace('-', ' ')}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {(() => {
                                                        const option = INSTALLMENT_OPTIONS.find(opt => 
                                                            opt.value === currentLoan.installment_frequency
                                                        );
                                                        if (!option) return null;
                                                        const totalDays = Math.ceil(
                                                            (new Date(currentLoan.end_date).getTime() - 
                                                            new Date(currentLoan.start_date).getTime()) / 
                                                            (1000 * 60 * 60 * 24)
                                                        );
                                                        const numberOfInstallments = Math.ceil(totalDays / option.daysInterval);
                                                        return `${numberOfInstallments} installments total`;
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="paymentAmount" className="text-right">Payment Amount</Label>
                        <Input
                            id="paymentAmount"
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => {
                                setPaymentAmount(e.target.value);
                                setPaymentError(""); // Clear error when input changes
                            }}
                            className="col-span-3"
                        />
                        </div>
                        {paymentError && (
                            <div className="col-span-4 text-red-500 text-sm">
                                {paymentError}
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="paymentDate" className="text-right">Payment Date</Label>
                            <Input
                                id="paymentDate"
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        {currentLoan && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Remaining Balance</Label>
                                <div className="col-span-3">
                                    {formatAmount(parseFloat(currentLoan.total_balance) - parseFloat(currentLoan.paid_amount), appCurrency)}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={confirmPayment}>Confirm Payment</Button>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isPaymentHistoryDialogOpen} onOpenChange={setIsPaymentHistoryDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Payment History - {currentLoan?.borrower_name}</DialogTitle>
                        </DialogHeader>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments && payments.length > 0 ? (
                                    payments
                                        .filter(payment => currentLoan && payment.loan_id === currentLoan.id)
                                        .map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>
                                                    {payment.payment_date ? 
                                                        new Date(payment.payment_date).toLocaleDateString() : 
                                                        'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {formatAmount(payment.amount, appCurrency)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center">
                                            No payment records found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <DialogFooter>
                            <Button onClick={() => setIsPaymentHistoryDialogOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isBillHistoryDialogOpen} onOpenChange={setIsBillHistoryDialogOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Bill History - {currentLoan?.borrower_name}</DialogTitle>
                        </DialogHeader>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Principal</TableHead>
                                    <TableHead>Interest</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(() => {
                                    const filteredBills = currentLoan 
                                        ? bills.filter(bill => bill.loan_id === currentLoan.id)
                                        : [];

                                    if (filteredBills.length === 0) {
                                        return (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-4">
                                                    No bills found for this loan
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }

                                    return filteredBills.map((bill) => {
                                        const status = bill.status || 'pending';
                                        const statusColor = 
                                            status === 'paid' ? 'bg-green-100 text-green-800' :
                                            status === 'overdue' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800';

                                        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

                                        return (
                                            <TableRow key={bill.id}>
                                                <TableCell>
                                                    {new Date(bill.due_date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {formatAmount(bill.principal, appCurrency)}
                                                </TableCell>
                                                <TableCell>
                                                    {formatAmount(bill.interest, appCurrency)}
                                                </TableCell>
                                                <TableCell>
                                                    {formatAmount(bill.total_amount, appCurrency)}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                                        {formattedStatus}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(bill.created_at).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    });
                                })()}
                            </TableBody>
                        </Table>
                        <DialogFooter>
                            <Button onClick={() => setIsBillHistoryDialogOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p>Are you sure you want to delete this loan? This action cannot be undone.</p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={confirmDeleteLoan}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDeleteSelectedDialogOpen} onOpenChange={setIsDeleteSelectedDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Delete Selected</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <p className="text-red-600 font-semibold">Warning! This action cannot be undone.</p>
                            {(() => {
                                const { activeLoans, totalAmount } = getDeleteWarningInfo(selectedLoans);
                                return (
                                    <div className="space-y-2">
                                        <p>You are about to delete:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li><span className="font-semibold">{selectedLoans.length}</span> total loans</li>
                                            {activeLoans > 0 && (
                                                <li className="text-red-600">
                                                    <span className="font-semibold">{activeLoans}</span> active loans
                                                </li>
                                            )}
                                            <li>Total loan amount: <span className="font-semibold">
                                                {formatAmount(totalAmount, appCurrency)}
                                            </span></li>
                                        </ul>
                                        {activeLoans > 0 && (
                                            <p className="text-red-600 text-sm">
                                                ⚠️ Warning: You are about to delete active loans. Make sure all payments are properly recorded before proceeding.
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteSelectedDialogOpen(false)}>Cancel</Button>
                            <Button 
                                variant="destructive" 
                                onClick={confirmDeleteSelectedLoans}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete {selectedLoans.length} Loans
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isCreateBillDialogOpen} onOpenChange={setIsCreateBillDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Bill</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="billDueDate" className="text-right">Due Date</Label>
                                <Input
                                    id="billDueDate"
                                    type="date"
                                    value={billDueDate}
                                    onChange={(e) => setBillDueDate(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            {currentLoan && (
                                <>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Remaining Balance</Label>
                                        <div className="col-span-3">
                                            {formatAmount(
                                                parseFloat(currentLoan.total_balance) - parseFloat(currentLoan.paid_amount),
                                                appCurrency
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Status</Label>
                                        <div className="col-span-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                currentLoan.status === 'active' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : currentLoan.status === 'defaulted'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {(currentLoan.status || 'active').charAt(0).toUpperCase() + (currentLoan.status || 'active').slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateBillDialogOpen(false)}>Cancel</Button>
                            <Button onClick={confirmCreateBill}>Create Bill</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
