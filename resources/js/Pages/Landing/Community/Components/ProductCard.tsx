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
  formatPrice: (price: number | string | null | undefined) => string;
  setVariantErrors: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  getProductImage: (product: Product) => string | null;
  openProductDetailModal: (product: Product) => void;
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
  formatPrice,
  setVariantErrors,
  getProductImage,
  openProductDetailModal
}: ProductCardProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const selectedVariant = selectedVariants[product.id];
  const effectivePrice = getEffectivePrice(product, selectedVariant);
  const effectiveStock = getEffectiveStock(product, selectedVariant);
  
  const cartItem = cartItems.find(item => 
    item.id === product.id && 
    (!selectedVariant ? !item.variant : item.variant?.id === selectedVariant?.id)
  );
  const quantity = cartItem?.quantity || 0;
  
  const isAvailable = product.status === 'published' && 
    (product.type !== 'physical' || 
     (selectedVariant ? effectiveStock > 0 : (product.stock_quantity || 0) > 0));

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
            {/* Stock Status */}
            {product.type === 'physical' && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                effectiveStock > 0
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
              }`}>
                {effectiveStock > 0 ? `${effectiveStock} in stock` : 'Out of stock'}
              </span>
            )}
          </div>
          {/* Category Badge on its own row */}
          <div>
            <span className="inline-block text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {product.category}
            </span>
          </div>
        </div>

        {/* Variant Selection */}
        {product.active_variants && product.active_variants.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Select Options</h4>
            {Object.entries(getAvailableAttributes(product)).map(([attributeKey, options]) => {
              const selectedAttributes = selectedVariant?.attributes || {};
              const isSelected = (option: string) => selectedAttributes[attributeKey] === option;
              return (
                <div key={attributeKey} className="mb-2">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 capitalize">
                    {attributeKey}
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {options.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          const newAttributes = { ...selectedAttributes, [attributeKey]: option };
                          const matchingVariant = findMatchingVariant(product, newAttributes);
                          handleVariantSelection(product.id, matchingVariant);
                        }}
                        className={`px-2 py-1 text-xs rounded border transition-colors ${
                          isSelected(option)
                            ? 'bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {variantErrors[product.id] && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{variantErrors[product.id]}</p>
            )}
          </div>
        )}

        {/* Product Price */}
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(effectivePrice)}
            </span>
            {product.type === 'subscription' && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">/month</span>
            )}
            {selectedVariant?.price && selectedVariant.price !== product.price && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Add to Cart Button */}
          {isAvailable ? (
            <button
              onClick={() => {
                if (product.active_variants && product.active_variants.length > 0) {
                  if (!isVariantComplete(product, selectedVariant?.attributes || {})) {
                    setVariantErrors(prev => ({ ...prev, [product.id]: 'Please select all options' }));
                    return;
                  }
                }
                addToCart(product, selectedVariant, 1);
              }}
              disabled={!isAvailable || (product.active_variants && product.active_variants.length > 0 && !isVariantComplete(product, selectedVariant?.attributes || {}))}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {quantity > 0 ? `In Cart (${quantity})` : 'Add to Cart'}
            </button>
          ) : (
            <button className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-lg cursor-not-allowed text-sm font-medium">
              Out of Stock
            </button>
          )}

          {/* View Details Button */}
          <button
            onClick={handleViewDetails}
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium border border-gray-300 dark:border-gray-600"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Details
          </button>
        </div>

        {/* Quantity Controls (if item is in cart) */}
        {quantity > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateCartQuantity(product.id, quantity - 1, selectedVariant?.id)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => updateCartQuantity(product.id, quantity + 1, selectedVariant?.id)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => removeFromCart(product.id, selectedVariant?.id)}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 