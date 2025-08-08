import { useState, useEffect, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, ShoppingBag, User, MapPin, Truck, CreditCard, FileText } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';
import { 
  PHILIPPINE_SHIPPING_RATES, 
  INTERNATIONAL_SHIPPING_RATES, 
  getShippingMethods, 
  getBaseShippingMethods,
  calculateShippingFee,
  type ShippingMethod 
} from '@/config/shipping-rates';
import GuestLayout from '@/Layouts/GuestLayout';

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

interface CheckoutProps {
  products: Product[];
  member: {
    id: number;
    identifier: string | number;
    name: string;
  };
  appCurrency?: { code: string; symbol: string } | null;
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

type CheckoutStep = 'order-summary' | 'customer-info' | 'shipping' | 'payment' | 'review';

export default function Checkout({ products, member, appCurrency }: CheckoutProps) {
  const { toast } = useToast();
  
  // Load cart items from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('community-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('order-summary');
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
    shippingMethod: 'standard',
    paymentMethod: 'cash_on_delivery'
  });

  // Load visitor information from localStorage and prefill form
  useEffect(() => {
    const authData = localStorage.getItem(`visitor_auth_${member.id}`);
    if (authData) {
      try {
        const { visitorInfo } = JSON.parse(authData);
        if (visitorInfo) {
          setFormData(prev => ({
            ...prev,
            firstName: visitorInfo.firstName || '',
            lastName: visitorInfo.lastName || '',
            email: visitorInfo.email || '',
            phone: visitorInfo.phone || '',
          }));
        }
      } catch (error) {
        console.error('Error parsing visitor auth data:', error);
      }
    }
  }, [member.id]);

  // Helper function to get effective stock
  const getEffectiveStock = (product: Product, variant?: any): number => {
    if (variant) {
      return variant.stock_quantity || 0;
    }
    return product.stock_quantity || 0;
  };

  // Helper function to get effective price
  const getEffectivePrice = (product: Product, variant?: any): number => {
    if (variant?.price !== undefined && variant?.price !== null) {
      return typeof variant.price === 'string' ? parseFloat(variant.price) || 0 : variant.price;
    }
    if (product.price === null || product.price === undefined) {
      return 0;
    }
    return typeof product.price === 'string' ? parseFloat(product.price) || 0 : product.price;
  };

  // Helper function to format price
  const formatPrice = (price: number | string): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;
    const symbol = appCurrency?.symbol || '$';
    return `${symbol}${numericPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function to get cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.id);
      if (!product) return total;
      const price = getEffectivePrice(product, item.variant);
      return total + (price * item.quantity);
    }, 0);
  };

  // Helper function to get total weight of cart items
  const getCartTotalWeight = () => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.id);
      if (!product) return total;
      const weight = item.variant?.weight || product.weight || 0;
      return total + (weight * item.quantity);
    }, 0);
  };

  // Helper function to get cart item count
  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Helper function to clear cart
  const clearCart = () => {
    localStorage.removeItem('community-cart');
  };

  // Helper function to remove from cart
  const removeFromCart = (productId: number, variantId?: number) => {
    const updatedCart = cartItems.filter(item => 
      !(item.id === productId && (!variantId ? !item.variant : item.variant?.id === variantId))
    );
    localStorage.setItem('community-cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
  };

  // Helper function to update cart quantity
  const updateCartQuantity = (productId: number, quantity: number, variantId?: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    const product = getProductById(productId);
    if (!product) return;

    const variant = variantId ? product.active_variants?.find(v => v.id === variantId) : undefined;
    const maxStock = getEffectiveStock(product, variant);
    
    if (quantity > maxStock) {
      return;
    }

    const updatedCart = cartItems.map(item => 
      item.id === productId && 
      (!variantId ? !item.variant : item.variant?.id === variantId)
        ? { ...item, quantity }
        : item
    );
    localStorage.setItem('community-cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
  };

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset shipping method to standard when location changes
    if (field === 'country' || field === 'state' || field === 'city') {
      setFormData(prev => ({ ...prev, [field]: value, shippingMethod: 'standard' }));
    }
  };

  // Validation function
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 'customer-info':
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone);
      case 'shipping':
        return !!(formData.address && formData.city && formData.zipCode && formData.phone);
      case 'payment':
        return !!formData.paymentMethod;
      default:
        return true;
    }
  };

  // Get validation errors for current step
  const getValidationErrors = (): string[] => {
    const errors: string[] = [];
    
    switch (currentStep) {
      case 'customer-info':
        if (!formData.firstName) errors.push('First name is required');
        if (!formData.lastName) errors.push('Last name is required');
        if (!formData.email) errors.push('Email address is required');
        if (!formData.phone) errors.push('Phone number is required');
        break;
      case 'shipping':
        if (!formData.address) errors.push('Shipping address is required');
        if (!formData.city) errors.push('City/Municipality is required');
        if (!formData.zipCode) errors.push('ZIP code is required');
        if (!formData.phone) errors.push('Phone number is required');
        break;
      case 'payment':
        if (!formData.paymentMethod) errors.push('Please select a payment method');
        break;
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submission
    if (!validateCurrentStep()) {
      const errors = getValidationErrors();
      toast({
        variant: "destructive",
        title: "Please complete all required fields before placing your order",
        description: errors.join('\n'),
      });
      return;
    }
    
    setIsProcessing(true);

    try {
      // Get contact ID from visitor authorization data
      let contactId = null;
      const authData = localStorage.getItem(`visitor_auth_${member.id}`);
      if (authData) {
        try {
          const { visitorInfo } = JSON.parse(authData);
          contactId = visitorInfo?.contactId || null;
        } catch (error) {
          console.error('Error parsing auth data:', error);
        }
      }

      const orderData = {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
        billing_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
        order_items: cartItems.map(item => {
          const product = products.find(p => p.id === item.id);
          const itemShippingFee = getItemShippingFee(item);
          return {
            product_id: item.id,
            name: product?.name || '',
            variant_id: item.variant?.id || null,
            attributes: item.variant?.attributes || null,
            quantity: item.quantity,
            price: product ? getEffectivePrice(product, item.variant) : 0,
            shipping_fee: itemShippingFee,
          };
        }),
        subtotal: getCartTotal(),
        tax_amount: getCartTotal() * 0.12,
        shipping_fee: shippingFee,
        service_fee: serviceFee,
        discount_amount: 0,
        total_amount: getCartTotal() * 1.12 + shippingFee + serviceFee,
        payment_method: formData.paymentMethod === 'cash_on_delivery' ? 'cod' : formData.paymentMethod,
        notes: formData.notes,
        client_identifier: member?.identifier || member?.id?.toString() || '',
        contact_id: contactId
      };

      console.log('Order data being sent:', orderData);
      console.log('Service fee calculation:', { subtotal: getCartTotal(), serviceFee, percentage: '10%' });
      console.log('Shipping fee calculation:', { 
        totalShippingFee: shippingFee, 
        itemShippingFees: cartItems.map(item => ({
          productId: item.id,
          itemShippingFee: getItemShippingFee(item),
          weight: (item.variant?.weight || products.find(p => p.id === item.id)?.weight || 0) * item.quantity
        }))
      });

      // Submit order using Inertia router
      await router.post(route('member.public-checkout.store'), orderData as any, {
        onSuccess: () => {
          // Clear cart and redirect to success page
          clearCart();
          // Show success message
          toast({
            title: "Order placed successfully!",
            description: "Your order has been submitted and is being processed.",
          });
        },
        onError: (errors) => {
          console.error('Checkout error:', errors);
          toast({
            variant: "destructive",
            title: "There was an error processing your order",
            description: "Please try again or contact support if the problem persists.",
          });
        }
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        variant: "destructive",
        title: "There was an error processing your order",
        description: "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getProductById = (id: number) => products.find(p => p.id === id);

  // Helper function to get the primary or first image for a product
  const getProductImage = (product: Product): string | null => {
    if (product.images && product.images.length > 0) {
      const sortedImages = [...product.images].sort((a, b) => a.sort_order - b.sort_order);
      const primaryImage = sortedImages.find(img => img.is_primary);
      if (primaryImage) {
        return primaryImage.image_url;
      }
      return sortedImages[0].image_url;
    }
    return product.thumbnail_url;
  };

  // Calculate shipping fee for each item individually
  const getItemShippingFee = (item: CartItem): number => {
    const product = products.find(p => p.id === item.id);
    if (!product) return 0;
    
    const itemWeight = (item.variant?.weight || product.weight || 0) * item.quantity;
    return calculateShippingFee(
      formData.country,
      formData.state,
      formData.city,
      formData.shippingMethod,
      itemWeight
    );
  };

  // Calculate total shipping fee by summing individual item shipping fees
  const shippingFee = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + getItemShippingFee(item);
    }, 0);
  }, [cartItems, formData.country, formData.state, formData.city, formData.shippingMethod]);

  // Calculate total weight of cart
  const cartTotalWeight = useMemo(() => {
    return getCartTotalWeight();
  }, [cartItems]);

  // Get available shipping methods (base rates for display)
  const availableShippingMethods = useMemo(() => {
    return getBaseShippingMethods(formData.country, formData.state, formData.city);
  }, [formData.country, formData.state, formData.city]);

  const subtotal = getCartTotal();
  const taxAmount = subtotal * 0.12;
  const serviceFee = subtotal * 0.10; // 10% of subtotal service fee
  const total = subtotal + taxAmount + shippingFee + serviceFee;

  // Checkout steps configuration
  const steps = [
    { id: 'order-summary', title: 'Order Summary', icon: ShoppingBag, completed: cartItems.length > 0 },
    { id: 'customer-info', title: 'Customer Info', icon: User, completed: !!(formData.firstName && formData.lastName && formData.email && formData.phone) },
    { id: 'shipping', title: 'Shipping', icon: MapPin, completed: !!(formData.address && formData.city && formData.zipCode && formData.phone) },
    { id: 'payment', title: 'Payment', icon: CreditCard, completed: !!formData.paymentMethod },
    { id: 'review', title: 'Review', icon: Check, completed: false }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const nextStep = (e?: React.MouseEvent) => {
    // Prevent form submission if this is called from a button inside a form
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      const errors = getValidationErrors();
      toast({
        variant: "destructive",
        title: "Please complete all required fields",
        description: errors.join('\n'),
      });
      return;
    }
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as CheckoutStep);
    }
  };

  const prevStep = (e?: React.MouseEvent) => {
    // Prevent form submission if this is called from a button inside a form
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as CheckoutStep);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'order-summary':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Order Summary</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Review your items before proceeding to checkout</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Your Items ({getCartItemCount()})
              </h3>
              
              <div className="space-y-3 sm:space-y-4 mb-6">
                {cartItems.map((item) => {
                  const product = getProductById(item.id);
                  if (!product) return null;
                  
                  const price = getEffectivePrice(product, item.variant);
                  const totalPrice = price * item.quantity;
                  
                  return (
                    <div key={`${item.id}-${item.variant?.id || 'no-variant'}`} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                        {getProductImage(product) ? (
                          <img
                            src={getProductImage(product)!}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                          {product.name}
                        </div>
                        {item.variant && (
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {Object.entries(item.variant.attributes).map(([key, value]) => `${key}: ${value}`).join(', ')}
                          </div>
                        )}
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {formatPrice(price)} each
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1, item.variant?.id)}
                            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isProcessing}
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="text-sm sm:text-lg font-medium text-gray-900 dark:text-gray-100 min-w-[2rem] sm:min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1, item.variant?.id)}
                            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isProcessing || item.quantity >= getEffectiveStock(product, item.variant)}
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                          {formatPrice(totalPrice)}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id, item.variant?.id)}
                          className="text-xs sm:text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          disabled={isProcessing}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Totals */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="text-gray-600 dark:text-gray-400">Tax (12%)</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatPrice(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatPrice(serviceFee)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Total Weight: {cartTotalWeight.toFixed(2)} kg</span>
                </div>
                
                {/* Shipping Cost Estimator */}
                {formData.country === 'Philippines' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                    <div className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-2">
                      💡 Shipping Cost Guide (Philippines) - Individual Item Weight Based
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className={`text-center p-2 rounded transition-colors ${
                        ['Cebu', 'Bohol', 'Negros Oriental', 'Siquijor'].includes(formData.state) 
                          ? 'bg-green-100 dark:bg-green-800 border-2 border-green-300 dark:border-green-600' 
                          : 'bg-white dark:bg-gray-700'
                      }`}>
                        <div className="font-medium text-green-600 dark:text-green-400">Central Visayas</div>
                        <div className="text-gray-600 dark:text-gray-400">₱150 - ₱200 per item</div>
                        {['Cebu', 'Bohol', 'Negros Oriental', 'Siquijor'].includes(formData.state) && (
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">✓ Selected</div>
                        )}
                      </div>
                      <div className={`text-center p-2 rounded transition-colors ${
                        ['Metro Manila', 'Cavite', 'Laguna', 'Batangas', 'Bulacan', 'Pampanga', 'Nueva Ecija', 'Pangasinan'].includes(formData.state)
                          ? 'bg-orange-100 dark:bg-orange-800 border-2 border-orange-300 dark:border-orange-600'
                          : 'bg-white dark:bg-gray-700'
                      }`}>
                        <div className="font-medium text-orange-600 dark:text-orange-400">Luzon</div>
                        <div className="text-gray-600 dark:text-gray-400">₱300 - ₱450 per item</div>
                        {['Metro Manila', 'Cavite', 'Laguna', 'Batangas', 'Bulacan', 'Pampanga', 'Nueva Ecija', 'Pangasinan'].includes(formData.state) && (
                          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">✓ Selected</div>
                        )}
                      </div>
                      <div className={`text-center p-2 rounded transition-colors ${
                        ['Davao del Sur', 'Davao del Norte', 'Davao Oriental', 'Davao de Oro', 'Davao Occidental', 'Misamis Oriental', 'Bukidnon', 'Lanao del Norte', 'Misamis Occidental', 'Camiguin', 'South Cotabato', 'Cotabato', 'Sultan Kudarat', 'Sarangani', 'Agusan del Norte', 'Agusan del Sur', 'Surigao del Norte', 'Surigao del Sur', 'Dinagat Islands', 'Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay', 'Maguindanao', 'Lanao del Sur', 'Basilan', 'Sulu', 'Tawi-Tawi'].includes(formData.state)
                          ? 'bg-red-100 dark:bg-red-800 border-2 border-red-300 dark:border-red-600'
                          : 'bg-white dark:bg-gray-700'
                      }`}>
                        <div className="font-medium text-red-600 dark:text-red-400">Mindanao</div>
                        <div className="text-gray-600 dark:text-gray-400">₱400 - ₱560 per item</div>
                        {['Davao del Sur', 'Davao del Norte', 'Davao Oriental', 'Davao de Oro', 'Davao Occidental', 'Misamis Oriental', 'Bukidnon', 'Lanao del Norte', 'Misamis Occidental', 'Camiguin', 'South Cotabato', 'Cotabato', 'Sultan Kudarat', 'Sarangani', 'Agusan del Norte', 'Agusan del Sur', 'Surigao del Norte', 'Surigao del Sur', 'Dinagat Islands', 'Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay', 'Maguindanao', 'Lanao del Sur', 'Basilan', 'Sulu', 'Tawi-Tawi'].includes(formData.state) && (
                          <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">✓ Selected</div>
                        )}
                      </div>
                    </div>
                    {formData.state && (
                      <div className="mt-3 p-2 bg-white dark:bg-gray-700 rounded border border-blue-200 dark:border-blue-700">
                        <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          Selected Province: {formData.state}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          Standard Rate: {formatPrice(availableShippingMethods.find(m => m.id === 'standard')?.price || 0)} per item (weight-based)
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between text-lg sm:text-xl font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                  <span className="text-gray-900 dark:text-gray-100">Total</span>
                  <span className="text-blue-600 dark:text-blue-400">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {cartItems.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="text-4xl sm:text-6xl mb-4">🛒</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Your cart is empty</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">Add some items to your cart to continue with checkout</p>
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        );

      case 'customer-info':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Customer Information</h2>
              <p className="text-gray-600 dark:text-gray-400">Please provide your contact details</p>
            </div>

            {/* Validation Summary */}
            {currentStep === 'customer-info' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="text-green-600 dark:text-green-400 text-lg">✅</div>
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <strong>Information Pre-filled:</strong> Your customer information has been automatically filled from your account profile. These fields are locked to prevent accidental changes.
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors cursor-not-allowed"
                  placeholder="Enter your first name"
                  disabled={true}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors cursor-not-allowed"
                  placeholder="Enter your last name"
                  disabled={true}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors cursor-not-allowed"
                placeholder="Enter your email address"
                disabled={true}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors cursor-not-allowed"
                placeholder="Enter your phone number"
                disabled={true}
              />
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Shipping Address</h2>
              <p className="text-gray-600 dark:text-gray-400">Where should we deliver your order?</p>
            </div>

            {/* Validation Summary */}
            {currentStep === 'shipping' && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="text-blue-600 dark:text-blue-400 text-lg">ℹ️</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Required Fields:</strong> All fields marked with * must be completed before proceeding.
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Shipping Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                placeholder="Enter your complete shipping address"
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  City/Municipality *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="Enter your city or municipality"
                  disabled={isProcessing}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  State/Province *
                </label>
                {formData.country === 'Philippines' ? (
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                    disabled={isProcessing}
                  >
                    <option value="">Select Province</option>
                    <optgroup label="Central Visayas">
                      <option value="Cebu">Cebu</option>
                      <option value="Bohol">Bohol</option>
                      <option value="Negros Oriental">Negros Oriental</option>
                      <option value="Siquijor">Siquijor</option>
                    </optgroup>
                    <optgroup label="Western Visayas">
                      <option value="Negros Occidental">Negros Occidental</option>
                      <option value="Iloilo">Iloilo</option>
                    </optgroup>
                    <optgroup label="Luzon">
                      <option value="Metro Manila">Metro Manila</option>
                      <option value="Cavite">Cavite</option>
                      <option value="Laguna">Laguna</option>
                      <option value="Batangas">Batangas</option>
                      <option value="Bulacan">Bulacan</option>
                      <option value="Pampanga">Pampanga</option>
                      <option value="Nueva Ecija">Nueva Ecija</option>
                      <option value="Pangasinan">Pangasinan</option>
                    </optgroup>
                    <optgroup label="Mindanao">
                      <option value="Davao del Sur">Davao del Sur</option>
                      <option value="Davao del Norte">Davao del Norte</option>
                      <option value="Davao Oriental">Davao Oriental</option>
                      <option value="Davao de Oro">Davao de Oro</option>
                      <option value="Davao Occidental">Davao Occidental</option>
                      <option value="Misamis Oriental">Misamis Oriental</option>
                      <option value="Bukidnon">Bukidnon</option>
                      <option value="Lanao del Norte">Lanao del Norte</option>
                      <option value="Misamis Occidental">Misamis Occidental</option>
                      <option value="Camiguin">Camiguin</option>
                      <option value="South Cotabato">South Cotabato</option>
                      <option value="Cotabato">Cotabato</option>
                      <option value="Sultan Kudarat">Sultan Kudarat</option>
                      <option value="Sarangani">Sarangani</option>
                      <option value="Agusan del Norte">Agusan del Norte</option>
                      <option value="Agusan del Sur">Agusan del Sur</option>
                      <option value="Surigao del Norte">Surigao del Norte</option>
                      <option value="Surigao del Sur">Surigao del Sur</option>
                      <option value="Dinagat Islands">Dinagat Islands</option>
                      <option value="Zamboanga del Norte">Zamboanga del Norte</option>
                      <option value="Zamboanga del Sur">Zamboanga del Sur</option>
                      <option value="Zamboanga Sibugay">Zamboanga Sibugay</option>
                      <option value="Maguindanao">Maguindanao</option>
                      <option value="Lanao del Sur">Lanao del Sur</option>
                      <option value="Basilan">Basilan</option>
                      <option value="Sulu">Sulu</option>
                      <option value="Tawi-Tawi">Tawi-Tawi</option>
                    </optgroup>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                    placeholder="State/Province"
                    disabled={isProcessing}
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="Enter your ZIP code"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country *
              </label>
              <select
                required
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                disabled={isProcessing}
              >
                <option value="Philippines">🇵🇭 Philippines</option>
              </select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Shipping Method
              </h3>
              
              {/* Shipping Info Banner */}
              {formData.country === 'Philippines' && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="text-green-600 dark:text-green-400 text-lg">📍</div>
                    <div className="text-sm text-green-800 dark:text-green-200">
                      <span className="text-xs">Base shipping rates shown. Final cost calculated per item based on weight and distance.</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {availableShippingMethods.map((method) => (
                  <label key={`${method.id}-${formData.state}-${formData.city}`} className="flex items-center space-x-3 cursor-pointer p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={method.id}
                      checked={formData.shippingMethod === method.id}
                      onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                      disabled={isProcessing}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {method.name}
                        </div>
                        {method.id === 'overnight' && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full">
                            Fastest
                          </span>
                        )}
                        {method.id === 'express' && (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full">
                            Express
                          </span>
                        )}
                        {method.id === 'standard' && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                            Standard
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {method.description}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        📅 {method.estimated_days}
                      </div>
                      {formData.country === 'Philippines' && formData.state && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          📍 {formData.state} → Central Visayas
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(method.price)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        base rate
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Total: {formatPrice(cartItems.reduce((total, item) => {
                          const product = products.find(p => p.id === item.id);
                          if (!product) return total;
                          const itemWeight = (item.variant?.weight || product.weight || 0) * item.quantity;
                          return total + calculateShippingFee(formData.country, formData.state, formData.city, method.id, itemWeight);
                        }, 0))}
                      </div>
                      {method.id === 'standard' && method.price === 150 && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Local Rate
                        </div>
                      )}
                      {method.id === 'standard' && method.price > 150 && formData.country === 'Philippines' && (
                        <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                          Distance Rate
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Shipping Note */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="text-gray-500 dark:text-gray-400 text-sm">ℹ️</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Note:</strong> Delivery times may vary during holidays and peak seasons. 
                    {formData.country === 'Philippines' && ' Base shipping rates shown. Final shipping cost is calculated per item based on weight and distance, then summed for the total.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Payment Method</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose how you'd like to pay</p>
            </div>

            {/* Validation Summary */}
            {currentStep === 'payment' && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="text-blue-600 dark:text-blue-400 text-lg">ℹ️</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Required:</strong> Please select a payment method before proceeding.
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <label className="flex items-center space-x-4 cursor-pointer p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={formData.paymentMethod === 'cash_on_delivery'}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                  disabled={isProcessing}
                />
                <div className="flex-1">
                  <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Cash on Delivery
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Pay when you receive your order
                  </div>
                </div>
                <div className="text-2xl">💵</div>
              </label>
              
              <label className="flex items-center space-x-4 cursor-pointer p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={formData.paymentMethod === 'bank_transfer'}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                  disabled={isProcessing}
                />
                <div className="flex-1">
                  <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Bank Transfer
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Pay via bank transfer
                  </div>
                </div>
                <div className="text-2xl">🏦</div>
              </label>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</div>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important Note</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    For bank transfers, please wait for our confirmation email with payment instructions before proceeding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Review Your Order</h2>
              <p className="text-gray-600 dark:text-gray-400">Please review your information before placing the order</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</div>
                  <div><span className="font-medium">Email:</span> {formData.email}</div>
                  {formData.phone && <div><span className="font-medium">Phone:</span> {formData.phone}</div>}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Address
                </h3>
                <div className="space-y-2 text-sm">
                  <div>{formData.address}</div>
                  <div>{formData.city}, {formData.state} {formData.zipCode}</div>
                  <div>{formData.country}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Shipping Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Method:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {availableShippingMethods.find(m => m.id === formData.shippingMethod)?.name || 'Standard Shipping'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Time:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {availableShippingMethods.find(m => m.id === formData.shippingMethod)?.estimated_days || '3-5 business days'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping Cost:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Weight:</span>
                  <span className="text-gray-900 dark:text-gray-100">{cartTotalWeight.toFixed(2)} kg</span>
                </div>
                {formData.country === 'Philippines' && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="text-xs text-blue-800 dark:text-blue-200">
                      📍 Shipping from Central Visayas (Cebu) to {formData.state}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Order Notes
              </h3>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                placeholder="Any special instructions for your order..."
                disabled={isProcessing}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <GuestLayout>
      <Head title="Checkout" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => window.history.back()}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center space-x-2 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Checkout</h1>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <ShoppingBag className="w-4 h-4" />
                <span>{getCartItemCount()} items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Desktop Steps */}
            <div className="hidden md:flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.completed;
                const isPast = index < currentStepIndex;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                      isCompleted || isPast
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        isPast ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Steps */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    currentStepIndex > 0
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-blue-500 border-blue-500 text-white'
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Step {currentStepIndex + 1} of {steps.length}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {steps[currentStepIndex].title}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>
              
              {/* Step Indicators */}
              <div className="flex justify-between mt-2">
                {steps.map((step, index) => {
                  const isActive = step.id === currentStep;
                  const isCompleted = step.completed;
                  const isPast = index < currentStepIndex;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                        isCompleted || isPast
                          ? 'bg-green-500 border-green-500 text-white'
                          : isActive
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className={`text-xs mt-1 text-center ${
                        isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.title.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

                        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <form onSubmit={handleSubmit}>
            {currentStep === 'order-summary' ? (
              /* Full width layout for order summary */
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
                {renderStepContent()}
                
                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 sm:mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {currentStepIndex > 0 && (
                    <button
                      type="button"
                      onClick={(e) => prevStep(e)}
                      className="w-full sm:w-auto px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                      disabled={isProcessing}
                    >
                      ← Previous
                    </button>
                  )}
                  
                  {currentStepIndex < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={(e) => nextStep(e)}
                      className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isProcessing || (currentStep === 'order-summary' && cartItems.length === 0)}
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isProcessing || cartItems.length === 0}
                      className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Grid layout for other steps */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
                    {renderStepContent()}
                    
                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 sm:mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      {currentStepIndex > 0 && (
                        <button
                          type="button"
                          onClick={(e) => prevStep(e)}
                          className="w-full sm:w-auto px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                          disabled={isProcessing}
                        >
                          ← Previous
                        </button>
                      )}
                      
                      {currentStepIndex < steps.length - 1 ? (
                        <button
                          type="button"
                          onClick={(e) => nextStep(e)}
                          className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isProcessing}
                        >
                          Next →
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isProcessing || cartItems.length === 0}
                          className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? 'Processing...' : 'Place Order'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Summary (for other steps) */}
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 sticky top-24 sm:top-32">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Quick Summary
                    </h3>
                    
                    {/* Cart Items */}
                    <div className="space-y-3 sm:space-y-4 mb-6 max-h-48 sm:max-h-64 overflow-y-auto">
                      {cartItems.map((item) => {
                        const product = getProductById(item.id);
                        if (!product) return null;
                        
                        const price = getEffectivePrice(product, item.variant);
                        const totalPrice = price * item.quantity;
                        
                        return (
                          <div key={`${item.id}-${item.variant?.id || 'no-variant'}`} className="flex items-center space-x-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-600 rounded-md overflow-hidden">
                              {getProductImage(product) ? (
                                <img
                                  src={getProductImage(product)!}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {product.name}
                              </div>
                              {item.variant && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {Object.entries(item.variant.attributes).map(([key, value]) => `${key}: ${value}`).join(', ')}
                                </div>
                              )}
                                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity} • Weight: {((item.variant?.weight || getProductById(item.id)?.weight || 0) * item.quantity).toFixed(2)} kg
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Shipping: {formatPrice(getItemShippingFee(item))}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatPrice(totalPrice)}
                      </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Totals */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                        <span className="text-gray-900 dark:text-gray-100">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Tax (12%)</span>
                        <span className="text-gray-900 dark:text-gray-100">{formatPrice(taxAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                        <span className="text-gray-900 dark:text-gray-100">{formatPrice(shippingFee)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                        <span className="text-gray-900 dark:text-gray-100">{formatPrice(serviceFee)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Weight: {cartTotalWeight.toFixed(2)} kg</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                        <span className="text-gray-900 dark:text-gray-100">Total</span>
                        <span className="text-blue-600 dark:text-blue-400">{formatPrice(total)}</span>
                      </div>
                    </div>

                    {/* Security Badge */}
                    <div className="mt-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="text-green-600 dark:text-green-400">🔒</div>
                        <div className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                          Secure checkout • Your data is protected
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </GuestLayout>
  );
} 