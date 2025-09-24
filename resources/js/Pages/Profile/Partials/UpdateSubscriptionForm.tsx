import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import {
    CalendarIcon,
    CheckIcon,
    CreditCardIcon,
    SparklesIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    duration_in_days: number;
    credits_per_month: number;
    unlimited_access: boolean;
    features: string[];
    is_popular: boolean;
    is_active: boolean;
    badge_text?: string;
}

interface UserSubscription {
    id: number;
    identifier: string;
    user_identifier: string;
    subscription_plan_id: number;
    start_date: string;
    end_date: string;
    status: 'active' | 'cancelled' | 'expired' | 'pending' | 'failed';
    cancelled_at: string | null;
    payment_method: string;
    payment_transaction_id: string;
    amount_paid: number;
    proof_of_payment: string | null;
    auto_renew: boolean;
    cancellation_reason: string | null;
    created_at: string;
    updated_at: string;
    plan: SubscriptionPlan;
}

interface Props {
    className?: string;
    hideHeader?: boolean;
    userIdentifier?: string;
}

export default function UpdateSubscriptionForm({
    className = '',
    hideHeader = false,
    userIdentifier,
}: Props) {
    const [subscription, setSubscription] = useState<UserSubscription | null>(
        null,
    );
    const [subscriptionHistory, setSubscriptionHistory] = useState<
        UserSubscription[]
    >([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [subscriptionToCancel, setSubscriptionToCancel] = useState<
        string | null
    >(null);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        fetchSubscriptionData();
    }, [userIdentifier]);

    const fetchSubscriptionData = async () => {
        try {
            setIsLoading(true);

            // Fetch active subscription
            if (userIdentifier) {
                const activeResponse = await fetch(
                    `/subscriptions/${userIdentifier}/active`,
                );
                if (activeResponse.ok) {
                    const contentType =
                        activeResponse.headers.get('content-type');
                    if (
                        contentType &&
                        contentType.includes('application/json')
                    ) {
                        const activeData = await activeResponse.json();
                        if (activeData.active) {
                            setSubscription(activeData.subscription);
                        }
                    } else {
                        console.error(
                            'Active subscription response is not JSON',
                        );
                    }
                } else {
                    console.error(
                        'Failed to fetch active subscription:',
                        activeResponse.status,
                        activeResponse.statusText,
                    );
                }
            }

            // Fetch subscription plans
            const plansResponse = await fetch('/api/subscriptions/plans');
            if (plansResponse.ok) {
                const contentType = plansResponse.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const plansData = await plansResponse.json();
                    setPlans(plansData.plans || []);
                } else {
                    console.error('Plans response is not JSON');
                }
            } else {
                console.error(
                    'Failed to fetch plans:',
                    plansResponse.status,
                    plansResponse.statusText,
                );
            }

            // Fetch subscription history
            if (userIdentifier) {
                const historyResponse = await fetch(
                    `/subscriptions/history/${userIdentifier}`,
                );
                if (historyResponse.ok) {
                    const contentType =
                        historyResponse.headers.get('content-type');
                    if (
                        contentType &&
                        contentType.includes('application/json')
                    ) {
                        const historyData = await historyResponse.json();
                        setSubscriptionHistory(historyData.history || []);
                    } else {
                        console.error('History response is not JSON');
                    }
                } else {
                    console.error(
                        'Failed to fetch subscription history:',
                        historyResponse.status,
                        historyResponse.statusText,
                    );
                }
            }
        } catch (error) {
            console.error('Failed to fetch subscription data:', error);
            if (error instanceof SyntaxError) {
                toast.error(
                    'Failed to parse server response. Please refresh the page.',
                );
            } else {
                toast.error('Failed to load subscription information');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM dd, yyyy');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: {
                variant: 'secondary',
                className:
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
            },
            cancelled: {
                variant: 'secondary',
                className:
                    'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
            },
            expired: {
                variant: 'secondary',
                className:
                    'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
            },
            pending: {
                variant: 'secondary',
                className:
                    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
            },
            failed: {
                variant: 'secondary',
                className:
                    'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
            },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.expired;

        return (
            <Badge variant={config.variant as any} className={config.className}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const openCancelDialog = (subscriptionId: string) => {
        setSubscriptionToCancel(subscriptionId);
        setCancellationReason('');
        setCancelDialogOpen(true);
    };

    const handleCancelSubscription = async () => {
        if (!subscriptionToCancel || !cancellationReason.trim()) {
            toast.error('Please provide a cancellation reason');
            return;
        }

        try {
            setIsCancelling(true);
            const response = await fetch(
                `/subscriptions/cancel/${subscriptionToCancel}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        reason: cancellationReason,
                    }),
                },
            );

            if (response.ok) {
                toast.success('Subscription cancelled successfully');
                setCancelDialogOpen(false);
                fetchSubscriptionData(); // Refresh data
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            toast.error('Failed to cancel subscription');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleUpgradeSubscription = () => {
        window.location.href = route('subscriptions.index');
    };

    if (isLoading) {
        return (
            <div className={`space-y-6 ${className}`}>
                {!hideHeader && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Subscription Management
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Manage your subscription and billing information
                        </p>
                    </div>
                )}
                <div className="animate-pulse space-y-4">
                    <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {!hideHeader && (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Subscription Management
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Manage your subscription and billing information
                    </p>
                </div>
            )}

            {/* Current Subscription */}
            {subscription ? (
                <Card className="border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <SparklesIcon className="h-5 w-5" />
                            Active Subscription
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            You currently have an active subscription
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Plan
                                </Label>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {subscription.plan.name}
                                    </span>
                                    {subscription.plan.badge_text && (
                                        <Badge
                                            variant="secondary"
                                            className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                        >
                                            {subscription.plan.badge_text}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status
                                </Label>
                                <div>{getStatusBadge(subscription.status)}</div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Start Date
                                </Label>
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <CalendarIcon className="h-4 w-4" />
                                    {formatDate(subscription.start_date)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    End Date
                                </Label>
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <CalendarIcon className="h-4 w-4" />
                                    {formatDate(subscription.end_date)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Amount Paid
                                </Label>
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <CreditCardIcon className="h-4 w-4" />
                                    {formatCurrency(subscription.amount_paid)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Auto Renew
                                </Label>
                                <div className="flex items-center gap-2">
                                    {subscription.auto_renew ? (
                                        <CheckIcon className="h-4 w-4 text-gray-600" />
                                    ) : (
                                        <XMarkIcon className="h-4 w-4 text-gray-500" />
                                    )}
                                    <span
                                        className={
                                            subscription.auto_renew
                                                ? 'text-gray-700 dark:text-gray-300'
                                                : 'text-gray-500 dark:text-gray-400'
                                        }
                                    >
                                        {subscription.auto_renew
                                            ? 'Enabled'
                                            : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    openCancelDialog(subscription.identifier)
                                }
                                className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/30"
                            >
                                Cancel Subscription
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleUpgradeSubscription}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                View Plans
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <SparklesIcon className="h-5 w-5" />
                            No Active Subscription
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            You don't have an active subscription. Upgrade to
                            unlock unlimited access to all features.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleUpgradeSubscription}
                            className="bg-gray-600 text-white hover:bg-gray-700"
                        >
                            <SparklesIcon className="mr-2 h-4 w-4" />
                            View Subscription Plans
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Subscription History */}
            {subscriptionHistory.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Subscription History
                        </CardTitle>
                        <CardDescription>
                            View your past subscription transactions and
                            payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Payment Method</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subscriptionHistory.map((sub) => (
                                        <TableRow key={sub.id}>
                                            <TableCell className="font-medium">
                                                {sub.plan.name}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(sub.status)}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(
                                                    sub.amount_paid,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(sub.start_date)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(sub.end_date)}
                                            </TableCell>
                                            <TableCell>
                                                <span className="capitalize">
                                                    {sub.payment_method}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Cancel Subscription Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel your subscription?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="cancellation-reason">
                                Cancellation Reason
                            </Label>
                            <Textarea
                                id="cancellation-reason"
                                value={cancellationReason}
                                onChange={(e) =>
                                    setCancellationReason(e.target.value)
                                }
                                placeholder="Please provide a reason for cancellation..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCancelDialogOpen(false)}
                            disabled={isCancelling}
                        >
                            Keep Subscription
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelSubscription}
                            disabled={
                                isCancelling || !cancellationReason.trim()
                            }
                        >
                            {isCancelling
                                ? 'Cancelling...'
                                : 'Cancel Subscription'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
