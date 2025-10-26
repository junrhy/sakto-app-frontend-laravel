import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import UsageLimits from '@/Components/UsageLimits';
import SubscriptionLayout from '@/Layouts/SubscriptionLayout';
import { PageProps } from '@/types';
import { Project, User } from '@/types/index';
import {
    BanknotesIcon,
    CheckIcon,
    CreditCardIcon,
    SparklesIcon,
    StarIcon,
} from '@heroicons/react/24/solid';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { SubscriptionPlan } from '@/types/models';
import { format } from 'date-fns';

interface PaymentMethod {
    id: string;
    name: string;
    description: string;
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

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
    plans: SubscriptionPlan[];
    activeSubscription: UserSubscription | null;
    paymentMethods: PaymentMethod[];
    subscriptionHistory: UserSubscription[];
    usageLimits?: {
        [key: string]: {
            current: number;
            limit: number;
            percentage: number;
            remaining: number;
            unlimited: boolean;
        };
    };
}

const getCurrencySymbol = (currency?: string): string => {
    const symbols: Record<string, string> = {
        PHP: '₱',
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        AUD: '$',
        CAD: '$',
    };
    return symbols[currency || 'USD'] || currency || 'USD';
};

const getPaymentMethodLabel = (method?: string): string => {
    const labels: Record<string, string> = {
        lemonsqueezy: 'Credit/Debit Card',
        stripe: 'Credit/Debit Card',
        credits: 'Credits',
        cash: 'Cash',
    };
    return labels[method || ''] || method || 'Unknown';
};

