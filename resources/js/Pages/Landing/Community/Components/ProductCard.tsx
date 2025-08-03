import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';

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

interface ProductCardProps {
  product: Product;
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
  getProductImage: (product: Product) => string | null;
  openProductDetailModal: (product: Product) => void;
  appCurrency?: { code: string; symbol: string } | null;
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
  openProductDetailModal,
  appCurrency
}: ProductCardProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Gallery logic
  let images: { image_url: string; alt_text?: string }[] = [];
  if (product.images && product.images.length > 0) {
    images = [...product.images].sort((a, b) => a.sort_order - b.sort_order);
  } else if (product.thumbnail_url) {
    images = [{ image_url: product.thumbnail_url, alt_text: product.name }];
  }
  const currentImage = images[currentImageIdx] || images[0];
  const canGoPrev = images.length > 1 && currentImageIdx > 0;
  const canGoNext = images.length > 1 && currentImageIdx < images.length - 1;

  const handleViewDetails = () => {
    // Navigate to public product detail page
    openProductDetailModal(product);
  };

  return (
    <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 break-inside-avoid mb-6">
      {/* Product Image Gallery */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 dark:from-gray-700 to-gray-200 dark:to-gray-600 flex items-center justify-center overflow-hidden">
        {currentImage ? (
          <>
            <img
              src={currentImage.image_url}
              alt={currentImage.alt_text || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={handleViewDetails}
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                {canGoPrev && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIdx(prev => prev - 1);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                {canGoNext && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIdx(prev => prev + 1);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </>
            )}
            
            {/* Thumbnail Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIdx(idx);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
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
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Header */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Status and Stock Info */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            {/* Status Badge */}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              product.status === 'published' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
            }`}>
              {product.status === 'published' ? 'Available' : product.status}
            </span>
          </div>
          {/* Category Badge on its own row */}
          <div>
            <span className="inline-block text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {product.category}
            </span>
          </div>
        </div>

        {/* Add to Cart or View Details Button */}
        <div className="mb-3">
          {product.active_variants && product.active_variants.length > 0 ? (
            /* For products with variants, show "View Details" button */
            <button
              onClick={handleViewDetails}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </button>
          ) : (
            /* For products without variants, show "Add to Cart" button */
            <button
              onClick={() => addToCart(product, undefined, 1)}
              disabled={product.status !== 'published' || (product.type === 'physical' && (product.stock_quantity || 0) <= 0)}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.status !== 'published' || (product.type === 'physical' && (product.stock_quantity || 0) <= 0) ? 'Not Available' : 'Add to Cart'}
            </button>
          )}
        </div>






      </div>
    </div>
  );
} 