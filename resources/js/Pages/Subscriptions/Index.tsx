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

    // Check URL parameters for plan to highlight
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const highlightPlan = params.get('highlight_plan');
        const appName = params.get('app');
        
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
    }, [plans]);

    // Set payment method to credit_card when a plan is selected
    useEffect(() => {
        if (selectedPlan) {
            setPaymentMethod('credit_card');
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

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('plan_id', selectedPlan.id.toString());
        formData.append('payment_method', paymentMethod);
        formData.append('auto_renew', autoRenew ? '1' : '0');
        
        router.post(route('subscriptions.subscribe'), formData, {
            onError: (errors) => {
                console.error(errors);
                toast.error('Failed to process subscription');
                setIsSubmitting(false);
            }
        });
        // Note: We don't need onSuccess handler as the controller will redirect to Maya checkout
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
            <Head title="Unlimited Access Subscription Plans" />

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
                            <TabsTrigger value="plans">Unlimited Access Plans</TabsTrigger>
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
                                                    selectedPlan?.id === plan.id 
                                                        ? 'ring-2 ring-blue-500 dark:ring-blue-400' + (highlightedApp ? ' shadow-lg shadow-blue-200 dark:shadow-blue-900/30' : '')
                                                        : 'hover:shadow-md'
                                                }`}
                                            >
                                                {plan.is_popular && (
                                                    <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">
                                                        Most Popular
                                                    </div>
                                                )}
                                                {plan.badge_text && !plan.is_popular && (
                                                    <div className="bg-green-500 text-white text-center py-1 text-sm font-medium">
                                                        {plan.badge_text}
                                                    </div>
                                                )}
                                                {!plan.badge_text && !plan.is_popular && hasUnlimitedAccess(plan) && (
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
                                                            {hasUnlimitedAccess(plan) ? 'Unlimited access to all features' : 'Standard access'}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        {hasUnlimitedAccess(plan) && (
                                                            <>
                                                                <div className="flex items-start">
                                                                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                                                    <span className="text-sm font-semibold">No credit usage</span>
                                                                </div>
                                                            </>
                                                        )}
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
                                                    >
                                                        {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="font-medium mb-2">Payment Information</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            You'll be redirected to Maya's secure payment page to complete your payment after clicking "Subscribe Now".
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
                                                                <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300">Secure Payment</h5>
                                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                                    Your payment will be securely processed by Maya Business, a leading payment provider in the Philippines.
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
                                                        <div className="text-sm space-y-1">
                                                            <p><span className="font-medium">Credit/Debit Card via Maya</span></p>
                                                            <p>Secure online payment via Maya Business</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-end">
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
                                                    <TableCell>₱{subscription.amount_paid.toFixed(2)}</TableCell>
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
        </AuthenticatedLayout>
    );
} 