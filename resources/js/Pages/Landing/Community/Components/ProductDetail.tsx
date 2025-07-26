import { useState } from 'react';
import { X, ShoppingCart, Heart, Share2 } from 'lucide-react';

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
  onClose: () => void;
  appCurrency?: { code: string; symbol: string } | null;
  getEffectivePrice: (product: Product, variant?: any) => number;
  getEffectiveStock: (product: Product, variant?: any) => number;
  getAvailableAttributes: (product: Product) => Record<string, string[]>;
  findMatchingVariant: (product: Product, selectedAttributes: Record<string, string>) => any;
  isVariantComplete: (product: Product, selectedAttributes: Record<string, string>) => boolean;
  formatPrice: (price: number | string | null | undefined) => string;
  setVariantErrors: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  addToCart: (product: Product, variant?: any, quantity?: number) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  updateCartQuantity: (productId: number, quantity: number, variantId?: number) => void;
  cartItems: CartItem[];
  selectedVariants: Record<number, any>;
  variantErrors: Record<number, string>;
  handleVariantSelection: (productId: number, variant: any) => void;
}

export default function ProductDetail({ product, onClose, appCurrency, getEffectivePrice, getEffectiveStock, getAvailableAttributes, findMatchingVariant, isVariantComplete, formatPrice, setVariantErrors, addToCart, removeFromCart, updateCartQuantity, cartItems, selectedVariants, variantErrors, handleVariantSelection }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Helper function to get all product images
  const getProductImages = (product: Product): string[] => {
    const images: string[] = [];
    
    // Add images from the images array (sorted by sort_order)
    if (product.images && product.images.length > 0) {
      const sortedImages = [...product.images].sort((a, b) => a.sort_order - b.sort_order);
      sortedImages.forEach(img => {
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
  const effectivePrice = getEffectivePrice(product, selectedVariants[product.id]);
  const effectiveStock = getEffectiveStock(product, selectedVariants[product.id]);
  const isAvailable = product.status === 'published' && 
    (product.type !== 'physical' || 
     (selectedVariants[product.id] ? effectiveStock > 0 : (product.stock_quantity || 0) > 0));

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

  const handleAddToCart = () => {
    addToCart(product, selectedVariants[product.id], quantity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-full overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{product.name}</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Product Images */}
          <div className="lg:w-1/2 p-6">
            {productImages.length > 0 ? (
              <>
                <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 mb-4">
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Navigation Arrows */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage(selectedImage === 0 ? productImages.length - 1 : selectedImage - 1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedImage(selectedImage === productImages.length - 1 ? 0 : selectedImage + 1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {productImages.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === selectedImage 
                            ? 'border-blue-500 dark:border-blue-400' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 p-6">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {product.category}
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    product.type === 'digital' ? 'text-blue-700 bg-blue-100 dark:bg-blue-900/50' :
                    product.type === 'service' ? 'text-purple-700 bg-purple-100 dark:bg-purple-900/50' :
                    product.type === 'subscription' ? 'text-orange-700 bg-orange-100 dark:bg-orange-900/50' :
                    'text-green-700 bg-green-100 dark:bg-green-900/50'
                  }`}>
                    {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{product.name}</h1>
                {product.sku && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(effectivePrice)}
                </div>
                {product.type === 'subscription' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">per month</p>
                )}
                {product.type === 'physical' && (
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      effectiveStock > 0 ? 'text-green-700 bg-green-100 dark:bg-green-900/50' : 'text-red-700 bg-red-100 dark:bg-red-900/50'
                    }`}>
                      {effectiveStock > 0 ? `${effectiveStock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Variant Selection */}
              {product.active_variants && product.active_variants.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Select Options</h3>
                  {Object.entries(getAvailableAttributes(product)).map(([attributeKey, options]) => {
                    const selectedAttributes = selectedVariants[product.id]?.attributes || {};
                    const isSelected = (option: string) => selectedAttributes[attributeKey] === option;
                    return (
                      <div key={attributeKey} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{attributeKey}</label>
                        <div className="flex flex-wrap gap-2">
                          {options.map(option => (
                            <button
                              key={option}
                              type="button"
                              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                isSelected(option) 
                                  ? 'bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700' 
                                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                              }`}
                              onClick={() => {
                                const newAttributes = { ...selectedAttributes, [attributeKey]: option };
                                const matchingVariant = findMatchingVariant(product, newAttributes);
                                handleVariantSelection(product.id, matchingVariant);
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                {product.type === 'physical' && (
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-lg font-medium min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={product.type === 'physical' && quantity >= effectiveStock}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={!isAvailable || (product.active_variants && product.active_variants.length > 0 && !isVariantComplete(product, selectedVariants[product.id]?.attributes || {}))}
                  className={`w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-lg font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                    !isAvailable ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : ''
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {!isAvailable ? 'Not Available' : 'Add to Cart'}
                </button>
              </div>

              {/* Product Details */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {product.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Weight</span>
                      <span className="font-medium">{product.weight}g</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Dimensions</span>
                      <span className="font-medium">{product.dimensions}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type</span>
                    <span className="font-medium capitalize">{product.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <span className="font-medium capitalize">{product.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 