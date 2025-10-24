import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { Clock, Mail, MapPin, Phone, ShoppingBag } from 'lucide-react';

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
                    <div className="mb-8 text-center">
                        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
                            {store.name}
                        </h1>
                        {store.description && (
                            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                                {store.description}
                            </p>
                        )}
                    </div>

                    {/* Store Info Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="bg-white shadow-lg dark:bg-gray-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center text-lg">
                                    <ShoppingBag className="mr-2 h-5 w-5 text-blue-500" />
                                    Order Process
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center">
                                        <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                1
                                            </span>
                                        </div>
                                        Browse Menu & Add Items
                                    </div>
                                    <div className="flex items-center">
                                        <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                2
                                            </span>
                                        </div>
                                        {store.verification_required ===
                                        'manual'
                                            ? 'Order Verification'
                                            : 'Place Order'}
                                    </div>
                                    <div className="flex items-center">
                                        <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                3
                                            </span>
                                        </div>
                                        {store.payment_negotiation_enabled
                                            ? 'Payment Discussion'
                                            : 'Payment'}
                                    </div>
                                    <div className="flex items-center">
                                        <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                4
                                            </span>
                                        </div>
                                        Delivery
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-lg dark:bg-gray-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center text-lg">
                                    <Clock className="mr-2 h-5 w-5 text-green-500" />
                                    Order Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    {store.verification_required ===
                                        'manual' && (
                                        <div className="flex items-center">
                                            <div className="mr-3 h-2 w-2 rounded-full bg-yellow-400"></div>
                                            Manual verification required
                                        </div>
                                    )}
                                    {store.payment_negotiation_enabled && (
                                        <div className="flex items-center">
                                            <div className="mr-3 h-2 w-2 rounded-full bg-blue-400"></div>
                                            Payment negotiation available
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <div className="mr-3 h-2 w-2 rounded-full bg-green-400"></div>
                                        Real-time order tracking
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-lg dark:bg-gray-800">
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
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl"
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
