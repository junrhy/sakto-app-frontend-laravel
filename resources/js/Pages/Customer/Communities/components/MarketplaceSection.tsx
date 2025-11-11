import { useMemo } from 'react';
import { Link } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Community,
    CommunityCollectionItem,
    CommunityCurrency,
} from '../types';
import { coerceToString, formatDate, getItemTitle } from '../utils/communityCollections';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import {
    BookOpen,
    Package2,
    Receipt,
    ShoppingBag,
    ShoppingCart,
    Tag,
} from 'lucide-react';

interface AuthUserLite {
    id?: number;
    identifier?: string | null;
    name?: string | null;
}

interface MarketplaceSectionProps {
    id: string;
    community: Community;
    projectIdentifier: string;
    products: CommunityCollectionItem[];
    orderHistory: CommunityCollectionItem[];
    appCurrency?: CommunityCurrency | null;
    authUser?: AuthUserLite | null;
}

const truthyBoolean = (value: unknown): boolean => {
    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value === 1;
    }

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return ['1', 'true', 'yes', 'y'].includes(normalized);
    }

    return false;
};

const extractProductImage = (item: CommunityCollectionItem): string | null => {
    const directKeys = [
        'thumbnail_url',
        'thumbnail',
        'featured_image',
        'image_url',
        'image',
        'cover_image',
    ];

    for (const key of directKeys) {
        const value = coerceToString(item[key]);
        if (value) {
            return value;
        }
    }

    const images = item.images as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(images) && images.length > 0) {
        const primary = images.find((image) => truthyBoolean(image?.is_primary));
        if (primary) {
            const url = coerceToString(primary.image_url ?? primary.url);
            if (url) {
                return url;
            }
        }

        const first = images.find((image) => coerceToString(image.image_url));
        if (first) {
            const url = coerceToString(first.image_url ?? first.url);
            if (url) {
                return url;
            }
        }
    }

    return null;
};

const extractPrice = (
    item: CommunityCollectionItem,
    appCurrency?: CommunityCurrency | null,
): string | null => {
    const formattedKeys = [
        'price_formatted',
        'formatted_price',
        'priceFormatted',
        'display_price',
        'price_display',
        'priceLabel',
    ];

    for (const key of formattedKeys) {
        const value = coerceToString(item[key]);
        if (value) {
            return value;
        }
    }

    const numericKeys = [
        'price',
        'amount',
        'total',
        'base_price',
        'min_price',
        'max_price',
    ];

    for (const key of numericKeys) {
        const value = item[key];
        if (typeof value === 'number') {
            return formatCurrency(value, appCurrency);
        }

        if (typeof value === 'string') {
            const parsed = Number(value);
            if (!Number.isNaN(parsed)) {
                return formatCurrency(parsed, appCurrency);
            }
        }
    }

    return null;
};

const formatCurrency = (value: number, appCurrency?: CommunityCurrency | null): string => {
    const symbol = appCurrency?.symbol ?? '₱';
    const decimalSeparator = appCurrency?.decimal_separator ?? '.';
    const thousandsSeparator = appCurrency?.thousands_separator ?? ',';

    const [whole, fraction = '00'] = value.toFixed(2).split('.');
    const wholeWithSeparators = whole.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        thousandsSeparator,
    );

    return `${symbol}${wholeWithSeparators}${decimalSeparator}${fraction}`;
};

