import ImageUploader from '@/Components/ImageUploader';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import { useForm } from '@inertiajs/react';
import { Image as ImageIcon, Package } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
    thumbnail_url?: string | null;
    images?: Array<{
        id: number;
        image_url: string;
        alt_text?: string;
        is_primary: boolean;
        sort_order: number;
    }> | null;
    active_variants?: Array<unknown> | null;
    tags?: string[] | null;
    updated_at?: string | null;
    created_at?: string | null;
}

interface MyProductsProps {
    projectIdentifier: string;
    ownerIdentifier: string | number;
    appCurrencySymbol?: string;
}

interface ManagedProductImage {
    id?: number;
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
    sort_order: number;
    file?: File;
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
    const [ordersProductId, setOrdersProductId] = useState<
        number | string | null
    >(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<
        number | string | null
    >(null);
    const [newProductImages, setNewProductImages] = useState<
        ManagedProductImage[]
    >([]);
    const [editProductImages, setEditProductImages] = useState<
        ManagedProductImage[]
    >([]);
    const [existingProductImages, setExistingProductImages] = useState<
        ManagedProductImage[]
    >([]);

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
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<MarketplaceProduct | null>(null);

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
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') ?? '';

            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value ?? '');
            });
            newProductImages.forEach((image) => {
                if (image.file) {
                    formData.append('images[]', image.file);
                }
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
                        'X-CSRF-TOKEN': csrfToken,
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
            setNewProductImages([]);
            fetchProducts();
        } catch (error) {
            toast.error('Unable to create product right now.');
        }
    };

    const handleEditProduct = (product: MarketplaceProduct) => {
        setEditingProduct(product);
        setData({
            name: product.name ?? '',
            description: product.description ?? '',
            price: product.price?.toString() ?? '',
            category: product.category ?? '',
            type: product.type ?? 'physical',
            status: product.status ?? 'draft',
            sku: product.sku ?? '',
            stock_quantity: product.stock_quantity?.toString() ?? '',
        });
        setExistingProductImages(
            (product.images ?? []).map((image, index) => ({
                id: image.id,
                image_url: image.image_url ?? '',
                alt_text: image.alt_text ?? '',
                is_primary:
                    image.is_primary !== undefined
                        ? image.is_primary
                        : index === 0,
                sort_order:
                    image.sort_order !== undefined
                        ? image.sort_order
                        : index,
            })),
        );
        setEditProductImages([]);
        setEditDialogOpen(true);
    };

    const handleUpdateProduct = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        if (!editingProduct) return;
        clearErrors();

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') ?? '';

            const formData = new FormData();
            // Add method override for Laravel to handle PUT with FormData
            formData.append('_method', 'PUT');
            
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });
            editProductImages.forEach((image) => {
                if (image.file) {
                    formData.append('images[]', image.file);
                }
            });

            // Use POST with _method=PUT for FormData (Laravel standard)
            const response = await fetch(
                route('customer.projects.marketplace.products.update', {
                    project: projectIdentifier,
                    owner: ownerIdentifier,
                    product: editingProduct.id,
                }),
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                },
            );

            if (!response.ok) {
                const payload = await response.json();
                toast.error(payload?.error ?? 'Failed to update product');
                return;
            }

            toast.success('Product updated successfully');
            setEditDialogOpen(false);
            setEditingProduct(null);
            reset();
            setEditProductImages([]);
            setExistingProductImages([]);
            fetchProducts();
        } catch (error) {
            toast.error('Unable to update product right now.');
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

    const loadOrders = useCallback(
        async (
            productId: number | string,
            productName: string = '',
            openDialog: boolean = false,
        ) => {
            if (openDialog) {
                setOrdersDialogOpen(true);
            }
            setOrdersLoading(true);
            setOrdersProductId(productId);
            if (productName) {
                setOrdersProductName(productName);
            }

            try {
                const response = await fetch(
                    route('customer.projects.marketplace.products.orders', {
                        project: projectIdentifier,
                        owner: ownerIdentifier,
                        product: productId,
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
                const normalizedOrders = Array.isArray(data) ? data : [];
                setOrders(normalizedOrders);
            } catch (error) {
                toast.error('Unable to load product orders right now.');
                if (openDialog) {
                    setOrdersDialogOpen(false);
                }
            } finally {
                setOrdersLoading(false);
            }
        },
        [ownerIdentifier, projectIdentifier],
    );

    const handleViewOrders = (product: MarketplaceProduct) => {
        loadOrders(product.id, product.name ?? '', true);
    };

    const handleOrderStatusUpdate = async (
        orderId: number | string,
        updates: { order_status?: string; payment_status?: string },
    ) => {
        if (!orderId) {
            toast.error('Missing order identifier.');
            return;
        }

        setUpdatingOrderId(orderId);

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') ?? '';

            const response = await fetch(
                route('customer.projects.marketplace.orders.update', {
                    project: projectIdentifier,
                    owner: ownerIdentifier,
                    order: orderId,
                }),
                {
                    method: 'PUT',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify(updates),
                },
            );

            const payload = await response
                .json()
                .catch(() => ({ error: 'Failed to process response' }));

            if (!response.ok) {
                throw new Error(
                    payload?.error ?? 'Failed to update order status',
                );
            }

            const updatedOrder =
                payload?.order ??
                payload?.data ??
                (payload && typeof payload === 'object' ? payload : null);

            if (updatedOrder) {
                const updatedIdentifier =
                    updatedOrder.id ??
                    updatedOrder.order_number ??
                    orderId;

                setOrders((previous) =>
                    previous.map((order) => {
                        const currentIdentifier =
                            order.id ?? order.order_number ?? '';

                        if (
                            String(currentIdentifier) ===
                            String(updatedIdentifier)
                        ) {
                            return { ...order, ...updatedOrder };
                        }

                        return order;
                    }),
                );
            } else if (ordersProductId) {
                await loadOrders(
                    ordersProductId,
                    ordersProductName,
                    false,
                );
            }

            toast.success('Order updated successfully.');
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Unable to update order status right now.',
            );
        } finally {
            setUpdatingOrderId(null);
        }
    };

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
                    <Button
                        onClick={() => {
                            setNewProductImages([]);
                            setCreateDialogOpen(true);
                        }}
                    >
                        Add Product
                    </Button>
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
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-700">
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Product
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Type
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        SKU
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Stock
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Price
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Created
                                    </TableHead>
                                    <TableHead className="text-right text-gray-900 dark:text-white">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => {
                                    const getProductImage = () => {
                                        if (product.thumbnail_url) {
                                            return product.thumbnail_url;
                                        }
                                        const primaryImage = product.images?.find(
                                            (img) => img.is_primary,
                                        );
                                        if (primaryImage) {
                                            return primaryImage.image_url;
                                        }
                                        return product.images?.[0]?.image_url;
                                    };

                                    const productImage = getProductImage();
                                    const variantsCount =
                                        product.active_variants?.length ?? 0;
                                    const stockQuantity =
                                        product.stock_quantity ?? 0;

                                    return (
                                        <TableRow
                                            key={product.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <div className="flex items-center gap-3">
                                                    {productImage ? (
                                                        <img
                                                            src={productImage}
                                                            alt={product.name}
                                                            className="h-12 w-12 rounded-md object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700">
                                                            <ImageIcon className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                            <div className="font-medium">
                                                {product.name}
                                            </div>
                                            {product.category && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {product.category}
                                                </div>
                                            )}
                                                        {variantsCount > 0 && (
                                                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                                <Package className="h-3 w-3" />
                                                                {variantsCount} variant
                                                                {variantsCount !== 1
                                                                    ? 's'
                                                                    : ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <Badge
                                                    variant="outline"
                                                    className="capitalize"
                                                >
                                                    {product.type ?? 'physical'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                            <Badge
                                                variant="secondary"
                                                className="capitalize"
                                            >
                                                {product.status ?? 'draft'}
                                            </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {product.sku ? (
                                                    <span className="text-sm font-mono">
                                                        {product.sku}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {stockQuantity > 0 ? (
                                                    <span className="text-sm">
                                                        {stockQuantity.toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        Out of Stock
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <span className="font-medium">
                                            {formattedCurrency(
                                                product.price ?? 0,
                                            )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {product.created_at
                                                ? formatDateTimeForDisplay(
                                                          product.created_at,
                                                      {
                                                          month: 'short',
                                                          day: 'numeric',
                                                          year: 'numeric',
                                                      },
                                                  )
                                                : '—'}
                                            </TableCell>
                                            <TableCell className="text-right text-gray-900 dark:text-white">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEditProduct(
                                                                product,
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
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
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                )}

                <ProductOrderHistory orders={orders} title="Recent Orders" />
            </CardContent>

            <Dialog
                open={createDialogOpen}
                onOpenChange={(open) => {
                    setCreateDialogOpen(open);
                    if (!open) {
                        reset();
                        setNewProductImages([]);
                    }
                }}
            >
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Create Product Listing</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProduct} className="space-y-4">
                        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
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
                        <ImageUploader
                            images={newProductImages}
                            onImagesChange={setNewProductImages}
                            maxImages={8}
                        />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setCreateDialogOpen(false);
                                    reset();
                                    setNewProductImages([]);
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

            <Dialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    if (!open) {
                        setEditingProduct(null);
                        reset();
                        setEditProductImages([]);
                        setExistingProductImages([]);
                    }
                }}
            >
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Edit Product Listing</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProduct} className="space-y-4">
                        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
                        <div>
                            <Label htmlFor="edit-product-name">Name</Label>
                            <Input
                                id="edit-product-name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-product-description">
                                Description
                            </Label>
                            <Textarea
                                id="edit-product-description"
                                rows={3}
                                value={data.description}
                                onChange={(event) =>
                                    setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="edit-product-price">Price</Label>
                                <Input
                                    id="edit-product-price"
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
                                <Label htmlFor="edit-product-stock">
                                    Stock Quantity
                                </Label>
                                <Input
                                    id="edit-product-stock"
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
                                <Label htmlFor="edit-product-category">
                                    Category
                                </Label>
                                <Input
                                    id="edit-product-category"
                                    value={data.category}
                                    onChange={(event) =>
                                        setData('category', event.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-product-status">
                                    Status
                                </Label>
                                <select
                                    id="edit-product-status"
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
                                <Label htmlFor="edit-product-type">Type</Label>
                                <select
                                    id="edit-product-type"
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
                                <Label htmlFor="edit-product-sku">SKU</Label>
                                <Input
                                    id="edit-product-sku"
                                    value={data.sku}
                                    onChange={(event) =>
                                        setData('sku', event.target.value)
                                    }
                                />
                            </div>
                        </div>
                        {existingProductImages.length > 0 && (
                            <div className="space-y-2">
                                <Label>Current Images</Label>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                    {existingProductImages.map((image) => (
                                        <div
                                            key={image.id ?? image.sort_order}
                                            className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                                        >
                                            <img
                                                src={image.image_url}
                                                alt={
                                                    image.alt_text ||
                                                    'Existing product image'
                                                }
                                                className="h-28 w-full object-cover"
                                            />
                                            {image.is_primary && (
                                                <Badge className="absolute left-2 top-2 bg-yellow-500 text-xs font-semibold text-white hover:bg-yellow-500">
                                                    Primary
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Uploading new images will append them to this
                                    product after saving.
                                </p>
                            </div>
                        )}
                        <ImageUploader
                            images={editProductImages}
                            onImagesChange={setEditProductImages}
                            maxImages={8}
                        />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setEditDialogOpen(false);
                                    setEditingProduct(null);
                                    reset();
                                    setEditProductImages([]);
                                    setExistingProductImages([]);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Product'}
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
                isLoading={ordersLoading}
                onUpdateOrderStatus={handleOrderStatusUpdate}
                updatingOrderId={updatingOrderId}
            />
        </Card>
    );
}
