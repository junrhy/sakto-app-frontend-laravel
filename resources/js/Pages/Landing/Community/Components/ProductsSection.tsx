import { useState } from 'react';
import ProductFilterPanel from './ProductFilterPanel';
import ProductCartSummary from './ProductCartSummary';
import ProductGrid from './ProductGrid';
import ProductCheckoutDialog from './ProductCheckoutDialog';
import ProductOrderHistory from './ProductOrderHistory';
import ProductDetail from './ProductDetail';

// Define types for Product, Variant, etc. as needed

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

interface ProductsSectionProps {
  products: Product[];
  appCurrency?: { code: string; symbol: string } | null;
  member: {
    id: number;
    identifier?: string;
  };
  contactId?: number;
  orderHistory?: any[];
}

export default function ProductsSection({ products, appCurrency, member, contactId, orderHistory }: ProductsSectionProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [marketplaceFilters, setMarketplaceFilters] = useState({
    search: '',
    category: '',
    type: '',
    priceRange: '',
    availability: ''
  });

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<number, any>>({});
  const [variantErrors, setVariantErrors] = useState<Record<number, string>>({});
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

  // Product detail modal state
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Utility functions
  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) {
      const symbol = appCurrency?.symbol || '$';
      return `${symbol}0.00`;
    }
    const numericPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;
    const symbol = appCurrency?.symbol || '$';
    return `${symbol}${numericPrice.toFixed(2)}`;
  };

  const getEffectivePrice = (product: Product, variant?: any): number => {
    if (variant?.price !== undefined && variant?.price !== null) {
      return typeof variant.price === 'string' ? parseFloat(variant.price) || 0 : variant.price;
    }
    if (product.price === null || product.price === undefined) {
      return 0;
    }
    return typeof product.price === 'string' ? parseFloat(product.price) || 0 : product.price;
  };

  const getEffectiveStock = (product: Product, variant?: any) => {
    if (variant?.stock_quantity !== undefined) {
      return variant.stock_quantity;
    }
    return product.stock_quantity || 0;
  };

  const getAvailableAttributes = (product: Product) => {
    if (!product.active_variants || product.active_variants.length === 0) {
      return {};
    }

    const attributes: Record<string, Set<string>> = {};
    product.active_variants.forEach(variant => {
      Object.entries(variant.attributes).forEach(([key, value]) => {
        if (!attributes[key]) {
          attributes[key] = new Set();
        }
        attributes[key].add(value);
      });
    });

    return Object.fromEntries(
      Object.entries(attributes).map(([key, values]) => [key, Array.from(values)])
    );
  };

  const findMatchingVariant = (product: Product, selectedAttributes: Record<string, string>) => {
    if (!product.active_variants) return null;
    
    return product.active_variants.find(variant => {
      return Object.entries(selectedAttributes).every(([key, value]) => 
        variant.attributes[key] === value
      );
    });
  };

  const isVariantComplete = (product: Product, selectedAttributes: Record<string, string>) => {
    const availableAttributes = getAvailableAttributes(product);
    return Object.keys(availableAttributes).every(key => selectedAttributes[key]);
  };

  // Cart functions
  const addToCart = (product: Product, variant?: any, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => 
        item.id === product.id && 
        (!variant ? !item.variant : item.variant?.id === variant?.id)
      );

      if (existingItem) {
        return prev.map(item => 
          item.id === product.id && 
          (!variant ? !item.variant : item.variant?.id === variant?.id)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { id: product.id, quantity, variant }];
      }
    });
  };

  const removeFromCart = (productId: number, variantId?: number) => {
    setCartItems(prev => prev.filter(item => 
      !(item.id === productId && (!variantId ? !item.variant : item.variant?.id === variantId))
    ));
  };

  const updateCartQuantity = (productId: number, quantity: number, variantId?: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setCartItems(prev => prev.map(item => 
      item.id === productId && 
      (!variantId ? !item.variant : item.variant?.id === variantId)
        ? { ...item, quantity }
        : item
    ));
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.id);
      if (!product) return total;
      const price = getEffectivePrice(product, item.variant);
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedVariants({});
    setVariantErrors({});
  };

  const handleVariantSelection = (productId: number, variant: any) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variant }));
    setVariantErrors(prev => ({ ...prev, [productId]: '' }));
  };

  const handleCheckout = () => {
    setShowCheckoutDialog(true);
  };

  // Product detail modal functions
  const openProductDetailModal = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetailModal(true);
  };

  const closeProductDetailModal = () => {
    setShowProductDetailModal(false);
    setSelectedProduct(null);
  };

  // Helper function to get the primary or first image for a product
  const getProductImage = (product: Product): string | null => {
    if (product.images && product.images.length > 0) {
      // Sort by sort_order and find primary image first
      const sortedImages = [...product.images].sort((a, b) => a.sort_order - b.sort_order);
      const primaryImage = sortedImages.find(img => img.is_primary);
      if (primaryImage) {
        return primaryImage.image_url;
      }
      // If no primary image, return the first one
      return sortedImages[0].image_url;
    }
    // Fallback to thumbnail_url
    return product.thumbnail_url;
  };

  // Filter functions
  const getFilteredProducts = () => {
    return products.filter(product => {
      // Search filter
      if (marketplaceFilters.search) {
        const searchLower = marketplaceFilters.search.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (marketplaceFilters.category && product.category !== marketplaceFilters.category) {
        return false;
      }

      // Type filter
      if (marketplaceFilters.type && product.type !== marketplaceFilters.type) {
        return false;
      }

      // Price range filter
      if (marketplaceFilters.priceRange) {
        const price = getEffectivePrice(product);
        const [min, max] = marketplaceFilters.priceRange.split('_').map(Number);
        if (marketplaceFilters.priceRange === 'under_10' && price >= 10) return false;
        if (marketplaceFilters.priceRange === '10_50' && (price < 10 || price >= 50)) return false;
        if (marketplaceFilters.priceRange === '50_100' && (price < 50 || price >= 100)) return false;
        if (marketplaceFilters.priceRange === 'over_100' && price < 100) return false;
      }

      // Availability filter
      if (marketplaceFilters.availability) {
        const stock = getEffectiveStock(product);
        if (marketplaceFilters.availability === 'in_stock' && stock <= 0) return false;
        if (marketplaceFilters.availability === 'out_of_stock' && stock > 0) return false;
      }

      return true;
    });
  };

  const getUniqueCategories = () => {
    return [...new Set(products.map(product => product.category))];
  };

  const getUniqueTypes = () => {
    return [...new Set(products.map(product => product.type))];
  };

  const clearFilters = () => {
    setMarketplaceFilters({
      search: '',
      category: '',
      type: '',
      priceRange: '',
      availability: ''
    });
  };

  const hasActiveFilters = () => {
    return Object.values(marketplaceFilters).some(value => value !== '');
  };

  const filteredProducts = getFilteredProducts();

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Marketplace</h2>
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-lg font-medium">No products available</p>
          <p className="text-sm">Check back later for new products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'products'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'orders'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Order History
          </button>
        </nav>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Marketplace</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filters
                {hasActiveFilters() && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs rounded-full">
                    {Object.values(marketplaceFilters).filter(v => v !== '').length}
                  </span>
                )}
              </button>
            </div>
          </div>

      <ProductFilterPanel
        showFilters={showFilters}
        filters={marketplaceFilters}
        setFilters={setMarketplaceFilters}
        getUniqueCategories={getUniqueCategories}
        getUniqueTypes={getUniqueTypes}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        getFilteredProducts={getFilteredProducts}
        products={products}
        appCurrency={appCurrency}
      />

      <ProductCartSummary
        cartItems={cartItems}
        getCartItemCount={getCartItemCount}
        getCartTotal={getCartTotal}
        formatPrice={formatPrice}
        handleCheckout={handleCheckout}
      />

      <ProductGrid
        products={filteredProducts}
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
        formatPrice={formatPrice}
        setVariantErrors={setVariantErrors}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
        getProductImage={getProductImage}
        openProductDetailModal={openProductDetailModal}
              />

        {/* Checkout Dialog */}
        <ProductCheckoutDialog
          isOpen={showCheckoutDialog}
          onClose={() => setShowCheckoutDialog(false)}
          cartItems={cartItems}
          products={products}
          getEffectivePrice={getEffectivePrice}
          formatPrice={formatPrice}
          getCartTotal={getCartTotal}
          getCartItemCount={getCartItemCount}
          clearCart={clearCart}
          removeFromCart={removeFromCart}
          updateCartQuantity={updateCartQuantity}
          member={member}
        />

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onClose={closeProductDetailModal}
            appCurrency={appCurrency}
            getEffectivePrice={getEffectivePrice}
            getEffectiveStock={getEffectiveStock}
            getAvailableAttributes={getAvailableAttributes}
            findMatchingVariant={findMatchingVariant}
            isVariantComplete={isVariantComplete}
            formatPrice={formatPrice}
            setVariantErrors={setVariantErrors}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            updateCartQuantity={updateCartQuantity}
            cartItems={cartItems}
            selectedVariants={selectedVariants}
            variantErrors={variantErrors}
            handleVariantSelection={handleVariantSelection}
          />
        )}
        </>
      )}

      {/* Order History Tab */}
      {activeTab === 'orders' && contactId && (
        <ProductOrderHistory contactId={contactId} appCurrency={appCurrency} member={member} orderHistory={orderHistory || []} />
      )}

      {/* Order History Tab - No Contact ID */}
      {activeTab === 'orders' && !contactId && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-lg font-medium">Authentication Required</p>
          <p className="text-sm">Please log in to view your order history</p>
        </div>
      )}
    </div>
  );
} 