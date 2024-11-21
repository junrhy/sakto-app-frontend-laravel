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
    total_interest: string;
    total_balance: string;
    paid_amount: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
    payments?: Payment[];
}

interface DeleteWarningInfo {
    activeLoans: number;
    totalAmount: number;
}

interface Bill {
    id: number;
    loan_id: number;
    due_date: string;
    principal_amount: number;
    interest_amount: number;
    total_amount: number;
    status: 'pending' | 'paid' | 'overdue';
}

export default function Loan({ initialLoans, initialPayments, appCurrency }: { initialLoans: Loan[], initialPayments: Payment[], appCurrency: any }) {
    console.log('Initial Payments:', initialPayments);
    console.log('Initial Loans:', initialLoans);
    const [loans, setLoans] = useState<Loan[]>(initialLoans);
    const [payments, setPayments] = useState<Payment[]>(initialPayments);
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
    const [bills, setBills] = useState<Bill[]>([]);

    const handleAddLoan = () => {
        setCurrentLoan(null);
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
        if (currentLoan) {
            // Clear any previous error
            setDateError("");

            // Validate dates
            const startDate = new Date(currentLoan.start_date);
            const endDate = new Date(currentLoan.end_date);

            if (endDate < startDate) {
                setDateError("End date cannot be earlier than start date");
                return;
            }

            try {
                const loanData = {
                    ...currentLoan,
                    amount: parseFloat(currentLoan.amount).toString(),
                    interest_rate: parseFloat(currentLoan.interest_rate).toString(),
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
                
                const { interestEarned } = calculateCompoundInterest(currentLoan);
                let newPaidAmount = parseFloat(currentLoan.paid_amount) + paymentAmountFloat;
                let newStatus = currentLoan.status;

                if (newPaidAmount >= parseFloat(interestEarned)) {
                    newPaidAmount = parseFloat(interestEarned);
                    newStatus = 'paid';
                }

                const updatedLoan = {
                    ...currentLoan,
                    paid_amount: newPaidAmount.toString(),
                    status: newStatus,
                    payments: [...(currentLoan.payments || []), newPayment]
                };

                setLoans(loans.map(loan => 
                    loan.id === currentLoan.id ? updatedLoan : loan
                ));
                
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
            const response = await axios.get(`/loan/${loan.id}/bills`);
            setBills(response.data.bills);
            setCurrentLoan(loan);
            setIsBillHistoryDialogOpen(true);
        } catch (error) {
            console.error('Error fetching bills:', error);
        }
    };

    const calculateCompoundInterest = (loan: Loan) => {
        const principal = parseFloat(loan.amount);
        const rate = parseFloat(loan.interest_rate) / 100;
        const startDate = new Date(loan.start_date);
        const endDate = new Date(loan.end_date);
        const timeInYears = (endDate.getTime() - startDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
        
        let n: number;
        switch (loan.compounding_frequency) {
            case 'daily':
                n = 365;
                break;
            case 'monthly':
                n = 12;
                break;
            case 'quarterly':
                n = 4;
                break;
            case 'annually':
                n = 1;
                break;
            default:
                n = 12; // Default to monthly
        }

        const interest = parseFloat(loan.amount) * parseFloat(loan.interest_rate) / 100;

        return {
            interestEarned: interest.toFixed(2)
        };
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
                const response = await axios.post(`/loan/${currentLoan.id}/bill`, {
                    due_date: billDueDate,
                });

                // Fetch updated bills
                const billsResponse = await axios.get(`/loan/${currentLoan.id}/bills`);
                setBills(billsResponse.data.bills);

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
                    <div className="flex justify-between mb-4">
                        <div className="flex items-center space-x-2">
                        <Button onClick={handleAddLoan}>
                            <Plus className="mr-2 h-4 w-4" /> Add Loan
                        </Button>
                        <Button 
                            onClick={handleDeleteSelectedLoans} 
                            variant="destructive" 
                            disabled={selectedLoans.length === 0}
                        >
                            <Trash className="mr-2 h-4 w-4" /> Delete Selected
                        </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search loans..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
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
                                <TableHead>Payment Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedLoans.map((loan) => {
                                const { interestEarned } = calculateCompoundInterest(loan);
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
                                            <div className="space-y-1">
                                                <p className="font-medium">{loan.borrower_name}</p>
                                                <p className="text-sm text-gray-500">ID: {loan.client_identifier}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium">{appCurrency.symbol}{parseFloat(loan.amount).toFixed(2)}</p>
                                                <p className="text-sm text-gray-500">{parseFloat(loan.interest_rate)}% ({loan.compounding_frequency})</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="text-sm">Start: {new Date(loan.start_date).toLocaleDateString()}</p>
                                                <p className="text-sm">End: {new Date(loan.end_date).toLocaleDateString()}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>Total Balance:</span>
                                                    <span className="font-medium">{appCurrency.symbol}{parseFloat(loan.total_balance).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Interest:</span>
                                                    <span className="font-medium">{appCurrency.symbol}{interestEarned}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        loan.status === 'active' ? 'bg-green-500' :
                                                        loan.status === 'paid' ? 'bg-blue-500' :
                                                        'bg-red-500'
                                                    }`} />
                                                    <span className="capitalize text-sm">{loan.status}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Paid:</span>
                                                        <span className="text-green-600">{appCurrency.symbol}{parseFloat(loan.paid_amount).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span>Remaining:</span>
                                                        <span className="text-red-600">{appCurrency.symbol}{totalRemaining}</span>
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
                                                    className="bg-gray-100 hover:bg-gray-200"
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
                            <Label htmlFor="borrowerName" className="text-right">Borrower Name</Label>
                            <Input
                            id="borrowerName"
                            value={currentLoan?.borrower_name || ''}
                            onChange={(e) => setCurrentLoan({ ...currentLoan!, borrower_name: e.target.value })}
                            className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">Amount</Label>
                            <Input
                            id="amount"
                            type="number"
                            value={currentLoan?.amount || ''}
                            onChange={(e) => setCurrentLoan({ ...currentLoan!, amount: e.target.value })}
                            className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="interestRate" className="text-right">Interest Rate</Label>
                            <Input
                            id="interestRate"
                            type="number"
                            step="0.1"
                            value={currentLoan?.interest_rate || ''}
                            onChange={(e) => setCurrentLoan({ ...currentLoan!, interest_rate: e.target.value })}
                            className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startDate" className="text-right">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={currentLoan?.start_date || ''}
                                onChange={(e) => {
                                    setDateError("");
                                    setCurrentLoan({ ...currentLoan!, start_date: e.target.value });
                                }}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endDate" className="text-right">End Date</Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={currentLoan?.end_date || ''}
                                    onChange={(e) => {
                                        setDateError("");
                                        setCurrentLoan({ ...currentLoan!, end_date: e.target.value });
                                    }}
                                    className={dateError ? "border-red-500" : ""}
                                />
                                {dateError && (
                                    <p className="text-sm text-red-500">{dateError}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="compoundingFrequency" className="text-right">Compounding Frequency</Label>
                            <Select
                            value={currentLoan?.compounding_frequency || ''}
                            onValueChange={(value: 'daily' | 'monthly' | 'quarterly' | 'annually') => setCurrentLoan({ ...currentLoan!, compounding_frequency: value })}
                            >
                            <SelectTrigger className="col-span-3">
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
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <Select
                            value={currentLoan?.status || ''}
                            onValueChange={(value: 'active' | 'paid' | 'defaulted') => setCurrentLoan({ ...currentLoan!, status: value })}
                            >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="defaulted">Defaulted</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
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
                                    {appCurrency.symbol}
                                    {(parseFloat(currentLoan.total_balance) - parseFloat(currentLoan.paid_amount)).toFixed(2)}
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
                                                    {appCurrency.symbol}
                                                    {payment.amount}
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bills.length > 0 ? (
                                    bills.map((bill) => (
                                        <TableRow key={bill.id}>
                                            <TableCell>
                                                {new Date(bill.due_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {appCurrency.symbol}{bill.principal_amount.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                {appCurrency.symbol}{bill.interest_amount.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                {appCurrency.symbol}{bill.total_amount.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    bill.status === 'paid' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : bill.status === 'overdue'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4">
                                            No bills found for this loan
                                        </TableCell>
                                    </TableRow>
                                )}
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
                                                {appCurrency.symbol}{totalAmount.toFixed(2)}
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
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Loan Amount</Label>
                                    <div className="col-span-3">
                                        {appCurrency.symbol}{parseFloat(currentLoan.amount).toFixed(2)}
                                    </div>
                                </div>
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
