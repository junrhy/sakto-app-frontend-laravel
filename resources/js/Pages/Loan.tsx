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
import { Plus, Edit, Trash, Search, Calculator, DollarSign, History } from "lucide-react";
import { Checkbox } from "@/Components/ui/checkbox";

interface Payment {
    id: number;
    date: string;
    amount: number;
}

interface Loan {
    id: number;
    borrowerName: string;
    amount: number;
    interestRate: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'paid' | 'defaulted';
    compoundingFrequency: 'daily' | 'monthly' | 'quarterly' | 'annually';
    paidAmount: number;
    payments: Payment[];
    overpaymentBalance: number;
}

const INITIAL_LOANS: Loan[] = [
    { id: 1, borrowerName: "John Doe", amount: 5000, interestRate: 5, startDate: "2023-01-01", endDate: "2023-12-31", status: 'active', compoundingFrequency: 'monthly', paidAmount: 0, payments: [], overpaymentBalance: 0 },
    { id: 2, borrowerName: "Jane Smith", amount: 10000, interestRate: 4.5, startDate: "2023-02-15", endDate: "2024-02-14", status: 'active', compoundingFrequency: 'quarterly', paidAmount: 2000, payments: [{ id: 1, date: "2023-03-15", amount: 2000 }], overpaymentBalance: 0 },
    { id: 3, borrowerName: "Bob Johnson", amount: 7500, interestRate: 6, startDate: "2022-11-01", endDate: "2023-10-31", status: 'paid', compoundingFrequency: 'annually', paidAmount: 7500, payments: [{ id: 1, date: "2023-05-01", amount: 7500 }], overpaymentBalance: 0 },
];

