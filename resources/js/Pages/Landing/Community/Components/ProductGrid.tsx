import ProductCard from './ProductCard';

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

interface ProductGridProps {
  products: Product[];
  cartItems: CartItem[];
  selectedVariants: Record<number, any>;
  variantErrors: Record<number, string>;
  addToCart: (product: Product, variant?: any, quantity?: number) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  updateCartQuantity: (productId: number, quantity: number, variantId?: number) => void;
  handleVariantSelection: (productId: number, variant: any) => void;
  getEffectivePrice: (product: Product, variant?: any) => number;
  getEffectiveStock: (product: Product, variant?: any) => number;
  getAvailableAttributes: (product: Product) => Record<string, string[]>;
  findMatchingVariant: (product: Product, selectedAttributes: Record<string, string>) => any;
  isVariantComplete: (product: Product, selectedAttributes: Record<string, string>) => boolean;
  isValidAttributeCombination: (product: Product, selectedAttributes: Record<string, string>) => boolean;
  formatPrice: (price: number | string | null | undefined) => string;
  setVariantErrors: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  hasActiveFilters: () => boolean;
  clearFilters: () => void;
  getProductImage: (product: Product) => string | null;
  appCurrency?: { code: string; symbol: string } | null;
  memberIdentifier: string | number;
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
  memberIdentifier
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
        <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-lg font-medium">
          {hasActiveFilters() ? 'No products match your filters' : 'No products available'}
        </p>
        <p className="text-sm">
          {hasActiveFilters() ? 'Try adjusting your filters or clear them to see all products' : 'Check back later for new products'}
        </p>
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
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
          memberIdentifier={memberIdentifier}
        />
      ))}
    </div>
  );
} 