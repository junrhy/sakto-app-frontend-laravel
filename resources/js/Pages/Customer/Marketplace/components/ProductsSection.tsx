import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import type { PageProps } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    Package,
    ShoppingBag,
    Store,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    CommunityCollectionItem,
    CommunityCurrency,
} from '../../Communities/types';
import { coerceToString } from '../../Communities/utils/communityCollections';
import { MyProducts } from './MyProducts';
import ProductCartSummary from './ProductCartSummary';
import ProductFilterPanel from './ProductFilterPanel';
import ProductGrid, {
    MarketplaceCartItem,
    MarketplaceProduct,
    MarketplaceProductImage,
    MarketplaceProductVariant,
} from './ProductGrid';
import { ProductOrderHistory, ProductOrderItem } from './ProductOrderHistory';

interface ProductsSectionProps {
    products: CommunityCollectionItem[];
    orderHistory: CommunityCollectionItem[];
    appCurrency?: CommunityCurrency | null;
    projectIdentifier: string;
    ownerIdentifier: string | number;
    authUser?: {
        id?: number;
        identifier?: string | null;
    } | null;
}

const toNumberOrNull = (value: unknown): number | null => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
};

const toOptionalString = (value: unknown): string | undefined => {
    const coerced = coerceToString(value);
    return coerced ?? undefined;
};

const toOptionalAmount = (value: unknown): number | string | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
        return value;
    }

    return undefined;
};

const normalizeProduct = (
    item: CommunityCollectionItem,
): MarketplaceProduct => {
    const rawId =
        item.id ??
        item.product_id ??
        item.slug ??
        item.identifier ??
        `product-${Math.random().toString(36).slice(2)}`;

    const id =
        typeof rawId === 'number' || typeof rawId === 'string'
            ? rawId
            : Number.isFinite(Number(rawId))
              ? Number(rawId)
              : String(rawId);

    return {
        id,
        name:
            coerceToString(item.name) ??
            coerceToString(item.title) ??
            'Untitled Product',
        description:
            coerceToString(item.description) ??
            coerceToString(item.summary) ??
            '',
        price:
            toOptionalAmount(item.price) ??
            toOptionalAmount(item.amount) ??
            toOptionalAmount(item.total) ??
            toOptionalAmount(item.base_price) ??
            0,
        category: coerceToString(item.category) ?? 'General',
        type:
            (coerceToString(item.type) as MarketplaceProduct['type']) ??
            'physical',
        sku: toOptionalString(item.sku) ?? null,
        stock_quantity:
            toNumberOrNull(item.stock_quantity ?? item.inventory) ?? null,
        weight: toNumberOrNull(item.weight),
        dimensions: toOptionalString(item.dimensions) ?? null,
        file_url: toOptionalString(item.file_url) ?? null,
        thumbnail_url:
            toOptionalString(item.thumbnail_url) ??
            toOptionalString(item.image_url) ??
            null,
        status:
            (coerceToString(item.status) as MarketplaceProduct['status']) ??
            'published',
        tags: Array.isArray(item.tags) ? (item.tags as string[]) : null,
        metadata:
            (typeof item.metadata === 'object' && item.metadata !== null
                ? (item.metadata as Record<string, unknown>)
                : {}) ?? {},
        client_identifier: toOptionalString(item.client_identifier) ?? '',
        created_at: toOptionalString(item.created_at) ?? '',
        updated_at: toOptionalString(item.updated_at) ?? '',
        images: Array.isArray(item.images)
            ? (item.images as Array<Record<string, unknown>>)
                  .map((image): MarketplaceProductImage | null => {
                      const imageUrl = toOptionalString(
                          image.image_url ?? image.url,
                      );

                      if (!imageUrl) {
                          return null;
                      }

                      const altText = toOptionalString(
                          image.alt_text ?? image.caption ?? image.title,
                      );

                      return {
                          id: Number.isFinite(Number(image.id))
                              ? Number(image.id)
                              : Math.floor(Math.random() * 1_000_000),
                          image_url: imageUrl,
                          alt_text: altText ?? undefined,
                          is_primary: Boolean(image.is_primary ?? false),
                          sort_order: Number(image.sort_order ?? 0),
                      };
                  })
                  .filter(
                      (image): image is MarketplaceProductImage =>
                          image !== null,
                  )
            : undefined,
        active_variants: Array.isArray(item.active_variants)
            ? (item.active_variants as Array<Record<string, unknown>>).map(
                  (variant): MarketplaceProductVariant => ({
                      id: Number(variant.id ?? Math.random()),
                      sku: toOptionalString(variant.sku) ?? null,
                      price: toNumberOrNull(variant.price) ?? undefined,
                      stock_quantity:
                          toNumberOrNull(variant.stock_quantity) ?? 0,
                      weight: toNumberOrNull(variant.weight) ?? undefined,
                      dimensions: toOptionalString(variant.dimensions) ?? null,
                      thumbnail_url:
                          toOptionalString(
                              variant.thumbnail_url ?? variant.image_url,
                          ) ?? null,
                      attributes: Object.entries(
                          (variant.attributes as Record<string, unknown>) ?? {},
                      ).reduce<Record<string, string>>((acc, [key, value]) => {
                          if (typeof value === 'string') {
                              acc[key] = value;
                          }
                          return acc;
                      }, {}),
                      is_active: Boolean(variant.is_active ?? true),
                  }),
              )
            : undefined,
    };
};

