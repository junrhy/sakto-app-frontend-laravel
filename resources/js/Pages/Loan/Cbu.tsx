import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { formatAmount } from '@/lib/utils';
import axios from 'axios';
import { FileDown } from 'lucide-react';
import { Checkbox } from '@/Components/ui/checkbox';

interface CbuFund {
    id: number;
    member_name: string;
    initial_contribution: string;
    current_balance: string;
    total_withdrawn: string;
    interest_earned: string;
    status: 'active' | 'inactive';
    last_contribution_date: string;
    date_joined: string;
    withdrawal_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    cbuFunds: CbuFund[];
    appCurrency: {
        symbol: string;
        code: string;
        name: string;
    };
}

export default function Cbu({ cbuFunds, appCurrency }: Props) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isContributionDialogOpen, setIsContributionDialogOpen] = useState(false);
    const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
    const [selectedFund, setSelectedFund] = useState<CbuFund | null>(null);
    const [selectedFunds, setSelectedFunds] = useState<number[]>([]);
    const [newFund, setNewFund] = useState({
        member_name: '',
        initial_contribution: '',
        payment_method: 'cash'
    });
    const [contribution, setContribution] = useState({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_number: ''
    });
    const [withdrawal, setWithdrawal] = useState({
        amount: '',
        withdrawal_date: new Date().toISOString().split('T')[0],
        reason: '',
        payment_method: 'cash',
        account_details: ''
    });

    const handleAddFund = () => {
        setNewFund({
            member_name: '',
            initial_contribution: '',
            payment_method: 'cash'
        });
        setIsAddDialogOpen(true);
    };

    const handleSaveFund = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('/loan/cbu', newFund);
            if (response.data) {
                setIsAddDialogOpen(false);
                window.location.reload();
            }
        } catch (error) {
            console.error('Error saving CBU fund:', error);
        }
    };

    const handleAddContribution = (fund: CbuFund) => {
        setSelectedFund(fund);
        setContribution({
            amount: '',
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'cash',
            reference_number: ''
        });
        setIsContributionDialogOpen(true);
    };

    const handleSaveContribution = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFund) return;

        try {
            const response = await axios.post(`/loan/cbu/${selectedFund.id}/contribution`, contribution);
            if (response.data) {
                setIsContributionDialogOpen(false);
                window.location.reload();
            }
        } catch (error) {
            console.error('Error saving contribution:', error);
        }
    };

    const handleWithdraw = (fund: CbuFund) => {
        setSelectedFund(fund);
        setWithdrawal({
            amount: '',
            withdrawal_date: new Date().toISOString().split('T')[0],
            reason: '',
            payment_method: 'cash',
            account_details: ''
        });
        setIsWithdrawDialogOpen(true);
    };

    const handleProcessWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFund) return;

        try {
            const response = await axios.post(`/loan/cbu/${selectedFund.id}/withdraw`, withdrawal);
            if (response.data) {
                setIsWithdrawDialogOpen(false);
                window.location.reload();
            }
        } catch (error) {
            console.error('Error processing withdrawal:', error);
        }
    };

    const handleToggleStatus = async (fund: CbuFund) => {
        try {
            const newStatus = fund.status === 'active' ? 'inactive' : 'active';
            const response = await axios.put(`/loan/cbu/${fund.id}`, {
                status: newStatus
            });
            if (response.data) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const toggleSelectAll = () => {
        if (selectedFunds.length === cbuFunds.length) {
            setSelectedFunds([]);
        } else {
            setSelectedFunds(cbuFunds.map(fund => fund.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedFunds.includes(id)) {
            setSelectedFunds(selectedFunds.filter(fundId => fundId !== id));
        } else {
            setSelectedFunds([...selectedFunds, id]);
        }
    };

    const exportToCSV = () => {
        const selectedData = cbuFunds.filter(fund => selectedFunds.includes(fund.id));
        const headers = [
            'Member Name',
            'Initial Contribution',
            'Current Balance',
            'Total Withdrawn',
            'Interest Earned',
            'Status',
            'Last Contribution Date',
            'Date Joined',
            'Withdrawals'
        ];
        const csvData = selectedData.map(fund => [
            fund.member_name,
            formatAmount(fund.initial_contribution, appCurrency),
            formatAmount(fund.current_balance, appCurrency),
            formatAmount(fund.total_withdrawn, appCurrency),
            formatAmount(fund.interest_earned, appCurrency),
            fund.status,
            new Date(fund.last_contribution_date).toLocaleDateString(),
            new Date(fund.date_joined).toLocaleDateString(),
            fund.withdrawal_count
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'cbu_funds.csv';
        link.click();
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Capital Build Up (CBU) Funds
                </h2>
            }
        >
            <Head title="CBU Funds" />

            <div className="p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>CBU Funds</CardTitle>
                                <CardDescription>Manage your Capital Build Up funds</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {selectedFunds.length > 0 && (
                                    <Button variant="outline" onClick={exportToCSV} className="flex items-center">
                                        <FileDown className="w-4 h-4 mr-2" />
                                        Export Selected
                                    </Button>
                                )}
                                <Button onClick={handleAddFund}>Add CBU Fund</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedFunds.length === cbuFunds.length}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Member Name</TableHead>
                                        <TableHead>Initial Contribution</TableHead>
                                        <TableHead>Current Balance</TableHead>
                                        <TableHead>Total Withdrawn</TableHead>
                                        <TableHead>Interest Earned</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Contribution</TableHead>
                                        <TableHead>Date Joined</TableHead>
                                        <TableHead>Withdrawals</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cbuFunds.map((fund) => (
                                        <TableRow key={fund.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedFunds.includes(fund.id)}
                                                    onCheckedChange={() => toggleSelect(fund.id)}
                                                />
                                            </TableCell>
                                            <TableCell>{fund.member_name}</TableCell>
                                            <TableCell>{formatAmount(fund.initial_contribution, appCurrency)}</TableCell>
                                            <TableCell>{formatAmount(fund.current_balance, appCurrency)}</TableCell>
                                            <TableCell>{formatAmount(fund.total_withdrawn, appCurrency)}</TableCell>
                                            <TableCell>{formatAmount(fund.interest_earned, appCurrency)}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    fund.status === 'active' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                }`}>
                                                    {fund.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>{new Date(fund.last_contribution_date).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(fund.date_joined).toLocaleDateString()}</TableCell>
                                            <TableCell>{fund.withdrawal_count}</TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAddContribution(fund)}
                                                    >
                                                        Add Contribution
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleWithdraw(fund)}
                                                    >
                                                        Withdraw
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(fund)}
                                                        className={fund.status === 'active' ? 'bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700' : 'bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700'}
                                                    >
                                                        {fund.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add CBU Fund Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add CBU Fund</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveFund}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="memberName" className="text-right">
                                    Member Name
                                </Label>
                                <Input
                                    id="memberName"
                                    className="col-span-3"
                                    value={newFund.member_name}
                                    onChange={(e) => setNewFund({ ...newFund, member_name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="initialContribution" className="text-right">
                                    Initial Contribution
                                </Label>
                                <Input
                                    id="initialContribution"
                                    type="number"
                                    className="col-span-3"
                                    value={newFund.initial_contribution}
                                    onChange={(e) => setNewFund({ ...newFund, initial_contribution: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="paymentMethod" className="text-right">
                                    Payment Method
                                </Label>
                                <Select
                                    value={newFund.payment_method}
                                    onValueChange={(value) => setNewFund({ ...newFund, payment_method: value as any })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="check">Check</SelectItem>
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

            {/* Add Contribution Dialog */}
            <Dialog open={isContributionDialogOpen} onOpenChange={setIsContributionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Contribution</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveContribution}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">
                                    Amount
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    className="col-span-3"
                                    value={contribution.amount}
                                    onChange={(e) => setContribution({ ...contribution, amount: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="paymentDate" className="text-right">
                                    Payment Date
                                </Label>
                                <Input
                                    id="paymentDate"
                                    type="date"
                                    className="col-span-3"
                                    value={contribution.payment_date}
                                    onChange={(e) => setContribution({ ...contribution, payment_date: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="paymentMethod" className="text-right">
                                    Payment Method
                                </Label>
                                <Select
                                    value={contribution.payment_method}
                                    onValueChange={(value) => setContribution({ ...contribution, payment_method: value as any })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="check">Check</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="referenceNumber" className="text-right">
                                    Reference Number
                                </Label>
                                <Input
                                    id="referenceNumber"
                                    className="col-span-3"
                                    value={contribution.reference_number}
                                    onChange={(e) => setContribution({ ...contribution, reference_number: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Withdraw Dialog */}
            <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Withdraw from CBU Fund</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleProcessWithdrawal}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="withdrawalAmount" className="text-right">
                                    Amount
                                </Label>
                                <Input
                                    id="withdrawalAmount"
                                    type="number"
                                    className="col-span-3"
                                    value={withdrawal.amount}
                                    onChange={(e) => setWithdrawal({ ...withdrawal, amount: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="withdrawalDate" className="text-right">
                                    Withdrawal Date
                                </Label>
                                <Input
                                    id="withdrawalDate"
                                    type="date"
                                    className="col-span-3"
                                    value={withdrawal.withdrawal_date}
                                    onChange={(e) => setWithdrawal({ ...withdrawal, withdrawal_date: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="reason" className="text-right">
                                    Reason
                                </Label>
                                <Input
                                    id="reason"
                                    className="col-span-3"
                                    value={withdrawal.reason}
                                    onChange={(e) => setWithdrawal({ ...withdrawal, reason: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="withdrawalPaymentMethod" className="text-right">
                                    Payment Method
                                </Label>
                                <Select
                                    value={withdrawal.payment_method}
                                    onValueChange={(value) => setWithdrawal({ ...withdrawal, payment_method: value as any })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="check">Check</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {withdrawal.payment_method === 'bank_transfer' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="accountDetails" className="text-right">
                                        Account Details
                                    </Label>
                                    <Input
                                        id="accountDetails"
                                        className="col-span-3"
                                        value={withdrawal.account_details}
                                        onChange={(e) => setWithdrawal({ ...withdrawal, account_details: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="submit">Process Withdrawal</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
} 