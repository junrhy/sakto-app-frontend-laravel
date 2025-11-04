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
import { Minus, Plus, Search, ShoppingCart } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import BarcodeScanner from './components/BarcodeScanner';
import Cart from './components/Cart';
import ImagePreview from './components/ImagePreview';
import PaymentDialog from './components/PaymentDialog';
import ReceiptDialog from './components/ReceiptDialog';
import VariantSelectorDialog from './components/VariantSelectorDialog';
import type {
    Category,
    Discount,
    OrderItem,
    Product,
    Props,
    Variant,
} from './types';
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
    activeDiscounts: initialActiveDiscounts = [],
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
    const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
    const [selectedProductForVariant, setSelectedProductForVariant] =
        useState<Product | null>(null);
    const [activeDiscounts] = useState<Discount[]>(initialActiveDiscounts);
    const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(
        null,
    );
    const [discountAmount, setDiscountAmount] = useState(0);
    const [receiptData, setReceiptData] = useState<{
        saleId?: number;
        items: Array<{
            id: number;
            name: string;
            quantity: number;
            price: number;
        }>;
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
                (product) =>
                    product.category_id?.toString() === selectedCategory,
            );
        }

        return filtered;
    }, [products, searchTerm, selectedCategory]);

    const handleAddProductWithVariant = (product: Product) => {
        // Check if product has variants
        if (product.variants && product.variants.length > 0) {
            // Show variant selector dialog
            setSelectedProductForVariant(product);
            setIsVariantDialogOpen(true);
        } else {
            // No variants, add directly
            addItemToOrder(product, null);
        }
    };

    const handleVariantSelected = (variant: Variant | null) => {
        if (selectedProductForVariant) {
            if (variant) {
                // Check variant stock
                if (variant.quantity <= 0) {
                    toast.error('This variant is out of stock.');
                    return;
                }

                // Use variant price if available, otherwise use base price
                const itemPrice =
                    variant.price ?? selectedProductForVariant.price;
                const itemPriceFormatted = variant.price
                    ? appCurrency.symbol + variant.price.toFixed(2)
                    : selectedProductForVariant.price_formatted;

                addItemToOrder(
                    selectedProductForVariant,
                    variant,
                    itemPrice,
                    itemPriceFormatted,
                );
            } else {
                // Base product selected
                addItemToOrder(selectedProductForVariant, null);
            }
        }
        setIsVariantDialogOpen(false);
        setSelectedProductForVariant(null);
    };

    const addItemToOrder = (
        product: Product,
        variant: Variant | null,
        overridePrice?: number,
        overridePriceFormatted?: string,
    ) => {
        const itemPrice = overridePrice ?? product.price;
        const itemPriceFormatted =
            overridePriceFormatted ?? product.price_formatted;
        const itemQuantity = variant ? variant.quantity : product.quantity;

        if (itemQuantity > 0) {
            const existingItem = orderItems.find((item) =>
                variant
                    ? item.variant_id === variant.id &&
                      item.product_id === product.id
                    : item.id === product.id && !item.variant_id,
            );

            if (existingItem) {
                const maxQuantity = variant
                    ? variant.quantity
                    : product.quantity;
                if (existingItem.quantity < maxQuantity) {
                    setOrderItems(
                        orderItems.map((item) =>
                            (
                                variant
                                    ? item.variant_id === variant.id &&
                                      item.product_id === product.id
                                    : item.id === product.id && !item.variant_id
                            )
                                ? { ...item, quantity: item.quantity + 1 }
                                : item,
                        ),
                    );
                    // Update stock
                    if (!variant) {
                        setProducts(
                            products.map((p) =>
                                p.id === product.id
                                    ? { ...p, quantity: p.quantity - 1 }
                                    : p,
                            ),
                        );
                    }
                } else {
                    toast.error(
                        'Cannot add more items than available in inventory.',
                    );
                }
            } else {
                const newItem: OrderItem = {
                    id: product.id,
                    name: product.name,
                    quantity: 1,
                    price: itemPrice,
                    price_formatted: itemPriceFormatted,
                    product_id: product.id,
                };

                if (variant) {
                    newItem.variant_id = variant.id;
                    newItem.variant_attributes = variant.attributes;
                    newItem.name = `${product.name} (${Object.entries(
                        variant.attributes,
                    )
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')})`;
                }

                setOrderItems([...orderItems, newItem]);

                // Update stock
                if (!variant) {
                    setProducts(
                        products.map((p) =>
                            p.id === product.id
                                ? { ...p, quantity: p.quantity - 1 }
                                : p,
                        ),
                    );
                }
            }
        } else {
            toast.error('This product is out of stock.');
        }
    };

    const removeItemFromOrder = (id: number) => {
        const itemToRemove = orderItems.find((item) =>
            item.variant_id
                ? item.variant_id === id || item.product_id === id
                : item.id === id,
        );
        if (itemToRemove) {
            // Only update stock if it's a base product (not a variant)
            if (!itemToRemove.variant_id) {
                setProducts(
                    products.map((p) =>
                        p.id === (itemToRemove.product_id || itemToRemove.id)
                            ? {
                                  ...p,
                                  quantity: p.quantity + itemToRemove.quantity,
                              }
                            : p,
                    ),
                );
            }
        }
        setOrderItems(
            orderItems.filter((item) =>
                item.variant_id
                    ? item.variant_id !== id && item.product_id !== id
                    : item.id !== id,
            ),
        );
    };

    const updateItemQuantity = (id: number, newQuantity: number) => {
        const existingItem = orderItems.find((item) =>
            item.variant_id
                ? item.variant_id === id || item.product_id === id
                : item.id === id,
        );

        if (!existingItem) {
            toast.error('Item not found.');
            return;
        }

        if (existingItem.variant_id) {
            // Handle variant quantity update
            const product = products.find(
                (p) => p.id === existingItem.product_id,
            );
            if (product && product.variants) {
                const variant = product.variants.find(
                    (v) => v.id === existingItem.variant_id,
                );
                if (variant) {
                    if (
                        newQuantity <=
                            variant.quantity + existingItem.quantity &&
                        newQuantity >= 0
                    ) {
                        setOrderItems(
                            orderItems.map((item) =>
                                item.variant_id === existingItem.variant_id &&
                                item.product_id === existingItem.product_id
                                    ? { ...item, quantity: newQuantity }
                                    : item,
                            ),
                        );
                    } else {
                        toast.error(
                            'Cannot add more items than available in inventory.',
                        );
                    }
                }
            }
        } else {
            // Handle base product quantity update
            const product = products.find((p) => p.id === id);
            if (product) {
                const quantityDifference = newQuantity - existingItem.quantity;

                if (
                    newQuantity <= product.quantity + existingItem.quantity &&
                    newQuantity >= 0
                ) {
                    setOrderItems(
                        orderItems.map((item) =>
                            item.id === id && !item.variant_id
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
        }
    };

    // Calculate discount when cart changes
    useEffect(() => {
        if (orderItems.length > 0 && activeDiscounts.length > 0) {
            calculateDiscount();
        } else {
            setAppliedDiscount(null);
            setDiscountAmount(0);
        }
    }, [orderItems, activeDiscounts]);

    const calculateDiscount = () => {
        if (orderItems.length === 0 || activeDiscounts.length === 0) {
            setAppliedDiscount(null);
            setDiscountAmount(0);
            return;
        }

        const subtotal = calculateTotal(orderItems);
        let bestDiscount: Discount | null = null;
        let maxDiscountAmount = 0;

        // Calculate discount for each item
        for (const item of orderItems) {
            for (const discount of activeDiscounts) {
                // Check if discount applies to this item
                const isItemApplicable =
                    !discount.applicable_items ||
                    discount.applicable_items.includes(
                        item.product_id || item.id,
                    );
                const isCategoryApplicable =
                    !discount.applicable_categories ||
                    (item.product_id &&
                        discount.applicable_categories.includes(
                            item.product_id,
                        ));

                if (
                    !isItemApplicable &&
                    !isCategoryApplicable &&
                    (discount.applicable_items ||
                        discount.applicable_categories)
                ) {
                    continue;
                }

                // Check minimum quantity
                if (
                    discount.min_quantity &&
                    item.quantity < discount.min_quantity
                ) {
                    continue;
                }

                // Check minimum purchase amount
                if (
                    discount.min_purchase_amount &&
                    subtotal < discount.min_purchase_amount
                ) {
                    continue;
                }

                // Calculate discount amount
                let itemDiscountAmount = 0;
                switch (discount.type) {
                    case 'percentage':
                        itemDiscountAmount =
                            item.price * item.quantity * (discount.value / 100);
                        break;
                    case 'fixed':
                        itemDiscountAmount = Math.min(
                            discount.value,
                            item.price * item.quantity,
                        );
                        break;
                    case 'buy_x_get_y':
                        if (discount.buy_quantity && discount.get_quantity) {
                            const freeItems =
                                Math.floor(
                                    item.quantity /
                                        (discount.buy_quantity +
                                            discount.get_quantity),
                                ) * discount.get_quantity;
                            itemDiscountAmount = freeItems * item.price;
                        }
                        break;
                }

                if (itemDiscountAmount > maxDiscountAmount) {
                    maxDiscountAmount = itemDiscountAmount;
                    bestDiscount = discount;
                }
            }
        }

        setAppliedDiscount(bestDiscount);
        setDiscountAmount(maxDiscountAmount);
    };

    const handleCompleteSale = () => {
        setIsCompleteSaleDialogOpen(true);
    };

    const confirmCompleteSale = async (paymentData: {
        payment_method: 'cash' | 'card';
        cash_received?: number;
        change?: number;
    }) => {
        const subtotal = calculateTotal(orderItems);
        const finalAmount = subtotal - discountAmount;

        const saleData = {
            items: orderItems.map((item) => ({
                id: item.product_id || item.id,
                variant_id: item.variant_id || null,
                quantity: item.quantity,
                price: item.price,
            })),
            total_amount: finalAmount,
            discount_id: appliedDiscount?.id || null,
            discount_amount: discountAmount,
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
                    const receiptItems = currentOrderItemsRef.current.map(
                        (item) => ({
                            id: item.id,
                            name: item.name,
                            quantity: item.quantity,
                            price:
                                typeof item.price === 'string'
                                    ? parseFloat(item.price)
                                    : item.price,
                        }),
                    );

                    // Create receipt data from current order
                    setReceiptData({
                        items: receiptItems,
                        totalAmount: finalAmount,
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

    const handleBarcodeScan = (barcode: string) => {
        // First try to find by variant barcode
        let foundProduct: Product | null = null;
        let foundVariant: Variant | null = null;

        for (const product of products) {
            if (product.variants) {
                const variant = product.variants.find(
                    (v) =>
                        v.barcode &&
                        v.barcode.toLowerCase() === barcode.toLowerCase(),
                );
                if (variant) {
                    foundProduct = product;
                    foundVariant = variant;
                    break;
                }
            }
        }

        if (foundProduct && foundVariant) {
            handleVariantSelected(foundVariant);
            toast.success(
                `Added ${foundProduct.name} (${Object.entries(
                    foundVariant.attributes,
                )
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', ')}) to cart`,
            );
            return;
        }

        // Find product by barcode
        const product = products.find(
            (p) =>
                p.barcode && p.barcode.toLowerCase() === barcode.toLowerCase(),
        );

        if (product) {
            // If product found, check for variants
            handleAddProductWithVariant(product);
        } else {
            // Try to find by SKU as fallback
            const productBySku = products.find(
                (p) => p.sku && p.sku.toLowerCase() === barcode.toLowerCase(),
            );

            if (productBySku) {
                handleAddProductWithVariant(productBySku);
            } else {
                toast.error(`Product with barcode "${barcode}" not found`);
            }
        }
    };

    const subtotal = calculateTotal(orderItems);
    const totalAmount = subtotal - discountAmount;

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
                subtotal={subtotal}
                discountAmount={discountAmount}
                appliedDiscount={appliedDiscount}
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
                              userName:
                                  auth.selectedTeamMember?.full_name ||
                                  auth.user.name ||
                                  undefined,
                          }
                        : null
                }
            />

            {/* Variant Selector Dialog */}
            {selectedProductForVariant && (
                <VariantSelectorDialog
                    open={isVariantDialogOpen}
                    onOpenChange={setIsVariantDialogOpen}
                    productName={selectedProductForVariant.name}
                    basePrice={selectedProductForVariant.price}
                    basePriceFormatted={
                        selectedProductForVariant.price_formatted
                    }
                    variants={selectedProductForVariant.variants || []}
                    appCurrency={appCurrency}
                    onSelectVariant={handleVariantSelected}
                />
            )}

            <div className="flex h-[calc(100vh-12rem)] flex-col gap-4 overflow-hidden lg:flex-row">
                {/* Products Section - Takes most of the space */}
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:min-h-full">
                    {/* Barcode Scanner */}
                    <div className="mb-4">
                        <BarcodeScanner
                            onScan={handleBarcodeScan}
                            placeholder="Scan or enter barcode..."
                            autoFocus={true}
                        />
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-gray-300 pl-10 dark:border-gray-600"
                            />
                        </div>
                        {categories.length > 0 && (
                            <Select
                                value={selectedCategory}
                                onValueChange={setSelectedCategory}
                            >
                                <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 sm:w-48">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Categories
                                    </SelectItem>
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
                                // Check for base product or any variant in cart
                                const orderItem = orderItems.find(
                                    (item) =>
                                        item.id === product.id &&
                                        !item.variant_id,
                                );
                                const variantItems = orderItems.filter(
                                    (item) =>
                                        item.product_id === product.id &&
                                        item.variant_id,
                                );
                                const inCart =
                                    orderItem !== undefined ||
                                    variantItems.length > 0;
                                const cartQuantity =
                                    orderItem?.quantity ||
                                    variantItems.reduce(
                                        (sum, item) => sum + item.quantity,
                                        0,
                                    ) ||
                                    0;

                                return (
                                    <Card
                                        key={product.id}
                                        className={`group cursor-pointer border-gray-200 transition-all hover:shadow-md dark:border-gray-600 ${
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
                                                        product.images.length >
                                                            0
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
                                                                    handleAddProductWithVariant(
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
                                                                    {
                                                                        cartQuantity
                                                                    }
                                                                </span>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 flex-1 p-0"
                                                                    onClick={() => {
                                                                        if (
                                                                            orderItem
                                                                        ) {
                                                                            updateItemQuantity(
                                                                                product.id,
                                                                                cartQuantity +
                                                                                    1,
                                                                            );
                                                                        } else if (
                                                                            variantItems.length >
                                                                            0
                                                                        ) {
                                                                            // Update the first variant item
                                                                            const variant =
                                                                                product.variants?.find(
                                                                                    (
                                                                                        v,
                                                                                    ) =>
                                                                                        v.id ===
                                                                                        variantItems[0]
                                                                                            .variant_id,
                                                                                );
                                                                            if (
                                                                                variant &&
                                                                                variantItems[0]
                                                                                    .quantity <
                                                                                    variant.quantity
                                                                            ) {
                                                                                updateItemQuantity(
                                                                                    variantItems[0]
                                                                                        .variant_id!,
                                                                                    variantItems[0]
                                                                                        .quantity +
                                                                                        1,
                                                                                );
                                                                            }
                                                                        }
                                                                    }}
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
                                    <Search className="mx-auto mb-4 h-12 w-12 text-gray-400 opacity-50 dark:text-gray-500" />
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
                        subtotal={subtotal}
                        discountAmount={discountAmount}
                        appliedDiscount={appliedDiscount}
                        totalAmount={totalAmount}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
