import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
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
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { PackageIcon, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DriverAssignmentDialog from '../../Customer/FoodDelivery/components/DriverAssignmentDialog';
import OrderStatusDialog from '../../Customer/FoodDelivery/components/OrderStatusDialog';
import { FoodDeliveryOrder } from '../types';

interface Props extends PageProps {
    orders?: FoodDeliveryOrder[];
}

export default function AdminOrders({ auth, orders: initialOrders }: Props) {
    const [orders, setOrders] = useState<FoodDeliveryOrder[]>(
        initialOrders || [],
    );
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [driverDialogOpen, setDriverDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] =
        useState<FoodDeliveryOrder | null>(null);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, search]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params: any = {
                client_identifier: (auth.user as any)?.identifier,
            };
            if (statusFilter !== 'all') {
                params.order_status = statusFilter;
            }
            if (search) {
                params.search = search;
            }

            const response = await axios.get('/food-delivery/orders/list', {
                params,
            });
            if (response.data.success) {
                setOrders(response.data.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        let currency: {
            symbol: string;
            thousands_separator?: string;
            decimal_separator?: string;
        };
        const appCurrency = (auth.user as any)?.app_currency;
        if (appCurrency) {
            if (typeof appCurrency === 'string') {
                currency = JSON.parse(appCurrency);
            } else {
                currency = appCurrency;
            }
        } else {
            currency = {
                symbol: '₱',
                thousands_separator: ',',
                decimal_separator: '.',
            };
        }
        return `${currency.symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'accepted':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'preparing':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'ready':
                return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
            case 'out_for_delivery':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const formatStatus = (status: string) => {
        return status
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const getNextStatuses = (currentStatus: string): string[] => {
        const statusFlow: Record<string, string[]> = {
            pending: ['accepted', 'cancelled'],
            accepted: ['preparing', 'cancelled'],
            preparing: ['ready', 'cancelled'],
            ready: ['assigned', 'cancelled'],
            assigned: ['out_for_delivery', 'cancelled'],
            out_for_delivery: ['delivered', 'cancelled'],
            delivered: [],
            cancelled: [],
        };
        return statusFlow[currentStatus] || [];
    };

    const handleStatusUpdate = () => {
        fetchOrders();
        setSelectedOrder(null);
    };

    const handleDriverAssignment = () => {
        fetchOrders();
        setSelectedOrder(null);
    };

    const openStatusDialog = (order: FoodDeliveryOrder) => {
        setSelectedOrder(order);
        setStatusDialogOpen(true);
    };

    const openDriverDialog = (order: FoodDeliveryOrder) => {
        setSelectedOrder(order);
        setDriverDialogOpen(true);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                        <PackageIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                            Orders Management
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            View and manage all orders across all restaurants
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Orders Management" />

            <div className="space-y-6 p-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search orders..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="accepted">
                                        Accepted
                                    </SelectItem>
                                    <SelectItem value="preparing">
                                        Preparing
                                    </SelectItem>
                                    <SelectItem value="ready">Ready</SelectItem>
                                    <SelectItem value="out_for_delivery">
                                        Out for Delivery
                                    </SelectItem>
                                    <SelectItem value="delivered">
                                        Delivered
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="py-12 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Order #
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Restaurant
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Customer
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Amount
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Date
                                        </TableHead>
                                        <TableHead className="text-right text-gray-900 dark:text-white">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow
                                            key={order.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <button
                                                    onClick={() =>
                                                        router.visit(
                                                            `/food-delivery/order/${order.id}`,
                                                        )
                                                    }
                                                    className="text-blue-600 hover:underline dark:text-blue-400"
                                                >
                                                    {order.order_reference}
                                                </button>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {order.restaurant?.name ||
                                                    'N/A'}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {order.customer_name}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {formatCurrency(
                                                    order.total_amount,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.order_status)}`}
                                                >
                                                    {formatStatus(
                                                        order.order_status,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {new Date(
                                                    order.created_at,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right text-gray-900 dark:text-white">
                                                <div className="flex items-center justify-end gap-2">
                                                    {getNextStatuses(
                                                        order.order_status,
                                                    ).length > 0 && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                openStatusDialog(
                                                                    order,
                                                                )
                                                            }
                                                        >
                                                            Update Status
                                                        </Button>
                                                    )}
                                                    {order.order_status ===
                                                        'ready' &&
                                                        !order.driver_id && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    openDriverDialog(
                                                                        order,
                                                                    )
                                                                }
                                                            >
                                                                Assign Driver
                                                            </Button>
                                                        )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.visit(
                                                                `/food-delivery/order/${order.id}`,
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>

            {selectedOrder && (
                <>
                    <OrderStatusDialog
                        order={selectedOrder}
                        open={statusDialogOpen}
                        onOpenChange={setStatusDialogOpen}
                        onSuccess={handleStatusUpdate}
                        clientIdentifier={(auth.user as any)?.identifier}
                    />
                    <DriverAssignmentDialog
                        order={selectedOrder}
                        open={driverDialogOpen}
                        onOpenChange={setDriverDialogOpen}
                        onSuccess={handleDriverAssignment}
                        clientIdentifier={(auth.user as any)?.identifier}
                    />
                </>
            )}
        </AuthenticatedLayout>
    );
}
