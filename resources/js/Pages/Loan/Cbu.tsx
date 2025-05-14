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
import { FileDown, MoreHorizontal, Search, Trash2 } from 'lucide-react';
import { Checkbox } from '@/Components/ui/checkbox';

interface CbuFund {
    id: number;
    name: string;
    description: string | null;
    target_amount: string;
    start_date: string;
    end_date: string | null;
    total_amount: string;
    created_at: string;
    updated_at: string;
}

interface CbuContribution {
    id: number;
    cbu_fund_id: number;
    amount: string;
    contribution_date: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

interface CbuWithdrawal {
    id: number;
    cbu_fund_id: number;
    action: string;
    amount: string;
    notes: string | null;
    date: string;
    client_identifier: string;
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
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewContributionsDialogOpen, setIsViewContributionsDialogOpen] = useState(false);
    const [isViewWithdrawalsDialogOpen, setIsViewWithdrawalsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedFund, setSelectedFund] = useState<CbuFund | null>(null);
    const [selectedFunds, setSelectedFunds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [contributions, setContributions] = useState<CbuContribution[]>([]);
    const [withdrawals, setWithdrawals] = useState<CbuWithdrawal[]>([]);
    const [isLoadingContributions, setIsLoadingContributions] = useState(false);
    const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(false);
    const [newFund, setNewFund] = useState({
        name: '',
        description: '',
        target_amount: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
    });
    const [contribution, setContribution] = useState({
        cbu_fund_id: '',
        amount: '',
        contribution_date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [withdrawal, setWithdrawal] = useState({
        cbu_fund_id: '',
        amount: '',
        withdrawal_date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [editingFund, setEditingFund] = useState<CbuFund | null>(null);
    const [fundToDelete, setFundToDelete] = useState<CbuFund | null>(null);

    const handleAddFund = () => {
        setNewFund({
            name: '',
            description: '',
            target_amount: '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: ''
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
            cbu_fund_id: fund.id.toString(),
            amount: '',
            contribution_date: new Date().toISOString().split('T')[0],
            notes: ''
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
            cbu_fund_id: fund.id.toString(),
            amount: '',
            withdrawal_date: new Date().toISOString().split('T')[0],
            notes: ''
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

    const handleUpdateFund = (fund: CbuFund) => {
        setEditingFund(fund);
        setIsEditDialogOpen(true);
    };

    const handleViewContributions = async (fund: CbuFund) => {
        setSelectedFund(fund);
        setIsLoadingContributions(true);
        try {
            const response = await axios.get(`/loan/cbu/${fund.id}/contributions`);
            if (response.data) {
                setContributions(response.data.data.cbu_contributions);
                setIsViewContributionsDialogOpen(true);
            }
        } catch (error) {
            console.error('Error fetching contributions:', error);
        } finally {
            setIsLoadingContributions(false);
        }
    };

    const handleViewWithdrawals = async (fund: CbuFund) => {
        setSelectedFund(fund);
        setIsLoadingWithdrawals(true);
        try {
            const response = await axios.get(`/loan/cbu/${fund.id}/withdrawals`);
            if (response.data) {
                setWithdrawals(response.data.data.cbu_withdrawals);
                setIsViewWithdrawalsDialogOpen(true);
            }
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
        } finally {
            setIsLoadingWithdrawals(false);
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFund) return;

        try {
            const response = await axios.put(`/loan/cbu/${editingFund.id}`, {
                name: editingFund.name,
                description: editingFund.description,
                target_amount: editingFund.target_amount,
                start_date: editingFund.start_date,
                end_date: editingFund.end_date
            });
            if (response.data) {
                setIsEditDialogOpen(false);
                window.location.reload();
            }
        } catch (error) {
            console.error('Error updating fund:', error);
        }
    };

    const handleDeleteFund = async () => {
        if (!fundToDelete) return;

        try {
            await axios.delete(`/loan/cbu/${fundToDelete.id}`);
            setIsDeleteDialogOpen(false);
            window.location.reload();
        } catch (error) {
            console.error('Error deleting fund:', error);
        }
    };

    const confirmDelete = (fund: CbuFund) => {
        setFundToDelete(fund);
        setIsDeleteDialogOpen(true);
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
            'Name',
            'Description',
            'Target Amount',
            'Total Amount',
            'Start Date',
            'End Date',
            'Created At',
            'Updated At'
        ];
        const csvData = selectedData.map(fund => [
            fund.name || '',
            fund.description || '',
            fund.target_amount ? formatAmount(fund.target_amount, appCurrency) : '',
            fund.total_amount ? formatAmount(fund.total_amount, appCurrency) : '',
            fund.start_date ? new Date(fund.start_date).toLocaleDateString() : '',
            fund.end_date ? new Date(fund.end_date).toLocaleDateString() : '',
            fund.created_at ? new Date(fund.created_at).toLocaleDateString() : '',
            fund.updated_at ? new Date(fund.updated_at).toLocaleDateString() : ''
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

    const filteredFunds = cbuFunds.filter(fund => 
        fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fund.description && fund.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Capital Build Up Funds
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
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedFunds.length === filteredFunds.length}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Target Amount</TableHead>
                                        <TableHead>Total Amount</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFunds.map((fund) => (
                                        <TableRow key={fund.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedFunds.includes(fund.id)}
                                                    onCheckedChange={() => toggleSelect(fund.id)}
                                                />
                                            </TableCell>
                                            <TableCell>{fund.name}</TableCell>
                                            <TableCell>{fund.description || '-'}</TableCell>
                                            <TableCell>{fund.target_amount ? formatAmount(fund.target_amount, appCurrency) : '-'}</TableCell>
                                            <TableCell>{fund.total_amount ? formatAmount(fund.total_amount, appCurrency) : '-'}</TableCell>
                                            <TableCell>{fund.start_date ? new Date(fund.start_date).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell>{fund.end_date ? new Date(fund.end_date).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell>
                                                <Select onValueChange={(value) => {
                                                    switch (value) {
                                                        case 'view_contributions':
                                                            handleViewContributions(fund);
                                                            break;
                                                        case 'view_withdrawals':
                                                            handleViewWithdrawals(fund);
                                                            break;
                                                        case 'add_contribution':
                                                            handleAddContribution(fund);
                                                            break;
                                                        case 'withdraw':
                                                            handleWithdraw(fund);
                                                            break;
                                                        case 'edit':
                                                            handleUpdateFund(fund);
                                                            break;
                                                        case 'delete':
                                                            confirmDelete(fund);
                                                            break;
                                                    }
                                                }}>
                                                    <SelectTrigger className="w-[180px]">
                                                        <div className="flex items-center gap-2">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span>Actions</span>
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="view_contributions">View Contributions</SelectItem>
                                                        <SelectItem value="view_withdrawals">View Withdrawals</SelectItem>
                                                        <SelectItem value="add_contribution">Add Contribution</SelectItem>
                                                        <SelectItem value="withdraw">Withdraw</SelectItem>
                                                        <SelectItem value="edit">Edit Fund</SelectItem>
                                                        <SelectItem value="delete" className="text-red-600">
                                                            <div className="flex items-center gap-2">
                                                                <Trash2 className="h-4 w-4" />
                                                                <span>Delete Fund</span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Fund Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New CBU Fund</DialogTitle>
                        <DialogDescription>Create a new Capital Build Up fund</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveFund}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newFund.name}
                                    onChange={(e) => setNewFund({ ...newFund, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={newFund.description}
                                    onChange={(e) => setNewFund({ ...newFund, description: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="target_amount">Target Amount</Label>
                                <Input
                                    id="target_amount"
                                    type="number"
                                    value={newFund.target_amount}
                                    onChange={(e) => setNewFund({ ...newFund, target_amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={newFund.start_date}
                                    onChange={(e) => setNewFund({ ...newFund, start_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">End Date (Optional)</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={newFund.end_date}
                                    onChange={(e) => setNewFund({ ...newFund, end_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Fund</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Contribution Dialog */}
            <Dialog open={isContributionDialogOpen} onOpenChange={setIsContributionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Contribution</DialogTitle>
                        <DialogDescription>Add a new contribution to the CBU fund</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveContribution}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={contribution.amount}
                                    onChange={(e) => setContribution({ ...contribution, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contribution_date">Contribution Date</Label>
                                <Input
                                    id="contribution_date"
                                    type="date"
                                    value={contribution.contribution_date}
                                    onChange={(e) => setContribution({ ...contribution, contribution_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={contribution.notes}
                                    onChange={(e) => setContribution({ ...contribution, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Contribution</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Withdraw Dialog */}
            <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Process Withdrawal</DialogTitle>
                        <DialogDescription>Process a withdrawal from the CBU fund</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleProcessWithdrawal}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="withdrawal_amount">Amount</Label>
                                <Input
                                    id="withdrawal_amount"
                                    type="number"
                                    value={withdrawal.amount}
                                    onChange={(e) => setWithdrawal({ ...withdrawal, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="withdrawal_date">Withdrawal Date</Label>
                                <Input
                                    id="withdrawal_date"
                                    type="date"
                                    value={withdrawal.withdrawal_date}
                                    onChange={(e) => setWithdrawal({ ...withdrawal, withdrawal_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="withdrawal_notes">Notes</Label>
                                <Input
                                    id="withdrawal_notes"
                                    value={withdrawal.notes}
                                    onChange={(e) => setWithdrawal({ ...withdrawal, notes: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Process Withdrawal</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Fund Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit CBU Fund</DialogTitle>
                        <DialogDescription>Modify the Capital Build Up fund details</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveEdit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_name">Name</Label>
                                <Input
                                    id="edit_name"
                                    value={editingFund?.name || ''}
                                    onChange={(e) => setEditingFund(editingFund ? { ...editingFund, name: e.target.value } : null)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_description">Description</Label>
                                <Input
                                    id="edit_description"
                                    value={editingFund?.description || ''}
                                    onChange={(e) => setEditingFund(editingFund ? { ...editingFund, description: e.target.value } : null)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_target_amount">Target Amount</Label>
                                <Input
                                    id="edit_target_amount"
                                    type="number"
                                    value={editingFund?.target_amount || ''}
                                    onChange={(e) => setEditingFund(editingFund ? { ...editingFund, target_amount: e.target.value } : null)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_start_date">Start Date</Label>
                                <Input
                                    id="edit_start_date"
                                    type="date"
                                    value={editingFund?.start_date || ''}
                                    onChange={(e) => setEditingFund(editingFund ? { ...editingFund, start_date: e.target.value } : null)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_end_date">End Date (Optional)</Label>
                                <Input
                                    id="edit_end_date"
                                    type="date"
                                    value={editingFund?.end_date || ''}
                                    onChange={(e) => setEditingFund(editingFund ? { ...editingFund, end_date: e.target.value } : null)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Contributions Dialog */}
            <Dialog open={isViewContributionsDialogOpen} onOpenChange={setIsViewContributionsDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Contributions for {selectedFund?.name}</DialogTitle>
                        <DialogDescription>View all contributions made to this CBU fund</DialogDescription>
                    </DialogHeader>
                    <div className="overflow-x-auto">
                        {isLoadingContributions ? (
                            <div className="text-center py-4">Loading contributions...</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Contribution Date</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead>Created At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contributions && contributions.length > 0 ? (
                                        contributions.map((contribution) => (
                                            <TableRow key={contribution.id}>
                                                <TableCell>{formatAmount(contribution.amount, appCurrency)}</TableCell>
                                                <TableCell>{new Date(contribution.contribution_date).toLocaleDateString()}</TableCell>
                                                <TableCell>{contribution.notes || '-'}</TableCell>
                                                <TableCell>{new Date(contribution.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4">
                                                No contributions found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Withdrawals Dialog */}
            <Dialog open={isViewWithdrawalsDialogOpen} onOpenChange={setIsViewWithdrawalsDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Withdrawals for {selectedFund?.name}</DialogTitle>
                        <DialogDescription>View all withdrawals made from this CBU fund</DialogDescription>
                    </DialogHeader>
                    <div className="overflow-x-auto">
                        {isLoadingWithdrawals ? (
                            <div className="text-center py-4">Loading withdrawals...</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead>Created At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {withdrawals && withdrawals.length > 0 ? (
                                        withdrawals.map((withdrawal) => (
                                            <TableRow key={withdrawal.id}>
                                                <TableCell>{formatAmount(withdrawal.amount, appCurrency)}</TableCell>
                                                <TableCell>{new Date(withdrawal.date).toLocaleDateString()}</TableCell>
                                                <TableCell>{withdrawal.notes || '-'}</TableCell>
                                                <TableCell>{new Date(withdrawal.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                No withdrawals found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete CBU Fund</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the fund "{fundToDelete?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-gray-500">
                            This will permanently delete the fund and all associated contributions and withdrawals.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteFund}
                        >
                            Delete Fund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
} 