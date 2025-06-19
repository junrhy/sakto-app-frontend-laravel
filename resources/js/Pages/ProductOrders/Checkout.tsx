import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { 
    ArrowLeft, 
    CreditCard, 
    Package, 
    Download,
    User,
    Mail,
    Phone,
    MapPin,
    FileText
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { useCart } from '@/Components/CartContext';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    thumbnail_url?: string;
    type: 'physical' | 'digital' | 'service' | 'subscription';
    stock_quantity?: number;
}

interface Props extends PageProps {
    currency: {
        symbol: string;
        code: string;
    };
}

export default function Checkout({ auth, currency }: Props) {
    const { state, getTotalPrice, clearCart } = useCart();
    const [processing, setProcessing] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        shipping_address: '',
        billing_address: '',
        payment_method: 'cod',
        notes: ''
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (state.items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        if (!formData.customer_name || !formData.customer_email) {
            alert('Please fill in all required fields');
            return;
        }

        setProcessing(true);

        try {
            // Prepare order data
            const orderData = {
                client_identifier: auth.user.identifier,
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_phone: formData.customer_phone,
                shipping_address: formData.shipping_address,
                billing_address: formData.billing_address,
                order_items: state.items.map(item => ({
                    product_id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                subtotal: getTotalPrice(),
                tax_amount: 0, // You can calculate tax based on your requirements
                shipping_fee: 0, // You can calculate shipping based on your requirements
                discount_amount: 0,
                total_amount: getTotalPrice(),
                payment_method: formData.payment_method,
                notes: formData.notes
            };

            // Submit order
            await router.post(route('product-orders.store'), orderData);
            
            // Clear cart on successful order
            clearCart();
            
            // Redirect to orders page
            router.visit(route('product-orders.index'));
            
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create order. Please try again.');
        } finally {
            setProcessing(false);
        }
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

    const getProductTypeLabel = (type: string) => {
        switch (type) {
            case 'physical':
                return 'Physical';
            case 'digital':
                return 'Digital';
            case 'service':
                return 'Service';
            case 'subscription':
                return 'Subscription';
            default:
                return type;
        }
    };

    if (state.items.length === 0) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Checkout</h2>}
            >
                <Head title="Checkout" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
                                <p className="text-gray-500 mb-4">Add some products to your cart before checking out.</p>
                                <Button onClick={() => router.visit(route('products.index'))}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Products
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Checkout</h2>}
        >
            <Head title="Checkout" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Order Summary */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {state.items.map((item) => (
                                            <div key={item.id} className="flex items-center space-x-3">
                                                {item.thumbnail_url && (
                                                    <img 
                                                        src={item.thumbnail_url} 
                                                        alt={item.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                                        {item.name}
                                                    </h4>
                                                    <div className="flex items-center mt-1">
                                                        {getProductTypeIcon(item.type)}
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            {getProductTypeLabel(item.type)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {formatCurrency(item.price * item.quantity, currency.symbol)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="border-t mt-4 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal:</span>
                                            <span>{formatCurrency(getTotalPrice(), currency.symbol)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Tax:</span>
                                            <span>{formatCurrency(0, currency.symbol)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Shipping:</span>
                                            <span>{formatCurrency(0, currency.symbol)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-lg border-t pt-2">
                                            <span>Total:</span>
                                            <span>{formatCurrency(getTotalPrice(), currency.symbol)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Checkout Form */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="customer_name">Full Name *</Label>
                                            <Input
                                                id="customer_name"
                                                value={formData.customer_name}
                                                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                                                required
                                                placeholder="Enter your full name"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="customer_email">Email Address *</Label>
                                            <Input
                                                id="customer_email"
                                                type="email"
                                                value={formData.customer_email}
                                                onChange={(e) => handleInputChange('customer_email', e.target.value)}
                                                required
                                                placeholder="Enter your email address"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="customer_phone">Phone Number</Label>
                                            <Input
                                                id="customer_phone"
                                                value={formData.customer_phone}
                                                onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                                                placeholder="Enter your phone number"
                                            />
                                        </div>

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

                                        <div>
                                            <Label htmlFor="payment_method">Payment Method</Label>
                                            <Select 
                                                value={formData.payment_method} 
                                                onValueChange={(value) => handleInputChange('payment_method', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select payment method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                                                    <SelectItem value="cash">Cash</SelectItem>
                                                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                    <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="notes">Order Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={formData.notes}
                                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                                placeholder="Any special instructions or notes"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="flex space-x-4 pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.visit(route('products.index'))}
                                                className="flex-1"
                                            >
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                Continue Shopping
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1"
                                            >
                                                {processing ? 'Processing...' : 'Place Order'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 