import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { SparklesIcon, CalendarIcon, CreditCardIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
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

export default function UpdateSubscriptionForm({ className = '', hideHeader = false, userIdentifier }: Props) {
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [subscriptionHistory, setSubscriptionHistory] = useState<UserSubscription[]>([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [subscriptionToCancel, setSubscriptionToCancel] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        fetchSubscriptionData();
    }, [userIdentifier]);

    const fetchSubscriptionData = async () => {
        try {
            setIsLoading(true);
            
            // Fetch active subscription
            if (userIdentifier) {
                const activeResponse = await fetch(`/subscriptions/${userIdentifier}/active`);
                if (activeResponse.ok) {
                    const activeData = await activeResponse.json();
                    if (activeData.active) {
                        setSubscription(activeData.subscription);
                    }
                }
            }

            // Fetch subscription plans
            const plansResponse = await fetch('/subscriptions');
            if (plansResponse.ok) {
                const plansData = await plansResponse.json();
                setPlans(plansData.plans || []);
            }

            // Fetch subscription history
            if (userIdentifier) {
                const historyResponse = await fetch(`/subscriptions/history/${userIdentifier}`);
                if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    setSubscriptionHistory(historyData.history || []);
                }
            }
        } catch (error) {
            console.error('Failed to fetch subscription data:', error);
            toast.error('Failed to load subscription information');
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
            currency: 'PHP'
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { variant: 'default', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
            cancelled: { variant: 'secondary', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
            expired: { variant: 'secondary', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
            pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
            failed: { variant: 'secondary', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.expired;

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
            const response = await fetch(`/subscriptions/cancel/${subscriptionToCancel}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    reason: cancellationReason
                })
            });

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
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subscription Management</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Manage your subscription and billing information
                        </p>
                    </div>
                )}
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {!hideHeader && (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subscription Management</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Manage your subscription and billing information
                    </p>
                </div>
            )}

            {/* Current Subscription */}
            {subscription ? (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                            <SparklesIcon className="w-5 h-5" />
                            Active Subscription
                        </CardTitle>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                            You currently have an active subscription
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">Plan</Label>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                                        {subscription.plan.name}
                                    </span>
                                    {subscription.plan.badge_text && (
                                        <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {subscription.plan.badge_text}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">Status</Label>
                                <div>{getStatusBadge(subscription.status)}</div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">Start Date</Label>
                                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                                    <CalendarIcon className="w-4 h-4" />
                                    {formatDate(subscription.start_date)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">End Date</Label>
                                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                                    <CalendarIcon className="w-4 h-4" />
                                    {formatDate(subscription.end_date)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">Amount Paid</Label>
                                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                                    <CreditCardIcon className="w-4 h-4" />
                                    {formatCurrency(subscription.amount_paid)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">Auto Renew</Label>
                                <div className="flex items-center gap-2">
                                    {subscription.auto_renew ? (
                                        <CheckIcon className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <XMarkIcon className="w-4 h-4 text-red-600" />
                                    )}
                                    <span className={subscription.auto_renew ? 'text-green-600' : 'text-red-600'}>
                                        {subscription.auto_renew ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => openCancelDialog(subscription.identifier)}
                                className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/30"
                            >
                                Cancel Subscription
                            </Button>
                            <Button
                                onClick={handleUpgradeSubscription}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Upgrade Plan
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                            <SparklesIcon className="w-5 h-5" />
                            No Active Subscription
                        </CardTitle>
                        <CardDescription className="text-orange-700 dark:text-orange-300">
                            You don't have an active subscription. Upgrade to unlock unlimited access to all features.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleUpgradeSubscription}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            <SparklesIcon className="w-4 h-4 mr-2" />
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
                            <CalendarIcon className="w-5 h-5" />
                            Subscription History
                        </CardTitle>
                        <CardDescription>
                            View your past subscription transactions and payments
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
                                                {formatCurrency(sub.amount_paid)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(sub.start_date)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(sub.end_date)}
                                            </TableCell>
                                            <TableCell>
                                                <span className="capitalize">{sub.payment_method}</span>
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
                            Are you sure you want to cancel your subscription? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="cancellation-reason">Cancellation Reason</Label>
                            <Textarea
                                id="cancellation-reason"
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
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
                            disabled={isCancelling || !cancellationReason.trim()}
                        >
                            {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 