export default function Loan() {
    const [loans, setLoans] = useState<Loan[]>(INITIAL_LOANS);
    const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] = useState(false);
    const [currentLoan, setCurrentLoan] = useState<Loan | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [selectedLoans, setSelectedLoans] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleAddLoan = () => {
        setCurrentLoan(null);
        setIsLoanDialogOpen(true);
    };

    const handleEditLoan = (loan: Loan) => {
        setCurrentLoan(loan);
        setIsLoanDialogOpen(true);
    };

    const handleDeleteLoan = (id: number) => {
        setLoans(loans.filter(loan => loan.id !== id));
        setSelectedLoans(selectedLoans.filter(loanId => loanId !== id));
    };

    const handleDeleteSelectedLoans = () => {
        setLoans(loans.filter(loan => !selectedLoans.includes(loan.id)));
        setSelectedLoans([]);
    };

    const handleSaveLoan = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentLoan) {
        if (currentLoan.id) {
            // Edit existing loan
            setLoans(loans.map(loan => 
            loan.id === currentLoan.id ? currentLoan : loan
            ));
        } else {
            // Add new loan
            setLoans([...loans, { ...currentLoan, id: Date.now() }]);
        }
        }
        setIsLoanDialogOpen(false);
        setCurrentLoan(null);
    };

    const toggleLoanSelection = (id: number) => {
        setSelectedLoans(prev =>
        prev.includes(id) ? prev.filter(loanId => loanId !== id) : [...prev, id]
        );
    };

    const filteredLoans = useMemo(() => {
        return loans.filter(loan =>
        loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.status.toLowerCase().includes(searchTerm.toLowerCase())
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

    const confirmPayment = () => {
        if (currentLoan && paymentAmount) {
        const payment = parseFloat(paymentAmount);
        const { totalAmount } = calculateCompoundInterest(currentLoan);
        const remainingAmount = parseFloat(totalAmount) - currentLoan.paidAmount;
        let newPaidAmount = currentLoan.paidAmount + payment;
        let newOverpaymentBalance = currentLoan.overpaymentBalance;
        let newStatus = currentLoan.status;

        if (newPaidAmount > parseFloat(totalAmount)) {
            newOverpaymentBalance = newPaidAmount - parseFloat(totalAmount);
            newPaidAmount = parseFloat(totalAmount);
            newStatus = 'paid';
        } else if (newPaidAmount === parseFloat(totalAmount)) {
            newStatus = 'paid';
        }

        const updatedLoan = {
            ...currentLoan,
            paidAmount: newPaidAmount,
            overpaymentBalance: newOverpaymentBalance,
            status: newStatus,
            payments: [...currentLoan.payments, { id: Date.now(), date: new Date().toISOString().split('T')[0], amount: payment }]
        };

        setLoans(loans.map(loan => 
            loan.id === currentLoan.id ? updatedLoan : loan
        ));
        setIsPaymentDialogOpen(false);
        setCurrentLoan(null);
        setPaymentAmount("");
        }
    };

    const handleShowPaymentHistory = (loan: Loan) => {
        setCurrentLoan(loan);
        setIsPaymentHistoryDialogOpen(true);
    };

    const calculateCompoundInterest = (loan: Loan) => {
        const principal = loan.amount;
        const rate = loan.interestRate / 100;
        const startDate = new Date(loan.startDate);
        const endDate = new Date(loan.endDate);
        const timeInYears = (endDate.getTime() - startDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
        
        let n: number;
        switch (loan.compoundingFrequency) {
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

        const amount = principal * Math.pow((1 + rate / n), n * timeInYears);
        const interest = amount - principal;

        return {
        totalAmount: amount.toFixed(2),
        interestEarned: interest.toFixed(2)
        };
    };

    const getRemainingAmount = (loan: Loan) => {
        const { totalAmount } = calculateCompoundInterest(loan);
        const remaining = parseFloat(totalAmount) - loan.paidAmount;
        return remaining > 0 ? remaining.toFixed(2) : '0.00';
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

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
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
                                        <TableHead>Borrower Name</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Interest Rate</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Compounding</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Total Amount</TableHead>
                                        <TableHead>Paid Amount</TableHead>
                                        <TableHead>Remaining</TableHead>
                                        <TableHead>Overpayment</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {paginatedLoans.map((loan) => {
                                        const { totalAmount } = calculateCompoundInterest(loan);
                                        return (
                                        <TableRow key={loan.id}>
                                            <TableCell>
                                            <Checkbox
                                                checked={selectedLoans.includes(loan.id)}
                                                onCheckedChange={() => toggleLoanSelection(loan.id)}
                                            />
                                            </TableCell>
                                            <TableCell>{loan.borrowerName}</TableCell>
                                            <TableCell>${loan.amount.toFixed(2)}</TableCell>
                                            <TableCell>{loan.interestRate}%</TableCell>
                                            <TableCell>{loan.startDate}</TableCell>
                                            <TableCell>{loan.endDate}</TableCell>
                                            <TableCell>{loan.compoundingFrequency}</TableCell>
                                            <TableCell>{loan.status}</TableCell>
                                            <TableCell>${totalAmount}</TableCell>
                                            <TableCell>${loan.paidAmount.toFixed(2)}</TableCell>
                                            <TableCell>${getRemainingAmount(loan)}</TableCell>
                                            <TableCell>${loan.overpaymentBalance.toFixed(2)}</TableCell>
                                            <TableCell className="flex">
                                            <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditLoan(loan)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="sm" className="mr-2" onClick={() => handleDeleteLoan(loan.id)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                            {loan.status === 'active' && (
                                                <Button variant="default" size="sm" className="mr-2" onClick={() => handlePayment(loan)}>
                                                <DollarSign className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm" onClick={() => handleShowPaymentHistory(loan)}>
                                                <History className="h-4 w-4" />
                                            </Button>
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
                                        value={currentLoan?.borrowerName || ''}
                                        onChange={(e) => setCurrentLoan({ ...currentLoan!, borrowerName: e.target.value })}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="amount" className="text-right">Amount</Label>
                                        <Input
                                        id="amount"
                                        type="number"
                                        value={currentLoan?.amount || ''}
                                        onChange={(e) => setCurrentLoan({ ...currentLoan!, amount: parseFloat(e.target.value) })}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="interestRate" className="text-right">Interest Rate</Label>
                                        <Input
                                        id="interestRate"
                                        type="number"
                                        step="0.1"
                                        value={currentLoan?.interestRate || ''}
                                        onChange={(e) => setCurrentLoan({ ...currentLoan!, interestRate: parseFloat(e.target.value) })}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="startDate" className="text-right">Start Date</Label>
                                        <Input
                                        id="startDate"
                                        type="date"
                                        value={currentLoan?.startDate || ''}
                                        onChange={(e) => setCurrentLoan({ ...currentLoan!, startDate: e.target.value })}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="endDate" className="text-right">End Date</Label>
                                        <Input
                                        id="endDate"
                                        type="date"
                                        value={currentLoan?.endDate || ''}
                                        onChange={(e) => setCurrentLoan({ ...currentLoan!, endDate: e.target.value })}
                                        className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="compoundingFrequency" className="text-right">Compounding Frequency</Label>
                                        <Select
                                        value={currentLoan?.compoundingFrequency || ''}
                                        onValueChange={(value: 'daily' | 'monthly' | 'quarterly' | 'annually') => setCurrentLoan({ ...currentLoan!, compoundingFrequency: value })}
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
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="col-span-3"
                                    />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={confirmPayment}>Confirm Payment</Button>
                                </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isPaymentHistoryDialogOpen} onOpenChange={setIsPaymentHistoryDialogOpen}>
                                <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Payment History</DialogTitle>
                                </DialogHeader>
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {currentLoan?.payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                        <TableCell>{payment.date}</TableCell>
                                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                                <DialogFooter>
                                    <Button onClick={() => setIsPaymentHistoryDialogOpen(false)}>Close</Button>
                                </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
