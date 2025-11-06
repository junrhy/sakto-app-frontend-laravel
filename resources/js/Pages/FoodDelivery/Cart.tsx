import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { ShoppingCartIcon, PlusIcon, MinusIcon, TrashIcon, ArrowLeftIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { FoodDeliveryRestaurant, CartItem, OrderFormData } from './types';
import CartItemComponent from './components/CartItem';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {
    restaurant?: FoodDeliveryRestaurant;
}

export default function FoodDeliveryCart({ auth, restaurant: initialRestaurant }: Props) {
    const [restaurant, setRestaurant] = useState<FoodDeliveryRestaurant | null>(initialRestaurant || null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<OrderFormData>({
        customer_name: auth.user?.name || '',
        customer_phone: (auth.user as any)?.contact_number || '',
        customer_email: auth.user?.email || '',
        customer_address: '',
        customer_coordinates: '',
        restaurant_id: '',
        items: [],
        payment_method: 'cash_on_delivery',
        special_instructions: '',
    });

    useEffect(() => {
        // Load cart from localStorage
        const savedCart = localStorage.getItem('food_delivery_cart');
        if (savedCart) {
            const cartData = JSON.parse(savedCart);
            setCart(cartData.cart || []);
            if (cartData.restaurantId) {
                fetchRestaurant(cartData.restaurantId);
            }
        }
    }, []);

    const fetchRestaurant = async (restaurantId: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`/food-delivery/restaurant/${restaurantId}/show`, {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                },
            });
            if (response.data.success) {
                setRestaurant(response.data.data);
                setFormData((prev) => ({ ...prev, restaurant_id: restaurantId.toString() }));
            }
        } catch (error: any) {
            toast.error('Failed to load restaurant');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = (itemId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCart(
            cart.map((ci) => {
                const effectivePrice = ci.menu_item.effective_price || ci.menu_item.discount_price || ci.menu_item.price;
                return ci.menu_item.id === itemId
                    ? { ...ci, quantity, subtotal: quantity * effectivePrice }
                    : ci;
            })
        );
    };

    const removeFromCart = (itemId: number) => {
        setCart(cart.filter((ci) => ci.menu_item.id !== itemId));
        toast.success('Removed from cart');
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

    const getSubtotal = () => {
        return cart.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const getDeliveryFee = () => {
        return restaurant?.delivery_fee || 0;
    };

    const getTotal = () => {
        return getSubtotal() + getDeliveryFee();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        if (!formData.customer_address) {
            toast.error('Please enter your delivery address');
            return;
        }

        if (restaurant && restaurant.minimum_order_amount > 0 && getTotal() < restaurant.minimum_order_amount) {
            toast.error(`Minimum order amount is ${formatCurrency(restaurant.minimum_order_amount)}`);
            return;
        }

        setSubmitting(true);
        try {
            const orderData = {
                ...formData,
                restaurant_id: restaurant?.id,
                items: cart.map((item) => ({
                    menu_item_id: item.menu_item.id,
                    item_name: item.menu_item.name,
                    item_price: item.menu_item.effective_price || item.menu_item.discount_price || item.menu_item.price,
                    quantity: item.quantity,
                    special_instructions: item.special_instructions,
                })),
                subtotal: getSubtotal(),
                delivery_fee: getDeliveryFee(),
                service_charge: 0,
                discount: 0,
            };

            const response = await axios.post('/food-delivery/orders', orderData);
            if (response.data.success) {
                // Clear cart
                localStorage.removeItem('food_delivery_cart');
                setCart([]);
                toast.success('Order placed successfully!');
                router.visit(`/food-delivery/order/${response.data.data.id}`);
            } else {
                toast.error(response.data.message || 'Failed to place order');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    if (!restaurant && cart.length === 0) {
        return (
            <AuthenticatedLayout>
                <Head title="Cart" />
                <div className="p-6">
                    <Card>
                        <CardContent className="p-12 text-center">
                            <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">Your cart is empty</p>
                            <Button onClick={() => router.visit('/food-delivery')}>
                                Browse Restaurants
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit(`/food-delivery/restaurant/${restaurant?.id}`)}
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Menu
                        </Button>
                        <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                            <ShoppingCartIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                                Shopping Cart
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Review your order
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Cart" />

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {cart.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <CartItemComponent
                                                key={item.menu_item.id}
                                                item={item}
                                                formatCurrency={formatCurrency}
                                                onUpdateQuantity={updateQuantity}
                                                onRemove={removeFromCart}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Delivery Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="customer_name">Name</Label>
                                    <Input
                                        id="customer_name"
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customer_phone">Phone</Label>
                                    <Input
                                        id="customer_phone"
                                        value={formData.customer_phone}
                                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customer_email">Email</Label>
                                    <Input
                                        id="customer_email"
                                        type="email"
                                        value={formData.customer_email}
                                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customer_address">Delivery Address</Label>
                                    <Input
                                        id="customer_address"
                                        value={formData.customer_address}
                                        onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="special_instructions">Special Instructions</Label>
                                    <Input
                                        id="special_instructions"
                                        value={formData.special_instructions}
                                        onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                                        placeholder="Any special instructions for the restaurant or driver"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                        <span className="text-gray-900 dark:text-white">{formatCurrency(getSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                                        <span className="text-gray-900 dark:text-white">{formatCurrency(getDeliveryFee())}</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-bold">
                                        <span className="text-gray-900 dark:text-white">Total</span>
                                        <span className="text-gray-900 dark:text-white">{formatCurrency(getTotal())}</span>
                                    </div>
                                </div>

                                <div>
                                    <Label>Payment Method</Label>
                                    <RadioGroup
                                        value={formData.payment_method}
                                        onValueChange={(value: 'online' | 'cash_on_delivery') =>
                                            setFormData({ ...formData, payment_method: value })
                                        }
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="cash_on_delivery" id="cod" />
                                            <Label htmlFor="cod">Cash on Delivery</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="online" id="online" />
                                            <Label htmlFor="online">Online Payment</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={submitting || cart.length === 0}
                                >
                                    {submitting ? 'Placing Order...' : 'Place Order'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}

