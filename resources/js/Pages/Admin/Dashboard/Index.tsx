import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowUpRight, CreditCard } from 'lucide-react';
import { MetricCard } from './components/MetricCard';
import { RecentSubscriptions } from './components/RecentSubscriptions';
import { QuickActionsGrid } from './components/QuickActionsGrid';
import { formatCurrency } from '@/utils/formatCurrency';

interface DashboardProps extends PageProps {
    totalSubscriptionSales?: number;
    thisMonthSales?: number;
    lastMonthSales?: number;
    recentSubscriptions?: Array<{
        id: number;
        user_name: string;
        plan_name: string;
        amount_paid: number;
        currency: string;
        status: string;
        start_date: string;
        end_date: string;
    }>;
}

export default function Dashboard({
    auth,
    totalSubscriptionSales = 0,
    thisMonthSales = 0,
    lastMonthSales = 0,
    recentSubscriptions = [],
}: DashboardProps) {
    const summaryCurrency =
        recentSubscriptions[0]?.currency ?? 'USD';

    const quickActions = [
        {
            title: 'Subscriptions',
            description: 'Manage user subscriptions and plans',
            href: route('admin.subscriptions.index'),
            color: 'blue' as const,
        },
        {
            title: 'Users',
            description: 'Manage user accounts and permissions',
            href: route('admin.users.index'),
            color: 'green' as const,
        },
        {
            title: 'Apps',
            description: 'Manage application modules and features',
            href: route('admin.apps.index'),
            color: 'orange' as const,
        },
        {
            title: 'Settings',
            description: 'Configure application settings',
            href: route('admin.settings.index'),
            color: 'purple' as const,
        },
    ];

    return (
        <AdminLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            title="Admin Dashboard"
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Admin Dashboard
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                <div className="space-y-10 p-6 text-gray-900 dark:text-gray-100">
                    <section className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <MetricCard
                                title="Overall Subscription Sales"
                                description="Sum of active subscription payouts"
                                amount={formatCurrency(totalSubscriptionSales, summaryCurrency)}
                                icon={<CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-300" />}
                                accent="blue"
                            />
                            <MetricCard
                                title="This Month"
                                description="Sales collected in the current month"
                                amount={formatCurrency(thisMonthSales, summaryCurrency)}
                                icon={<ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-300" />}
                                accent="green"
                            />
                            <MetricCard
                                title="Last Month"
                                description="Sales collected in the previous month"
                                amount={formatCurrency(lastMonthSales, summaryCurrency)}
                                icon={<ArrowUpRight className="h-6 w-6 rotate-180 text-slate-600 dark:text-slate-300" />}
                                accent="slate"
                            />
                        </div>

                        <RecentSubscriptions
                            subscriptions={recentSubscriptions}
                            fallbackCurrency={summaryCurrency}
                        />
                    </section>

                    <section>
                        <h3 className="mb-4 text-lg font-medium text-slate-800 dark:text-slate-100">
                            Quick Actions
                        </h3>
                        <QuickActionsGrid actions={quickActions} />
                    </section>

                    <section>
                        <h3 className="mb-4 text-lg font-medium text-slate-800 dark:text-slate-100">
                            Recent Activity
                        </h3>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 shadow dark:border-gray-600 dark:bg-gray-700">
                            <p className="italic text-gray-500 dark:text-gray-400">
                                No recent activity to display.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}

