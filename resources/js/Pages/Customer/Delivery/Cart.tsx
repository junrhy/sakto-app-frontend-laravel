import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeftIcon, ShoppingCartIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import CartItemComponent from './components/CartItem';
import { CartItem, FoodDeliveryRestaurant, OrderFormData } from './types';

interface Props extends PageProps {
    restaurant?: FoodDeliveryRestaurant;
}

export default function FoodDeliveryCart({
    auth,
    restaurant: initialRestaurant,
}: Props) {
    const [restaurant, setRestaurant] = useState<FoodDeliveryRestaurant | null>(
        initialRestaurant || null,
    );
    const [restaurants, setRestaurants] = useState<
        Map<number, FoodDeliveryRestaurant>
    >(new Map());
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fetchingRestaurants = useRef<Set<number>>(new Set());
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
            const loadedCart = cartData.cart || [];

            // Recalculate subtotals to ensure they're valid numbers
            const validatedCart = loadedCart.map((item: CartItem) => {
                // Get price - prioritize effective_price, then discount_price, then price
                let effectivePrice = 0;
                if (
                    item.menu_item.effective_price !== undefined &&
                    item.menu_item.effective_price !== null
                ) {
                    effectivePrice =
                        parseFloat(String(item.menu_item.effective_price)) || 0;
                } else if (
                    item.menu_item.discount_price !== undefined &&
                    item.menu_item.discount_price !== null
                ) {
                    effectivePrice =
                        parseFloat(String(item.menu_item.discount_price)) || 0;
                } else if (
                    item.menu_item.price !== undefined &&
                    item.menu_item.price !== null
                ) {
                    effectivePrice =
                        parseFloat(String(item.menu_item.price)) || 0;
                }

                const quantity = parseInt(String(item.quantity)) || 1;
                const subtotal = effectivePrice * quantity;

                return {
                    ...item,
                    quantity,
                    subtotal: isNaN(subtotal) ? 0 : subtotal,
                    menu_item: {
                        ...item.menu_item,
                        price: parseFloat(String(item.menu_item.price)) || 0,
                        discount_price: item.menu_item.discount_price
                            ? parseFloat(String(item.menu_item.discount_price))
                            : undefined,
                        effective_price: item.menu_item.effective_price
                            ? parseFloat(String(item.menu_item.effective_price))
                            : undefined,
                    },
                };
            });

            setCart(validatedCart);

            // Fetch restaurants for all unique restaurant_ids in cart
            const uniqueRestaurantIds = Array.from(
                new Set(
                    validatedCart.map(
                        (item: CartItem) => item.menu_item.restaurant_id,
                    ),
                ),
            ) as number[];
            uniqueRestaurantIds.forEach((restaurantId: number) => {
                fetchRestaurant(restaurantId);
            });

            // Also set the primary restaurant if it exists (for backward compatibility)
            if (cartData.restaurantId) {
                fetchRestaurant(cartData.restaurantId);
            }
        }
    }, []);

    const fetchRestaurant = async (restaurantId: number) => {
        // Check if we're already fetching this restaurant
        if (fetchingRestaurants.current.has(restaurantId)) {
            return;
        }

        // Check if we already have this restaurant
        if (restaurants.has(restaurantId)) {
            return;
        }

        fetchingRestaurants.current.add(restaurantId);
        setLoading(true);
        try {
            const response = await axios.get(
                `/food-delivery/restaurants/${restaurantId}`,
                {
                    params: {
                        client_identifier: (auth.user as any)?.identifier,
                    },
                },
            );
            if (response.data.success) {
                const restaurantData = response.data.data;
                setRestaurants((prev) => {
                    // Double-check before adding
                    if (prev.has(restaurantId)) {
                        return prev;
                    }
                    const newMap = new Map(prev);
                    newMap.set(restaurantId, restaurantData);
                    return newMap;
                });

                // Set as primary restaurant if not already set (for backward compatibility)
                setRestaurant((prev) => {
                    if (!prev) {
                        setFormData((formPrev) => ({
                            ...formPrev,
                            restaurant_id: restaurantId.toString(),
                        }));
                        return restaurantData;
                    }
                    return prev;
                });
            }
        } catch (error: any) {
            console.error('Failed to load restaurant:', error);
        } finally {
            fetchingRestaurants.current.delete(restaurantId);
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
                if (ci.menu_item.id === itemId) {
                    // Get price - prioritize effective_price, then discount_price, then price
                    let effectivePrice = 0;
                    if (
                        ci.menu_item.effective_price !== undefined &&
                        ci.menu_item.effective_price !== null
                    ) {
                        effectivePrice =
                            parseFloat(String(ci.menu_item.effective_price)) ||
                            0;
                    } else if (
                        ci.menu_item.discount_price !== undefined &&
                        ci.menu_item.discount_price !== null
                    ) {
                        effectivePrice =
                            parseFloat(String(ci.menu_item.discount_price)) ||
                            0;
                    } else if (
                        ci.menu_item.price !== undefined &&
                        ci.menu_item.price !== null
                    ) {
                        effectivePrice =
                            parseFloat(String(ci.menu_item.price)) || 0;
                    }

                    const newQuantity = parseInt(String(quantity)) || 1;
                    const subtotal = effectivePrice * newQuantity;
                    return {
                        ...ci,
                        quantity: newQuantity,
                        subtotal: isNaN(subtotal) ? 0 : subtotal,
                    };
                }
                return ci;
            }),
        );
    };

    const removeFromCart = (itemId: number) => {
        setCart(cart.filter((ci) => ci.menu_item.id !== itemId));
        toast.success('Removed from cart');
    };

    const formatCurrency = (amount: number) => {
        let currency: {
            symbol: string;
            thousands_separator?: string;
            decimal_separator?: string;
        };
        const appCurrency = (auth.user as any)?.app_currency;
        if (appCurrency) {
            if (typeof appCurrency === 'string') {
                currency = JSON.parse(appCurrency);
            } else {
                currency = appCurrency;
            }
        } else {
            currency = {
                symbol: '₱',
                thousands_separator: ',',
                decimal_separator: '.',
            };
        }
        return `${currency.symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getSubtotal = () => {
        const subtotal = cart.reduce((sum, item) => {
            // Recalculate subtotal from price and quantity to ensure accuracy
            let effectivePrice = 0;
            if (
                item.menu_item.effective_price !== undefined &&
                item.menu_item.effective_price !== null
            ) {
                effectivePrice =
                    parseFloat(String(item.menu_item.effective_price)) || 0;
            } else if (
                item.menu_item.discount_price !== undefined &&
                item.menu_item.discount_price !== null
            ) {
                effectivePrice =
                    parseFloat(String(item.menu_item.discount_price)) || 0;
            } else if (
                item.menu_item.price !== undefined &&
                item.menu_item.price !== null
            ) {
                effectivePrice = parseFloat(String(item.menu_item.price)) || 0;
            }

            const quantity = parseInt(String(item.quantity)) || 1;
            const calculatedSubtotal = effectivePrice * quantity;

            if (isNaN(calculatedSubtotal) || calculatedSubtotal < 0) {
                console.warn('Invalid subtotal calculation for item:', {
                    item: item.menu_item.name,
                    price: item.menu_item.price,
                    discount_price: item.menu_item.discount_price,
                    effective_price: item.menu_item.effective_price,
                    quantity: item.quantity,
                    calculatedSubtotal,
                });
                return sum;
            }

            return sum + calculatedSubtotal;
        }, 0);
        return isNaN(subtotal) ? 0 : subtotal;
    };

    const getDeliveryFee = () => {
        const fee = parseFloat(String(restaurant?.delivery_fee)) || 0;
        return isNaN(fee) ? 0 : fee;
    };

    const getTotal = () => {
        const subtotal = getSubtotal();
        const deliveryFee = getDeliveryFee();
        const total = subtotal + deliveryFee;
        return isNaN(total) ? 0 : total;
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

        if (
            restaurant &&
            restaurant.minimum_order_amount > 0 &&
            getTotal() < restaurant.minimum_order_amount
        ) {
            toast.error(
                `Minimum order amount is ${formatCurrency(restaurant.minimum_order_amount)}`,
            );
            return;
        }

        setSubmitting(true);
        try {
            const orderData = {
                ...formData,
                customer_id: auth.user?.id, // Add customer_id
                restaurant_id: restaurant?.id,
                items: cart.map((item) => ({
                    menu_item_id: item.menu_item.id,
                    item_name: item.menu_item.name,
                    item_price:
                        item.menu_item.effective_price ||
                        item.menu_item.discount_price ||
                        item.menu_item.price,
                    quantity: item.quantity,
                    special_instructions: item.special_instructions,
                })),
                subtotal: getSubtotal(),
                delivery_fee: getDeliveryFee(),
                service_charge: 0,
                discount: 0,
            };

            const response = await axios.post(
                '/food-delivery/orders',
                orderData,
            );
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
            toast.error(
                error.response?.data?.message || 'Failed to place order',
            );
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
                            <ShoppingCartIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="mb-4 text-gray-500">
                                Your cart is empty
                            </p>
                            <Button
                                onClick={() => router.visit('/food-delivery')}
                            >
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
                            onClick={() =>
                                router.visit(
                                    `/food-delivery/restaurant/${restaurant?.id}`,
                                )
                            }
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
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
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Cart Items */}
                    <div className="space-y-4 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {cart.length === 0 ? (
                                    <p className="py-8 text-center text-gray-500">
                                        Your cart is empty
                                    </p>
                                ) : (
                                    <div className="space-y-6">
                                        {(() => {
                                            // Group items by restaurant_id
                                            const groupedItems = cart.reduce(
                                                (acc, item) => {
                                                    const restaurantId =
                                                        item.menu_item
                                                            .restaurant_id;
                                                    if (!acc[restaurantId]) {
                                                        acc[restaurantId] = [];
                                                    }
                                                    acc[restaurantId].push(
                                                        item,
                                                    );
                                                    return acc;
                                                },
                                                {} as Record<
                                                    number,
                                                    CartItem[]
                                                >,
                                            );

                                            return Object.entries(
                                                groupedItems,
                                            ).map(([restaurantId, items]) => {
                                                const restaurantData =
                                                    restaurants.get(
                                                        Number(restaurantId),
                                                    );
                                                return (
                                                    <div
                                                        key={restaurantId}
                                                        className="space-y-3"
                                                    >
                                                        {restaurantData && (
                                                            <div className="flex items-center gap-2 border-b pb-2">
                                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                    {
                                                                        restaurantData.name
                                                                    }
                                                                </h4>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    (
                                                                    {
                                                                        items.length
                                                                    }{' '}
                                                                    item
                                                                    {items.length !==
                                                                    1
                                                                        ? 's'
                                                                        : ''}
                                                                    )
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="space-y-4 pl-4">
                                                            {items.map(
                                                                (item) => (
                                                                    <CartItemComponent
                                                                        key={
                                                                            item
                                                                                .menu_item
                                                                                .id
                                                                        }
                                                                        item={
                                                                            item
                                                                        }
                                                                        formatCurrency={
                                                                            formatCurrency
                                                                        }
                                                                        onUpdateQuantity={
                                                                            updateQuantity
                                                                        }
                                                                        onRemove={
                                                                            removeFromCart
                                                                        }
                                                                    />
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
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
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                customer_name: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customer_phone">
                                        Phone
                                    </Label>
                                    <Input
                                        id="customer_phone"
                                        value={formData.customer_phone}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                customer_phone: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customer_email">
                                        Email
                                    </Label>
                                    <Input
                                        id="customer_email"
                                        type="email"
                                        value={formData.customer_email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                customer_email: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customer_address">
                                        Delivery Address
                                    </Label>
                                    <Input
                                        id="customer_address"
                                        value={formData.customer_address}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                customer_address:
                                                    e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="special_instructions">
                                        Special Instructions
                                    </Label>
                                    <Input
                                        id="special_instructions"
                                        value={formData.special_instructions}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                special_instructions:
                                                    e.target.value,
                                            })
                                        }
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
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Subtotal
                                        </span>
                                        <span className="text-gray-900 dark:text-white">
                                            {formatCurrency(getSubtotal())}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Delivery Fee
                                        </span>
                                        <span className="text-gray-900 dark:text-white">
                                            {formatCurrency(getDeliveryFee())}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 font-bold">
                                        <span className="text-gray-900 dark:text-white">
                                            Total
                                        </span>
                                        <span className="text-gray-900 dark:text-white">
                                            {formatCurrency(getTotal())}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <Label>Payment Method</Label>
                                    <RadioGroup
                                        value={formData.payment_method}
                                        onValueChange={(
                                            value:
                                                | 'online'
                                                | 'cash_on_delivery',
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                payment_method: value,
                                            })
                                        }
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="cash_on_delivery"
                                                id="cod"
                                            />
                                            <Label htmlFor="cod">
                                                Cash on Delivery
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="online"
                                                id="online"
                                            />
                                            <Label htmlFor="online">
                                                Online Payment
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={submitting || cart.length === 0}
                                >
                                    {submitting
                                        ? 'Placing Order...'
                                        : 'Place Order'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
