import EmployeeLayout from '@/Layouts/Employee/EmployeeLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Props extends PageProps {
    driverId?: number | null;
    error?: string;
}

interface DriverStats {
    total_deliveries: number;
    pending_deliveries: number;
    active_deliveries: number;
    completed_today: number;
    total_earnings: number;
}

interface DriverOrder {
    id: number;
    order_reference: string;
    customer_name: string;
    total_amount: number;
    order_status: string;
    created_at: string;
}

export default function DriverDashboard({ auth, driverId, error }: Props) {
    const [stats, setStats] = useState<DriverStats>({
        total_deliveries: 0,
        pending_deliveries: 0,
        active_deliveries: 0,
        completed_today: 0,
        total_earnings: 0,
    });
    const [recentOrders, setRecentOrders] = useState<DriverOrder[]>([]);

    useEffect(() => {
        if (driverId) {
            fetchStats(driverId);
            fetchOrders(driverId);
        } else {
            setStats({
                total_deliveries: 0,
                pending_deliveries: 0,
                active_deliveries: 0,
                completed_today: 0,
                total_earnings: 0,
            });
            setRecentOrders([]);
        }
    }, [driverId]);

    const fetchStats = async (currentDriverId: number) => {
        try {
            const response = await axios.get('/food-delivery/orders/list', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                    driver_id: currentDriverId,
                },
            });

            if (response.data.success && response.data.data) {
                const orders: DriverOrder[] = response.data.data;
                const completedToday = orders.filter((order) => {
                    const created = new Date(order.created_at);
                    const today = new Date();
                    return created.toDateString() === today.toDateString();
                }).length;

                setStats({
                    total_deliveries: orders.length,
                    pending_deliveries: orders.filter((order) => order.order_status === 'pending').length,
                    active_deliveries: orders.filter((order) => order.order_status === 'in_transit').length,
                    completed_today: completedToday,
                    total_earnings: orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0),
                });
            }
        } catch (fetchError: any) {
            console.error('Failed to fetch driver stats:', fetchError);
        }
    };

    const fetchOrders = async (currentDriverId: number) => {
        try {
            const response = await axios.get('/food-delivery/orders/list', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                    driver_id: currentDriverId,
                    per_page: 5,
                },
            });

            if (response.data.success && response.data.data) {
                setRecentOrders(response.data.data);
            }
        } catch (fetchError: any) {
            console.error('Failed to fetch orders:', fetchError);
        }
    };

    return (
        <EmployeeLayout
            auth={{ user: auth.user }}
            title="Driver Dashboard"
            header={<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Driver Dashboard</h2>}
        >
            <Head title="Driver Dashboard" />

            <div className="space-y-6 p-6">
                {!driverId ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Driver profile required</h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {error || 'No driver profile found for this account. Please contact your administrator.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <StatCard title="Total Deliveries" value={stats.total_deliveries} color="indigo" />
                            <StatCard title="Pending" value={stats.pending_deliveries} color="amber" />
                            <StatCard title="Active" value={stats.active_deliveries} color="sky" />
                            <StatCard title="Completed Today" value={stats.completed_today} color="emerald" />
                        </div>

                        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Deliveries</h3>
                            <div className="mt-4 space-y-3">
                                {recentOrders.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No deliveries yet.</p>
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
                        </section>
                    </>
                )}
            </div>
        </EmployeeLayout>
    );
}

interface StatCardProps {
    title: string;
    value: number;
    color: 'indigo' | 'amber' | 'sky' | 'emerald';
}

function StatCard({ title, value, color }: StatCardProps) {
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
                <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value.toLocaleString()}</p>
            </div>
        </div>
    );
}