const normalizeOrderHistory = (
    orders: CommunityCollectionItem[],
): ProductOrderItem[] => {
    const ensureArray = (value: unknown): unknown[] | undefined => {
        if (Array.isArray(value)) {
            return value;
        }
        return undefined;
    };

    return orders.map((order) => ({
        id: order.id,
        order_number: toOptionalString(order.order_number),
        reference: toOptionalString(order.reference),
        order_status: toOptionalString(order.order_status),
        status: toOptionalString(order.status),
        payment_status: toOptionalString(order.payment_status),
        total_amount:
            toOptionalAmount(order.total_amount) ??
            toOptionalAmount(order.amount),
        amount: toOptionalAmount(order.amount),
        total_formatted: toOptionalString(order.total_formatted),
        amount_formatted: toOptionalString(order.amount_formatted),
        created_at: toOptionalString(order.created_at),
        ordered_at: toOptionalString(order.ordered_at),
        items: ensureArray(order.items),
        order_items: ensureArray(order.order_items ?? order.items),
    }));
};

export default function ProductsSection({
    products,
    orderHistory,
    appCurrency,
    projectIdentifier,
    ownerIdentifier,
    authUser,
}: ProductsSectionProps) {
    const [activeTab, setActiveTab] = useState<
        'products' | 'orders' | 'my-products'
    >('products');
    const [showFilters, setShowFilters] = useState(false);
    const [marketplaceFilters, setMarketplaceFilters] = useState({
        search: '',
        category: '',
        type: '',
        priceRange: '',
        availability: '',
    });

    const isBrowser = typeof window !== 'undefined';

    const page = usePage<PageProps>();
    const pageUserId = (page.props.auth?.user as unknown as { id?: number })
        ?.id;

    const cartKeyCandidates = useMemo(() => {
        const ownerKeys = new Set<string>();
        if (ownerIdentifier !== null && ownerIdentifier !== undefined) {
            ownerKeys.add(String(ownerIdentifier));
        }
        const normalizedOwner = String(ownerIdentifier ?? '')
            .trim()
            .toLowerCase();
        if (normalizedOwner.length > 0) {
            ownerKeys.add(normalizedOwner);
        }
        ownerKeys.add('default');

        const userKeys: string[] = [];
        if (authUser?.id) {
            userKeys.push(String(authUser.id));
        }
        if (pageUserId) {
            userKeys.push(String(pageUserId));
        }
        userKeys.push('guest');

        const keys: string[] = [];
        ownerKeys.forEach((ownerKey) => {
            userKeys.forEach((userKey) => {
                keys.push(
                    `marketplace-cart-${projectIdentifier}-${ownerKey}-${userKey}`,
                );
            });
        });

        if (!keys.includes('community-cart')) {
            keys.push('community-cart');
        }

        return keys;
    }, [authUser?.id, pageUserId, ownerIdentifier, projectIdentifier]);

    const initialCartStateRef = useRef<{
        storageKey: string;
        items: MarketplaceCartItem[];
    } | null>(null);

    if (!initialCartStateRef.current) {
        let resolvedKey =
            cartKeyCandidates[0] ??
            `marketplace-cart-${projectIdentifier}-${String(
                ownerIdentifier ?? 'default',
            )}-${authUser?.id ?? pageUserId ?? 'guest'}`;
        let resolvedItems: MarketplaceCartItem[] = [];

        if (isBrowser) {
            for (const key of cartKeyCandidates) {
                const saved = window.localStorage.getItem(key);
                if (saved) {
                    resolvedKey = key;
                    try {
                        resolvedItems = JSON.parse(
                            saved,
                        ) as MarketplaceCartItem[];
                    } catch (error) {
                        console.error(
                            'Failed to parse marketplace cart data',
                            error,
                        );
                        resolvedItems = [];
                    }
                    break;
                }
            }
        }

        initialCartStateRef.current = {
            storageKey: resolvedKey,
            items: resolvedItems,
        };
    }

    const [storageKey, setStorageKey] = useState<string>(
        initialCartStateRef.current.storageKey,
    );

    const normalizedProducts = useMemo(
        () => products.map((product) => normalizeProduct(product)),
        [products],
    );

    const [cartItems, setCartItems] = useState<MarketplaceCartItem[]>(
        initialCartStateRef.current.items,
    );

    // Load cart items from localStorage when cartKeyCandidates change
    useEffect(() => {
        if (!isBrowser) {
            return;
        }
        if (cartKeyCandidates.length === 0) {
            return;
        }

        // Try to find cart items from any candidate key (same as Checkout)
        let foundKey: string | null = null;
        let foundItems: MarketplaceCartItem[] = [];

        for (const key of cartKeyCandidates) {
            const saved = window.localStorage.getItem(key);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved) as MarketplaceCartItem[];
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        foundKey = key;
                        foundItems = parsed;
                        break;
                    }
                } catch (error) {
                    console.error(
                        'Failed to parse marketplace cart data',
                        error,
                    );
                }
            }
        }

        // If we found items, use them (this ensures we always have the latest cart)
        if (foundKey && foundItems.length > 0) {
            setCartItems(foundItems);
            setStorageKey(foundKey);
        } else if (foundKey) {
            // Found key but no items, just update the storage key
            setStorageKey(foundKey);
        } else {
            // No cart found, use the preferred key
            const preferredKey = cartKeyCandidates[0];
            if (preferredKey && storageKey !== preferredKey) {
        setStorageKey(preferredKey);
            }
        }
    }, [cartKeyCandidates, isBrowser]); // Removed cartItems and storageKey from dependencies to avoid loops

    const [selectedVariants, setSelectedVariants] = useState<
        Record<number | string, MarketplaceProductVariant | null>
    >({});
    const [variantErrors, setVariantErrors] = useState<
        Record<number | string, string>
    >({});

    const formattedOrders = useMemo(
        () => normalizeOrderHistory(orderHistory),
        [orderHistory],
    );

    const uniqueCategories = useMemo(() => {
        const categories = new Set<string>();
        normalizedProducts.forEach((product) => {
            if (product.category) {
                categories.add(product.category);
            }
        });
        return Array.from(categories).sort();
    }, [normalizedProducts]);

    const uniqueTypes = useMemo(() => {
        const types = new Set<string>();
        normalizedProducts.forEach((product) => {
            if (product.type) {
                types.add(product.type);
            }
        });
        return Array.from(types).sort();
    }, [normalizedProducts]);

    const formatPrice = (price: number | string | null | undefined): string => {
        if (price === null || price === undefined) {
            const symbol = appCurrency?.symbol || '₱';
            return `${symbol}0.00`;
        }

        const numericPrice =
            typeof price === 'string' ? parseFloat(price) || 0 : price;
        const symbol = appCurrency?.symbol || '₱';
        return `${symbol}${numericPrice.toFixed(2)}`;
    };

    const getEffectivePrice = (
        product: MarketplaceProduct,
        variant?: MarketplaceProductVariant | null,
    ) => {
        if (variant?.price !== undefined && variant?.price !== null) {
            return typeof variant.price === 'string'
                ? parseFloat(variant.price) || 0
                : variant.price;
        }

        if (product.price === null || product.price === undefined) {
            return 0;
        }

        return typeof product.price === 'string'
            ? parseFloat(product.price) || 0
            : product.price;
    };

    const getEffectiveStock = (
        product: MarketplaceProduct,
        variant?: MarketplaceProductVariant | null,
    ) => {
        if (variant?.stock_quantity !== undefined) {
            return variant.stock_quantity;
        }
        return product.stock_quantity || 0;
    };

    const getAvailableAttributes = (product: MarketplaceProduct) => {
        if (!product.active_variants || product.active_variants.length === 0) {
            return {};
        }

        const attributes: Record<string, Set<string>> = {};
        product.active_variants.forEach((variant) => {
            Object.entries(variant.attributes).forEach(([key, value]) => {
                if (!attributes[key]) {
                    attributes[key] = new Set();
                }
                attributes[key].add(value);
            });
        });

        return Object.fromEntries(
            Object.entries(attributes).map(([key, values]) => [
                key,
                Array.from(values),
            ]),
        );
    };

    const findMatchingVariant = (
        product: MarketplaceProduct,
        selectedAttributes: Record<string, string>,
    ) => {
        if (!product.active_variants) return null;

        if (Object.keys(selectedAttributes).length === 0) {
            return null;
        }

        return product.active_variants.find((variant) => {
            const variantAttributeKeys = Object.keys(variant.attributes);
            const selectedAttributeKeys = Object.keys(selectedAttributes);

            if (variantAttributeKeys.length !== selectedAttributeKeys.length) {
                return false;
            }

            return Object.entries(selectedAttributes).every(
                ([key, value]) => variant.attributes[key] === value,
            );
        });
    };

    const isVariantComplete = (
        product: MarketplaceProduct,
        selectedAttributes: Record<string, string>,
    ) => {
        const availableAttributes = getAvailableAttributes(product);
        const allAttributesSelected = Object.keys(availableAttributes).every(
            (key) => selectedAttributes[key],
        );

        if (!allAttributesSelected) {
            return false;
        }

        const matchingVariant = findMatchingVariant(
            product,
            selectedAttributes,
        );
        return matchingVariant !== null && matchingVariant !== undefined;
    };

    const isValidAttributeCombination = (
        product: MarketplaceProduct,
        selectedAttributes: Record<string, string>,
    ) => {
        if (!product.active_variants) return false;

        if (Object.keys(selectedAttributes).length === 0) {
            return true;
        }

        return product.active_variants.some((variant) =>
            Object.entries(selectedAttributes).every(
                ([key, value]) => variant.attributes[key] === value,
            ),
        );
    };

    const persistCart = useCallback(
        (items: MarketplaceCartItem[]) => {
            if (!isBrowser) {
                return;
            }

            if (items.length === 0) {
                window.localStorage.removeItem(storageKey);
                window.localStorage.removeItem('community-cart');
            } else {
                const payload = JSON.stringify(items);
                window.localStorage.setItem(storageKey, payload);
                window.localStorage.setItem('community-cart', payload);
            }
        },
        [isBrowser, storageKey],
    );

    const addToCart = (
        product: MarketplaceProduct,
        variant?: MarketplaceProductVariant | null,
        quantity: number = 1,
    ) => {
        setCartItems((prev) => {
            const existingItem = prev.find(
                (item) =>
                    String(item.id) === String(product.id) &&
                    (!variant
                        ? !item.variant
                        : String(item.variant?.id) === String(variant?.id)),
            );

            let updatedCart: MarketplaceCartItem[];
            if (existingItem) {
                updatedCart = prev.map((item) =>
                    item.id === product.id &&
                    (!variant
                        ? !item.variant
                        : item.variant?.id === variant?.id)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item,
                );
            } else {
                updatedCart = [
                    ...prev,
                    {
                        id: product.id,
                        quantity,
                        variant: variant ?? undefined,
                    },
                ];
            }

            persistCart(updatedCart);
            return updatedCart;
        });
    };

    const removeFromCart = (productId: number | string, variantId?: number) => {
        setCartItems((prev) => {
            const updatedCart = prev.filter((item) => {
                if (String(item.id) !== String(productId)) {
                    return true;
                }
                if (!variantId) {
                    return Boolean(item.variant);
                }
                return String(item.variant?.id) !== String(variantId);
            });
            persistCart(updatedCart);
            return updatedCart;
        });
    };

    const updateCartQuantity = (
        productId: number | string,
        quantity: number,
        variantId?: number,
    ) => {
        if (quantity <= 0) {
            removeFromCart(productId, variantId);
            return;
        }

        setCartItems((prev) => {
            const updatedCart = prev.map((item) =>
                String(item.id) === String(productId) &&
                (!variantId
                    ? !item.variant
                    : String(item.variant?.id) === String(variantId))
                    ? { ...item, quantity }
                    : item,
            );
            persistCart(updatedCart);
            return updatedCart;
        });
    };

    useEffect(() => {
        persistCart(cartItems);
    }, [cartItems, persistCart]);

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const product = normalizedProducts.find(
                (p) => String(p.id) === String(item.id),
            );
            if (!product) return total;
            const price = getEffectivePrice(product, item.variant);
            return total + price * item.quantity;
        }, 0);
    };

    const getCartItemCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const clearCart = useCallback(() => {
        setCartItems([]);
        setSelectedVariants({});
        setVariantErrors({});
        if (isBrowser) {
            window.localStorage.removeItem(storageKey);
            window.localStorage.removeItem('community-cart');
            // Also clear from all candidate keys
            cartKeyCandidates.forEach((key) => {
                window.localStorage.removeItem(key);
            });
        }
        toast.success('Cart cleared');
    }, [isBrowser, storageKey, cartKeyCandidates]);

    const handleVariantSelection = (
        productId: number | string,
        variant: MarketplaceProductVariant | null,
    ) => {
        setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
        setVariantErrors((prev) => ({ ...prev, [productId]: '' }));
    };

    const handleCheckout = () => {
        router.visit(
            route('customer.projects.marketplace.checkout', {
                project: projectIdentifier,
                owner: ownerIdentifier,
            }),
        );
    };

    const getProductImage = (product: MarketplaceProduct): string | null => {
        if (product.images && product.images.length > 0) {
            const sortedImages = [...product.images].sort(
                (a, b) => a.sort_order - b.sort_order,
            );
            const primaryImage = sortedImages.find((img) => img.is_primary);
            if (primaryImage) {
                return primaryImage.image_url;
            }
            return sortedImages[0].image_url;
        }
        return product.thumbnail_url;
    };

    const getFilteredProducts = () => {
        return normalizedProducts.filter((product) => {
            if (marketplaceFilters.search) {
                const searchLower = marketplaceFilters.search.toLowerCase();
                const matchesSearch =
                    product.name.toLowerCase().includes(searchLower) ||
                    product.description?.toLowerCase().includes(searchLower) ||
                    product.category?.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }

            if (
                marketplaceFilters.category &&
                product.category !== marketplaceFilters.category
            ) {
                return false;
            }

            if (
                marketplaceFilters.type &&
                product.type !== marketplaceFilters.type
            ) {
                return false;
            }

            if (marketplaceFilters.priceRange) {
                const price = getEffectivePrice(product);
                if (marketplaceFilters.priceRange === 'under_10' && price >= 10)
                    return false;
                if (
                    marketplaceFilters.priceRange === '10_50' &&
                    (price < 10 || price >= 50)
                )
                    return false;
                if (
                    marketplaceFilters.priceRange === '50_100' &&
                    (price < 50 || price >= 100)
                )
                    return false;
                if (marketplaceFilters.priceRange === 'over_100' && price < 100)
                    return false;
            }

            if (marketplaceFilters.availability === 'in_stock') {
                const stock = getEffectiveStock(
                    product,
                    selectedVariants[product.id] ?? null,
                );
                if (stock <= 0) {
                    return false;
                }
            }

            return true;
        });
    };

    const filteredProducts = useMemo(
        () => getFilteredProducts(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [normalizedProducts, marketplaceFilters, selectedVariants],
    );

    const hasActiveFilters = () => {
        return Object.values(marketplaceFilters).some((value) => value !== '');
    };

    const clearFilters = () => {
        setMarketplaceFilters({
            search: '',
            category: '',
            type: '',
            priceRange: '',
            availability: '',
        });
    };

    const gridCurrency = useMemo(() => {
        if (!appCurrency) {
            return null;
        }

        return {
            code: appCurrency.code ?? 'PHP',
            symbol: appCurrency.symbol ?? '₱',
        };
    }, [appCurrency]);

    const appCurrencySymbol = appCurrency?.symbol ?? '₱';

    return (
        <div className="space-y-6">
            <Tabs
                value={activeTab}
                onValueChange={(value) =>
                    setActiveTab(value as 'products' | 'orders' | 'my-products')
                }
                className="w-full"
            >
                <TabsList className="mb-6 grid h-auto w-full grid-cols-1 gap-2 rounded-xl border border-gray-200 bg-gray-100 p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-3">
                    <TabsTrigger
                        value="products"
                        className="group flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700/50"
                    >
                        <Package className="h-4 w-4" />
                        <span>Products</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="orders"
                        className="group flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700/50"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Orders</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="my-products"
                        className="group flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-gray-700/50"
                    >
                        <Store className="h-4 w-4" />
                        <span>My Products</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-6">
                    <ProductCartSummary
                        cartItems={cartItems}
                        getCartItemCount={getCartItemCount}
                        getCartTotal={getCartTotal}
                        formatPrice={formatPrice}
                        handleCheckout={handleCheckout}
                        handleClearCart={clearCart}
                    />

                    <div className="flex items-center justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters((prev) => !prev)}
                            className="text-xs sm:text-sm"
                        >
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                    </div>

                    <ProductFilterPanel
                        showFilters={showFilters}
                        filters={marketplaceFilters}
                        setFilters={setMarketplaceFilters}
                        products={normalizedProducts}
                        getFilteredProducts={getFilteredProducts}
                        getUniqueCategories={() => uniqueCategories}
                        getUniqueTypes={() => uniqueTypes}
                        clearFilters={clearFilters}
                        hasActiveFilters={hasActiveFilters}
                        appCurrency={gridCurrency}
                    />

                    <ProductGrid
                        products={filteredProducts}
                        cartItems={cartItems}
                        selectedVariants={selectedVariants}
                        variantErrors={variantErrors}
                        addToCart={addToCart}
                        removeFromCart={removeFromCart}
                        updateCartQuantity={updateCartQuantity}
                        handleVariantSelection={handleVariantSelection}
                        getEffectivePrice={getEffectivePrice}
                        getEffectiveStock={getEffectiveStock}
                        getAvailableAttributes={getAvailableAttributes}
                        findMatchingVariant={findMatchingVariant}
                        isVariantComplete={isVariantComplete}
                        isValidAttributeCombination={
                            isValidAttributeCombination
                        }
                        formatPrice={formatPrice}
                        setVariantErrors={setVariantErrors}
                        hasActiveFilters={hasActiveFilters}
                        clearFilters={clearFilters}
                        getProductImage={getProductImage}
                        appCurrency={gridCurrency}
                        projectIdentifier={projectIdentifier}
                        ownerIdentifier={ownerIdentifier}
                    />
                </TabsContent>

                <TabsContent value="orders" className="space-y-6">
                    <ProductOrderHistory
                        orders={formattedOrders}
                        emptyMessage="You have no marketplace orders yet."
                        projectIdentifier={projectIdentifier}
                        ownerIdentifier={ownerIdentifier}
                        appCurrency={appCurrency}
                    />
                </TabsContent>

                <TabsContent value="my-products" className="space-y-6">
                    <MyProducts
                        projectIdentifier={projectIdentifier}
                        ownerIdentifier={ownerIdentifier}
                        appCurrencySymbol={appCurrencySymbol}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
