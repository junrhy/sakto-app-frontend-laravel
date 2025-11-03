import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    Calculator,
    Edit,
    FileText,
    History,
    Plus,
    Search,
    Trash,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { BillDetailsDialog } from './components/BillDetailsDialog';
import { BillHistoryDialog } from './components/BillHistoryDialog';
import { CreateBillDialog } from './components/CreateBillDialog';
import { DeleteLoanDialog } from './components/DeleteLoanDialog';
import { DeletePaymentDialog } from './components/DeletePaymentDialog';
import { DeleteSelectedLoansDialog } from './components/DeleteSelectedLoansDialog';
import { LoanFormDialog } from './components/LoanFormDialog';
import { PaymentDialog } from './components/PaymentDialog';
import { PaymentHistoryDialog } from './components/PaymentHistoryDialog';
import { INSTALLMENT_OPTIONS } from './constants';
import type {
    Bill,
    BillStatusUpdate,
    DeletePaymentInfo,
    DeleteWarningInfo,
    Loan,
    Payment,
} from './types';
import {
    calculateCreditScore,
    calculateInstallmentAmount,
    calculateLoanDetails,
    formatAmount,
} from './utils';

export default function Loan({
    auth,
    initialLoans,
    initialPayments,
    initialBills,
    appCurrency,
}: {
    auth: {
        user: any;
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
    initialLoans: Loan[];
    initialPayments: Payment[];
    initialBills: Bill[];
    appCurrency: any;
}) {
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - check their roles
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - only admin or manager can delete
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    const [loans, setLoans] = useState<Loan[]>(initialLoans);
    const [payments, setPayments] = useState<Payment[]>(initialPayments);
    const [bills, setBills] = useState<Bill[]>(() => {
        return (initialBills || []).filter((bill): bill is Bill => {
            return (
                bill != null &&
                typeof bill === 'object' &&
                'loan_id' in bill &&
                typeof bill.loan_id === 'number'
            );
        });
    });
    const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] =
        useState(false);
    const [isBillHistoryDialogOpen, setIsBillHistoryDialogOpen] =
        useState(false);
    const [currentLoan, setCurrentLoan] = useState<Loan | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [selectedLoans, setSelectedLoans] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [loanToDelete, setLoanToDelete] = useState<number | null>(null);
    const [isDeleteSelectedDialogOpen, setIsDeleteSelectedDialogOpen] =
        useState(false);
    const [paymentDate, setPaymentDate] = useState<string>(
        new Date().toISOString().split('T')[0],
    );
    const [isCreateBillDialogOpen, setIsCreateBillDialogOpen] = useState(false);
    const [billDueDate, setBillDueDate] = useState<string>(
        new Date().toISOString().split('T')[0],
    );
    const [paymentError, setPaymentError] = useState<string>('');
    const [dateError, setDateError] = useState<string>('');
    const [validationErrors, setValidationErrors] = useState({
        start_date: '',
        end_date: '',
        status: '',
        borrower_name: '',
        amount: '',
        interest_rate: '',
    });
    const [installmentAmount, setInstallmentAmount] = useState<string>('0');
    const [billFilter, setBillFilter] = useState<
        'all' | 'pending' | 'paid' | 'overdue'
    >('all');
    const [billNote, setBillNote] = useState<string>('');
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [isBillDetailsDialogOpen, setIsBillDetailsDialogOpen] =
        useState(false);
    const [billPrincipal, setBillPrincipal] = useState<string>('');
    const [billInterest, setBillInterest] = useState<string>('');
    const [billPenalty, setBillPenalty] = useState<string>('');
    const [billTotalAmount, setBillTotalAmount] = useState<string>('');
    const [billStatus, setBillStatus] = useState<'pending' | 'sent'>('pending');
    const [isDeletePaymentDialogOpen, setIsDeletePaymentDialogOpen] =
        useState(false);
    const [paymentToDelete, setPaymentToDelete] =
        useState<DeletePaymentInfo | null>(null);
    const [showCalculations, setShowCalculations] = useState(false);

    const handleAddLoan = () => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Default end date: 1 month from today (simple default, not frequency-based)
        const endDate = new Date(today);
        endDate.setMonth(today.getMonth() + 1);
        const endDateStr = endDate.toISOString().split('T')[0];

        setCurrentLoan({
            id: 0,
            borrower_name: '',
            amount: '',
            interest_rate: '',
            start_date: todayStr,
            end_date: endDateStr,
            status: 'active',
            interest_type: 'fixed',
            frequency: 'monthly',
            total_interest: '0',
            total_balance: '0',
            paid_amount: '0',
            client_identifier: '',
            created_at: '',
            updated_at: '',
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
                setLoans(loans.filter((loan) => loan.id !== loanToDelete));
                setSelectedLoans(
                    selectedLoans.filter((loanId) => loanId !== loanToDelete),
                );
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
            setLoans(loans.filter((loan) => !selectedLoans.includes(loan.id)));
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
            interest_rate: '',
        });
        setDateError('');

        // Validate required fields
        let hasErrors = false;
        const newErrors = {
            start_date: '',
            end_date: '',
            status: '',
            borrower_name: '',
            amount: '',
            interest_rate: '',
        };

        if (!currentLoan?.borrower_name?.trim()) {
            newErrors.borrower_name = 'Borrower name is required';
            hasErrors = true;
        }

        if (!currentLoan?.amount) {
            newErrors.amount = 'Amount is required';
            hasErrors = true;
        } else if (
            isNaN(parseFloat(currentLoan.amount)) ||
            parseFloat(currentLoan.amount) <= 0
        ) {
            newErrors.amount = 'Amount must be a positive number';
            hasErrors = true;
        }

        if (!currentLoan?.interest_rate) {
            newErrors.interest_rate = 'Interest rate is required';
            hasErrors = true;
        } else if (
            isNaN(parseFloat(currentLoan.interest_rate)) ||
            parseFloat(currentLoan.interest_rate) < 0
        ) {
            newErrors.interest_rate =
                'Interest rate must be a non-negative number';
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
                setDateError('End date cannot be earlier than start date');
                return;
            }

            try {
                let installmentData = {};
                if (currentLoan.installment_frequency) {
                    const amount = calculateInstallmentAmount(
                        parseFloat(
                            currentLoan.total_balance || currentLoan.amount,
                        ),
                        currentLoan.start_date,
                        currentLoan.end_date,
                        currentLoan.installment_frequency,
                    );
                    installmentData = {
                        installment_frequency:
                            currentLoan.installment_frequency,
                        installment_amount: amount.toFixed(2),
                    };
                }

                const loanData = {
                    ...currentLoan,
                    amount: parseFloat(currentLoan.amount).toString(),
                    interest_rate: parseFloat(
                        currentLoan.interest_rate,
                    ).toString(),
                    ...installmentData,
                };

                const response = await (currentLoan.id
                    ? axios.put(`/loan/${currentLoan.id}`, loanData)
                    : axios.post('/loan', loanData));

                const savedLoan = response.data;

                if (currentLoan.id) {
                    setLoans(
                        loans.map((loan) =>
                            loan.id === savedLoan.data.loan.id
                                ? savedLoan.data.loan
                                : loan,
                        ),
                    );
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
        setSelectedLoans((prev) =>
            prev.includes(id)
                ? prev.filter((loanId) => loanId !== id)
                : [...prev, id],
        );
    };

    const filteredLoans = useMemo(() => {
        return loans.filter(
            (loan) =>
                loan.borrower_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                false ||
                loan.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                false,
        );
    }, [loans, searchTerm]);

    const paginatedLoans = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredLoans.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredLoans, currentPage]);

    const pageCount = Math.ceil(filteredLoans.length / itemsPerPage);

    const handlePayment = (loan: Loan) => {
        setCurrentLoan(loan);
        setPaymentAmount('');
        setIsPaymentDialogOpen(true);
    };

    const confirmPayment = async () => {
        if (currentLoan && paymentAmount) {
            const remainingBalance =
                parseFloat(currentLoan.total_balance) -
                parseFloat(currentLoan.paid_amount);
            const paymentAmountFloat = parseFloat(paymentAmount);

            // Clear any previous error
            setPaymentError('');

            // Validate payment amount
            if (paymentAmountFloat > remainingBalance) {
                setPaymentError(
                    `Payment amount cannot exceed remaining balance of ${appCurrency.symbol}${remainingBalance.toFixed(2)}`,
                );
                return;
            }

            try {
                const response = await axios.post(
                    `/loan/${currentLoan.id}/payment`,
                    {
                        amount: paymentAmountFloat,
                        payment_date: paymentDate,
                    },
                );

                const newPayment = response.data.payment;

                setPayments((prevPayments) => [...prevPayments, newPayment]);

                setIsPaymentDialogOpen(false);
                setCurrentLoan(null);
                setPaymentAmount('');
                setPaymentError('');

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
        const selectedLoanDetails = loans.filter((loan) =>
            loanIds.includes(loan.id),
        );
        return {
            activeLoans: selectedLoanDetails.filter(
                (loan) => loan.status === 'active',
            ).length,
            totalAmount: selectedLoanDetails.reduce(
                (sum, loan) => sum + parseFloat(loan.amount),
                0,
            ),
        };
    };

    const handleCreateBill = (loan: Loan) => {
        setCurrentLoan(loan);
        setIsCreateBillDialogOpen(true);
    };

    const confirmCreateBill = async () => {
        if (currentLoan) {
            try {
                const baseAmount =
                    currentLoan.installment_amount ||
                    (
                        parseFloat(currentLoan.total_balance) -
                        parseFloat(currentLoan.paid_amount)
                    ).toString();

                const totalAmount = (
                    parseFloat(baseAmount) + parseFloat(billPenalty || '0')
                ).toString();

                const billData = {
                    due_date: billDueDate,
                    principal: currentLoan.amount,
                    interest: currentLoan.total_interest,
                    total_amount: baseAmount,
                    total_amount_due: totalAmount,
                    penalty_amount: billPenalty || '0',
                    note: billNote,
                    status: 'pending',
                    ...(currentLoan.installment_amount && {
                        installment_amount: currentLoan.installment_amount,
                    }),
                };

                const response = await axios.post(
                    `/loan/bill/${currentLoan.id}`,
                    billData,
                );
                const newBill = response.data.bill;

                // Make sure newBill has all required properties before adding to state
                if (newBill && newBill.id && newBill.loan_id) {
                    setBills((prevBills) => [...(prevBills || []), newBill]);
                } else {
                    console.error('Invalid bill data received:', newBill);
                }

                // Reset form
                setBillDueDate(new Date().toISOString().split('T')[0]);
                setBillPenalty('');
                setBillNote('');
                setIsCreateBillDialogOpen(false);
                setCurrentLoan(null);

                console.log('Bill created successfully');
            } catch (error) {
                console.error('Error creating bill:', error);
            }
        }
    };

    const handleDurationChange = (days: number | null) => {
        if (days === null || !currentLoan?.start_date) return;

        // Use the current start date (don't overwrite it)
        const startDate = new Date(currentLoan.start_date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days);

        setCurrentLoan({
            ...currentLoan,
            end_date: endDate.toISOString().split('T')[0],
        });
    };

    const handleBillStatusUpdate = async (
        billId: number,
        update: BillStatusUpdate,
    ) => {
        try {
            const response = await axios.patch(
                `/loan/bill/${billId}/status`,
                update,
            );

            const updatedBill = response.data.data.bill;
            console.log('Updated bill:', updatedBill);
            // Validate the updated bill before setting state
            if (!updatedBill || typeof updatedBill.loan_id !== 'number') {
                throw new Error('Invalid bill data received from server');
            }

            setBills((prevBills) => {
                if (!Array.isArray(prevBills)) return [];
                return prevBills
                    .map((bill) =>
                        bill && bill.id === billId ? updatedBill : bill,
                    )
                    .filter((bill): bill is Bill => bill != null);
            });

            setIsBillDetailsDialogOpen(false);
        } catch (error) {
            console.error('Error updating bill status:', error);
        }
    };

    const handleShowBillDetails = (bill: Bill) => {
        setSelectedBill(bill);
        setIsBillDetailsDialogOpen(true);
        setBillNote('');
    };

    // Update the bills filtering logic to handle undefined bills
    const filteredBills = useMemo(() => {
        // Early return if no current loan or bills is not an array
        if (!currentLoan?.id || !Array.isArray(bills)) {
            return [];
        }

        try {
            return bills
                .filter((bill): bill is Bill => {
                    if (!bill) return false;

                    // Check if bill has all required properties
                    const requiredProps = [
                        'id',
                        'loan_id',
                        'bill_number',
                        'due_date',
                        'principal',
                        'interest',
                        'total_amount',
                        'total_amount_due',
                        'penalty_amount',
                        'status',
                    ];

                    return (
                        requiredProps.every((prop) => prop in bill) &&
                        typeof bill.loan_id === 'number' &&
                        bill.loan_id === currentLoan.id
                    );
                })
                .filter(
                    (bill) =>
                        billFilter === 'all' || bill.status === billFilter,
                );
        } catch (error) {
            console.error('Error filtering bills:', error);
            return [];
        }
    }, [currentLoan?.id, bills, billFilter]); // Note: Only depend on currentLoan.id, not the entire object

    const handleDeleteBill = async (billId: number) => {
        try {
            await axios.delete(`/loan/bill/${billId}`);
            // Remove the deleted bill from state
            setBills((prevBills) =>
                prevBills.filter((bill) => bill.id !== billId),
            );
        } catch (error) {
            console.error('Error deleting bill:', error);
            // You might want to add error handling/notification here
        }
    };

    const handleDeletePayment = async (payment: Payment) => {
        setPaymentToDelete({
            id: payment.id,
            amount: payment.amount.toString(),
        });
        setIsDeletePaymentDialogOpen(true);
    };

    const confirmDeletePayment = async () => {
        if (paymentToDelete) {
            try {
                await axios.delete(
                    `/loan/${currentLoan?.id}/payment/${paymentToDelete.id}`,
                );
                setPayments(
                    payments.filter(
                        (payment) => payment.id !== paymentToDelete.id,
                    ),
                );
                setIsDeletePaymentDialogOpen(false);
                setPaymentToDelete(null);
            } catch (error) {
                console.error('Error deleting payment:', error);
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

            <div className="rounded-lg border border-gray-200 p-4 shadow-sm dark:border-gray-700">
                <Card>
                    <CardHeader>
                        <CardTitle>Loans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row">
                            <div className="flex flex-col gap-2 sm:flex-row">
                                {canEdit && (
                                    <Button
                                        onClick={handleAddLoan}
                                        className="w-full sm:w-auto"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add
                                        Loan
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button
                                        onClick={handleDeleteSelectedLoans}
                                        variant="destructive"
                                        disabled={selectedLoans.length === 0}
                                        className="w-full sm:w-auto"
                                    >
                                        <Trash className="mr-2 h-4 w-4" />{' '}
                                        Delete Selected
                                    </Button>
                                )}
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                                <Input
                                    placeholder="Search loans..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-8"
                                />
                            </div>
                        </div>
                        <div className="mb-4 flex items-center gap-2 px-1">
                            <Checkbox
                                checked={
                                    selectedLoans.length ===
                                        paginatedLoans.length &&
                                    paginatedLoans.length > 0
                                }
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedLoans(
                                            paginatedLoans.map(
                                                (loan) => loan.id,
                                            ),
                                        );
                                    } else {
                                        setSelectedLoans([]);
                                    }
                                }}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Select All ({paginatedLoans.length} loans)
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {paginatedLoans.map((loan) => {
                                const totalRemaining = (
                                    parseFloat(loan.total_balance) -
                                    parseFloat(loan.paid_amount)
                                ).toFixed(2);
                                const creditScore = calculateCreditScore(
                                    loan,
                                    payments,
                                );
                                const loanId = (() => {
                                    const date = new Date(loan.created_at);
                                    const month = String(
                                        date.getMonth() + 1,
                                    ).padStart(2, '0');
                                    const year = date
                                        .getFullYear()
                                        .toString()
                                        .slice(-2);
                                    const sequence = String(loan.id).padStart(
                                        4,
                                        '0',
                                    );
                                    return `${year}${month}-${sequence}`;
                                })();
                                const progressPercentage =
                                    (parseFloat(loan.paid_amount) /
                                        parseFloat(loan.total_balance)) *
                                    100;

                                const statusColors = {
                                    active: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
                                    paid: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
                                    defaulted:
                                        'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
                                };

                                return (
                                    <Card
                                        key={loan.id}
                                        className={`relative overflow-hidden border-2 transition-all hover:shadow-lg ${
                                            selectedLoans.includes(loan.id)
                                                ? 'border-blue-500 ring-2 ring-blue-300 dark:ring-blue-700'
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <CardContent className="p-6">
                                            {/* Header with Checkbox and Status */}
                                            <div className="mb-4 flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        checked={selectedLoans.includes(
                                                            loan.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleLoanSelection(
                                                                loan.id,
                                                            )
                                                        }
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            {loan.borrower_name}
                                                        </h3>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                ID: {loanId}
                                                            </span>
                                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                                BRW
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[loan.status]}`}
                                                >
                                                    {loan.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        loan.status.slice(1)}
                                                </span>
                                            </div>

                                            {/* Credit Score Badge */}
                                            <div className="mb-4 flex items-center gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Credit Score:
                                                    </span>
                                                    <span
                                                        className={`font-semibold ${creditScore.color}`}
                                                    >
                                                        {creditScore.score}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-xs ${creditScore.color} border-current`}
                                                >
                                                    {creditScore.label}
                                                </span>
                                            </div>

                                            {/* Loan Amount - Prominent Display */}
                                            <div className="mb-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20">
                                                <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                                                    Loan Amount
                                                </div>
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {formatAmount(
                                                        loan.amount,
                                                        appCurrency,
                                                    )}
                                                </div>
                                                <div className="mt-2 flex items-center gap-2 text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {parseFloat(
                                                            loan.interest_rate,
                                                        )}
                                                        %
                                                    </span>
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                                        {loan.interest_type ===
                                                        'fixed'
                                                            ? 'Fixed'
                                                            : 'Compounding'}
                                                    </span>
                                                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                                                        {loan.frequency
                                                            ? loan.frequency
                                                                  .charAt(0)
                                                                  .toUpperCase() +
                                                              loan.frequency.slice(
                                                                  1,
                                                              )
                                                            : 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Payment Progress */}
                                            <div className="mb-4">
                                                <div className="mb-2 flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        Payment Progress
                                                    </span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {progressPercentage.toFixed(
                                                            1,
                                                        )}
                                                        %
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                                                        style={{
                                                            width: `${Math.min(
                                                                progressPercentage,
                                                                100,
                                                            )}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Financial Summary */}
                                            <div className="mb-4 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        Total Balance
                                                    </span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {formatAmount(
                                                            loan.total_balance,
                                                            appCurrency,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-sm dark:border-gray-700">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        Paid Amount
                                                    </span>
                                                    <span className="font-medium text-green-600 dark:text-green-400">
                                                        {formatAmount(
                                                            loan.paid_amount,
                                                            appCurrency,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-sm font-semibold dark:border-gray-700">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        Outstanding
                                                    </span>
                                                    <span className="text-red-600 dark:text-red-400">
                                                        {formatAmount(
                                                            (
                                                                parseFloat(
                                                                    loan.total_balance,
                                                                ) -
                                                                parseFloat(
                                                                    loan.paid_amount,
                                                                )
                                                            ).toString(),
                                                            appCurrency,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Loan Duration */}
                                            <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                                                <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-800/50">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Start Date
                                                    </div>
                                                    <div className="mt-1 font-medium text-gray-900 dark:text-white">
                                                        {new Date(
                                                            loan.start_date,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-800/50">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        End Date
                                                    </div>
                                                    <div className="mt-1 font-medium text-gray-900 dark:text-white">
                                                        {new Date(
                                                            loan.end_date,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Installment Info */}
                                            {loan.installment_frequency &&
                                                loan.installment_amount && (
                                                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                                            Installment Payment
                                                        </div>
                                                        <div className="mt-1 flex items-center justify-between">
                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                {formatAmount(
                                                                    loan.installment_amount,
                                                                    appCurrency,
                                                                )}
                                                            </span>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                per{' '}
                                                                {loan.installment_frequency.replace(
                                                                    '-',
                                                                    ' ',
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                                                {(() => {
                                                                    const option =
                                                                        INSTALLMENT_OPTIONS.find(
                                                                            (
                                                                                opt,
                                                                            ) =>
                                                                                opt.value ===
                                                                                loan.installment_frequency,
                                                                        );
                                                                    if (!option)
                                                                        return null;
                                                                    const totalDays =
                                                                        Math.ceil(
                                                                            (new Date(
                                                                                loan.end_date,
                                                                            ).getTime() -
                                                                                new Date(
                                                                                    loan.start_date,
                                                                                ).getTime()) /
                                                                                (1000 *
                                                                                    60 *
                                                                                    60 *
                                                                                    24),
                                                                        );
                                                                    const numberOfInstallments =
                                                                        Math.ceil(
                                                                            totalDays /
                                                                                option.daysInterval,
                                                                        );
                                                                    return `${numberOfInstallments} installments`;
                                                                })()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Calculations Toggle */}
                                            <div className="mb-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setShowCalculations(
                                                            !showCalculations,
                                                        )
                                                    }
                                                    className="w-full text-xs"
                                                >
                                                    <Calculator className="mr-2 h-4 w-4" />
                                                    {showCalculations
                                                        ? 'Hide Calculations'
                                                        : 'Show Calculations'}
                                                </Button>
                                                {showCalculations && (
                                                    <div className="mt-2 space-y-1 rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            Calculation Details:
                                                        </div>
                                                        <div className="space-y-1 text-gray-600 dark:text-gray-400">
                                                            <div>
                                                                Principal:{' '}
                                                                {formatAmount(
                                                                    loan.amount,
                                                                    appCurrency,
                                                                )}
                                                            </div>
                                                            <div>
                                                                Interest Rate:{' '}
                                                                {
                                                                    loan.interest_rate
                                                                }
                                                                %{' '}
                                                                {loan.interest_type ===
                                                                'fixed'
                                                                    ? '(Fixed)'
                                                                    : '(Compounding)'}
                                                            </div>
                                                            <div>
                                                                Frequency:{' '}
                                                                {loan.frequency
                                                                    ? loan.frequency
                                                                          .charAt(
                                                                              0,
                                                                          )
                                                                          .toUpperCase() +
                                                                      loan.frequency.slice(
                                                                          1,
                                                                      )
                                                                    : 'Unknown'}
                                                            </div>
                                                            <div>
                                                                Duration:{' '}
                                                                {
                                                                    calculateLoanDetails(
                                                                        loan,
                                                                    ).days
                                                                }{' '}
                                                                days
                                                            </div>
                                                            <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                                                                <div className="font-medium text-gray-900 dark:text-white">
                                                                    Interest
                                                                    Calculation:
                                                                </div>
                                                                <div className="mt-1 font-mono text-gray-700 dark:text-gray-300">
                                                                    {
                                                                        calculateLoanDetails(
                                                                            loan,
                                                                        )
                                                                            .interestCalculation
                                                                    }
                                                                </div>
                                                                <div className="mt-2 whitespace-pre-line text-gray-600 dark:text-gray-400">
                                                                    {
                                                                        calculateLoanDetails(
                                                                            loan,
                                                                        )
                                                                            .calculationExplanation
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                                                {canEdit && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEditLoan(loan)
                                                        }
                                                        className="flex-1"
                                                    >
                                                        <Edit className="mr-1 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                )}
                                                {parseFloat(
                                                    loan.total_balance,
                                                ) -
                                                    parseFloat(
                                                        loan.paid_amount,
                                                    ) >
                                                    0 &&
                                                    canEdit && (
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() =>
                                                                handlePayment(
                                                                    loan,
                                                                )
                                                            }
                                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                                        >
                                                            Pay
                                                        </Button>
                                                    )}
                                                {canEdit && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-gray-900 bg-black text-white hover:bg-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                                                        onClick={() =>
                                                            handleCreateBill(
                                                                loan,
                                                            )
                                                        }
                                                    >
                                                        Bill
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleShowPaymentHistory(
                                                            loan,
                                                        )
                                                    }
                                                    className="flex-1"
                                                >
                                                    <History className="mr-1 h-4 w-4" />
                                                    Payments
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleShowBillHistory(
                                                            loan,
                                                        )
                                                    }
                                                    className="flex-1"
                                                >
                                                    <FileText className="mr-1 h-4 w-4" />
                                                    Bills
                                                </Button>
                                                {canDelete && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteLoan(
                                                                loan.id,
                                                            )
                                                        }
                                                        className="flex-1"
                                                    >
                                                        <Trash className="mr-1 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        {paginatedLoans.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No loans found. Create your first loan to
                                    get started.
                                </p>
                            </div>
                        )}
                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                Showing {(currentPage - 1) * itemsPerPage + 1}{' '}
                                to{' '}
                                {Math.min(
                                    currentPage * itemsPerPage,
                                    filteredLoans.length,
                                )}{' '}
                                of {filteredLoans.length} loans
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                {Array.from(
                                    { length: pageCount },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <Button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        variant={
                                            currentPage === page
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, pageCount),
                                        )
                                    }
                                    disabled={currentPage === pageCount}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <LoanFormDialog
                    open={isLoanDialogOpen}
                    onOpenChange={setIsLoanDialogOpen}
                    currentLoan={currentLoan}
                    validationErrors={validationErrors}
                    dateError={dateError}
                    installmentAmount={installmentAmount}
                    appCurrency={appCurrency}
                    onLoanChange={(loan) =>
                        setCurrentLoan({ ...currentLoan!, ...loan })
                    }
                    onValidationErrorChange={(errors) =>
                        setValidationErrors((prev) => ({ ...prev, ...errors }))
                    }
                    onDateErrorChange={setDateError}
                    onInstallmentAmountChange={setInstallmentAmount}
                    onDurationChange={handleDurationChange}
                    onSubmit={handleSaveLoan}
                />

                <PaymentDialog
                    open={isPaymentDialogOpen}
                    onOpenChange={setIsPaymentDialogOpen}
                    currentLoan={currentLoan}
                    paymentAmount={paymentAmount}
                    paymentDate={paymentDate}
                    paymentError={paymentError}
                    appCurrency={appCurrency}
                    onPaymentAmountChange={(value) => {
                        setPaymentAmount(value);
                        setPaymentError('');
                    }}
                    onPaymentDateChange={setPaymentDate}
                    onConfirm={confirmPayment}
                />

                <PaymentHistoryDialog
                    open={isPaymentHistoryDialogOpen}
                    onOpenChange={setIsPaymentHistoryDialogOpen}
                    currentLoan={currentLoan}
                    payments={payments}
                    appCurrency={appCurrency}
                    canDelete={canDelete}
                    onDeletePayment={handleDeletePayment}
                />

                <BillHistoryDialog
                    open={isBillHistoryDialogOpen}
                    onOpenChange={setIsBillHistoryDialogOpen}
                    currentLoan={currentLoan}
                    bills={bills}
                    billFilter={billFilter}
                    appCurrency={appCurrency}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onBillFilterChange={setBillFilter}
                    onShowBillDetails={handleShowBillDetails}
                    onBillStatusUpdate={handleBillStatusUpdate}
                    onDeleteBill={handleDeleteBill}
                />

                <BillDetailsDialog
                    open={isBillDetailsDialogOpen}
                    onOpenChange={setIsBillDetailsDialogOpen}
                    selectedBill={selectedBill}
                    billNote={billNote}
                    appCurrency={appCurrency}
                    canEdit={canEdit}
                    onBillNoteChange={setBillNote}
                    onStatusUpdate={handleBillStatusUpdate}
                />

                <DeleteLoanDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    onConfirm={confirmDeleteLoan}
                />

                <DeleteSelectedLoansDialog
                    open={isDeleteSelectedDialogOpen}
                    onOpenChange={setIsDeleteSelectedDialogOpen}
                    selectedLoans={selectedLoans}
                    deleteWarningInfo={getDeleteWarningInfo(selectedLoans)}
                    appCurrency={appCurrency}
                    onConfirm={confirmDeleteSelectedLoans}
                />

                <CreateBillDialog
                    open={isCreateBillDialogOpen}
                    onOpenChange={setIsCreateBillDialogOpen}
                    currentLoan={currentLoan}
                    billDueDate={billDueDate}
                    billPenalty={billPenalty}
                    billNote={billNote}
                    appCurrency={appCurrency}
                    canEdit={canEdit}
                    onDueDateChange={setBillDueDate}
                    onPenaltyChange={setBillPenalty}
                    onNoteChange={setBillNote}
                    onConfirm={confirmCreateBill}
                    onCancel={() => {
                        setIsCreateBillDialogOpen(false);
                        setBillPenalty('');
                        setBillDueDate(new Date().toISOString().split('T')[0]);
                    }}
                />

                <DeletePaymentDialog
                    open={isDeletePaymentDialogOpen}
                    onOpenChange={setIsDeletePaymentDialogOpen}
                    paymentToDelete={paymentToDelete}
                    appCurrency={appCurrency}
                    onConfirm={confirmDeletePayment}
                />
            </div>
        </AuthenticatedLayout>
    );
}
