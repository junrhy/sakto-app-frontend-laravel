import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { UtensilsIcon, PackageIcon, DollarSignIcon, TrendingUpIcon, ClockIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { FoodDeliveryOrder, RestaurantStats } from '../types';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {
    restaurantId?: number | null;
    error?: string;
}

export default function RestaurantDashboard({ auth, restaurantId: initialRestaurantId, error }: Props) {
    const [restaurantId, setRestaurantId] = useState<number | null>(initialRestaurantId || null);
    const [stats, setStats] = useState<RestaurantStats>({
        total_orders: 0,
        pending_orders: 0,
        preparing_orders: 0,
        ready_orders: 0,
        delivered_orders: 0,
        total_revenue: 0,
    });
    const [recentOrders, setRecentOrders] = useState<FoodDeliveryOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingRestaurant, setFetchingRestaurant] = useState(false);

    // Fetch restaurant if not provided by controller
    useEffect(() => {
        if (!restaurantId && !error && !fetchingRestaurant) {
            fetchRestaurant();
        }
    }, []);

    useEffect(() => {
        if (restaurantId) {
            fetchStats();
            fetchRecentOrders();
        }
    }, [restaurantId]);

    const fetchRestaurant = async () => {
        setFetchingRestaurant(true);
        try {
            // Try to get active restaurants first
            const response = await axios.get('/food-delivery/restaurants/list', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                    status: 'active',
                },
            });
            
            if (response.data.success && response.data.data && response.data.data.length > 0) {
                setRestaurantId(response.data.data[0].id);
                return;
            }

            // If no active restaurants, try with status=all
            const response2 = await axios.get('/food-delivery/restaurants/list', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                    status: 'all',
                },
            });
            
            if (response2.data.success && response2.data.data && response2.data.data.length > 0) {
                setRestaurantId(response2.data.data[0].id);
            }
        } catch (error: any) {
            console.error('Failed to fetch restaurant:', error);
        } finally {
            setFetchingRestaurant(false);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/food-delivery/orders/list', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                    restaurant_id: restaurantId,
                },
            });
            if (response.data.success) {
                const orders = response.data.data || [];
                const statsData: RestaurantStats = {
                    total_orders: orders.length,
                    pending_orders: orders.filter((o: FoodDeliveryOrder) => o.order_status === 'pending').length,
                    preparing_orders: orders.filter((o: FoodDeliveryOrder) => o.order_status === 'preparing').length,
                    ready_orders: orders.filter((o: FoodDeliveryOrder) => o.order_status === 'ready').length,
                    delivered_orders: orders.filter((o: FoodDeliveryOrder) => o.order_status === 'delivered').length,
                    total_revenue: orders
                        .filter((o: FoodDeliveryOrder) => o.order_status === 'delivered' && o.payment_status === 'paid')
                        .reduce((sum: number, o: FoodDeliveryOrder) => sum + o.total_amount, 0),
                };
                setStats(statsData);
            }
        } catch (error: any) {
            toast.error('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentOrders = async () => {
        try {
            const response = await axios.get('/food-delivery/orders/list', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                    restaurant_id: restaurantId,
                    sort_by: 'created_at',
                    sort_order: 'desc',
                },
            });
            if (response.data.success) {
                setRecentOrders((response.data.data || []).slice(0, 5));
            }
        } catch (error: any) {
            toast.error('Failed to load recent orders');
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
            case 'out_for_delivery': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                            <UtensilsIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                                Restaurant Dashboard
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Overview of your restaurant operations
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.visit('/food-delivery/restaurant/orders')}>
                            View All Orders
                        </Button>
                        <Button variant="outline" onClick={() => router.visit('/food-delivery/restaurant/menu')}>
                            Manage Menu
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Restaurant Dashboard" />

            <div className="space-y-6 p-6">
                {error || !restaurantId ? (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center py-8">
                                <UtensilsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    No Restaurant Found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {error || 'This dashboard is for restaurant owners to view their restaurant statistics and manage orders. Please create a restaurant first to access the dashboard.'}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button onClick={() => router.visit('/food-delivery/admin/restaurants')}>
                                        Create Restaurant
                                    </Button>
                                    <Button variant="outline" onClick={() => router.visit('/food-delivery')}>
                                        Browse Restaurants
                                    </Button>
                                </div>
                                <div className="mt-8 text-left max-w-2xl mx-auto">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">What is the Restaurant Dashboard?</h4>
                                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span><strong>Statistics Overview:</strong> View total orders, pending orders, in-progress orders, and total revenue</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span><strong>Recent Orders:</strong> See the last 5 orders placed at your restaurant</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span><strong>Quick Actions:</strong> Access order management and menu management directly from the dashboard</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Stats Cards */}
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
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending_orders}</p>
                                </div>
                                <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/30">
                                    <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.preparing_orders + stats.ready_orders}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                                    <UtensilsIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                </div>

                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Orders</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => router.visit('/food-delivery/restaurant/orders')}>
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
                            </div>
                        ) : recentOrders.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No recent orders</p>
                        ) : (
                            <div className="space-y-4">
                                {recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                        onClick={() => router.visit(`/food-delivery/order/${order.id}`)}
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                Order #{order.order_reference}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {order.customer_name} • {formatCurrency(order.total_amount)}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                {new Date(order.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                                            {formatStatus(order.order_status)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

