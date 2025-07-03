import { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { 
  PHILIPPINE_SHIPPING_RATES, 
  INTERNATIONAL_SHIPPING_RATES, 
  getShippingMethods, 
  calculateShippingFee,
  type ShippingMethod 
} from '@/config/shipping-rates';

interface CartItem {
  id: number;
  quantity: number;
  variant?: any;
}

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

interface ProductCheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  products: Product[];
  member: {
    id: number;
    identifier?: string;
  };
  getEffectivePrice: (product: Product, variant?: any) => number;
  formatPrice: (price: number | string) => string;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  clearCart: () => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  updateCartQuantity: (productId: number, quantity: number, variantId?: number) => void;
}

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes: string;
  shippingMethod: string;
  paymentMethod: string;
}

export default function ProductCheckoutDialog({
  isOpen,
  onClose,
  cartItems,
  products,
  member,
  getEffectivePrice,
  formatPrice,
  getCartTotal,
  getCartItemCount,
  clearCart,
  removeFromCart,
  updateCartQuantity
}: ProductCheckoutDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Philippines',
    notes: '',
    shippingMethod: '',
    paymentMethod: 'cod'
  });

  // Get available shipping methods based on selected location
  const availableShippingMethods = useMemo(() => {
    if (!formData.country || !formData.state || !formData.city) {
      return [];
    }
    return getShippingMethods(formData.country, formData.state, formData.city);
  }, [formData.country, formData.state, formData.city]);

  // Calculate shipping fee
  const shippingFee = useMemo(() => {
    if (!formData.country || !formData.state || !formData.city || !formData.shippingMethod) {
      return 0;
    }
    return calculateShippingFee(formData.country, formData.state, formData.city, formData.shippingMethod);
  }, [formData.country, formData.state, formData.city, formData.shippingMethod]);

  // Get available countries
  const availableCountries = ['Philippines', 'United States', 'Canada', 'United Kingdom', 'Australia', 'Japan', 'Singapore', 'Malaysia'];

  // Get available regions/states based on selected country
  const availableRegions = useMemo(() => {
    if (formData.country === 'Philippines') {
      return [...new Set(PHILIPPINE_SHIPPING_RATES.map(rate => rate.province))];
    }
    return [];
  }, [formData.country]);

  // Get available cities based on selected country and region
  const availableCities = useMemo(() => {
    if (formData.country === 'Philippines' && formData.state) {
      const rate = PHILIPPINE_SHIPPING_RATES.find(r => r.province === formData.state);
      return rate ? rate.cities : [];
    }
    return [];
  }, [formData.country, formData.state]);

  // Reset dependent fields when country or state changes
  useEffect(() => {
    if (formData.country !== 'Philippines') {
      setFormData(prev => ({ ...prev, state: '', city: '', shippingMethod: '' }));
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.state) {
      setFormData(prev => ({ ...prev, city: '', shippingMethod: '' }));
    }
  }, [formData.state]);

  useEffect(() => {
    if (formData.city && availableShippingMethods.length > 0) {
      setFormData(prev => ({ ...prev, shippingMethod: availableShippingMethods[0].id }));
    }
  }, [formData.city, availableShippingMethods]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Get contact ID from visitor authorization data
      let contactId = null;
      const authData = localStorage.getItem(`visitor_auth_${member.id}`);
      console.log('Auth data:', authData);
      if (authData) {
        try {
          const { visitorInfo } = JSON.parse(authData);
          contactId = visitorInfo?.contactId || null;
          console.log('Contact ID:', contactId);
        } catch (error) {
          console.error('Error parsing auth data:', error);
        }
      }

      // Prepare order data according to publicStore method expectations
      const orderData = {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
        billing_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
        order_items: cartItems.map(item => {
          const product = products.find(p => p.id === item.id);
          return {
            product_id: item.id,
            name: product?.name || '',
            variant_id: item.variant?.id || null,
            attributes: item.variant?.attributes || null,
            quantity: item.quantity,
            price: product ? getEffectivePrice(product, item.variant) : 0,
          };
        }),
        subtotal: getCartTotal(),
        tax_amount: getCartTotal() * 0.12,
        shipping_fee: shippingFee,
        discount_amount: 0,
        total_amount: getCartTotal() * 1.12 + shippingFee,
        payment_method: formData.paymentMethod,
        notes: formData.notes,
        client_identifier: member?.identifier || member?.id?.toString() || '',
        contact_id: contactId
      };

      console.log('Order data being sent:', orderData);
      console.log('Contact ID in order data:', orderData.contact_id);

      // Submit order to the correct endpoint
      await router.post(route('member.public-checkout.store'), orderData as any, {
        onSuccess: () => {
          // Clear cart and close dialog
          clearCart();
          onClose();
          // Show success message
          alert('Order placed successfully! You will receive a confirmation email shortly.');
        },
        onError: (errors) => {
          console.error('Checkout error:', errors);
          alert('There was an error processing your order. Please try again.');
        }
      });
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getProductById = (id: number) => products.find(p => p.id === id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Checkout</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={isProcessing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Customer Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isProcessing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      disabled={isProcessing}
                    >
                      <option value="">Select a city</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State/Province *
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      disabled={isProcessing}
                    >
                      <option value="">Select a state</option>
                      {availableRegions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ZIP/Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Country *
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      disabled={isProcessing}
                      required
                    >
                      <option value="">Select a country</option>
                      {availableCountries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Shipping Method Selection */}
                {formData.country && formData.state && formData.city && availableShippingMethods.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Shipping Method *
                    </label>
                    <select
                      value={formData.shippingMethod}
                      onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      disabled={isProcessing}
                      required
                    >
                      <option value="">Select shipping method</option>
                      {availableShippingMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name} - {formatPrice(method.price)} ({method.estimated_days})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled={isProcessing}
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Order Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Any special instructions or notes..."
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const product = getProductById(item.id);
                    if (!product) return null;

                    const price = getEffectivePrice(product, item.variant);
                    const total = price * item.quantity;

                    return (
                      <div key={`${item.id}-${item.variant?.id || 'no-variant'}`} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            {product.thumbnail_url && (
                              <img
                                src={product.thumbnail_url}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">{product.name}</h4>
                              {item.variant && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {Object.entries(item.variant.attributes).map(([key, value]) => `${key}: ${value}`).join(', ')}
                                </p>
                              )}
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Qty:</span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.id, item.quantity - 1, item.variant?.id)}
                                  className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 flex items-center justify-center text-xs"
                                  disabled={isProcessing || item.quantity <= 1}
                                  title="Decrease quantity"
                                >
                                  -
                                </button>
                                <span className="text-sm font-medium min-w-[2rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.id, item.quantity + 1, item.variant?.id)}
                                  className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 flex items-center justify-center text-xs"
                                  disabled={isProcessing}
                                  title="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex items-center space-x-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatPrice(total)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatPrice(price)} each</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id, item.variant?.id)}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-1"
                            title="Remove item"
                            disabled={isProcessing}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Totals */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-medium">{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                    <span className="font-medium">
                      {formData.shippingMethod ? formatPrice(shippingFee) : 'Select shipping method'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax (12%):</span>
                    <span className="font-medium">{formatPrice(getCartTotal() * 0.12)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-600 pt-2">
                    <span>Total:</span>
                    <span>{formatPrice(getCartTotal() * 1.12 + shippingFee)}</span>
                  </div>
                </div>

                {/* Payment Method Display */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Payment Method</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Payment method not selected'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || getCartItemCount() === 0 || shippingFee === 0}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                `Place Order (${formatPrice(getCartTotal() * 1.12 + shippingFee)})`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 