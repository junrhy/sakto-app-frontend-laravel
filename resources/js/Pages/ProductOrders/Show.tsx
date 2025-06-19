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
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
            processing: { color: 'bg-purple-100 text-purple-800', icon: Package },
            shipped: { color: 'bg-indigo-100 text-indigo-800', icon: Truck },
            delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
            refunded: { color: 'bg-gray-100 text-gray-800', icon: Archive },
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
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
            refunded: { color: 'bg-gray-100 text-gray-800', icon: Archive },
            partially_refunded: { color: 'bg-orange-100 text-orange-800', icon: Archive },
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Order Details</h2>}
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
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Order {order.order_number}
                                </h1>
                                <p className="text-gray-600">
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
                                            <label className="text-sm font-medium text-gray-500">Order Status</label>
                                            <div className="mt-1">
                                                {getStatusBadge(order.order_status)}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Payment Status</label>
                                            <div className="mt-1">
                                                {getPaymentStatusBadge(order.payment_status)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Status Timeline */}
                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center text-sm">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                            <span>Order created on {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</span>
                                        </div>
                                        {order.paid_at && (
                                            <div className="flex items-center text-sm">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                <span>Payment received on {format(new Date(order.paid_at), 'MMM dd, yyyy HH:mm')}</span>
                                            </div>
                                        )}
                                        {order.shipped_at && (
                                            <div className="flex items-center text-sm">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                <span>Order shipped on {format(new Date(order.shipped_at), 'MMM dd, yyyy HH:mm')}</span>
                                            </div>
                                        )}
                                        {order.delivered_at && (
                                            <div className="flex items-center text-sm">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                <span>Order delivered on {format(new Date(order.delivered_at), 'MMM dd, yyyy HH:mm')}</span>
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
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>{formatCurrency(item.price, currency.symbol)}</TableCell>
                                                    <TableCell>{formatCurrency(item.price * item.quantity, currency.symbol)}</TableCell>
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
                                            <span>Subtotal:</span>
                                            <span>{formatCurrency(order.subtotal, currency.symbol)}</span>
                                        </div>
                                        {order.tax_amount > 0 && (
                                            <div className="flex justify-between">
                                                <span>Tax:</span>
                                                <span>{formatCurrency(order.tax_amount, currency.symbol)}</span>
                                            </div>
                                        )}
                                        {order.shipping_fee > 0 && (
                                            <div className="flex justify-between">
                                                <span>Shipping:</span>
                                                <span>{formatCurrency(order.shipping_fee, currency.symbol)}</span>
                                            </div>
                                        )}
                                        {order.discount_amount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount:</span>
                                                <span>-{formatCurrency(order.discount_amount, currency.symbol)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg border-t pt-3">
                                            <span>Total:</span>
                                            <span>{formatCurrency(order.total_amount, currency.symbol)}</span>
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
                                        <label className="text-sm font-medium text-gray-500">Name</label>
                                        <p className="text-sm">{order.customer_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-sm flex items-center">
                                            <Mail className="w-3 h-3 mr-1" />
                                            {order.customer_email}
                                        </p>
                                    </div>
                                    {order.customer_phone && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Phone</label>
                                            <p className="text-sm flex items-center">
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
                                        <p className="text-sm whitespace-pre-wrap">{order.shipping_address}</p>
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
                                        <p className="text-sm whitespace-pre-wrap">{order.billing_address}</p>
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
                                        <label className="text-sm font-medium text-gray-500">Payment Method</label>
                                        <p className="text-sm">{getPaymentMethodLabel(order.payment_method)}</p>
                                    </div>
                                    {order.payment_reference && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Payment Reference</label>
                                            <p className="text-sm">{order.payment_reference}</p>
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
                                        <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
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