import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import { useForm } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ProductOrderHistory, ProductOrderItem } from './ProductOrderHistory';
import { ProductOrdersTable } from './ProductOrdersTable';

export interface MarketplaceProduct {
    id: number | string;
    name: string;
    description?: string | null;
    price?: number | string | null;
    category?: string | null;
    type?: string | null;
    status?: string | null;
    sku?: string | null;
    stock_quantity?: number | null;
    updated_at?: string | null;
    created_at?: string | null;
}

interface MyProductsProps {
    projectIdentifier: string;
    ownerIdentifier: string | number;
    appCurrencySymbol?: string;
}

export function MyProducts({
    projectIdentifier,
    ownerIdentifier,
    appCurrencySymbol = '₱',
}: MyProductsProps) {
    const [products, setProducts] = useState<MarketplaceProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [orders, setOrders] = useState<ProductOrderItem[]>([]);
    const [ordersDialogOpen, setOrdersDialogOpen] = useState(false);
    const [ordersProductName, setOrdersProductName] = useState('');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(
                route('customer.projects.marketplace.my-products', {
                    project: projectIdentifier,
                    owner: ownerIdentifier,
                }),
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Failed to load products');
            }

            const payload = await response.json();
            const data = payload['data'] ?? payload['products'] ?? payload;
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Unable to load products right now.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [ownerIdentifier, projectIdentifier]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const { data, setData, processing, reset, errors, clearErrors, post } =
        useForm({
            name: '',
            description: '',
            price: '',
            category: '',
            type: 'physical',
            status: 'draft',
            sku: '',
            stock_quantity: '',
        });

    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const formattedCurrency = useCallback(
        (value: number | string | null | undefined) => {
            if (value === null || value === undefined) {
                return `${appCurrencySymbol}0.00`;
            }

            const numeric =
                typeof value === 'string'
                    ? Number.parseFloat(value)
                    : Number(value);

            if (Number.isNaN(numeric)) {
                return `${appCurrencySymbol}0.00`;
            }

            return `${appCurrencySymbol}${numeric.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`;
        },
        [appCurrencySymbol],
    );

    const handleCreateProduct = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        clearErrors();

        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value ?? '');
            });

            const response = await fetch(
                route('customer.projects.marketplace.products.store', {
                    project: projectIdentifier,
                    owner: ownerIdentifier,
                }),
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                const payload = await response.json();
                toast.error(payload?.error ?? 'Failed to create product');
                return;
            }

            toast.success('Product created successfully');
            setCreateDialogOpen(false);
            reset();
            fetchProducts();
        } catch (error) {
            toast.error('Unable to create product right now.');
        }
    };

    const handleDeleteProduct = async (productId: number | string) => {
        if (!confirm('Delete this product?')) {
            return;
        }

        try {
            const response = await fetch(
                route('customer.projects.marketplace.products.destroy', {
                    project: projectIdentifier,
                    owner: ownerIdentifier,
                    product: productId,
                }),
                {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') ?? '',
                    },
                },
            );

            if (!response.ok) {
                const payload = await response.json();
                toast.error(payload?.error ?? 'Failed to delete product');
                return;
            }

            toast.success('Product deleted');
            fetchProducts();
        } catch (error) {
            toast.error('Unable to delete product right now.');
        }
    };

    const handleViewOrders = async (product: MarketplaceProduct) => {
        setOrdersLoading(true);
        setOrdersProductName(product.name);

        try {
            const response = await fetch(
                route('customer.projects.marketplace.products.orders', {
                    project: projectIdentifier,
                    owner: ownerIdentifier,
                    product: product.id,
                }),
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const payload = await response.json();
            const data = payload['data'] ?? payload['orders'] ?? payload;
            setOrders(Array.isArray(data) ? data : []);
            setOrdersDialogOpen(true);
        } catch (error) {
            toast.error('Unable to load product orders right now.');
        } finally {
            setOrdersLoading(false);
        }
    };

    const marketplaceUrl = useMemo(
        () =>
            route('customer.projects.marketplace.overview', {
                project: projectIdentifier,
                owner: ownerIdentifier,
            }),
        [ownerIdentifier, projectIdentifier],
    );

    return (
        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        My Products
                    </CardTitle>
                    <CardDescription>
                        Manage your listings for this community marketplace.
                    </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                        <a href={marketplaceUrl}>Open Marketplace</a>
                    </Button>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        Add Product
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading your products...
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        You have not listed any products yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[680px] divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                        Price
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                        Updated
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            <div className="font-medium">
                                                {product.name}
                                            </div>
                                            {product.category && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {product.category}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            <Badge
                                                variant="secondary"
                                                className="capitalize"
                                            >
                                                {product.status ?? 'draft'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {formattedCurrency(
                                                product.price ?? 0,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                            {product.updated_at
                                                ? formatDateTimeForDisplay(
                                                      product.updated_at,
                                                      {
                                                          month: 'short',
                                                          day: 'numeric',
                                                          year: 'numeric',
                                                      },
                                                  )
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleViewOrders(
                                                            product,
                                                        )
                                                    }
                                                    disabled={ordersLoading}
                                                >
                                                    Orders
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteProduct(
                                                            product.id,
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <ProductOrderHistory orders={orders} title="Recent Orders" />
            </CardContent>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Create Product Listing</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProduct} className="space-y-4">
                        <div>
                            <Label htmlFor="product-name">Name</Label>
                            <Input
                                id="product-name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="product-description">
                                Description
                            </Label>
                            <Textarea
                                id="product-description"
                                rows={3}
                                value={data.description}
                                onChange={(event) =>
                                    setData('description', event.target.value)
                                }
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="product-price">Price</Label>
                                <Input
                                    id="product-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(event) =>
                                        setData('price', event.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="product-stock">
                                    Stock Quantity
                                </Label>
                                <Input
                                    id="product-stock"
                                    type="number"
                                    min="0"
                                    value={data.stock_quantity}
                                    onChange={(event) =>
                                        setData(
                                            'stock_quantity',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="product-category">
                                    Category
                                </Label>
                                <Input
                                    id="product-category"
                                    value={data.category}
                                    onChange={(event) =>
                                        setData('category', event.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="product-status">Status</Label>
                                <select
                                    id="product-status"
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    value={data.status}
                                    onChange={(event) =>
                                        setData('status', event.target.value)
                                    }
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="product-type">Type</Label>
                                <select
                                    id="product-type"
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    value={data.type}
                                    onChange={(event) =>
                                        setData('type', event.target.value)
                                    }
                                >
                                    <option value="physical">Physical</option>
                                    <option value="digital">Digital</option>
                                    <option value="service">Service</option>
                                    <option value="subscription">
                                        Subscription
                                    </option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="product-sku">SKU</Label>
                                <Input
                                    id="product-sku"
                                    value={data.sku}
                                    onChange={(event) =>
                                        setData('sku', event.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setCreateDialogOpen(false);
                                    reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Product'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ProductOrdersTable
                open={ordersDialogOpen}
                onOpenChange={setOrdersDialogOpen}
                productName={ordersProductName}
                orders={orders}
            />
        </Card>
    );
}
