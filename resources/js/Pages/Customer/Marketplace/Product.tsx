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
import { ArrowLeft, Box, Layers, ShoppingBag, Tag } from 'lucide-react';
import { useMemo, useState } from 'react';

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

    const ownerIdentifier =
        community.slug || community.identifier || community.id;
    const projectIdentifier =
        project ?? community.project_identifier ?? 'community';

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
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Product Details
                    </h2>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
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
                        <Button asChild size="sm">
                            <Link
                                href={buildOrdersUrl(
                                    projectIdentifier,
                                    ownerIdentifier,
                                )}
                            >
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                My Orders
                            </Link>
                        </Button>
                    </div>
                </div>
            }
            sidebarSections={[
                { id: 'overview', label: 'Overview' },
                { id: 'details', label: 'Details' },
                { id: 'variants', label: 'Variants' },
            ]}
        >
            <Head title={`${product.name} • ${community.name}`} />

            <div className="space-y-6">
                <section id="overview">
                    <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                        <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                            <div>
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

                            <div className="space-y-4">
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
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            SKU
                                        </div>
                                        <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {product.sku ?? 'Not specified'}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Dimensions
                                        </div>
                                        <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {product.dimensions ?? '—'}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Weight
                                        </div>
                                        <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                            {product.weight ?? '—'}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
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
                    <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
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
                            <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
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
                                            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <Layers className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        Variant #{variant.id}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
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

                <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <Box className="h-4 w-4" />
                        Managed by {community.name}
                    </div>
                    <Link
                        href={buildOrdersUrl(
                            projectIdentifier,
                            ownerIdentifier,
                        )}
                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        View My Orders
                    </Link>
                </div>
            </div>
        </CustomerLayout>
    );
}
