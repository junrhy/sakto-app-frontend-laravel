import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

declare global {
    interface Window {
        config: {
            api: {
                url: string;
                token: string;
            };
        };
    }
}

interface MenuItem {
    id: number;
    name: string;
    price: string;
    category: string;
    image: string | null;
    is_available_personal: boolean;
    is_available_online: boolean;
    delivery_fee: string;
}

interface CartItem extends MenuItem {
    quantity: number;
}

interface Restaurant {
    client_id: number;
    client_identifier: string;
    restaurant_name: string;
    menu_items: MenuItem[];
    contact_number: string;
    website: string;
    address: string;
}

interface DeliveryInfo {
    name: string;
    phone: string;
    address: string;
    notes: string;
}

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
    identifier: string;
    delivery: {
        id: number;
        name: string;
        email: string;
        contact_number: string;
        app_currency: string;
        created_at: string;
        identifier: string;
        slug: string;
    };
}

export default function DeliveryShow({
    auth,
    identifier,
    delivery,
}: PageProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useState('order');
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRestaurant, setSelectedRestaurant] =
        useState<Restaurant | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
        name: '',
        phone: '',
        address: '',
        notes: '',
    });
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discount: number;
    } | null>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState('');

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await axios.get(
                    `${window.config.api.url}/restaurants`,
                    {
                        headers: {
                            Authorization: `Bearer ${window.config.api.token}`,
                        },
                    },
                );
                // Convert the restaurants object into an array with proper type assertion
                const restaurantsArray = Object.values(
                    response.data.restaurants,
                ) as Restaurant[];
                setRestaurants(restaurantsArray);
            } catch (error) {
                console.error('Error fetching restaurants:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const handleViewMenu = (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant);
        setActiveTab('menu');
    };

    const handleAddToCart = (item: MenuItem) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find(
                (cartItem) => cartItem.id === item.id,
            );
            if (existingItem) {
                return prevItems.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem,
                );
            }
            return [...prevItems, { ...item, quantity: 1 }];
        });
    };

    const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item,
            ),
        );
    };

    const handleRemoveItem = (itemId: number) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => item.id !== itemId),
        );
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const itemTotal = parseFloat(item.price) * item.quantity;
            const deliveryFee = parseFloat(item.delivery_fee);
            return total + itemTotal + deliveryFee;
        }, 0);
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => {
            return total + parseFloat(item.price) * item.quantity;
        }, 0);
    };

    const calculateDeliveryFee = () => {
        return cartItems.reduce((total, item) => {
            return total + parseFloat(item.delivery_fee);
        }, 0);
    };

    const groupMenuItemsByCategory = (items: MenuItem[]) => {
        return items
            .filter((item) => item.is_available_online)
            .reduce(
                (acc, item) => {
                    if (!acc[item.category]) {
                        acc[item.category] = [];
                    }
                    acc[item.category].push(item);
                    return acc;
                },
                {} as Record<string, MenuItem[]>,
            );
    };

    const handlePlaceOrder = async () => {
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }

        if (
            !deliveryInfo.name ||
            !deliveryInfo.phone ||
            !deliveryInfo.address
        ) {
            alert('Please fill in all required delivery information');
            return;
        }

        // Transform cart items to match required format
        const transformedItems = cartItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unit_price: parseFloat(item.price),
            delivery_fee: parseFloat(item.delivery_fee),
            subtotal: parseFloat(item.price) * item.quantity,
            restaurant_name: selectedRestaurant?.restaurant_name || '',
            restaurant_address: selectedRestaurant?.address || '',
            restaurant_phone: selectedRestaurant?.contact_number || '',
        }));

        // Calculate totals
        const subtotal = calculateSubtotal();
        const deliveryFee = calculateDeliveryFee();
        const discount = calculateDiscount();
        const tax = subtotal * 0.12; // Assuming 12% tax rate
        const grandTotal = subtotal + deliveryFee + tax - discount;

        try {
            const response = await axios.post(
                `${window.config.api.url}/food-delivery-orders`,
                {
                    app_name: 'Sakto Delivery',
                    customer_name: deliveryInfo.name,
                    customer_phone: deliveryInfo.phone,
                    customer_address: deliveryInfo.address,
                    items: transformedItems,
                    total_amount: subtotal,
                    delivery_fee: deliveryFee,
                    discount: discount,
                    tax: tax,
                    grand_total: grandTotal,
                    special_instructions: deliveryInfo.notes,
                    order_payment_method: 'cash',
                    order_payment_status: 'pending',
                },
                {
                    headers: {
                        Authorization: `Bearer ${window.config.api.token}`,
                    },
                },
            );

            alert('Order placed successfully!');
            setCartItems([]);
            setActiveTab('order');
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        setIsApplyingCoupon(true);
        setCouponError('');

        try {
            const response = await axios.post(
                'https://api.sakto.app/api/coupons/validate',
                {
                    code: couponCode,
                    amount: calculateSubtotal(),
                },
                {
                    headers: {
                        Authorization:
                            'Bearer 2|vKaWb5AMANFxhYK2GdUNWFSscwBJsV1G2g3hnGHI357350da',
                    },
                },
            );

            setAppliedCoupon({
                code: couponCode,
                discount: response.data.discount,
            });
            setCouponError('');
        } catch (error) {
            console.error('Error applying coupon:', error);
            setCouponError('Invalid or expired coupon code');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        return appliedCoupon.discount;
    };

    const calculateFinalTotal = () => {
        const subtotal = calculateSubtotal();
        const deliveryFee = calculateDeliveryFee();
        const discount = calculateDiscount();
        return subtotal + deliveryFee - discount;
    };

    return (
        <>
            <Head title="Food Delivery Services" />
            <div className="min-h-screen bg-gray-100">
                {/* Mobile App Name */}
                <div className="flex items-center justify-center bg-green-600 p-4 sm:hidden">
                    <svg
                        className="mr-2 h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                    </svg>
                    <span className="text-xl font-bold text-white">
                        Sakto Delivery
                    </span>
                </div>
                {/* Navigation */}
                <nav className="bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="hidden flex-shrink-0 items-center sm:flex">
                                    <ApplicationLogo className="block h-9 w-auto" />
                                </div>
                                <Link
                                    href={route('delivery.landing')}
                                    className="ml-4 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                                >
                                    ← Back to Overview
                                </Link>
                                {/* Desktop Navigation */}
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    <button
                                        onClick={() => setActiveTab('order')}
                                        className={`${
                                            activeTab === 'order'
                                                ? 'border-green-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        } inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium`}
                                    >
                                        Order Food
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('tracking')}
                                        className={`${
                                            activeTab === 'tracking'
                                                ? 'border-green-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        } inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium`}
                                    >
                                        Track Order
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('cart')}
                                        className={`${
                                            activeTab === 'cart'
                                                ? 'border-green-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        } inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium`}
                                    >
                                        Cart (
                                        {cartItems.reduce(
                                            (total, item) =>
                                                total + item.quantity,
                                            0,
                                        )}
                                        )
                                    </button>
                                </div>
                            </div>
                            {/* Search Bar - Visible on both mobile and desktop */}
                            <div className="flex w-full items-center sm:w-96">
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm leading-5 placeholder-gray-500 focus:border-green-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
                                        placeholder="Search for restaurants or cuisines..."
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <svg
                                            className="h-5 w-5 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl py-2 pb-20 sm:px-6 sm:pb-6 lg:px-8">
                    {/* Order Food Section */}
                    {activeTab === 'order' && (
                        <div className="space-y-2">
                            {/* Popular Restaurants */}
                            <div className="rounded-lg bg-white p-4 shadow sm:p-6">
                                <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">
                                    Restaurants
                                </h2>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                                    {loading ? (
                                        <div className="col-span-full py-8 text-center">
                                            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600"></div>
                                        </div>
                                    ) : restaurants.length === 0 ? (
                                        <div className="col-span-full py-8 text-center text-gray-500">
                                            No restaurants available at the
                                            moment.
                                        </div>
                                    ) : (
                                        restaurants.map((restaurant) => {
                                            const availableOnlineItems =
                                                restaurant.menu_items.filter(
                                                    (item) =>
                                                        item.is_available_online,
                                                );
                                            if (
                                                availableOnlineItems.length ===
                                                0
                                            )
                                                return null;

                                            return (
                                                <div
                                                    key={restaurant.client_id}
                                                    className="overflow-hidden rounded-lg border transition-shadow hover:shadow-lg"
                                                >
                                                    <img
                                                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                                        alt={
                                                            restaurant.restaurant_name
                                                        }
                                                        className="h-48 w-full object-cover"
                                                    />
                                                    <div className="p-4">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {
                                                                restaurant.restaurant_name
                                                            }
                                                        </h3>
                                                        <div className="mt-2 space-y-1">
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <svg
                                                                    className="mr-1 h-4 w-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                                    />
                                                                </svg>
                                                                {
                                                                    restaurant.contact_number
                                                                }
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <svg
                                                                    className="mr-1 h-4 w-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                                                    />
                                                                </svg>
                                                                <a
                                                                    href={
                                                                        restaurant.website
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-green-600 hover:text-green-800"
                                                                >
                                                                    {
                                                                        restaurant.website
                                                                    }
                                                                </a>
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <svg
                                                                    className="mr-1 h-4 w-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                                    />
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                                    />
                                                                </svg>
                                                                {
                                                                    restaurant.address
                                                                }
                                                            </div>
                                                        </div>
                                                        <p className="mt-2 text-sm text-gray-500">
                                                            {
                                                                availableOnlineItems.length
                                                            }{' '}
                                                            items available
                                                            online
                                                        </p>
                                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                                            <svg
                                                                className="mr-1 h-4 w-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                />
                                                            </svg>
                                                            20-30 min
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                handleViewMenu(
                                                                    restaurant,
                                                                )
                                                            }
                                                            className="mt-4 w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                                                        >
                                                            View Menu
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Menu Section */}
                    {activeTab === 'menu' && selectedRestaurant && (
                        <div className="rounded-lg bg-white p-4 shadow sm:p-6">
                            <div className="mb-4 flex items-center sm:mb-6">
                                <button
                                    onClick={() => setActiveTab('order')}
                                    className="mr-4 text-gray-500 hover:text-gray-700"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                    {selectedRestaurant.restaurant_name}
                                </h2>
                            </div>
                            <div className="space-y-4 sm:space-y-6">
                                {Object.entries(
                                    groupMenuItemsByCategory(
                                        selectedRestaurant.menu_items,
                                    ),
                                ).map(([category, items]) => (
                                    <div key={category}>
                                        <h4 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">
                                            {category}
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                                >
                                                    <div>
                                                        <h5 className="font-medium text-gray-900">
                                                            {item.name}
                                                        </h5>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-gray-900">
                                                            ₱{item.price}
                                                        </p>
                                                        <button
                                                            onClick={() =>
                                                                handleAddToCart(
                                                                    item,
                                                                )
                                                            }
                                                            className="mt-1 rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                                                        >
                                                            Add to Cart
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cart Section */}
                    {activeTab === 'cart' && (
                        <div className="rounded-lg bg-white p-4 shadow sm:p-6">
                            <div className="mb-4 flex items-center sm:mb-6">
                                <button
                                    onClick={() => setActiveTab('order')}
                                    className="mr-4 text-gray-500 hover:text-gray-700"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                    Your Cart
                                </h2>
                            </div>
                            {cartItems.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    Your cart is empty
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {cartItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                            >
                                                <div>
                                                    <h5 className="font-medium text-gray-900">
                                                        {item.name}
                                                    </h5>
                                                    <p className="text-sm text-gray-500">
                                                        ₱{item.price}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Delivery Fee: ₱
                                                        {item.delivery_fee}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                handleUpdateQuantity(
                                                                    item.id,
                                                                    item.quantity -
                                                                        1,
                                                                )
                                                            }
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                handleUpdateQuantity(
                                                                    item.id,
                                                                    item.quantity +
                                                                        1,
                                                                )
                                                            }
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleRemoveItem(
                                                                item.id,
                                                            )
                                                        }
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 border-t pt-4">
                                        <div className="mb-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">
                                                    Subtotal:
                                                </span>
                                                <span className="text-gray-900">
                                                    ₱
                                                    {calculateSubtotal().toFixed(
                                                        2,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">
                                                    Delivery Fee:
                                                </span>
                                                <span className="text-gray-900">
                                                    ₱
                                                    {calculateDeliveryFee().toFixed(
                                                        2,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">
                                                    Tax (12%):
                                                </span>
                                                <span className="text-gray-900">
                                                    ₱
                                                    {(
                                                        calculateSubtotal() *
                                                        0.12
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                            {/* Coupon Section */}
                                            <div className="mt-4 border-t pt-4">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="text"
                                                        value={couponCode}
                                                        onChange={(e) =>
                                                            setCouponCode(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Enter coupon code"
                                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                                        disabled={
                                                            !!appliedCoupon
                                                        }
                                                    />
                                                    {appliedCoupon ? (
                                                        <button
                                                            onClick={
                                                                handleRemoveCoupon
                                                            }
                                                            className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                                                        >
                                                            Remove
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={
                                                                handleApplyCoupon
                                                            }
                                                            disabled={
                                                                isApplyingCoupon ||
                                                                !couponCode.trim()
                                                            }
                                                            className="rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {isApplyingCoupon
                                                                ? 'Applying...'
                                                                : 'Apply'}
                                                        </button>
                                                    )}
                                                </div>
                                                {couponError && (
                                                    <p className="mt-2 text-sm text-red-600">
                                                        {couponError}
                                                    </p>
                                                )}
                                                {appliedCoupon && (
                                                    <div className="mt-2 flex items-center justify-between text-green-600">
                                                        <span>
                                                            Discount Applied:
                                                        </span>
                                                        <span>
                                                            -₱
                                                            {appliedCoupon.discount.toFixed(
                                                                2,
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between border-t pt-2">
                                                <span className="text-lg font-semibold text-gray-900">
                                                    Total:
                                                </span>
                                                <span className="text-lg font-semibold text-gray-900">
                                                    ₱
                                                    {(
                                                        calculateSubtotal() +
                                                        calculateDeliveryFee() +
                                                        calculateSubtotal() *
                                                            0.12 -
                                                        calculateDiscount()
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {/* Delivery Information Form */}
                                            <div className="rounded-lg bg-gray-50 p-4">
                                                <h4 className="mb-4 text-lg font-medium text-gray-900">
                                                    Delivery Information
                                                </h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label
                                                            htmlFor="name"
                                                            className="block text-sm font-medium text-gray-700"
                                                        >
                                                            Full Name{' '}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            value={
                                                                deliveryInfo.name
                                                            }
                                                            onChange={(e) =>
                                                                setDeliveryInfo(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        name: e
                                                                            .target
                                                                            .value,
                                                                    }),
                                                                )
                                                            }
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor="phone"
                                                            className="block text-sm font-medium text-gray-700"
                                                        >
                                                            Phone Number{' '}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            id="phone"
                                                            value={
                                                                deliveryInfo.phone
                                                            }
                                                            onChange={(e) =>
                                                                setDeliveryInfo(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        phone: e
                                                                            .target
                                                                            .value,
                                                                    }),
                                                                )
                                                            }
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor="address"
                                                            className="block text-sm font-medium text-gray-700"
                                                        >
                                                            Delivery Address{' '}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </label>
                                                        <textarea
                                                            id="address"
                                                            value={
                                                                deliveryInfo.address
                                                            }
                                                            onChange={(e) =>
                                                                setDeliveryInfo(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        address:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }),
                                                                )
                                                            }
                                                            rows={3}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor="notes"
                                                            className="block text-sm font-medium text-gray-700"
                                                        >
                                                            Delivery Notes
                                                            (Optional)
                                                        </label>
                                                        <textarea
                                                            id="notes"
                                                            value={
                                                                deliveryInfo.notes
                                                            }
                                                            onChange={(e) =>
                                                                setDeliveryInfo(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        notes: e
                                                                            .target
                                                                            .value,
                                                                    }),
                                                                )
                                                            }
                                                            rows={2}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                                            placeholder="Any special instructions for delivery?"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payment Method Selection */}
                                            <div className="rounded-lg bg-gray-50 p-4">
                                                <h4 className="mb-2 text-lg font-medium text-gray-900">
                                                    Payment Method
                                                </h4>
                                                <div className="space-y-3">
                                                    <label className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-gray-100">
                                                        <input
                                                            type="radio"
                                                            name="payment"
                                                            value="cod"
                                                            checked={
                                                                paymentMethod ===
                                                                'cod'
                                                            }
                                                            onChange={(e) =>
                                                                setPaymentMethod(
                                                                    e.target
                                                                        .value as 'cod',
                                                                )
                                                            }
                                                            className="h-4 w-4 text-green-600"
                                                        />
                                                        <div>
                                                            <span className="block font-medium text-gray-900">
                                                                Cash on Delivery
                                                            </span>
                                                            <span className="block text-sm text-gray-500">
                                                                Pay when you
                                                                receive your
                                                                order
                                                            </span>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handlePlaceOrder}
                                                disabled={isProcessingPayment}
                                                className="w-full rounded-md bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isProcessingPayment
                                                    ? 'Processing...'
                                                    : 'Place Order'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Track Order Section */}
                    {activeTab === 'tracking' && (
                        <div className="rounded-lg bg-white p-4 shadow sm:p-6">
                            <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">
                                Track Your Order
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="tracking-number"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Order Number
                                    </label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            name="tracking-number"
                                            id="tracking-number"
                                            className="block w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                                            placeholder="Enter your order number"
                                        />
                                        <button className="ml-2 inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 sm:ml-3 sm:px-4">
                                            Track
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Bottom Navigation */}
                <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white sm:hidden">
                    <div className="flex h-16 items-center justify-around">
                        <button
                            onClick={() => setActiveTab('order')}
                            className={`flex h-full flex-1 flex-col items-center justify-center ${
                                activeTab === 'order'
                                    ? 'text-green-600'
                                    : 'text-gray-500'
                            }`}
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <span className="mt-1 text-xs">Order</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('tracking')}
                            className={`flex h-full flex-1 flex-col items-center justify-center ${
                                activeTab === 'tracking'
                                    ? 'text-green-600'
                                    : 'text-gray-500'
                            }`}
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            <span className="mt-1 text-xs">Track</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('cart')}
                            className={`flex h-full flex-1 flex-col items-center justify-center ${
                                activeTab === 'cart'
                                    ? 'text-green-600'
                                    : 'text-gray-500'
                            }`}
                        >
                            <div className="relative">
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    />
                                </svg>
                                {cartItems.length > 0 && (
                                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                        {cartItems.reduce(
                                            (total, item) =>
                                                total + item.quantity,
                                            0,
                                        )}
                                    </span>
                                )}
                            </div>
                            <span className="mt-1 text-xs">Cart</span>
                        </button>
                        {auth.user && (
                            <Link
                                href={route('dashboard')}
                                className="flex h-full flex-1 flex-col items-center justify-center text-gray-500"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                <span className="mt-1 text-xs">Account</span>
                            </Link>
                        )}
                        <Link
                            href={route('login', { project: 'delivery' })}
                            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                            Log in
                        </Link>
                        <Link
                            href={route('register', { project: 'delivery' })}
                            className="ml-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
