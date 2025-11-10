import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useMemo } from 'react';
import { Filter, ShoppingCart } from 'lucide-react';

interface ProductImage {
    id?: number;
    image_url?: string;
    is_primary?: boolean;
}

interface Product {
    id: number | string;
    name: string;
    description?: string;
    price?: number | string | null;
    category?: string | null;
    type?: string | null;
    thumbnail_url?: string | null;
    images?: ProductImage[] | null;
    stock_quantity?: number | null;
    status?: string | null;
    created_at?: string;
}

interface Meta {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    next_page_url?: string | null;
    prev_page_url?: string | null;
    links?: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Filters {
    search?: string;
    category?: string;
    type?: string;
    availability?: string;
    status?: string;
    sort?: string;
    price_min?: string;
    price_max?: string;
    page?: number;
    per_page?: number;
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
    products: Product[];
    meta?: Meta | null;
    categories: string[];
    filters: Filters;
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

const getProductImage = (product: Product): string | null => {
    if (product.images && product.images.length > 0) {
        const primary = product.images.find((image) => image.is_primary);
        if (primary?.image_url) {
            return primary.image_url;
        }

        const first = product.images.find((image) => image.image_url);
        if (first?.image_url) {
            return first.image_url;
        }
    }

    if (product.thumbnail_url) {
        return product.thumbnail_url;
    }

    return null;
};

export default function MarketplaceIndex({
    auth,
    community,
    products,
    meta,
    categories,
    filters,
    project,
}: Props) {
    const ownerIdentifier =
        community.slug || community.identifier || community.id;
    const projectIdentifier =
        project ?? community.project_identifier ?? 'community';

    const {
        data,
        setData,
        get,
        processing,
    } = useForm({
        search: filters.search ?? '',
        category: filters.category ?? '',
        type: filters.type ?? '',
        availability: filters.availability ?? '',
        status: filters.status ?? 'published',
        sort: filters.sort ?? 'latest',
        price_min: filters.price_min ?? '',
        price_max: filters.price_max ?? '',
        per_page: filters.per_page ?? 12,
    });

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get(
            route('customer.projects.marketplace.index', {
                project: projectIdentifier,
                owner: ownerIdentifier,
            }),
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                data,
            },
        );
    };

    const onResetFilters = () => {
        setData({
            search: '',
            category: '',
            type: '',
            availability: '',
            status: 'published',
            sort: 'latest',
            price_min: '',
            price_max: '',
            per_page: data.per_page,
        });

        get(
            route('customer.projects.marketplace.index', {
                project: projectIdentifier,
                owner: ownerIdentifier,
            }),
            {
                preserveScroll: true,
                replace: true,
                data: {
                    per_page: data.per_page,
                },
            },
        );
    };

