import React, { useState, useMemo, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { SparklesIcon, ArrowRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/Components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Checkbox } from '@/Components/ui/checkbox';

interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    duration_in_days: number;
    unlimited_access: boolean;
    features: string[];
    is_popular: boolean;
    is_active: boolean;
    badge_text: string | null;
}

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

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
    plans: SubscriptionPlan[];
    activeSubscription: UserSubscription | null;
    paymentMethods: PaymentMethod[];
    subscriptionHistory: UserSubscription[];
}

export default function Index({ auth, plans, activeSubscription, paymentMethods, subscriptionHistory }: Props) {
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [transactionId, setTransactionId] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [autoRenew, setAutoRenew] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [subscriptionToCancel, setSubscriptionToCancel] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('plans');
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');
    const [highlightedApp, setHighlightedApp] = useState<string | null>(null);
    const [networkError, setNetworkError] = useState(false);
    const [showPaymentSteps, setShowPaymentSteps] = useState(false);

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
            const planToHighlight = plans.find(plan => plan.slug === highlightPlan);
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

    // Set payment method to cash when a plan is selected
    useEffect(() => {
        if (selectedPlan) {
            setPaymentMethod('cash');
        }
    }, [selectedPlan]);

    // Filter and transform plans based on billing period
    const filteredPlans = useMemo(() => {
        return plans.filter(plan => {
            // For monthly, show plans with duration <= 90 days (approximately 3 months)
            // For annually, show plans with duration > 90 days
            if (billingPeriod === 'monthly') {
                return plan.duration_in_days <= 90;
            } else {
                return plan.duration_in_days > 90;
            }
        });
    }, [plans, billingPeriod]);

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
            sessionStorage.setItem('subscription_plan_id', selectedPlan.id.toString());
            sessionStorage.setItem('subscription_payment_method', paymentMethod);
            sessionStorage.setItem('subscription_auto_renew', autoRenew ? '1' : '0');
            
            if (paymentMethod === 'cash') {
                // Show payment steps dialog for cash payments
                setShowPaymentSteps(true);
                setIsSubmitting(false);
                return;
            }
            
            // Create a hidden form and submit it directly
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = route('subscriptions.subscribe');
            
            // Add CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
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
                    duration: 5000 // 5 seconds
                });
            } else {
                toast.loading('Connecting to payment gateway...', {
                    id: 'payment-loading',
                    duration: 10000 // 10 seconds
                });
            }
            
            // Set a timeout to dismiss the loading toast if the form submission takes too long
            setTimeout(() => {
                toast.dismiss('payment-loading');
                setIsSubmitting(false);
                setNetworkError(true);
            }, paymentMethod === 'cash' ? 5000 : 10000);
            
            // Submit the form
            form.submit();
            
        } catch (error) {
            // Dismiss the loading toast
            toast.dismiss('payment-loading');
            
            console.error('Subscription submission error:', error);
            toast.error('An error occurred while processing your request. Please try again.');
            
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
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
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

        router.post(route('subscriptions.cancel', { identifier: subscriptionToCancel }), {
            cancellation_reason: cancellationReason
        }, {
            onSuccess: () => {
                toast.success('Subscription cancelled successfully');
                setCancelDialogOpen(false);
                setCancellationReason('');
                setSubscriptionToCancel(null);
            },
            onError: () => {
                toast.error('Failed to cancel subscription');
            }
        });
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM d, yyyy');
    };

    // Helper function to check if a plan has unlimited access
    const hasUnlimitedAccess = (plan: SubscriptionPlan) => {
        return plan.unlimited_access === true;
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Subscription Plans</h2>}
        >
            <Head title="Premium Plans Subscription" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Active Subscription Banner */}
                    {activeSubscription && (
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 text-white p-6 rounded-lg shadow-lg mb-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">Active Subscription: {activeSubscription.plan.name}</h3>
                                    <p className="text-blue-100">
                                        Valid until {formatDate(activeSubscription.end_date)} • Unlimited access to all features
                                    </p>
                                </div>
                                <Button 
                                    variant="destructive" 
                                    className="bg-white/10 hover:bg-white/20 text-white border-0"
                                    onClick={() => openCancelDialog(activeSubscription.identifier)}
                                >
                                    Cancel Subscription
                                </Button>
                            </div>
                        </div>
                    )}

                    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="plans">Premium Plans</TabsTrigger>
                            <TabsTrigger value="history">Subscription History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="plans" className="mt-6">
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                                {/* Billing Period Toggle */}
                                <div className="mb-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                        <h3 className="text-lg font-semibold">Choose a Plan</h3>
                                        <div className="mt-2 sm:mt-0">
                                            <Tabs 
                                                value={billingPeriod} 
                                                onValueChange={(value) => {
                                                    setBillingPeriod(value as 'monthly' | 'annually');
                                                    setSelectedPlan(null);
                                                }}
                                                className="w-full"
                                            >
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                                                    <TabsTrigger value="annually">Annually</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {billingPeriod === 'annually' ? 
                                            'Annual plans offer better value and are billed once per year.' : 
                                            'Monthly plans offer more flexibility with a shorter commitment period.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {filteredPlans.length > 0 ? (
                                        filteredPlans.map((plan) => (
                                            <Card 
                                                key={plan.id} 
                                                className={`overflow-hidden transition-all ${
                                                    activeSubscription?.plan.id === plan.id
                                                        ? 'ring-2 ring-green-500 dark:ring-green-400 bg-green-50 dark:bg-green-900/10'
                                                        : selectedPlan?.id === plan.id 
                                                            ? 'ring-2 ring-blue-500 dark:ring-blue-400' + (highlightedApp ? ' shadow-lg shadow-blue-200 dark:shadow-blue-900/30' : '')
                                                            : 'hover:shadow-md'
                                                }`}
                                            >
                                                {activeSubscription?.plan.id === plan.id && (
                                                    <div className="bg-green-500 text-white text-center py-1 text-sm font-medium">
                                                        Current Subscription
                                                    </div>
                                                )}
                                                {plan.is_popular && activeSubscription?.plan.id !== plan.id && (
                                                    <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">
                                                        Most Popular
                                                    </div>
                                                )}
                                                {plan.badge_text && !plan.is_popular && activeSubscription?.plan.id !== plan.id && (
                                                    <div className="bg-green-500 text-white text-center py-1 text-sm font-medium">
                                                        {plan.badge_text}
                                                    </div>
                                                )}
                                                {!plan.badge_text && !plan.is_popular && hasUnlimitedAccess(plan) && activeSubscription?.plan.id !== plan.id && (
                                                    <div className="bg-purple-500 text-white text-center py-1 text-sm font-medium">
                                                        Unlimited Access
                                                    </div>
                                                )}
                                                <CardHeader>
                                                    <CardTitle className="flex justify-between items-center">
                                                        <span>{plan.name}</span>
                                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                            ₱{Number(plan.price).toFixed(2)}
                                                        </span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {billingPeriod === 'annually' ? 'Annual subscription' : `${Math.floor(plan.duration_in_days / 30)} month subscription`}
                                                            {billingPeriod === 'annually' && (
                                                                <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                                                                    Save up to 20%
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-lg font-semibold mt-1 text-green-600 dark:text-green-400">
                                                            {hasUnlimitedAccess(plan) ? 'Access to Premium apps' : 'Access to Free apps'}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        {plan.features && plan.features.map((feature, index) => (
                                                            <div key={index} className="flex items-start">
                                                                <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                                                <span className="text-sm">{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button 
                                                        className="w-full" 
                                                        onClick={() => handlePlanSelect(plan)}
                                                        variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                                                        disabled={activeSubscription?.plan.id === plan.id}
                                                        title={activeSubscription?.plan.id === plan.id ? "You are already subscribed to this plan" : ""}
                                                    >
                                                        {activeSubscription?.plan.id === plan.id 
                                                            ? 'Current Plan' 
                                                            : selectedPlan?.id === plan.id 
                                                                ? 'Selected' 
                                                                : 'Select Plan'}
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
                                            <p>No {billingPeriod} plans are currently available.</p>
                                        </div>
                                    )}
                                </div>

                                {selectedPlan && (
                                    <div className="mt-8 border-t pt-6 dark:border-gray-700">
                                        <h3 className="text-lg font-semibold mb-4">Complete Your Subscription</h3>
                                        
                                        {highlightedApp && (
                                            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                                <p className="text-sm text-green-700 dark:text-green-300">
                                                    <span className="font-medium">Great choice!</span> You're subscribing to the <span className="font-semibold">{selectedPlan.name}</span> plan 
                                                    {highlightedApp && <span> for <span className="font-semibold">{highlightedApp}</span> app</span>}.
                                                    {hasUnlimitedAccess(selectedPlan) 
                                                        ? ' This plan provides unlimited access to all features without using credits.'
                                                        : ' This plan provides standard access to features.'}
                                                </p>
                                            </div>
                                        )}
                                        
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {activeSubscription && (
                                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md mb-4">
                                                    <div className="flex items-start">
                                                        <div className="mr-3 mt-0.5">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-medium text-amber-700 dark:text-amber-300">Changing Your Subscription</h5>
                                                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                                You already have an active subscription to the <strong>{activeSubscription.plan.name}</strong> plan. 
                                                                If you subscribe to this new plan, your current subscription will be automatically cancelled and 
                                                                replaced with the new plan. Your new benefits will be available immediately.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="font-medium mb-2">Payment Information</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            After selecting your plan, you'll need to visit our office to complete the payment in cash.
                                                            Our staff will assist you with the payment process and activate your subscription.
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id="auto-renew" 
                                                            checked={autoRenew}
                                                            onCheckedChange={(checked) => setAutoRenew(checked as boolean)}
                                                        />
                                                        <Label htmlFor="auto-renew" className="cursor-pointer">
                                                            Auto-renew subscription
                                                        </Label>
                                                    </div>
                                                    
                                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                                        <div className="flex items-start">
                                                            <div className="mr-3 mt-0.5">
                                                                <SparklesIcon className="h-5 w-5 text-blue-500" />
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300">Secure Payment Process</h5>
                                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                                    Your payment will be processed securely at our office. Our staff will provide you with an official receipt upon payment.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                                    <h4 className="font-medium mb-2">Order Summary</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>Plan:</span>
                                                            <span>{selectedPlan.name}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Billing Period:</span>
                                                            <span>{billingPeriod === 'annually' ? 'Annual' : `${Math.floor(selectedPlan.duration_in_days / 30)} months`}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Access:</span>
                                                            <span>{hasUnlimitedAccess(selectedPlan) ? 'Unlimited' : 'Standard'}</span>
                                                        </div>
                                                        <div className="flex justify-between font-semibold text-base pt-2 border-t dark:border-gray-700">
                                                            <span>Total:</span>
                                                            <span>₱{Number(selectedPlan.price).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                                        <h4 className="font-medium mb-2">Payment Method</h4>
                                                        <div className="space-y-3">
                                                            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-100">
                                                                <input 
                                                                    type="radio" 
                                                                    name="payment_method" 
                                                                    value="cash" 
                                                                    checked={paymentMethod === 'cash'}
                                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                                    className="h-4 w-4 text-green-600" 
                                                                />
                                                                <div>
                                                                    <span className="block font-medium text-gray-900">Cash Payment</span>
                                                                    <span className="block text-sm text-gray-500">Pay in cash at our office</span>
                                                                </div>
                                                            </label>
                                                            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-not-allowed opacity-50">
                                                                <input 
                                                                    type="radio" 
                                                                    name="payment_method" 
                                                                    value="maya" 
                                                                    disabled
                                                                    className="h-4 w-4 text-gray-400" 
                                                                />
                                                                <div>
                                                                    <span className="block font-medium text-gray-900">Credit/Debit Card via Maya</span>
                                                                    <span className="block text-sm text-gray-500">Coming soon</span>
                                                                </div>
                                                            </label>
                                                            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-not-allowed opacity-50">
                                                                <input 
                                                                    type="radio" 
                                                                    name="payment_method" 
                                                                    value="stripe" 
                                                                    disabled
                                                                    className="h-4 w-4 text-gray-400" 
                                                                />
                                                                <div>
                                                                    <span className="block font-medium text-gray-900">Credit/Debit Card via Stripe</span>
                                                                    <span className="block text-sm text-gray-500">Coming soon</span>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-end">
                                                {networkError && (
                                                    <div className="mr-auto p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm">
                                                        <p>There was a problem connecting to the payment gateway. Please try again.</p>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
                                                            onClick={handleSubmit}
                                                        >
                                                            Retry
                                                        </Button>
                                                    </div>
                                                )}
                                                <Button 
                                                    type="submit" 
                                                    disabled={isSubmitting || !selectedPlan}
                                                    className="min-w-[150px]"
                                                >
                                                    {isSubmitting ? 'Processing...' : 'Subscribe Now'}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="mt-6">
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Subscription History</h3>
                                
                                {subscriptionHistory.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Plan</TableHead>
                                                <TableHead>Start Date</TableHead>
                                                <TableHead>End Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subscriptionHistory.map((subscription) => (
                                                <TableRow key={subscription.id}>
                                                    <TableCell className="font-medium">{subscription.plan.name}</TableCell>
                                                    <TableCell>{formatDate(subscription.start_date)}</TableCell>
                                                    <TableCell>{formatDate(subscription.end_date)}</TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            className={
                                                                subscription.status === 'active' 
                                                                    ? 'bg-green-500 hover:bg-green-600' 
                                                                    : subscription.status === 'cancelled'
                                                                    ? 'bg-orange-500 hover:bg-orange-600'
                                                                    : subscription.status === 'pending'
                                                                    ? 'bg-blue-500 hover:bg-blue-600'
                                                                    : subscription.status === 'failed'
                                                                    ? 'bg-red-500 hover:bg-red-600'
                                                                    : 'bg-gray-500 hover:bg-gray-600'
                                                            }
                                                        >
                                                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>₱{Number(subscription.amount_paid).toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        {subscription.status === 'active' && (
                                                            <Button 
                                                                variant="destructive" 
                                                                size="sm"
                                                                onClick={() => openCancelDialog(subscription.identifier)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <p>You don't have any subscription history yet.</p>
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
                            Are you sure you want to cancel your subscription? You will lose unlimited access to all features at the end of your current billing period.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-2">
                        <div>
                            <Label htmlFor="cancellation-reason">Reason for cancellation (optional)</Label>
                            <Input 
                                id="cancellation-reason" 
                                value={cancellationReason} 
                                onChange={(e) => setCancellationReason(e.target.value)}
                                placeholder="Tell us why you're cancelling"
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                            Keep Subscription
                        </Button>
                        <Button variant="destructive" onClick={handleCancelSubscription}>
                            Cancel Subscription
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Steps Dialog */}
            <Dialog open={showPaymentSteps} onOpenChange={setShowPaymentSteps}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Complete Your Cash Payment</DialogTitle>
                        <DialogDescription>
                            Follow these steps to complete your subscription payment
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <ol className="space-y-4">
                            <li className="flex items-start">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-medium mr-3 flex-shrink-0">1</span>
                                <div>
                                    <p className="font-medium">Visit Our Office</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Come to our office during business hours (Monday to Friday, 9:00 AM - 5:00 PM)
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-medium mr-3 flex-shrink-0">2</span>
                                <div>
                                    <p className="font-medium">Present Your Details</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Show your subscription details to our staff
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-medium mr-3 flex-shrink-0">3</span>
                                <div>
                                    <p className="font-medium">Make Payment</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Pay the amount of ₱{Number(selectedPlan?.price).toFixed(2)} in cash
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-medium mr-3 flex-shrink-0">4</span>
                                <div>
                                    <p className="font-medium">Get Access</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Receive your receipt and get immediate access to your subscription
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentSteps(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmCashPayment}>
                            Confirm & Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
} 