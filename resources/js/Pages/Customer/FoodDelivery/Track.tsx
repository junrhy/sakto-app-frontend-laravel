import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { SearchIcon, PackageIcon, ClockIcon, MapPinIcon, CheckCircleIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { FoodDeliveryOrder } from './types';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {
    reference?: string;
}

export default function FoodDeliveryTrack({ auth, reference: initialReference }: Props) {
    const [reference, setReference] = useState(initialReference || '');
    const [order, setOrder] = useState<FoodDeliveryOrder | null>(null);
    const [loading, setLoading] = useState(false);

    const searchOrder = async () => {
        if (!reference.trim()) {
            toast.error('Please enter an order reference');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`/food-delivery/track-by-reference/${reference}`);
            if (response.data.success) {
                setOrder(response.data.data);
            } else {
                toast.error('Order not found');
                setOrder(null);
            }
        } catch (error: any) {
            toast.error('Failed to track order');
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialReference) {
            searchOrder();
        }
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'accepted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'preparing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'ready': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
            case 'assigned': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'out_for_delivery': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatCurrency = (amount: number) => {
        let currency: { symbol: string; thousands_separator?: string; decimal_separator?: string };
        const appCurrency = (auth.user as any)?.app_currency;
        if (appCurrency) {
            if (typeof appCurrency === 'string') {
                currency = JSON.parse(appCurrency);
            } else {
                currency = appCurrency;
            }
        } else {
            currency = { symbol: '₱', thousands_separator: ',', decimal_separator: '.' };
        }
        return `${currency.symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <>
            <Head title="Track Order" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Track Your Order
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Enter your order reference to track your food delivery
                        </p>
                    </div>

                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Enter order reference (e.g., FD20241106ABC123)"
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && searchOrder()}
                                    />
                                </div>
                                <Button onClick={searchOrder} disabled={loading}>
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <SearchIcon className="h-4 w-4 mr-2" />
                                            Track
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {order && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Order #{order.order_reference}</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                                            {formatStatus(order.order_status)}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Restaurant</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {order.restaurant?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {formatCurrency(order.total_amount)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                                                {order.payment_method.replace('_', ' ')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Payment Status</p>
                                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                                                {order.payment_status}
                                            </p>
                                        </div>
                                    </div>

                                    {order.driver && (
                                        <div className="border-t pt-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Driver</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {order.driver.name} - {order.driver.phone}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {order.order_items && order.order_items.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Order Items</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {order.order_items.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {item.item_name} x {item.quantity}
                                                        </p>
                                                        {item.special_instructions && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {item.special_instructions}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {formatCurrency(item.subtotal)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {order.trackings && order.trackings.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tracking History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {order.trackings
                                                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                                .map((tracking, index) => (
                                                    <div key={tracking.id} className="flex gap-4">
                                                        <div className="flex flex-col items-center">
                                                            {index === 0 ? (
                                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                            ) : (
                                                                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                                            )}
                                                            {index < order.trackings!.length - 1 && (
                                                                <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-1"></div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 pb-4">
                                                            <div className="flex items-center justify-between">
                                                                <p className={`font-medium ${index === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                                                    {formatStatus(tracking.status)}
                                                                </p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {new Date(tracking.timestamp).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            {tracking.location && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                    <MapPinIcon className="h-4 w-4 inline mr-1" />
                                                                    {tracking.location}
                                                                </p>
                                                            )}
                                                            {tracking.notes && (
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                    {tracking.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {!order && !loading && initialReference && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <PackageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Order not found</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

