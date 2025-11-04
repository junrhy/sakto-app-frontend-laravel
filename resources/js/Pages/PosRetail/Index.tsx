import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Search, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import Cart from './components/Cart';
import ImagePreview from './components/ImagePreview';
import PaymentDialog from './components/PaymentDialog';
import ReceiptDialog from './components/ReceiptDialog';
import type { Category, OrderItem, Product, Props } from './types';
import { calculateTotal, searchProducts } from './utils';

interface AuthWithTeamMember {
    user: PageProps['auth']['user'];
    selectedTeamMember?: {
        identifier: string;
        first_name: string;
        last_name: string;
        full_name: string;
        email: string;
        roles: string[];
        allowed_apps: string[];
        profile_picture?: string;
    };
    project?: {
        id: number;
        name: string;
        identifier: string;
    };
    modules?: string[];
}

export default function PosRetail({
    products: initialProducts,
    categories = [],
    appCurrency,
    auth,
}: Props & { auth: AuthWithTeamMember; categories?: Category[] }) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [isCompleteSaleDialogOpen, setIsCompleteSaleDialogOpen] =
        useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
        null,
    );
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
    const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
    const [receiptData, setReceiptData] = useState<{
        saleId?: number;
        items: Array<{ id: number; name: string; quantity: number; price: number }>;
        totalAmount: number;
        paymentMethod: 'cash' | 'card';
        cashReceived?: number;
        change?: number;
        date: string;
    } | null>(null);

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        return true;
    }, [auth.selectedTeamMember]);

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        return true;
    }, [auth.selectedTeamMember]);

    // Store current order items reference for receipt generation
    const currentOrderItemsRef = useRef<OrderItem[]>([]);
    
    useEffect(() => {
        currentOrderItemsRef.current = orderItems;
    }, [orderItems]);

    const filteredProducts = useMemo(() => {
        let filtered = searchProducts(products, searchTerm);
        
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(
                (product) => product.category_id?.toString() === selectedCategory
            );
        }
        
        return filtered;
    }, [products, searchTerm, selectedCategory]);

    const addItemToOrder = (product: Product) => {
        if (product.quantity > 0) {
            const existingItem = orderItems.find(
                (item) => item.id === product.id,
            );
            if (existingItem) {
                if (existingItem.quantity < product.quantity) {
                    setOrderItems(
                        orderItems.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item,
                        ),
                    );
                    setProducts(
                        products.map((p) =>
                            p.id === product.id
                                ? { ...p, quantity: p.quantity - 1 }
                                : p,
                        ),
                    );
                } else {
                    toast.error(
                        'Cannot add more items than available in inventory.',
                    );
                }
            } else {
                setOrderItems([
                    ...orderItems,
                    {
                        ...product,
                        quantity: 1,
                        price_formatted: product.price_formatted,
                    },
                ]);
                setProducts(
                    products.map((p) =>
                        p.id === product.id
                            ? { ...p, quantity: p.quantity - 1 }
                            : p,
                    ),
                );
            }
        } else {
            toast.error('This product is out of stock.');
        }
    };

    const removeItemFromOrder = (id: number) => {
        const itemToRemove = orderItems.find((item) => item.id === id);
        if (itemToRemove) {
            setProducts(
                products.map((p) =>
                    p.id === id
                        ? { ...p, quantity: p.quantity + itemToRemove.quantity }
                        : p,
                ),
            );
        }
        setOrderItems(orderItems.filter((item) => item.id !== id));
    };

    const updateItemQuantity = (id: number, newQuantity: number) => {
        const product = products.find((p) => p.id === id);
        const existingItem = orderItems.find((item) => item.id === id);

        if (product && existingItem) {
            const quantityDifference = newQuantity - existingItem.quantity;

            if (
                newQuantity <= product.quantity + existingItem.quantity &&
                newQuantity >= 0
            ) {
                setOrderItems(
                    orderItems.map((item) =>
                        item.id === id
                            ? { ...item, quantity: newQuantity }
                            : item,
                    ),
                );
                setProducts(
                    products.map((p) =>
                        p.id === id
                            ? {
                                  ...p,
                                  quantity: p.quantity - quantityDifference,
                              }
                            : p,
                    ),
                );
            } else {
                toast.error(
                    'Cannot add more items than available in inventory.',
                );
            }
        } else {
            toast.error('Product not found.');
        }
    };

    const handleCompleteSale = () => {
        setIsCompleteSaleDialogOpen(true);
    };

    const confirmCompleteSale = async (paymentData: {
        payment_method: 'cash' | 'card';
        cash_received?: number;
        change?: number;
    }) => {
        const totalAmount = calculateTotal(orderItems);

        const saleData = {
            items: orderItems.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price,
            })),
            total_amount: totalAmount,
            cash_received: paymentData.cash_received || null,
            change: paymentData.change || null,
            payment_method: paymentData.payment_method,
        };

        try {
            await router.post('/pos-retail', saleData, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Sale completed successfully!');
                    
                    // Store receipt data before clearing order (use ref to get current items)
                    const receiptItems = currentOrderItemsRef.current.map((item) => ({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                    }));

                    // Create receipt data from current order
                    setReceiptData({
                        items: receiptItems,
                        totalAmount: totalAmount,
                        paymentMethod: paymentData.payment_method,
                        cashReceived: paymentData.cash_received,
                        change: paymentData.change,
                        date: new Date().toISOString(),
                    });
                    
                    setOrderItems([]);
                    setIsCompleteSaleDialogOpen(false);
                    setIsReceiptDialogOpen(true);
                    
                    // Refresh products to get updated quantities
                    router.reload({ only: ['products'] });
                },
                onError: (errors: Record<string, string>) => {
                    console.error('Error completing sale:', errors);
                    const errorMessage =
                        errors.error ||
                        'There was an error completing the sale. Please try again.';
                    toast.error(errorMessage);
                },
            });
        } catch (error) {
            console.error('Error completing sale:', error);
            toast.error(
                'There was an error completing the sale. Please try again.',
            );
        }
    };

    const totalAmount = calculateTotal(orderItems);

    return (
        <AuthenticatedLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Retail POS
                    </h2>
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            {orderItems.length} items
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {appCurrency.symbol}
                            {totalAmount.toFixed(2)}
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Retail POS" />

            <ImagePreview
                open={isImagePreviewOpen}
                onOpenChange={setIsImagePreviewOpen}
                imageUrl={selectedImageUrl}
            />

            <PaymentDialog
                open={isCompleteSaleDialogOpen}
                onOpenChange={setIsCompleteSaleDialogOpen}
                totalAmount={totalAmount}
                appCurrency={appCurrency}
                onConfirm={confirmCompleteSale}
            />

            <ReceiptDialog
                open={isReceiptDialogOpen}
                onOpenChange={setIsReceiptDialogOpen}
                receiptData={
                    receiptData
                        ? {
                              ...receiptData,
                              appCurrency: appCurrency,
                              storeName: auth.project?.name || undefined,
                              userName: auth.selectedTeamMember?.full_name || auth.user.name || undefined,
                          }
                        : null
                }
            />

            <div className="flex h-[calc(100vh-12rem)] flex-col gap-4 overflow-hidden lg:flex-row">
                {/* Products Section - Takes most of the space */}
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:min-h-full">
                    {/* Search and Filter Bar */}
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        {categories.length > 0 && (
                            <Select
                                value={selectedCategory}
                                onValueChange={setSelectedCategory}
                            >
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id.toString()}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
                            {filteredProducts.map((product) => {
                                const orderItem = orderItems.find(
                                    (item) => item.id === product.id,
                                );
                                const inCart = orderItem !== undefined;
                                const cartQuantity = orderItem?.quantity || 0;

                                return (
                                    <Card
                                        key={product.id}
                                        className={`group cursor-pointer transition-all hover:shadow-md ${
                                            product.quantity === 0
                                                ? 'opacity-50'
                                                : ''
                                        }`}
                                    >
                                        <CardContent className="p-2">
                                            {/* Product Image */}
                                            <div
                                                className="relative mb-2 aspect-square overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700"
                                                onClick={() => {
                                                    if (
                                                        product.images &&
                                                        product.images.length > 0
                                                    ) {
                                                        setSelectedImageUrl(
                                                            product.images[0],
                                                        );
                                                        setIsImagePreviewOpen(
                                                            true,
                                                        );
                                                    }
                                                }}
                                            >
                                                {product.images &&
                                                product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <ShoppingCart className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                )}
                                                {product.quantity === 0 && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                        <span className="rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                                                            Out of Stock
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="space-y-1">
                                                <h3 className="line-clamp-2 text-xs font-medium text-gray-900 dark:text-white">
                                                    {product.name}
                                                </h3>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {product.price_formatted}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Stock: {product.quantity}
                                                </div>

                                                {/* Add to Cart Controls */}
                                                {canEdit && (
                                                    <div className="mt-2">
                                                        {!inCart ? (
                                                            <Button
                                                                size="sm"
                                                                className="h-7 w-full text-xs"
                                                                onClick={() =>
                                                                    addItemToOrder(
                                                                        product,
                                                                    )
                                                                }
                                                                disabled={
                                                                    product.quantity ===
                                                                    0
                                                                }
                                                            >
                                                                <Plus className="mr-1 h-3 w-3" />
                                                                Add
                                                            </Button>
                                                        ) : (
                                                            <div className="flex items-center justify-between gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 flex-1 p-0"
                                                                    onClick={() =>
                                                                        updateItemQuantity(
                                                                            product.id,
                                                                            cartQuantity -
                                                                                1,
                                                                        )
                                                                    }
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>
                                                                <span className="flex-1 text-center text-xs font-semibold">
                                                                    {cartQuantity}
                                                                </span>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 flex-1 p-0"
                                                                    onClick={() =>
                                                                        updateItemQuantity(
                                                                            product.id,
                                                                            cartQuantity +
                                                                                1,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        cartQuantity >=
                                                                        product.quantity
                                                                    }
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
                                <div className="text-center">
                                    <Search className="mx-auto h-12 w-12 mb-4 text-gray-400 dark:text-gray-500 opacity-50" />
                                    <p>No products found</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cart Sidebar - Responsive width */}
                <div className="flex h-auto w-full flex-shrink-0 lg:h-full lg:w-80 lg:max-w-sm">
                    <Cart
                        orderItems={orderItems}
                        appCurrency={appCurrency}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onUpdateQuantity={updateItemQuantity}
                        onRemoveItem={removeItemFromOrder}
                        onCompleteSale={handleCompleteSale}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