const toTitleCase = (value: string): string =>
    value
        .split(/[_\s-]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

const computeOrderTotal = (
    item: CommunityCollectionItem,
    appCurrency?: CommunityCurrency | null,
): string => {
    const formatted = extractPrice(item, appCurrency);
    if (formatted) {
        return formatted;
    }

    return formatCurrency(0, appCurrency);
};

const computeOrderTotalValue = (item: CommunityCollectionItem): number => {
    const numericKeys = [
        'total_amount',
        'total',
        'amount',
        'grand_total',
        'payable_amount',
    ];

    for (const key of numericKeys) {
        const value = item[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === 'string' && value.trim().length > 0) {
            const parsed = Number(value);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
    }

    return 0;
};

export function MarketplaceSection({
    id,
    community,
    projectIdentifier,
    products,
    orderHistory,
    appCurrency,
    authUser,
}: MarketplaceSectionProps) {
    const ownerIdentifier = community.slug || community.identifier || community.id;
    const marketplaceIndexUrl = route('customer.projects.marketplace.index', {
        project: projectIdentifier,
        owner: ownerIdentifier,
    });
    const marketplaceOrdersUrl = route('customer.projects.marketplace.orders', {
        project: projectIdentifier,
        owner: ownerIdentifier,
    });

    const allProducts = useMemo(
        () => (Array.isArray(products) ? products : []),
        [products],
    );

    const productsPreview = useMemo(
        () => allProducts.slice(0, 6),
        [allProducts],
    );

    const authUserId = authUser?.id ?? null;
    const authUserIdentifier = authUser?.identifier ?? null;

    const myProducts = useMemo(() => {
        return allProducts.filter((item) => {
            if (truthyBoolean(item.is_owner)) {
                return true;
            }

            if (truthyBoolean(item.isOwner)) {
                return true;
            }

            if (truthyBoolean(item.is_mine) || truthyBoolean(item.isMine)) {
                return true;
            }

            if (truthyBoolean(item.owned_by_customer) || truthyBoolean(item.ownedByCustomer)) {
                return true;
            }

            if (authUserId !== null) {
                const ownerIdCandidates = [
                    item.owner_id,
                    item.ownerId,
                    item.user_id,
                    item.userId,
                    item.customer_id,
                    item.customerId,
                ];

                const matchesId = ownerIdCandidates.some((candidate) => {
                    if (typeof candidate === 'number') {
                        return candidate === authUserId;
                    }

                    if (typeof candidate === 'string' && candidate.trim().length > 0) {
                        return Number(candidate) === authUserId;
                    }

                    return false;
                });

                if (matchesId) {
                    return true;
                }
            }

            if (authUserIdentifier) {
                const ownerIdentifierCandidates = [
                    item.owner_identifier,
                    item.ownerIdentifier,
                    item.user_identifier,
                    item.userIdentifier,
                    item.customer_identifier,
                    item.customerIdentifier,
                ];

                const matchesIdentifier = ownerIdentifierCandidates.some((candidate) => {
                    if (typeof candidate === 'string' && candidate.trim().length > 0) {
                        return candidate === authUserIdentifier;
                    }

                    return false;
                });

                if (matchesIdentifier) {
                    return true;
                }
            }

            return false;
        });
    }, [allProducts, authUserId, authUserIdentifier]);

    const recentOrders = useMemo(
        () => (Array.isArray(orderHistory) ? orderHistory.slice(0, 5) : []),
        [orderHistory],
    );

    const orderStatusSummary = useMemo(() => {
        const summary = new Map<string, number>();

        if (Array.isArray(orderHistory)) {
            orderHistory.forEach((item) => {
                const statusValue = coerceToString(item.order_status ?? item.status) ?? 'unknown';
                const normalized = statusValue.trim().length
                    ? statusValue.trim().toLowerCase()
                    : 'unknown';

                summary.set(normalized, (summary.get(normalized) ?? 0) + 1);
            });
        }

        return Array.from(summary.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4);
    }, [orderHistory]);

    const totalSpent = useMemo(() => {
        if (!Array.isArray(orderHistory)) {
            return 0;
        }

        return orderHistory.reduce(
            (total, item) => total + computeOrderTotalValue(item),
            0,
        );
    }, [orderHistory]);

    return (
        <section id={id} className="space-y-4">
            <Tabs defaultValue="products" className="w-full">
                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                    <CardHeader className="gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                    <ShoppingBag className="h-5 w-5" />
                                    Marketplace
                                </CardTitle>
                                <CardDescription>
                                    Discover products, manage your listings, and track orders in one place.
                                </CardDescription>
                            </div>
                            <TabsList className="w-full sm:w-auto">
                                <TabsTrigger value="products">Products</TabsTrigger>
                                <TabsTrigger value="my-products">My Products</TabsTrigger>
                                <TabsTrigger value="my-orders">My Orders</TabsTrigger>
                                <TabsTrigger value="order-history">Order History</TabsTrigger>
                            </TabsList>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <TabsContent value="products" className="mt-0">
                            {productsPreview.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-8 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-400">
                                    <Package2 className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        No products available yet
                                    </p>
                                    <p className="text-sm">
                                        Check back later or explore the marketplace for more listings.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {productsPreview.map((product, index) => {
                                            const title = getItemTitle(product);
                                            const description = coerceToString(
                                                product.description ?? product.summary ?? product.details,
                                            );
                                            const imageUrl = extractProductImage(product);
                                            const priceLabel = extractPrice(product, appCurrency);
                                            const statusLabel = coerceToString(product.status ?? product.state);
                                            const productIdentifier =
                                                product.id ?? product.slug ?? product.product_id ?? index;
                                            const productUrl = route(
                                                'customer.projects.marketplace.products.show',
                                                {
                                                    project: projectIdentifier,
                                                    owner: ownerIdentifier,
                                                    product: productIdentifier,
                                                },
                                            );

                                            return (
                                                <div
                                                    key={`marketplace-product-${productIdentifier}`}
                                                    className="flex h-full flex-col rounded-lg border border-gray-200/80 bg-white/80 p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-600/70 dark:bg-gray-800/60 dark:shadow-gray-900/40"
                                                >
                                                    <div className="flex flex-1 gap-4">
                                                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                                                            {imageUrl ? (
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={title}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500">
                                                                    <Package2 className="h-6 w-6" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <h4 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                    {title}
                                                                </h4>
                                                                {statusLabel && (
                                                                    <Badge variant="outline" className="text-xs capitalize">
                                                                        {toTitleCase(statusLabel)}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {description && (
                                                                <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                                                                    {description}
                                                                </p>
                                                            )}
                                                            <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                                                                {priceLabel ?? 'Price upon request'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            className="flex-1 min-w-[140px]"
                                                        >
                                                            <Link href={productUrl}>
                                                                <ShoppingCart className="mr-2 h-4 w-4" />
                                                                View Product
                                                            </Link>
                                                        </Button>
                                                        <Button asChild className="flex-1 min-w-[140px]">
                                                            <Link href={marketplaceIndexUrl}>
                                                                <ShoppingBag className="mr-2 h-4 w-4" />
                                                                Full Marketplace
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </TabsContent>

                        <TabsContent value="my-products" className="mt-0">
                            {myProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-8 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-400">
                                    <Tag className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        You have no active listings
                                    </p>
                                    <p className="text-sm">
                                        Create your first product listing to showcase it to community members.
                                    </p>
                                    <Button asChild className="mt-2">
                                        <Link
                                            href={`${marketplaceIndexUrl}?view=my-products`}
                                        >
                                            Manage My Products
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {myProducts.slice(0, 4).map((product, index) => {
                                            const title = getItemTitle(product);
                                            const priceLabel = extractPrice(product, appCurrency);
                                            const statusLabel = coerceToString(product.status ?? product.state);
                                            const productIdentifier =
                                                product.id ?? product.slug ?? product.product_id ?? index;

                                            return (
                                                <div
                                                    key={`my-product-${productIdentifier}`}
                                                    className="rounded-lg border border-gray-200/80 bg-white/80 p-4 shadow-sm dark:border-gray-600/70 dark:bg-gray-800/60"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                {title}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Last updated{' '}
                                                                {formatDate(
                                                                    product.updated_at ?? product.created_at ?? new Date().toISOString(),
                                                                )}
                                                            </p>
                                                        </div>
                                                        {statusLabel && (
                                                            <Badge variant="outline" className="text-xs capitalize">
                                                                {toTitleCase(statusLabel)}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 flex items-center justify-between text-sm">
                                                        <span className="font-medium text-indigo-600 dark:text-indigo-300">
                                                            {priceLabel ?? 'Custom pricing'}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            SKU: {coerceToString(product.sku ?? product.code) ?? '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-end">
                                        <Button asChild variant="outline">
                                            <Link href={`${marketplaceIndexUrl}?view=my-products`}>
                                                Manage All Products
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="my-orders" className="mt-0">
                            {recentOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-8 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-400">
                                    <Receipt className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        No recent orders yet
                                    </p>
                                    <p className="text-sm">
                                        Orders you place will appear here for quick access.
                                    </p>
                                    <Button asChild className="mt-2">
                                        <Link href={marketplaceOrdersUrl}>View Orders</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="rounded-lg border border-gray-200/80 bg-white/80 p-4 shadow-sm dark:border-gray-600/70 dark:bg-gray-800/60">
                                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                Total Orders
                                            </p>
                                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                                {orderHistory.length}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200/80 bg-white/80 p-4 shadow-sm dark:border-gray-600/70 dark:bg-gray-800/60">
                                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                Total Spent
                                            </p>
                                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                                {formatCurrency(totalSpent, appCurrency)}
                                            </p>
                                        </div>
                                        {orderStatusSummary.map(([status, count]) => (
                                            <div
                                                key={`order-status-${status}`}
                                                className="rounded-lg border border-gray-200/80 bg-white/80 p-4 shadow-sm dark:border-gray-600/70 dark:bg-gray-800/60"
                                            >
                                                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                    {toTitleCase(status)}
                                                </p>
                                                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                                    {count}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {recentOrders.map((order, index) => {
                                            const orderNumber =
                                                coerceToString(order.order_number) ??
                                                coerceToString(order.reference) ??
                                                `ORD-${index + 1}`;
                                            const statusLabel = coerceToString(order.order_status ?? order.status);
                                            const totalLabel = computeOrderTotal(order, appCurrency);
                                            const placedDateRaw = order.created_at ?? order.ordered_at ?? order.date;
                                            const placedDate = coerceToString(placedDateRaw);
                                            const itemsCount = (() => {
                                                const items = order.items as Array<unknown> | undefined;
                                                if (Array.isArray(items)) {
                                                    return items.length;
                                                }

                                                const countValue = order.items_count ?? order.quantity ?? order.total_items;
                                                const parsed = Number(countValue);
                                                if (!Number.isNaN(parsed) && parsed > 0) {
                                                    return parsed;
                                                }

                                                return null;
                                            })();

                                            return (
                                                <div
                                                    key={`recent-order-${orderNumber}`}
                                                    className="rounded-lg border border-gray-200/80 bg-white/80 p-4 shadow-sm dark:border-gray-600/70 dark:bg-gray-800/60"
                                                >
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                Order {orderNumber}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Placed on{' '}
                                                                {placedDate
                                                                    ? formatDateTimeForDisplay(placedDate, {
                                                                          month: 'short',
                                                                          day: 'numeric',
                                                                          year: 'numeric',
                                                                      })
                                                                    : '—'}
                                                            </p>
                                                        </div>
                                                        {statusLabel && (
                                                            <Badge variant="outline" className="text-xs capitalize">
                                                                {toTitleCase(statusLabel)}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                                        <span>
                                                            Total:{' '}
                                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                                {totalLabel}
                                                            </span>
                                                        </span>
                                                        {itemsCount !== null && (
                                                            <span>{itemsCount} item{itemsCount === 1 ? '' : 's'}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex justify-end">
                                        <Button asChild>
                                            <Link href={marketplaceOrdersUrl}>View All Orders</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="order-history" className="mt-0 space-y-4">
                            {orderHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-8 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-400">
                                    <Receipt className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        No order history yet
                                    </p>
                                    <p className="text-sm">
                                        Place an order to see it listed here.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-gray-200/80 bg-white/80 shadow-sm dark:border-gray-600/70 dark:bg-gray-800/60">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                                <TableHead className="text-gray-900 dark:text-white">
                                                    Order #
                                                </TableHead>
                                                <TableHead className="text-gray-900 dark:text-white">
                                                    Status
                                                </TableHead>
                                                <TableHead className="text-gray-900 dark:text-white">
                                                    Total
                                                </TableHead>
                                                <TableHead className="text-right text-gray-900 dark:text-white">
                                                    Date
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orderHistory.slice(0, 10).map((item, index) => {
                                                const orderNumber =
                                                    coerceToString(item.order_number) ??
                                                    coerceToString(item.reference) ??
                                                    `Order-${index + 1}`;
                                                const statusLabel = coerceToString(item.order_status ?? item.status);
                                                const totalLabel = computeOrderTotal(item, appCurrency);
                                                const dateValue = coerceToString(
                                                    item.created_at ?? item.ordered_at ?? item.date,
                                                );

                                                return (
                                                    <TableRow
                                                        key={`order-history-${orderNumber}`}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    >
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            {orderNumber}
                                                        </TableCell>
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            {statusLabel ? toTitleCase(statusLabel) : 'Unknown'}
                                                        </TableCell>
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            {totalLabel}
                                                        </TableCell>
                                                        <TableCell className="text-right text-gray-900 dark:text-white">
                                                            {dateValue
                                                                ? formatDateTimeForDisplay(dateValue, {
                                                                      month: 'short',
                                                                      day: 'numeric',
                                                                      year: 'numeric',
                                                                  })
                                                                : '—'}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                            <div className="flex justify-end">
                                <Button asChild variant="outline">
                                    <Link href={marketplaceOrdersUrl}>Go to Orders Dashboard</Link>
                                </Button>
                            </div>
                        </TabsContent>
                    </CardContent>
                </Card>
            </Tabs>
        </section>
    );
}
