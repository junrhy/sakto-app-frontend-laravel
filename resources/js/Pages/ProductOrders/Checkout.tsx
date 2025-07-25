import { useCart } from '@/Components/CartContext';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Download, Package } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    thumbnail_url?: string;
    type: 'physical' | 'digital' | 'service' | 'subscription';
    stock_quantity?: number;
    productId?: number;
    variantId?: number;
    attributes?: Record<string, string>;
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
        notes: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
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
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_phone: formData.customer_phone,
                shipping_address: formData.shipping_address,
                billing_address: formData.billing_address,
                order_items: state.items.map((item) => ({
                    product_id: item.productId ?? item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    variant_id: item.variantId ?? null,
                    attributes: item.attributes ?? null,
                })),
                subtotal: getTotalPrice(),
                tax_amount: 0, // You can calculate tax based on your requirements
                shipping_fee: 0, // You can calculate shipping based on your requirements
                discount_amount: 0,
                total_amount: getTotalPrice(),
                payment_method: formData.payment_method,
                notes: formData.notes,
            };

            console.log('Submitting order data:', orderData);
            console.log('Order data JSON:', JSON.stringify(orderData, null, 2));
            console.log('Cart state:', state);
            console.log('Cart items:', state.items);
            console.log('Cart items detailed:', state.items.map(item => ({
                id: item.id,
                productId: item.productId,
                variantId: item.variantId,
                attributes: item.attributes,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })));
            console.log('Form data:', formData);

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
                return <Package className="h-4 w-4" />;
            case 'digital':
                return <Download className="h-4 w-4" />;
            case 'service':
                return <CreditCard className="h-4 w-4" />;
            case 'subscription':
                return <CreditCard className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
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
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Checkout
                    </h2>
                }
            >
                <Head title="Checkout" />
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                <h3 className="mb-2 text-xl font-medium text-gray-900">
                                    Your cart is empty
                                </h3>
                                <p className="mb-4 text-gray-500">
                                    Add some products to your cart before
                                    checking out.
                                </p>
                                <Button
                                    onClick={() =>
                                        router.visit(route('products.index'))
                                    }
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
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
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Checkout
                </h2>
            }
        >
            <Head title="Checkout" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Empty Cart State */}
                        {state.items.length === 0 && (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                                        Your cart is empty
                                    </h2>
                                    <Package className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
                                    <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-gray-100">
                                        No items to checkout
                                    </h3>
                                    <p className="mb-4 text-gray-500 dark:text-gray-400">
                                        Add some products to your cart to continue with checkout
                                    </p>
                                    <Link href={route('landing.community')}>
                                        <Button>
                                            Continue Shopping
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}

                        {/* Checkout Form */}
                        {state.items.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Order Summary */}
                                <div className="lg:col-span-1">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <Package className="w-4 h-4 mr-2" />
                                                Order Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {state.items.map((item) => (
                                                    <div key={item.id} className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                                            {item.thumbnail_url ? (
                                                                <img
                                                                    src={item.thumbnail_url}
                                                                    alt={item.name}
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            ) : (
                                                                <Package className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {item.name}
                                                            </h4>
                                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                                <span>Qty: {item.quantity}</span>
                                                                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                                                    × {formatCurrency(item.price, currency.symbol)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {formatCurrency(item.price * item.quantity, currency.symbol)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(getTotalPrice(), currency.symbol)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                                                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(0, currency.symbol)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                                                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(0, currency.symbol)}</span>
                                                </div>
                                                <div className="flex justify-between font-medium text-lg border-t border-gray-200 dark:border-gray-700 pt-2">
                                                    <span className="text-gray-900 dark:text-gray-100">Total:</span>
                                                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(getTotalPrice(), currency.symbol)}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Checkout Form */}
                                <div className="lg:col-span-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Customer Information</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <form
                                                onSubmit={handleSubmit}
                                                className="space-y-4"
                                            >
                                                <div>
                                                    <Label htmlFor="customer_name">
                                                        Full Name *
                                                    </Label>
                                                    <Input
                                                        id="customer_name"
                                                        value={formData.customer_name}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                'customer_name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="customer_email">
                                                        Email Address *
                                                    </Label>
                                                    <Input
                                                        id="customer_email"
                                                        type="email"
                                                        value={formData.customer_email}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                'customer_email',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                        placeholder="Enter your email address"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="customer_phone">
                                                        Phone Number
                                                    </Label>
                                                    <Input
                                                        id="customer_phone"
                                                        value={formData.customer_phone}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                'customer_phone',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Enter your phone number"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="shipping_address">
                                                        Shipping Address
                                                    </Label>
                                                    <Textarea
                                                        id="shipping_address"
                                                        value={
                                                            formData.shipping_address
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                'shipping_address',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Enter shipping address"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="billing_address">
                                                        Billing Address
                                                    </Label>
                                                    <Textarea
                                                        id="billing_address"
                                                        value={formData.billing_address}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                'billing_address',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Enter billing address (if different from shipping)"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="payment_method">
                                                        Payment Method
                                                    </Label>
                                                    <Select
                                                        value={formData.payment_method}
                                                        onValueChange={(value) =>
                                                            handleInputChange(
                                                                'payment_method',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select payment method" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="cod">
                                                                Cash on Delivery
                                                            </SelectItem>
                                                            <SelectItem value="cash">
                                                                Cash
                                                            </SelectItem>
                                                            <SelectItem value="card">
                                                                Credit/Debit Card
                                                            </SelectItem>
                                                            <SelectItem value="bank_transfer">
                                                                Bank Transfer
                                                            </SelectItem>
                                                            <SelectItem value="digital_wallet">
                                                                Digital Wallet
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="notes">
                                                        Order Notes
                                                    </Label>
                                                    <Textarea
                                                        id="notes"
                                                        value={formData.notes}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                'notes',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Any special instructions or notes"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div className="flex space-x-4 pt-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            router.visit(
                                                                route('products.index'),
                                                            )
                                                        }
                                                        className="flex-1"
                                                    >
                                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                                        Continue Shopping
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="flex-1"
                                                    >
                                                        {processing
                                                            ? 'Processing...'
                                                            : 'Place Order'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
