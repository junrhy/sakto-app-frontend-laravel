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
  setVariantErrors
}: ProductCardProps) {
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

  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 break-inside-avoid mb-6">
      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {product.thumbnail_url ? (
          <img 
            src={product.thumbnail_url} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        
        {/* Product Type Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            product.type === 'digital' ? 'text-blue-700 bg-blue-100' :
            product.type === 'service' ? 'text-purple-700 bg-purple-100' :
            product.type === 'subscription' ? 'text-orange-700 bg-orange-100' :
            'text-green-700 bg-green-100'
          }`}>
            {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
          </span>
        </div>

        {/* Stock Status */}
        {(product.stock_quantity !== null || (product.active_variants && product.active_variants.length > 0) || product.type !== 'physical') && (
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              product.type === 'digital' ? 'text-blue-700 bg-blue-100' :
              product.type === 'service' ? 'text-purple-700 bg-purple-100' :
              product.type === 'subscription' ? 'text-orange-700 bg-orange-100' :
              getEffectiveStock(product, selectedVariant) > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
            }`}>
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                {product.type === 'digital' ? (
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                ) : product.type === 'service' ? (
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                ) : product.type === 'subscription' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                ) : getEffectiveStock(product, selectedVariant) > 0 ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                )}
              </svg>
              {product.type === 'digital' ? 'Instant Download' :
               product.type === 'service' ? 'Available' :
               product.type === 'subscription' ? 'Active' :
               getEffectiveStock(product, selectedVariant) > 0 
                  ? `${getEffectiveStock(product, selectedVariant)} in stock` 
                  : 'Out of stock'
              }
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4">
        {/* Product Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {product.category}
            </span>
            {product.status !== 'published' && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                product.status === 'draft' ? 'text-yellow-700 bg-yellow-100' :
                product.status === 'archived' ? 'text-gray-700 bg-gray-100' :
                'text-red-700 bg-red-100'
              }`}>
                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 mb-2">
            {product.name}
          </h3>
        </div>

        {/* Product Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Product Details */}
        {product.type === 'physical' && (
          <div className="space-y-2 mb-4">
            {product.weight && (
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <span>{product.weight}g</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <span>{product.dimensions}</span>
              </div>
            )}
          </div>
        )}

        {/* Product Type Specific Info */}
        {product.type !== 'physical' && (
          <div className="mb-4">
            <div className="flex items-center text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {product.type === 'digital' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                ) : product.type === 'service' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span>
                {product.type === 'digital' ? 'Digital product - instant access' :
                 product.type === 'service' ? 'Service - contact for scheduling' :
                 'Subscription - recurring billing'}
              </span>
            </div>
          </div>
        )}

        {/* Product Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  #{tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  +{product.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Variant Selection */}
        {product.active_variants && product.active_variants.length > 0 && (
          <div className="mb-4">
            {Object.entries(getAvailableAttributes(product)).map(([attributeKey, options]) => {
              const selectedAttributes = selectedVariants[product.id]?.attributes || {};
              const isSelected = (option: string) => selectedAttributes[attributeKey] === option;
              return (
                <div key={attributeKey} className="mb-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">{attributeKey}</label>
                  <div className="flex flex-wrap gap-2">
                    {options.map(option => (
                      <button
                        key={option}
                        type="button"
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${isSelected(option) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'}`}
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
            {/* Variant Error */}
            {variantErrors[product.id] && (
              <div className="text-red-600 text-xs mt-1">
                {variantErrors[product.id]}
              </div>
            )}
          </div>
        )}

        {/* Product Price and Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(effectivePrice)}
            </span>
            {product.type === 'subscription' && (
              <span className="text-xs text-gray-500 ml-1">/month</span>
            )}
            {selectedVariant?.price && selectedVariant.price !== product.price && (
              <span className="text-sm text-gray-500 line-through ml-2">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          {/* Cart Controls */}
          {!isAvailable ? (
            <button className="inline-flex items-center px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
              {effectiveStock === 0 ? 'Out of Stock' : 'Not Available'}
            </button>
          ) : quantity > 0 ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateCartQuantity(product.id, quantity - 1, selectedVariant?.id)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
              >
                -
              </button>
              <span className="text-sm font-medium min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => updateCartQuantity(product.id, quantity + 1, selectedVariant?.id)}
                disabled={product.type === 'physical' && quantity >= effectiveStock}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product, selectedVariant, 1)}
              className={`inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium shadow-sm hover:shadow-md ${product.active_variants && product.active_variants.length > 0 && !isVariantComplete(product, selectedVariant?.attributes || {}) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={product.active_variants && product.active_variants.length > 0 && !isVariantComplete(product, selectedVariant?.attributes || {})}
              title={product.active_variants && product.active_variants.length > 0 && !isVariantComplete(product, selectedVariant?.attributes || {}) ? 'Please select all variant options' : ''}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 