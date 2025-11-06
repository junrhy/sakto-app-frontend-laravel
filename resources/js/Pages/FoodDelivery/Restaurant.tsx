import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { UtensilsIcon, ShoppingCartIcon, StarIcon, ClockIcon, MapPinIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { FoodDeliveryRestaurant, FoodDeliveryMenuItem, FoodDeliveryMenuCategory, CartItem } from './types';
import MenuItemCard from './components/MenuItemCard';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {
    restaurant?: FoodDeliveryRestaurant;
}

export default function FoodDeliveryRestaurantPage({ auth, restaurant: initialRestaurant }: Props) {
    const [restaurant, setRestaurant] = useState<FoodDeliveryRestaurant | null>(initialRestaurant || null);
    const [menuItems, setMenuItems] = useState<FoodDeliveryMenuItem[]>([]);
    const [categories, setCategories] = useState<FoodDeliveryMenuCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (restaurant?.id) {
            fetchMenuItems();
            fetchCategories();
        }
    }, [restaurant?.id]);

    useEffect(() => {
        // Load cart from localStorage
        const savedCart = localStorage.getItem(`food_delivery_cart_${restaurant?.id}`);
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, [restaurant?.id]);

    useEffect(() => {
        // Save cart to localStorage
        if (restaurant?.id) {
            localStorage.setItem(`food_delivery_cart_${restaurant.id}`, JSON.stringify(cart));
        }
    }, [cart, restaurant?.id]);

    const fetchMenuItems = async () => {
        if (!restaurant?.id) return;
        setLoading(true);
        try {
            const response = await axios.get('/food-delivery/menu/items', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                    restaurant_id: restaurant.id,
                    is_available: true,
                },
            });
            if (response.data.success) {
                setMenuItems(response.data.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load menu items');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        if (!restaurant?.id) return;
        try {
            const response = await axios.get('/food-delivery/menu/categories', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                },
            });
            if (response.data.success) {
                setCategories(response.data.data || []);
            }
        } catch (error: any) {
            // Categories are optional, so we don't show error
        }
    };

    const addToCart = (item: FoodDeliveryMenuItem) => {
        const effectivePrice = item.effective_price || item.discount_price || item.price;
        const existingItem = cart.find((ci) => ci.menu_item.id === item.id);
        if (existingItem) {
            setCart(
                cart.map((ci) => {
                    const ciEffectivePrice = ci.menu_item.effective_price || ci.menu_item.discount_price || ci.menu_item.price;
                    return ci.menu_item.id === item.id
                        ? { ...ci, quantity: ci.quantity + 1, subtotal: (ci.quantity + 1) * ciEffectivePrice }
                        : ci;
                })
            );
        } else {
            setCart([
                ...cart,
                {
                    menu_item: item,
                    quantity: 1,
                    subtotal: effectivePrice,
                },
            ]);
        }
        toast.success('Added to cart');
    };

    const removeFromCart = (itemId: number) => {
        setCart(cart.filter((ci) => ci.menu_item.id !== itemId));
        toast.success('Removed from cart');
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

    const getTotal = () => {
        const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
        const deliveryFee = restaurant?.delivery_fee || 0;
        return subtotal + deliveryFee;
    };

    const filteredItems = selectedCategory === 'all'
        ? menuItems
        : menuItems.filter((item) => item.category_id?.toString() === selectedCategory);

    if (!restaurant) {
        return (
            <AuthenticatedLayout>
                <Head title="Restaurant Not Found" />
                <div className="p-6 text-center">
                    <p className="text-gray-500">Restaurant not found</p>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                            <UtensilsIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                                {restaurant.name}
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {restaurant.description || 'Browse our menu'}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/food-delivery/cart')}
                        className="relative"
                    >
                        <ShoppingCartIcon className="h-4 w-4 mr-2" />
                        Cart
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {cart.length}
                            </span>
                        )}
                    </Button>
                </div>
            }
        >
            <Head title={restaurant.name} />

            <div className="space-y-6 p-6">
                {/* Restaurant Info */}
                <Card>
                    <div className="relative h-64 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                        {restaurant.cover_image ? (
                            <img
                                src={restaurant.cover_image}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <UtensilsIcon className="h-24 w-24 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                                <div className="flex items-center space-x-1">
                                    <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {restaurant.rating?.toFixed(1) || 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Fee</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(restaurant.delivery_fee)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Prep Time</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {restaurant.estimated_prep_time} min
                                </p>
                            </div>
                        </div>
                        {restaurant.minimum_order_amount > 0 && (
                            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                Minimum order: {formatCurrency(restaurant.minimum_order_amount)}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Category Filter */}
                {categories.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <Button
                            variant={selectedCategory === 'all' ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory('all')}
                            className="whitespace-nowrap"
                        >
                            All
                        </Button>
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                variant={selectedCategory === category.id.toString() ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory(category.id.toString())}
                                className="whitespace-nowrap"
                            >
                                {category.name}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Menu Items */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                        <p className="mt-2 text-gray-500">Loading menu...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <UtensilsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No menu items available</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <MenuItemCard
                                key={item.id}
                                item={item}
                                formatCurrency={formatCurrency}
                                onAddToCart={addToCart}
                            />
                        ))}
                    </div>
                )}

                {/* Cart Summary (Floating) */}
                {cart.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t shadow-lg p-4 z-50">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    Total: {formatCurrency(getTotal())}
                                </p>
                            </div>
                            <Button onClick={() => router.visit('/food-delivery/cart')}>
                                View Cart
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

