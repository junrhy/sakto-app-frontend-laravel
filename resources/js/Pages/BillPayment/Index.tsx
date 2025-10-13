import { Badge } from '@/Components/ui/badge';
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
    DialogTrigger,
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
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    Plus,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BillPayment {
    id: number;
    bill_number: string;
    bill_title: string;
    bill_description?: string;
    biller_id?: number;
    biller?: {
        id: number;
        name: string;
        category?: string;
        account_number?: string;
    };
    amount: number;
    due_date: string;
    payment_date?: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partial';
    payment_method?: string;
    reference_number?: string;
    notes?: string;
    category?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    is_recurring: boolean;
    recurring_frequency?: string;
    next_due_date?: string;
    attachments?: any[];
    reminder_sent: boolean;
    reminder_date?: string;
    created_at: string;
    updated_at: string;
}

interface Biller {
    id: number;
    name: string;
    description?: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    account_number?: string;
    category?: string;
    is_active: boolean;
}

interface Statistics {
    total_bills: number;
    total_amount: number;
    paid_bills: number;
    paid_amount: number;
    pending_bills: number;
    pending_amount: number;
    overdue_bills: number;
    overdue_amount: number;
    upcoming_bills: number;
    upcoming_amount: number;
}

interface CategoryBreakdown {
    category: string;
    count: number;
    total_amount: number;
}

interface PriorityBreakdown {
    priority: string;
    count: number;
    total_amount: number;
}

