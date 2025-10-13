import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
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
import { formatCurrency } from '@/lib/utils';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Archive,
    BarChart3,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    Filter,
    Package,
    Plus,
    SearchIcon,
    Trash2,
    Truck,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    order_items: Array<{
        product_id: number;
        variant_id?: number;
        attributes?: Record<string, string>;
        name: string;
        quantity: number;
        price: number;
    }>;
    subtotal: number;
    tax_amount: number;
    shipping_fee: number;
    discount_amount: number;
    total_amount: number;
    order_status:
        | 'pending'
        | 'confirmed'
        | 'processing'
        | 'shipped'
        | 'delivered'
        | 'cancelled'
        | 'refunded';
    payment_status:
        | 'pending'
        | 'paid'
        | 'failed'
        | 'refunded'
        | 'partially_refunded';
    payment_method?:
        | 'cash'
        | 'card'
        | 'bank_transfer'
        | 'digital_wallet'
        | 'cod';
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    currency: {
        symbol: string;
        code: string;
    };
    errors?: {
        [key: string]: string;
    };
    auth: PageProps['auth'] & {
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        } | null;
    };
}

export default function Index({ auth, orders, currency, errors }: Props) {
    console.log(auth);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [paymentStatusFilter, setPaymentStatusFilter] =
        useState<string>('all');
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

    // Ensure orders has proper structure with defaults
    const safeOrders = useMemo(() => {
        if (!orders || typeof orders !== 'object') {
            return {
                data: [],
                current_page: 1,
                last_page: 1,
                per_page: 15,
                total: 0,
            };
        }
        return {
            data: orders.data || [],
            current_page: orders.current_page || 1,
            last_page: orders.last_page || 1,
            per_page: orders.per_page || 15,
            total: orders.total || 0,
        };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return safeOrders.data.filter((order) => {
            const matchesSearch =
                order.order_number
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                order.customer_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                order.customer_email
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === 'all' || order.order_status === statusFilter;
            const matchesPaymentStatus =
                paymentStatusFilter === 'all' ||
                order.payment_status === paymentStatusFilter;

            return matchesSearch && matchesStatus && matchesPaymentStatus;
        });
    }, [safeOrders.data, searchTerm, statusFilter, paymentStatusFilter]);

    const toggleSelect = (orderId: number) => {
        setSelectedOrders((prev) =>
            prev.includes(orderId)
                ? prev.filter((id) => id !== orderId)
                : [...prev, orderId],
        );
    };

    const toggleSelectAll = () => {
        if (selectedOrders.length === filteredOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(filteredOrders.map((order) => order.id));
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/50',
                icon: Clock,
            },
            confirmed: {
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700/50',
                icon: CheckCircle,
            },
            processing: {
                color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700/50',
                icon: Package,
            },
            shipped: {
                color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50',
                icon: Truck,
            },
            delivered: {
                color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700/50',
                icon: CheckCircle,
            },
            cancelled: {
                color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700/50',
                icon: XCircle,
            },
            refunded: {
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 border-gray-200 dark:border-gray-600/50',
                icon: Archive,
            },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge className={`${config.color} border`}>
                <Icon className="mr-1 h-3 w-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/50',
                icon: Clock,
            },
            paid: {
                color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700/50',
                icon: CheckCircle,
            },
            failed: {
                color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700/50',
                icon: XCircle,
            },
            refunded: {
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 border-gray-200 dark:border-gray-600/50',
                icon: Archive,
            },
            partially_refunded: {
                color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-700/50',
                icon: Archive,
            },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge className={`${config.color} border`}>
                <Icon className="mr-1 h-3 w-3" />
                {status.replace('_', ' ').charAt(0).toUpperCase() +
                    status.replace('_', ' ').slice(1)}
            </Badge>
        );
    };

    const handleDelete = (orderId: number) => {
        if (confirm('Are you sure you want to delete this order?')) {
            router.delete(route('product-orders.destroy', orderId));
        }
    };

    const handleBulkDelete = () => {
        if (selectedOrders.length === 0) {
            alert('Please select orders to delete');
            return;
        }

        if (
            confirm(
                `Are you sure you want to delete ${selectedOrders.length} orders?`,
            )
        ) {
            selectedOrders.forEach((orderId) => {
                router.delete(route('product-orders.destroy', orderId));
            });
            setSelectedOrders([]);
        }
    };

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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Product Orders
                </h2>
            }
        >
            <Head title="Product Orders" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Error Messages */}
                    {errors && Object.keys(errors).length > 0 && (
                        <div className="mb-6">
                            {Object.entries(errors).map(([key, message]) => (
                                <div
                                    key={key}
                                    className="mb-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                                >
                                    {message}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Product Orders
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage your product orders and track their
                                status
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            <Link href={route('product-orders.statistics')}>
                                <Button variant="outline">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Statistics
                                </Button>
                            </Link>
                            <Link href={route('products.index')}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    View Products
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Filter className="mr-2 h-4 w-4" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <Input
                                        placeholder="Search orders..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Order Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Statuses
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="confirmed">
                                            Confirmed
                                        </SelectItem>
                                        <SelectItem value="processing">
                                            Processing
                                        </SelectItem>
                                        <SelectItem value="shipped">
                                            Shipped
                                        </SelectItem>
                                        <SelectItem value="delivered">
                                            Delivered
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Cancelled
                                        </SelectItem>
                                        <SelectItem value="refunded">
                                            Refunded
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={paymentStatusFilter}
                                    onValueChange={setPaymentStatusFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Payment Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Payment Statuses
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="paid">
                                            Paid
                                        </SelectItem>
                                        <SelectItem value="failed">
                                            Failed
                                        </SelectItem>
                                        <SelectItem value="refunded">
                                            Refunded
                                        </SelectItem>
                                        <SelectItem value="partially_refunded">
                                            Partially Refunded
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setPaymentStatusFilter('all');
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Orders Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>
                                    Orders ({filteredOrders.length})
                                </CardTitle>
                                {canDelete && selectedOrders.length > 0 && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleBulkDelete}
                                    >
                                        Delete Selected ({selectedOrders.length}
                                        )
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedOrders.length ===
                                                        filteredOrders.length &&
                                                    filteredOrders.length > 0
                                                }
                                                onChange={toggleSelectAll}
                                                className="rounded"
                                            />
                                        </TableHead>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Order Status</TableHead>
                                        <TableHead>Payment Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.includes(
                                                        order.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleSelect(order.id)
                                                    }
                                                    className="rounded"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <Link
                                                    href={route(
                                                        'product-orders.show',
                                                        order.id,
                                                    )}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    {order.order_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {order.customer_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {order.customer_email}
                                                    </div>
                                                    {order.customer_phone && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {
                                                                order.customer_phone
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                                    {order.order_items.length}{' '}
                                                    item
                                                    {order.order_items
                                                        .length !== 1
                                                        ? 's'
                                                        : ''}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {order.order_items
                                                        .map((item) => {
                                                            let displayName =
                                                                item.name;
                                                            if (
                                                                item.variant_id &&
                                                                item.attributes
                                                            ) {
                                                                const variantDetails =
                                                                    Object.entries(
                                                                        item.attributes,
                                                                    )
                                                                        .map(
                                                                            ([
                                                                                key,
                                                                                value,
                                                                            ]) =>
                                                                                `${key}: ${value}`,
                                                                        )
                                                                        .join(
                                                                            ', ',
                                                                        );
                                                                displayName += ` (${variantDetails})`;
                                                            }
                                                            return displayName;
                                                        })
                                                        .join(', ')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(
                                                        order.total_amount,
                                                        currency.symbol,
                                                    )}
                                                </div>
                                                {order.discount_amount > 0 && (
                                                    <div className="text-xs text-green-600 dark:text-green-400">
                                                        -
                                                        {formatCurrency(
                                                            order.discount_amount,
                                                            currency.symbol,
                                                        )}{' '}
                                                        discount
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(
                                                    order.order_status,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getPaymentStatusBadge(
                                                    order.payment_status,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                                    {format(
                                                        new Date(
                                                            order.created_at,
                                                        ),
                                                        'MMM dd, yyyy',
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {format(
                                                        new Date(
                                                            order.created_at,
                                                        ),
                                                        'HH:mm',
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <span className="sr-only">
                                                                Open menu
                                                            </span>
                                                            <span className="h-4 w-4">
                                                                ⋮
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'product-orders.show',
                                                                    order.id,
                                                                )}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {canEdit && (
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'product-orders.edit',
                                                                        order.id,
                                                                    )}
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit Order
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canDelete && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        order.id,
                                                                    )
                                                                }
                                                                className="text-red-600 dark:text-red-400"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Order
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {filteredOrders.length === 0 && (
                                <div className="py-8 text-center">
                                    <Package className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
                                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                                        No orders found
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {searchTerm ||
                                        statusFilter ||
                                        paymentStatusFilter
                                            ? 'Try adjusting your filters to see more results.'
                                            : 'Get started by creating your first product order.'}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    {safeOrders.last_page > 1 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex space-x-2">
                                {Array.from(
                                    { length: safeOrders.last_page },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <Button
                                        key={page}
                                        variant={
                                            page === safeOrders.current_page
                                                ? 'default'
                                                : 'outline'
                                        }
                                        onClick={() =>
                                            router.get(
                                                route('product-orders.index'),
                                                { page },
                                            )
                                        }
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
