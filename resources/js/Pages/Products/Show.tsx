import { useCart } from '@/Components/CartContext';
import ReviewList from '@/Components/ReviewList';
import ReviewSummary from '@/Components/ReviewSummary';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import VariantSelector from '@/Components/VariantSelector';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Project, User } from '@/types/index';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle,
    Download,
    Edit,
    Heart,
    Package,
    RefreshCw,
    RotateCcw,
    Settings,
    Share2,
    Shield,
    ShoppingCart,
    Star,
    Trash2,
    Truck,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface Variant {
    id: number;
    sku?: string;
    price?: number;
    stock_quantity: number;
    weight?: number;
    dimensions?: string;
    thumbnail_url?: string;
    attributes: Record<string, string>;
    is_active: boolean;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    type: 'physical' | 'digital' | 'service' | 'subscription';
    status: 'draft' | 'published' | 'archived' | 'inactive';
    sku?: string;
    stock_quantity?: number;
    weight?: number;
    dimensions?: string;
    thumbnail_url?: string;
    file_url?: string;
    tags: string[];
    images?: Array<{
        id: number;
        image_url: string;
        alt_text?: string;
        is_primary: boolean;
        sort_order: number;
    }>;
    active_variants?: Variant[];
    // Review-related fields
    average_rating?: number;
    reviews_count?: number;
    rating_distribution?: { [key: number]: number };
    created_at: string;
    updated_at: string;
}

interface Props {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
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
    };
    product: Product;
    currency: {
        symbol: string;
        code: string;
    };
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'physical':
            return <Package className="h-4 w-4" />;
        case 'digital':
            return <Download className="h-4 w-4" />;
        case 'service':
            return <Settings className="h-4 w-4" />;
        case 'subscription':
            return <RefreshCw className="h-4 w-4" />;
        default:
            return <Package className="h-4 w-4" />;
    }
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'physical':
            return 'Physical';
        case 'digital':
            return 'Digital';
        case 'service':
            return 'Service';
        case 'subscription':
            return 'Subscription';
        default:
            return type;
    }
};

const getStockStatus = (quantity?: number, type?: string) => {
    if (type === 'digital' || type === 'service' || type === 'subscription') {
        return (
            <Badge
                variant="secondary"
                className="border-green-200 bg-green-100 text-green-800 dark:border-green-700/50 dark:bg-green-900/30 dark:text-green-200"
            >
                Unlimited
            </Badge>
        );
    }

    if (quantity === undefined || quantity === null) {
        return (
            <Badge
                variant="secondary"
                className="border-gray-200 bg-gray-100 text-gray-800 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-200"
            >
                N/A
            </Badge>
        );
    }

    if (quantity === 0) {
        return (
            <Badge
                variant="destructive"
                className="border-red-200 bg-red-100 text-red-800 dark:border-red-700/50 dark:bg-red-900/30 dark:text-red-200"
            >
                Out of Stock
            </Badge>
        );
    }

    if (quantity <= 10) {
        return (
            <Badge
                variant="secondary"
                className="border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-700/50 dark:bg-yellow-900/30 dark:text-yellow-200"
            >
                Low Stock ({quantity})
            </Badge>
        );
    }

    return (
        <Badge
            variant="default"
            className="border-green-200 bg-green-100 text-green-800 dark:border-green-700/50 dark:bg-green-900/30 dark:text-green-200"
        >
            In Stock ({quantity})
        </Badge>
    );
};

const getProductImages = (product: Product) => {
    const images: string[] = [];

    // Add images from the images array (sorted by sort_order)
    if (product.images && product.images.length > 0) {
        const sortedImages = [...product.images].sort(
            (a, b) => a.sort_order - b.sort_order,
        );
        sortedImages.forEach((img) => {
            if (img.image_url) {
                images.push(img.image_url);
            }
        });
    }

    // Add thumbnail_url if no images array or as fallback
    if (product.thumbnail_url && !images.includes(product.thumbnail_url)) {
        images.push(product.thumbnail_url);
    }

    return images;
};

