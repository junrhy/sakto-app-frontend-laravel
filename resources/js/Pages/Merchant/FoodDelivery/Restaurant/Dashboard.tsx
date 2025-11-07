import MerchantLayout from '@/Layouts/Merchant/MerchantLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Props extends PageProps {
    restaurantId?: number | null;
    error?: string;
}

interface RestaurantStats {
    total_orders: number;
    pending_orders: number;
    preparing_orders: number;
    ready_orders: number;
    delivered_orders: number;
    total_revenue: number;
}

interface FoodDeliveryOrder {
    id: number;
    order_reference: string;
    customer_name: string;
    total_amount: number;
    order_status: string;
    created_at: string;
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
        if (!restaurantId) return;
        setLoading(true);
        try {
            const response = await axios.get(`/food-delivery/restaurants/${restaurantId}`, {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                },
            });

            if (response.data && response.data.data) {
                const restaurantData = response.data.data;
                setStats({
                    total_orders: restaurantData.total_orders ?? 0,
                    pending_orders: restaurantData.pending_orders ?? 0,
                    preparing_orders: restaurantData.preparing_orders ?? 0,
                    ready_orders: restaurantData.ready_orders ?? 0,
                    delivered_orders: restaurantData.delivered_orders ?? 0,
                    total_revenue: restaurantData.total_revenue ?? 0,
                });
            }
        } catch (error: any) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentOrders = async () => {
        if (!restaurantId) return;
        try {
            const response = await axios.get('/food-delivery/orders/list', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                    restaurant_id: restaurantId,
                    per_page: 5,
                },
            });

            if (response.data.success && response.data.data) {
                setRecentOrders(response.data.data);
            }
        } catch (error: any) {
            console.error('Failed to fetch recent orders:', error);
        }
    };

    return (
        <MerchantLayout
            auth={{ user: auth.user }}
            title="Restaurant Dashboard"
            header={<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Restaurant Dashboard</h2>}
        >
            <Head title="Restaurant Dashboard" />

            <div className="space-y-6 p-6">
                {error || !restaurantId ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No Restaurant Found</h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {error || 'This dashboard is for restaurant owners to view their restaurant statistics and manage orders. Please create a restaurant first to access the dashboard.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <StatCard title="Total Orders" value={stats.total_orders} loading={loading} color="indigo" />
                            <StatCard title="Pending" value={stats.pending_orders} loading={loading} color="amber" />
                            <StatCard title="Preparing" value={stats.preparing_orders} loading={loading} color="sky" />
                            <StatCard title="Delivered" value={stats.delivered_orders} loading={loading} color="emerald" />
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:col-span-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Latest activity from your restaurant</p>

                                <div className="mt-4 space-y-4">
                                    {recentOrders.length === 0 ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet.</p>
                                    ) : (
                                        recentOrders.map((order) => (
                                            <div key={order.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">#{order.order_reference}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer_name}</p>
                                                    </div>
                                                    <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                                        <p>₱{Number(order.total_amount).toFixed(2)}</p>
                                                        <p>{order.order_status}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Revenue Summary</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    ₱{stats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    All-time revenue
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </MerchantLayout>
    );
}

interface StatCardProps {
    title: string;
    value: number;
    loading: boolean;
    color: 'indigo' | 'amber' | 'sky' | 'emerald';
}

function StatCard({ title, value, loading, color }: StatCardProps) {
    const colorClasses: Record<StatCardProps['color'], string> = {
        indigo: 'from-indigo-500 to-indigo-600',
        amber: 'from-amber-500 to-amber-600',
        sky: 'from-sky-500 to-sky-600',
        emerald: 'from-emerald-500 to-emerald-600',
    };

    return (
        <div className={`rounded-xl bg-gradient-to-br ${colorClasses[color]} p-[1px] shadow-lg`}>
            <div className="rounded-xl bg-white p-5 dark:bg-gray-900">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {loading ? '...' : value.toLocaleString()}
                </p>
            </div>
        </div>
    );
}

