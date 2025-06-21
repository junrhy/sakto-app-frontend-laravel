import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import { 
    ArrowLeft, 
    CreditCard, 
    Package, 
    Download,
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    ShoppingCart,
    CheckCircle
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    thumbnail_url?: string;
    type: 'physical' | 'digital' | 'service' | 'subscription';
    stock_quantity?: number;
}

interface Props {
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
    client_identifier: string;
}

export default function PublicCheckout({ currency, member, client_identifier }: Props) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
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

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem(`cart_${member.id}`);
        if (savedCart) {
            try {
                const items = JSON.parse(savedCart);
                setCartItems(items);
            } catch (error) {
                console.error('Failed to load cart from localStorage:', error);
            }
        }
    }, [member.id]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updateQuantity = (productId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(productId);
            return;
        }

        setCartItems(prev => {
            const updated = prev.map(item => 
                item.id === productId 
                    ? { ...item, quantity: newQuantity }
                    : item
            );
            localStorage.setItem(`cart_${member.id}`, JSON.stringify(updated));
            return updated;
        });
    };

    const removeItem = (productId: number) => {
        setCartItems(prev => {
            const updated = prev.filter(item => item.id !== productId);
            localStorage.setItem(`cart_${member.id}`, JSON.stringify(updated));
            return updated;
        });
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (cartItems.length === 0) {
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
                order_items: cartItems.map(item => ({
                    product_id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                subtotal: getTotalPrice(),
                tax_amount: 0,
                shipping_fee: 0,
                discount_amount: 0,
                total_amount: getTotalPrice(),
                payment_method: formData.payment_method,
                notes: formData.notes,
                client_identifier: client_identifier
            };

            // Submit order
            await router.post(route('member.public-checkout.store'), orderData);
            
            // Clear cart on successful order
            localStorage.removeItem(`cart_${member.id}`);
            
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

    const formatPrice = (price: number): string => {
        return `${currency.symbol}${price.toFixed(2)}`;
    };

    if (cartItems.length === 0) {
        return (
            <>
                <Head title="Checkout" />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-8 text-center">
                            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
                            <p className="text-gray-500 mb-4">Add some products to your cart before checking out.</p>
                            <Button onClick={() => window.history.back()}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to {member.name}'s Store
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Checkout" />
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => window.history.back()}
                                    className="flex items-center"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">Checkout</h1>
                                    <p className="text-sm text-gray-500">Complete your purchase from {member.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-sm text-gray-600">Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Order Summary */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        Order Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {cartItems.map((item) => (
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
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex items-center border rounded">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="px-2 py-1 text-gray-500 hover:text-gray-700"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="px-2 py-1 text-sm">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="px-2 py-1 text-gray-500 hover:text-gray-700"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <div className="text-right min-w-0">
                                                        <p className="text-sm font-medium">
                                                            {formatPrice(item.price * item.quantity)}
                                                        </p>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-xs text-red-500 hover:text-red-700"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="border-t mt-4 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal:</span>
                                            <span>{formatPrice(getTotalPrice())}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Tax:</span>
                                            <span>{formatPrice(0)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Shipping:</span>
                                            <span>{formatPrice(0)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-lg border-t pt-2">
                                            <span>Total:</span>
                                            <span>{formatPrice(getTotalPrice())}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Checkout Form */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="w-5 h-5 mr-2" />
                                        Customer Information
                                    </CardTitle>
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
                                                onClick={() => window.history.back()}
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
        </>
    );
} 