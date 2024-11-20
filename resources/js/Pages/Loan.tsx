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
import axios from 'axios';

interface Payment {
    id: number;
    date: string;
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
    total_amount: string;
    paid_amount: string;
    remaining_amount: string;
    overpayment_balance: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
    payments?: Payment[];
}

export default function Loan({ initialLoans }: { initialLoans: Loan[] }) {
    const [loans, setLoans] = useState<Loan[]>(initialLoans);
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

    const handleDeleteLoan = async (id: number) => {
        try {
            await axios.delete(`/loan/${id}`);
            setLoans(loans.filter(loan => loan.id !== id));
            setSelectedLoans(selectedLoans.filter(loanId => loanId !== id));
        } catch (error) {
            console.error('Error deleting loan:', error);
            // Add error handling here
        }
    };

    const handleDeleteSelectedLoans = async () => {
        try {
            await axios.post('/loan/bulk-delete', { ids: selectedLoans });
            setLoans(loans.filter(loan => !selectedLoans.includes(loan.id)));
            setSelectedLoans([]);
        } catch (error) {
            console.error('Error deleting selected loans:', error);
            // Add error handling here
        }
    };

    const handleSaveLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentLoan) {
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
                        loan.id === savedLoan.id ? savedLoan : loan
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
        loan.borrower_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    const confirmPayment = async () => {
        if (currentLoan && paymentAmount) {
            try {
                const response = await axios.post(`/loan/${currentLoan.id}/payment`, {
                    amount: parseFloat(paymentAmount)
                });

                const payment = response.data.payment;
                const { totalAmount } = calculateCompoundInterest(currentLoan);
                let newPaidAmount = parseFloat(currentLoan.paid_amount) + payment.amount;
                let newOverpaymentBalance = parseFloat(currentLoan.overpayment_balance);
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
                    paid_amount: newPaidAmount.toString(),
                    overpayment_balance: newOverpaymentBalance.toString(),
                    status: newStatus,
                    payments: [...(currentLoan.payments || []), payment]
                };

                setLoans(loans.map(loan => 
                    loan.id === currentLoan.id ? updatedLoan : loan
                ));
                
                setIsPaymentDialogOpen(false);
                setCurrentLoan(null);
                setPaymentAmount("");
            } catch (error) {
                console.error('Error recording payment:', error);
                // Add error handling here
            }
        }
    };

    const handleShowPaymentHistory = (loan: Loan) => {
        setCurrentLoan(loan);
        setIsPaymentHistoryDialogOpen(true);
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

        const amount = principal * Math.pow((1 + rate / n), n * timeInYears);
        const interest = amount - principal;

        return {
            totalAmount: amount.toFixed(2),
            interestEarned: interest.toFixed(2)
        };
    };

    const getRemainingAmount = (loan: Loan) => {
        const { totalAmount } = calculateCompoundInterest(loan);
        const remaining = parseFloat(totalAmount) - parseFloat(loan.paid_amount);
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
                                <TableCell>{loan.borrower_name}</TableCell>
                                <TableCell>${parseFloat(loan.amount).toFixed(2)}</TableCell>
                                <TableCell>{parseFloat(loan.interest_rate)}%</TableCell>
                                <TableCell>{loan.start_date}</TableCell>
                                <TableCell>{loan.end_date}</TableCell>
                                <TableCell>{loan.compounding_frequency}</TableCell>
                                <TableCell>{loan.status}</TableCell>
                                <TableCell>${parseFloat(loan.total_amount).toFixed(2)}</TableCell>
                                <TableCell>${parseFloat(loan.paid_amount).toFixed(2)}</TableCell>
                                <TableCell>${parseFloat(loan.remaining_amount).toFixed(2)}</TableCell>
                                <TableCell>${parseFloat(loan.overpayment_balance).toFixed(2)}</TableCell>
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
                            onChange={(e) => setCurrentLoan({ ...currentLoan!, start_date: e.target.value })}
                            className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endDate" className="text-right">End Date</Label>
                            <Input
                            id="endDate"
                            type="date"
                            value={currentLoan?.end_date || ''}
                            onChange={(e) => setCurrentLoan({ ...currentLoan!, end_date: e.target.value })}
                            className="col-span-3"
                            />
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
                        {currentLoan?.payments?.map((payment) => (
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
        </AuthenticatedLayout>
    );
}
