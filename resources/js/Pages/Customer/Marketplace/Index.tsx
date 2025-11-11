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
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter, PackageSearch } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { MyProducts } from './components/MyProducts';
import { ProductOrderHistory, ProductOrderItem } from './components/ProductOrderHistory';

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
    activeView?: string;
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
    activeView = 'products',
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

    const [activeTab, setActiveTab] = useState<string>(activeView);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [orders, setOrders] = useState<ProductOrderItem[]>([]);

    const inertiaPage = usePage();

    const loadOrders = useCallback(async () => {
        if (ordersLoading || orders.length > 0) {
            return;
        }

        setOrdersLoading(true);
        try {
            const response = await fetch(
                route('customer.projects.marketplace.orders', {
                    project: projectIdentifier,
                    owner: ownerIdentifier,
                }),
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Inertia': 'true',
                        'X-Inertia-Version': (inertiaPage as any)?.version ?? '',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const payload = await response.json();
            const data = payload.props?.orders ?? [];
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    }, [inertiaPage, orders.length, ordersLoading, ownerIdentifier, projectIdentifier]);

    useEffect(() => {
        if (activeTab === 'my-orders' || activeTab === 'order-history') {
            loadOrders();
        }
    }, [activeTab, loadOrders]);

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
            sidebarSections={[]}
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
                            View Orders Page
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Marketplace • ${community.name}`} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="w-full overflow-x-auto">
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="my-products">My Products</TabsTrigger>
                    <TabsTrigger value="my-orders">My Orders</TabsTrigger>
                    <TabsTrigger value="order-history">Order History</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-6">
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
                            <form
                                onSubmit={onSubmit}
                                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                            >
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
                                    />
                                </div>
                                <div className="sm:col-span-2 lg:col-span-1">
                                    <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                        Per Page
                                    </label>
                                    <Input
                                        type="number"
                                        min="6"
                                        max="48"
                                        value={data.per_page}
                                        onChange={(event) => setData('per_page', Number(event.target.value))}
                                    />
                                </div>
                                <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                                    <Button type="submit" disabled={processing} className="w-full">
                                        {processing ? 'Applying...' : 'Apply Filters'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div id="products" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <Card
                                key={product.id}
                                className="overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                            >
                                <div className="relative h-40 bg-gray-100 dark:bg-gray-700">
                                    {getProductImage(product) ? (
                                        <img
                                            src={getProductImage(product) ?? ''}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500">
                                            <PackageSearch className="h-10 w-10" />
                                        </div>
                                    )}
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-2 text-base text-gray-900 dark:text-gray-100">
                                        {product.name}
                                    </CardTitle>
                                    {product.category && (
                                        <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                                            {product.category}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                        {product.description}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-300">
                                            {formatPrice(product.price ?? 0, community.app_currency)}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {product.status ?? 'draft'}
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="w-full"
                                    >
                                        <Link
                                            href={route('customer.projects.marketplace.products.show', {
                                                project: projectIdentifier,
                                                owner: ownerIdentifier,
                                                product: product.id,
                                            })}
                                        >
                                            View Details
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {paginationLinks.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing page {meta?.current_page ?? 1} of {meta?.last_page ?? 1}
                            </div>
                            <div className="flex items-center gap-1">
                                {paginationLinks.map((link, index) => (
                                    <Button
                                        key={`${link.url ?? 'link'}-${index}`}
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        onClick={() => {
                                            if (!link.url || link.active) return;
                                            const url = new URL(link.url);
                                            const pageParam = url.searchParams.get('page');
                                            const targetPage = pageParam ? Number(pageParam) : index + 1;
                                            onChangePage(targetPage);
                                        }}
                                    >
                                        {link.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="my-products">
                    <MyProducts
                        projectIdentifier={projectIdentifier}
                        ownerIdentifier={ownerIdentifier}
                        appCurrencySymbol={community.app_currency?.symbol ?? '₱'}
                    />
                </TabsContent>

                <TabsContent value="my-orders" className="space-y-4">
                    {ordersLoading ? (
                        <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                            Loading orders...
                        </div>
                    ) : (
                        <ProductOrderHistory
                            orders={orders}
                            title="My Orders"
                            emptyMessage="You have not placed any orders yet."
                        />
                    )}
                </TabsContent>

                <TabsContent value="order-history" className="space-y-4">
                    {ordersLoading ? (
                        <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                            Loading order history...
                        </div>
                    ) : (
                        <ProductOrderHistory
                            orders={orders}
                            title="Order History"
                            emptyMessage="No order history available yet."
                        />
                    )}
                </TabsContent>
            </Tabs>
        </CustomerLayout>
    );
}


