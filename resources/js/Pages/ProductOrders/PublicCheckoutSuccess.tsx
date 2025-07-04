import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { 
    CheckCircle, 
    Package, 
    Download,
    CreditCard,
    ArrowLeft,
    Home,
    FileText
} from 'lucide-react';

interface OrderItem {
    id: number;
    product_id: number;
    name: string;
    quantity: number;
    price: number | string;
    variant_id?: number;
    attributes?: Record<string, string>;
}

interface Order {
    id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    shipping_address: string | null;
    billing_address: string | null;
    order_items: OrderItem[];
    subtotal: number | string;
    tax_amount: number | string;
    shipping_fee: number | string;
    discount_amount: number | string;
    total_amount: number | string;
    payment_method: string;
    order_status: string;
    payment_status: string;
    notes: string | null;
    created_at: string;
}

interface Props {
    order: Order;
    currency: {
        symbol: string;
        code: string;
    };
    member: {
        id: number;
        name: string;
        email: string;
        contact_number: string | null;
        app_currency: {
            code: string;
            symbol: string;
        } | null;
        created_at: string;
    };
}

export default function PublicCheckoutSuccess({ order, currency, member }: Props) {
    const formatPrice = (price: number | string): string => {
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(numericPrice)) {
            return `${currency.symbol}0.00`;
        }
        return `${currency.symbol}${numericPrice.toFixed(2)}`;
    };

    const formatDateTime = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getProductTypeIcon = (type: string) => {
        switch (type) {
            case 'physical':
                return <Package className="w-4 h-4" />;
            case 'digital':
                return <Download className="w-4 h-4" />;
            case 'service':
                return <CreditCard className="w-4 h-4" />;
            case 'subscription':
                return <CreditCard className="w-4 h-4" />;
            default:
                return <Package className="w-4 h-4" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Pending' },
            'confirmed': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Confirmed' },
            'processing': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', label: 'Processing' },
            'shipped': { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', label: 'Shipped' },
            'delivered': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Delivered' },
            'cancelled': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Cancelled' },
            'refunded': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', label: 'Refunded' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return (
            <Badge className={config.color}>
                {config.label}
            </Badge>
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Pending' },
            'paid': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Paid' },
            'failed': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Failed' },
            'refunded': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', label: 'Refunded' },
            'partially_refunded': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', label: 'Partially Refunded' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return (
            <Badge className={config.color}>
                {config.label}
            </Badge>
        );
    };

    return (
        <>
            <Head title="Order Confirmation" />
            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link href={`/community/member/${member.id}`}>
                                    <Button variant="ghost" className="flex items-center">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to {member.name}'s Store
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Order Confirmation</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Thank you for your purchase!</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">Order Successful</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-6">
                        {/* Success Message */}
                        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                    <div>
                                        <h2 className="text-lg font-semibold text-green-900 dark:text-green-100">
                                            Order Placed Successfully!
                                        </h2>
                                        <p className="text-green-700 dark:text-green-300">
                                            Your order has been received and is being processed. You will receive a confirmation email shortly.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Order Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="w-5 h-5 mr-2" />
                                        Order Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Order ID:</span>
                                        <span className="text-sm font-medium dark:text-white">#{order.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Order Date:</span>
                                        <span className="text-sm font-medium dark:text-white">{formatDateTime(order.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Order Status:</span>
                                        <div>{getStatusBadge(order.order_status)}</div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Payment Status:</span>
                                        <div>{getPaymentStatusBadge(order.payment_status)}</div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Payment Method:</span>
                                        <span className="text-sm font-medium capitalize dark:text-white">
                                            {order.payment_method.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Total Amount:</span>
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            {formatPrice(order.total_amount)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Customer Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
                                        <p className="font-medium dark:text-white">{order.customer_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                                        <p className="font-medium dark:text-white">{order.customer_email}</p>
                                    </div>
                                    {order.customer_phone && (
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Phone:</span>
                                            <p className="font-medium dark:text-white">{order.customer_phone}</p>
                                        </div>
                                    )}
                                    {order.shipping_address && (
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Shipping Address:</span>
                                            <p className="font-medium dark:text-white">{order.shipping_address}</p>
                                        </div>
                                    )}
                                    {order.billing_address && (
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Billing Address:</span>
                                            <p className="font-medium dark:text-white">{order.billing_address}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.order_items.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                                                {item.attributes && Object.keys(item.attributes).length > 0 && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {Object.entries(item.attributes)
                                                            .map(([key, value]) => `${key}: ${value}`)
                                                            .join(', ')}
                                                    </div>
                                                )}
                                                <div className="flex items-center mt-1">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        Quantity: {item.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {formatPrice((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity)}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatPrice(item.price)} each
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Summary */}
                                <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="dark:text-gray-300">Subtotal:</span>
                                        <span className="dark:text-white">{formatPrice(order.subtotal)}</span>
                                    </div>
                                    {(typeof order.tax_amount === 'string' ? parseFloat(order.tax_amount) : order.tax_amount) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="dark:text-gray-300">Tax:</span>
                                            <span className="dark:text-white">{formatPrice(order.tax_amount)}</span>
                                        </div>
                                    )}
                                    {(typeof order.shipping_fee === 'string' ? parseFloat(order.shipping_fee) : order.shipping_fee) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="dark:text-gray-300">Shipping:</span>
                                            <span className="dark:text-white">{formatPrice(order.shipping_fee)}</span>
                                        </div>
                                    )}
                                    {(typeof order.discount_amount === 'string' ? parseFloat(order.discount_amount) : order.discount_amount) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="dark:text-gray-300">Discount:</span>
                                            <span className="dark:text-white">-{formatPrice(order.discount_amount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-gray-700 pt-2">
                                        <span className="dark:text-white">Total:</span>
                                        <span className="dark:text-white">{formatPrice(order.total_amount)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Next Steps */}
                        <Card>
                            <CardHeader>
                                <CardTitle>What's Next?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div key="step-1" className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">1</span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">Order Confirmation Email</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                You will receive a confirmation email with your order details shortly.
                                            </p>
                                        </div>
                                    </div>
                                    <div key="step-2" className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">2</span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">Order Processing</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {member.name} will process your order and contact you with any updates.
                                            </p>
                                        </div>
                                    </div>
                                    <div key="step-3" className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">3</span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">Delivery/Collection</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                You will be notified when your order is ready for delivery or collection.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex justify-center">
                            <Link href={`/community/member/${member.id}`} className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 