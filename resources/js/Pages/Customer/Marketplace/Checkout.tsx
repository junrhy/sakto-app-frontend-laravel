import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Separator } from '@/Components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import {
    calculateShippingFee,
    getBaseShippingMethods,
} from '@/config/shipping-rates';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import type { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Check,
    CreditCard,
    FileText,
    MapPin,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
    User,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { CommunityCurrency } from '../Communities/types';
import type {
    MarketplaceCartItem,
    MarketplaceProduct,
    MarketplaceProductVariant,
} from './components/ProductGrid';

type CheckoutStep =
    | 'order-summary'
    | 'customer-info'
    | 'shipping'
    | 'payment'
    | 'review';

interface MarketplaceCheckoutProps extends PageProps {
    community: {
        id: number | string;
        name: string;
        slug?: string | null;
        identifier?: string | null;
        app_currency?: CommunityCurrency | null;
        contact_number?: string | null;
    };
    products: MarketplaceProduct[];
    project: string;
}

interface CheckoutFormState {
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

const SERVICE_FEE_RATE = 0.1;
const TAX_RATE = 0.12;
const stepOrder: CheckoutStep[] = [
    'order-summary',
    'customer-info',
    'shipping',
    'payment',
    'review',
];

const PAYMENT_METHODS: Array<{
    id: CheckoutFormState['paymentMethod'];
    label: string;
    description: string;
}> = [
    {
        id: 'cash_on_delivery',
        label: 'Cash on Delivery',
        description: 'Pay the courier upon order delivery.',
    },
    {
        id: 'digital_wallet',
        label: 'Digital Wallet',
        description:
            'Send payment through GCash, Maya, or other digital wallets.',
    },
    {
        id: 'bank_transfer',
        label: 'Bank Transfer',
        description:
            'Transfer funds via online banking or over-the-counter deposit.',
    },
];

const isBrowser = typeof window !== 'undefined';

const parseNumeric = (value: unknown): number => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }
    if (typeof value === 'string') {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
};

const roundCurrency = (value: number): number =>
    Math.round((value + Number.EPSILON) * 100) / 100;

export default function MarketplaceCheckout({
    auth,
    community,
    products,
    project,
}: MarketplaceCheckoutProps) {
    const ownerIdentifier =
        community.slug ?? community.identifier ?? community.id;

    const user = auth.user;
    const currencyMeta = useMemo(() => {
        const fallback: CommunityCurrency = {
            symbol: '₱',
            code: 'PHP',
            decimal_separator: '.',
            thousands_separator: ',',
        };
        return community.app_currency ?? user?.app_currency ?? fallback;
    }, [community.app_currency, user]);

    const formatCurrency = (
        value: number | string | null | undefined,
    ): string => {
        const numeric = parseNumeric(value ?? 0);
        const thousands = currencyMeta.thousands_separator ?? ',';
        const decimals = currencyMeta.decimal_separator ?? '.';
        return `${currencyMeta.symbol ?? '₱'}${numeric
            .toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, thousands)
            .replace('.', decimals)}`;
    };

    const cartKeyCandidates = useMemo(() => {
        const ownerKeys = new Set<string>();
        
        // Add owner identifier variations (same as ProductsSection)
        if (ownerIdentifier !== null && ownerIdentifier !== undefined) {
            ownerKeys.add(String(ownerIdentifier));
        }
        
        // Add community identifier variations
        [
            community.identifier,
            community.slug,
            community.id,
        ].forEach((value) => {
            if (value !== null && value !== undefined) {
                const asString = String(value).trim();
                if (asString.length > 0) {
                    ownerKeys.add(asString);
                }
            }
        });
        
        // Add normalized lowercase version (same as ProductsSection)
        const normalizedOwner = String(ownerIdentifier ?? '')
            .trim()
            .toLowerCase();
        if (normalizedOwner.length > 0) {
            ownerKeys.add(normalizedOwner);
        }
        
        // Add default fallback (same as ProductsSection)
        ownerKeys.add('default');

        if (ownerKeys.size === 0) {
            ownerKeys.add(String(ownerIdentifier ?? 'community'));
        }

        const userKeys: string[] = [];
        if (user?.id) {
            userKeys.push(String(user.id));
        }
        userKeys.push('guest');

        const keys: string[] = [];
        ownerKeys.forEach((ownerKey) => {
            userKeys.forEach((userKey) => {
                keys.push(`marketplace-cart-${project}-${ownerKey}-${userKey}`);
            });
        });

        if (!keys.includes('community-cart')) {
            keys.push('community-cart');
        }

        return keys;
    }, [
        project,
        ownerIdentifier,
        community.identifier,
        community.slug,
        community.id,
        user?.id,
    ]);

    const initialCartStateRef = useRef<{
        storageKey: string;
        items: MarketplaceCartItem[];
    } | null>(null);

    if (!initialCartStateRef.current) {
        let resolvedKey =
            cartKeyCandidates[0] ??
            `marketplace-cart-${project}-${String(ownerIdentifier ?? 'community')}-${
                user?.id ?? 'guest'
            }`;
        let resolvedItems: MarketplaceCartItem[] = [];

        if (isBrowser) {
            for (const key of cartKeyCandidates) {
                const saved = window.localStorage.getItem(key);
                if (saved) {
                    resolvedKey = key;
                    try {
                        resolvedItems = JSON.parse(
                            saved,
                        ) as MarketplaceCartItem[];
                    } catch (error) {
                        console.error(
                            'Failed to parse marketplace cart data',
                            error,
                        );
                        resolvedItems = [];
                    }
                    break;
                }
            }
        }

        initialCartStateRef.current = {
            storageKey: resolvedKey,
            items: resolvedItems,
        };
    }

    const [storageKey, setStorageKey] = useState<string>(
        initialCartStateRef.current.storageKey,
    );
    const [cartItems, setCartItems] = useState<MarketplaceCartItem[]>(
        initialCartStateRef.current.items,
    );

    // Track when products have been loaded to clean up cart only once
    const productsLoadedRef = useRef<string>('');

    // Load cart items from localStorage on mount and when cartKeyCandidates change
    useEffect(() => {
        if (!isBrowser) {
            return;
        }
        if (cartKeyCandidates.length === 0) {
            return;
        }

        // Try to find cart items from any candidate key
        let foundKey: string | null = null;
        let foundItems: MarketplaceCartItem[] = [];

        for (const key of cartKeyCandidates) {
            const saved = window.localStorage.getItem(key);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved) as MarketplaceCartItem[];
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        foundKey = key;
                        foundItems = parsed;
                        break;
                    }
                } catch (error) {
                    console.error(
                        'Failed to parse marketplace cart data',
                        error,
                    );
                }
            }
        }

        // If we found items, use them (this ensures we always have the latest cart)
        if (foundKey && foundItems.length > 0) {
            setCartItems(foundItems);
            setStorageKey(foundKey);
        } else if (foundKey) {
            // Found key but no items, just update the storage key
            setStorageKey(foundKey);
        } else {
            // No cart found, use the preferred key
            const preferredKey = cartKeyCandidates[0];
            if (preferredKey && storageKey !== preferredKey) {
        setStorageKey(preferredKey);
            }
        }
    }, [cartKeyCandidates, isBrowser]); // Removed cartItems and storageKey from dependencies to avoid loops

    const [currentStep, setCurrentStep] =
        useState<CheckoutStep>('order-summary');
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState<CheckoutFormState>({
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
        paymentMethod: 'cash_on_delivery',
    });

    useEffect(() => {
        if (!user) {
            return;
        }

        const nameSegments = user.name?.split(' ') ?? [];
        const firstName = nameSegments.shift() ?? '';
        const lastName = nameSegments.join(' ');

        setFormData((prev) => ({
            ...prev,
            firstName: prev.firstName || firstName,
            lastName: prev.lastName || lastName,
            email: prev.email || user.email || '',
            phone: prev.phone || user.contact_number || '',
        }));
    }, [user]);

    useEffect(() => {
        if (!isBrowser) {
            return;
        }
        if (cartItems.length === 0) {
            window.localStorage.removeItem(storageKey);
            window.localStorage.removeItem('community-cart');
            return;
        }
        const payload = JSON.stringify(cartItems);
        window.localStorage.setItem(storageKey, payload);
        window.localStorage.setItem('community-cart', payload);
    }, [cartItems, storageKey]);

    const getProductById = useCallback(
        (productId: number | string) =>
            products.find(
                (product) => String(product.id) === String(productId),
            ),
        [products],
    );

    // Clean up cart items that don't have matching products (only when products change)
    useEffect(() => {
        if (products.length === 0) {
            return;
        }

        // Create a signature of current products to detect when they change
        const productsSignature = products.map(p => p.id).sort().join(',');
        
        // Only clean up when products actually change, not on every render
        if (productsLoadedRef.current === productsSignature) {
            return;
        }

        // Use functional update to get latest cartItems without adding to dependencies
        setCartItems((currentCartItems) => {
            if (currentCartItems.length === 0) {
                productsLoadedRef.current = productsSignature;
                return currentCartItems;
            }

            const availableItems = currentCartItems.filter((item) => {
                const product = getProductById(item.id);
                return product !== undefined;
            });

            if (availableItems.length !== currentCartItems.length) {
                const removedCount = currentCartItems.length - availableItems.length;
                if (removedCount > 0) {
                    toast.warning(
                        `${removedCount} item(s) removed from cart - no longer available.`,
                    );
                }
                return availableItems;
            }

            return currentCartItems;
        });

        // Mark this products set as processed
        productsLoadedRef.current = productsSignature;
    }, [products, getProductById]);

    const getEffectiveStock = (
        product: MarketplaceProduct | undefined,
        variant?: MarketplaceProductVariant | null,
    ): number => {
        if (!product) {
            return 0;
        }
        if (variant) {
            return parseNumeric(
                variant.stock_quantity ?? product.stock_quantity ?? 0,
            );
        }
        return parseNumeric(product.stock_quantity ?? 0);
    };

    const getEffectivePrice = (
        product: MarketplaceProduct | undefined,
        variant?: MarketplaceProductVariant | null,
    ): number => {
        if (!product) {
            return 0;
        }
        if (variant?.price !== undefined && variant?.price !== null) {
            return parseNumeric(variant.price);
        }
        return parseNumeric(product.price);
    };

    const getItemWeight = (
        item: MarketplaceCartItem,
        product: MarketplaceProduct | undefined,
    ): number => {
        const variantWeight = item.variant
            ? parseNumeric(item.variant.weight)
            : 0;
        const productWeight = parseNumeric(product?.weight);
        const weight = variantWeight || productWeight;
        return weight * item.quantity;
    };

    const getItemShippingFee = useCallback(
        (item: MarketplaceCartItem): number => {
            const product = getProductById(item.id);
            const itemWeight = getItemWeight(item, product);
            if (itemWeight <= 0) {
                return 0;
            }
            return calculateShippingFee(
                formData.country,
                formData.state,
                formData.city,
                formData.shippingMethod,
                itemWeight,
            );
        },
        [
            formData.country,
            formData.state,
            formData.city,
            formData.shippingMethod,
            getProductById,
        ],
    );

    const cartSubtotal = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const product = getProductById(item.id);
            if (!product) {
                return total;
            }
            const price = getEffectivePrice(product, item.variant);
            return total + price * item.quantity;
        }, 0);
    }, [cartItems, getProductById]);

    const cartTotalWeight = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const product = getProductById(item.id);
            return total + getItemWeight(item, product);
        }, 0);
    }, [cartItems, getProductById]);

    const shippingFee = useMemo(() => {
        return cartItems.reduce((total, item) => {
            return total + getItemShippingFee(item);
        }, 0);
    }, [cartItems, getItemShippingFee]);

    const serviceFee = useMemo(
        () => cartSubtotal * SERVICE_FEE_RATE,
        [cartSubtotal],
    );

    const taxAmount = useMemo(() => cartSubtotal * TAX_RATE, [cartSubtotal]);

    const availableShippingMethods = useMemo(() => {
        const baseMethods = getBaseShippingMethods(
            formData.country,
            formData.state,
            formData.city,
        );

        return baseMethods.map((method) => ({
            ...method,
            price: calculateShippingFee(
                formData.country,
                formData.state,
                formData.city,
                method.id,
                cartTotalWeight,
            ),
        }));
    }, [formData.country, formData.state, formData.city, cartTotalWeight]);

    useEffect(() => {
        if (
            availableShippingMethods.length > 0 &&
            !availableShippingMethods.some(
                (method) => method.id === formData.shippingMethod,
            )
        ) {
            setFormData((prev) => ({
                ...prev,
                shippingMethod: availableShippingMethods[0]?.id ?? 'standard',
            }));
        }
    }, [availableShippingMethods, formData.shippingMethod]);

    const orderTotal = useMemo(() => {
        return cartSubtotal + shippingFee + serviceFee + taxAmount;
    }, [cartSubtotal, shippingFee, serviceFee, taxAmount]);

    const persistCart = (items: MarketplaceCartItem[]) => {
        if (!isBrowser) {
            return;
        }

        if (items.length === 0) {
            window.localStorage.removeItem(storageKey);
            window.localStorage.removeItem('community-cart');
            return;
        }

        const payload = JSON.stringify(items);
        window.localStorage.setItem(storageKey, payload);
        window.localStorage.setItem('community-cart', payload);
    };

    const handleQuantityChange = (
        productId: number | string,
        variantId: number | string | undefined,
        quantity: number,
    ) => {
        if (Number.isNaN(quantity) || quantity <= 0) {
            toast.error('Quantity must be at least 1.');
            return;
        }

        const product = getProductById(productId);
        if (!product) {
            toast.error('Product not found.');
            return;
        }

        const variant = variantId
            ? (product.active_variants ?? []).find(
                  (item) => String(item.id) === String(variantId),
              )
            : undefined;
        const maxStock = getEffectiveStock(product, variant);

        if (maxStock > 0 && quantity > maxStock) {
            toast.error(
                `Only ${maxStock} ${
                    maxStock === 1 ? 'unit is' : 'units are'
                } available for this item.`,
            );
            return;
        }

        const updatedCart = cartItems.map((item) =>
            String(item.id) === String(productId) &&
            (variantId
                ? String(item.variant?.id) === String(variantId)
                : !variantId && !item.variant)
                ? { ...item, quantity }
                : item,
        );

        setCartItems(updatedCart);
        persistCart(updatedCart);
    };

    const removeFromCart = (
        productId: number | string,
        variantId?: number | string,
    ) => {
        const updatedCart = cartItems.filter((item) => {
            if (String(item.id) !== String(productId)) {
                return true;
            }
            if (!variantId) {
                return Boolean(item.variant);
            }
            return String(item.variant?.id) !== String(variantId);
        });

        setCartItems(updatedCart);
        persistCart(updatedCart);
        toast.success('Item removed from cart.');
    };

    const clearCart = () => {
        setCartItems([]);
        if (isBrowser) {
            cartKeyCandidates.forEach((key) => {
                window.localStorage.removeItem(key);
            });
        }
        if (cartKeyCandidates[0]) {
            setStorageKey(cartKeyCandidates[0]);
        }
    };

    const getCurrentStepIndex = () =>
        stepOrder.findIndex((step) => step === currentStep);

    const goToNextStep = () => {
        if (!validateCurrentStep()) {
            const errors = getValidationErrors();
            toast.error(
                errors.length > 0
                    ? errors.join('\n')
                    : 'Please complete the required information before continuing.',
            );
            return;
        }

        const currentIndex = getCurrentStepIndex();
        if (currentIndex < stepOrder.length - 1) {
            setCurrentStep(stepOrder[currentIndex + 1]);
        }
    };

    const goToPreviousStep = () => {
        const currentIndex = getCurrentStepIndex();
        if (currentIndex > 0) {
            setCurrentStep(stepOrder[currentIndex - 1]);
        }
    };

    const validateCurrentStep = (): boolean => {
        switch (currentStep) {
            case 'order-summary':
                return cartItems.length > 0;
            case 'customer-info':
                return Boolean(
                    formData.firstName &&
                        formData.lastName &&
                        formData.email &&
                        formData.phone,
                );
            case 'shipping':
                return Boolean(
                    formData.address &&
                        formData.city &&
                        formData.zipCode &&
                        formData.phone,
                );
            case 'payment':
                return Boolean(formData.paymentMethod);
            case 'review':
                return cartItems.length > 0;
            default:
                return true;
        }
    };

    const getValidationErrors = (): string[] => {
        const errors: string[] = [];

        switch (currentStep) {
            case 'order-summary':
                if (cartItems.length === 0) {
                    errors.push('Your cart is empty.');
                }
                break;
            case 'customer-info':
                if (!formData.firstName) errors.push('First name is required.');
                if (!formData.lastName) errors.push('Last name is required.');
                if (!formData.email) errors.push('Email address is required.');
                if (!formData.phone) errors.push('Phone number is required.');
                break;
            case 'shipping':
                if (!formData.address)
                    errors.push('Shipping address is required.');
                if (!formData.city)
                    errors.push('City / Municipality is required.');
                if (!formData.zipCode) errors.push('ZIP code is required.');
                if (!formData.phone) errors.push('Phone number is required.');
                break;
            case 'payment':
                if (!formData.paymentMethod)
                    errors.push('Please choose a payment method.');
                break;
            case 'review':
                if (cartItems.length === 0) {
                    errors.push('Cannot place an order with an empty cart.');
                }
                break;
        }

        return errors;
    };

    const handleFormChange = (
        field: keyof CheckoutFormState,
        value: string,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (['country', 'state', 'city'].includes(field)) {
            setFormData((prev) => ({
                ...prev,
                shippingMethod: 'standard',
            }));
        }
    };

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty.');
            return;
        }

        if (!validateCurrentStep()) {
            const errors = getValidationErrors();
            toast.error(
                errors.length > 0
                    ? errors.join('\n')
                    : 'Please complete the required information before placing your order.',
            );
            return;
        }

        const orderItems = cartItems.reduce<
            Array<{
                product_id: number;
                name: string;
                variant_id: number | null;
                attributes: Record<string, string> | null | undefined;
                quantity: number;
                price: number;
                shipping_fee: number;
            }>
        >((items, cartItem) => {
            const product = getProductById(cartItem.id);
            if (!product) {
                return items;
            }
            const price = getEffectivePrice(product, cartItem.variant);
            const shipping = getItemShippingFee(cartItem);

            items.push({
                product_id: Number.parseInt(String(product.id), 10),
                name: product.name ?? 'Product',
                variant_id: cartItem.variant?.id
                    ? Number.parseInt(String(cartItem.variant.id), 10)
                    : null,
                attributes: cartItem.variant?.attributes ?? null,
                quantity: cartItem.quantity,
                price,
                shipping_fee: roundCurrency(shipping),
            });

            return items;
        }, []);

        if (orderItems.length === 0) {
            toast.error(
                'We could not identify the items in your cart. Please refresh and try again.',
            );
            return;
        }

        const csrfToken = isBrowser
            ? (document
                  .querySelector('meta[name="csrf-token"]')
                  ?.getAttribute('content') ?? '')
            : '';

        const orderPayload = {
            customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
            customer_email: formData.email,
            customer_phone: formData.phone,
            shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
            billing_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
            order_items: orderItems,
            subtotal: roundCurrency(cartSubtotal),
            tax_amount: roundCurrency(taxAmount),
            shipping_fee: roundCurrency(shippingFee),
            service_fee: roundCurrency(serviceFee),
            discount_amount: 0,
            total_amount: roundCurrency(orderTotal),
            payment_method:
                formData.paymentMethod === 'cash_on_delivery'
                    ? 'cod'
                    : formData.paymentMethod,
            notes: formData.notes,
            client_identifier:
                community.identifier ?? community.slug ?? String(community.id),
            contact_id:
                (user as unknown as { contact_id?: number })?.contact_id ??
                (user as unknown as { metadata?: { contact_id?: number } })
                    ?.metadata?.contact_id ??
                null,
            shipping_method: formData.shippingMethod,
            country: formData.country,
            state: formData.state,
            city: formData.city,
            zip_code: formData.zipCode,
        };

        setIsProcessing(true);

        try {
            const response = await fetch(
                route('customer.projects.marketplace.orders.store', {
                    project,
                    owner: ownerIdentifier,
                }),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify(orderPayload),
                },
            );

            if (!response.ok) {
                const payload = await response
                    .json()
                    .catch(() => ({ error: 'Failed to place order' }));
                throw new Error(
                    payload?.error ??
                        'There was an error processing your order.',
                );
            }

            clearCart();
            toast.success(
                'Order placed successfully! You can track it from your orders page.',
            );

            router.visit(
                route('customer.projects.marketplace.overview', {
                    project,
                    owner: ownerIdentifier,
                }),
            );
        } catch (error) {
            console.error(error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'There was an error processing your order.',
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const stepDetails: Record<
        CheckoutStep,
        {
            title: string;
            description: string;
            icon: React.ReactNode;
        }
    > = {
        'order-summary': {
            title: 'Order Summary',
            description: 'Review items in your cart.',
            icon: <ShoppingBag className="h-5 w-5" />,
        },
        'customer-info': {
            title: 'Customer Information',
            description: 'Tell us how to reach you.',
            icon: <User className="h-5 w-5" />,
        },
        shipping: {
            title: 'Shipping Details',
            description: 'Where should we deliver your order?',
            icon: <MapPin className="h-5 w-5" />,
        },
        payment: {
            title: 'Payment Method',
            description: 'Choose how you would like to pay.',
            icon: <CreditCard className="h-5 w-5" />,
        },
        review: {
            title: 'Review & Confirm',
            description: 'Double-check everything before placing your order.',
            icon: <FileText className="h-5 w-5" />,
        },
    };

    const renderOrderSummary = () => (
        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Cart Items
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {cartItems.length === 0 ? (
                    <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
                        Your cart is empty.{' '}
                        <Link
                            className="font-medium text-indigo-600 underline dark:text-indigo-300"
                            href={route(
                                'customer.projects.marketplace.overview',
                                {
                                    project,
                                    owner: ownerIdentifier,
                                },
                            )}
                        >
                            Return to marketplace
                        </Link>{' '}
                        to continue shopping.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">
                                    Item
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Price
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Quantity
                                </TableHead>
                                <TableHead className="text-right text-gray-900 dark:text-white">
                                    Subtotal
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cartItems.map((item) => {
                                const product = getProductById(item.id);
                                if (!product) {
                                    return null;
                                }

                                const price = getEffectivePrice(
                                    product,
                                    item.variant,
                                );
                                const lineTotal = price * item.quantity;

                                return (
                                    <TableRow
                                        key={`${item.id}${
                                            item.variant?.id
                                                ? `-${item.variant.id}`
                                                : ''
                                        }`}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <TableCell className="max-w-[220px] text-gray-900 dark:text-white">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {product.name}
                                                </p>
                                                {item.variant?.attributes && (
                                                    <div className="flex flex-wrap gap-1 text-xs text-gray-500 dark:text-gray-300">
                                                        {Object.entries(
                                                            item.variant
                                                                .attributes,
                                                        ).map(
                                                            ([key, value]) => (
                                                                <Badge
                                                                    key={`${item.id}-${key}-${value}`}
                                                                    variant="outline"
                                                                >
                                                                    {key}:{' '}
                                                                    {String(value)}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {formatCurrency(price)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item.id,
                                                            item.variant?.id,
                                                            Math.max(
                                                                1,
                                                                item.quantity -
                                                                    1,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity}
                                                    onChange={(event) =>
                                                        handleQuantityChange(
                                                            item.id,
                                                            item.variant?.id,
                                                            Number.parseInt(
                                                                event.target
                                                                    .value,
                                                                10,
                                                            ),
                                                        )
                                                    }
                                                    className="h-8 w-16 text-center"
                                                />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item.id,
                                                            item.variant?.id,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-gray-900 dark:text-white">
                                            <div className="flex items-center justify-end gap-2">
                                                {formatCurrency(lineTotal)}
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600"
                                                    onClick={() =>
                                                        removeFromCart(
                                                            item.id,
                                                            item.variant?.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );

    const renderCustomerInfo = () => (
        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Contact Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(event) =>
                                handleFormChange(
                                    'firstName',
                                    event.target.value,
                                )
                            }
                            placeholder="Juan"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(event) =>
                                handleFormChange('lastName', event.target.value)
                            }
                            placeholder="Dela Cruz"
                        />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(event) =>
                                handleFormChange('email', event.target.value)
                            }
                            placeholder="juan@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(event) =>
                                handleFormChange('phone', event.target.value)
                            }
                            placeholder="+63 900 000 0000"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (optional)</Label>
                    <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(event) =>
                            handleFormChange('notes', event.target.value)
                        }
                        placeholder="Any instructions for delivery?"
                        rows={4}
                    />
                </div>
            </CardContent>
        </Card>
    );

    const renderShippingDetails = () => (
        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Shipping Details
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                        id="address"
                        value={formData.address}
                        onChange={(event) =>
                            handleFormChange('address', event.target.value)
                        }
                        placeholder="House number, street name"
                    />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="city">City / Municipality</Label>
                        <Input
                            id="city"
                            value={formData.city}
                            onChange={(event) =>
                                handleFormChange('city', event.target.value)
                            }
                            placeholder="Cebu City"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state">Province / State</Label>
                        <Input
                            id="state"
                            value={formData.state}
                            onChange={(event) =>
                                handleFormChange('state', event.target.value)
                            }
                            placeholder="Cebu"
                        />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                        <Input
                            id="zipCode"
                            value={formData.zipCode}
                            onChange={(event) =>
                                handleFormChange('zipCode', event.target.value)
                            }
                            placeholder="6000"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            value={formData.country}
                            onChange={(event) =>
                                handleFormChange('country', event.target.value)
                            }
                            placeholder="Philippines"
                        />
                    </div>
                </div>

                <Separator />

                <div className="space-y-3">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Shipping Method
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Rates are automatically adjusted based on total
                            weight and delivery location.
                        </p>
                    </div>
                    <RadioGroup
                        value={formData.shippingMethod}
                        onValueChange={(value) =>
                            handleFormChange('shippingMethod', value)
                        }
                        className="space-y-3"
                    >
                        {availableShippingMethods.map((method) => (
                            <Label
                                key={method.id}
                                htmlFor={`shipping-${method.id}`}
                                className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-indigo-200 dark:border-gray-700 dark:hover:border-indigo-500"
                            >
                                <RadioGroupItem
                                    id={`shipping-${method.id}`}
                                    value={method.id}
                                    className="mt-1"
                                />
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {method.name}
                                        </p>
                                        <Badge variant="outline">
                                            {formatCurrency(method.price)}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {method.description}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Estimated delivery:{' '}
                                        {method.estimated_days}
                                    </p>
                                </div>
                            </Label>
                        ))}
                    </RadioGroup>
                </div>
            </CardContent>
        </Card>
    );

    const renderPaymentMethods = () => (
        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Payment Method
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                        handleFormChange('paymentMethod', value)
                    }
                    className="space-y-3"
                >
                    {PAYMENT_METHODS.map((method) => (
                        <Label
                            key={method.id}
                            htmlFor={`payment-${method.id}`}
                            className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-indigo-200 dark:border-gray-700 dark:hover:border-indigo-500"
                        >
                            <RadioGroupItem
                                id={`payment-${method.id}`}
                                value={method.id}
                                className="mt-1"
                            />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {method.label}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {method.description}
                                </p>
                            </div>
                        </Label>
                    ))}
                </RadioGroup>
            </CardContent>
        </Card>
    );

    const renderReview = () => (
        <div className="space-y-4">
            <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Order Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center justify-between">
                            <span>Subtotal</span>
                            <span>{formatCurrency(cartSubtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Tax (12%)</span>
                            <span>{formatCurrency(taxAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Shipping</span>
                            <span>{formatCurrency(shippingFee)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Service Fee (10%)</span>
                            <span>{formatCurrency(serviceFee)}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-base font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(orderTotal)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Customer Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                        <p className="font-medium">Contact Information</p>
                        <p>
                            {formData.firstName} {formData.lastName}
                        </p>
                        <p>{formData.email}</p>
                        <p>{formData.phone}</p>
                    </div>
                    <Separator />
                    <div>
                        <p className="font-medium">Shipping Address</p>
                        <p>
                            {formData.address}, {formData.city},{' '}
                            {formData.state} {formData.zipCode},{' '}
                            {formData.country}
                        </p>
                        <p>
                            Method:{' '}
                            {
                                availableShippingMethods.find(
                                    (method) =>
                                        method.id === formData.shippingMethod,
                                )?.name
                            }
                        </p>
                    </div>
                    <Separator />
                    <div>
                        <p className="font-medium">Payment Method</p>
                        <p>
                            {
                                PAYMENT_METHODS.find(
                                    (method) =>
                                        method.id === formData.paymentMethod,
                                )?.label
                            }
                        </p>
                    </div>
                    {formData.notes && (
                        <>
                            <Separator />
                            <div>
                                <p className="font-medium">Notes</p>
                                <p>{formData.notes}</p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const renderCurrentStepContent = () => {
        switch (currentStep) {
            case 'order-summary':
                return renderOrderSummary();
            case 'customer-info':
                return renderCustomerInfo();
            case 'shipping':
                return renderShippingDetails();
            case 'payment':
                return renderPaymentMethods();
            case 'review':
                return renderReview();
            default:
                return null;
        }
    };

    return (
        <CustomerLayout
            auth={auth}
            title="Marketplace Checkout"
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Marketplace Checkout
                    </h2>
                    <Button asChild variant="outline">
                        <Link
                            href={route(
                                'customer.projects.marketplace.overview',
                                {
                                    project,
                                    owner: ownerIdentifier,
                                },
                            )}
                        >
                            Back to Marketplace
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title={`Checkout • ${community.name}`} />

            <div className="space-y-6">
                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/60">
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid gap-4 sm:grid-cols-5">
                            {stepOrder.map((step, index) => {
                                const status =
                                    index < getCurrentStepIndex()
                                        ? 'complete'
                                        : index === getCurrentStepIndex()
                                          ? 'current'
                                          : 'upcoming';

                                return (
                                    <div
                                        key={step}
                                        className="flex flex-col gap-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                                                    status === 'complete'
                                                        ? 'border-green-500 bg-green-500 text-white'
                                                        : status === 'current'
                                                          ? 'border-indigo-500 bg-indigo-500 text-white'
                                                          : 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                }`}
                                            >
                                                {status === 'complete' ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    index + 1
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {stepDetails[step].title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {
                                                        stepDetails[step]
                                                            .description
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <div className="space-y-6">
                        {renderCurrentStepContent()}
                        <div className="flex justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={goToPreviousStep}
                                disabled={currentStep === 'order-summary'}
                            >
                                Previous
                            </Button>
                            {currentStep === 'review' ? (
                                <Button
                                    type="button"
                                    onClick={handlePlaceOrder}
                                    disabled={
                                        isProcessing || cartItems.length === 0
                                    }
                                >
                                    {isProcessing
                                        ? 'Placing Order…'
                                        : 'Place Order'}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={goToNextStep}
                                    disabled={
                                        currentStep === 'order-summary' &&
                                        cartItems.length === 0
                                    }
                                >
                                    Continue
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Order Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                <div className="flex items-center justify-between">
                                    <span>Items ({cartItems.length})</span>
                                    <span>{formatCurrency(cartSubtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Tax (12%)</span>
                                    <span>{formatCurrency(taxAmount)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Shipping</span>
                                    <span>{formatCurrency(shippingFee)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Service Fee (10%)</span>
                                    <span>{formatCurrency(serviceFee)}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between text-base font-semibold text-gray-900 dark:text-gray-100">
                                    <span>Total</span>
                                    <span>{formatCurrency(orderTotal)}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    By placing your order, you agree to the
                                    marketplace terms and understand that your
                                    selected community partner will fulfill and
                                    manage the order.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
