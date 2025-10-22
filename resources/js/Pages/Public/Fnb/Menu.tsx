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
import { Head } from '@inertiajs/react';
import {
    Check,
    Minus,
    Plus,
    ShoppingCart,
    Trash2,
    UtensilsCrossed,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface MenuItem {
    id: number;
    name: string;
    description?: string;
    price: number;
    category: string;
    image: string | null;
    is_available_online?: boolean;
}

interface OrderItem extends MenuItem {
    quantity: number;
}

interface Table {
    id: number;
    name: string;
    seats: number;
    status: string;
}

interface PageProps {
    table?: Table;
    menuItems?: MenuItem[];
    clientIdentifier?: string;
}

export default function FnbPublicMenu({
    table: initialTable,
    menuItems: initialMenuItems = [],
    clientIdentifier: initialClientIdentifier,
}: PageProps) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
    const [table, setTable] = useState<Table | null>(initialTable || null);
    const [clientIdentifier, setClientIdentifier] = useState<string>(
        initialClientIdentifier || '',
    );
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [customerName, setCustomerName] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSubmitted, setOrderSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Get table ID and client identifier from URL
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const urlParams = new URLSearchParams(window.location.search);
            const tableId = urlParams.get('table');
            const customer = urlParams.get('customer');
            const client = urlParams.get('client');

            if (customer) {
                setCustomerName(decodeURIComponent(customer));
            }

            if (client) {
                setClientIdentifier(client);
            }

            // Fetch table info and menu if not provided
            if (tableId && !table && client) {
                await fetchTableInfo(tableId, client);
            }

            if (!menuItems.length && client) {
                await fetchMenu(client);
            }

            setIsLoading(false);
        };

        loadData();
    }, []);

    const fetchTableInfo = async (tableId: string, client: string) => {
        try {
            const response = await fetch(
                `/api/fnb-public/table-info?table_id=${tableId}&client_identifier=${client}`,
            );
            const data = await response.json();
            if (data.status === 'success') {
                setTable(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch table info:', error);
            toast.error('Failed to load table information');
        }
    };

    const fetchMenu = async (client: string) => {
        try {
            console.log('Fetching menu for client:', client);
            const response = await fetch(
                `/api/fnb-public/menu?client_identifier=${client}`,
            );
            const data = await response.json();
            console.log('Menu response:', data);
            if (data.status === 'success') {
                setMenuItems(data.data || []);
                if (data.data && data.data.length > 0) {
                    toast.success(`Loaded ${data.data.length} menu items`);
                } else {
                    toast.info('No menu items available at this time');
                }
            } else {
                toast.error(data.message || 'Failed to load menu');
            }
        } catch (error) {
            console.error('Failed to fetch menu:', error);
            toast.error('Failed to load menu. Please check your connection.');
        }
    };

    const categories = useMemo(() => {
        const cats = Array.from(
            new Set(menuItems.map((item) => item.category)),
        );
        return ['all', ...cats];
    }, [menuItems]);

    const filteredMenuItems = useMemo(() => {
        if (selectedCategory === 'all') {
            return menuItems;
        }
        return menuItems.filter((item) => item.category === selectedCategory);
    }, [menuItems, selectedCategory]);

    const totalAmount = useMemo(
        () =>
            orderItems.reduce(
                (total, item) => total + Number(item.price) * item.quantity,
                0,
            ),
        [orderItems],
    );

    const addToOrder = (item: MenuItem) => {
        const existingItem = orderItems.find((oi) => oi.id === item.id);
        if (existingItem) {
            setOrderItems(
                orderItems.map((oi) =>
                    oi.id === item.id
                        ? { ...oi, quantity: oi.quantity + 1 }
                        : oi,
                ),
            );
        } else {
            setOrderItems([...orderItems, { ...item, quantity: 1 }]);
        }
        toast.success(`${item.name} added to order`);
    };

    const updateQuantity = (itemId: number, quantity: number) => {
        if (quantity <= 0) {
            setOrderItems(orderItems.filter((item) => item.id !== itemId));
        } else {
            setOrderItems(
                orderItems.map((item) =>
                    item.id === itemId ? { ...item, quantity } : item,
                ),
            );
        }
    };

    const removeFromOrder = (itemId: number) => {
        setOrderItems(orderItems.filter((item) => item.id !== itemId));
        toast.success('Item removed from order');
    };

    const submitOrder = async () => {
        if (!table) {
            toast.error('Table information not found');
            return;
        }

        if (orderItems.length === 0) {
            toast.error('Please add items to your order');
            return;
        }

        setIsSubmitting(true);

        try {
            const orderData = {
                client_identifier: clientIdentifier,
                table_id: table.id,
                table_name: table.name,
                customer_name: customerName || 'Guest',
                items: orderItems.map((item) => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: Number(item.price),
                })),
                notes: notes,
                subtotal: totalAmount,
            };

            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/api/fnb-public/customer-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (data.status === 'success') {
                toast.success('Order submitted successfully!');
                setOrderSubmitted(true);
                setOrderItems([]);
                setNotes('');
            } else {
                const errorMessage = data.message || 'Failed to submit order';
                const errors = data.errors ? Object.values(data.errors).flat().join(', ') : '';
                toast.error(errors ? `${errorMessage}: ${errors}` : errorMessage);
                console.error('Order submission failed:', data);
            }
        } catch (error) {
            console.error('Failed to submit order:', error);
            toast.error('Failed to submit order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head title={`Menu - ${table?.name || 'Table'}`} />

            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Header */}
                <div className="border-b border-orange-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-gradient-to-r from-orange-500 to-red-600 p-2">
                                    <UtensilsCrossed className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Menu
                                    </h1>
                                    {table && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {table.name} - {table.seats} seats
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-orange-100 px-3 py-2 dark:bg-orange-900/30">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        <span className="font-semibold text-orange-900 dark:text-orange-300">
                                            {orderItems.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {isLoading ? (
                        <Card className="mx-auto max-w-md">
                            <CardContent className="py-12 text-center">
                                <div className="mb-4 flex justify-center">
                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600"></div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Loading menu...
                                </p>
                            </CardContent>
                        </Card>
                    ) : orderSubmitted ? (
                        <Card className="mx-auto max-w-md">
                            <CardContent className="py-12 text-center">
                                <div className="mb-4 flex justify-center">
                                    <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                                        <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    Order Submitted!
                                </h2>
                                <p className="mb-6 text-gray-600 dark:text-gray-400">
                                    Your order has been sent to the kitchen. Our
                                    staff will serve you shortly.
                                </p>
                                <Button
                                    onClick={() => setOrderSubmitted(false)}
                                    className="bg-orange-600 hover:bg-orange-700"
                                >
                                    Order More Items
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Menu Section */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                                            Our Menu
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Category Filter */}
                                        <div className="mb-6">
                                            <Label className="mb-2 block text-sm font-medium">
                                                Category
                                            </Label>
                                            <Select
                                                value={selectedCategory}
                                                onValueChange={
                                                    setSelectedCategory
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem
                                                            key={cat}
                                                            value={cat}
                                                        >
                                                            {cat === 'all'
                                                                ? 'All Items'
                                                                : cat}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Menu Items Grid */}
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                            {filteredMenuItems.map((item) => (
                                                <Card
                                                    key={item.id}
                                                    className="group overflow-hidden transition-all hover:shadow-lg"
                                                >
                                                    <div className="relative">
                                                        <img
                                                            src={
                                                                item.image ||
                                                                '/images/no-image.jpg'
                                                            }
                                                            alt={item.name}
                                                            className="h-48 w-full object-cover"
                                                        />
                                                        <div className="absolute bottom-2 right-2">
                                                            <Button
                                                                onClick={() =>
                                                                    addToOrder(
                                                                        item,
                                                                    )
                                                                }
                                                                size="sm"
                                                                className="bg-orange-600 shadow-lg hover:bg-orange-700"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-4">
                                                        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                                                            {item.name}
                                                        </h3>
                                                        {item.description && (
                                                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                                                {
                                                                    item.description
                                                                }
                                                            </p>
                                                        )}
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                                                $
                                                                {Number(
                                                                    item.price,
                                                                ).toFixed(2)}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {item.category}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>

                                        {filteredMenuItems.length === 0 && (
                                            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                                No menu items available
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <Card className="sticky top-4">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ShoppingCart className="h-5 w-5 text-orange-600" />
                                            Your Order
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Customer Name */}
                                        <div>
                                            <Label htmlFor="customerName">
                                                Your Name (Optional)
                                            </Label>
                                            <Input
                                                id="customerName"
                                                value={customerName}
                                                onChange={(e) =>
                                                    setCustomerName(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter your name"
                                                className="mt-1"
                                            />
                                        </div>

                                        {/* Order Items */}
                                        <div>
                                            <Label className="mb-2 block">
                                                Items
                                            </Label>
                                            {orderItems.length === 0 ? (
                                                <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    No items added yet
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {orderItems.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                                                        >
                                                            <div className="flex-1">
                                                                <div className="font-medium text-gray-900 dark:text-white">
                                                                    {item.name}
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    $
                                                                    {Number(
                                                                        item.price,
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            item.id,
                                                                            item.quantity -
                                                                                1,
                                                                        )
                                                                    }
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>
                                                                <span className="w-8 text-center font-semibold">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            item.id,
                                                                            item.quantity +
                                                                                1,
                                                                        )
                                                                    }
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        removeFromOrder(
                                                                            item.id,
                                                                        )
                                                                    }
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Special Notes */}
                                        <div>
                                            <Label htmlFor="notes">
                                                Special Instructions (Optional)
                                            </Label>
                                            <Textarea
                                                id="notes"
                                                value={notes}
                                                onChange={(e) =>
                                                    setNotes(e.target.value)
                                                }
                                                placeholder="Any special requests?"
                                                className="mt-1"
                                                rows={3}
                                            />
                                        </div>

                                        {/* Total */}
                                        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                                            <div className="flex items-center justify-between text-lg font-bold">
                                                <span className="text-gray-900 dark:text-white">
                                                    Total:
                                                </span>
                                                <span className="text-orange-600 dark:text-orange-400">
                                                    ${totalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            onClick={submitOrder}
                                            disabled={
                                                orderItems.length === 0 ||
                                                isSubmitting
                                            }
                                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 py-6 text-lg font-semibold hover:from-orange-600 hover:to-red-700"
                                        >
                                            {isSubmitting
                                                ? 'Submitting...'
                                                : 'Submit Order'}
                                        </Button>

                                        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                                            Your order will be sent to our
                                            kitchen and staff will serve you
                                            shortly
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
