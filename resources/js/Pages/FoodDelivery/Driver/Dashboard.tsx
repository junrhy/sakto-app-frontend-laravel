import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { TruckIcon, PackageIcon, ClockIcon, MapPinIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { FoodDeliveryOrder, FoodDeliveryDriver } from '../types';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {
    driverId?: number;
}

export default function DriverDashboard({ auth, driverId }: Props) {
    const [driver, setDriver] = useState<FoodDeliveryDriver | null>(null);
    const [activeOrders, setActiveOrders] = useState<FoodDeliveryOrder[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDriverData();
        fetchActiveOrders();
    }, [driverId]);

    const fetchDriverData = async () => {
        if (!driverId) return;
        try {
            const response = await axios.get(`/food-delivery/drivers/${driverId}`, {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                },
            });
            if (response.data.success) {
                setDriver(response.data.data);
            }
        } catch (error: any) {
            toast.error('Failed to load driver data');
        }
    };

    const fetchActiveOrders = async () => {
        if (!driverId) return;
        setLoading(true);
        try {
            const response = await axios.get('/food-delivery/orders/list', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                    driver_id: driverId,
                    order_status: 'out_for_delivery',
                },
            });
            if (response.data.success) {
                setActiveOrders(response.data.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load active orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: number, status: string) => {
        try {
            const response = await axios.put(`/food-delivery/orders/${orderId}/update-status`, {
                order_status: status,
                client_identifier: (auth.user as any)?.identifier,
            });
            if (response.data.success) {
                toast.success('Order status updated');
                fetchActiveOrders();
            }
        } catch (error: any) {
            toast.error('Failed to update order status');
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                        <TruckIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                            Driver Dashboard
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {driver?.name || 'Manage your deliveries'}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Driver Dashboard" />

            <div className="space-y-6 p-6">
                {driver && (
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                                    <p className="font-medium text-gray-900 dark:text-white capitalize">{driver.status}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{driver.total_deliveries}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {driver.rating ? driver.rating.toFixed(1) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Active Deliveries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
                            </div>
                        ) : activeOrders.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No active deliveries</p>
                        ) : (
                            <div className="space-y-4">
                                {activeOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    Order #{order.order_reference}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {order.restaurant?.name} • {formatCurrency(order.total_amount)}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    <MapPinIcon className="h-4 w-4 inline mr-1" />
                                                    {order.customer_address}
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                            >
                                                Mark as Delivered
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