    const onChangePage = (page: number) => {
        get(
            route('customer.projects.marketplace.index', {
                project: projectIdentifier,
                owner: ownerIdentifier,
            }),
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                data: {
                    ...data,
                    page,
                },
            },
        );
    };

    const paginationLinks = useMemo(() => {
        if (!meta?.links) {
            return [];
        }

        return meta.links
            .filter((link) => link.url)
            .map((link) => {
                const label = link.label
                    .replace('&laquo;', '«')
                    .replace('&raquo;', '»')
                    .replace('&lsaquo;', '‹')
                    .replace('&rsaquo;', '›');

        return {
            label,
            active: link.active,
            url: link.url,
        };
            });
    }, [meta]);

    const ordersUrl = route('customer.projects.marketplace.orders', {
        project: projectIdentifier,
        owner: ownerIdentifier,
    });

    return (
        <CustomerLayout
            auth={auth}
            title="Marketplace"
            sidebarSections={[
                { id: 'filters', label: 'Filters' },
                { id: 'products', label: 'Products' },
                { id: 'orders', label: 'Orders' },
            ]}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Marketplace
                    </h2>
                    <div className="flex items-center gap-2">
                        <Link
                            href={ordersUrl}
                            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            My Orders
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Marketplace • ${community.name}`} />

            <div className="space-y-6">
                <Card id="filters" className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                Marketplace Filters
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                Refine the product list to find what you need.
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onResetFilters}
                            className="flex items-center gap-1"
                        >
                            <Filter className="h-4 w-4" />
                            Reset
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="sm:col-span-2">
                                <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                    Search
                                </label>
                                <Input
                                    value={data.search}
                                    onChange={(event) => setData('search', event.target.value)}
                                    placeholder="Search by product name or description"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                    Category
                                </label>
                                <Select
                                    value={data.category}
                                    onValueChange={(value) => setData('category', value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                    Product Type
                                </label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) => setData('type', value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="physical">Physical</SelectItem>
                                        <SelectItem value="digital">Digital</SelectItem>
                                        <SelectItem value="service">Service</SelectItem>
                                        <SelectItem value="subscription">Subscription</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                    Availability
                                </label>
                                <Select
                                    value={data.availability}
                                    onValueChange={(value) =>
                                        setData('availability', value === 'all' ? '' : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Any Status</SelectItem>
                                        <SelectItem value="in_stock">In Stock</SelectItem>
                                        <SelectItem value="low_stock">Low Stock</SelectItem>
                                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                    Sort
                                </label>
                                <Select
                                    value={data.sort}
                                    onValueChange={(value) => setData('sort', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="latest">Latest</SelectItem>
                                        <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                                        <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                                        <SelectItem value="popular">Most Popular</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                    Price Min
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={data.price_min}
                                    onChange={(event) => setData('price_min', event.target.value)}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                    Price Max
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={data.price_max}
                                    onChange={(event) => setData('price_max', event.target.value)}
                                    placeholder="1000"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                    Items Per Page
                                </label>
                                <Select
                                    value={String(data.per_page)}
                                    onValueChange={(value) => setData('per_page', Number(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="12" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="12">12</SelectItem>
                                        <SelectItem value="24">24</SelectItem>
                                        <SelectItem value="48">48</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-4">
                                <Button
                                    type="submit"
                                    className="w-full sm:w-auto"
                                    disabled={processing}
                                >
                                    {processing ? 'Applying...' : 'Apply Filters'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <section id="products">
                    {products.length === 0 ? (
                        <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                            <CardContent className="py-16 text-center text-gray-500 dark:text-gray-400">
                                No products match your filters yet. Try adjusting the criteria.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {products.map((product) => {
                                const image = getProductImage(product);
                                const productUrl = route(
                                    'customer.projects.marketplace.products.show',
                                    {
                                        project: projectIdentifier,
                                        owner: ownerIdentifier,
                                        product: product.id,
                                    },
                                );

                                return (
                                    <Card
                                        key={product.id}
                                        className="flex h-full flex-col border border-gray-200 transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        <div className="relative">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={product.name}
                                                    className="h-48 w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-48 w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-900">
                                                    No Image
                                                </div>
                                            )}
                                            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                                                {product.category && (
                                                    <Badge variant="secondary">
                                                        {product.category}
                                                    </Badge>
                                                )}
                                                {product.status && (
                                                    <Badge
                                                        variant="outline"
                                                        className="capitalize"
                                                    >
                                                        {product.status}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="line-clamp-2 text-lg text-gray-900 dark:text-gray-100">
                                                {product.name}
                                            </CardTitle>
                                            {product.description && (
                                                <CardDescription className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {product.description}
                                                </CardDescription>
                                            )}
                                        </CardHeader>
                                        <CardContent className="mt-auto space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
                                                    {formatPrice(
                                                        product.price,
                                                        community.app_currency,
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Stock:{' '}
                                                    {product.stock_quantity ?? '—'}
                                                </div>
                                            </div>
                                            <Button asChild className="w-full">
                                                <Link href={productUrl}>
                                                    View Details
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </section>

                {meta && meta.last_page && meta.last_page > 1 && (
                    <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                        <div>
                            Page {meta.current_page ?? 1} of {meta.last_page}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!meta.prev_page_url}
                                onClick={() =>
                                    onChangePage(Math.max((meta.current_page ?? 1) - 1, 1))
                                }
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!meta.next_page_url}
                                onClick={() =>
                                    onChangePage(Math.min((meta.current_page ?? 1) + 1, meta.last_page ?? 1))
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}


