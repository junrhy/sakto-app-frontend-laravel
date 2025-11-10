import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/Components/ui/select';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/Components/ui/table';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Badge } from '@/Components/ui/badge';
import { useMemo } from 'react';
import { ArrowLeft, Receipt } from 'lucide-react';

interface OrderItem {
    name: string;
    quantity: number;
    price: number | string;
    status?: string;
}

interface ProductOrder {
    id: number | string;
    order_number: string;
    total_amount: number | string;
    order_status: string;
    payment_status: string;
    created_at: string;
    order_items?: OrderItem[];
}

interface Meta {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    next_page_url?: string | null;
    prev_page_url?: string | null;
}

interface Filters {
    status?: string;
    payment_status?: string;
    search?: string;
    page?: number;
    per_page?: number;
}

interface Props extends PageProps {
    community: {
        id: number;
        name: string;
        slug?: string | null;
        identifier?: string | null;
        project_identifier?: string | null;
        app_currency?: {
            symbol?: string;
            decimal_separator?: string;
            thousands_separator?: string;
        } | null;
    };
    orders: ProductOrder[];
    meta?: Meta | null;
    filters: Filters;
    project?: string;
}

const formatPrice = (
    value: number | string,
    currency?: {
        symbol?: string;
        decimal_separator?: string;
        thousands_separator?: string;
    } | null,
): string => {
    const symbol = currency?.symbol ?? '₱';
    const decimalSeparator = currency?.decimal_separator ?? '.';
    const thousandsSeparator = currency?.thousands_separator ?? ',';

    const numeric =
        typeof value === 'string' ? Number.parseFloat(value) : Number(value);

    if (Number.isNaN(numeric)) {
        return `${symbol}0${decimalSeparator}00`;
    }

    const [whole, fraction = '00'] = numeric.toFixed(2).split('.');
    const formattedWhole = whole.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        thousandsSeparator,
    );

    return `${symbol}${formattedWhole}${decimalSeparator}${fraction}`;
};

const statusBadgeVariant = (status: string): string => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'confirmed':
        case 'paid':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'processing':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'shipped':
            return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
        case 'delivered':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'cancelled':
        case 'failed':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        case 'refunded':
        case 'partially_refunded':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
};

export default function MarketplaceOrders({
    auth,
    community,
    orders,
    meta,
    filters,
    project,
}: Props) {
    const ownerIdentifier = community.slug || community.identifier || community.id;
    const projectIdentifier =
        project ?? community.project_identifier ?? 'community';

    const {
        data,
        setData,
        get,
        processing,
    } = useForm({
        status: filters.status ?? '',
        payment_status: filters.payment_status ?? '',
        search: filters.search ?? '',
        per_page: filters.per_page ?? 10,
    });

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get(
            route('customer.projects.marketplace.orders', {
                project: projectIdentifier,
                owner: ownerIdentifier,
            }),
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                data,
            },
        );
    };

    const onChangePage = (page: number) => {
        get(
            route('customer.projects.marketplace.orders', {
                project: projectIdentifier,
                owner: ownerIdentifier,
            }),
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                data: {
                    ...data,
                    page,
                },
            },
        );
    };

    const paginationLabel = useMemo(() => {
        if (!meta?.total) {
            return '';
        }

        const currentPage = meta.current_page ?? 1;
        const perPage = meta.per_page ?? data.per_page ?? 10;
        const start = (currentPage - 1) * perPage + 1;
        const end = Math.min(start + perPage - 1, meta.total);

        return `Showing ${start}-${end} of ${meta.total} orders`;
    }, [meta, data.per_page]);

    return (
        <CustomerLayout
            auth={auth}
            title="Marketplace Orders"
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        My Marketplace Orders
                    </h2>
                    <Button asChild variant="outline" size="sm">
                    <Link
                        href={route('customer.projects.marketplace.index', {
                            project: projectIdentifier,
                            owner: ownerIdentifier,
                        })}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Marketplace
                        </Link>
                    </Button>
                </div>
            }
            sidebarSections={[
                { id: 'filters', label: 'Filters' },
                { id: 'orders', label: 'Orders' },
            ]}
        >
            <Head title={`Marketplace Orders • ${community.name}`} />

            <div className="space-y-6">
                <Card id="filters" className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                            Filter Orders
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                            Narrow down orders by status, payment status, or reference number.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                    Order Status
                                </label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) => setData('status', value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                    Payment Status
                                </label>
                                <Select
                                    value={data.payment_status}
                                    onValueChange={(value) =>
                                        setData('payment_status', value === 'all' ? '' : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All payments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Payments</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                        <SelectItem value="partially_refunded">Partial Refund</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-2">
                                <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                    Search
                                </label>
                                <Input
                                    value={data.search}
                                    onChange={(event) => setData('search', event.target.value)}
                                    placeholder="Search by order number or product name"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                    Per Page
                                </label>
                                <Select
                                    value={String(data.per_page)}
                                    onValueChange={(value) => setData('per_page', Number(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Filtering...' : 'Apply Filters'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <section id="orders">
                    <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                    Orders
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                    Keep track of all your purchases within this community.
                                </CardDescription>
                            </div>
                            {paginationLabel && (
                                <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    {paginationLabel}
                                </span>
                            )}
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            {orders.length === 0 ? (
                                <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                                    No orders yet. Once you purchase items, they will appear here.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 dark:bg-gray-900">
                                            <TableHead className="text-gray-900 dark:text-gray-100">
                                                Order
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-gray-100">
                                                Date
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-gray-100">
                                                Total
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-gray-100">
                                                Order Status
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-gray-100">
                                                Payment Status
                                            </TableHead>
                                            <TableHead className="text-right text-gray-900 dark:text-gray-100">
                                                Items
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow
                                                key={order.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-900/70"
                                            >
                                                <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <Receipt className="h-4 w-4 text-gray-400" />
                                                        <span>{order.order_number}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">
                                                    {new Date(order.created_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-gray-900 dark:text-gray-100">
                                                    {formatPrice(order.total_amount, community.app_currency)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusBadgeVariant(order.order_status)}>
                                                        {order.order_status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusBadgeVariant(order.payment_status)}>
                                                        {order.payment_status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-right text-gray-600 dark:text-gray-400">
                                                    {order.order_items?.length ?? 0}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {meta && (meta.next_page_url || meta.prev_page_url) && (
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                        <div>
                            Page {meta.current_page ?? 1} of {meta.last_page ?? 1}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!meta.prev_page_url}
                                onClick={() =>
                                    onChangePage(Math.max((meta.current_page ?? 1) - 1, 1))
                                }
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!meta.next_page_url}
                                onClick={() =>
                                    onChangePage(Math.min((meta.current_page ?? 1) + 1, meta.last_page ?? 1))
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}


