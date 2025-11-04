import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatAmount } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { FileDown, FileText, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AddFundDialog } from './components/AddFundDialog';
import { ContributionDialog } from './components/ContributionDialog';
import { DeleteFundDialog } from './components/DeleteFundDialog';
import { DividendDialog } from './components/DividendDialog';
import { EditFundDialog } from './components/EditFundDialog';
import { HistoryDialog } from './components/HistoryDialog';
import { SendReportDialog } from './components/SendReportDialog';
import { ViewContributionsDialog } from './components/ViewContributionsDialog';
import { ViewDividendsDialog } from './components/ViewDividendsDialog';
import { ViewWithdrawalsDialog } from './components/ViewWithdrawalsDialog';
import { WithdrawDialog } from './components/WithdrawDialog';
import type {
    CbuContribution,
    CbuDividend,
    CbuFund,
    CbuHistory,
    CbuReport,
    CbuWithdrawal,
    ContributionData,
    DividendData,
    NewFundData,
    Props,
    ReportDateRange,
    ReportEmailData,
    WithdrawalData,
} from './types';
import { formatCbuAmount } from './utils';

export default function Cbu({ auth, cbuFunds, appCurrency }: Props) {
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
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isContributionDialogOpen, setIsContributionDialogOpen] =
        useState(false);
    const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
    const [isDividendDialogOpen, setIsDividendDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewContributionsDialogOpen, setIsViewContributionsDialogOpen] =
        useState(false);
    const [isViewWithdrawalsDialogOpen, setIsViewWithdrawalsDialogOpen] =
        useState(false);
    const [isViewDividendsDialogOpen, setIsViewDividendsDialogOpen] =
        useState(false);
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
    const [newFund, setNewFund] = useState<NewFundData>({
        name: '',
        description: '',
        target_amount: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        value_per_share: '',
        total_amount: '0',
        number_of_shares: 0,
    });
    const [contribution, setContribution] = useState<ContributionData>({
        cbu_fund_id: '',
        amount: '',
        contribution_date: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const [withdrawal, setWithdrawal] = useState<WithdrawalData>({
        cbu_fund_id: '',
        amount: '',
        withdrawal_date: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const [dividend, setDividend] = useState<DividendData>({
        cbu_fund_id: '',
        amount: '',
        dividend_date: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const [editingFund, setEditingFund] = useState<CbuFund | null>(null);
    const [fundToDelete, setFundToDelete] = useState<CbuFund | null>(null);
    const [fundHistory, setFundHistory] = useState<CbuHistory[]>([]);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [reportDateRange, setReportDateRange] = useState<ReportDateRange>({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
    });
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportData, setReportData] = useState<CbuReport | null>(null);
    const [isSendReportDialogOpen, setIsSendReportDialogOpen] = useState(false);
    const [isSendingReport, setIsSendingReport] = useState(false);
    const [reportEmailData, setReportEmailData] = useState<ReportEmailData>({
        email: '',
        message: '',
    });

    const handleAddFund = () => {
        setNewFund({
            name: '',
            description: '',
            target_amount: '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            value_per_share: '',
            total_amount: '0',
            number_of_shares: 0,
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
            notes: '',
        });
        setIsContributionDialogOpen(true);
    };

    const handleSaveContribution = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFund) return;

        try {
            const response = await axios.post(
                `/loan/cbu/${selectedFund.id}/contribution`,
                contribution,
            );
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
            notes: '',
        });
        setIsWithdrawDialogOpen(true);
    };

    const handleProcessWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFund) return;

        try {
            const response = await axios.post(
                `/loan/cbu/${selectedFund.id}/withdraw`,
                withdrawal,
            );
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
            notes: '',
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
            const response = await axios.post(
                `/loan/cbu/${selectedFund.id}/dividend`,
                dividend,
            );
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
            const response = await axios.get(
                `/loan/cbu/${fund.id}/contributions`,
            );
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
            const response = await axios.get(
                `/loan/cbu/${fund.id}/withdrawals`,
            );
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
                end_date: editingFund.end_date,
                value_per_share: editingFund.value_per_share,
                number_of_shares: editingFund.number_of_shares,
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
            setSelectedFunds(cbuFunds.map((fund) => fund.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedFunds.includes(id)) {
            setSelectedFunds(selectedFunds.filter((fundId) => fundId !== id));
        } else {
            setSelectedFunds([...selectedFunds, id]);
        }
    };

    const exportToCSV = () => {
        const selectedData = cbuFunds.filter((fund) =>
            selectedFunds.includes(fund.id),
        );
        const headers = [
            'Name',
            'Description',
            'Target Amount',
            'Total Amount',
            'Value Per Share',
            'Number of Shares',
            'Start Date',
            'End Date',
            'Created At',
            'Updated At',
        ];
        const csvData = selectedData.map((fund) => [
            fund.name || '',
            fund.description || '',
            fund.target_amount
                ? formatAmount(fund.target_amount, appCurrency)
                : '',
            fund.total_amount
                ? formatAmount(fund.total_amount, appCurrency)
                : '',
            fund.value_per_share
                ? formatAmount(fund.value_per_share, appCurrency)
                : '',
            fund.number_of_shares || '0',
            fund.start_date
                ? new Date(fund.start_date).toLocaleDateString()
                : '',
            fund.end_date ? new Date(fund.end_date).toLocaleDateString() : '',
            fund.created_at
                ? new Date(fund.created_at).toLocaleDateString()
                : '',
            fund.updated_at
                ? new Date(fund.updated_at).toLocaleDateString()
                : '',
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'cbu_funds.csv';
        link.click();
    };

    const handleViewHistory = async (fund: CbuFund) => {
        setSelectedFund(fund);
        setIsLoadingHistory(true);
        try {
            const [
                contributionsResponse,
                withdrawalsResponse,
                dividendsResponse,
            ] = await Promise.all([
                axios.get(`/loan/cbu/${fund.id}/contributions`),
                axios.get(`/loan/cbu/${fund.id}/withdrawals`),
                axios.get(`/loan/cbu/${fund.id}/dividends`),
            ]);

            const contributions =
                contributionsResponse.data.data.cbu_contributions.map(
                    (c: CbuContribution) => ({
                        id: c.id,
                        type: 'contribution' as const,
                        amount: c.amount,
                        date: c.contribution_date,
                        notes: c.notes,
                        created_at: c.created_at,
                    }),
                );

            const withdrawals =
                withdrawalsResponse.data.data.cbu_withdrawals.map(
                    (w: CbuWithdrawal) => ({
                        id: w.id,
                        type: 'withdrawal' as const,
                        amount: w.amount,
                        date: w.date,
                        notes: w.notes,
                        created_at: w.created_at,
                    }),
                );

            const dividends = dividendsResponse.data.data.cbu_dividends.map(
                (d: CbuDividend) => ({
                    id: d.id,
                    type: 'dividend' as const,
                    amount: d.amount,
                    date: d.dividend_date,
                    notes: d.notes,
                    created_at: d.created_at,
                }),
            );

            const combinedHistory = [
                ...contributions,
                ...withdrawals,
                ...dividends,
            ].sort(
                (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
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
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
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

    const exportReportToCSV = () => {
        if (!reportData) return;

        // Prepare headers
        const headers = [
            'Report Period',
            'Total Funds',
            'Active Funds',
            'Total Contributions',
            'Total Withdrawals',
            'Total Dividends',
            'Net Balance',
            'Average Contribution',
            'Average Dividend',
            'Contribution Rate',
        ];

        // Calculate values
        const netBalance =
            reportData.total_contributions && reportData.total_withdrawals
                ? (
                      parseFloat(reportData.total_contributions) +
                      parseFloat(reportData.total_dividends || '0') -
                      parseFloat(reportData.total_withdrawals)
                  ).toString()
                : '0';

        const avgContribution =
            reportData.total_contributions && reportData.total_funds
                ? (
                      parseFloat(reportData.total_contributions) /
                      reportData.total_funds
                  ).toString()
                : '0';

        const avgDividend =
            reportData.total_dividends && reportData.total_funds
                ? (
                      parseFloat(reportData.total_dividends) /
                      reportData.total_funds
                  ).toString()
                : '0';

        const contributionRate = reportData.total_funds
            ? (
                  (reportData.active_funds / reportData.total_funds) *
                  100
              ).toFixed(1) + '%'
            : '0%';

        // Prepare data row
        const data = [
            `${new Date(reportDateRange.start_date).toLocaleDateString()} - ${new Date(reportDateRange.end_date).toLocaleDateString()}`,
            reportData.total_funds.toString(),
            reportData.active_funds.toString(),
            reportData.total_contributions
                ? formatAmount(reportData.total_contributions, appCurrency)
                : '-',
            reportData.total_withdrawals
                ? formatAmount(reportData.total_withdrawals, appCurrency)
                : '-',
            reportData.total_dividends
                ? formatAmount(reportData.total_dividends, appCurrency)
                : '-',
            formatAmount(netBalance, appCurrency),
            formatAmount(avgContribution, appCurrency),
            formatAmount(avgDividend, appCurrency),
            contributionRate,
        ];

        // Create CSV content
        const csvContent = [
            headers.join(','),
            data.map((cell) => `"${cell}"`).join(','),
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `cbu_report_${reportDateRange.start_date}_to_${reportDateRange.end_date}.csv`;
        link.click();
    };

    const handleSendFundReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFund) return;

        setIsSendingReport(true);
        try {
            const response = await axios.post(
                `/loan/cbu/${selectedFund.id}/send-report`,
                reportEmailData,
            );

            if (response.data) {
                toast.success('Fund report sent successfully');
                setIsSendReportDialogOpen(false);
                setReportEmailData({ email: '', message: '' });
            }
        } catch (error) {
            console.error('Error sending fund report:', error);
            toast.error('Failed to send fund report. Please try again.');
        } finally {
            setIsSendingReport(false);
        }
    };

    const filteredFunds = cbuFunds.filter(
        (fund) =>
            fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (fund.description &&
                fund.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())),
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

            <div className="rounded-lg border border-gray-200 p-4 shadow-sm dark:border-gray-700">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>CBU Funds</CardTitle>
                                <CardDescription>
                                    Manage your Capital Build Up funds
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsReportDialogOpen(true)}
                                    className="flex items-center gap-2 w-full sm:w-auto"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Generate Report</span>
                                    <span className="sm:hidden">Report</span>
                                </Button>
                                {selectedFunds.length > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={exportToCSV}
                                        className="flex items-center w-full sm:w-auto"
                                    >
                                        <FileDown className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Export Selected</span>
                                        <span className="sm:hidden">Export</span>
                                    </Button>
                                )}
                                <Button onClick={handleAddFund} className="w-full sm:w-auto">
                                    Add CBU Fund
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                                <Input
                                    placeholder="Search by name or description..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-8"
                                />
                            </div>
                        </div>
                        <div className="mb-4 flex items-center gap-2 px-1">
                            <Checkbox
                                checked={
                                    selectedFunds.length ===
                                        currentFunds.length &&
                                    currentFunds.length > 0
                                }
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedFunds(
                                            currentFunds.map((fund) => fund.id),
                                        );
                                    } else {
                                        setSelectedFunds([]);
                                    }
                                }}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Select All ({currentFunds.length} funds)
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {currentFunds.map((fund) => {
                                const progressPercentage =
                                    fund.target_amount && fund.total_amount
                                        ? (parseFloat(fund.total_amount) /
                                              parseFloat(fund.target_amount)) *
                                          100
                                        : 0;

                                const targetAmount = fund.target_amount
                                    ? parseFloat(fund.target_amount)
                                    : 0;
                                const totalAmount = fund.total_amount
                                    ? parseFloat(fund.total_amount)
                                    : 0;
                                const remaining =
                                    targetAmount > 0
                                        ? Math.max(
                                              0,
                                              targetAmount - totalAmount,
                                          )
                                        : 0;

                                return (
                                    <Card
                                        key={fund.id}
                                        className={`relative overflow-hidden border-2 transition-all hover:shadow-lg ${
                                            selectedFunds.includes(fund.id)
                                                ? 'border-blue-500 ring-2 ring-blue-300 dark:ring-blue-700'
                                                : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <CardContent className="p-6">
                                            {/* Header with Checkbox and Fund Name */}
                                            <div className="mb-4 flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        checked={selectedFunds.includes(
                                                            fund.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleSelect(
                                                                fund.id,
                                                            )
                                                        }
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            {fund.name}
                                                        </h3>
                                                        {fund.description && (
                                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                {
                                                                    fund.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Target Amount - Prominent Display */}
                                            <div className="mb-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20">
                                                <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                                                    Target Amount
                                                </div>
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {fund.target_amount
                                                        ? formatCbuAmount(
                                                              fund.target_amount,
                                                              appCurrency,
                                                          )
                                                        : 'No Target'}
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            {fund.target_amount && (
                                                <div className="mb-4">
                                                    <div className="mb-2 flex items-center justify-between text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            Progress
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
                                                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                                                            style={{
                                                                width: `${Math.min(
                                                                    progressPercentage,
                                                                    100,
                                                                )}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Financial Summary */}
                                            <div className="mb-4 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        Total Amount
                                                    </span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {fund.total_amount
                                                            ? formatCbuAmount(
                                                                  fund.total_amount,
                                                                  appCurrency,
                                                              )
                                                            : formatCbuAmount(
                                                                  '0',
                                                                  appCurrency,
                                                              )}
                                                    </span>
                                                </div>
                                                {fund.target_amount && (
                                                    <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-sm dark:border-gray-700">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            Remaining
                                                        </span>
                                                        <span className="font-medium text-orange-600 dark:text-orange-400">
                                                            {formatCbuAmount(
                                                                remaining.toString(),
                                                                appCurrency,
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-sm dark:border-gray-700">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        Value Per Share
                                                    </span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {fund.value_per_share
                                                            ? formatCbuAmount(
                                                                  fund.value_per_share,
                                                                  appCurrency,
                                                              )
                                                            : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-sm dark:border-gray-700">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        Number of Shares
                                                    </span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {fund.number_of_shares ||
                                                            '0'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Date Range */}
                                            <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                                                <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-800/50">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Start Date
                                                    </div>
                                                    <div className="mt-1 font-medium text-gray-900 dark:text-white">
                                                        {fund.start_date
                                                            ? new Date(
                                                                  fund.start_date,
                                                              ).toLocaleDateString()
                                                            : '-'}
                                                    </div>
                                                </div>
                                                <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-800/50">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        End Date
                                                    </div>
                                                    <div className="mt-1 font-medium text-gray-900 dark:text-white">
                                                        {fund.end_date
                                                            ? new Date(
                                                                  fund.end_date,
                                                              ).toLocaleDateString()
                                                            : '-'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="mt-4">
                                                <Select
                                                    onValueChange={(value) => {
                                                        switch (value) {
                                                            case 'view_contributions':
                                                                handleViewContributions(
                                                                    fund,
                                                                );
                                                                break;
                                                            case 'view_withdrawals':
                                                                handleViewWithdrawals(
                                                                    fund,
                                                                );
                                                                break;
                                                            case 'view_dividends':
                                                                handleViewDividends(
                                                                    fund,
                                                                );
                                                                break;
                                                            case 'add_contribution':
                                                                handleAddContribution(
                                                                    fund,
                                                                );
                                                                break;
                                                            case 'add_dividend':
                                                                handleAddDividend(
                                                                    fund,
                                                                );
                                                                break;
                                                            case 'withdraw':
                                                                handleWithdraw(
                                                                    fund,
                                                                );
                                                                break;
                                                            case 'edit':
                                                                if (canEdit) {
                                                                    handleUpdateFund(
                                                                        fund,
                                                                    );
                                                                } else {
                                                                    toast.error(
                                                                        'You do not have permission to edit funds.',
                                                                    );
                                                                }
                                                                break;
                                                            case 'delete':
                                                                if (canDelete) {
                                                                    confirmDelete(
                                                                        fund,
                                                                    );
                                                                } else {
                                                                    toast.error(
                                                                        'You do not have permission to delete funds.',
                                                                    );
                                                                }
                                                                break;
                                                            case 'history':
                                                                handleViewHistory(
                                                                    fund,
                                                                );
                                                                break;
                                                            case 'send_report':
                                                                setSelectedFund(
                                                                    fund,
                                                                );
                                                                setIsSendReportDialogOpen(
                                                                    true,
                                                                );
                                                                break;
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <span>Actions</span>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="history">
                                                            View History
                                                        </SelectItem>
                                                        <SelectItem value="view_contributions">
                                                            View Contributions
                                                        </SelectItem>
                                                        <SelectItem value="view_withdrawals">
                                                            View Withdrawals
                                                        </SelectItem>
                                                        <SelectItem value="view_dividends">
                                                            View Dividends
                                                        </SelectItem>
                                                        <SelectItem value="add_contribution">
                                                            Add Contribution
                                                        </SelectItem>
                                                        <SelectItem value="add_dividend">
                                                            Add Dividend
                                                        </SelectItem>
                                                        <SelectItem value="withdraw">
                                                            Withdraw
                                                        </SelectItem>
                                                        {canEdit && (
                                                            <SelectItem value="edit">
                                                                Edit Fund
                                                            </SelectItem>
                                                        )}
                                                        {canDelete && (
                                                            <SelectItem
                                                                value="delete"
                                                                className="text-red-600"
                                                            >
                                                                Delete Fund
                                                            </SelectItem>
                                                        )}
                                                        <SelectItem value="send_report">
                                                            Send Report
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Items per page:
                                </span>
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
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {startIndex + 1}-
                                    {Math.min(endIndex, filteredFunds.length)}{' '}
                                    of {filteredFunds.length} items
                                </span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                    className="w-full sm:w-auto"
                                >
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1 overflow-x-auto">
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <Button
                                            key={page}
                                            variant={
                                                currentPage === page
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            onClick={() =>
                                                handlePageChange(page)
                                            }
                                            className="h-8 w-8 p-0 flex-shrink-0"
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    disabled={currentPage === totalPages}
                                    className="w-full sm:w-auto"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Fund Dialog */}
            <AddFundDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                newFund={newFund}
                onNewFundChange={(fund) => setNewFund({ ...newFund, ...fund })}
                onSubmit={handleSaveFund}
            />

            {/* Add Contribution Dialog */}
            <ContributionDialog
                open={isContributionDialogOpen}
                onOpenChange={setIsContributionDialogOpen}
                contribution={contribution}
                onContributionChange={(data) =>
                    setContribution({ ...contribution, ...data })
                }
                onSubmit={handleSaveContribution}
            />

            {/* Withdraw Dialog */}
            <WithdrawDialog
                open={isWithdrawDialogOpen}
                onOpenChange={setIsWithdrawDialogOpen}
                withdrawal={withdrawal}
                onWithdrawalChange={(data) =>
                    setWithdrawal({ ...withdrawal, ...data })
                }
                onSubmit={handleProcessWithdrawal}
            />

            {/* Add Dividend Dialog */}
            <DividendDialog
                open={isDividendDialogOpen}
                onOpenChange={setIsDividendDialogOpen}
                dividend={dividend}
                onDividendChange={(data) =>
                    setDividend({ ...dividend, ...data })
                }
                onSubmit={handleSaveDividend}
            />

            {/* Edit Fund Dialog */}
            <EditFundDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                editingFund={editingFund}
                onEditingFundChange={(fund) => {
                    if (fund === null) {
                        setEditingFund(null);
                    } else if (editingFund) {
                        setEditingFund({ ...editingFund, ...fund });
                    }
                }}
                onSubmit={handleSaveEdit}
            />

            {/* View Contributions Dialog */}
            <ViewContributionsDialog
                open={isViewContributionsDialogOpen}
                onOpenChange={setIsViewContributionsDialogOpen}
                selectedFund={selectedFund}
                contributions={contributions}
                isLoading={isLoadingContributions}
                appCurrency={appCurrency}
            />

            {/* View Withdrawals Dialog */}
            <ViewWithdrawalsDialog
                open={isViewWithdrawalsDialogOpen}
                onOpenChange={setIsViewWithdrawalsDialogOpen}
                selectedFund={selectedFund}
                withdrawals={withdrawals}
                isLoading={isLoadingWithdrawals}
                appCurrency={appCurrency}
            />

            {/* View Dividends Dialog */}
            <ViewDividendsDialog
                open={isViewDividendsDialogOpen}
                onOpenChange={setIsViewDividendsDialogOpen}
                selectedFund={selectedFund}
                dividends={dividends}
                isLoading={isLoadingDividends}
                appCurrency={appCurrency}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteFundDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                fundToDelete={fundToDelete}
                onConfirm={handleDeleteFund}
            />

            {/* History Dialog */}
            <HistoryDialog
                open={isHistoryDialogOpen}
                onOpenChange={setIsHistoryDialogOpen}
                selectedFund={selectedFund}
                fundHistory={fundHistory}
                isLoading={isLoadingHistory}
                appCurrency={appCurrency}
            />

            {/* Report Generation Dialog */}
            <Dialog
                open={isReportDialogOpen}
                onOpenChange={setIsReportDialogOpen}
            >
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-0">
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
                                    <Label htmlFor="report_start_date">
                                        Start Date
                                    </Label>
                                    <Input
                                        id="report_start_date"
                                        type="date"
                                        value={reportDateRange.start_date}
                                        onChange={(e) =>
                                            setReportDateRange({
                                                ...reportDateRange,
                                                start_date: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="report_end_date">
                                        End Date
                                    </Label>
                                    <Input
                                        id="report_end_date"
                                        type="date"
                                        value={reportDateRange.end_date}
                                        onChange={(e) =>
                                            setReportDateRange({
                                                ...reportDateRange,
                                                end_date: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            {reportData && (
                                <>
                                    <div className="mb-4 flex justify-end">
                                        <Button
                                            variant="outline"
                                            onClick={exportReportToCSV}
                                            className="flex items-center gap-2"
                                        >
                                            <FileDown className="h-4 w-4" />
                                            Export Report
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-lg border p-4">
                                            <h3 className="mb-2 font-semibold">
                                                Summary
                                            </h3>
                                            <div className="space-y-2">
                                                <p>
                                                    Total Funds:{' '}
                                                    {reportData.total_funds}
                                                </p>
                                                <p>
                                                    Active Funds:{' '}
                                                    {reportData.active_funds}
                                                </p>
                                                <p>
                                                    Total Contributions:{' '}
                                                    {reportData.total_contributions
                                                        ? formatAmount(
                                                              reportData.total_contributions,
                                                              appCurrency,
                                                          )
                                                        : '-'}
                                                </p>
                                                <p>
                                                    Total Withdrawals:{' '}
                                                    {reportData.total_withdrawals
                                                        ? formatAmount(
                                                              reportData.total_withdrawals,
                                                              appCurrency,
                                                          )
                                                        : '-'}
                                                </p>
                                                <p>
                                                    Total Dividends:{' '}
                                                    {reportData.total_dividends
                                                        ? formatAmount(
                                                              reportData.total_dividends,
                                                              appCurrency,
                                                          )
                                                        : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                            <h3 className="mb-2 font-semibold">
                                                Statistics
                                            </h3>
                                            <div className="space-y-2">
                                                <p>
                                                    Net Balance:{' '}
                                                    {reportData.total_contributions &&
                                                    reportData.total_withdrawals
                                                        ? formatAmount(
                                                              (
                                                                  parseFloat(
                                                                      reportData.total_contributions,
                                                                  ) +
                                                                  parseFloat(
                                                                      reportData.total_dividends ||
                                                                          '0',
                                                                  ) -
                                                                  parseFloat(
                                                                      reportData.total_withdrawals,
                                                                  )
                                                              ).toString(),
                                                              appCurrency,
                                                          )
                                                        : '-'}
                                                </p>
                                                <p>
                                                    Average Contribution:{' '}
                                                    {reportData.total_contributions &&
                                                    reportData.total_funds
                                                        ? formatAmount(
                                                              (
                                                                  parseFloat(
                                                                      reportData.total_contributions,
                                                                  ) /
                                                                  reportData.total_funds
                                                              ).toString(),
                                                              appCurrency,
                                                          )
                                                        : '-'}
                                                </p>
                                                <p>
                                                    Average Dividend:{' '}
                                                    {reportData.total_dividends &&
                                                    reportData.total_funds
                                                        ? formatAmount(
                                                              (
                                                                  parseFloat(
                                                                      reportData.total_dividends,
                                                                  ) /
                                                                  reportData.total_funds
                                                              ).toString(),
                                                              appCurrency,
                                                          )
                                                        : '-'}
                                                </p>
                                                <p>
                                                    Contribution Rate:{' '}
                                                    {reportData.total_funds
                                                        ? `${((reportData.active_funds / reportData.total_funds) * 100).toFixed(1)}%`
                                                        : '-'}
                                                </p>
                                                <p>
                                                    Period:{' '}
                                                    {new Date(
                                                        reportDateRange.start_date,
                                                    ).toLocaleDateString()}{' '}
                                                    -{' '}
                                                    {new Date(
                                                        reportDateRange.end_date,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-lg border p-4">
                                            <h3 className="mb-2 font-semibold">
                                                Activity Distribution
                                            </h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span>Contributions:</span>
                                                    <span className="text-green-600">
                                                        {reportData.total_contributions
                                                            ? formatAmount(
                                                                  reportData.total_contributions,
                                                                  appCurrency,
                                                              )
                                                            : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Withdrawals:</span>
                                                    <span className="text-red-600">
                                                        {reportData.total_withdrawals
                                                            ? formatAmount(
                                                                  reportData.total_withdrawals,
                                                                  appCurrency,
                                                              )
                                                            : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Dividends:</span>
                                                    <span className="text-blue-600">
                                                        {reportData.total_dividends
                                                            ? formatAmount(
                                                                  reportData.total_dividends,
                                                                  appCurrency,
                                                              )
                                                            : '-'}
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-2.5 w-full rounded-full bg-gray-200">
                                                    <div
                                                        className="h-2.5 rounded-full bg-green-600"
                                                        style={{
                                                            width:
                                                                reportData.total_contributions &&
                                                                reportData.total_withdrawals &&
                                                                reportData.total_dividends
                                                                    ? `${(parseFloat(reportData.total_contributions) / (parseFloat(reportData.total_contributions) + parseFloat(reportData.total_withdrawals) + parseFloat(reportData.total_dividends))) * 100}%`
                                                                    : '0%',
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                            <h3 className="mb-2 font-semibold">
                                                Fund Status
                                            </h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span>Active Funds:</span>
                                                    <span>
                                                        {
                                                            reportData.active_funds
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Inactive Funds:</span>
                                                    <span>
                                                        {reportData.total_funds -
                                                            reportData.active_funds}
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-2.5 w-full rounded-full bg-gray-200">
                                                    <div
                                                        className="h-2.5 rounded-full bg-blue-600"
                                                        style={{
                                                            width: reportData.total_funds
                                                                ? `${(reportData.active_funds / reportData.total_funds) * 100}%`
                                                                : '0%',
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h3 className="mb-2 font-semibold">
                                            Recent Activities
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Date
                                                        </TableHead>
                                                        <TableHead>
                                                            Fund
                                                        </TableHead>
                                                        <TableHead>
                                                            Type
                                                        </TableHead>
                                                        <TableHead>
                                                            Amount
                                                        </TableHead>
                                                        <TableHead>
                                                            Notes
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {reportData.recent_activities &&
                                                    reportData.recent_activities
                                                        .length > 0 ? (
                                                        reportData.recent_activities.map(
                                                            (activity) => (
                                                                <TableRow
                                                                    key={
                                                                        activity.id
                                                                    }
                                                                >
                                                                    <TableCell>
                                                                        {new Date(
                                                                            activity.date,
                                                                        ).toLocaleDateString()}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            activity
                                                                                .fund
                                                                                .name
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <span
                                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                                activity.action ===
                                                                                'contribution'
                                                                                    ? 'bg-green-100 text-green-800'
                                                                                    : activity.action ===
                                                                                        'withdrawal'
                                                                                      ? 'bg-red-100 text-red-800'
                                                                                      : 'bg-blue-100 text-blue-800'
                                                                            }`}
                                                                        >
                                                                            {activity.action ===
                                                                            'contribution'
                                                                                ? 'Contribution'
                                                                                : activity.action ===
                                                                                    'withdrawal'
                                                                                  ? 'Withdrawal'
                                                                                  : 'Dividend'}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <span
                                                                            className={
                                                                                activity.action ===
                                                                                'withdrawal'
                                                                                    ? 'text-red-600'
                                                                                    : activity.action ===
                                                                                        'contribution'
                                                                                      ? 'text-green-600'
                                                                                      : 'text-blue-600'
                                                                            }
                                                                        >
                                                                            {activity.action ===
                                                                            'withdrawal'
                                                                                ? '-'
                                                                                : '+'}
                                                                            {formatAmount(
                                                                                activity.amount,
                                                                                appCurrency,
                                                                            )}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {activity.notes ||
                                                                            '-'}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ),
                                                        )
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={5}
                                                                className="py-4 text-center"
                                                            >
                                                                No recent
                                                                activities found
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
                    <DialogFooter className="sticky bottom-0 border-t bg-background p-6">
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
                            {isGeneratingReport
                                ? 'Generating...'
                                : 'Generate Report'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Send Fund Report Dialog */}
            <SendReportDialog
                open={isSendReportDialogOpen}
                onOpenChange={setIsSendReportDialogOpen}
                selectedFund={selectedFund}
                reportEmailData={reportEmailData}
                onReportEmailDataChange={(data) =>
                    setReportEmailData({ ...reportEmailData, ...data })
                }
                onSubmit={handleSendFundReport}
                isSending={isSendingReport}
            />
        </AuthenticatedLayout>
    );
}
