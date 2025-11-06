import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { TrendingUpIcon, DollarSignIcon, PackageIcon, UtensilsIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { FoodDeliveryOrder, FoodDeliveryRestaurant } from '../types';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {}

export default function AdminAnalytics({ auth }: Props) {
    const [stats, setStats] = useState({
        total_orders: 0,
        total_revenue: 0,
        total_restaurants: 0,
        total_drivers: 0,
        delivered_orders: 0,
        pending_orders: 0,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [ordersRes, restaurantsRes, driversRes] = await Promise.all([
                axios.get('/food-delivery/orders/list', {
                    params: { client_identifier: (auth.user as any)?.identifier },
                }),
                axios.get('/food-delivery/restaurants/list', {
                    params: { client_identifier: (auth.user as any)?.identifier },
                }),
                axios.get('/food-delivery/drivers/list', {
                    params: { client_identifier: (auth.user as any)?.identifier },
                }),
            ]);

            const orders = ordersRes.data.success ? ordersRes.data.data || [] : [];
            const restaurants = restaurantsRes.data.success ? restaurantsRes.data.data || [] : [];
            const drivers = driversRes.data.success ? driversRes.data.data || [] : [];

            setStats({
                total_orders: orders.length,
                total_revenue: orders
                    .filter((o: FoodDeliveryOrder) => o.order_status === 'delivered' && o.payment_status === 'paid')
                    .reduce((sum: number, o: FoodDeliveryOrder) => sum + o.total_amount, 0),
                total_restaurants: restaurants.length,
                total_drivers: drivers.length,
                delivered_orders: orders.filter((o: FoodDeliveryOrder) => o.order_status === 'delivered').length,
                pending_orders: orders.filter((o: FoodDeliveryOrder) => o.order_status === 'pending').length,
            });
        } catch (error: any) {
            toast.error('Failed to load analytics');
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                        <TrendingUpIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                            Analytics Dashboard
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Overview of food delivery platform performance
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Analytics Dashboard" />

            <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_orders}</p>
                                </div>
                                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                                    <PackageIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(stats.total_revenue)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                                    <DollarSignIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Restaurants</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_restaurants}</p>
                                </div>
                                <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
                                    <UtensilsIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Drivers</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_drivers}</p>
                                </div>
                                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                                    <TrendingUpIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Delivered</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{stats.delivered_orders}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Pending</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{stats.pending_orders}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

