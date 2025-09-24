import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    EyeOff,
    Package,
    Plus,
    Save,
    ShoppingCart,
    Tag,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ProductOrders from './ProductOrders';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number | string;
    category: string;
    type: 'physical' | 'digital' | 'service' | 'subscription';
    sku: string | null;
    stock_quantity: number | null;
    weight: number | null;
    dimensions: string | null;
    file_url: string | null;
    thumbnail_url: string | null;
    status: 'draft' | 'published' | 'archived' | 'inactive';
    tags: string[] | null;
    metadata: any;
    client_identifier: string;
    created_at: string;
    updated_at: string;
    images?: Array<{
        id: number;
        image_url: string;
        alt_text?: string;
        is_primary: boolean;
        sort_order: number;
    }>;
    newImages?: File[]; // For storing new images to be uploaded
    active_variants?: Array<{
        id: number;
        sku?: string;
        price?: number;
        stock_quantity: number;
        weight?: number;
        dimensions?: string;
        thumbnail_url?: string;
        attributes: Record<string, string>;
        is_active: boolean;
    }>;
}

interface MyProductsProps {
    member: {
        id: number;
        identifier?: string;
    };
    appCurrency?: { code: string; symbol: string } | null;
    contactId?: number;
}

export default function MyProducts({
    member,
    appCurrency,
    contactId,
}: MyProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Edit form state
    const [editingProduct, setEditingProduct] = useState<number | null>(null);
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deletingImages, setDeletingImages] = useState<Set<number>>(
        new Set(),
    );

    // Image gallery state
    const [imageGalleries, setImageGalleries] = useState<
        Record<number, number>
    >({}); // productId -> currentImageIndex
    const [imageLoading, setImageLoading] = useState<Record<number, boolean>>(
        {},
    ); // productId -> loading state

    // Orders dialog state
    const [ordersDialogOpen, setOrdersDialogOpen] = useState(false);
    const [selectedProductForOrders, setSelectedProductForOrders] =
        useState<Product | null>(null);

    // Product orders state
    const [productOrdersCount, setProductOrdersCount] = useState<
        Record<number, number>
    >({});
    const [loadingOrdersCount, setLoadingOrdersCount] = useState(false);

    // Form state for creating new product
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        type: 'physical' as 'physical' | 'digital' | 'service' | 'subscription',
        sku: '',
        stock_quantity: '',
        weight: '',
        dimensions: '',
        status: 'draft' as 'draft' | 'published' | 'archived' | 'inactive',
        tags: [] as string[],
        images: [] as File[],
    });

    // Format price with currency
    const formatPrice = (price: number | string | null | undefined): string => {
        if (price === null || price === undefined) {
            const symbol = appCurrency?.symbol || '$';
            return `${symbol}0.00`;
        }
        const numericPrice =
            typeof price === 'string' ? parseFloat(price) || 0 : price;
        const symbol = appCurrency?.symbol || '$';
        return `${symbol}${numericPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            case 'archived':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
            case 'inactive':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        }
    };

    // Get type icon
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'physical':
                return <Package className="h-4 w-4" />;
            case 'digital':
                return <Eye className="h-4 w-4" />;
            case 'service':
                return <Tag className="h-4 w-4" />;
            case 'subscription':
                return <Calendar className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    // Get product image
    const getProductImage = (product: Product): string | null => {
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

    // Get current image for product gallery
    const getCurrentProductImage = (product: Product): string | null => {
        if (product.images && product.images.length > 0) {
            const sortedImages = [...product.images].sort(
                (a, b) => a.sort_order - b.sort_order,
            );
            const currentIndex = imageGalleries[product.id] || 0;
            return (
                sortedImages[currentIndex]?.image_url ||
                sortedImages[0]?.image_url
            );
        }
        return product.thumbnail_url;
    };

    // Get all images for product gallery
    const getProductImages = (
        product: Product,
    ): Array<{ id: number; image_url: string; alt_text?: string }> => {
        if (product.images && product.images.length > 0) {
            return [...product.images].sort(
                (a, b) => a.sort_order - b.sort_order,
            );
        }
        return [];
    };

    // Navigate to next image
    const nextImage = (productId: number) => {
        const product = products.find((p) => p.id === productId);
        if (!product || !product.images || product.images.length <= 1) return;

        const currentIndex = imageGalleries[productId] || 0;
        const nextIndex = (currentIndex + 1) % product.images.length;
        console.log(
            `Next image: Product ${productId}, Current: ${currentIndex}, Next: ${nextIndex}`,
        );
        setImageLoadingState(productId, true);
        setImageGalleries((prev) => ({ ...prev, [productId]: nextIndex }));
    };

    // Navigate to previous image
    const prevImage = (productId: number) => {
        const product = products.find((p) => p.id === productId);
        if (!product || !product.images || product.images.length <= 1) return;

        const currentIndex = imageGalleries[productId] || 0;
        const prevIndex =
            currentIndex === 0 ? product.images.length - 1 : currentIndex - 1;
        console.log(
            `Prev image: Product ${productId}, Current: ${currentIndex}, Prev: ${prevIndex}`,
        );
        setImageLoadingState(productId, true);
        setImageGalleries((prev) => ({ ...prev, [productId]: prevIndex }));
    };

    // Go to specific image
    const goToImage = (productId: number, index: number) => {
        const product = products.find((p) => p.id === productId);
        if (
            !product ||
            !product.images ||
            index < 0 ||
            index >= product.images.length
        )
            return;

        console.log(`Go to image: Product ${productId}, Index: ${index}`);
        setImageLoadingState(productId, true);
        setImageGalleries((prev) => ({ ...prev, [productId]: index }));
    };

    // Handle keyboard navigation for image galleries
    const handleImageGalleryKeyDown = (
        e: React.KeyboardEvent,
        productId: number,
    ) => {
        const product = products.find((p) => p.id === productId);
        if (!product || !product.images || product.images.length <= 1) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                prevImage(productId);
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextImage(productId);
                break;
            case 'Home':
                e.preventDefault();
                goToImage(productId, 0);
                break;
            case 'End':
                e.preventDefault();
                goToImage(productId, product.images.length - 1);
                break;
        }
    };

    // Handle image loading
    const handleImageLoad = (productId: number) => {
        setImageLoading((prev) => ({ ...prev, [productId]: false }));
    };

    const handleImageError = (productId: number) => {
        setImageLoading((prev) => ({ ...prev, [productId]: false }));
    };

    const setImageLoadingState = (productId: number, loading: boolean) => {
        setImageLoading((prev) => ({ ...prev, [productId]: loading }));
    };

    // Handle product deletion
    const handleDelete = async (productId: number) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return;

        const productName = product.name;
        if (
            !confirm(
                `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
            )
        ) {
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch(
                `/m/${member.identifier || member.id}/products/${productId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            if (response.ok) {
                setProducts((prev) => prev.filter((p) => p.id !== productId));
                // Remove from product orders count
                setProductOrdersCount((prev) => {
                    const newCounts = { ...prev };
                    delete newCounts[productId];
                    return newCounts;
                });
                // Close edit mode if the deleted product was being edited
                if (editingProduct === productId) {
                    setEditingProduct(null);
                    clearEditNewImages();
                }
                setSuccessMessage(
                    `Product "${productName}" deleted successfully.`,
                );
            } else {
                setError('Failed to delete product');
            }
        } catch (err) {
            setError('An error occurred while deleting the product');
        } finally {
            setDeleting(false);
        }
    };

    // Handle form field changes
    const handleFormChange = (field: string, value: any) => {
        setNewProduct((prev) => ({ ...prev, [field]: value }));
    };

    // Handle form submission
    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setCreateError(null);

        try {
            const formData = new FormData();

            // Add basic product data
            formData.append('name', newProduct.name);
            formData.append('description', newProduct.description);
            formData.append(
                'price',
                (parseFloat(newProduct.price) || 0).toString(),
            );
            formData.append('category', newProduct.category);
            formData.append('type', newProduct.type);
            formData.append('sku', newProduct.sku);
            formData.append(
                'stock_quantity',
                newProduct.stock_quantity ? newProduct.stock_quantity : '',
            );
            formData.append(
                'weight',
                newProduct.weight ? newProduct.weight : '',
            );
            formData.append('dimensions', newProduct.dimensions);
            formData.append('status', newProduct.status);
            formData.append('contact_id', contactId?.toString() || '');

            // Add tags as JSON string
            if (newProduct.tags.length > 0) {
                formData.append('tags', JSON.stringify(newProduct.tags));
            }

            // Add images
            newProduct.images.forEach((image, index) => {
                formData.append(`images[${index}]`, image);
            });

            const response = await fetch(
                `/m/${member.identifier || member.id}/products`,
                {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: formData,
                },
            );

            if (response.ok) {
                const createdProduct = await response.json();
                setProducts((prev) => [createdProduct, ...prev]);
                // Initialize order count for new product
                setProductOrdersCount((prev) => ({
                    ...prev,
                    [createdProduct.id]: 0,
                }));
                setShowCreateForm(false);
                setNewProduct({
                    name: '',
                    description: '',
                    price: '',
                    category: '',
                    type: 'physical',
                    sku: '',
                    stock_quantity: '',
                    weight: '',
                    dimensions: '',
                    status: 'draft',
                    tags: [],
                    images: [],
                });
            } else {
                const errorData = await response.json();
                setCreateError(errorData.error || 'Failed to create product');
            }
        } catch (err) {
            setCreateError('An error occurred while creating the product');
        } finally {
            setCreating(false);
        }
    };

    // Handle edit form changes
    const handleEditFormChange = (field: string, value: any) => {
        setProducts((prev) =>
            prev.map((p) =>
                p.id === editingProduct ? { ...p, [field]: value } : p,
            ),
        );
    };

    // Handle edit product
    const handleEditProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        setUpdating(true);
        setUpdateError(null);

        const product = products.find((p) => p.id === editingProduct);
        if (!product) return;

        try {
            // First, update the product data using PUT
            const response = await fetch(
                `/m/${member.identifier || member.id}/products/${editingProduct}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        name: product.name,
                        description: product.description,
                        price:
                            typeof product.price === 'string'
                                ? parseFloat(product.price) || 0
                                : product.price,
                        category: product.category,
                        type: product.type,
                        sku: product.sku,
                        stock_quantity: product.stock_quantity,
                        weight: product.weight,
                        dimensions: product.dimensions,
                        status: product.status,
                        tags: product.tags || [],
                    }),
                },
            );

            if (response.ok) {
                // Check if there are any new images to upload
                const newImages = product.newImages || [];

                if (newImages.length > 0) {
                    // Upload the new images
                    const formData = new FormData();

                    // Add each new image file to the form data
                    newImages.forEach((file, index) => {
                        formData.append(`images[${index}]`, file);
                    });

                    // Upload the images
                    const imageUploadResponse = await fetch(
                        `/m/${member.identifier || member.id}/products/${editingProduct}/images`,
                        {
                            method: 'POST',
                            headers: {
                                'X-CSRF-TOKEN':
                                    document
                                        .querySelector(
                                            'meta[name="csrf-token"]',
                                        )
                                        ?.getAttribute('content') || '',
                            },
                            body: formData,
                        },
                    );

                    if (!imageUploadResponse.ok) {
                        console.warn(
                            'Failed to upload new images:',
                            await imageUploadResponse.text(),
                        );
                    }
                }

                setEditingProduct(null);
                // Clear newImages after successful update
                setProducts((prev) =>
                    prev.map((p) =>
                        p.id === editingProduct ? { ...p, newImages: [] } : p,
                    ),
                );
                // Refresh the products list to get the updated data
                const refreshResponse = await fetch(
                    `/m/${member.identifier || member.id}/products?contact_id=${contactId}`,
                );
                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    setProducts(data);
                }
            } else {
                const errorData = await response.json();
                setUpdateError(errorData.error || 'Failed to update product');
            }
        } catch (err) {
            setUpdateError('An error occurred while updating the product');
        } finally {
            setUpdating(false);
        }
    };

    // Handle status toggle
    const handleStatusToggle = async (
        productId: number,
        currentStatus: string,
    ) => {
        const newStatus =
            currentStatus === 'published' ? 'inactive' : 'published';

        try {
            const response = await fetch(
                `/m/${member.identifier || member.id}/products/${productId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ status: newStatus }),
                },
            );

            if (response.ok) {
                setProducts((prev) =>
                    prev.map((p) =>
                        p.id === productId
                            ? { ...p, status: newStatus as any }
                            : p,
                    ),
                );
            } else {
                setError('Failed to update product status');
            }
        } catch (err) {
            setError('An error occurred while updating the product status');
        }
    };

    // Handle image upload for create form
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setNewProduct((prev) => ({
                ...prev,
                images: [...prev.images, ...files],
            }));
        }
    };

    // Handle image removal for create form
    const handleImageRemove = (index: number) => {
        setNewProduct((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    // Handle image upload for edit form
    const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            // Store the actual files for later upload
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === editingProduct
                        ? {
                              ...p,
                              newImages: [...(p.newImages || []), ...files],
                          }
                        : p,
                ),
            );
        }
    };

    // Handle image removal for edit form
    const handleEditImageRemove = async (imageId: number) => {
        if (!editingProduct) return;

        const product = products.find((p) => p.id === editingProduct);
        if (!product) return;

        const image = product.images?.find((img) => img.id === imageId);
        if (!image) return;

        const imageName = image.alt_text || `Image ${imageId}`;
        if (
            !confirm(
                `Are you sure you want to delete "${imageName}"? This action cannot be undone.`,
            )
        ) {
            return;
        }

        // Add image to deleting set
        setDeletingImages((prev) => new Set(prev).add(imageId));

        try {
            const response = await fetch(
                `/m/${member.identifier || member.id}/products/${editingProduct}/images/${imageId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            if (response.ok) {
                // Update local state to remove the image
                setProducts((prev) =>
                    prev.map((p) =>
                        p.id === editingProduct
                            ? {
                                  ...p,
                                  images:
                                      p.images?.filter(
                                          (img) => img.id !== imageId,
                                      ) || [],
                              }
                            : p,
                    ),
                );
                setSuccessMessage(`Image "${imageName}" deleted successfully`);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to delete image');
            }
        } catch (err) {
            setError('An error occurred while deleting the image');
        } finally {
            // Remove image from deleting set
            setDeletingImages((prev) => {
                const newSet = new Set(prev);
                newSet.delete(imageId);
                return newSet;
            });
        }
    };

    // Handle removal of new images (not yet uploaded)
    const handleEditNewImageRemove = (index: number) => {
        setProducts((prev) =>
            prev.map((p) =>
                p.id === editingProduct
                    ? {
                          ...p,
                          newImages:
                              p.newImages?.filter((_, i) => i !== index) || [],
                      }
                    : p,
            ),
        );
    };

    // Clear new images when editing is cancelled
    const clearEditNewImages = () => {
        setProducts((prev) =>
            prev.map((p) =>
                p.id === editingProduct
                    ? {
                          ...p,
                          newImages: [],
                      }
                    : p,
            ),
        );
    };

    // Auto-dismiss success message
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000); // Auto-dismiss after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Fetch order count for a product
    const fetchProductOrderCount = async (productId: number) => {
        if (!contactId) return;

        try {
            const params = new URLSearchParams({
                client_identifier: member.identifier || member.id.toString(),
                contact_id: contactId.toString(),
                status: 'pending', // Only count pending orders
                page: '1',
                per_page: '1', // We only need to know if there are any orders
            });

            const response = await fetch(
                `/m/${member.identifier || member.id}/products/${productId}/orders?${params}`,
            );
            if (response.ok) {
                const data = await response.json();
                const totalOrders = data.total || 0;
                setProductOrdersCount((prev) => ({
                    ...prev,
                    [productId]: totalOrders,
                }));
            }
        } catch (err) {
            console.error(
                `Failed to fetch order count for product ${productId}:`,
                err,
            );
        }
    };

    // Fetch order counts for all products
    const fetchAllProductOrderCounts = async () => {
        if (!contactId || products.length === 0) return;

        setLoadingOrdersCount(true);
        try {
            const promises = products.map((product) =>
                fetchProductOrderCount(product.id),
            );
            await Promise.all(promises);
        } catch (err) {
            console.error('Failed to fetch product order counts:', err);
        } finally {
            setLoadingOrdersCount(false);
        }
    };

    // Fetch user's products
    useEffect(() => {
        const fetchProducts = async () => {
            if (!contactId) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `/m/${member.identifier || member.id}/products?contact_id=${contactId}`,
                );
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                    // Set initial loading state for all products with images
                    const initialLoadingState: Record<number, boolean> = {};
                    data.forEach((product: Product) => {
                        if (product.images && product.images.length > 0) {
                            initialLoadingState[product.id] = true;
                        }
                    });
                    setImageLoading(initialLoadingState);
                } else {
                    setError('Failed to fetch products');
                }
            } catch (err) {
                setError('An error occurred while fetching products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [contactId, member.identifier, member.id]);

    // Fetch order counts when products are loaded
    useEffect(() => {
        if (products.length > 0 && !loading) {
            fetchAllProductOrderCounts();
        }
    }, [products, loading, contactId, member.identifier, member.id]);

    if (!contactId) {
        return (
            <div className="py-12 text-center text-muted-foreground">
                <svg
                    className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                </svg>
                <p className="text-lg font-medium">Authentication Required</p>
                <p className="text-sm">Please log in to manage your products</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="py-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">
                    Loading your products...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12 text-center text-destructive">
                <p className="text-lg font-medium">Error</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        My Products
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your products and track their performance
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="inline-flex items-center px-4 py-2"
                >
                    {showCreateForm ? (
                        <X className="mr-2 h-4 w-4" />
                    ) : (
                        <Plus className="mr-2 h-4 w-4" />
                    )}
                    {showCreateForm ? 'Cancel' : 'Add Product'}
                </Button>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="relative rounded-lg border border-green-200 bg-green-50 p-3 text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <p className="pr-8 text-sm">{successMessage}</p>
                    <button
                        onClick={() => setSuccessMessage(null)}
                        className="absolute right-2 top-2 text-green-400 hover:text-green-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="relative rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive">
                    <p className="pr-8 text-sm">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="absolute right-2 top-2 text-destructive hover:text-destructive/80"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Create Product Form */}
            {showCreateForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Create New Product
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleCreateProduct}
                            className="space-y-4"
                        >
                            {createError && (
                                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive">
                                    <p className="text-sm">{createError}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input
                                        id="name"
                                        value={newProduct.name}
                                        onChange={(e) =>
                                            handleFormChange(
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category">Category *</Label>
                                    <Input
                                        id="category"
                                        value={newProduct.category}
                                        onChange={(e) =>
                                            handleFormChange(
                                                'category',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter category"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="price">Price *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newProduct.price}
                                        onChange={(e) =>
                                            handleFormChange(
                                                'price',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="type">Product Type *</Label>
                                    <Select
                                        value={newProduct.type}
                                        onValueChange={(value) =>
                                            handleFormChange('type', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="physical">
                                                Physical
                                            </SelectItem>
                                            <SelectItem value="digital">
                                                Digital
                                            </SelectItem>
                                            <SelectItem value="service">
                                                Service
                                            </SelectItem>
                                            <SelectItem value="subscription">
                                                Subscription
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        value={newProduct.sku}
                                        onChange={(e) =>
                                            handleFormChange(
                                                'sku',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter SKU"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="stock_quantity">
                                        Stock Quantity
                                    </Label>
                                    <Input
                                        id="stock_quantity"
                                        type="number"
                                        min="0"
                                        value={newProduct.stock_quantity}
                                        onChange={(e) =>
                                            handleFormChange(
                                                'stock_quantity',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter stock quantity"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="weight">Weight (kg)</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newProduct.weight}
                                        onChange={(e) =>
                                            handleFormChange(
                                                'weight',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter weight"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="dimensions">
                                        Dimensions
                                    </Label>
                                    <Input
                                        id="dimensions"
                                        value={newProduct.dimensions}
                                        onChange={(e) =>
                                            handleFormChange(
                                                'dimensions',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., 10x5x2 cm"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="status">Status *</Label>
                                    <Select
                                        value={newProduct.status}
                                        onValueChange={(value) =>
                                            handleFormChange('status', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">
                                                Draft
                                            </SelectItem>
                                            <SelectItem
                                                value="published"
                                                disabled
                                            >
                                                Published
                                            </SelectItem>
                                            <SelectItem value="archived">
                                                Archived
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                Inactive
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div>
                                <Label htmlFor="images">Product Images</Label>
                                <div className="mt-2">
                                    <div className="flex w-full items-center justify-center">
                                        <label
                                            htmlFor="image-upload"
                                            className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted"
                                        >
                                            <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                                <Upload className="mb-4 h-8 w-8 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-muted-foreground">
                                                    <span className="font-semibold">
                                                        Click to upload
                                                    </span>{' '}
                                                    or drag and drop
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    PNG, JPG, GIF up to 10MB
                                                </p>
                                            </div>
                                            <input
                                                id="image-upload"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    </div>

                                    {/* Display uploaded images */}
                                    {newProduct.images.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="mb-2 text-sm font-medium text-foreground">
                                                Uploaded Images:
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                                {newProduct.images.map(
                                                    (image, index) => (
                                                        <div
                                                            key={index}
                                                            className="group relative"
                                                        >
                                                            <img
                                                                src={URL.createObjectURL(
                                                                    image,
                                                                )}
                                                                alt={`Preview ${index + 1}`}
                                                                className="h-20 w-full rounded-lg border border-border object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleImageRemove(
                                                                        index,
                                                                    )
                                                                }
                                                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground opacity-0 transition-opacity hover:bg-destructive/90 group-hover:opacity-100"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">
                                    Description *
                                </Label>
                                <Textarea
                                    id="description"
                                    value={newProduct.description}
                                    onChange={(e) =>
                                        handleFormChange(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter product description"
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateForm(false)}
                                    disabled={creating}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creating}>
                                    {creating ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary-foreground"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Create Product
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Products Tabs */}
            {products.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                    <svg
                        className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                    </svg>
                    <p className="text-lg font-medium">No products yet</p>
                    <p className="mb-4 text-sm">
                        Start by adding your first product to the marketplace
                    </p>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="inline-flex items-center"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Product
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <div key={product.id} className="space-y-4">
                                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                                    {/* Product Image Gallery */}
                                    <div
                                        className={`group relative aspect-square bg-muted ${
                                            getProductImages(product).length > 1
                                                ? 'cursor-pointer'
                                                : ''
                                        }`}
                                        tabIndex={
                                            getProductImages(product).length > 1
                                                ? 0
                                                : -1
                                        }
                                        onKeyDown={(e) =>
                                            handleImageGalleryKeyDown(
                                                e,
                                                product.id,
                                            )
                                        }
                                        onClick={() => {
                                            if (
                                                getProductImages(product)
                                                    .length > 1
                                            ) {
                                                nextImage(product.id);
                                            }
                                        }}
                                        role={
                                            getProductImages(product).length > 1
                                                ? 'region'
                                                : undefined
                                        }
                                        aria-label={
                                            getProductImages(product).length > 1
                                                ? `Product images for ${product.name}`
                                                : undefined
                                        }
                                    >
                                        {getCurrentProductImage(product) ? (
                                            <>
                                                <img
                                                    src={
                                                        getCurrentProductImage(
                                                            product,
                                                        )!
                                                    }
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                    onLoad={() =>
                                                        handleImageLoad(
                                                            product.id,
                                                        )
                                                    }
                                                    onError={() =>
                                                        handleImageError(
                                                            product.id,
                                                        )
                                                    }
                                                />
                                                {imageLoading[product.id] && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                                                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Package className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute right-2 top-2 z-10">
                                            <Badge
                                                className={`${getStatusColor(product.status)} border`}
                                            >
                                                {product.status}
                                            </Badge>
                                        </div>

                                        {/* Image Navigation Arrows */}
                                        {getProductImages(product).length >
                                            1 && (
                                            <>
                                                {/* Previous Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        prevImage(product.id);
                                                    }}
                                                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white shadow-lg transition-all duration-200 hover:bg-black/80"
                                                    aria-label="Previous image"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>

                                                {/* Next Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        nextImage(product.id);
                                                    }}
                                                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white shadow-lg transition-all duration-200 hover:bg-black/80"
                                                    aria-label="Next image"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}

                                        {/* Image Indicators */}
                                        {getProductImages(product).length >
                                            1 && (
                                            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
                                                {getProductImages(product).map(
                                                    (_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                goToImage(
                                                                    product.id,
                                                                    index,
                                                                );
                                                            }}
                                                            className={`h-3 w-3 rounded-full shadow-lg transition-all duration-200 ${
                                                                (imageGalleries[
                                                                    product.id
                                                                ] || 0) ===
                                                                index
                                                                    ? 'scale-110 bg-white'
                                                                    : 'bg-white/60 hover:scale-110 hover:bg-white/80'
                                                            }`}
                                                            aria-label={`Go to image ${index + 1}`}
                                                            aria-current={
                                                                (imageGalleries[
                                                                    product.id
                                                                ] || 0) ===
                                                                index
                                                                    ? 'true'
                                                                    : 'false'
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        )}

                                        {/* Image Counter */}
                                        {getProductImages(product).length >
                                            1 && (
                                            <div className="absolute left-3 top-3 z-10 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white shadow-lg">
                                                {(imageGalleries[product.id] ||
                                                    0) + 1}{' '}
                                                /{' '}
                                                {
                                                    getProductImages(product)
                                                        .length
                                                }
                                            </div>
                                        )}

                                        {/* Multiple Images Indicator */}
                                        {getProductImages(product).length >
                                            1 && (
                                            <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10">
                                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                    Click to browse images
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="p-3">
                                        {/* Product Info */}
                                        <div className="space-y-2">
                                            <div>
                                                <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
                                                    {product.name}
                                                </h3>
                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                    {product.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-1">
                                                    {getTypeIcon(product.type)}
                                                    <span className="text-xs capitalize text-muted-foreground">
                                                        {product.type}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-semibold text-foreground">
                                                    {formatPrice(product.price)}
                                                </div>
                                            </div>

                                            {/* Stock Info */}
                                            {product.stock_quantity !==
                                                null && (
                                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                                    <Package className="h-3 w-3" />
                                                    <span>
                                                        {product.stock_quantity >
                                                        0
                                                            ? `${product.stock_quantity.toLocaleString()} in stock`
                                                            : 'Out of stock'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Orders Info */}
                                            {loadingOrdersCount ? (
                                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                                    <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-muted-foreground"></div>
                                                    <span>
                                                        Loading orders...
                                                    </span>
                                                </div>
                                            ) : productOrdersCount[product.id] >
                                              0 ? (
                                                <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                                                    <ShoppingCart className="h-3 w-3" />
                                                    <span>
                                                        {
                                                            productOrdersCount[
                                                                product.id
                                                            ]
                                                        }{' '}
                                                        pending order
                                                        {productOrdersCount[
                                                            product.id
                                                        ] === 1
                                                            ? ''
                                                            : 's'}
                                                    </span>
                                                </div>
                                            ) : null}

                                            {/* Actions */}
                                            <div className="flex items-center space-x-1 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleStatusToggle(
                                                            product.id,
                                                            product.status,
                                                        )
                                                    }
                                                    className="h-7 flex-1 px-2 py-1 text-xs"
                                                >
                                                    {product.status ===
                                                    'published' ? (
                                                        <>
                                                            <EyeOff className="mr-1 h-3 w-3" />
                                                            Hide
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="mr-1 h-3 w-3" />
                                                            Publish
                                                        </>
                                                    )}
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (
                                                            product.status ===
                                                            'published'
                                                        ) {
                                                            setError(
                                                                'Cannot edit published products. Please change the status to draft first.',
                                                            );
                                                            return;
                                                        }
                                                        if (
                                                            editingProduct ===
                                                            product.id
                                                        ) {
                                                            setEditingProduct(
                                                                null,
                                                            );
                                                            clearEditNewImages();
                                                        } else {
                                                            setEditingProduct(
                                                                product.id,
                                                            );
                                                            // Clear any existing newImages when starting to edit
                                                            setProducts(
                                                                (prev) =>
                                                                    prev.map(
                                                                        (p) =>
                                                                            p.id ===
                                                                            product.id
                                                                                ? {
                                                                                      ...p,
                                                                                      newImages:
                                                                                          [],
                                                                                  }
                                                                                : p,
                                                                    ),
                                                            );
                                                        }
                                                    }}
                                                    className={`h-7 flex-1 px-2 py-1 text-xs ${
                                                        product.status ===
                                                        'published'
                                                            ? 'cursor-not-allowed opacity-50'
                                                            : ''
                                                    }`}
                                                    disabled={
                                                        product.status ===
                                                        'published'
                                                    }
                                                    title={
                                                        product.status ===
                                                        'published'
                                                            ? 'Cannot edit published products'
                                                            : 'Edit product'
                                                    }
                                                >
                                                    {editingProduct ===
                                                    product.id ? (
                                                        <>
                                                            <X className="mr-1 h-3 w-3" />
                                                            Cancel
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Edit className="mr-1 h-3 w-3" />
                                                            Edit
                                                        </>
                                                    )}
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedProductForOrders(
                                                            product,
                                                        );
                                                        setOrdersDialogOpen(
                                                            true,
                                                        );
                                                    }}
                                                    className="h-7 flex-1 px-2 py-1 text-xs"
                                                >
                                                    <ShoppingCart className="mr-1 h-3 w-3" />
                                                    Orders
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (
                                                            productOrdersCount[
                                                                product.id
                                                            ] > 0
                                                        ) {
                                                            setError(
                                                                `Cannot delete "${product.name}" because it has ${productOrdersCount[product.id]} pending order${productOrdersCount[product.id] === 1 ? '' : 's'}.`,
                                                            );
                                                            return;
                                                        }
                                                        handleDelete(
                                                            product.id,
                                                        );
                                                    }}
                                                    className={`h-7 px-2 py-1 ${
                                                        productOrdersCount[
                                                            product.id
                                                        ] > 0
                                                            ? 'cursor-not-allowed text-muted-foreground opacity-50'
                                                            : 'text-destructive hover:bg-destructive/10 hover:text-destructive'
                                                    }`}
                                                    disabled={
                                                        deleting ||
                                                        productOrdersCount[
                                                            product.id
                                                        ] > 0
                                                    }
                                                    title={
                                                        productOrdersCount[
                                                            product.id
                                                        ] > 0
                                                            ? `Cannot delete product with ${productOrdersCount[product.id]} pending order${productOrdersCount[product.id] === 1 ? '' : 's'}`
                                                            : 'Delete product'
                                                    }
                                                >
                                                    {deleting ? (
                                                        <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-destructive-foreground"></div>
                                                    ) : (
                                                        <Trash2 className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Edit Form */}
                                {editingProduct === product.id && (
                                    <Card className="mt-4">
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                Edit Product
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <form
                                                onSubmit={handleEditProduct}
                                                className="space-y-4"
                                            >
                                                {updateError && (
                                                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive">
                                                        {updateError}
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <Label
                                                            htmlFor={`edit-name-${product.id}`}
                                                        >
                                                            Name *
                                                        </Label>
                                                        <Input
                                                            id={`edit-name-${product.id}`}
                                                            value={product.name}
                                                            onChange={(e) =>
                                                                handleEditFormChange(
                                                                    'name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Enter product name"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label
                                                            htmlFor={`edit-category-${product.id}`}
                                                        >
                                                            Category *
                                                        </Label>
                                                        <Input
                                                            id={`edit-category-${product.id}`}
                                                            value={
                                                                product.category
                                                            }
                                                            onChange={(e) =>
                                                                handleEditFormChange(
                                                                    'category',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Enter product category"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label
                                                            htmlFor={`edit-price-${product.id}`}
                                                        >
                                                            Price *
                                                        </Label>
                                                        <Input
                                                            id={`edit-price-${product.id}`}
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={
                                                                product.price
                                                            }
                                                            onChange={(e) =>
                                                                handleEditFormChange(
                                                                    'price',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="0.00"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label
                                                            htmlFor={`edit-type-${product.id}`}
                                                        >
                                                            Type *
                                                        </Label>
                                                        <Select
                                                            value={product.type}
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                handleEditFormChange(
                                                                    'type',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select product type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="physical">
                                                                    Physical
                                                                </SelectItem>
                                                                <SelectItem value="digital">
                                                                    Digital
                                                                </SelectItem>
                                                                <SelectItem value="service">
                                                                    Service
                                                                </SelectItem>
                                                                <SelectItem value="subscription">
                                                                    Subscription
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label
                                                            htmlFor={`edit-sku-${product.id}`}
                                                        >
                                                            SKU
                                                        </Label>
                                                        <Input
                                                            id={`edit-sku-${product.id}`}
                                                            value={
                                                                product.sku ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                handleEditFormChange(
                                                                    'sku',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Enter SKU"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label
                                                            htmlFor={`edit-stock-${product.id}`}
                                                        >
                                                            Stock Quantity
                                                        </Label>
                                                        <Input
                                                            id={`edit-stock-${product.id}`}
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                product.stock_quantity ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                handleEditFormChange(
                                                                    'stock_quantity',
                                                                    e.target
                                                                        .value
                                                                        ? parseInt(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          )
                                                                        : null,
                                                                )
                                                            }
                                                            placeholder="Enter stock quantity"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label
                                                            htmlFor={`edit-weight-${product.id}`}
                                                        >
                                                            Weight (kg)
                                                        </Label>
                                                        <Input
                                                            id={`edit-weight-${product.id}`}
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={
                                                                product.weight ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                handleEditFormChange(
                                                                    'weight',
                                                                    e.target
                                                                        .value
                                                                        ? parseFloat(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          )
                                                                        : null,
                                                                )
                                                            }
                                                            placeholder="Enter weight"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label
                                                            htmlFor={`edit-dimensions-${product.id}`}
                                                        >
                                                            Dimensions
                                                        </Label>
                                                        <Input
                                                            id={`edit-dimensions-${product.id}`}
                                                            value={
                                                                product.dimensions ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                handleEditFormChange(
                                                                    'dimensions',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="e.g., 10x5x2 cm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label
                                                            htmlFor={`edit-status-${product.id}`}
                                                        >
                                                            Status *
                                                        </Label>
                                                        <Select
                                                            value={
                                                                product.status
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                handleEditFormChange(
                                                                    'status',
                                                                    value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="draft">
                                                                    Draft
                                                                </SelectItem>
                                                                <SelectItem
                                                                    value="published"
                                                                    disabled
                                                                >
                                                                    Published
                                                                </SelectItem>
                                                                <SelectItem value="archived">
                                                                    Archived
                                                                </SelectItem>
                                                                <SelectItem value="inactive">
                                                                    Inactive
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                {/* Image Upload Section for Edit */}
                                                <div>
                                                    <Label
                                                        htmlFor={`edit-images-${product.id}`}
                                                    >
                                                        Product Images
                                                    </Label>
                                                    <div className="mt-2">
                                                        {/* Current Images */}
                                                        {product.images &&
                                                            product.images
                                                                .length > 0 && (
                                                                <div className="mb-4">
                                                                    <h4 className="mb-2 text-sm font-medium text-foreground">
                                                                        Current
                                                                        Images:
                                                                    </h4>
                                                                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                                                        {product.images.map(
                                                                            (
                                                                                image,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        image.id
                                                                                    }
                                                                                    className="group relative"
                                                                                >
                                                                                    <img
                                                                                        src={
                                                                                            image.image_url
                                                                                        }
                                                                                        alt={
                                                                                            image.alt_text ||
                                                                                            'Product image'
                                                                                        }
                                                                                        className="h-20 w-full rounded-lg border border-border object-cover"
                                                                                    />
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            handleEditImageRemove(
                                                                                                image.id,
                                                                                            )
                                                                                        }
                                                                                        disabled={deletingImages.has(
                                                                                            image.id,
                                                                                        )}
                                                                                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground opacity-0 transition-opacity hover:bg-destructive/90 disabled:opacity-100 group-hover:opacity-100"
                                                                                    >
                                                                                        {deletingImages.has(
                                                                                            image.id,
                                                                                        ) ? (
                                                                                            <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-destructive-foreground"></div>
                                                                                        ) : (
                                                                                            <X className="h-3 w-3" />
                                                                                        )}
                                                                                    </button>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                        {/* New Images to be uploaded */}
                                                        {product.newImages &&
                                                            product.newImages
                                                                .length > 0 && (
                                                                <div className="mb-4">
                                                                    <h4 className="mb-2 text-sm font-medium text-foreground">
                                                                        New
                                                                        Images
                                                                        to
                                                                        Upload:
                                                                    </h4>
                                                                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                                                        {product.newImages.map(
                                                                            (
                                                                                file,
                                                                                index,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className="group relative"
                                                                                >
                                                                                    <img
                                                                                        src={URL.createObjectURL(
                                                                                            file,
                                                                                        )}
                                                                                        alt={
                                                                                            file.name
                                                                                        }
                                                                                        className="h-20 w-full rounded-lg border border-border object-cover"
                                                                                    />
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            handleEditNewImageRemove(
                                                                                                index,
                                                                                            )
                                                                                        }
                                                                                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground opacity-0 transition-opacity hover:bg-destructive/90 group-hover:opacity-100"
                                                                                    >
                                                                                        <X className="h-3 w-3" />
                                                                                    </button>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                        {/* Upload New Images */}
                                                        <div className="flex w-full items-center justify-center">
                                                            <label
                                                                htmlFor={`edit-image-upload-${product.id}`}
                                                                className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted"
                                                            >
                                                                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                                                    <Upload className="mb-4 h-8 w-8 text-muted-foreground" />
                                                                    <p className="mb-2 text-sm text-muted-foreground">
                                                                        <span className="font-semibold">
                                                                            Click
                                                                            to
                                                                            upload
                                                                        </span>{' '}
                                                                        or drag
                                                                        and drop
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        PNG,
                                                                        JPG, GIF
                                                                        up to
                                                                        10MB
                                                                    </p>
                                                                </div>
                                                                <input
                                                                    id={`edit-image-upload-${product.id}`}
                                                                    type="file"
                                                                    multiple
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={
                                                                        handleEditImageUpload
                                                                    }
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label
                                                        htmlFor={`edit-description-${product.id}`}
                                                    >
                                                        Description *
                                                    </Label>
                                                    <Textarea
                                                        id={`edit-description-${product.id}`}
                                                        value={
                                                            product.description
                                                        }
                                                        onChange={(e) =>
                                                            handleEditFormChange(
                                                                'description',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Enter product description"
                                                        rows={4}
                                                        required
                                                    />
                                                </div>
                                                <div className="flex justify-end space-x-3">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingProduct(
                                                                null,
                                                            );
                                                            clearEditNewImages();
                                                        }}
                                                        disabled={
                                                            updating || deleting
                                                        }
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={
                                                            updating || deleting
                                                        }
                                                    >
                                                        {updating ? (
                                                            <>
                                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary-foreground"></div>
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save className="mr-2 h-4 w-4" />
                                                                Update Product
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Orders Dialog */}
            <Dialog
                open={ordersDialogOpen}
                onOpenChange={(open) => {
                    setOrdersDialogOpen(open);
                    // Refresh order count when dialog is closed
                    if (!open && selectedProductForOrders) {
                        fetchProductOrderCount(selectedProductForOrders.id);
                    }
                }}
            >
                <DialogContent className="m-0 flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-lg">
                    <DialogHeader className="flex-shrink-0 pb-4">
                        <DialogTitle className="flex items-center">
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Orders for {selectedProductForOrders?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden">
                        {selectedProductForOrders && (
                            <ProductOrders
                                member={member}
                                appCurrency={appCurrency}
                                contactId={contactId}
                                productId={selectedProductForOrders.id}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
