import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { 
    ShoppingBag, 
    Plus, 
    Minus, 
    ShoppingCart, 
    User, 
    Phone, 
    Mail, 
    MapPin,
    ArrowLeft,
    CheckCircle
} from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number | string; // API might return as string
    category: string;
    image?: string;
}

interface OnlineStore {
    id: number;
    name: string;
    description: string;
    domain: string;
    verification_required: string;
    payment_negotiation_enabled: boolean;
    settings: any;
}

interface CartItem {
    id: number;
    name: string;
    price: number | string; // API might return as string
    quantity: number;
}

interface OnlineStoreMenuProps {
    store: OnlineStore;
    menuItems: MenuItem[];
    domain: string;
}

export default function OnlineStoreMenu({ store, menuItems, domain }: OnlineStoreMenuProps) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderForm, setOrderForm] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        delivery_address: '',
    });

    // Get unique categories
    const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];

    // Filter menu items
    const filteredMenuItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = !searchTerm || 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Cart functions
    const addToCart = useCallback((item: MenuItem) => {
        setCart(prev => {
            const existingItem = prev.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prev.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((itemId: number) => {
        setCart(prev => {
            const existingItem = prev.find(cartItem => cartItem.id === itemId);
            if (existingItem && existingItem.quantity > 1) {
                return prev.map(cartItem =>
                    cartItem.id === itemId
                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                        : cartItem
                );
            }
            return prev.filter(cartItem => cartItem.id !== itemId);
        });
    }, []);

    const updateQuantity = useCallback((itemId: number, quantity: number) => {
        if (quantity <= 0) {
            setCart(prev => prev.filter(cartItem => cartItem.id !== itemId));
        } else {
            setCart(prev =>
                prev.map(cartItem =>
                    cartItem.id === itemId
                        ? { ...cartItem, quantity }
                        : cartItem
                )
            );
        }
    }, []);

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const deliveryFee = 0; // Could be calculated based on distance
    const taxAmount = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + deliveryFee + taxAmount;

    // Submit order
    const handleSubmitOrder = useCallback(async () => {
        if (cart.length === 0) {
            toast.error('Please add items to your cart');
            return;
        }

        if (!orderForm.customer_name || !orderForm.customer_email || !orderForm.customer_phone || !orderForm.delivery_address) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const orderData = {
                ...orderForm,
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: Number(item.price),
                })),
                subtotal,
                delivery_fee: deliveryFee,
                tax_amount: taxAmount,
                total_amount: totalAmount,
            };

            const response = await fetch(`/fnb/store/${domain}/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (result.status === 'success') {
                toast.success('Order submitted successfully!');
                // Redirect to order status page
                router.visit(`/fnb/store/${domain}/order/${result.data.order_number}`);
            } else {
                toast.error(result.message || 'Failed to submit order');
            }
        } catch (error) {
            toast.error('Failed to submit order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [cart, orderForm, subtotal, deliveryFee, taxAmount, totalAmount, domain]);

    return (
        <>
            <Head title={`${store.name} - Menu`} />
            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Link href={`/fnb/store/${domain}`} className="mr-4">
                                    <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {store.name}
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400">Menu & Order</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setIsCheckoutOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={cart.length === 0}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Menu Section */}
                        <div className="lg:col-span-3">
                            {/* Search and Filter */}
                            <div className="mb-6 space-y-4">
                                <Input
                                    placeholder="Search menu items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(category => (
                                        <Button
                                            key={category}
                                            variant={selectedCategory === category ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSelectedCategory(category)}
                                        >
                                            {category === 'all' ? 'All Items' : category}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredMenuItems.map(item => (
                                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {item.description}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="ml-2">
                                                    {item.category}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                    ${Number(item.price).toFixed(2)}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    onClick={() => addToCart(item)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {filteredMenuItems.length === 0 && (
                                <div className="text-center py-12">
                                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No menu items found matching your search.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Cart Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        Your Cart
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {cart.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                            Your cart is empty
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {cart.map(item => (
                                                <div key={item.id} className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{item.name}</p>
                                                        <p className="text-xs text-gray-500">${Number(item.price).toFixed(2)} each</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => removeFromCart(item.id)}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="text-sm font-medium w-8 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, description: '', category: '' })}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            <div className="border-t pt-3 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Subtotal:</span>
                                                    <span>${subtotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Delivery Fee:</span>
                                                    <span>${deliveryFee.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Tax:</span>
                                                    <span>${taxAmount.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-lg">
                                                    <span>Total:</span>
                                                    <span>${totalAmount.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Checkout Modal */}
                {isCheckoutOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <CardHeader>
                                <CardTitle>Complete Your Order</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="customer_name">Full Name *</Label>
                                    <Input
                                        id="customer_name"
                                        value={orderForm.customer_name}
                                        onChange={(e) => setOrderForm(prev => ({ ...prev, customer_name: e.target.value }))}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customer_email">Email *</Label>
                                    <Input
                                        id="customer_email"
                                        type="email"
                                        value={orderForm.customer_email}
                                        onChange={(e) => setOrderForm(prev => ({ ...prev, customer_email: e.target.value }))}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customer_phone">Phone *</Label>
                                    <Input
                                        id="customer_phone"
                                        value={orderForm.customer_phone}
                                        onChange={(e) => setOrderForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="delivery_address">Delivery Address *</Label>
                                    <Textarea
                                        id="delivery_address"
                                        value={orderForm.delivery_address}
                                        onChange={(e) => setOrderForm(prev => ({ ...prev, delivery_address: e.target.value }))}
                                        placeholder="Enter your delivery address"
                                        rows={3}
                                    />
                                </div>
                                
                                <div className="border-t pt-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Delivery Fee:</span>
                                            <span>${deliveryFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tax:</span>
                                            <span>${taxAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total:</span>
                                            <span>${totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsCheckoutOpen(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmitOrder}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Place Order'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}
