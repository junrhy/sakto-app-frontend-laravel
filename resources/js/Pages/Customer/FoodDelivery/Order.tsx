import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { PackageIcon, MapPinIcon, ClockIcon, PhoneIcon, MailIcon, UtensilsIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { FoodDeliveryOrder } from './types';
import OrderStatusDialog from './components/OrderStatusDialog';
import PaymentDialog from './components/PaymentDialog';
import DriverAssignmentDialog from './components/DriverAssignmentDialog';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {
    order?: FoodDeliveryOrder;
}

export default function FoodDeliveryOrderPage({ auth, order: initialOrder }: Props) {
    const [order, setOrder] = useState<FoodDeliveryOrder | null>(initialOrder || null);
    const [loading, setLoading] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [driverDialogOpen, setDriverDialogOpen] = useState(false);

    useEffect(() => {
        if (initialOrder?.id) {
            fetchOrder(initialOrder.id);
        }
    }, [initialOrder?.id]);

    const fetchOrder = async (orderId: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`/food-delivery/orders/${orderId}`, {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                },
            });
            if (response.data.success) {
                setOrder(response.data.data);
            }
        } catch (error: any) {
            toast.error('Failed to load order');
        } finally {
            setLoading(false);
        }
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

    const getNextStatuses = (currentStatus: string): string[] => {
        const statusFlow: Record<string, string[]> = {
            pending: ['accepted', 'cancelled'],
            accepted: ['preparing', 'cancelled'],
            preparing: ['ready', 'cancelled'],
            ready: ['assigned', 'cancelled'],
            assigned: ['out_for_delivery', 'cancelled'],
            out_for_delivery: ['delivered', 'cancelled'],
            delivered: [],
            cancelled: [],
        };
        return statusFlow[currentStatus] || [];
    };

    const handleStatusUpdate = () => {
        if (order?.id) {
            fetchOrder(order.id);
        }
    };

    const handlePaymentSuccess = () => {
        if (order?.id) {
            fetchOrder(order.id);
        }
    };

    const handleDriverAssignment = () => {
        if (order?.id) {
            fetchOrder(order.id);
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <Head title="Order Details" />
                <div className="p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    <p className="mt-2 text-gray-500">Loading order...</p>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (!order) {
        return (
            <AuthenticatedLayout>
                <Head title="Order Not Found" />
                <div className="p-6 text-center">
                    <p className="text-gray-500">Order not found</p>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                            <PackageIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                                Order #{order.order_reference}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Order details and tracking
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                            {formatStatus(order.order_status)}
                        </span>
                        {getNextStatuses(order.order_status).length > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => setStatusDialogOpen(true)}
                            >
                                Update Status
                            </Button>
                        )}
                        {order.payment_status !== 'paid' && (
                            <Button
                                variant="outline"
                                onClick={() => setPaymentDialogOpen(true)}
                            >
                                Process Payment
                            </Button>
                        )}
                        {order.order_status === 'ready' && !order.driver_id && (
                            <Button
                                variant="outline"
                                onClick={() => setDriverDialogOpen(true)}
                            >
                                Assign Driver
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => router.visit(`/food-delivery/track/${order.order_reference}`)}
                        >
                            Track Order
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`Order ${order.order_reference}`} />

            <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {order.order_items && order.order_items.length > 0 ? (
                                    <div className="space-y-4">
                                        {order.order_items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-0">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {item.item_name} x {item.quantity}
                                                    </p>
                                                    {item.special_instructions && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                                ) : (
                                    <p className="text-gray-500">No items found</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tracking History */}
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

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                    <span className="text-gray-900 dark:text-white">{formatCurrency(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                                    <span className="text-gray-900 dark:text-white">{formatCurrency(order.delivery_fee)}</span>
                                </div>
                                {order.service_charge > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Service Charge</span>
                                        <span className="text-gray-900 dark:text-white">{formatCurrency(order.service_charge)}</span>
                                    </div>
                                )}
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Discount</span>
                                        <span className="text-gray-900 dark:text-white">-{formatCurrency(order.discount)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3 flex justify-between font-bold">
                                    <span className="text-gray-900 dark:text-white">Total</span>
                                    <span className="text-gray-900 dark:text-white">{formatCurrency(order.total_amount)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Restaurant Info */}
                        {order.restaurant && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Restaurant</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <UtensilsIcon className="h-4 w-4 text-gray-400" />
                                        <p className="font-medium text-gray-900 dark:text-white">{order.restaurant.name}</p>
                                    </div>
                                    {order.restaurant.phone && (
                                        <div className="flex items-center gap-2">
                                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.restaurant.phone}</p>
                                        </div>
                                    )}
                                    {order.restaurant.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.restaurant.address}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Customer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Address</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="font-medium text-gray-900 dark:text-white">{order.customer_name}</p>
                                <div className="flex items-center gap-2">
                                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer_phone}</p>
                                </div>
                                {order.customer_email && (
                                    <div className="flex items-center gap-2">
                                        <MailIcon className="h-4 w-4 text-gray-400" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer_email}</p>
                                    </div>
                                )}
                                <div className="flex items-start gap-2">
                                    <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer_address}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Method</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                        {order.payment_method.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                                        order.payment_status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                        order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                        {order.payment_status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Special Instructions */}
                        {order.special_instructions && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Special Instructions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.special_instructions}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Estimated Delivery */}
                        {order.estimated_delivery_time && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Estimated Delivery</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <ClockIcon className="h-4 w-4 text-gray-400" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(order.estimated_delivery_time).toLocaleString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {order && (
                <>
                    <OrderStatusDialog
                        order={order}
                        open={statusDialogOpen}
                        onOpenChange={setStatusDialogOpen}
                        onSuccess={handleStatusUpdate}
                        clientIdentifier={(auth.user as any)?.identifier}
                    />
                    <PaymentDialog
                        order={order}
                        open={paymentDialogOpen}
                        onOpenChange={setPaymentDialogOpen}
                        onSuccess={handlePaymentSuccess}
                        clientIdentifier={(auth.user as any)?.identifier}
                    />
                    <DriverAssignmentDialog
                        order={order}
                        open={driverDialogOpen}
                        onOpenChange={setDriverDialogOpen}
                        onSuccess={handleDriverAssignment}
                        clientIdentifier={(auth.user as any)?.identifier}
                    />
                </>
            )}
        </AuthenticatedLayout>
    );
}

