import { router } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import type { MarketplaceCartItem, MarketplaceProduct } from './ProductGrid';

interface ProductCardProps {
    product: MarketplaceProduct;
    cartItems: MarketplaceCartItem[];
    selectedVariants: Record<number | string, any>;
    variantErrors: Record<number | string, string>;
    addToCart: (
        product: MarketplaceProduct,
        variant?: any,
        quantity?: number,
    ) => void;
    removeFromCart: (productId: number | string, variantId?: number) => void;
    updateCartQuantity: (
        productId: number | string,
        quantity: number,
        variantId?: number,
    ) => void;
    handleVariantSelection: (productId: number | string, variant: any) => void;
    getEffectivePrice: (product: MarketplaceProduct, variant?: any) => number;
    getEffectiveStock: (product: MarketplaceProduct, variant?: any) => number;
    getAvailableAttributes: (
        product: MarketplaceProduct,
    ) => Record<string, string[]>;
    findMatchingVariant: (
        product: MarketplaceProduct,
        selectedAttributes: Record<string, string>,
    ) => any;
    isVariantComplete: (
        product: MarketplaceProduct,
        selectedAttributes: Record<string, string>,
    ) => boolean;
    isValidAttributeCombination: (
        product: MarketplaceProduct,
        selectedAttributes: Record<string, string>,
    ) => boolean;
    formatPrice: (price: number | string | null | undefined) => string;
    setVariantErrors: React.Dispatch<
        React.SetStateAction<Record<number, string>>
    >;
    getProductImage: (product: Product) => string | null;
    appCurrency?: { code: string; symbol: string } | null;
    projectIdentifier: string;
    ownerIdentifier: string | number;
}

export default function ProductCard({
    product,
    cartItems,
    selectedVariants,
    variantErrors,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    handleVariantSelection,
    getEffectivePrice,
    getEffectiveStock,
    getAvailableAttributes,
    findMatchingVariant,
    isVariantComplete,
    isValidAttributeCombination,
    formatPrice,
    setVariantErrors,
    getProductImage,
    appCurrency,
    projectIdentifier,
    ownerIdentifier,
}: ProductCardProps) {
    const [currentImageIdx, setCurrentImageIdx] = useState(0);

    let images: { image_url: string; alt_text?: string }[] = [];
    if (product.images && product.images.length > 0) {
        images = [...product.images].sort(
            (a, b) => a.sort_order - b.sort_order,
        );
    } else if (product.thumbnail_url) {
        images = [{ image_url: product.thumbnail_url, alt_text: product.name }];
    }
    const currentImage = images[currentImageIdx] || images[0];
    const canGoPrev = images.length > 1 && currentImageIdx > 0;
    const canGoNext = images.length > 1 && currentImageIdx < images.length - 1;

    const handleViewDetails = () => {
        router.visit(
            route('customer.projects.marketplace.products.show', {
                project: projectIdentifier,
                owner: ownerIdentifier,
                product: product.id,
            }),
        );
    };

    return (
        <div className="group mb-6 break-inside-avoid overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:shadow-gray-900/50">
            <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                {currentImage ? (
                    <>
                        <img
                            src={currentImage.image_url}
                            alt={currentImage.alt_text || product.name}
                            className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
                            onClick={handleViewDetails}
                        />

                        {images.length > 1 && (
                            <>
                                {canGoPrev && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIdx(
                                                (prev) => prev - 1,
                                            );
                                        }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                                    >
                                        <svg
                                            className="h-4 w-4"
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
                                )}
                                {canGoNext && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIdx(
                                                (prev) => prev + 1,
                                            );
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                                    >
                                        <svg
                                            className="h-4 w-4"
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
                                )}
                            </>
                        )}

                        {images.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-1">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIdx(idx);
                                        }}
                                        className={`h-2 w-2 rounded-full transition-colors ${
                                            idx === currentImageIdx
                                                ? 'bg-white'
                                                : 'bg-white/50 hover:bg-white/75'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <svg
                            className="h-16 w-16 text-gray-400 dark:text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="mb-3">
                    <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {product.name}
                    </h3>
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {product.description}
                    </p>
                </div>

                <div className="mb-3">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {formatPrice(getEffectivePrice(product))}
                        </span>
                        <span
                            className={`rounded-full px-2 py-1 text-sm font-medium ${
                                getEffectiveStock(product) > 0
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                        >
                            {getEffectiveStock(product) > 0
                                ? `${getEffectiveStock(product)} in stock`
                                : 'Out of stock'}
                        </span>
                    </div>
                </div>

                {(product.weight || product.dimensions) && (
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                            {product.weight && (
                                <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">
                                    <svg
                                        className="h-3 w-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                                        />
                                    </svg>
                                    {product.weight} kg
                                </span>
                            )}
                            {product.dimensions && (
                                <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">
                                    <svg
                                        className="h-3 w-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                        />
                                    </svg>
                                    {product.dimensions}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="mb-2">
                    <div className="mb-1 flex items-center gap-2">
                        <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                product.status === 'published'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        >
                            {product.status === 'published'
                                ? 'Available'
                                : product.status}
                        </span>
                    </div>
                    <div>
                        <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                            {product.category}
                        </span>
                    </div>
                </div>

                <div className="mb-3">
                    {product.active_variants &&
                    product.active_variants.length > 0 ? (
                        <button
                            onClick={handleViewDetails}
                            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 hover:shadow-md dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                            <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                            View Details
                        </button>
                    ) : (
                        <button
                            onClick={() => addToCart(product, undefined, 1)}
                            disabled={
                                product.status !== 'published' ||
                                (product.type === 'physical' &&
                                    (product.stock_quantity || 0) <= 0)
                            }
                            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {product.status !== 'published' ||
                            (product.type === 'physical' &&
                                (product.stock_quantity || 0) <= 0)
                                ? 'Not Available'
                                : 'Add to Cart'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
