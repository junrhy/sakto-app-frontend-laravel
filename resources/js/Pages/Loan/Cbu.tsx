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
import { FileDown, MoreHorizontal, Search, Trash2, History, FileText } from 'lucide-react';
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

interface CbuDividend {
    id: number;
    cbu_fund_id: number;
    amount: string;
    dividend_date: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

interface CbuHistory {
    id: number;
    type: 'contribution' | 'withdrawal' | 'dividend';
    amount: string;
    date: string;
    notes: string | null;
    created_at: string;
}

interface CbuReport {
    total_funds: number;
    total_contributions: string;
    total_withdrawals: string;
    total_dividends: string;
    active_funds: number;
    recent_activities: Array<{
        id: number;
        cbu_fund_id: number;
        action: 'contribution' | 'withdrawal' | 'dividend';
        amount: string;
        notes: string | null;
        date: string;
        client_identifier: string;
        created_at: string;
        updated_at: string;
        fund: {
            id: number;
            name: string;
            description: string;
            target_amount: string;
            total_amount: string;
            frequency: string;
            start_date: string;
            end_date: string | null;
            status: string;
            client_identifier: string;
            created_at: string;
            updated_at: string;
        };
    }>;
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
    const [isDividendDialogOpen, setIsDividendDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewContributionsDialogOpen, setIsViewContributionsDialogOpen] = useState(false);
    const [isViewWithdrawalsDialogOpen, setIsViewWithdrawalsDialogOpen] = useState(false);
    const [isViewDividendsDialogOpen, setIsViewDividendsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [selectedFund, setSelectedFund] = useState<CbuFund | null>(null);
    const [selectedFunds, setSelectedFunds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [contributions, setContributions] = useState<CbuContribution[]>([]);
    const [withdrawals, setWithdrawals] = useState<CbuWithdrawal[]>([]);
    const [dividends, setDividends] = useState<CbuDividend[]>([]);
    const [isLoadingContributions, setIsLoadingContributions] = useState(false);
    const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(false);
    const [isLoadingDividends, setIsLoadingDividends] = useState(false);
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
    const [dividend, setDividend] = useState({
        cbu_fund_id: '',
        amount: '',
        dividend_date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [editingFund, setEditingFund] = useState<CbuFund | null>(null);
    const [fundToDelete, setFundToDelete] = useState<CbuFund | null>(null);
    const [fundHistory, setFundHistory] = useState<CbuHistory[]>([]);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [reportDateRange, setReportDateRange] = useState({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportData, setReportData] = useState<CbuReport | null>(null);

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

    const handleAddDividend = (fund: CbuFund) => {
        setSelectedFund(fund);
        setDividend({
            cbu_fund_id: fund.id.toString(),
            amount: '',
            dividend_date: new Date().toISOString().split('T')[0],
            notes: ''
        });
        setIsDividendDialogOpen(true);
    };

    const handleUpdateFund = (fund: CbuFund) => {
        setEditingFund(fund);
        setIsEditDialogOpen(true);
    };

    const handleSaveDividend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFund) return;

        try {
            const response = await axios.post(`/loan/cbu/${selectedFund.id}/dividend`, dividend);
            if (response.data) {
                setIsDividendDialogOpen(false);
                window.location.reload();
            }
        } catch (error) {
            console.error('Error saving dividend:', error);
        }
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

    const handleViewDividends = async (fund: CbuFund) => {
        setSelectedFund(fund);
        setIsLoadingDividends(true);
        try {
            const response = await axios.get(`/loan/cbu/${fund.id}/dividends`);
            if (response.data) {
                setDividends(response.data.data.cbu_dividends);
                setIsViewDividendsDialogOpen(true);
            }
        } catch (error) {
            console.error('Error fetching dividends:', error);
        } finally {
            setIsLoadingDividends(false);
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

    const handleViewHistory = async (fund: CbuFund) => {
        setSelectedFund(fund);
        setIsLoadingHistory(true);
        try {
            const [contributionsResponse, withdrawalsResponse, dividendsResponse] = await Promise.all([
                axios.get(`/loan/cbu/${fund.id}/contributions`),
                axios.get(`/loan/cbu/${fund.id}/withdrawals`),
                axios.get(`/loan/cbu/${fund.id}/dividends`)
            ]);

            const contributions = contributionsResponse.data.data.cbu_contributions.map((c: CbuContribution) => ({
                id: c.id,
                type: 'contribution' as const,
                amount: c.amount,
                date: c.contribution_date,
                notes: c.notes,
                created_at: c.created_at
            }));

            const withdrawals = withdrawalsResponse.data.data.cbu_withdrawals.map((w: CbuWithdrawal) => ({
                id: w.id,
                type: 'withdrawal' as const,
                amount: w.amount,
                date: w.date,
                notes: w.notes,
                created_at: w.created_at
            }));

            const dividends = dividendsResponse.data.data.cbu_dividends.map((d: CbuDividend) => ({
                id: d.id,
                type: 'dividend' as const,
                amount: d.amount,
                date: d.dividend_date,
                notes: d.notes,
                created_at: d.created_at
            }));

            const combinedHistory = [...contributions, ...withdrawals, ...dividends].sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setFundHistory(combinedHistory);
            setIsHistoryDialogOpen(true);
        } catch (error) {
            console.error('Error fetching fund history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        try {
            const response = await axios.get('/loan/cbu/report', {
                params: reportDateRange,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.data && response.data.data) {
                setReportData(response.data.data);
            } else {
                console.error('Invalid response format:', response.data);
                alert('Failed to generate report. Please try again.');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    // Session expired
                    window.location.reload();
                } else {
                    // Other error
                    alert('Failed to generate report. Please try again.');
                }
            }
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const filteredFunds = cbuFunds.filter(fund => 
        fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fund.description && fund.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredFunds.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFunds = filteredFunds.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

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
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsReportDialogOpen(true)}
                                    className="flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    Generate Report
                                </Button>
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
                                    {currentFunds.map((fund) => (
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
                                                        case 'view_dividends':
                                                            handleViewDividends(fund);
                                                            break;
                                                        case 'add_contribution':
                                                            handleAddContribution(fund);
                                                            break;
                                                        case 'add_dividend':
                                                            handleAddDividend(fund);
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
                                                        case 'history':
                                                            handleViewHistory(fund);
                                                            break;
                                                    }
                                                }}>
                                                    <SelectTrigger className="w-[180px]">
                                                        <span>Actions</span>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="history">View History</SelectItem>
                                                        <SelectItem value="view_contributions">View Contributions</SelectItem>
                                                        <SelectItem value="view_withdrawals">View Withdrawals</SelectItem>
                                                        <SelectItem value="view_dividends">View Dividends</SelectItem>
                                                        <SelectItem value="add_contribution">Add Contribution</SelectItem>
                                                        <SelectItem value="add_dividend">Add Dividend</SelectItem>
                                                        <SelectItem value="withdraw">Withdraw</SelectItem>
                                                        <SelectItem value="edit">Edit Fund</SelectItem>
                                                        <SelectItem value="delete" className="text-red-600">Delete Fund</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Items per page:</span>
                                <Select
                                    value={itemsPerPage.toString()}
                                    onValueChange={handleItemsPerPageChange}
                                >
                                    <SelectTrigger className="w-[80px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-sm text-gray-600">
                                    Showing {startIndex + 1}-{Math.min(endIndex, filteredFunds.length)} of {filteredFunds.length} items
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
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

            {/* Add Dividend Dialog */}
            <Dialog open={isDividendDialogOpen} onOpenChange={setIsDividendDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Dividend</DialogTitle>
                        <DialogDescription>Add a dividend payment to the CBU fund</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveDividend}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="dividend_amount">Amount</Label>
                                <Input
                                    id="dividend_amount"
                                    type="number"
                                    value={dividend.amount}
                                    onChange={(e) => setDividend({ ...dividend, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dividend_date">Dividend Date</Label>
                                <Input
                                    id="dividend_date"
                                    type="date"
                                    value={dividend.dividend_date}
                                    onChange={(e) => setDividend({ ...dividend, dividend_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dividend_notes">Notes</Label>
                                <Input
                                    id="dividend_notes"
                                    value={dividend.notes}
                                    onChange={(e) => setDividend({ ...dividend, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Dividend</Button>
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

            {/* View Dividends Dialog */}
            <Dialog open={isViewDividendsDialogOpen} onOpenChange={setIsViewDividendsDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Dividends for {selectedFund?.name}</DialogTitle>
                        <DialogDescription>View all dividends paid to this CBU fund</DialogDescription>
                    </DialogHeader>
                    <div className="overflow-x-auto">
                        {isLoadingDividends ? (
                            <div className="text-center py-4">Loading dividends...</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Dividend Date</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead>Created At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dividends && dividends.length > 0 ? (
                                        dividends.map((dividend) => (
                                            <TableRow key={dividend.id}>
                                                <TableCell>{formatAmount(dividend.amount, appCurrency)}</TableCell>
                                                <TableCell>{new Date(dividend.dividend_date).toLocaleDateString()}</TableCell>
                                                <TableCell>{dividend.notes || '-'}</TableCell>
                                                <TableCell>{new Date(dividend.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-4">
                                                No dividends found
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

            {/* History Dialog */}
            <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Transaction History - {selectedFund?.name}</DialogTitle>
                        <DialogDescription>View all transactions for this CBU fund</DialogDescription>
                    </DialogHeader>
                    <div className="overflow-x-auto">
                        {isLoadingHistory ? (
                            <div className="text-center py-4">Loading history...</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead>Created At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fundHistory.length > 0 ? (
                                        fundHistory.map((item) => (
                                            <TableRow key={`${item.type}-${item.id}`}>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        item.type === 'contribution' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : item.type === 'withdrawal' 
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {item.type === 'contribution' ? 'Contribution' : item.type === 'withdrawal' ? 'Withdrawal' : 'Dividend'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={item.type === 'withdrawal' ? 'text-red-600' : item.type === 'contribution' ? 'text-green-600' : 'text-blue-600'}>
                                                        {item.type === 'withdrawal' ? '-' : item.type === 'contribution' ? '+' : '+'}
                                                        {formatAmount(item.amount, appCurrency)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                                <TableCell>{item.notes || '-'}</TableCell>
                                                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                No transaction history found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Report Generation Dialog */}
            <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                    <div className="p-6">
                        <DialogHeader>
                            <DialogTitle>CBU Report</DialogTitle>
                            <DialogDescription>
                                Generate a comprehensive report of CBU funds
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="report_start_date">Start Date</Label>
                                    <Input
                                        id="report_start_date"
                                        type="date"
                                        value={reportDateRange.start_date}
                                        onChange={(e) => setReportDateRange({
                                            ...reportDateRange,
                                            start_date: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="report_end_date">End Date</Label>
                                    <Input
                                        id="report_end_date"
                                        type="date"
                                        value={reportDateRange.end_date}
                                        onChange={(e) => setReportDateRange({
                                            ...reportDateRange,
                                            end_date: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                            </div>

                            {reportData && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 border rounded-lg">
                                            <h3 className="font-semibold mb-2">Summary</h3>
                                            <div className="space-y-2">
                                                <p>Total Funds: {reportData.total_funds}</p>
                                                <p>Active Funds: {reportData.active_funds}</p>
                                                <p>Total Contributions: {reportData.total_contributions ? formatAmount(reportData.total_contributions, appCurrency) : '-'}</p>
                                                <p>Total Withdrawals: {reportData.total_withdrawals ? formatAmount(reportData.total_withdrawals, appCurrency) : '-'}</p>
                                                <p>Total Dividends: {reportData.total_dividends ? formatAmount(reportData.total_dividends, appCurrency) : '-'}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h3 className="font-semibold mb-2">Statistics</h3>
                                            <div className="space-y-2">
                                                <p>Net Balance: {reportData.total_contributions && reportData.total_withdrawals ? 
                                                    formatAmount(
                                                        (parseFloat(reportData.total_contributions) + parseFloat(reportData.total_dividends || '0') - parseFloat(reportData.total_withdrawals)).toString(),
                                                        appCurrency
                                                    ) : '-'}</p>
                                                <p>Average Contribution: {reportData.total_contributions && reportData.total_funds ? 
                                                    formatAmount(
                                                        (parseFloat(reportData.total_contributions) / reportData.total_funds).toString(),
                                                        appCurrency
                                                    ) : '-'}</p>
                                                <p>Average Dividend: {reportData.total_dividends && reportData.total_funds ? 
                                                    formatAmount(
                                                        (parseFloat(reportData.total_dividends) / reportData.total_funds).toString(),
                                                        appCurrency
                                                    ) : '-'}</p>
                                                <p>Contribution Rate: {reportData.total_funds ? 
                                                    `${((reportData.active_funds / reportData.total_funds) * 100).toFixed(1)}%` : '-'}</p>
                                                <p>Period: {new Date(reportDateRange.start_date).toLocaleDateString()} - {new Date(reportDateRange.end_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 border rounded-lg">
                                            <h3 className="font-semibold mb-2">Activity Distribution</h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span>Contributions:</span>
                                                    <span className="text-green-600">
                                                        {reportData.total_contributions ? formatAmount(reportData.total_contributions, appCurrency) : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Withdrawals:</span>
                                                    <span className="text-red-600">
                                                        {reportData.total_withdrawals ? formatAmount(reportData.total_withdrawals, appCurrency) : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Dividends:</span>
                                                    <span className="text-blue-600">
                                                        {reportData.total_dividends ? formatAmount(reportData.total_dividends, appCurrency) : '-'}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                                    <div 
                                                        className="bg-green-600 h-2.5 rounded-full" 
                                                        style={{ 
                                                            width: reportData.total_contributions && reportData.total_withdrawals && reportData.total_dividends ? 
                                                                `${(parseFloat(reportData.total_contributions) / (parseFloat(reportData.total_contributions) + parseFloat(reportData.total_withdrawals) + parseFloat(reportData.total_dividends))) * 100}%` : '0%'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h3 className="font-semibold mb-2">Fund Status</h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span>Active Funds:</span>
                                                    <span>{reportData.active_funds}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Inactive Funds:</span>
                                                    <span>{reportData.total_funds - reportData.active_funds}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                                    <div 
                                                        className="bg-blue-600 h-2.5 rounded-full" 
                                                        style={{ 
                                                            width: reportData.total_funds ? 
                                                                `${(reportData.active_funds / reportData.total_funds) * 100}%` : '0%'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h3 className="font-semibold mb-2">Recent Activities</h3>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>Fund</TableHead>
                                                        <TableHead>Type</TableHead>
                                                        <TableHead>Amount</TableHead>
                                                        <TableHead>Notes</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {reportData.recent_activities && reportData.recent_activities.length > 0 ? (
                                                        reportData.recent_activities.map((activity) => (
                                                            <TableRow key={activity.id}>
                                                                <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                                                                <TableCell>{activity.fund.name}</TableCell>
                                                                <TableCell>
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        activity.action === 'contribution' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : activity.action === 'withdrawal'
                                                                                ? 'bg-red-100 text-red-800'
                                                                                : 'bg-blue-100 text-blue-800'
                                                                    }`}>
                                                                        {activity.action === 'contribution' ? 'Contribution' : activity.action === 'withdrawal' ? 'Withdrawal' : 'Dividend'}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className={
                                                                        activity.action === 'withdrawal' 
                                                                            ? 'text-red-600' 
                                                                            : activity.action === 'contribution'
                                                                                ? 'text-green-600'
                                                                                : 'text-blue-600'
                                                                    }>
                                                                        {activity.action === 'withdrawal' ? '-' : '+'}
                                                                        {formatAmount(activity.amount, appCurrency)}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>{activity.notes || '-'}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-center py-4">
                                                                No recent activities found
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="sticky bottom-0 bg-background border-t p-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsReportDialogOpen(false);
                                setReportData(null);
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            onClick={handleGenerateReport}
                            disabled={isGeneratingReport}
                        >
                            {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
} 