import VariantSelector from '@/Components/VariantSelector';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Layers, Minus, Plus, ShoppingBag, Tag } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface ProductImage {
    id?: number;
    image_url?: string;
    alt_text?: string | null;
    is_primary?: boolean;
    sort_order?: number;
}

interface ProductVariant {
    id: number | string;
    sku?: string | null;
    price?: number | string | null;
    stock_quantity?: number | null;
    attributes?: Record<string, string>;
    is_active?: boolean;
}

interface Product {
    id: number | string;
    name: string;
    description?: string;
    price?: number | string | null;
    category?: string | null;
    type?: string | null;
    sku?: string | null;
    stock_quantity?: number | null;
    weight?: number | null;
    dimensions?: string | null;
    status?: string | null;
    tags?: string[] | null;
    thumbnail_url?: string | null;
    images?: ProductImage[] | null;
    active_variants?: ProductVariant[] | null;
    metadata?: Record<string, unknown> | null;
    created_at?: string;
    updated_at?: string;
}

interface Props extends PageProps {
    community: {
        id: number;
        name: string;
        slug?: string | null;
        identifier?: string | null;
        project_identifier?: string | null;
        app_currency?: {
            symbol?: string;
            decimal_separator?: string;
            thousands_separator?: string;
        } | null;
    };
    product: Product;
    project?: string;
}

interface CartItem {
    id: number | string;
    quantity: number;
    variant?: ProductVariant | null;
}

const isBrowser = typeof window !== 'undefined';

const formatPrice = (
    value: number | string | null | undefined,
    currency?: {
        symbol?: string;
        decimal_separator?: string;
        thousands_separator?: string;
    } | null,
): string => {
    const symbol = currency?.symbol ?? '₱';
    const decimalSeparator = currency?.decimal_separator ?? '.';
    const thousandsSeparator = currency?.thousands_separator ?? ',';

    if (value === null || value === undefined) {
        return `${symbol}0${decimalSeparator}00`;
    }

    const numeric =
        typeof value === 'string' ? Number.parseFloat(value) : Number(value);

    if (Number.isNaN(numeric)) {
        return `${symbol}0${decimalSeparator}00`;
    }

    const [whole, fraction = '00'] = numeric.toFixed(2).split('.');
    const formattedWhole = whole.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        thousandsSeparator,
    );

    return `${symbol}${formattedWhole}${decimalSeparator}${fraction}`;
};

const buildOrdersUrl = (project: string, owner: string | number) =>
    route('customer.projects.marketplace.overview', {
        project,
        owner,
    });

const buildMarketplaceUrl = (project: string, owner: string | number) =>
    route('customer.projects.marketplace.overview', {
        project,
        owner,
    });

