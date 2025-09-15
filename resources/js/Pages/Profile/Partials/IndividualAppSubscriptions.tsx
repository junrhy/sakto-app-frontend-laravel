import { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Receipt } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { getIconByName, getSmartIconSuggestion } from '@/lib/iconLibrary';

// Utility function to get icon for any app
const getIconForApp = (app: any): JSX.Element => {
    const IconComponent = getIconByName(app.icon || getSmartIconSuggestion(app.title));
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
                    .filter((app: any) => app.isUserAdded && app.paymentStatus === 'paid' && !app.cancelledAt)
                    .map((app: any) => ({
                        ...app,
                        icon: getIconForApp(app)
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
        const actionText = isSubscription ? 'cancel your subscription to' : 'remove';
        const confirmMessage = `Are you sure you want to ${actionText} ${app.title}?`;
        
        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            const endpoint = isSubscription ? '/api/apps/cancel-subscription' : '/api/apps/remove';
            const method = isSubscription ? 'POST' : 'DELETE';
            
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
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

    const handleToggleAutoRenew = async (app: any, newAutoRenewValue: boolean) => {
        try {
            const response = await fetch('/api/apps/toggle-auto-renew', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    module_identifier: app.identifier,
                    auto_renew: newAutoRenewValue
                })
            });

            if (response.ok) {
                const result = await response.json();
                toast.success(result.message);
                fetchUserApps(); // Refresh the list
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to update auto-renew setting');
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
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (userApps.length === 0) {
        return (
            <div className="text-center py-8">
                <Receipt className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No individual app subscriptions
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    You haven't purchased any individual apps yet. Browse our apps to get started!
                </p>
                <Link
                    href={route('apps')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    Browse Apps
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {userApps.map((app) => (
                <div key={app.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center ${app.bgColor}`}>
                                <div className="text-lg dark:text-slate-300">
                                    {app.icon}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                    {app.title}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {app.pricingType === 'subscription' ? 'Monthly Subscription' : 'One-time Purchase'}
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
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <p>Next billing: {app.nextBillingDate ? formatDate(app.nextBillingDate) : 'N/A'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleCancelSubscription(app)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                    >
                                        Cancel Subscription
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Auto-renew Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Auto-renew</span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {app.autoRenew ? 'Subscription will renew automatically' : 'Subscription will not renew automatically'}
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={app.autoRenew}
                                        onChange={(e) => handleToggleAutoRenew(app, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    )}
                    
                    {/* One-time Purchase Details */}
                    {app.pricingType === 'one-time' && (
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <p>Purchase type: One-time payment</p>
                                <p>Status: Active</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCancelSubscription(app)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
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