export default function Show({ auth, product, currency }: Props) {
    const {
        state: cartState,
        addItem,
        updateQuantity,
        removeItem,
        getItemQuantity,
    } = useCart();
    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Review state
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewStats, setReviewStats] = useState({
        average_rating: product.average_rating || 0,
        total_reviews: product.reviews_count || 0,
        rating_distribution: product.rating_distribution || {},
        verified_purchase_count: 0,
        featured_reviews_count: 0,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [reviewFilters, setReviewFilters] = useState({});
    const [reviewSort, setReviewSort] = useState('recent');

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const canModerate = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    // Debug logging
    console.log('Product Show Page Debug:', {
        productId: product.id,
        productName: product.name,
        hasActiveVariants: !!product.active_variants,
        activeVariantsCount: product.active_variants?.length || 0,
        activeVariants: product.active_variants,
        productType: product.type,
        productStatus: product.status,
    });

    const handleAddToCart = (variantId: number, quantity: number) => {
        const variant = product.active_variants?.find(
            (v) => v.id === variantId,
        );
        if (!variant) return;

        const effectivePrice = variant.price || product.price;
        const itemName = `${product.name} (${Object.values(variant.attributes).join(', ')})`;

        addItem({
            productId: product.id,
            variantId: variantId,
            id: product.id,
            name: itemName,
            quantity: quantity,
            price: effectivePrice,
            type: product.type,
            weight: variant.weight || product.weight || 0,
            attributes: variant.attributes,
            thumbnail_url:
                variant.thumbnail_url ||
                getProductImages(product)[0] ||
                product.thumbnail_url,
        });
    };

    const handleAddSimpleProduct = () => {
        addItem({
            productId: product.id,
            variantId: 0, // 0 indicates no variant
            id: product.id,
            name: product.name,
            quantity: 1,
            price: product.price,
            type: product.type,
            weight: product.weight || 0,
            thumbnail_url:
                getProductImages(product)[0] || product.thumbnail_url,
        });
    };

    const hasVariants =
        product.active_variants && product.active_variants.length > 0;
    const activeVariants = product.active_variants || [];

    // Debug logging for variant logic
    console.log('Variant Logic Debug:', {
        hasVariants,
        activeVariantsCount: activeVariants.length,
        activeVariants,
        shouldShowVariantSelector: hasVariants && product.type === 'physical',
        shouldShowSimpleAddToCart:
            !hasVariants &&
            product.type === 'physical' &&
            product.status === 'published',
    });

    // Get all available images for the product
    const productImages = getProductImages(product);

    // Create image array (product images + variant images)
    const images = [
        ...productImages,
        ...(activeVariants?.map((v) => v.thumbnail_url).filter(Boolean) || []),
    ].filter(Boolean);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            // You could add a toast notification here
        }
    };

    // Review API functions
    const fetchReviews = async (page = 1, filters = {}, sort = 'recent') => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                sort: sort,
                ...filters,
            });

            // If user can moderate, include pending reviews (approved=false)
            if (canModerate) {
                params.append('approved', 'false');
            }

            const response = await fetch(
                `/products/${product.id}/reviews?${params}`,
                {
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
                const data = await response.json();
                setReviews(data.reviews);
                setReviewStats(data.summary);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    // Load reviews on component mount
    React.useEffect(() => {
        fetchReviews(1, {}, 'recent');
    }, [product.id]);

    return (
        <AuthenticatedLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                router.visit(route('products.index'))
                            }
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Products</span>
                        </Button>
                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600/50" />
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-100">
                            Product Details
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className={
                                isWishlisted
                                    ? 'text-red-500 dark:text-red-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }
                        >
                            <Heart
                                className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`}
                            />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShare}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                        {canEdit && (
                            <Link href={route('products.edit', product.id)}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-600/50 dark:bg-gray-800 dark:hover:bg-gray-700"
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${product.name} - Product`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="mb-8 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Link
                            href={route('products.index')}
                            className="hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            Products
                        </Link>
                        <span>/</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {product.name}
                        </span>
                    </nav>

                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                        {/* Product Images */}
                        <div className="space-y-6">
                            {/* Main Image */}
                            <div className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-lg dark:border-gray-700/50 dark:bg-gray-800/50">
                                {images.length > 0 ? (
                                    <>
                                        <img
                                            src={images[selectedImage]}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                        {/* Navigation Arrows */}
                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        setSelectedImage(
                                                            selectedImage === 0
                                                                ? images.length -
                                                                      1
                                                                : selectedImage -
                                                                      1,
                                                        )
                                                    }
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                                                >
                                                    <svg
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 19l-7-7 7-7"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setSelectedImage(
                                                            selectedImage ===
                                                                images.length -
                                                                    1
                                                                ? 0
                                                                : selectedImage +
                                                                      1,
                                                        )
                                                    }
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                                                >
                                                    <svg
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                        {/* Image Counter */}
                                        {images.length > 1 && (
                                            <div className="absolute right-4 top-4 rounded-full bg-black/50 px-2 py-1 text-sm text-white">
                                                {selectedImage + 1} /{' '}
                                                {images.length}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800/50 dark:to-gray-700/50">
                                        <Package className="h-24 w-24 text-gray-400 dark:text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Images */}
                            {images.length > 1 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Product Images ({images.length})
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {selectedImage + 1} of{' '}
                                            {images.length}
                                        </span>
                                    </div>
                                    <div className="flex space-x-3 overflow-x-auto pb-2">
                                        {images.map((image, index) => {
                                            // Check if this is a product image or variant image
                                            const isProductImage =
                                                index < productImages.length;
                                            const imageInfo =
                                                isProductImage && product.images
                                                    ? product.images.find(
                                                          (img) =>
                                                              img.image_url ===
                                                              image,
                                                      )
                                                    : null;

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        setSelectedImage(index)
                                                    }
                                                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                                                        selectedImage === index
                                                            ? 'border-blue-500 shadow-md dark:border-blue-400'
                                                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600/50 dark:hover:border-gray-500/70'
                                                    }`}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={
                                                            imageInfo?.alt_text ||
                                                            `${product.name} ${index + 1}`
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                    {/* Image type indicator */}
                                                    {isProductImage &&
                                                        imageInfo?.is_primary && (
                                                            <div className="absolute left-1 top-1 rounded bg-blue-500 px-1 py-0.5 text-xs text-white">
                                                                Primary
                                                            </div>
                                                        )}
                                                    {!isProductImage && (
                                                        <div className="absolute left-1 top-1 rounded bg-purple-500 px-1 py-0.5 text-xs text-white">
                                                            Variant
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Image Information */}
                            {(() => {
                                const currentImageIndex = selectedImage;
                                const isProductImage =
                                    currentImageIndex < productImages.length;
                                const imageInfo =
                                    isProductImage && product.images
                                        ? product.images.find(
                                              (img) =>
                                                  img.image_url ===
                                                  images[currentImageIndex],
                                          )
                                        : null;

                                if (imageInfo?.alt_text) {
                                    return (
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700/50 dark:bg-gray-800/50">
                                            <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                                                Image Details
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {imageInfo.alt_text}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Badge
                                        variant={
                                            product.status === 'published'
                                                ? 'default'
                                                : product.status === 'draft'
                                                  ? 'secondary'
                                                  : product.status ===
                                                      'inactive'
                                                    ? 'outline'
                                                    : 'destructive'
                                        }
                                        className="text-sm"
                                    >
                                        {product.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            product.status.slice(1)}
                                    </Badge>
                                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-300">
                                        {getTypeIcon(product.type)}
                                        <span>
                                            {getTypeLabel(product.type)}
                                        </span>
                                    </div>
                                </div>
                                {product.type === 'digital' &&
                                    product.file_url && (
                                        <Link
                                            href={route(
                                                'products.download',
                                                product.id,
                                            )}
                                        >
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                        </Link>
                                    )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-8">
                            {/* Product Header */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                        {product.name}
                                    </h1>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-300">
                                        <span>SKU: {product.sku || 'N/A'}</span>
                                        <span>
                                            Category: {product.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(
                                            product.price,
                                            currency.symbol,
                                        )}
                                    </div>
                                    {product.type === 'physical' && (
                                        <div className="flex items-center space-x-2">
                                            {getStockStatus(
                                                product.stock_quantity,
                                                product.type,
                                            )}
                                            {product.stock_quantity !==
                                                undefined &&
                                                product.stock_quantity > 0 && (
                                                    <span className="text-sm text-gray-500 dark:text-gray-300">
                                                        • Free shipping on
                                                        orders over{' '}
                                                        {formatCurrency(
                                                            50,
                                                            currency.symbol,
                                                        )}
                                                    </span>
                                                )}
                                        </div>
                                    )}
                                </div>

                                {/* Review Summary */}
                                {(product.average_rating ||
                                    product.reviews_count) && (
                                    <div className="flex items-center space-x-3 pt-2">
                                        <div className="flex items-center space-x-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-4 w-4 ${
                                                        star <=
                                                        Math.round(
                                                            product.average_rating ||
                                                                0,
                                                        )
                                                            ? 'fill-current text-yellow-400'
                                                            : 'text-gray-300 dark:text-gray-600'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                            {product.average_rating?.toFixed(
                                                1,
                                            ) || '0.0'}{' '}
                                            ({product.reviews_count || 0}{' '}
                                            {product.reviews_count === 1
                                                ? 'review'
                                                : 'reviews'}
                                            )
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                // Scroll to reviews tab
                                                const reviewsTab =
                                                    document.querySelector(
                                                        '[data-value="reviews"]',
                                                    ) as HTMLElement;
                                                if (reviewsTab) {
                                                    reviewsTab.click();
                                                }
                                            }}
                                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            View all reviews
                                        </Button>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                    <p className="leading-relaxed text-gray-600 dark:text-gray-200">
                                        {product.description}
                                    </p>
                                </div>

                                {/* Tags */}
                                {product.tags && product.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="outline"
                                                className="border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-200"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Variant Selection or Simple Add to Cart */}
                            {hasVariants && product.type === 'physical' && (
                                <Card className="border-2 border-gray-100 bg-white/50 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center space-x-2 text-lg">
                                            <Package className="h-5 w-5" />
                                            <span>Select Options</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <VariantSelector
                                            product={{
                                                id: product.id,
                                                name: product.name,
                                                price: product.price,
                                                thumbnail_url:
                                                    getProductImages(
                                                        product,
                                                    )[0] ||
                                                    product.thumbnail_url,
                                            }}
                                            variants={activeVariants}
                                            currency={currency}
                                            onAddToCart={handleAddToCart}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {!hasVariants &&
                                product.type === 'physical' &&
                                product.status === 'published' && (
                                    <Card className="border-2 border-gray-100 bg-white/50 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center space-x-2 text-lg">
                                                <ShoppingCart className="h-5 w-5" />
                                                <span>Add to Cart</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                    Quantity
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const currentQty =
                                                                getItemQuantity(
                                                                    product.id,
                                                                    0,
                                                                );
                                                            if (
                                                                currentQty > 1
                                                            ) {
                                                                updateQuantity(
                                                                    product.id,
                                                                    0,
                                                                    currentQty -
                                                                        1,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        -
                                                    </Button>
                                                    <span className="w-12 text-center font-medium text-gray-900 dark:text-gray-100">
                                                        {getItemQuantity(
                                                            product.id,
                                                            0,
                                                        ) || 1}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const currentQty =
                                                                getItemQuantity(
                                                                    product.id,
                                                                    0,
                                                                );
                                                            updateQuantity(
                                                                product.id,
                                                                0,
                                                                currentQty + 1,
                                                            );
                                                        }}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                            </div>

                                            <Button
                                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800"
                                                size="lg"
                                                disabled={
                                                    product.stock_quantity === 0
                                                }
                                                onClick={handleAddSimpleProduct}
                                            >
                                                <ShoppingCart className="mr-2 h-5 w-5" />
                                                {product.stock_quantity === 0
                                                    ? 'Out of Stock'
                                                    : 'Add to Cart'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                            {/* Product Features */}
                            <Card className="border-2 border-gray-100 shadow-sm dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Product Features
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">
                                                    Fast Shipping
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Free on orders over{' '}
                                                    {formatCurrency(
                                                        50,
                                                        currency.symbol,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">
                                                    Secure Payment
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    100% secure checkout
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                                                <RotateCcw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">
                                                    Easy Returns
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    30-day return policy
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                                                <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">
                                                    Quality Guarantee
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Premium quality products
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Product Details Tabs */}
                    <div className="mt-16">
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800">
                                <TabsTrigger
                                    value="details"
                                    className="text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100"
                                >
                                    Product Details
                                </TabsTrigger>
                                <TabsTrigger
                                    value="specifications"
                                    className="text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100"
                                >
                                    Specifications
                                </TabsTrigger>
                                <TabsTrigger
                                    value="reviews"
                                    className="text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100"
                                >
                                    Reviews
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="mt-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="prose prose-sm max-w-none dark:prose-invert">
                                            <h3 className="mb-4 text-lg font-semibold">
                                                Product Description
                                            </h3>
                                            <p className="whitespace-pre-wrap leading-relaxed text-gray-600 dark:text-gray-300">
                                                {product.description}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent
                                value="specifications"
                                className="mt-6"
                            >
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold">
                                                    Product Information
                                                </h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            SKU
                                                        </span>
                                                        <span className="font-medium">
                                                            {product.sku ||
                                                                'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            Category
                                                        </span>
                                                        <span className="font-medium">
                                                            {product.category}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            Type
                                                        </span>
                                                        <span className="font-medium">
                                                            {getTypeLabel(
                                                                product.type,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            Status
                                                        </span>
                                                        <span className="font-medium capitalize">
                                                            {product.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {product.type === 'physical' && (
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-semibold">
                                                        Physical Specifications
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {product.weight && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    Weight
                                                                </span>
                                                                <span className="font-medium">
                                                                    {
                                                                        product.weight
                                                                    }{' '}
                                                                    kg
                                                                </span>
                                                            </div>
                                                        )}
                                                        {product.dimensions && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    Dimensions
                                                                </span>
                                                                <span className="font-medium">
                                                                    {
                                                                        product.dimensions
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {product.stock_quantity !==
                                                            undefined && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    Stock
                                                                    Quantity
                                                                </span>
                                                                <span className="font-medium">
                                                                    {
                                                                        product.stock_quantity
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="reviews" className="mt-6">
                                <div className="space-y-6">
                                    {/* Review Summary */}
                                    <ReviewSummary
                                        averageRating={
                                            reviewStats.average_rating
                                        }
                                        totalReviews={reviewStats.total_reviews}
                                        ratingDistribution={
                                            reviewStats.rating_distribution
                                        }
                                        verifiedPurchaseCount={
                                            reviewStats.verified_purchase_count
                                        }
                                        featuredReviewsCount={
                                            reviewStats.featured_reviews_count
                                        }
                                    />

                                    {/* Review List */}
                                    <ReviewList
                                        productId={product.id}
                                        productName={product.name}
                                        reviews={reviews}
                                        pagination={{
                                            current_page: currentPage,
                                            last_page: Math.ceil(
                                                reviewStats.total_reviews / 10,
                                            ),
                                            per_page: 10,
                                            total: reviewStats.total_reviews,
                                        }}
                                        summary={{
                                            average_rating:
                                                reviewStats.average_rating,
                                            total_reviews:
                                                reviewStats.total_reviews,
                                            rating_distribution:
                                                reviewStats.rating_distribution,
                                        }}
                                        currentUserEmail={auth.user.email}
                                        currentUserId={auth.user.id}
                                        isAdmin={canModerate}
                                        filters={{
                                            rating: (reviewFilters as any)
                                                .rating,
                                            verified_purchase: (
                                                reviewFilters as any
                                            ).verified_purchase,
                                            sort: reviewSort,
                                            approved: canModerate
                                                ? false
                                                : undefined, // Show all reviews for moderators
                                        }}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Cart Summary Sidebar */}
                    {cartState.items.length > 0 && (
                        <div className="fixed bottom-4 right-4 z-50">
                            <Card className="w-80 border-2 border-blue-200 shadow-xl dark:border-blue-800">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center justify-between text-lg">
                                        <span>
                                            Cart ({cartState.itemCount} items)
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                                        >
                                            {formatCurrency(
                                                cartState.total,
                                                currency.symbol,
                                            )}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="max-h-64 space-y-3 overflow-y-auto">
                                    {cartState.items.map(
                                        (item: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 rounded-lg border bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                {item.thumbnail_url && (
                                                    <img
                                                        src={item.thumbnail_url}
                                                        alt={item.name}
                                                        className="h-10 w-10 rounded object-cover"
                                                    />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-medium">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatCurrency(
                                                            item.price,
                                                            currency.symbol,
                                                        )}{' '}
                                                        each
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.productId,
                                                                item.variantId,
                                                                Math.max(
                                                                    0,
                                                                    item.quantity -
                                                                        1,
                                                                ),
                                                            )
                                                        }
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        -
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.productId,
                                                                item.variantId,
                                                                item.quantity +
                                                                    1,
                                                            )
                                                        }
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        +
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeItem(
                                                                item.productId,
                                                                item.variantId,
                                                            )
                                                        }
                                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </CardContent>
                                <div className="border-t bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                                    <Button
                                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                                        onClick={() => {
                                            if (cartState.items.length === 0) {
                                                alert(
                                                    'Your cart is empty. Please add items to your cart before checking out.',
                                                );
                                                return;
                                            }
                                            router.visit(
                                                route(
                                                    'product-orders.checkout',
                                                ),
                                            );
                                        }}
                                    >
                                        Proceed to Checkout (
                                        {cartState.itemCount} items)
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
