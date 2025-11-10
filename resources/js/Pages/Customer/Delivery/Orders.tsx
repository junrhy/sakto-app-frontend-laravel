import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { PackageIcon, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import OrderCard from './components/OrderCard';
import { FoodDeliveryOrder } from './types';

interface Props extends PageProps {
    orders?: FoodDeliveryOrder[];
}

export default function FoodDeliveryOrders({
    auth,
    orders: initialOrders,
}: Props) {
    const [orders, setOrders] = useState<FoodDeliveryOrder[]>(
        initialOrders || [],
    );
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, search]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params: any = {
                client_identifier: (auth.user as any)?.identifier,
            };

            // Filter by customer_id if available, otherwise filter by email or phone
            if (auth.user?.id) {
                params.customer_id = auth.user.id;
            } else if (auth.user?.email) {
                // If no customer_id, we'll need to filter by email in the backend
                // For now, let's just not filter by customer_id and let the backend return all orders
                // The backend should handle this, but we can also add email/phone matching
            }

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
                let orders = response.data.data || [];

                // If customer_id filter didn't work, filter by email or phone on frontend
                if (auth.user?.id && orders.length === 0) {
                    // Try without customer_id filter
                    const paramsWithoutCustomerId = { ...params };
                    delete paramsWithoutCustomerId.customer_id;
                    const response2 = await axios.get(
                        '/food-delivery/orders/list',
                        { params: paramsWithoutCustomerId },
                    );
                    if (response2.data.success) {
                        orders = (response2.data.data || []).filter(
                            (order: FoodDeliveryOrder) => {
                                // Match by email or phone if customer_id is not set
                                return (
                                    order.customer_email === auth.user?.email ||
                                    order.customer_phone ===
                                        (auth.user as any)?.contact_number
                                );
                            },
                        );
                    }
                }

                setOrders(orders);
            }
        } catch (error: any) {
            console.error('Failed to load orders:', error);
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
            case 'assigned':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                            <PackageIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                                My Orders
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                View your food delivery order history
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="My Orders" />

            <div className="space-y-6 p-6">
                {/* Search and Filters */}
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

                {/* Orders List */}
                {loading ? (
                    <div className="py-12 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
                        <p className="mt-2 text-gray-500">Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <PackageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-gray-500">No orders found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                formatCurrency={formatCurrency}
                                getStatusColor={getStatusColor}
                                formatStatus={formatStatus}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