export default function Index({
    auth,
    plans,
    activeSubscription,
    paymentMethods,
    subscriptionHistory,
    usageLimits = {},
}: Props) {
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
        null,
    );
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [transactionId, setTransactionId] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [autoRenew, setAutoRenew] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [subscriptionToCancel, setSubscriptionToCancel] = useState<
        string | null
    >(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>(
        'monthly',
    );
    const [highlightedApp, setHighlightedApp] = useState<string | null>(null);
    const [networkError, setNetworkError] = useState(false);
    const [showPaymentSteps, setShowPaymentSteps] = useState(false);
    const [credits, setCredits] = useState<number>(auth.user.credits ?? 0);
    const [currencyFilter, setCurrencyFilter] = useState<string>('USD');

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - check their roles
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // No team member selected (main account) - allow all users to manage their own subscriptions
        return true;
    }, [auth.selectedTeamMember]);

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - only admin or manager can cancel
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        // No team member selected (main account) - allow all users to cancel their own subscriptions
        return true;
    }, [auth.selectedTeamMember]);

    // Get flash messages from Inertia
    const { flash } = usePage<any>().props;

    // Display flash messages from backend
    useEffect(() => {
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.message || flash?.success) {
            toast.success(flash.message || flash.success);
        }
    }, [flash]);

    // Check URL parameters for plan to highlight and set billing period based on active subscription
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const highlightPlan = params.get('highlight_plan');
        const appName = params.get('app');

        // Set billing period based on active subscription if it exists
        if (activeSubscription) {
            if (activeSubscription.plan.duration_in_days > 90) {
                setBillingPeriod('annually');
            } else {
                setBillingPeriod('monthly');
            }
        }

        if (highlightPlan) {
            // Find the plan by slug instead of name
            const planToHighlight = plans.find(
                (plan) => plan.slug === highlightPlan,
            );
            if (planToHighlight) {
                // Set the billing period based on the plan's duration
                if (planToHighlight.duration_in_days > 90) {
                    setBillingPeriod('annually');
                } else {
                    setBillingPeriod('monthly');
                }

                // Highlight the plan
                setSelectedPlan(planToHighlight);

                // Set active tab to plans
                setActiveTab('plans');
            }
        }

        if (appName) {
            setHighlightedApp(appName);
        }
    }, [plans, activeSubscription]);

    // Fetch current credit balance
    useEffect(() => {
        const fetchCredits = async () => {
            try {
                if (auth.user.identifier) {
                    const response = await fetch(
                        `/credits/${auth.user.identifier}/balance`,
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setCredits(data.available_credit);
                    }
                }
            } catch (error) {
                // Silently ignore credit fetch errors
                setCredits(0);
            }
        };

        fetchCredits();
    }, [auth.user.identifier]);

    // Set payment method based on plan currency when a plan is selected
    useEffect(() => {
        if (selectedPlan) {
            // Default to cash for PHP plans, lemonsqueezy for other currencies
            if (selectedPlan.currency === 'PHP') {
                setPaymentMethod('cash');
            } else {
                setPaymentMethod('lemonsqueezy');
            }
        }
    }, [selectedPlan]);

    // Manage auto-renew based on payment method
    useEffect(() => {
        if (paymentMethod === 'cash') {
            // Disable auto-renew for manual cash payments
            setAutoRenew(false);
        } else if (paymentMethod === 'lemonsqueezy') {
            // Always enable auto-renew for credit card payments via Lemon Squeezy
            setAutoRenew(true);
        }
    }, [paymentMethod]);

    // Filter and transform plans based on billing period and currency
    const filteredPlans = useMemo(() => {
        return plans.filter((plan) => {
            // Filter by billing period
            // For monthly, show plans with duration <= 90 days (approximately 3 months)
            // For annually, show plans with duration > 90 days
            let matchesBillingPeriod = false;
            if (billingPeriod === 'monthly') {
                matchesBillingPeriod = plan.duration_in_days <= 90;
            } else {
                matchesBillingPeriod = plan.duration_in_days > 90;
            }

            // Filter by currency if specified
            const matchesCurrency =
                !currencyFilter || plan.currency === currencyFilter;

            return matchesBillingPeriod && matchesCurrency;
        });
    }, [plans, billingPeriod, currencyFilter]);

    const handlePlanSelect = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setPaymentMethod('');
        setTransactionId('');
        setProofFile(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPlan) {
            toast.error('Please select a plan');
            return;
        }

        if (!paymentMethod) {
            toast.error('Please select a payment method');
            return;
        }

        setIsSubmitting(true);
        setNetworkError(false);

        try {
            // Store form data in session storage for fallback
            sessionStorage.setItem(
                'subscription_plan_id',
                selectedPlan.id.toString(),
            );
            sessionStorage.setItem(
                'subscription_payment_method',
                paymentMethod,
            );
            sessionStorage.setItem(
                'subscription_auto_renew',
                autoRenew ? '1' : '0',
            );

            if (paymentMethod === 'cash') {
                // Show payment steps dialog for cash payments
                setShowPaymentSteps(true);
                setIsSubmitting(false);
                return;
            }

            if (paymentMethod === 'credits') {
                // For credits payment, we can proceed directly since we've already validated
                // that the user has sufficient credits in the UI
            }

            // Create a hidden form and submit it directly
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = route('subscriptions.subscribe');

            // Add CSRF token
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');
            if (csrfToken) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_token';
                csrfInput.value = csrfToken;
                form.appendChild(csrfInput);
            }

            // Add form data
            const planIdInput = document.createElement('input');
            planIdInput.type = 'hidden';
            planIdInput.name = 'plan_id';
            planIdInput.value = selectedPlan.id.toString();
            form.appendChild(planIdInput);

            const paymentMethodInput = document.createElement('input');
            paymentMethodInput.type = 'hidden';
            paymentMethodInput.name = 'payment_method';
            paymentMethodInput.value = paymentMethod;
            form.appendChild(paymentMethodInput);

            const autoRenewInput = document.createElement('input');
            autoRenewInput.type = 'hidden';
            autoRenewInput.name = 'auto_renew';
            autoRenewInput.value = autoRenew ? '1' : '0';
            form.appendChild(autoRenewInput);

            // Append to body and submit
            document.body.appendChild(form);

            // Show appropriate loading message based on payment method
            if (paymentMethod === 'cash') {
                toast.loading('Processing your subscription request...', {
                    id: 'payment-loading',
                    duration: 5000, // 5 seconds
                });
            } else if (paymentMethod === 'credits') {
                toast.loading('Processing your credits payment...', {
                    id: 'payment-loading',
                    duration: 3000, // 3 seconds
                });
            } else {
                toast.loading('Connecting to payment gateway...', {
                    id: 'payment-loading',
                    duration: 10000, // 10 seconds
                });
            }

            // Set a timeout to dismiss the loading toast if the form submission takes too long
            setTimeout(
                () => {
                    toast.dismiss('payment-loading');
                    setIsSubmitting(false);
                    setNetworkError(true);
                },
                paymentMethod === 'cash'
                    ? 5000
                    : paymentMethod === 'credits'
                      ? 3000
                      : 10000,
            );

            // Submit the form
            form.submit();
        } catch (error) {
            // Dismiss the loading toast
            toast.dismiss('payment-loading');

            console.error('Subscription submission error:', error);
            toast.error(
                'An error occurred while processing your request. Please try again.',
            );

            setIsSubmitting(false);
            setNetworkError(true);
        }
    };

    const handleConfirmCashPayment = () => {
        // Create and submit the form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('subscriptions.subscribe');

        // Add CSRF token
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        // Add form data
        const planIdInput = document.createElement('input');
        planIdInput.type = 'hidden';
        planIdInput.name = 'plan_id';
        planIdInput.value = selectedPlan?.id.toString() || '';
        form.appendChild(planIdInput);

        const paymentMethodInput = document.createElement('input');
        paymentMethodInput.type = 'hidden';
        paymentMethodInput.name = 'payment_method';
        paymentMethodInput.value = paymentMethod;
        form.appendChild(paymentMethodInput);

        const autoRenewInput = document.createElement('input');
        autoRenewInput.type = 'hidden';
        autoRenewInput.name = 'auto_renew';
        autoRenewInput.value = autoRenew ? '1' : '0';
        form.appendChild(autoRenewInput);

        // Append to body and submit
        document.body.appendChild(form);
        form.submit();
    };

    const openCancelDialog = (subscriptionId: string) => {
        setSubscriptionToCancel(subscriptionId);
        setCancelDialogOpen(true);
    };

    const handleCancelSubscription = () => {
        if (!subscriptionToCancel) return;

        router.post(
            route('subscriptions.cancel', { identifier: subscriptionToCancel }),
            {
                cancellation_reason: cancellationReason,
            },
            {
                onSuccess: () => {
                    toast.success('Subscription cancelled successfully');
                    setCancelDialogOpen(false);
                    setCancellationReason('');
                    setSubscriptionToCancel(null);
                },
                onError: () => {
                    toast.error('Failed to cancel subscription');
                },
            },
        );
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM d, yyyy');
    };

    // Helper function to check if a plan has unlimited access
    // For now, we'll assume all subscription plans have unlimited access
    const hasUnlimitedAccess = (plan: SubscriptionPlan) => {
        return true; // All subscription plans provide unlimited access
    };

    // Helper function to format credit amount
    const formatCredits = (amount: number) => {
        return amount.toLocaleString();
    };

    // Get unique currencies from available plans
    const availableCurrencies = useMemo(() => {
        const currencies = [
            ...new Set(plans.map((plan) => plan.currency).filter(Boolean)),
        ];
        return currencies.sort();
    }, [plans]);

    return (
        <SubscriptionLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
        >
            <Head title="Plans Subscription" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 dark:bg-gray-700">
                            <TabsTrigger
                                value="overview"
                                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="plans"
                                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                            >
                                Plans
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                            >
                                Subscription History
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-6">
                            <div className="overflow-hidden bg-white p-6 shadow-sm dark:bg-gray-800 sm:rounded-lg">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Current Subscription Overview
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Manage your current subscription and
                                        view plan details
                                    </p>
                                </div>

                                {activeSubscription ? (
                                    <div className="space-y-6">
                                        {/* Layout with Card and Usage Limits side by side */}
                                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                            {/* Main Subscription Card - Takes 2 columns on large screens */}
                                            <div className="lg:col-span-2">
                                                {/* Current Plan Card */}
                                                <Card className="overflow-hidden border-0 shadow-lg">
                                                    {/* Gradient Header */}
                                                    <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 px-6 py-8 dark:from-green-600 dark:via-emerald-600 dark:to-teal-700">
                                                        {/* Decorative elements */}
                                                        <div className="absolute -right-8 -top-8 h-32 w-32 opacity-10">
                                                            <div className="h-32 w-32 animate-pulse rounded-full bg-white"></div>
                                                        </div>
                                                        <div className="absolute -right-4 bottom-0 h-24 w-24 opacity-10">
                                                            <div className="h-24 w-24 animate-pulse rounded-full bg-white delay-1000"></div>
                                                        </div>
                                                        
                                                        <div className="relative z-10">
                                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                                <div className="flex-1">
                                                                    <div className="mb-2 flex items-center gap-2">
                                                                        <Badge className="bg-white/20 text-white backdrop-blur-sm">
                                                                            <CheckIcon className="mr-1 h-3 w-3" />
                                                                            {activeSubscription.status
                                                                                .charAt(0)
                                                                                .toUpperCase() +
                                                                                activeSubscription.status.slice(1)}
                                                                        </Badge>
                                                                    </div>
                                                                    <h3 className="mb-3 text-3xl font-bold text-white">
                                                                        {activeSubscription.plan.name}
                                                                    </h3>
                                                                    <div className="flex items-baseline gap-2">
                                                                        <span className="text-4xl font-bold text-white">
                                                                            {getCurrencySymbol(activeSubscription.plan.currency)}
                                                                            {Number(activeSubscription.plan.price).toFixed(0)}
                                                                        </span>
                                                                        <span className="text-lg text-white/80">
                                                                            /{activeSubscription.plan.duration_in_days === 365 ? 'year' : 'month'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="rounded-lg bg-white/10 p-4 text-center backdrop-blur-sm sm:min-w-[140px]">
                                                                    <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                                                                        Valid Until
                                                                    </p>
                                                                    <p className="mt-1 text-lg font-bold text-white">
                                                                        {formatDate(activeSubscription.end_date)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Card Content */}
                                                    <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                                                        <CardTitle className="text-lg text-gray-900 dark:text-white">
                                                            Subscription Details
                                                        </CardTitle>
                                                    </CardHeader>
                                            <CardContent className="space-y-6 p-6">
                                                {/* Key Metrics */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                            Subscription Started
                                                        </p>
                                                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                                            {formatDate(activeSubscription.start_date)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                            Monthly Credits
                                                        </p>
                                                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                                                            {activeSubscription.plan.credits_per_month} credits
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Subscription Info */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Auto-renewal
                                                        </span>
                                                        <Badge className={activeSubscription.auto_renew ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}>
                                                            {activeSubscription.auto_renew ? 'Enabled' : 'Disabled'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Payment Method
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {getPaymentMethodLabel(activeSubscription.payment_method)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Duration
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {activeSubscription.plan.duration_in_days} days
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Plan Features */}
                                                {activeSubscription.plan.features &&
                                                    activeSubscription.plan.features.length > 0 && (
                                                    <div>
                                                        <Label className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                            Plan Includes
                                                        </Label>
                                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                            {activeSubscription.plan.features.map((feature, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-start gap-2 rounded-lg bg-green-50 p-2 dark:bg-green-900/10"
                                                                >
                                                                    <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                                                        {feature}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                            <CardFooter className="border-t border-gray-100 bg-gray-50 pt-6 dark:border-gray-800 dark:bg-gray-800/50">
                                                <div className="flex w-full flex-col gap-3 sm:flex-row">
                                                    <Button
                                                        onClick={() => setActiveTab('plans')}
                                                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg dark:from-blue-600 dark:to-indigo-700"
                                                    >
                                                        <SparklesIcon className="mr-2 h-4 w-4" />
                                                        Upgrade Plan
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setActiveTab('history')}
                                                        className="flex-1 border-gray-300 bg-white font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                                    >
                                                        View History
                                                    </Button>
                                                    {canDelete && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSubscriptionToCancel(activeSubscription.identifier);
                                                                setCancelDialogOpen(true);
                                                            }}
                                                            className="flex-1 border-red-300 bg-white font-medium text-red-600 shadow-sm hover:bg-red-50 hover:shadow-md dark:border-red-800 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                                        >
                                                            Cancel Subscription
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardFooter>
                                                </Card>
                                            </div>

                                            {/* Usage Limits - Takes 1 column on large screens */}
                                            {usageLimits && Object.keys(usageLimits).length > 0 && (
                                                <div className="lg:col-span-1">
                                                    <UsageLimits 
                                                        limits={usageLimits}
                                                        title="Current Plan Usage"
                                                        className="h-full"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <Card>
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                                                            <BanknotesIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                Available
                                                                Credits
                                                            </p>
                                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                                {credits.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                                                            <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                Days Remaining
                                                            </p>
                                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                                {Math.max(
                                                                    0,
                                                                    Math.ceil(
                                                                        (new Date(
                                                                            activeSubscription.end_date,
                                                                        ).getTime() -
                                                                            new Date().getTime()) /
                                                                            (1000 *
                                                                                60 *
                                                                                60 *
                                                                                24),
                                                                    ),
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                                                            <StarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                Plan Name
                                                            </p>
                                                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                                {
                                                                    activeSubscription
                                                                        .plan
                                                                        .name
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* CTA Section - Upgrade Plan */}
                                        <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 shadow-xl dark:from-blue-600 dark:via-purple-700 dark:to-indigo-800">
                                            <CardContent className="p-8">
                                                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                                    <div className="text-center sm:text-left">
                                                        <h3 className="mb-2 text-2xl font-bold text-white">
                                                            Want More Features?
                                                        </h3>
                                                        <p className="text-blue-100 dark:text-blue-200">
                                                            Upgrade your plan to unlock unlimited access and premium features
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={() => setActiveTab('plans')}
                                                        size="lg"
                                                        className="min-w-[200px] bg-white text-purple-600 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:text-purple-700 dark:bg-white dark:text-purple-700 dark:hover:bg-gray-100"
                                                    >
                                                        <SparklesIcon className="mr-2 h-5 w-5" />
                                                        View All Plans
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : (
                                    <Card className="border-gray-200 dark:border-gray-700">
                                        <CardContent className="p-8 text-center">
                                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                                <CreditCardIcon className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                                                No Active Subscription
                                            </h4>
                                            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                                                You don't have an active
                                                subscription. Choose a plan to
                                                get started.
                                            </p>
                                            <Button
                                                onClick={() =>
                                                    setActiveTab('plans')
                                                }
                                            >
                                                Browse Plans
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="plans" className="mt-6">
                            <div className="overflow-hidden bg-gray-50 p-6 shadow-sm dark:bg-gray-900 sm:rounded-lg">
                                {/* Billing Period Toggle and Currency Filter */}
                                <div className="mb-6">
                                    <div className="mb-4 flex flex-col items-start justify-between sm:flex-row sm:items-center">
                                        <h3 className="text-lg font-semibold">
                                            Choose a Plan
                                        </h3>
                                        <div className="mt-2 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:items-center">
                                            {/* Currency Filter */}
                                            {availableCurrencies.length > 1 && (
                                                <div className="flex items-center gap-2">
                                                    <Label
                                                        htmlFor="currency-filter"
                                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Currency:
                                                    </Label>
                                                    <select
                                                        id="currency-filter"
                                                        value={currencyFilter}
                                                        onChange={(e) =>
                                                            setCurrencyFilter(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                    >
                                                        <option value="">
                                                            All Currencies
                                                        </option>
                                                        {availableCurrencies.map(
                                                            (currency) => (
                                                                <option
                                                                    key={
                                                                        currency
                                                                    }
                                                                    value={
                                                                        currency
                                                                    }
                                                                >
                                                                    {currency} (
                                                                    {getCurrencySymbol(
                                                                        currency,
                                                                    )}
                                                                    )
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                            )}

                                            {/* Billing Period Toggle */}
                                            <Tabs
                                                value={billingPeriod}
                                                onValueChange={(value) => {
                                                    setBillingPeriod(
                                                        value as
                                                            | 'monthly'
                                                            | 'annually',
                                                    );
                                                    setSelectedPlan(null);
                                                }}
                                                className="w-full"
                                            >
                                                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 dark:bg-gray-700">
                                                    <TabsTrigger
                                                        value="monthly"
                                                        className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                                                    >
                                                        Monthly
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="annually"
                                                        className="data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                                                    >
                                                        Annually
                                                    </TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {billingPeriod === 'annually'
                                            ? 'Annual plans offer better value and are billed once per year.'
                                            : 'Monthly plans offer more flexibility with a shorter commitment period.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    {filteredPlans.length > 0 ? (
                                        filteredPlans.map((plan) => (
                                            <Card
                                                key={plan.id}
                                                className={`overflow-hidden transition-all ${
                                                    activeSubscription?.plan
                                                        .id === plan.id
                                                        ? 'bg-green-50 ring-2 ring-gray-300 dark:bg-green-900/20 dark:ring-gray-500'
                                                        : selectedPlan?.id ===
                                                            plan.id
                                                          ? plan.is_popular &&
                                                            activeSubscription
                                                                ?.plan.id !==
                                                                plan.id
                                                              ? 'bg-gray-50 ring-2 ring-blue-300 dark:bg-gray-800/30 dark:ring-blue-600' +
                                                                (highlightedApp
                                                                    ? ' shadow-lg shadow-blue-200 dark:shadow-blue-900/30'
                                                                    : '')
                                                              : 'bg-gray-50 ring-2 ring-gray-600 dark:bg-gray-800/30 dark:ring-gray-400' +
                                                                (highlightedApp
                                                                    ? ' shadow-lg shadow-gray-200 dark:shadow-gray-900/30'
                                                                    : '')
                                                          : plan.is_popular &&
                                                              activeSubscription
                                                                  ?.plan.id !==
                                                                  plan.id
                                                            ? 'bg-gray-50 ring-1 ring-blue-200 hover:shadow-lg hover:shadow-blue-100 dark:bg-gray-800/30 dark:ring-blue-800 dark:hover:shadow-blue-900/20'
                                                            : 'bg-gray-50 ring-1 ring-gray-300 hover:shadow-md dark:bg-gray-800/30 dark:ring-gray-600'
                                                }`}
                                            >
                                                {activeSubscription?.plan.id ===
                                                    plan.id && (
                                                    <div className="bg-green-100 py-1 text-center text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                        Current Subscription
                                                    </div>
                                                )}
                                                {plan.is_popular &&
                                                    activeSubscription?.plan
                                                        .id !== plan.id && (
                                                        <div className="flex items-center justify-center space-x-1 bg-blue-100 py-1 text-center text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                            <StarIcon className="h-4 w-4 fill-current text-yellow-500" />
                                                            <span>
                                                                Most Popular
                                                            </span>
                                                        </div>
                                                    )}
                                                {plan.badge_text &&
                                                    !plan.is_popular &&
                                                    activeSubscription?.plan
                                                        .id !== plan.id && (
                                                        <div className="bg-gray-300 py-1 text-center text-sm font-medium text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                                                            {plan.badge_text}
                                                        </div>
                                                    )}
                                                {!plan.badge_text &&
                                                    !plan.is_popular &&
                                                    hasUnlimitedAccess(plan) &&
                                                    activeSubscription?.plan
                                                        .id !== plan.id && (
                                                        <div className="bg-gray-200 py-1 text-center text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                            Unlimited Access
                                                        </div>
                                                    )}
                                                <CardHeader>
                                                    <CardTitle className="flex items-center justify-between">
                                                        <span>{plan.name}</span>
                                                        <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                                                            {getCurrencySymbol(
                                                                plan.currency,
                                                            )}
                                                            {Number(
                                                                plan.price,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {billingPeriod ===
                                                            'annually'
                                                                ? 'Annual subscription'
                                                                : `${Math.floor(plan.duration_in_days / 30)} month subscription`}
                                                            {billingPeriod ===
                                                                'annually' && (
                                                                <span className="ml-2 font-medium text-gray-500 dark:text-gray-500">
                                                                    Save up to
                                                                    20%
                                                                </span>
                                                            )}
                                                        </p>
                                                        <div className="-mb-2 mt-3 flex items-start">
                                                            <CheckIcon className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                                                            <span className="text-sm text-gray-700 dark:text-gray-200">
                                                                {hasUnlimitedAccess(
                                                                    plan,
                                                                )
                                                                    ? `Unlimited access to ${plan.name.toLowerCase()} features`
                                                                    : `Limited access to ${plan.name.toLowerCase()} features`}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {plan.features &&
                                                            plan.features.map(
                                                                (
                                                                    feature,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex items-start"
                                                                    >
                                                                        <CheckIcon className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                                                                        <span className="text-sm text-gray-700 dark:text-gray-200">
                                                                            {
                                                                                feature
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                    </div>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button
                                                        className={`w-full ${
                                                            selectedPlan?.id ===
                                                            plan.id
                                                                ? plan.is_popular &&
                                                                  activeSubscription
                                                                      ?.plan
                                                                      .id !==
                                                                      plan.id
                                                                    ? 'border-blue-300 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-800/40'
                                                                    : 'border-gray-300 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                                                : 'hover:border-gray-400 hover:bg-gray-100 dark:hover:border-gray-500 dark:hover:bg-gray-700'
                                                        }`}
                                                        onClick={() =>
                                                            handlePlanSelect(
                                                                plan,
                                                            )
                                                        }
                                                        variant={
                                                            selectedPlan?.id ===
                                                            plan.id
                                                                ? 'outline'
                                                                : 'outline'
                                                        }
                                                        disabled={
                                                            activeSubscription
                                                                ?.plan.id ===
                                                            plan.id
                                                        }
                                                        title={
                                                            activeSubscription
                                                                ?.plan.id ===
                                                            plan.id
                                                                ? 'You are already subscribed to this plan'
                                                                : ''
                                                        }
                                                    >
                                                        {activeSubscription
                                                            ?.plan.id ===
                                                        plan.id
                                                            ? "✓ You're subscribed"
                                                            : selectedPlan?.id ===
                                                                plan.id
                                                              ? 'Selected'
                                                              : 'Select Plan'}
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="col-span-3 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <p>
                                                {currencyFilter
                                                    ? `No ${billingPeriod} plans available in ${currencyFilter} currency.`
                                                    : `No ${billingPeriod} plans are currently available.`}
                                            </p>
                                            {currencyFilter && (
                                                <p className="mt-2 text-sm">
                                                    Try selecting a different
                                                    currency or clear the filter
                                                    to see all plans.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {selectedPlan && (
                                    <div className="mt-8 border-t pt-6 dark:border-gray-700">
                                        <h3 className="mb-4 text-lg font-semibold">
                                            Complete Your Subscription
                                        </h3>

                                        {highlightedApp && (
                                            <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                                                <p className="text-sm text-green-700 dark:text-emerald-200">
                                                    <span className="font-medium">
                                                        Great choice!
                                                    </span>{' '}
                                                    You're subscribing to the{' '}
                                                    <span className="font-semibold">
                                                        {selectedPlan.name}
                                                    </span>{' '}
                                                    plan
                                                    {highlightedApp && (
                                                        <span>
                                                            {' '}
                                                            for{' '}
                                                            <span className="font-semibold">
                                                                {highlightedApp}
                                                            </span>{' '}
                                                            app
                                                        </span>
                                                    )}
                                                    .
                                                    {hasUnlimitedAccess(
                                                        selectedPlan,
                                                    )
                                                        ? ' This plan provides unlimited access to all features without using credits.'
                                                        : ' This plan provides standard access to features.'}
                                                </p>
                                            </div>
                                        )}

                                        <form
                                            onSubmit={handleSubmit}
                                            className="space-y-6"
                                        >
                                            {activeSubscription && (
                                                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                                                    <div className="flex items-start">
                                                        <div className="mr-3 mt-0.5">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-5 w-5 text-amber-500"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                                                Changing Your
                                                                Subscription
                                                            </h5>
                                                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                                                You already have
                                                                an active
                                                                subscription to
                                                                the{' '}
                                                                <strong>
                                                                    {
                                                                        activeSubscription
                                                                            .plan
                                                                            .name
                                                                    }
                                                                </strong>{' '}
                                                                plan. If you
                                                                subscribe to
                                                                this new plan,
                                                                your current
                                                                subscription
                                                                will be
                                                                automatically
                                                                cancelled and
                                                                replaced with
                                                                the new plan.
                                                                Your new
                                                                benefits will be
                                                                available
                                                                immediately.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                                                            Payment Information
                                                        </h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            After selecting your
                                                            plan, visit any
                                                            nearby Neulify
                                                            partner location to
                                                            complete your
                                                            payment. Our
                                                            partners will assist
                                                            you with the payment
                                                            process and activate
                                                            your subscription.
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="auto-renew"
                                                            checked={autoRenew}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                setAutoRenew(
                                                                    checked as boolean,
                                                                )
                                                            }
                                                            disabled={
                                                                paymentMethod ===
                                                                    'cash' ||
                                                                paymentMethod ===
                                                                    'lemonsqueezy'
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor="auto-renew"
                                                            className={`cursor-pointer ${paymentMethod === 'cash' || paymentMethod === 'lemonsqueezy' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}
                                                        >
                                                            Auto-renew
                                                            subscription
                                                            {paymentMethod ===
                                                                'cash' && (
                                                                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                                                    (Not
                                                                    available
                                                                    for cash
                                                                    payments)
                                                                </span>
                                                            )}
                                                            {paymentMethod ===
                                                                'lemonsqueezy' && (
                                                                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                                                    (Required
                                                                    for credit
                                                                    card)
                                                                </span>
                                                            )}
                                                        </Label>
                                                    </div>

                                                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                                        <div className="flex items-start">
                                                            <div className="mr-3 mt-0.5">
                                                                <SparklesIcon className="h-5 w-5 text-blue-500" />
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                                    Secure
                                                                    Payment
                                                                    Process
                                                                </h5>
                                                                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                                                    Your payment
                                                                    will be
                                                                    processed
                                                                    securely at
                                                                    any Neulify
                                                                    partner
                                                                    location.
                                                                    Partners
                                                                    will provide
                                                                    you with an
                                                                    official
                                                                    receipt upon
                                                                    payment.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                                                    <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                                                        Order Summary
                                                    </h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-300">
                                                                Plan:
                                                            </span>
                                                            <span className="text-gray-900 dark:text-gray-100">
                                                                {
                                                                    selectedPlan.name
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-300">
                                                                Billing Period:
                                                            </span>
                                                            <span className="text-gray-900 dark:text-gray-100">
                                                                {billingPeriod ===
                                                                'annually'
                                                                    ? 'Annual'
                                                                    : `${Math.floor(selectedPlan.duration_in_days / 30)} months`}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-300">
                                                                Access:
                                                            </span>
                                                            <span className="text-gray-900 dark:text-gray-100">
                                                                {hasUnlimitedAccess(
                                                                    selectedPlan,
                                                                )
                                                                    ? 'Unlimited'
                                                                    : 'Standard'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between border-t pt-2 text-base font-semibold dark:border-gray-700">
                                                            <span className="text-gray-900 dark:text-gray-100">
                                                                Total:
                                                            </span>
                                                            <span className="text-gray-900 dark:text-gray-100">
                                                                {getCurrencySymbol(
                                                                    selectedPlan.currency,
                                                                )}
                                                                {Number(
                                                                    selectedPlan.price,
                                                                ).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        {paymentMethod ===
                                                            'credits' && (
                                                            <>
                                                                <div className="flex justify-between border-t pt-2 text-sm dark:border-gray-700">
                                                                    <span className="text-gray-600 dark:text-gray-300">
                                                                        Credits
                                                                        to
                                                                        Deduct:
                                                                    </span>
                                                                    <span className="text-red-600 dark:text-red-400">
                                                                        {formatCredits(
                                                                            selectedPlan.price,
                                                                        )}{' '}
                                                                        credits
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600 dark:text-gray-300">
                                                                        Your
                                                                        Balance:
                                                                    </span>
                                                                    <span className="text-green-600 dark:text-emerald-300">
                                                                        {formatCredits(
                                                                            credits,
                                                                        )}{' '}
                                                                        credits
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600 dark:text-gray-300">
                                                                        Remaining
                                                                        Balance:
                                                                    </span>
                                                                    <span className="text-blue-600 dark:text-blue-400">
                                                                        {formatCredits(
                                                                            credits -
                                                                                selectedPlan.price,
                                                                        )}{' '}
                                                                        credits
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-600 dark:text-gray-300">
                                                                        Credits
                                                                        to
                                                                        Receive:
                                                                    </span>
                                                                    <span className="text-green-600 dark:text-emerald-300">
                                                                        +
                                                                        {formatCredits(
                                                                            selectedPlan.credits_per_month ||
                                                                                0,
                                                                        )}{' '}
                                                                        credits
                                                                    </span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="mt-4 border-t pt-4 dark:border-gray-700">
                                                        <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                                                            Payment Method
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {selectedPlan?.currency ===
                                                                'PHP' && (
                                                                <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
                                                                    <input
                                                                        type="radio"
                                                                        name="payment_method"
                                                                        value="cash"
                                                                        checked={
                                                                            paymentMethod ===
                                                                            'cash'
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setPaymentMethod(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className="h-4 w-4 text-green-600"
                                                                    />
                                                                    <BanknotesIcon className="h-5 w-5 text-green-600" />
                                                                    <div>
                                                                        <span className="block font-medium text-gray-900 dark:text-gray-100">
                                                                            Cash
                                                                            Payment
                                                                        </span>
                                                                        <span className="block text-sm text-gray-500 dark:text-gray-400">
                                                                            Pay
                                                                            at
                                                                            nearby
                                                                            Neulify
                                                                            partners
                                                                        </span>
                                                                    </div>
                                                                </label>
                                                            )}
                                                            {selectedPlan?.currency ===
                                                                'PHP' && (
                                                                <label
                                                                    className={`flex items-center space-x-3 rounded-lg border p-3 dark:border-gray-600 ${
                                                                        credits >=
                                                                        (selectedPlan?.price ||
                                                                            0)
                                                                            ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                                                                            : 'cursor-not-allowed opacity-50'
                                                                    }`}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name="payment_method"
                                                                        value="credits"
                                                                        checked={
                                                                            paymentMethod ===
                                                                            'credits'
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setPaymentMethod(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            credits <
                                                                            (selectedPlan?.price ||
                                                                                0)
                                                                        }
                                                                        className={`h-4 w-4 ${
                                                                            credits >=
                                                                            (selectedPlan?.price ||
                                                                                0)
                                                                                ? 'text-green-600'
                                                                                : 'text-gray-400'
                                                                        }`}
                                                                    />
                                                                    <SparklesIcon
                                                                        className={`h-5 w-5 ${credits >= (selectedPlan?.price || 0) ? 'text-blue-600' : 'text-gray-400'}`}
                                                                    />
                                                                    <div>
                                                                        <span className="block font-medium text-gray-900 dark:text-gray-100">
                                                                            Pay
                                                                            with
                                                                            Credits
                                                                        </span>
                                                                        <span className="block text-sm text-gray-500 dark:text-gray-400">
                                                                            {credits >=
                                                                            (selectedPlan?.price ||
                                                                                0)
                                                                                ? `Use your ${credits.toLocaleString()} available credits`
                                                                                : `Insufficient credits. You have ${credits.toLocaleString()} credits but need ${selectedPlan?.price || 0} credits`}
                                                                        </span>
                                                                    </div>
                                                                </label>
                                                            )}
                                                            <label
                                                                className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-all ${
                                                                    paymentMethod ===
                                                                    'lemonsqueezy'
                                                                        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                                                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name="payment_method"
                                                                    value="lemonsqueezy"
                                                                    checked={
                                                                        paymentMethod ===
                                                                        'lemonsqueezy'
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setPaymentMethod(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 text-blue-600"
                                                                />
                                                                <CreditCardIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                                <div>
                                                                    <span className="block font-medium text-gray-900 dark:text-gray-100">
                                                                        Credit/Debit
                                                                        Card{' '}
                                                                        <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
                                                                            via
                                                                            Lemon
                                                                            Squeezy
                                                                        </span>
                                                                    </span>
                                                                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                                                                        Secure
                                                                        online
                                                                        payment
                                                                        gateway
                                                                    </span>
                                                                </div>
                                                            </label>
                                                            <label className="flex cursor-not-allowed items-center space-x-3 rounded-lg border p-3 opacity-50 dark:border-gray-600">
                                                                <input
                                                                    type="radio"
                                                                    name="payment_method"
                                                                    value="stripe"
                                                                    disabled
                                                                    className="h-4 w-4 text-gray-400"
                                                                />
                                                                <CreditCardIcon className="h-5 w-5 text-gray-400" />
                                                                <div>
                                                                    <span className="block font-medium text-gray-900 dark:text-gray-100">
                                                                        Credit/Debit
                                                                        Card{' '}
                                                                        <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
                                                                            via
                                                                            Stripe
                                                                        </span>
                                                                    </span>
                                                                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                                                                        Coming
                                                                        soon
                                                                    </span>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div>
                                                    {networkError && (
                                                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                                                            <p>
                                                                There was a
                                                                problem
                                                                connecting to
                                                                the payment
                                                                gateway. Please
                                                                try again.
                                                            </p>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="mt-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                                                                onClick={
                                                                    handleSubmit
                                                                }
                                                            >
                                                                Retry
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex justify-end pr-4">
                                                    {canEdit && (
                                                        <Button
                                                            type="submit"
                                                            disabled={
                                                                isSubmitting ||
                                                                !selectedPlan
                                                            }
                                                            className="min-w-[150px] transform rounded-lg border-0 bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl"
                                                        >
                                                            {isSubmitting
                                                                ? 'Processing...'
                                                                : 'Subscribe Now'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="mt-6">
                            <div className="overflow-hidden bg-white p-6 shadow-sm dark:bg-gray-900 sm:rounded-lg">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        Subscription History
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Track all your subscription activities
                                        and payment history
                                    </p>
                                </div>

                                {subscriptionHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {subscriptionHistory.map(
                                            (subscription) => (
                                                <Card
                                                    key={subscription.id}
                                                    className="overflow-hidden border border-gray-200 bg-gray-50 transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                                                >
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="mb-2 flex items-center space-x-3">
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                                                                        <svg
                                                                            className="h-5 w-5 text-white"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="2"
                                                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                                            {
                                                                                subscription
                                                                                    .plan
                                                                                    .name
                                                                            }
                                                                        </h4>
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                            Transaction
                                                                            ID:{' '}
                                                                            {
                                                                                subscription.payment_transaction_id
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <Badge
                                                                    className={`px-3 py-1 text-xs font-medium ${
                                                                        subscription.status ===
                                                                        'active'
                                                                            ? 'border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
                                                                            : subscription.status ===
                                                                                'cancelled'
                                                                              ? 'border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                                                                              : subscription.status ===
                                                                                  'pending'
                                                                                ? 'border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                                                                : subscription.status ===
                                                                                    'failed'
                                                                                  ? 'border border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
                                                                                  : 'border-gray-200 bg-gray-100 text-gray-800 dark:border-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                                                                    }`}
                                                                >
                                                                    {subscription.status
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase() +
                                                                        subscription.status.slice(
                                                                            1,
                                                                        )}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </CardHeader>

                                                    <CardContent className="pt-0">
                                                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                                            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                                    Start Date
                                                                </p>
                                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                    {formatDate(
                                                                        subscription.start_date,
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                                    End Date
                                                                </p>
                                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                    {formatDate(
                                                                        subscription.end_date,
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                                    Amount Paid
                                                                </p>
                                                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                                    ₱
                                                                    {Number(
                                                                        subscription.amount_paid,
                                                                    ).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                                    Auto Renew
                                                                </p>
                                                                <div className="flex items-center space-x-2">
                                                                    {subscription.auto_renew ? (
                                                                        <>
                                                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                                                Enabled
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                                                Disabled
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                                                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                                <span className="flex items-center">
                                                                    <svg
                                                                        className="mr-1 h-4 w-4"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                        />
                                                                    </svg>
                                                                    Created{' '}
                                                                    {formatDate(
                                                                        subscription.created_at,
                                                                    )}
                                                                </span>
                                                                {subscription.cancelled_at && (
                                                                    <span className="flex items-center">
                                                                        <svg
                                                                            className="mr-1 h-4 w-4"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="2"
                                                                                d="M6 18L18 6M6 6l12 12"
                                                                            />
                                                                        </svg>
                                                                        Cancelled{' '}
                                                                        {formatDate(
                                                                            subscription.cancelled_at,
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center space-x-2">
                                                                {subscription.status ===
                                                                    'active' &&
                                                                    canDelete && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="border-red-300 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                                                            onClick={() =>
                                                                                openCancelDialog(
                                                                                    subscription.identifier,
                                                                                )
                                                                            }
                                                                        >
                                                                            <svg
                                                                                className="mr-1 h-4 w-4"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth="2"
                                                                                    d="M6 18L18 6M6 6l12 12"
                                                                                />
                                                                            </svg>
                                                                            Cancel
                                                                            Subscription
                                                                        </Button>
                                                                    )}
                                                            </div>
                                                        </div>

                                                        {subscription.cancellation_reason && (
                                                            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                                                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                                                    <span className="font-medium">
                                                                        Cancellation
                                                                        Reason:
                                                                    </span>{' '}
                                                                    {
                                                                        subscription.cancellation_reason
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                            <svg
                                                className="h-8 w-8 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                                            No Subscription History
                                        </h4>
                                        <p className="mx-auto max-w-md text-gray-500 dark:text-gray-400">
                                            You haven't made any subscriptions
                                            yet. Start your journey by exploring
                                            our premium plans.
                                        </p>
                                        <Button
                                            className="mt-4"
                                            onClick={() =>
                                                setActiveTab('plans')
                                            }
                                        >
                                            Browse Plans
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Cancel Subscription Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel your subscription?
                            You will lose unlimited access to all features at
                            the end of your current billing period.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div>
                            <Label htmlFor="cancellation-reason">
                                Reason for cancellation (optional)
                            </Label>
                            <Input
                                id="cancellation-reason"
                                value={cancellationReason}
                                onChange={(e) =>
                                    setCancellationReason(e.target.value)
                                }
                                placeholder="Tell us why you're cancelling"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCancelDialogOpen(false)}
                        >
                            Keep Subscription
                        </Button>
                        {canDelete && (
                            <Button
                                variant="destructive"
                                onClick={handleCancelSubscription}
                            >
                                Cancel Subscription
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Steps Dialog */}
            <Dialog open={showPaymentSteps} onOpenChange={setShowPaymentSteps}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Complete Your Cash Payment</DialogTitle>
                        <DialogDescription>
                            Follow these steps to complete your subscription
                            payment
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <ol className="space-y-4">
                            <li className="flex items-start">
                                <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                    1
                                </span>
                                <div>
                                    <p className="font-medium">
                                        Visit a Neulify Partner
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Visit any nearby Neulify partner
                                        location during their business hours
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                    2
                                </span>
                                <div>
                                    <p className="font-medium">
                                        Present Your Details
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Show your subscription details to our
                                        staff
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                    3
                                </span>
                                <div>
                                    <p className="font-medium">Make Payment</p>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Pay the amount of{' '}
                                        {getCurrencySymbol(
                                            selectedPlan?.currency,
                                        )}
                                        {Number(selectedPlan?.price).toFixed(2)}{' '}
                                        in cash
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                    4
                                </span>
                                <div>
                                    <p className="font-medium">Get Access</p>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Receive your receipt and get immediate
                                        access to your subscription
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowPaymentSteps(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmCashPayment}>
                            Confirm & Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SubscriptionLayout>
    );
}
