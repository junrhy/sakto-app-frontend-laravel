import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { 
    ArrowLeft, 
    Save, 
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
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
    errors?: {
        [key: string]: string;
    };
}

export default function Edit({ auth, order, currency, errors }: Props) {
    const [formData, setFormData] = useState({
        order_status: order.order_status,
        payment_status: order.payment_status,
        payment_method: order.payment_method || '',
        payment_reference: order.payment_reference || '',
        shipping_address: order.shipping_address || '',
        billing_address: order.billing_address || '',
        notes: order.notes || ''
    });
    const [processing, setProcessing] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        try {
            await router.put(route('product-orders.update', order.id), formData);
        } catch (error) {
            console.error('Error updating order:', error);
        } finally {
            setProcessing(false);
        }
    };

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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Order</h2>}
        >
            <Head title={`Edit Order ${order.order_number}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Error Messages */}
                    {errors && Object.keys(errors).length > 0 && (
                        <div className="mb-6">
                            {Object.entries(errors).map(([key, message]) => (
                                <div key={key} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-2">
                                    {message}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-4">
                            <Link href={route('product-orders.show', order.id)}>
                                <Button variant="outline">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Order
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Edit Order {order.order_number}
                                </h1>
                                <p className="text-gray-600">
                                    Created on {format(new Date(order.created_at), 'MMMM dd, yyyy \'at\' HH:mm')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Order Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Package className="w-4 h-4 mr-2" />
                                            Order Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="order_status">Order Status</Label>
                                                <Select 
                                                    value={formData.order_status} 
                                                    onValueChange={(value) => handleInputChange('order_status', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                                        <SelectItem value="processing">Processing</SelectItem>
                                                        <SelectItem value="shipped">Shipped</SelectItem>
                                                        <SelectItem value="delivered">Delivered</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                        <SelectItem value="refunded">Refunded</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="payment_status">Payment Status</Label>
                                                <Select 
                                                    value={formData.payment_status} 
                                                    onValueChange={(value) => handleInputChange('payment_status', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="paid">Paid</SelectItem>
                                                        <SelectItem value="failed">Failed</SelectItem>
                                                        <SelectItem value="refunded">Refunded</SelectItem>
                                                        <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="payment_method">Payment Method</Label>
                                                <Select 
                                                    value={formData.payment_method || 'none'} 
                                                    onValueChange={(value) => handleInputChange('payment_method', value === 'none' ? '' : value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select payment method" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">Not specified</SelectItem>
                                                        <SelectItem value="cash">Cash</SelectItem>
                                                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                        <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                                                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="payment_reference">Payment Reference</Label>
                                                <Input
                                                    id="payment_reference"
                                                    value={formData.payment_reference}
                                                    onChange={(e) => handleInputChange('payment_reference', e.target.value)}
                                                    placeholder="Payment reference number"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Addresses */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Addresses
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="shipping_address">Shipping Address</Label>
                                            <Textarea
                                                id="shipping_address"
                                                value={formData.shipping_address}
                                                onChange={(e) => handleInputChange('shipping_address', e.target.value)}
                                                placeholder="Enter shipping address"
                                                rows={3}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="billing_address">Billing Address</Label>
                                            <Textarea
                                                id="billing_address"
                                                value={formData.billing_address}
                                                onChange={(e) => handleInputChange('billing_address', e.target.value)}
                                                placeholder="Enter billing address (if different from shipping)"
                                                rows={3}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Notes */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Notes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            value={formData.notes}
                                            onChange={(e) => handleInputChange('notes', e.target.value)}
                                            placeholder="Add any notes about this order"
                                            rows={4}
                                        />
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
                                        <div className="flex items-center text-sm">
                                            <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                            <span>{order.customer_email}</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <User className="w-4 h-4 mr-2 text-gray-500" />
                                            <span>{order.customer_name}</span>
                                        </div>
                                        {order.customer_phone && (
                                            <div className="flex items-center text-sm">
                                                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                                <span>{order.customer_phone}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Order Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Package className="w-4 h-4 mr-2" />
                                            Order Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal:</span>
                                            <span>{formatCurrency(order.subtotal, currency.symbol)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Tax:</span>
                                            <span>{formatCurrency(order.tax_amount, currency.symbol)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Shipping:</span>
                                            <span>{formatCurrency(order.shipping_fee, currency.symbol)}</span>
                                        </div>
                                        {order.discount_amount > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Discount:</span>
                                                <span>-{formatCurrency(order.discount_amount, currency.symbol)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-medium text-lg border-t pt-2">
                                            <span>Total:</span>
                                            <span>{formatCurrency(order.total_amount, currency.symbol)}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Order Items */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Order Items</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {order.order_items.map((item, index) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span className="truncate">{item.name} (x{item.quantity})</span>
                                                    <span>{formatCurrency(item.price * item.quantity, currency.symbol)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Current Status */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Current Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
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
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 mt-6">
                            <Link href={route('product-orders.show', order.id)}>
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 