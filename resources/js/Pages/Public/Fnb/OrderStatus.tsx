import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    Home,
    RefreshCw,
    Truck,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
    id: number;
    name: string;
    quantity: number | string;
    price: number | string;
}

interface OnlineStore {
    id: number;
    name: string;
    domain: string;
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address: string;
    items: OrderItem[];
    subtotal: number | string;
    delivery_fee: number | string;
    tax_amount: number | string;
    total_amount: number | string;
    negotiated_amount?: number | string;
    status: string;
    verification_status: string;
    verification_notes?: string;
    payment_status: string;
    payment_notes?: string;
    payment_negotiation_enabled: boolean;
    created_at: string;
    verified_at?: string;
    preparing_at?: string;
    ready_at?: string;
    delivered_at?: string;
    online_store: OnlineStore;
}

interface OrderStatusProps {
    order: Order;
    domain: string;
    orderNumber: string;
}

export default function OrderStatus({
    order,
    domain,
    orderNumber,
}: OrderStatusProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const getStatusColor = (status: string) => {
        const colors = {
            pending:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            verified:
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            preparing:
                'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            delivered:
                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
            cancelled:
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return (
            colors[status as keyof typeof colors] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        );
    };

    const getVerificationStatusColor = (status: string) => {
        const colors = {
            pending:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            verified:
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            rejected:
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return (
            colors[status as keyof typeof colors] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        );
    };

    const getPaymentStatusColor = (status: string) => {
        const colors = {
            pending:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            negotiated:
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return (
            colors[status as keyof typeof colors] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-5 w-5" />;
            case 'verified':
            case 'preparing':
                return <CheckCircle className="h-5 w-5" />;
            case 'ready':
                return <Truck className="h-5 w-5" />;
            case 'delivered':
                return <Home className="h-5 w-5" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5" />;
            default:
                return <Clock className="h-5 w-5" />;
        }
    };

    const getStatusMessage = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Your order is being processed';
            case 'verified':
                return 'Your order has been verified and confirmed';
            case 'preparing':
                return 'Your order is being prepared';
            case 'ready':
                return 'Your order is ready for delivery';
            case 'delivered':
                return 'Your order has been delivered';
            case 'cancelled':
                return 'Your order has been cancelled';
            default:
                return 'Processing your order';
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await router.reload();
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <>
            <Head title={`Order ${orderNumber} - ${order.online_store.name}`} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="border-b bg-white shadow-sm dark:bg-gray-800">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Link
                                    href={`/fnb/store/${domain}`}
                                    className="mr-4"
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Order #{orderNumber}
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {order.online_store.name}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                variant="outline"
                            >
                                <RefreshCw
                                    className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                                />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Order Status */}
                        <div className="lg:col-span-2">
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        {getStatusIcon(order.status)}
                                        <span className="ml-2">
                                            Order Status
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-medium">
                                                Current Status:
                                            </span>
                                            <Badge
                                                className={`${getStatusColor(order.status)}`}
                                            >
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {getStatusMessage(order.status)}
                                        </p>

                                        {order.verification_status ===
                                            'pending' && (
                                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                                                <div className="flex items-center">
                                                    <Clock className="mr-2 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                                    <span className="font-medium text-yellow-800 dark:text-yellow-200">
                                                        Order Verification
                                                        Required
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                                    Your order is pending
                                                    verification. Our team will
                                                    review and confirm your
                                                    order shortly.
                                                </p>
                                            </div>
                                        )}

                                        {order.payment_negotiation_enabled &&
                                            order.payment_status ===
                                                'pending' && (
                                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                                    <div className="flex items-center">
                                                        <CheckCircle className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                        <span className="font-medium text-blue-800 dark:text-blue-200">
                                                            Payment Discussion
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                                        Our team will contact
                                                        you to discuss payment
                                                        arrangements.
                                                    </p>
                                                </div>
                                            )}

                                        {order.negotiated_amount && (
                                            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                                <div className="flex items-center">
                                                    <CheckCircle className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                                                    <span className="font-medium text-green-800 dark:text-green-200">
                                                        Negotiated Amount
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                                                    Final amount: $
                                                    {Number(
                                                        order.negotiated_amount ||
                                                            0,
                                                    ).toFixed(2)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Order Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                                                Items Ordered:
                                            </h4>
                                            <div className="space-y-2">
                                                {order.items.map(
                                                    (item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-700"
                                                        >
                                                            <div>
                                                                <span className="font-medium">
                                                                    {item.name}
                                                                </span>
                                                                <span className="ml-2 text-gray-500 dark:text-gray-400">
                                                                    x
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                            </div>
                                                            <span className="font-medium">
                                                                $
                                                                {(
                                                                    Number(
                                                                        item.price ||
                                                                            0,
                                                                    ) *
                                                                    Number(
                                                                        item.quantity ||
                                                                            0,
                                                                    )
                                                                ).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Subtotal:</span>
                                                    <span>
                                                        $
                                                        {Number(
                                                            order.subtotal || 0,
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Delivery Fee:</span>
                                                    <span>
                                                        $
                                                        {Number(
                                                            order.delivery_fee ||
                                                                0,
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Tax:</span>
                                                    <span>
                                                        $
                                                        {Number(
                                                            order.tax_amount ||
                                                                0,
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                                {order.negotiated_amount && (
                                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                                        <span>
                                                            Negotiated Amount:
                                                        </span>
                                                        <span>
                                                            $
                                                            {Number(
                                                                order.negotiated_amount ||
                                                                    0,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                                    <span>Total:</span>
                                                    <span>
                                                        $
                                                        {order.negotiated_amount
                                                            ? Number(
                                                                  order.negotiated_amount ||
                                                                      0,
                                                              ).toFixed(2)
                                                            : Number(
                                                                  order.total_amount ||
                                                                      0,
                                                              ).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Info Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Order Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                Order Number:
                                            </span>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {order.order_number}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                Ordered On:
                                            </span>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {new Date(
                                                    order.created_at,
                                                ).toLocaleDateString()}{' '}
                                                at{' '}
                                                {new Date(
                                                    order.created_at,
                                                ).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        {order.verified_at && (
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    Verified On:
                                                </span>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    {new Date(
                                                        order.verified_at,
                                                    ).toLocaleDateString()}{' '}
                                                    at{' '}
                                                    {new Date(
                                                        order.verified_at,
                                                    ).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Customer Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                Name:
                                            </span>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {order.customer_name}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                Email:
                                            </span>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {order.customer_email}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                Phone:
                                            </span>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {order.customer_phone}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                Delivery Address:
                                            </span>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {order.delivery_address}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Status Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span>Order Status:</span>
                                            <Badge
                                                className={`text-xs ${getStatusColor(order.status)}`}
                                            >
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Verification:</span>
                                            <Badge
                                                className={`text-xs ${getVerificationStatusColor(order.verification_status)}`}
                                            >
                                                {order.verification_status}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Payment:</span>
                                            <Badge
                                                className={`text-xs ${getPaymentStatusColor(order.payment_status)}`}
                                            >
                                                {order.payment_status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