export default function BillPayment({ auth }: { auth: any }) {
    const [billPayments, setBillPayments] = useState<BillPayment[]>([]);
    const [billers, setBillers] = useState<Biller[]>([]);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [categoryBreakdown, setCategoryBreakdown] = useState<
        CategoryBreakdown[]
    >([]);
    const [priorityBreakdown, setPriorityBreakdown] = useState<
        PriorityBreakdown[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [billerFilter, setBillerFilter] = useState<string>('all');
    const [selectedBills, setSelectedBills] = useState<number[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingBill, setDeletingBill] = useState<BillPayment | null>(null);
    const [editingBill, setEditingBill] = useState<BillPayment | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [activeTab, setActiveTab] = useState('all');

    // Form state
    const [formData, setFormData] = useState({
        bill_title: '',
        bill_description: '',
        biller_id: 'none',
        amount: '',
        due_date: new Date().toISOString().split('T')[0], // Default to today
        payment_date: '',
        status: 'pending',
        payment_method: '',
        reference_number: '',
        notes: '',
        category: '',
        priority: 'medium',
        is_recurring: false,
        recurring_frequency: '',
        next_due_date: '',
        reminder_date: '',
    });

    const statusColors = {
        pending:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        cancelled:
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        partial:
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };

    const priorityColors = {
        low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    const fetchBillPayments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: perPage.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(categoryFilter && { category: categoryFilter }),
                ...(priorityFilter !== 'all' && { priority: priorityFilter }),
                ...(billerFilter !== 'all' && { biller_name: billerFilter }),
            });

            const response = await axios.get(`/bill-payments/list?${params}`);
            setBillPayments(response.data.data);
            setTotalPages(response.data.pagination.last_page);
        } catch (error) {
            console.error('Error fetching bill payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await axios.get('/bill-payments/statistics');
            setStatistics(response.data.data.statistics);
            setCategoryBreakdown(response.data.data.category_breakdown);
            setPriorityBreakdown(response.data.data.priority_breakdown);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const fetchBillers = async () => {
        try {
            const response = await axios.get('/bill-payments/billers');
            if (response.data.success) {
                setBillers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching billers:', error);
        }
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchTerm,
        statusFilter,
        categoryFilter,
        priorityFilter,
        billerFilter,
        perPage,
    ]);

    useEffect(() => {
        fetchBillPayments();
        fetchStatistics();
        fetchBillers();
    }, [
        currentPage,
        perPage,
        searchTerm,
        statusFilter,
        categoryFilter,
        priorityFilter,
        billerFilter,
    ]);

    const handleCreateBill = async () => {
        try {
            const submitData = {
                ...formData,
                amount: parseFloat(formData.amount),
                biller_id:
                    formData.biller_id === 'none' ? null : formData.biller_id,
            };
            await axios.post('/bill-payments', submitData);
            toast.success('Bill payment created successfully');
            setShowCreateDialog(false);
            setFormData({
                bill_title: '',
                bill_description: '',
                biller_id: 'none',
                amount: '',
                due_date: new Date().toISOString().split('T')[0], // Default to today
                payment_date: '',
                status: 'pending',
                payment_method: '',
                reference_number: '',
                notes: '',
                category: '',
                priority: 'medium',
                is_recurring: false,
                recurring_frequency: '',
                next_due_date: '',
                reminder_date: '',
            });
            fetchBillPayments();
            fetchStatistics();
        } catch (error) {
            console.error('Error creating bill payment:', error);
            toast.error('Failed to create bill payment');
        }
    };

    const handleUpdateBill = async () => {
        if (!editingBill) return;
        try {
            const submitData = {
                ...formData,
                amount: parseFloat(formData.amount),
                biller_id:
                    formData.biller_id === 'none' ? null : formData.biller_id,
            };
            await axios.put(`/bill-payments/${editingBill.id}`, submitData);
            toast.success('Bill payment updated successfully');
            setShowEditDialog(false);
            setEditingBill(null);
            fetchBillPayments();
            fetchStatistics();
        } catch (error) {
            console.error('Error updating bill payment:', error);
            toast.error('Failed to update bill payment');
        }
    };

    const handleDeleteBill = async (bill: BillPayment) => {
        setDeletingBill(bill);
        setShowDeleteDialog(true);
    };

    const confirmDeleteBill = async () => {
        if (!deletingBill) return;

        try {
            await axios.delete(`/bill-payments/${deletingBill.id}`);
            toast.success('Bill payment deleted successfully');
            fetchBillPayments();
            fetchStatistics();
        } catch (error) {
            console.error('Error deleting bill payment:', error);
            toast.error('Failed to delete bill payment');
        } finally {
            setShowDeleteDialog(false);
            setDeletingBill(null);
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedBills.length) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedBills.length} bills? This action cannot be undone.`,
        );
        if (!confirmed) return;

        try {
            await axios.post('/bill-payments/bulk-delete', {
                bill_ids: selectedBills,
            });
            toast.success(`Successfully deleted ${selectedBills.length} bills`);
            setSelectedBills([]);
            fetchBillPayments();
            fetchStatistics();
        } catch (error) {
            console.error('Error bulk deleting bills:', error);
            toast.error('Failed to delete bills');
        }
    };

    const handleBulkStatusUpdate = async (status: string) => {
        if (!selectedBills.length) return;
        try {
            await axios.post('/bill-payments/bulk-update-status', {
                bill_ids: selectedBills,
                status,
            });
            toast.success(
                `Successfully updated ${selectedBills.length} bills to ${status} status`,
            );
            setSelectedBills([]);
            fetchBillPayments();
            fetchStatistics();
        } catch (error) {
            console.error('Error bulk updating status:', error);
            toast.error('Failed to update bill status');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM dd, yyyy');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="h-4 w-4" />;
            case 'overdue':
                return <AlertTriangle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Bill Payments
                </h2>
            }
        >
            <Head title="Bill Payments" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Statistics Cards */}
                    {statistics && (
                        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Bills
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {statistics.total_bills}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(
                                            statistics.total_amount,
                                        )}{' '}
                                        total
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Paid Bills
                                    </CardTitle>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {statistics.paid_bills}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(statistics.paid_amount)}{' '}
                                        paid
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Pending Bills
                                    </CardTitle>
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {statistics.pending_bills}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(
                                            statistics.pending_amount,
                                        )}{' '}
                                        pending
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Overdue Bills
                                    </CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">
                                        {statistics.overdue_bills}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(
                                            statistics.overdue_amount,
                                        )}{' '}
                                        overdue
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Main Content */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Bill Payments</CardTitle>
                                    <CardDescription>
                                        Manage your bills and payments
                                        efficiently
                                    </CardDescription>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {selectedBills.length > 0 && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleBulkStatusUpdate(
                                                        'paid',
                                                    )
                                                }
                                            >
                                                Mark as Paid
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleBulkDelete}
                                            >
                                                Delete Selected
                                            </Button>
                                        </>
                                    )}
                                    <Dialog
                                        open={showCreateDialog}
                                        onOpenChange={setShowCreateDialog}
                                    >
                                        <DialogTrigger asChild>
                                            <Button>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Bill
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Create New Bill
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Add a new bill payment to
                                                    your system
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="bill_title">
                                                            Bill Title *
                                                        </Label>
                                                        <Input
                                                            id="bill_title"
                                                            value={
                                                                formData.bill_title
                                                            }
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    bill_title:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="biller_id">
                                                            Biller
                                                        </Label>
                                                        <Select
                                                            value={
                                                                formData.biller_id
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    biller_id:
                                                                        value,
                                                                })
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a biller" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">
                                                                    No Biller
                                                                </SelectItem>
                                                                {billers.map(
                                                                    (
                                                                        biller,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                biller.id
                                                                            }
                                                                            value={biller.id.toString()}
                                                                        >
                                                                            {
                                                                                biller.name
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <div className="h-5">
                                                            {formData.biller_id !==
                                                                'none' &&
                                                                (() => {
                                                                    const selectedBiller =
                                                                        billers.find(
                                                                            (
                                                                                b,
                                                                            ) =>
                                                                                b.id.toString() ===
                                                                                formData.biller_id,
                                                                        );
                                                                    return (
                                                                        selectedBiller?.account_number && (
                                                                            <div className="text-sm text-muted-foreground">
                                                                                Account
                                                                                Number:{' '}
                                                                                {
                                                                                    selectedBiller.account_number
                                                                                }
                                                                            </div>
                                                                        )
                                                                    );
                                                                })()}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="amount">
                                                            Amount *
                                                        </Label>
                                                        <Input
                                                            id="amount"
                                                            type="number"
                                                            step="0.01"
                                                            value={
                                                                formData.amount
                                                            }
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    amount: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="due_date">
                                                            Due Date *
                                                        </Label>
                                                        <Input
                                                            id="due_date"
                                                            type="date"
                                                            value={
                                                                formData.due_date
                                                            }
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    due_date:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="category">
                                                            Category
                                                        </Label>
                                                        <Input
                                                            id="category"
                                                            value={
                                                                formData.category
                                                            }
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    category:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="priority">
                                                            Priority
                                                        </Label>
                                                        <Select
                                                            value={
                                                                formData.priority
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    priority:
                                                                        value,
                                                                })
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="low">
                                                                    Low
                                                                </SelectItem>
                                                                <SelectItem value="medium">
                                                                    Medium
                                                                </SelectItem>
                                                                <SelectItem value="high">
                                                                    High
                                                                </SelectItem>
                                                                <SelectItem value="urgent">
                                                                    Urgent
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="status">
                                                            Status
                                                        </Label>
                                                        <Select
                                                            value={
                                                                formData.status
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    status: value,
                                                                })
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pending">
                                                                    Pending
                                                                </SelectItem>
                                                                <SelectItem value="paid">
                                                                    Paid
                                                                </SelectItem>
                                                                <SelectItem value="overdue">
                                                                    Overdue
                                                                </SelectItem>
                                                                <SelectItem value="cancelled">
                                                                    Cancelled
                                                                </SelectItem>
                                                                <SelectItem value="partial">
                                                                    Partial
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="bill_description">
                                                        Description
                                                    </Label>
                                                    <Textarea
                                                        id="bill_description"
                                                        value={
                                                            formData.bill_description
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                bill_description:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="reference_number">
                                                        Reference Number
                                                    </Label>
                                                    <Input
                                                        id="reference_number"
                                                        value={
                                                            formData.reference_number
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                reference_number:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="Enter reference number"
                                                    />
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="is_recurring"
                                                        checked={
                                                            formData.is_recurring
                                                        }
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            setFormData({
                                                                ...formData,
                                                                is_recurring:
                                                                    checked as boolean,
                                                            })
                                                        }
                                                    />
                                                    <Label htmlFor="is_recurring">
                                                        Recurring Bill
                                                    </Label>
                                                </div>
                                                {formData.is_recurring && (
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="recurring_frequency">
                                                                Frequency
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    formData.recurring_frequency
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    setFormData(
                                                                        {
                                                                            ...formData,
                                                                            recurring_frequency:
                                                                                value,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="daily">
                                                                        Daily
                                                                    </SelectItem>
                                                                    <SelectItem value="weekly">
                                                                        Weekly
                                                                    </SelectItem>
                                                                    <SelectItem value="monthly">
                                                                        Monthly
                                                                    </SelectItem>
                                                                    <SelectItem value="quarterly">
                                                                        Quarterly
                                                                    </SelectItem>
                                                                    <SelectItem value="yearly">
                                                                        Yearly
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="next_due_date">
                                                                Next Due Date
                                                            </Label>
                                                            <Input
                                                                id="next_due_date"
                                                                type="date"
                                                                value={
                                                                    formData.next_due_date
                                                                }
                                                                onChange={(e) =>
                                                                    setFormData(
                                                                        {
                                                                            ...formData,
                                                                            next_due_date:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setShowCreateDialog(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleCreateBill}
                                                >
                                                    Create Bill
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Filters */}
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search bills..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="paid">
                                            Paid
                                        </SelectItem>
                                        <SelectItem value="overdue">
                                            Overdue
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Cancelled
                                        </SelectItem>
                                        <SelectItem value="partial">
                                            Partial
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={priorityFilter}
                                    onValueChange={setPriorityFilter}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Priorities
                                        </SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="high">
                                            High
                                        </SelectItem>
                                        <SelectItem value="urgent">
                                            Urgent
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={billerFilter}
                                    onValueChange={setBillerFilter}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by biller" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Billers
                                        </SelectItem>
                                        {billers.map((biller) => (
                                            <SelectItem
                                                key={biller.id}
                                                value={biller.name}
                                            >
                                                {biller.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Bills Table */}
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="py-8 text-center">
                                        Loading...
                                    </div>
                                ) : billPayments.length === 0 ? (
                                    <div className="py-8 text-center text-muted-foreground">
                                        No bills found. Create your first bill
                                        to get started.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {billPayments.map((bill) => (
                                            <div
                                                key={bill.id}
                                                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <Checkbox
                                                        checked={selectedBills.includes(
                                                            bill.id,
                                                        )}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) => {
                                                            if (checked) {
                                                                setSelectedBills(
                                                                    [
                                                                        ...selectedBills,
                                                                        bill.id,
                                                                    ],
                                                                );
                                                            } else {
                                                                setSelectedBills(
                                                                    selectedBills.filter(
                                                                        (id) =>
                                                                            id !==
                                                                            bill.id,
                                                                    ),
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(
                                                            bill.status,
                                                        )}
                                                        <div>
                                                            <div className="font-medium">
                                                                {
                                                                    bill.bill_title
                                                                }
                                                            </div>
                                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                                {bill.bill_description && (
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {
                                                                            bill.bill_description
                                                                        }
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center space-x-4">
                                                                    <span>
                                                                        {
                                                                            bill.bill_number
                                                                        }
                                                                    </span>
                                                                    {bill.category && (
                                                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                            {
                                                                                bill.category
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {(bill.biller ||
                                                                    bill.reference_number) && (
                                                                    <div className="flex items-center space-x-4 text-xs">
                                                                        {bill.biller && (
                                                                            <span className="flex items-center space-x-1">
                                                                                <span className="text-muted-foreground">
                                                                                    Biller:
                                                                                </span>
                                                                                <span>
                                                                                    {
                                                                                        bill
                                                                                            .biller
                                                                                            .name
                                                                                    }
                                                                                </span>
                                                                            </span>
                                                                        )}
                                                                        {bill
                                                                            .biller
                                                                            ?.account_number && (
                                                                            <span className="flex items-center space-x-1">
                                                                                <span className="text-muted-foreground">
                                                                                    Acc:
                                                                                </span>
                                                                                <span className="font-mono">
                                                                                    {
                                                                                        bill
                                                                                            .biller
                                                                                            .account_number
                                                                                    }
                                                                                </span>
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-right">
                                                        <div className="font-medium">
                                                            {formatCurrency(
                                                                bill.amount,
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Payment Date:{' '}
                                                            {formatDate(
                                                                bill.created_at,
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge
                                                            className={
                                                                statusColors[
                                                                    bill.status
                                                                ]
                                                            }
                                                        >
                                                            {bill.status}
                                                        </Badge>
                                                        <Badge
                                                            className={
                                                                priorityColors[
                                                                    bill
                                                                        .priority
                                                                ]
                                                            }
                                                        >
                                                            {bill.priority}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingBill(
                                                                    bill,
                                                                );
                                                                setFormData({
                                                                    bill_title:
                                                                        bill.bill_title,
                                                                    bill_description:
                                                                        bill.bill_description ||
                                                                        '',
                                                                    biller_id:
                                                                        bill.biller_id?.toString() ||
                                                                        'none',
                                                                    amount: bill.amount.toString(),
                                                                    due_date:
                                                                        bill.due_date,
                                                                    payment_date:
                                                                        bill.payment_date ||
                                                                        '',
                                                                    status: bill.status,
                                                                    payment_method:
                                                                        bill.payment_method ||
                                                                        '',
                                                                    reference_number:
                                                                        bill.reference_number ||
                                                                        '',
                                                                    notes:
                                                                        bill.notes ||
                                                                        '',
                                                                    category:
                                                                        bill.category ||
                                                                        '',
                                                                    priority:
                                                                        bill.priority,
                                                                    is_recurring:
                                                                        bill.is_recurring,
                                                                    recurring_frequency:
                                                                        bill.recurring_frequency ||
                                                                        '',
                                                                    next_due_date:
                                                                        bill.next_due_date ||
                                                                        '',
                                                                    reminder_date:
                                                                        bill.reminder_date ||
                                                                        '',
                                                                });
                                                                setShowEditDialog(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDeleteBill(
                                                                    bill,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing page {currentPage} of{' '}
                                            {totalPages}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">
                                                Show:
                                            </span>
                                            <Select
                                                value={perPage.toString()}
                                                onValueChange={(value) =>
                                                    setPerPage(parseInt(value))
                                                }
                                            >
                                                <SelectTrigger className="w-20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="10">
                                                        10
                                                    </SelectItem>
                                                    <SelectItem value="15">
                                                        15
                                                    </SelectItem>
                                                    <SelectItem value="25">
                                                        25
                                                    </SelectItem>
                                                    <SelectItem value="50">
                                                        50
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <span className="text-sm text-muted-foreground">
                                                per page
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                        >
                                            First
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setCurrentPage(
                                                    Math.max(
                                                        1,
                                                        currentPage - 1,
                                                    ),
                                                )
                                            }
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>

                                        {/* Page Numbers */}
                                        <div className="flex items-center space-x-1">
                                            {Array.from(
                                                {
                                                    length: Math.min(
                                                        5,
                                                        totalPages,
                                                    ),
                                                },
                                                (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (
                                                        currentPage <= 3
                                                    ) {
                                                        pageNum = i + 1;
                                                    } else if (
                                                        currentPage >=
                                                        totalPages - 2
                                                    ) {
                                                        pageNum =
                                                            totalPages - 4 + i;
                                                    } else {
                                                        pageNum =
                                                            currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={
                                                                currentPage ===
                                                                pageNum
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            size="sm"
                                                            onClick={() =>
                                                                setCurrentPage(
                                                                    pageNum,
                                                                )
                                                            }
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                },
                                            )}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setCurrentPage(
                                                    Math.min(
                                                        totalPages,
                                                        currentPage + 1,
                                                    ),
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                        >
                                            Next
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setCurrentPage(totalPages)
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                        >
                                            Last
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
                    <DialogHeader>
                        <DialogTitle>Edit Bill</DialogTitle>
                        <DialogDescription>
                            Update the bill payment information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="edit_bill_title">
                                    Bill Title *
                                </Label>
                                <Input
                                    id="edit_bill_title"
                                    value={formData.bill_title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            bill_title: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_biller_id">Biller</Label>
                                <Select
                                    value={formData.biller_id}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            biller_id: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a biller" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            No Biller
                                        </SelectItem>
                                        {billers.map((biller) => (
                                            <SelectItem
                                                key={biller.id}
                                                value={biller.id.toString()}
                                            >
                                                {biller.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="h-5">
                                    {formData.biller_id !== 'none' &&
                                        (() => {
                                            const selectedBiller = billers.find(
                                                (b) =>
                                                    b.id.toString() ===
                                                    formData.biller_id,
                                            );
                                            return (
                                                selectedBiller?.account_number && (
                                                    <div className="text-sm text-muted-foreground">
                                                        Account Number:{' '}
                                                        {
                                                            selectedBiller.account_number
                                                        }
                                                    </div>
                                                )
                                            );
                                        })()}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_amount">Amount *</Label>
                                <Input
                                    id="edit_amount"
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            amount: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_due_date">
                                    Due Date *
                                </Label>
                                <Input
                                    id="edit_due_date"
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            due_date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_payment_date">
                                    Payment Date
                                </Label>
                                <Input
                                    id="edit_payment_date"
                                    type="date"
                                    value={formData.payment_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            payment_date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_category">Category</Label>
                                <Input
                                    id="edit_category"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            category: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            priority: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="high">
                                            High
                                        </SelectItem>
                                        <SelectItem value="urgent">
                                            Urgent
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            status: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="paid">
                                            Paid
                                        </SelectItem>
                                        <SelectItem value="overdue">
                                            Overdue
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Cancelled
                                        </SelectItem>
                                        <SelectItem value="partial">
                                            Partial
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_payment_method">
                                    Payment Method
                                </Label>
                                <Input
                                    id="edit_payment_method"
                                    value={formData.payment_method}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            payment_method: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_bill_description">
                                Description
                            </Label>
                            <Textarea
                                id="edit_bill_description"
                                value={formData.bill_description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        bill_description: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_notes">Notes</Label>
                            <Textarea
                                id="edit_notes"
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        notes: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_reference_number">
                                Reference Number
                            </Label>
                            <Input
                                id="edit_reference_number"
                                value={formData.reference_number}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        reference_number: e.target.value,
                                    })
                                }
                                placeholder="Enter reference number"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowEditDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateBill}>Update Bill</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Bill Payment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "
                            {deletingBill?.bill_title}"? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteBill}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
