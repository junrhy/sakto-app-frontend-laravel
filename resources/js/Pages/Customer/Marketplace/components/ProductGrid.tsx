import ProductCard from './ProductCard';

export interface MarketplaceProduct {
    id: number | string;
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
        sku?: string | null;
        price?: number;
        stock_quantity: number;
        weight?: number;
        dimensions?: string | null;
        thumbnail_url?: string | null;
        attributes: Record<string, string>;
        is_active: boolean;
    }>;
}

export interface MarketplaceCartItem {
    id: number | string;
    quantity: number;
    variant?: any;
}

export type MarketplaceProductVariant = NonNullable<
    MarketplaceProduct['active_variants']
>[number];

export type MarketplaceProductImage = NonNullable<
    MarketplaceProduct['images']
>[number];

interface ProductGridProps {
    products: MarketplaceProduct[];
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
        React.SetStateAction<Record<number | string, string>>
    >;
    hasActiveFilters: () => boolean;
    clearFilters: () => void;
    getProductImage: (product: MarketplaceProduct) => string | null;
    appCurrency?: { code: string; symbol: string } | null;
    projectIdentifier: string;
    ownerIdentifier: string | number;
}

export default function ProductGrid({
    products,
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
    hasActiveFilters,
    clearFilters,
    getProductImage,
    appCurrency,
    projectIdentifier,
    ownerIdentifier,
}: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <svg
                    className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600"
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
                <p className="text-lg font-medium">
                    {hasActiveFilters()
                        ? 'No products match your filters'
                        : 'No products available'}
                </p>
                <p className="text-sm">
                    {hasActiveFilters()
                        ? 'Try adjusting your filters or clear them to see all products'
                        : 'Check back later for new products'}
                </p>
                {hasActiveFilters() && (
                    <button
                        onClick={clearFilters}
                        className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                    >
                        Clear Filters
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    cartItems={cartItems}
                    selectedVariants={selectedVariants}
                    variantErrors={variantErrors}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                    updateCartQuantity={updateCartQuantity}
                    handleVariantSelection={handleVariantSelection}
                    getEffectivePrice={getEffectivePrice}
                    getEffectiveStock={getEffectiveStock}
                    getAvailableAttributes={getAvailableAttributes}
                    findMatchingVariant={findMatchingVariant}
                    isVariantComplete={isVariantComplete}
                    isValidAttributeCombination={isValidAttributeCombination}
                    formatPrice={formatPrice}
                    setVariantErrors={setVariantErrors}
                    getProductImage={getProductImage}
                    appCurrency={appCurrency}
                    projectIdentifier={projectIdentifier}
                    ownerIdentifier={ownerIdentifier}
                />
            ))}
        </div>
    );
}
