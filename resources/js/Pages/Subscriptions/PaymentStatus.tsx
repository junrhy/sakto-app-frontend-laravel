import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
    status: 'success' | 'failure' | 'cancelled';
    message: string;
    subscription?: {
        plan: {
            name: string;
            credits_per_month: number;
        };
        end_date: string;
    };
}

export default function PaymentStatus({ auth, status, message, subscription }: Props) {
    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Payment Status</h2>}
        >
            <Head title="Payment Status" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <Card className="overflow-hidden">
                        <CardHeader className={`text-white ${
                            status === 'success' ? 'bg-green-600' : 
                            status === 'failure' ? 'bg-red-600' : 'bg-orange-500'
                        }`}>
                            <div className="flex items-center justify-center mb-4">
                                {status === 'success' ? (
                                    <CheckCircleIcon className="h-16 w-16 text-white" />
                                ) : status === 'failure' ? (
                                    <XCircleIcon className="h-16 w-16 text-white" />
                                ) : (
                                    <ExclamationTriangleIcon className="h-16 w-16 text-white" />
                                )}
                            </div>
                            <CardTitle className="text-center text-2xl">
                                {status === 'success' ? 'Payment Successful' : 
                                 status === 'failure' ? 'Payment Failed' : 'Payment Cancelled'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                                {message}
                            </p>

                            {status === 'success' && subscription && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                                    <h3 className="font-medium text-lg mb-2">Subscription Details</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Plan:</span>
                                            <span className="font-medium">{subscription.plan.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Monthly Credits:</span>
                                            <span className="font-medium">{subscription.plan.credits_per_month.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Valid Until:</span>
                                            <span className="font-medium">{formatDate(subscription.end_date)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(status === 'failure' || status === 'cancelled') && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                                    <h3 className="font-medium text-lg mb-2">What to do next?</h3>
                                    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                                        {status === 'failure' ? (
                                            <>
                                                <li>Check your payment details and try again</li>
                                                <li>Ensure you have sufficient funds in your account</li>
                                                <li>Contact your bank if the issue persists</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>You can try subscribing again whenever you're ready</li>
                                                <li>Browse our other subscription plans that might better suit your needs</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-center gap-4 p-6 bg-gray-50 dark:bg-gray-800">
                            <Button asChild>
                                <Link href={route('subscriptions.index')}>
                                    {status === 'success' ? 'View Subscription' : 'Try Again'}
                                </Link>
                            </Button>
                            {(status === 'failure' || status === 'cancelled') && (
                                <Button variant="outline" asChild>
                                    <Link href={route('home')}>
                                        Go to Dashboard
                                    </Link>
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 