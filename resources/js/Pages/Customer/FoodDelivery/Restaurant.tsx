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
        if (restaurant?.id) {
            const savedCart = localStorage.getItem(`food_delivery_cart_${restaurant.id}`);
            if (savedCart) {
                try {
                    const cartData = JSON.parse(savedCart);
                    // Handle both old format (array) and new format (object with cart property)
                    const loadedCart = Array.isArray(cartData) ? cartData : (cartData.cart || []);
                    
                    // Recalculate subtotals to ensure they're valid numbers
                    const validatedCart = loadedCart.map((item: CartItem) => {
                        // Get price - prioritize effective_price, then discount_price, then price
                        let effectivePrice = 0;
                        if (item.menu_item?.effective_price !== undefined && item.menu_item.effective_price !== null) {
                            effectivePrice = parseFloat(String(item.menu_item.effective_price)) || 0;
                        } else if (item.menu_item?.discount_price !== undefined && item.menu_item.discount_price !== null) {
                            effectivePrice = parseFloat(String(item.menu_item.discount_price)) || 0;
                        } else if (item.menu_item?.price !== undefined && item.menu_item.price !== null) {
                            effectivePrice = parseFloat(String(item.menu_item.price)) || 0;
                        }
                        
                        const quantity = parseInt(String(item.quantity)) || 1;
                        const subtotal = effectivePrice * quantity;
                        
                        // Validate the calculated subtotal
                        if (isNaN(subtotal) || subtotal < 0 || subtotal > 1000000) {
                            console.warn('Invalid subtotal detected, resetting item:', {
                                item: item.menu_item?.name,
                                effectivePrice,
                                quantity,
                                calculatedSubtotal: subtotal,
                                storedSubtotal: item.subtotal
                            });
                            // Skip invalid items
                            return null;
                        }
                        
                        return {
                            ...item,
                            quantity,
                            subtotal: subtotal,
                            menu_item: {
                                ...item.menu_item,
                                price: parseFloat(String(item.menu_item?.price)) || 0,
                                discount_price: item.menu_item?.discount_price ? parseFloat(String(item.menu_item.discount_price)) : undefined,
                                effective_price: item.menu_item?.effective_price ? parseFloat(String(item.menu_item.effective_price)) : undefined,
                            }
                        };
                    }).filter((item: CartItem | null): item is CartItem => item !== null); // Remove null items
                    
                    setCart(validatedCart);
                } catch (error) {
                    console.error('Error loading cart from localStorage:', error);
                    // Clear corrupted cart data
                    localStorage.removeItem(`food_delivery_cart_${restaurant.id}`);
                    localStorage.removeItem('food_delivery_cart');
                    setCart([]);
                }
            }
        }
    }, [restaurant?.id]);

    useEffect(() => {
        // Save cart to localStorage
        if (restaurant?.id) {
            try {
                const cartData = {
                    cart: cart,
                    restaurantId: restaurant.id
                };
                localStorage.setItem(`food_delivery_cart_${restaurant.id}`, JSON.stringify(cartData));
                // Also save to main cart key for Cart.tsx compatibility
                localStorage.setItem('food_delivery_cart', JSON.stringify(cartData));
            } catch (error) {
                console.error('Error saving cart to localStorage:', error);
            }
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
                    // Remove is_available filter to show all items, we'll filter in frontend if needed
                },
            });
            if (response.data.success) {
                // Filter available items in frontend
                const items = response.data.data || [];
                setMenuItems(items.filter((item: FoodDeliveryMenuItem) => item.is_available));
            } else {
                console.error('Failed to load menu items:', response.data);
                toast.error(response.data.message || 'Failed to load menu items');
            }
        } catch (error: any) {
            console.error('Error loading menu items:', error);
            toast.error(error.response?.data?.message || 'Failed to load menu items');
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
        // Get price - prioritize effective_price, then discount_price, then price
        let effectivePrice = 0;
        if (item.effective_price !== undefined && item.effective_price !== null) {
            effectivePrice = parseFloat(String(item.effective_price)) || 0;
        } else if (item.discount_price !== undefined && item.discount_price !== null) {
            effectivePrice = parseFloat(String(item.discount_price)) || 0;
        } else if (item.price !== undefined && item.price !== null) {
            effectivePrice = parseFloat(String(item.price)) || 0;
        }
        
        const existingItem = cart.find((ci) => ci.menu_item.id === item.id);
        if (existingItem) {
            setCart(
                cart.map((ci) => {
                    if (ci.menu_item.id === item.id) {
                        // Get price for existing item
                        let ciEffectivePrice = 0;
                        if (ci.menu_item.effective_price !== undefined && ci.menu_item.effective_price !== null) {
                            ciEffectivePrice = parseFloat(String(ci.menu_item.effective_price)) || 0;
                        } else if (ci.menu_item.discount_price !== undefined && ci.menu_item.discount_price !== null) {
                            ciEffectivePrice = parseFloat(String(ci.menu_item.discount_price)) || 0;
                        } else if (ci.menu_item.price !== undefined && ci.menu_item.price !== null) {
                            ciEffectivePrice = parseFloat(String(ci.menu_item.price)) || 0;
                        }
                        
                        const newQuantity = ci.quantity + 1;
                        const subtotal = ciEffectivePrice * newQuantity;
                        return { ...ci, quantity: newQuantity, subtotal: isNaN(subtotal) ? 0 : subtotal };
                    }
                    return ci;
                })
            );
        } else {
            setCart([
                ...cart,
                {
                    menu_item: item,
                    quantity: 1,
                    subtotal: isNaN(effectivePrice) ? 0 : effectivePrice,
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
                if (ci.menu_item.id === itemId) {
                    // Get price - prioritize effective_price, then discount_price, then price
                    let effectivePrice = 0;
                    if (ci.menu_item.effective_price !== undefined && ci.menu_item.effective_price !== null) {
                        effectivePrice = parseFloat(String(ci.menu_item.effective_price)) || 0;
                    } else if (ci.menu_item.discount_price !== undefined && ci.menu_item.discount_price !== null) {
                        effectivePrice = parseFloat(String(ci.menu_item.discount_price)) || 0;
                    } else if (ci.menu_item.price !== undefined && ci.menu_item.price !== null) {
                        effectivePrice = parseFloat(String(ci.menu_item.price)) || 0;
                    }
                    
                    const newQuantity = parseInt(String(quantity)) || 1;
                    const subtotal = effectivePrice * newQuantity;
                    return { ...ci, quantity: newQuantity, subtotal: isNaN(subtotal) ? 0 : subtotal };
                }
                return ci;
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

    const getSubtotal = () => {
        // Recalculate subtotal from source to ensure accuracy
        const subtotal = cart.reduce((sum, item) => {
            // Get price - prioritize effective_price, then discount_price, then price
            let effectivePrice = 0;
            if (item.menu_item.effective_price !== undefined && item.menu_item.effective_price !== null) {
                effectivePrice = parseFloat(String(item.menu_item.effective_price)) || 0;
            } else if (item.menu_item.discount_price !== undefined && item.menu_item.discount_price !== null) {
                effectivePrice = parseFloat(String(item.menu_item.discount_price)) || 0;
            } else if (item.menu_item.price !== undefined && item.menu_item.price !== null) {
                effectivePrice = parseFloat(String(item.menu_item.price)) || 0;
            }
            
            const quantity = parseInt(String(item.quantity)) || 1;
            const calculatedSubtotal = effectivePrice * quantity;
            
            if (isNaN(calculatedSubtotal) || calculatedSubtotal < 0) {
                console.warn('Invalid subtotal calculation for item:', {
                    item: item.menu_item.name,
                    price: item.menu_item.price,
                    quantity: item.quantity,
                    calculatedSubtotal
                });
                return sum;
            }
            
            // Ensure sum is a number before adding
            const currentSum = typeof sum === 'number' ? sum : parseFloat(String(sum)) || 0;
            return currentSum + calculatedSubtotal;
        }, 0);
        
        return isNaN(subtotal) ? 0 : subtotal;
    };

    const getTotal = () => {
        const subtotal = getSubtotal();
        const deliveryFee = parseFloat(String(restaurant?.delivery_fee)) || 0;
        
        // Ensure both are numbers before adding
        const numSubtotal = typeof subtotal === 'number' ? subtotal : parseFloat(String(subtotal)) || 0;
        const numDeliveryFee = typeof deliveryFee === 'number' ? deliveryFee : parseFloat(String(deliveryFee)) || 0;
        const total = numSubtotal + numDeliveryFee;
        
        if (isNaN(total)) {
            console.error('Invalid total calculation:', {
                subtotal: numSubtotal,
                deliveryFee: numDeliveryFee,
                cart: cart.map(item => ({
                    name: item.menu_item.name,
                    price: item.menu_item.price,
                    quantity: item.quantity,
                    storedSubtotal: item.subtotal
                }))
            });
            return 0;
        }
        
        return total;
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
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
                                        {restaurant.rating && typeof restaurant.rating === 'number' ? restaurant.rating.toFixed(1) : 'N/A'}
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
                </div>

                {/* Cart Summary Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Your Cart</span>
                                {cart.length > 0 && (
                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                        {cart.length} item{cart.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Your cart is empty</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Add items from the menu to get started</p>
                                </div>
                            ) : (
                                <>
                                    {/* Cart Items List */}
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {cart.map((item) => {
                                            // Calculate effective price
                                            let effectivePrice = 0;
                                            if (item.menu_item.effective_price !== undefined && item.menu_item.effective_price !== null) {
                                                effectivePrice = parseFloat(String(item.menu_item.effective_price)) || 0;
                                            } else if (item.menu_item.discount_price !== undefined && item.menu_item.discount_price !== null) {
                                                effectivePrice = parseFloat(String(item.menu_item.discount_price)) || 0;
                                            } else if (item.menu_item.price !== undefined && item.menu_item.price !== null) {
                                                effectivePrice = parseFloat(String(item.menu_item.price)) || 0;
                                            }
                                            const quantity = parseInt(String(item.quantity)) || 1;
                                            const itemSubtotal = effectivePrice * quantity;
                                            
                                            return (
                                                <div key={item.menu_item.id} className="flex items-start justify-between gap-2 pb-3 border-b last:border-0">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {item.menu_item.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {quantity} × {formatCurrency(effectivePrice)}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                        {formatCurrency(itemSubtotal)}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                            <span className="text-gray-900 dark:text-white">{formatCurrency(getSubtotal())}</span>
                                        </div>
                                        {restaurant?.delivery_fee && restaurant.delivery_fee > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                                                <span className="text-gray-900 dark:text-white">{formatCurrency(restaurant.delivery_fee)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-2 border-t font-bold">
                                            <span className="text-gray-900 dark:text-white">Total</span>
                                            <span className="text-gray-900 dark:text-white">{formatCurrency(getTotal())}</span>
                                        </div>
                                    </div>

                                    {/* View Cart Button */}
                                    <Button 
                                        onClick={() => router.visit('/food-delivery/cart')} 
                                        className="w-full"
                                    >
                                        View Cart
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

