import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { ShoppingBag, MapPin, Clock, Phone, Mail } from 'lucide-react';
import React from 'react';
import { Head, Link } from '@inertiajs/react';

interface OnlineStore {
    id: number;
    name: string;
    description: string;
    domain: string;
    verification_required: string;
    payment_negotiation_enabled: boolean;
    settings: any;
}

interface OnlineStoreProps {
    store: OnlineStore;
    domain: string;
}

export default function OnlineStore({ store, domain }: OnlineStoreProps) {
    return (
        <>
            <Head title={`${store.name} - Online Store`} />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            {store.name}
                        </h1>
                        {store.description && (
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                {store.description}
                            </p>
                        )}
                    </div>

                    {/* Store Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-white dark:bg-gray-800 shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center text-lg">
                                    <ShoppingBag className="mr-2 h-5 w-5 text-blue-500" />
                                    Order Process
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">1</span>
                                        </div>
                                        Browse Menu & Add Items
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">2</span>
                                        </div>
                                        {store.verification_required === 'manual' ? 'Order Verification' : 'Place Order'}
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">3</span>
                                        </div>
                                        {store.payment_negotiation_enabled ? 'Payment Discussion' : 'Payment'}
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">4</span>
                                        </div>
                                        Delivery
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-gray-800 shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center text-lg">
                                    <Clock className="mr-2 h-5 w-5 text-green-500" />
                                    Order Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    {store.verification_required === 'manual' && (
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                                            Manual verification required
                                        </div>
                                    )}
                                    {store.payment_negotiation_enabled && (
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                            Payment negotiation available
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                        Real-time order tracking
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white dark:bg-gray-800 shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center text-lg">
                                    <MapPin className="mr-2 h-5 w-5 text-red-500" />
                                    Contact Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center">
                                        <Phone className="mr-2 h-4 w-4" />
                                        Call for assistance
                                    </div>
                                    <div className="flex items-center">
                                        <Mail className="mr-2 h-4 w-4" />
                                        Email support available
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="text-center">
                        <Link href={`/fnb/store/${domain}/menu`}>
                            <Button 
                                size="lg" 
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                View Menu & Order Now
                            </Button>
                        </Link>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
                        <p>Powered by Neulify Food Delivery System</p>
                    </div>
                </div>
            </div>
        </>
    );
}