export default function MarketplaceProduct({
    auth,
    community,
    product,
    project,
}: Props) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const ownerIdentifier =
        community.slug || community.identifier || community.id;
    const projectIdentifier =
        project ?? community.project_identifier ?? 'community';
    const authUser = auth.user;

    const cartKeyCandidates = useMemo(() => {
        const ownerKeys = new Set<string>();
        [
            ownerIdentifier,
            community.identifier,
            community.slug,
            community.id,
        ].forEach((value) => {
            if (value !== null && value !== undefined) {
                const asString = String(value).trim();
                if (asString.length > 0) {
                    ownerKeys.add(asString);
                    ownerKeys.add(asString.toLowerCase());
                }
            }
        });

        if (ownerKeys.size === 0) {
            ownerKeys.add('default');
        }

        const userKey = authUser?.id ? String(authUser.id) : 'guest';
        const keys: string[] = [];
        ownerKeys.forEach((ownerKey) => {
            keys.push(
                `marketplace-cart-${projectIdentifier}-${ownerKey}-${userKey}`,
            );
        });
        keys.push('community-cart');

        return keys;
    }, [authUser?.id, ownerIdentifier, community, projectIdentifier]);

    const loadCartState = useCallback(() => {
        const fallbackKey =
            cartKeyCandidates[0] ??
            `marketplace-cart-${projectIdentifier}-${ownerIdentifier ?? 'default'}-${authUser?.id ?? 'guest'}`;

        if (!isBrowser) {
            return { key: fallbackKey, items: [] as CartItem[] };
        }

        for (const key of cartKeyCandidates) {
            const saved = window.localStorage.getItem(key);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved) as CartItem[];
                    if (Array.isArray(parsed)) {
                        return { key, items: parsed };
                    }
                } catch (error) {
                    console.error('Failed to parse cart data', error);
                }
            }
        }

        return { key: fallbackKey, items: [] as CartItem[] };
    }, [authUser?.id, cartKeyCandidates, ownerIdentifier, projectIdentifier]);

    const initialCartState = useMemo(() => loadCartState(), [loadCartState]);
    const [storageKey, setStorageKey] = useState(initialCartState.key);
    const [cartItems, setCartItems] = useState<CartItem[]>(
        initialCartState.items,
    );

    useEffect(() => {
        if (!isBrowser) {
            return;
        }

        const { key, items } = loadCartState();
        setStorageKey(key);
        setCartItems(items);
    }, [loadCartState]);

    const persistCart = useCallback(
        (items: CartItem[]) => {
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
        [storageKey],
    );

    const addProductToCart = useCallback(
        (variant: ProductVariant | null | undefined, qty: number) => {
            setCartItems((prev) => {
                const updated = (() => {
                    const existing = prev.find(
                        (item) =>
                            String(item.id) === String(product.id) &&
                            (variant
                                ? String(item.variant?.id) ===
                                  String(variant.id)
                                : !item.variant),
                    );

                    if (existing) {
                        return prev.map((item) =>
                            String(item.id) === String(product.id) &&
                            (variant
                                ? String(item.variant?.id) ===
                                  String(variant.id)
                                : !item.variant)
                                ? { ...item, quantity: item.quantity + qty }
                                : item,
                        );
                    }

                    return [
                        ...prev,
                        {
                            id: product.id,
                            quantity: qty,
                            variant: variant ?? null,
                        },
                    ];
                })();

                persistCart(updated);
                return updated;
            });
        },
        [persistCart, product.id],
    );

    const hasVariants =
        Array.isArray(product.active_variants) &&
        product.active_variants.length > 0;
    const MAX_QUANTITY = 10;
    const physicalStock = product.stock_quantity ?? 0;
    const maxSimpleQuantity =
        product.type === 'physical'
            ? Math.max(1, Math.min(physicalStock, MAX_QUANTITY))
            : MAX_QUANTITY;

    useEffect(() => {
        setQuantity((prev) =>
            Math.min(Math.max(1, prev), Math.max(1, maxSimpleQuantity)),
        );
    }, [maxSimpleQuantity]);

    const handleVariantAddToCart = useCallback(
        (variantId: number, qty: number) => {
            const variant = product.active_variants?.find(
                (v) => Number(v.id) === Number(variantId),
            );

            if (!variant) {
                toast.error('Selected variant is no longer available.');
                return;
            }

            addProductToCart(variant, qty);
            toast.success('Added to cart', {
                description: variant.attributes
                    ? Object.values(variant.attributes).join(', ')
                    : product.name,
            });
        },
        [addProductToCart, product],
    );

    const handleSimpleAddToCart = () => {
        if (
            product.status !== 'published' ||
            (product.type === 'physical' && physicalStock <= 0)
        ) {
            toast.error('This product is not currently available.');
            return;
        }

        addProductToCart(null, quantity);
        toast.success('Added to cart', { description: product.name });
    };

    const variantSelectorVariants = useMemo(
        () =>
            (product.active_variants ?? []).map((variant) => ({
                ...variant,
                id:
                    typeof variant.id === 'string'
                        ? Number(variant.id)
                        : Number(variant.id ?? 0),
                sku: variant.sku ?? undefined,
                price:
                    typeof variant.price === 'string'
                        ? parseFloat(variant.price) || 0
                        : Number(variant.price ?? 0),
                stock_quantity: variant.stock_quantity ?? 0,
                attributes: variant.attributes ?? {},
                is_active: variant.is_active ?? true,
            })),
        [product.active_variants],
    );

    const decrementQuantity = () => {
        setQuantity((prev) => Math.max(1, prev - 1));
    };

    const incrementQuantity = () => {
        setQuantity((prev) => Math.min(maxSimpleQuantity, prev + 1));
    };
    const checkoutRoute = route('customer.projects.marketplace.checkout', {
        project: projectIdentifier,
        owner: ownerIdentifier,
    });

    const currencySymbol = community.app_currency?.symbol ?? '₱';
    const currencyCode =
        (community.app_currency as { code?: string } | null)?.code ?? 'PHP';

    const gallery = useMemo(() => {
        const images: ProductImage[] = [];

        if (product.images && product.images.length > 0) {
            images.push(
                ...[...product.images].sort(
                    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
                ),
            );
        }

        if (
            product.thumbnail_url &&
            !images.some((image) => image.image_url === product.thumbnail_url)
        ) {
            images.unshift({
                id: 0,
                image_url: product.thumbnail_url,
                alt_text: product.name,
                is_primary: true,
            });
        }

        if (images.length === 0) {
            images.push({
                id: 0,
                image_url: undefined,
            });
        }

        return images;
    }, [product.images, product.thumbnail_url, product.name]);

    return (
        <CustomerLayout
            auth={auth}
            title={product.name}
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 sm:flex-1">
                        Product Details
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="hidden sm:inline-flex"
                        >
                            <Link
                                href={buildMarketplaceUrl(
                                    projectIdentifier,
                                    ownerIdentifier,
                                )}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Marketplace
                            </Link>
                        </Button>
                    </div>
                </div>
            }
            sidebarSections={[]}
        >
            <Head title={`${product.name} • ${community.name}`} />

            <div className="mx-auto w-full max-w-6xl space-y-8 px-2 pt-6 sm:px-4 sm:pt-10 lg:px-0">
                <section id="overview">
                    <Card className="border border-gray-200/80 bg-white/95 shadow-xl ring-1 ring-gray-100 dark:border-gray-700/70 dark:bg-gray-900/80">
                        <CardContent className="grid gap-8 sm:gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
                            <div className="space-y-4 pt-8 sm:pt-10 lg:pt-8">
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                                    {gallery[activeImageIndex]?.image_url ? (
                                        <img
                                            src={
                                                gallery[activeImageIndex]
                                                    .image_url ?? ''
                                            }
                                            alt={product.name}
                                            className="h-80 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-80 items-center justify-center text-gray-400 dark:text-gray-600">
                                            No image available
                                        </div>
                                    )}
                                </div>
                                {gallery.length > 1 && (
                                    <div className="mt-3 flex gap-2 overflow-x-auto">
                                        {gallery.map((image, index) => (
                                            <button
                                                key={image.id ?? index}
                                                onClick={() =>
                                                    setActiveImageIndex(index)
                                                }
                                                className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border ${
                                                    activeImageIndex === index
                                                        ? 'border-indigo-500'
                                                        : 'border-transparent hover:border-indigo-200 dark:hover:border-indigo-600'
                                                }`}
                                            >
                                                {image.image_url ? (
                                                    <img
                                                        src={image.image_url}
                                                        alt={`Preview ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-gray-400">
                                                        No Image
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-5 pt-8 sm:pt-10 lg:pt-6">
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                        {product.name}
                                    </h1>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {product.category && (
                                        <Badge variant="secondary">
                                            {product.category}
                                        </Badge>
                                    )}
                                    {product.type && (
                                        <Badge
                                            variant="outline"
                                            className="capitalize"
                                        >
                                            {product.type}
                                        </Badge>
                                    )}
                                    {product.status && (
                                        <Badge className="capitalize">
                                            {product.status}
                                        </Badge>
                                    )}
                                </div>

                                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Price
                                    </div>
                                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                                        {formatPrice(
                                            product.price,
                                            community.app_currency,
                                        )}
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Stock:{' '}
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {product.stock_quantity ?? '—'}
                                        </span>
                                    </div>
                                    {hasVariants ? (
                                        <div className="mt-4 space-y-4">
                                            <VariantSelector
                                                product={{
                                                    id: Number(product.id),
                                                    name: product.name,
                                                    price:
                                                        typeof product.price ===
                                                        'string'
                                                            ? parseFloat(
                                                                  product.price,
                                                              ) || 0
                                                            : Number(
                                                                  product.price ??
                                                                      0,
                                                              ),
                                                    thumbnail_url:
                                                        product.thumbnail_url ??
                                                        undefined,
                                                }}
                                                variants={
                                                    variantSelectorVariants
                                                }
                                                currency={{
                                                    symbol: currencySymbol,
                                                    code: currencyCode,
                                                }}
                                                onAddToCart={
                                                    handleVariantAddToCart
                                                }
                                                maxQuantity={MAX_QUANTITY}
                                            />
                                            <Button asChild className="w-full">
                                                <Link href={checkoutRoute}>
                                                    Proceed to Checkout
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="mt-4 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    Quantity
                                                </span>
                                                <div className="flex items-center rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            decrementQuantity
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-300"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="px-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            incrementQuantity
                                                        }
                                                        disabled={
                                                            quantity >=
                                                            maxSimpleQuantity
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center text-gray-600 hover:text-indigo-600 disabled:opacity-50 dark:text-gray-300 dark:hover:text-indigo-300"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={handleSimpleAddToCart}
                                                disabled={
                                                    product.status !==
                                                        'published' ||
                                                    (product.type ===
                                                        'physical' &&
                                                        physicalStock <= 0)
                                                }
                                                className="w-full"
                                            >
                                                <ShoppingBag className="mr-2 h-4 w-4" />
                                                Add to Cart
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                asChild
                                            >
                                                <Link href={checkoutRoute}>
                                                    Go to Checkout
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                    {cartItems.length > 0 && (
                                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            {cartItems.length} item
                                            {cartItems.length === 1
                                                ? ''
                                                : 's'}{' '}
                                            in cart
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            SKU
                                        </div>
                                        <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {product.sku ?? 'Not specified'}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Dimensions
                                        </div>
                                        <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {product.dimensions ?? '—'}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Weight
                                        </div>
                                        <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {product.weight ?? '—'}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Updated
                                        </div>
                                        <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {product.updated_at
                                                ? new Date(
                                                      product.updated_at,
                                                  ).toLocaleString()
                                                : '—'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section id="details">
                    <Card className="border border-gray-200/80 bg-white/95 shadow-lg ring-1 ring-gray-100 dark:border-gray-700/70 dark:bg-gray-900/80">
                        <CardHeader>
                            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                Product Details
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                Additional metadata provided by the community.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                            {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <Tag className="h-4 w-4 text-gray-400" />
                                    {product.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {product.metadata &&
                            Object.keys(product.metadata).length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {Object.entries(product.metadata).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                                            >
                                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                    {key}
                                                </div>
                                                <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                                    {typeof value === 'string'
                                                        ? value
                                                        : JSON.stringify(value)}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <p>No additional metadata provided.</p>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {product.active_variants &&
                    product.active_variants.length > 0 && (
                        <section id="variants">
                            <Card className="border border-gray-200/80 bg-white/95 shadow-lg ring-1 ring-gray-100 dark:border-gray-700/70 dark:bg-gray-900/80">
                                <CardHeader>
                                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                        Available Variants
                                    </CardTitle>
                                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                        Different configurations offered for
                                        this product.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {product.active_variants.map((variant) => (
                                        <div
                                            key={variant.id}
                                            className="rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
                                        >
                                            <div className="flex flex-col gap-3 text-sm text-gray-600 dark:text-gray-300 md:flex-row md:items-center md:justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Layers className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        Variant #{variant.id}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant="outline">
                                                        {formatPrice(
                                                            variant.price ??
                                                                product.price,
                                                            community.app_currency,
                                                        )}
                                                    </Badge>
                                                    <Badge>
                                                        Stock:{' '}
                                                        {variant.stock_quantity ??
                                                            '—'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {variant.attributes && (
                                                <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase text-gray-500 dark:text-gray-400">
                                                    {Object.entries(
                                                        variant.attributes,
                                                    ).map(([key, value]) => (
                                                        <span
                                                            key={`${variant.id}-${key}`}
                                                            className="rounded-md border border-gray-200 px-2 py-1 dark:border-gray-700"
                                                        >
                                                            {key}: {value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </section>
                    )}
            </div>
        </CustomerLayout>
    );
}
