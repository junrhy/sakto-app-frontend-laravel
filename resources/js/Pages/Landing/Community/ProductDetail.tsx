import VariantSelector from '@/Components/VariantSelector';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Heart, Share2, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

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

interface CartItem {
    id: number;
    quantity: number;
    variant?: any;
}

interface ProductDetailProps {
    product: Product;
    appCurrency?: { code: string; symbol: string } | null;
    member: {
        id: number;
        identifier: string | number;
        name: string;
    };
}

export default function ProductDetail({
    product,
    appCurrency,
    member,
}: ProductDetailProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>(() => {
        // Initialize cart from localStorage
        const savedCart = localStorage.getItem('community-cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Helper function to get effective stock
    const getEffectiveStock = (product: Product, variant?: any): number => {
        if (variant) {
            return variant.stock_quantity || 0;
        }
        return product.stock_quantity || 0;
    };

    // Helper function to add to cart
    const addToCart = (
        product: Product,
        variant?: any,
        quantity: number = 1,
    ) => {
        // Get existing cart from localStorage
        const existingCart = localStorage.getItem('community-cart');
        const cartItems = existingCart ? JSON.parse(existingCart) : [];

        const existingItem = cartItems.find(
            (item: any) =>
                item.id === product.id &&
                (!variant ? !item.variant : item.variant?.id === variant?.id),
        );

        let updatedCart;
        if (existingItem) {
            updatedCart = cartItems.map((item: any) =>
                item.id === product.id &&
                (!variant ? !item.variant : item.variant?.id === variant?.id)
                    ? { ...item, quantity: item.quantity + quantity }
                    : item,
            );
        } else {
            updatedCart = [...cartItems, { id: product.id, quantity, variant }];
        }

        // Save to localStorage
        localStorage.setItem('community-cart', JSON.stringify(updatedCart));

        // Update local state
        setCartItems(updatedCart);

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className =
            'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        successMessage.textContent = 'Product added to cart!';
        document.body.appendChild(successMessage);

        // Remove the message after 3 seconds
        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 3000);
    };

    // Helper function to get all product images
    const getProductImages = (product: Product): string[] => {
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

    const productImages = getProductImages(product);
    const effectiveStock = getEffectiveStock(product, undefined);
    const isAvailable =
        product.status === 'published' &&
        (product.type !== 'physical' || (product.stock_quantity || 0) > 0);

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

    return (
        <GuestLayout>
            <Head title={product.name} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => window.history.back()}
                                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                    <span>Back</span>
                                </button>
                                <h1 className="truncate text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {product.name}
                                </h1>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleShare}
                                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                >
                                    <Share2 className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() =>
                                        setIsWishlisted(!isWishlisted)
                                    }
                                    className={`rounded-full p-2 transition-colors ${
                                        isWishlisted
                                            ? 'text-red-500 hover:text-red-600'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    } hover:bg-gray-100 dark:hover:bg-gray-700`}
                                >
                                    <Heart
                                        className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                        {/* Product Images */}
                        <div className="space-y-4">
                            {productImages.length > 0 ? (
                                <>
                                    <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                        <img
                                            src={productImages[selectedImage]}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                        {/* Navigation Arrows */}
                                        {productImages.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        setSelectedImage(
                                                            selectedImage === 0
                                                                ? productImages.length -
                                                                      1
                                                                : selectedImage -
                                                                      1,
                                                        )
                                                    }
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                                                >
                                                    <svg
                                                        className="h-6 w-6"
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
                                                                productImages.length -
                                                                    1
                                                                ? 0
                                                                : selectedImage +
                                                                      1,
                                                        )
                                                    }
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                                                >
                                                    <svg
                                                        className="h-6 w-6"
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
                                    </div>

                                    {/* Thumbnail Gallery */}
                                    {productImages.length > 1 && (
                                        <div className="flex space-x-2 overflow-x-auto pb-2">
                                            {productImages.map(
                                                (image, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() =>
                                                            setSelectedImage(
                                                                index,
                                                            )
                                                        }
                                                        className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                                                            index ===
                                                            selectedImage
                                                                ? 'border-blue-500 dark:border-blue-400'
                                                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                                                        }`}
                                                    >
                                                        <img
                                                            src={image}
                                                            alt={`${product.name} - Image ${index + 1}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <svg
                                        className="h-24 w-24 text-gray-400 dark:text-gray-500"
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
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Product Header */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            {product.category}
                                        </span>
                                        <span className="text-gray-300 dark:text-gray-600">
                                            •
                                        </span>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                product.type === 'digital'
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50'
                                                    : product.type === 'service'
                                                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50'
                                                      : product.type ===
                                                          'subscription'
                                                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50'
                                                        : 'bg-green-100 text-green-700 dark:bg-green-900/50'
                                            }`}
                                        >
                                            {product.type
                                                .charAt(0)
                                                .toUpperCase() +
                                                product.type.slice(1)}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                        {product.name}
                                    </h1>
                                    {product.sku && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            SKU: {product.sku}
                                        </p>
                                    )}
                                </div>

                                {/* Price - Only show for products without variants */}
                                {(!product.active_variants ||
                                    product.active_variants.length === 0) && (
                                    <div className="space-y-2">
                                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                            {appCurrency?.symbol || '$'}
                                            {typeof product.price === 'string'
                                                ? parseFloat(product.price) || 0
                                                : product.price}
                                        </div>
                                        {product.type === 'subscription' && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                per month
                                            </p>
                                        )}
                                        {product.type === 'physical' && (
                                            <div className="flex items-center space-x-2">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                        effectiveStock > 0
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/50'
                                                    }`}
                                                >
                                                    {effectiveStock > 0
                                                        ? `${effectiveStock} in stock`
                                                        : 'Out of stock'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Description */}
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                    <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                                        {product.description}
                                    </p>
                                </div>

                                {/* Tags */}
                                {product.tags && product.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Variant Selection or Simple Add to Cart */}
                            {product.active_variants &&
                            product.active_variants.length > 0 ? (
                                <div className="space-y-4">
                                    <VariantSelector
                                        product={{
                                            id: product.id,
                                            name: product.name,
                                            price:
                                                typeof product.price ===
                                                'string'
                                                    ? parseFloat(
                                                          product.price,
                                                      ) || 0
                                                    : product.price,
                                            thumbnail_url:
                                                product.thumbnail_url ||
                                                undefined,
                                        }}
                                        variants={product.active_variants}
                                        currency={{
                                            symbol: appCurrency?.symbol || '$',
                                            code: appCurrency?.code || 'USD',
                                        }}
                                        onAddToCart={(variantId, quantity) => {
                                            const variant =
                                                product.active_variants?.find(
                                                    (v) => v.id === variantId,
                                                );
                                            addToCart(
                                                product,
                                                variant,
                                                quantity,
                                            );
                                        }}
                                        maxQuantity={10}
                                    />

                                    {/* Checkout Button for Products with Variants */}
                                    <Link
                                        href={route('member.checkout', {
                                            identifier: member.identifier,
                                        })}
                                        className="inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-lg font-medium text-white shadow-sm transition-colors hover:bg-green-700 hover:shadow-md dark:bg-green-700 dark:hover:bg-green-600"
                                    >
                                        <svg
                                            className="mr-2 h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                                            />
                                        </svg>
                                        Proceed to Checkout
                                    </Link>
                                </div>
                            ) : (
                                /* Simple Add to Cart for products without variants */
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Quantity:
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() =>
                                                    setQuantity(
                                                        Math.max(
                                                            1,
                                                            quantity - 1,
                                                        ),
                                                    )
                                                }
                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                            >
                                                -
                                            </button>
                                            <span className="min-w-[3rem] text-center text-lg font-medium">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setQuantity(quantity + 1)
                                                }
                                                disabled={
                                                    product.type ===
                                                        'physical' &&
                                                    quantity >= effectiveStock
                                                }
                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            addToCart(
                                                product,
                                                undefined,
                                                quantity,
                                            );
                                        }}
                                        disabled={!isAvailable}
                                        className={`inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white shadow-sm transition-colors hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600 ${
                                            !isAvailable
                                                ? 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'
                                                : ''
                                        }`}
                                    >
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        {!isAvailable
                                            ? 'Not Available'
                                            : 'Add to Cart'}
                                    </button>

                                    {/* Checkout Button */}
                                    <Link
                                        href={route('member.checkout', {
                                            identifier: member.identifier,
                                        })}
                                        className="inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-lg font-medium text-white shadow-sm transition-colors hover:bg-green-700 hover:shadow-md dark:bg-green-700 dark:hover:bg-green-600"
                                    >
                                        <svg
                                            className="mr-2 h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                                            />
                                        </svg>
                                        Proceed to Checkout
                                    </Link>
                                </div>
                            )}

                            {/* Product Details */}
                            <div className="space-y-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Product Details
                                </h3>
                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                    {product.weight && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Weight
                                            </span>
                                            <span className="font-medium">
                                                {product.weight}g
                                            </span>
                                        </div>
                                    )}
                                    {product.dimensions && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Dimensions
                                            </span>
                                            <span className="font-medium">
                                                {product.dimensions}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Type
                                        </span>
                                        <span className="font-medium capitalize">
                                            {product.type}
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
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
