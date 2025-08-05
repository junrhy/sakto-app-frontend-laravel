import { useCart } from '@/Components/CartContext';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Download, Package, Truck, MapPin, User, Check, ShoppingBag, FileText } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { 
    calculateShippingFee,
    getBaseShippingMethods,
    type ShippingMethod 
} from '@/config/shipping-rates';
import { useToast } from '@/Components/ui/use-toast';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    thumbnail_url?: string;
    type: 'physical' | 'digital' | 'service' | 'subscription';
    stock_quantity?: number;
    productId?: number;
    variantId?: number;
    attributes?: Record<string, string>;
    weight?: number; // Add weight field
}

interface Props extends PageProps {
    currency: {
        symbol: string;
        code: string;
    };
}

type CheckoutStep = 'order-summary' | 'customer-info' | 'shipping' | 'payment' | 'review';

export default function Checkout({ auth, currency }: Props) {
    const { state, getTotalPrice, clearCart } = useCart();
    const { toast } = useToast();
    const [processing, setProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState<CheckoutStep>('order-summary');
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        shipping_address: '',
        billing_address: '',
        payment_method: 'cod',
        notes: '',
        country: 'Philippines',
        state: '',
        city: '',
        zipCode: '',
        shippingMethod: 'standard',
    });

    // Calculate shipping fee for each item individually
    const getItemShippingFee = (item: CartItem): number => {
        const itemWeight = (item.weight || 0) * item.quantity;
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
        return state.items.reduce((total, item) => {
            return total + getItemShippingFee(item);
        }, 0);
    }, [state.items, formData.country, formData.state, formData.city, formData.shippingMethod]);

    // Calculate total weight of cart
    const cartTotalWeight = useMemo(() => {
        return state.items.reduce((total, item) => {
            return total + ((item.weight || 0) * item.quantity);
        }, 0);
    }, [state.items]);

    // Calculate service fee (10% of subtotal)
    const serviceFee = useMemo(() => {
        return getTotalPrice() * 0.10;
    }, [getTotalPrice]);

    // Get available shipping methods
    const availableShippingMethods = useMemo(() => {
        return getBaseShippingMethods(formData.country, formData.state, formData.city);
    }, [formData.country, formData.state, formData.city]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        
        // Reset shipping method to standard when location changes
        if (field === 'country' || field === 'state' || field === 'city') {
            setFormData(prev => ({ ...prev, [field]: value, shippingMethod: 'standard' }));
        }
    };

    // Validation function
    const validateCurrentStep = (): boolean => {
        switch (currentStep) {
            case 'customer-info':
                return !!(formData.customer_name && formData.customer_email && formData.customer_phone);
            case 'shipping':
                return !!(formData.shipping_address && formData.city && formData.zipCode && formData.customer_phone);
            case 'payment':
                return !!formData.payment_method;
            default:
                return true;
        }
    };

    // Get validation errors for current step
    const getValidationErrors = (): string[] => {
        const errors: string[] = [];
        
        switch (currentStep) {
            case 'customer-info':
                if (!formData.customer_name) errors.push('Full name is required');
                if (!formData.customer_email) errors.push('Email address is required');
                if (!formData.customer_phone) errors.push('Phone number is required');
                break;
            case 'shipping':
                if (!formData.shipping_address) errors.push('Shipping address is required');
                if (!formData.city) errors.push('City/Municipality is required');
                if (!formData.zipCode) errors.push('ZIP code is required');
                if (!formData.customer_phone) errors.push('Phone number is required');
                break;
            case 'payment':
                if (!formData.payment_method) errors.push('Please select a payment method');
                break;
        }
        
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (state.items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        if (!formData.customer_name || !formData.customer_email) {
            alert('Please fill in all required fields');
            return;
        }

        setProcessing(true);

        try {
            // Prepare order data
            const orderData = {
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_phone: formData.customer_phone,
                shipping_address: formData.shipping_address,
                billing_address: formData.billing_address,
                order_items: state.items.map((item) => ({
                    product_id: item.productId ?? item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    variant_id: item.variantId ?? null,
                    attributes: item.attributes ?? null,
                    weight: item.weight || 0,
                    shipping_fee: getItemShippingFee(item),
                })),
                subtotal: getTotalPrice(),
                tax_amount: getTotalPrice() * 0.12, // 12% tax
                shipping_fee: shippingFee,
                service_fee: serviceFee,
                discount_amount: 0,
                total_amount: getTotalPrice() * 1.12 + shippingFee + serviceFee,
                payment_method: formData.payment_method,
                notes: formData.notes,
                country: formData.country,
                state: formData.state,
                city: formData.city,
                zipCode: formData.zipCode,
                shipping_method: formData.shippingMethod,
            };

            console.log('Submitting order data:', orderData);

            // Submit order
            await router.post(route('product-orders.store'), orderData);

            // Clear cart on successful order
            clearCart();

            // Redirect to orders page
            router.visit(route('product-orders.index'));
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create order. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const getProductTypeIcon = (type: string) => {
        switch (type) {
            case 'physical':
                return <Package className="h-4 w-4" />;
            case 'digital':
                return <Download className="h-4 w-4" />;
            case 'service':
                return <CreditCard className="h-4 w-4" />;
            case 'subscription':
                return <CreditCard className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    const getProductTypeLabel = (type: string) => {
        switch (type) {
            case 'physical':
                return 'Physical';
            case 'digital':
                return 'Digital';
            case 'service':
                return 'Service';
            case 'subscription':
                return 'Subscription';
            default:
                return type;
        }
    };

    const subtotal = getTotalPrice();
    const taxAmount = subtotal * 0.12;
    const total = subtotal + taxAmount + shippingFee + serviceFee;

    // Checkout steps configuration
    const steps = [
        { id: 'order-summary', title: 'Order Summary', icon: ShoppingBag, completed: state.items.length > 0 },
        { id: 'customer-info', title: 'Customer Info', icon: User, completed: !!(formData.customer_name && formData.customer_email && formData.customer_phone) },
        { id: 'shipping', title: 'Shipping', icon: MapPin, completed: !!(formData.shipping_address && formData.city && formData.zipCode && formData.customer_phone) },
        { id: 'payment', title: 'Payment', icon: CreditCard, completed: !!formData.payment_method },
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
                                Your Items ({state.items.length})
                            </h3>
                            
                            <div className="space-y-3 sm:space-y-4 mb-6">
                                {state.items.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                        <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
                                            {item.thumbnail_url ? (
                                                <img
                                                    src={item.thumbnail_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {item.name}
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {formatCurrency(item.price, currency.symbol)} each
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                                                {formatCurrency(item.price * item.quantity, currency.symbol)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Qty: {item.quantity} • Weight: {((item.weight || 0) * item.quantity).toFixed(2)} kg
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Shipping: {formatCurrency(getItemShippingFee(item), currency.symbol)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Totals */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                                <div className="flex justify-between text-base sm:text-lg">
                                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(subtotal, currency.symbol)}</span>
                                </div>
                                <div className="flex justify-between text-base sm:text-lg">
                                    <span className="text-gray-600 dark:text-gray-400">Tax (12%)</span>
                                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(taxAmount, currency.symbol)}</span>
                                </div>
                                <div className="flex justify-between text-base sm:text-lg">
                                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(shippingFee, currency.symbol)}</span>
                                </div>
                                <div className="flex justify-between text-base sm:text-lg">
                                    <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(serviceFee, currency.symbol)}</span>
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
                                            </div>
                                            <div className={`text-center p-2 rounded transition-colors ${
                                                ['Metro Manila', 'Cavite', 'Laguna', 'Batangas', 'Bulacan', 'Pampanga', 'Nueva Ecija', 'Pangasinan'].includes(formData.state)
                                                    ? 'bg-orange-100 dark:bg-orange-800 border-2 border-orange-300 dark:border-orange-600'
                                                    : 'bg-white dark:bg-gray-700'
                                            }`}>
                                                <div className="font-medium text-orange-600 dark:text-orange-400">Luzon</div>
                                                <div className="text-gray-600 dark:text-gray-400">₱300 - ₱450 per item</div>
                                            </div>
                                            <div className={`text-center p-2 rounded transition-colors ${
                                                ['Davao del Sur', 'Davao del Norte', 'Davao Oriental', 'Davao de Oro', 'Davao Occidental', 'Misamis Oriental', 'Bukidnon', 'Lanao del Norte', 'Misamis Occidental', 'Camiguin', 'South Cotabato', 'Cotabato', 'Sultan Kudarat', 'Sarangani', 'Agusan del Norte', 'Agusan del Sur', 'Surigao del Norte', 'Surigao del Sur', 'Dinagat Islands', 'Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay', 'Maguindanao', 'Lanao del Sur', 'Basilan', 'Sulu', 'Tawi-Tawi'].includes(formData.state)
                                                    ? 'bg-red-100 dark:bg-red-800 border-2 border-red-300 dark:border-red-600'
                                                    : 'bg-white dark:bg-gray-700'
                                            }`}>
                                                <div className="font-medium text-red-600 dark:text-red-400">Mindanao</div>
                                                <div className="text-gray-600 dark:text-gray-400">₱400 - ₱560 per item</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex justify-between text-lg sm:text-xl font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                                    <span className="text-gray-900 dark:text-gray-100">Total</span>
                                    <span className="text-blue-600 dark:text-blue-400">{formatCurrency(total, currency.symbol)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'customer-info':
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Customer Information</h2>
                            <p className="text-gray-600 dark:text-gray-400">Please provide your contact details</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="customer_name" className="text-gray-700 dark:text-gray-300">Full Name *</Label>
                                <Input
                                    id="customer_name"
                                    value={formData.customer_name}
                                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                                    required
                                    placeholder="Enter your full name"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="customer_email" className="text-gray-700 dark:text-gray-300">Email Address *</Label>
                                <Input
                                    id="customer_email"
                                    type="email"
                                    value={formData.customer_email}
                                    onChange={(e) => handleInputChange('customer_email', e.target.value)}
                                    required
                                    placeholder="Enter your email address"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customer_phone" className="text-gray-700 dark:text-gray-300">Phone Number *</Label>
                            <Input
                                id="customer_phone"
                                value={formData.customer_phone}
                                onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                                required
                                placeholder="Enter your phone number"
                                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
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

                        <div className="space-y-2">
                            <Label htmlFor="shipping_address" className="text-gray-700 dark:text-gray-300">Shipping Address *</Label>
                            <Textarea
                                id="shipping_address"
                                value={formData.shipping_address}
                                onChange={(e) => handleInputChange('shipping_address', e.target.value)}
                                required
                                placeholder="Enter your complete shipping address"
                                rows={3}
                                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-gray-700 dark:text-gray-300">City/Municipality *</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    required
                                    placeholder="Enter your city or municipality"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="state" className="text-gray-700 dark:text-gray-300">State/Province *</Label>
                                {formData.country === 'Philippines' ? (
                                    <Select
                                        value={formData.state}
                                        onValueChange={(value) => handleInputChange('state', value)}
                                    >
                                        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400">
                                            <SelectValue placeholder="Select Province" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                                            <SelectGroup>
                                                <SelectLabel className="text-gray-700 dark:text-gray-300 font-semibold text-sm px-2 py-1 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">Central Visayas</SelectLabel>
                                                <SelectItem value="Cebu" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Cebu</SelectItem>
                                                <SelectItem value="Bohol" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Bohol</SelectItem>
                                                <SelectItem value="Negros Oriental" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Negros Oriental</SelectItem>
                                                <SelectItem value="Siquijor" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Siquijor</SelectItem>
                                            </SelectGroup>
                                            
                                            <SelectGroup>
                                                <SelectLabel className="text-gray-700 dark:text-gray-300 font-semibold text-sm px-2 py-1 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">Western Visayas</SelectLabel>
                                                <SelectItem value="Negros Occidental" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Negros Occidental</SelectItem>
                                                <SelectItem value="Iloilo" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Iloilo</SelectItem>
                                            </SelectGroup>
                                            
                                            <SelectGroup>
                                                <SelectLabel className="text-gray-700 dark:text-gray-300 font-semibold text-sm px-2 py-1 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">Luzon</SelectLabel>
                                                <SelectItem value="Metro Manila" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Metro Manila</SelectItem>
                                                <SelectItem value="Cavite" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Cavite</SelectItem>
                                                <SelectItem value="Laguna" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Laguna</SelectItem>
                                                <SelectItem value="Batangas" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Batangas</SelectItem>
                                                <SelectItem value="Bulacan" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Bulacan</SelectItem>
                                                <SelectItem value="Pampanga" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Pampanga</SelectItem>
                                                <SelectItem value="Nueva Ecija" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Nueva Ecija</SelectItem>
                                                <SelectItem value="Pangasinan" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Pangasinan</SelectItem>
                                            </SelectGroup>
                                            
                                            <SelectGroup>
                                                <SelectLabel className="text-gray-700 dark:text-gray-300 font-semibold text-sm px-2 py-1 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">Mindanao</SelectLabel>
                                                <SelectItem value="Davao del Sur" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Davao del Sur</SelectItem>
                                                <SelectItem value="Davao del Norte" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Davao del Norte</SelectItem>
                                                <SelectItem value="Davao Oriental" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Davao Oriental</SelectItem>
                                                <SelectItem value="Davao de Oro" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Davao de Oro</SelectItem>
                                                <SelectItem value="Davao Occidental" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Davao Occidental</SelectItem>
                                                <SelectItem value="Misamis Oriental" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Misamis Oriental</SelectItem>
                                                <SelectItem value="Bukidnon" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Bukidnon</SelectItem>
                                                <SelectItem value="Lanao del Norte" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Lanao del Norte</SelectItem>
                                                <SelectItem value="Misamis Occidental" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Misamis Occidental</SelectItem>
                                                <SelectItem value="Camiguin" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Camiguin</SelectItem>
                                                <SelectItem value="South Cotabato" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">South Cotabato</SelectItem>
                                                <SelectItem value="Cotabato" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Cotabato</SelectItem>
                                                <SelectItem value="Sultan Kudarat" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Sultan Kudarat</SelectItem>
                                                <SelectItem value="Sarangani" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Sarangani</SelectItem>
                                                <SelectItem value="Agusan del Norte" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Agusan del Norte</SelectItem>
                                                <SelectItem value="Agusan del Sur" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Agusan del Sur</SelectItem>
                                                <SelectItem value="Surigao del Norte" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Surigao del Norte</SelectItem>
                                                <SelectItem value="Surigao del Sur" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Surigao del Sur</SelectItem>
                                                <SelectItem value="Dinagat Islands" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Dinagat Islands</SelectItem>
                                                <SelectItem value="Zamboanga del Norte" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Zamboanga del Norte</SelectItem>
                                                <SelectItem value="Zamboanga del Sur" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Zamboanga del Sur</SelectItem>
                                                <SelectItem value="Zamboanga Sibugay" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Zamboanga Sibugay</SelectItem>
                                                <SelectItem value="Maguindanao" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Maguindanao</SelectItem>
                                                <SelectItem value="Lanao del Sur" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Lanao del Sur</SelectItem>
                                                <SelectItem value="Basilan" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Basilan</SelectItem>
                                                <SelectItem value="Sulu" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Sulu</SelectItem>
                                                <SelectItem value="Tawi-Tawi" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Tawi-Tawi</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        id="state"
                                        value={formData.state}
                                        onChange={(e) => handleInputChange('state', e.target.value)}
                                        required
                                        placeholder="State/Province"
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                                    />
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="zipCode" className="text-gray-700 dark:text-gray-300">ZIP Code *</Label>
                                <Input
                                    id="zipCode"
                                    value={formData.zipCode}
                                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                    required
                                    placeholder="Enter your ZIP code"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country" className="text-gray-700 dark:text-gray-300">Country *</Label>
                            <Select
                                value={formData.country}
                                onValueChange={(value) => handleInputChange('country', value)}
                            >
                                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400">
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    <SelectItem value="Philippines" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">🇵🇭 Philippines</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Shipping Method Selection */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                                <Truck className="w-5 h-5 mr-2" />
                                Shipping Method
                            </h3>
                            
                            <div className="space-y-3">
                                {availableShippingMethods.map((method) => (
                                    <label key={method.id} className="flex items-center space-x-3 cursor-pointer p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <input
                                            type="radio"
                                            name="shippingMethod"
                                            value={method.id}
                                            checked={formData.shippingMethod === method.id}
                                            onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                                            className="text-blue-600 focus:ring-blue-500"
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
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {formatCurrency(method.price, currency.symbol)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                base rate
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Total: {formatCurrency(state.items.reduce((total, item) => {
                                                    const itemWeight = (item.weight || 0) * item.quantity;
                                                    return total + calculateShippingFee(formData.country, formData.state, formData.city, method.id, itemWeight);
                                                }, 0), currency.symbol)}
                                            </div>
                                        </div>
                                    </label>
                                ))}
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

                        <div className="space-y-4">
                            <label className="flex items-center space-x-4 cursor-pointer p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="cod"
                                    checked={formData.payment_method === 'cod'}
                                    onChange={(e) => handleInputChange('payment_method', e.target.value)}
                                    className="text-blue-600 focus:ring-blue-500"
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
                                    name="payment_method"
                                    value="bank_transfer"
                                    checked={formData.payment_method === 'bank_transfer'}
                                    onChange={(e) => handleInputChange('payment_method', e.target.value)}
                                    className="text-blue-600 focus:ring-blue-500"
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
                                    <div><span className="font-medium">Name:</span> {formData.customer_name}</div>
                                    <div><span className="font-medium">Email:</span> {formData.customer_email}</div>
                                    {formData.customer_phone && <div><span className="font-medium">Phone:</span> {formData.customer_phone}</div>}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    Shipping Address
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div>{formData.shipping_address}</div>
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
                                    <span className="text-gray-600 dark:text-gray-400">Shipping Cost:</span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">{formatCurrency(shippingFee, currency.symbol)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total Weight:</span>
                                    <span className="text-gray-900 dark:text-gray-100">{cartTotalWeight.toFixed(2)} kg</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Order Notes
                            </h3>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                rows={3}
                                className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                                placeholder="Any special instructions for your order..."
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (state.items.length === 0) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Checkout
                    </h2>
                }
            >
                <Head title="Checkout" />
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                <h3 className="mb-2 text-xl font-medium text-gray-900">
                                    Your cart is empty
                                </h3>
                                <p className="mb-4 text-gray-500">
                                    Add some products to your cart before
                                    checking out.
                                </p>
                                <Button
                                    onClick={() =>
                                        router.visit(route('products.index'))
                                    }
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Products
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Checkout
                </h2>
            }
        >
            <Head title="Checkout" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                {/* Header */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center space-x-4">
                                <button 
                                    onClick={() => router.visit(route('products.index'))}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center space-x-2 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span>Back to Products</span>
                                </button>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Checkout</h1>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                <ShoppingBag className="w-4 h-4" />
                                <span>{state.items.length} items</span>
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
                                            disabled={processing}
                                        >
                                            ← Previous
                                        </button>
                                    )}
                                    
                                    {currentStepIndex < steps.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={(e) => nextStep(e)}
                                            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={processing || (currentStep === 'order-summary' && state.items.length === 0)}
                                        >
                                            Next →
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={processing || state.items.length === 0}
                                            className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? 'Processing...' : 'Place Order'}
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
                                                    disabled={processing}
                                                >
                                                    ← Previous
                                                </button>
                                            )}
                                            
                                            {currentStepIndex < steps.length - 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => nextStep(e)}
                                                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={processing}
                                                >
                                                    Next →
                                                </button>
                                            ) : (
                                                <button
                                                    type="submit"
                                                    disabled={processing || state.items.length === 0}
                                                    className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processing ? 'Processing...' : 'Place Order'}
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
                                            {state.items.map((item) => (
                                                <div key={item.id} className="flex items-center space-x-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-600 rounded-md overflow-hidden">
                                                        {item.thumbnail_url ? (
                                                            <img
                                                                src={item.thumbnail_url}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Qty: {item.quantity} • Weight: {((item.weight || 0) * item.quantity).toFixed(2)} kg
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Shipping: {formatCurrency(getItemShippingFee(item), currency.symbol)}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(item.price * item.quantity, currency.symbol)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order Totals */}
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                                <span className="text-gray-900 dark:text-gray-100">{formatCurrency(subtotal, currency.symbol)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Tax (12%)</span>
                                                <span className="text-gray-900 dark:text-gray-100">{formatCurrency(taxAmount, currency.symbol)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                                <span className="text-gray-900 dark:text-gray-100">{formatCurrency(shippingFee, currency.symbol)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                                                <span className="text-gray-900 dark:text-gray-100">{formatCurrency(serviceFee, currency.symbol)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                                <span>Weight: {cartTotalWeight.toFixed(2)} kg</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                                                <span className="text-gray-900 dark:text-gray-100">Total</span>
                                                <span className="text-blue-600 dark:text-blue-400">{formatCurrency(total, currency.symbol)}</span>
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
        </AuthenticatedLayout>
    );
}
