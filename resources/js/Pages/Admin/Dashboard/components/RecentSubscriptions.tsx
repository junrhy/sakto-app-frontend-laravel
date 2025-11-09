import { Users } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

interface RecentSubscriptionsProps {
    subscriptions: Array<{
        id: number;
        user_name: string;
        plan_name: string;
        amount_paid: number;
        currency: string;
        start_date: string;
        end_date: string;
    }>;
    fallbackCurrency: string;
}

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

export function RecentSubscriptions({
    subscriptions,
    fallbackCurrency,
}: RecentSubscriptionsProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Latest Purchases
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Recent Subscriptions
                    </h3>
                </div>
                <span className="rounded-full bg-slate-200 p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Users className="h-5 w-5" />
                </span>
            </div>

            {subscriptions.length > 0 ? (
                <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                        <div
                            key={subscription.id}
                            className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-4 shadow-inner dark:border-slate-700 dark:bg-slate-900/60"
                        >
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {subscription.user_name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {subscription.plan_name}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {formatCurrency(
                                        subscription.amount_paid,
                                        subscription.currency ||
                                            fallbackCurrency,
                                    )}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {formatDate(subscription.start_date)} &ndash;{' '}
                                    {formatDate(subscription.end_date)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    No recent subscription purchases detected.
                </p>
            )}
        </div>
    );
}

