import { Button } from '@/Components/ui/button';
import { getIconByName, getSmartIconSuggestion } from '@/lib/iconLibrary';
import { Link } from '@inertiajs/react';
import { Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Utility function to get icon for any app
const getIconForApp = (app: any): JSX.Element => {
    const IconComponent = getIconByName(
        app.icon || getSmartIconSuggestion(app.title),
    );
    return <IconComponent />;
};

export default function IndividualAppSubscriptions() {
    const [userApps, setUserApps] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUserApps();
    }, []);

    const fetchUserApps = async () => {
        try {
            const response = await fetch('/api/apps');
            if (response.ok) {
                const data = await response.json();
                // Filter only user-added apps (paid apps, not cancelled) and convert icons to JSX
                const paidApps = data.apps
                    .filter(
                        (app: any) =>
                            app.isUserAdded &&
                            app.paymentStatus === 'paid' &&
                            !app.cancelledAt,
                    )
                    .map((app: any) => ({
                        ...app,
                        icon: getIconForApp(app),
                    }));
                setUserApps(paidApps);
            }
        } catch (error) {
            console.error('Failed to fetch user apps:', error);
            toast.error('Failed to load app subscriptions');
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleCancelSubscription = async (app: any) => {
        const isSubscription = app.pricingType === 'subscription';
        const actionText = isSubscription
            ? 'cancel your subscription to'
            : 'remove';
        const confirmMessage = `Are you sure you want to ${actionText} ${app.title}?`;

        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            const endpoint = isSubscription
                ? '/api/apps/cancel-subscription'
                : '/api/apps/remove';
            const method = isSubscription ? 'POST' : 'DELETE';

            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    module_identifier: app.identifier,
                }),
            });

            if (response.ok) {
                const successMessage = isSubscription
                    ? `${app.title} subscription cancelled successfully`
                    : `${app.title} removed successfully`;
                toast.success(successMessage);
                fetchUserApps(); // Refresh the list
            } else {
                const errorData = await response.json();
                const errorMessage = isSubscription
                    ? 'Failed to cancel subscription'
                    : 'Failed to remove app';
                toast.error(errorData.message || errorMessage);
            }
        } catch (error) {
            console.error('Failed to process request:', error);
            const errorMessage = isSubscription
                ? 'Failed to cancel subscription'
                : 'Failed to remove app';
            toast.error(errorMessage);
        }
    };

    const handleToggleAutoRenew = async (
        app: any,
        newAutoRenewValue: boolean,
    ) => {
        try {
            const response = await fetch('/api/apps/toggle-auto-renew', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    module_identifier: app.identifier,
                    auto_renew: newAutoRenewValue,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                toast.success(result.message);
                fetchUserApps(); // Refresh the list
            } else {
                const error = await response.json();
                toast.error(
                    error.message || 'Failed to update auto-renew setting',
                );
            }
        } catch (error) {
            console.error('Error toggling auto-renew:', error);
            toast.error('An error occurred while updating auto-renew setting');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="mb-2 h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (userApps.length === 0) {
        return (
            <div className="py-8 text-center">
                <Receipt className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                    No individual app subscriptions
                </h3>
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                    You haven't purchased any individual apps yet. Browse our
                    apps to get started!
                </p>
                <Link
                    href={route('apps')}
                    className="inline-flex items-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                    Browse Apps
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {userApps.map((app) => (
                <div
                    key={app.id}
                    className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-gray-700"
                >
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 ${app.bgColor}`}
                            >
                                <div className="text-lg dark:text-slate-300">
                                    {app.icon}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                    {app.title}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {app.pricingType === 'subscription'
                                        ? 'Monthly Subscription'
                                        : 'One-time Purchase'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                {formatPrice(app.price)}
                            </div>
                            {app.pricingType === 'subscription' && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    per month
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Subscription Details */}
                    {app.pricingType === 'subscription' && (
                        <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <p>
                                        Next billing:{' '}
                                        {app.nextBillingDate
                                            ? formatDate(app.nextBillingDate)
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            handleCancelSubscription(app)
                                        }
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                                    >
                                        Cancel Subscription
                                    </Button>
                                </div>
                            </div>

                            {/* Auto-renew Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        Auto-renew
                                    </span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {app.autoRenew
                                            ? 'Subscription will renew automatically'
                                            : 'Subscription will not renew automatically'}
                                    </p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={app.autoRenew}
                                        onChange={(e) =>
                                            handleToggleAutoRenew(
                                                app,
                                                e.target.checked,
                                            )
                                        }
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* One-time Purchase Details */}
                    {app.pricingType === 'one-time' && (
                        <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <p>Purchase type: One-time payment</p>
                                <p>Status: Active</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        handleCancelSubscription(app)
                                    }
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                                >
                                    Remove App
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
