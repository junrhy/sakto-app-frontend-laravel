import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    Package, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Archive,
    DollarSign,
    Calendar,
    FileText
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';

interface OrderItem {
    product_id: number;
    variant_id?: number;
    attributes?: Record<string, string>;
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    shipping_address?: string;
    billing_address?: string;
    order_items: OrderItem[];
    subtotal: number;
    tax_amount: number;
    shipping_fee: number;
    discount_amount: number;
    total_amount: number;
    order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
    payment_method?: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet' | 'cod';
    payment_reference?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    paid_at?: string;
    shipped_at?: string;
    delivered_at?: string;
}

interface Props extends PageProps {
    order: Order;
    currency: {
        symbol: string;
        code: string;
    };
}

export default function Show({ auth, order, currency }: Props) {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: Clock },
            confirmed: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', icon: CheckCircle },
            processing: { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', icon: Package },
            shipped: { color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300', icon: Truck },
            delivered: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: CheckCircle },
            cancelled: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: XCircle },
            refunded: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300', icon: Archive },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: Clock },
            paid: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: CheckCircle },
            failed: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: XCircle },
            refunded: { color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300', icon: Archive },
            partially_refunded: { color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300', icon: Archive },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
            </Badge>
        );
    };

    const getPaymentMethodLabel = (method?: string) => {
        if (!method) return 'Not specified';
        
        const methods = {
            cash: 'Cash',
            card: 'Credit/Debit Card',
            bank_transfer: 'Bank Transfer',
            digital_wallet: 'Digital Wallet',
            cod: 'Cash on Delivery'
        };
        
        return methods[method as keyof typeof methods] || method;
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this order?')) {
            router.delete(route('product-orders.destroy', order.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Order Details</h2>}
        >
            <Head title={`Order ${order.order_number}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-4">
                            <Link href={route('product-orders.index')}>
                                <Button variant="outline">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Orders
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Order {order.order_number}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Created on {format(new Date(order.created_at), 'MMMM dd, yyyy \'at\' HH:mm')}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Link href={route('product-orders.edit', order.id)}>
                                <Button>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Order
                                </Button>
                            </Link>
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Order
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Package className="w-4 h-4 mr-2" />
                                        Order Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Status</label>
                                            <div className="mt-1">
                                                {getStatusBadge(order.order_status)}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</label>
                                            <div className="mt-1">
                                                {getPaymentStatusBadge(order.payment_status)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Status Timeline */}
                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center text-sm">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                            <span className="text-gray-700 dark:text-gray-300">Order created on {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</span>
                                        </div>
                                        {order.paid_at && (
                                            <div className="flex items-center text-sm">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                <span className="text-gray-700 dark:text-gray-300">Payment received on {format(new Date(order.paid_at), 'MMM dd, yyyy HH:mm')}</span>
                                            </div>
                                        )}
                                        {order.shipped_at && (
                                            <div className="flex items-center text-sm">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                <span className="text-gray-700 dark:text-gray-300">Order shipped on {format(new Date(order.shipped_at), 'MMM dd, yyyy HH:mm')}</span>
                                            </div>
                                        )}
                                        {order.delivered_at && (
                                            <div className="flex items-center text-sm">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                <span className="text-gray-700 dark:text-gray-300">Order delivered on {format(new Date(order.delivered_at), 'MMM dd, yyyy HH:mm')}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Order Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Quantity</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {order.order_items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                                                        {item.variant_id && item.attributes && (
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {Object.entries(item.attributes).map(([key, value]) => (
                                                                        <Badge key={key} variant="secondary" className="text-xs">
                                                                            {key}: {value}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-gray-100">{item.quantity}</TableCell>
                                                    <TableCell className="text-gray-900 dark:text-gray-100">{formatCurrency(item.price, currency.symbol)}</TableCell>
                                                    <TableCell className="text-gray-900 dark:text-gray-100">{formatCurrency(item.price * item.quantity, currency.symbol)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Order Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                                            <span className="text-gray-900 dark:text-gray-100">{formatCurrency(order.subtotal, currency.symbol)}</span>
                                        </div>
                                        {order.tax_amount > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-700 dark:text-gray-300">Tax:</span>
                                                <span className="text-gray-900 dark:text-gray-100">{formatCurrency(order.tax_amount, currency.symbol)}</span>
                                            </div>
                                        )}
                                        {order.shipping_fee > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-700 dark:text-gray-300">Shipping:</span>
                                                <span className="text-gray-900 dark:text-gray-100">{formatCurrency(order.shipping_fee, currency.symbol)}</span>
                                            </div>
                                        )}
                                        {order.discount_amount > 0 && (
                                            <div className="flex justify-between text-green-600 dark:text-green-400">
                                                <span>Discount:</span>
                                                <span>-{formatCurrency(order.discount_amount, currency.symbol)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-gray-700 pt-3">
                                            <span className="text-gray-900 dark:text-gray-100">Total:</span>
                                            <span className="text-gray-900 dark:text-gray-100">{formatCurrency(order.total_amount, currency.symbol)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Customer Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100">{order.customer_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                                        <p className="text-sm flex items-center text-gray-900 dark:text-gray-100">
                                            <Mail className="w-3 h-3 mr-1" />
                                            {order.customer_email}
                                        </p>
                                    </div>
                                    {order.customer_phone && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                                            <p className="text-sm flex items-center text-gray-900 dark:text-gray-100">
                                                <Phone className="w-3 h-3 mr-1" />
                                                {order.customer_phone}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Shipping Information */}
                            {order.shipping_address && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Shipping Address
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">{order.shipping_address}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Billing Information */}
                            {order.billing_address && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            Billing Address
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">{order.billing_address}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Payment Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Payment Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</label>
                                        <p className="text-sm text-gray-900 dark:text-gray-100">{getPaymentMethodLabel(order.payment_method)}</p>
                                    </div>
                                    {order.payment_reference && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Reference</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-100">{order.payment_reference}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            {order.notes && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Notes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">{order.notes}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 