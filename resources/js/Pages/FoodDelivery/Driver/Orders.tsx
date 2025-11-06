import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { PackageIcon, SearchIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { FoodDeliveryOrder } from '../types';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {
    driverId?: number;
    orders?: FoodDeliveryOrder[];
}

export default function DriverOrders({ auth, driverId, orders: initialOrders }: Props) {
    const [orders, setOrders] = useState<FoodDeliveryOrder[]>(initialOrders || []);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [search, driverId]);

    const fetchOrders = async () => {
        if (!driverId) return;
        setLoading(true);
        try {
            const params: any = {
                client_identifier: (auth.user as any)?.identifier,
                driver_id: driverId,
            };
            if (search) {
                params.search = search;
            }

            const response = await axios.get('/food-delivery/orders/list', { params });
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
        let currency: { symbol: string; thousands_separator?: string; decimal_separator?: string };
        const appCurrency = (auth.user as any)?.app_currency;
        if (appCurrency) {
            if (typeof appCurrency === 'string') {
                currency = JSON.parse(appCurrency);
            } else {
                currency = appCurrency;
            }
        } else {
            currency = { symbol: '₱', thousands_separator: ',', decimal_separator: '.' };
        }
        return `${currency.symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'accepted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'preparing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'ready': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
            case 'assigned': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'out_for_delivery': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
                            My Orders
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            View all your assigned orders
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Driver Orders" />

            <div className="space-y-6 p-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search orders..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                                        <TableHead className="text-gray-900 dark:text-white">Order #</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Restaurant</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Customer</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Amount</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Date</TableHead>
                                        <TableHead className="text-right text-gray-900 dark:text-white">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <button
                                                    onClick={() => router.visit(`/food-delivery/order/${order.id}`)}
                                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    {order.order_reference}
                                                </button>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {order.restaurant?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">{order.customer_name}</TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {formatCurrency(order.total_amount)}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                                                    {formatStatus(order.order_status)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right text-gray-900 dark:text-white">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.visit(`/food-delivery/order/${order.id}`)}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

