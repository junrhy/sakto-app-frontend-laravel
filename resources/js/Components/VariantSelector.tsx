import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, CheckCircle, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';

interface Variant {
    id?: number;
    sku?: string;
    price?: number;
    stock_quantity: number;
    weight?: number;
    dimensions?: string;
    thumbnail_url?: string;
    attributes: Record<string, string>;
    is_active: boolean;
}

interface VariantSelectorProps {
    product: {
        id: number;
        name: string;
        price: number;
        thumbnail_url?: string;
    };
    variants: Variant[];
    currency: { symbol: string; code: string };
    onAddToCart: (variantId: number, quantity: number) => void;
    maxQuantity?: number;
}

export default function VariantSelector({
    product,
    variants,
    currency,
    onAddToCart,
    maxQuantity = 10,
}: VariantSelectorProps) {
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
        null,
    );
    const [selectedAttributes, setSelectedAttributes] = useState<
        Record<string, string>
    >({});
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState<string>('');

    // Get available attribute options from variants
    const getAvailableAttributes = () => {
        const attributes: Record<string, string[]> = {};

        variants.forEach((variant) => {
            if (variant.is_active) {
                // Remove stock_quantity > 0 check for attribute options
                Object.entries(variant.attributes).forEach(([key, value]) => {
                    if (!attributes[key]) {
                        attributes[key] = [];
                    }
                    if (!attributes[key].includes(value)) {
                        attributes[key].push(value);
                    }
                });
            }
        });

        return attributes;
    };

    const availableAttributes = getAvailableAttributes();

    // Find matching variant based on selected attributes
    const findMatchingVariant = (
        attributes: Record<string, string>,
    ): Variant | null => {
        // If no attributes are selected, return null
        if (Object.keys(attributes).length === 0) {
            return null;
        }

        // Find a variant that has EXACTLY the same attributes
        // This ensures we only match variants that have the exact attribute combination
        return (
            variants.find(
                (variant) =>
                    variant.is_active &&
                    variant.stock_quantity > 0 &&
                    // Check that the variant has exactly the same attributes as selected
                    Object.keys(variant.attributes).length ===
                        Object.keys(attributes).length &&
                    Object.entries(attributes).every(
                        ([key, value]) => variant.attributes[key] === value,
                    ),
            ) || null
        );
    };

    // Check if an attribute combination is valid (has a corresponding variant)
    const isValidAttributeCombination = (
        attributes: Record<string, string>,
    ): boolean => {
        if (Object.keys(attributes).length === 0) {
            return false;
        }

        return variants.some(
            (variant) =>
                variant.is_active &&
                variant.stock_quantity > 0 &&
                // Check that the variant has exactly the same attributes as the combination
                Object.keys(variant.attributes).length ===
                    Object.keys(attributes).length &&
                Object.entries(attributes).every(
                    ([key, value]) => variant.attributes[key] === value,
                ),
        );
    };

    // Handle attribute selection
    const handleAttributeChange = (attributeKey: string, value: string) => {
        // If the same attribute value is already selected, unselect it
        if (selectedAttributes[attributeKey] === value) {
            const newAttributes = { ...selectedAttributes };
            delete newAttributes[attributeKey];
            setSelectedAttributes(newAttributes);

            // Find matching variant
            const matchingVariant = findMatchingVariant(newAttributes);
            setSelectedVariant(matchingVariant);

            // Reset quantity if variant changes
            if (matchingVariant && matchingVariant.stock_quantity < quantity) {
                setQuantity(1);
            }

            setError('');
            return;
        }

        // Check if adding this attribute would create a valid combination
        const newAttributes = { ...selectedAttributes, [attributeKey]: value };

        // If this combination is not valid, don't allow the selection
        if (!isValidAttributeCombination(newAttributes)) {
            setError('This combination is not available');
            return;
        }

        setSelectedAttributes(newAttributes);

        // Find matching variant
        const matchingVariant = findMatchingVariant(newAttributes);
        setSelectedVariant(matchingVariant);

        // Reset quantity if variant changes
        if (matchingVariant && matchingVariant.stock_quantity < quantity) {
            setQuantity(1);
        }

        setError('');
    };

    // Handle quantity change
    const handleQuantityChange = (newQuantity: number) => {
        if (selectedVariant && newQuantity > selectedVariant.stock_quantity) {
            setError(
                `Only ${selectedVariant.stock_quantity} items available in stock`,
            );
            return;
        }

        if (newQuantity > maxQuantity) {
            setError(`Maximum ${maxQuantity} items per order`);
            return;
        }

        setQuantity(newQuantity);
        setError('');
    };

    // Handle add to cart
    const handleAddToCart = () => {
        if (!selectedVariant) {
            setError('Please select a variant');
            return;
        }

        if (quantity > selectedVariant.stock_quantity) {
            setError(
                `Only ${selectedVariant.stock_quantity} items available in stock`,
            );
            return;
        }

        onAddToCart(selectedVariant.id!, quantity);
        setError('');
    };

    // Get effective price (variant price or product price)
    const getEffectivePrice = () => {
        if (selectedVariant && selectedVariant.price) {
            return selectedVariant.price;
        }
        return product.price;
    };

    // Check if all required attributes are selected
    const isVariantComplete = () => {
        // If there are no available attributes, consider it complete
        if (Object.keys(availableAttributes).length === 0) {
            return true;
        }

        // Check if we have a valid variant selected
        const hasMatchingVariant = selectedVariant !== null;

        return hasMatchingVariant;
    };

    // Get stock status text
    const getStockStatus = () => {
        if (!selectedVariant) return '';

        if (selectedVariant.stock_quantity === 0) {
            return 'Out of Stock';
        }

        if (selectedVariant.stock_quantity <= 5) {
            return `Only ${selectedVariant.stock_quantity} left`;
        }

        return `${selectedVariant.stock_quantity} in stock`;
    };

    // Format attribute display
    const formatAttributeDisplay = (attributes: Record<string, string>) => {
        return Object.entries(attributes)
            .map(([key, value]) => {
                // Capitalize and format attribute names
                const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
                return `${formattedKey}: ${value}`;
            })
            .join(' • ');
    };

    // Get color class for different attribute types
    const getAttributeColorClass = (
        attributeKey: string,
        isSelected: boolean,
    ) => {
        if (attributeKey.toLowerCase() === 'color') {
            return isSelected
                ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-600'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600';
        }
        return isSelected
            ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500'
            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100';
    };

    return (
        <div className="space-y-6">
            {/* Product Summary */}
            <div className="flex items-start gap-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-950/50 dark:to-indigo-950/50">
                {product.thumbnail_url && (
                    <img
                        src={product.thumbnail_url}
                        alt={product.name}
                        className="h-16 w-16 rounded-lg border-2 border-white object-cover shadow-sm dark:border-gray-700"
                    />
                )}
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {product.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(
                                getEffectivePrice(),
                                currency.symbol,
                            )}
                        </p>
                        {selectedVariant &&
                            selectedVariant.price &&
                            selectedVariant.price !== product.price && (
                                <span className="text-sm text-gray-500 line-through dark:text-gray-400">
                                    {formatCurrency(
                                        product.price,
                                        currency.symbol,
                                    )}
                                </span>
                            )}
                    </div>
                    {selectedVariant && (
                        <div className="mt-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                {getStockStatus()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Variant Selection */}
            {Object.keys(availableAttributes).length > 0 && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Choose Your Options
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Select your preferred options below
                        </p>
                    </div>

                    {Object.entries(availableAttributes).map(
                        ([attributeKey, options]) => (
                            <div key={attributeKey} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold capitalize text-gray-700 dark:text-gray-300">
                                        {attributeKey}
                                    </label>
                                    {selectedAttributes[attributeKey] && (
                                        <Badge
                                            variant="outline"
                                            className="border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/50 dark:text-green-300"
                                        >
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Selected
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {options.map((option) => {
                                        const isSelected =
                                            selectedAttributes[attributeKey] ===
                                            option;
                                        const isAvailable = variants.some(
                                            (v) =>
                                                v.is_active &&
                                                v.attributes[attributeKey] ===
                                                    option,
                                        );

                                        return (
                                            <button
                                                key={option}
                                                onClick={() =>
                                                    handleAttributeChange(
                                                        attributeKey,
                                                        option,
                                                    )
                                                }
                                                disabled={!isAvailable}
                                                className={`relative rounded-lg border-2 p-3 text-sm font-medium transition-all duration-200 ${getAttributeColorClass(attributeKey, isSelected)} ${!isAvailable ? 'cursor-not-allowed bg-gray-100 text-gray-500 opacity-50 dark:bg-gray-800 dark:text-gray-400' : 'cursor-pointer'} ${isSelected ? 'shadow-md ring-2 ring-blue-500 ring-offset-2 dark:shadow-gray-900/50 dark:ring-offset-gray-900' : 'hover:shadow-sm dark:hover:shadow-gray-900/30'} `}
                                                title={
                                                    isSelected
                                                        ? 'Click to unselect'
                                                        : 'Click to select'
                                                }
                                            >
                                                {/* Color swatch for color attributes */}
                                                {attributeKey.toLowerCase() ===
                                                    'color' && (
                                                    <div
                                                        className="mx-auto mb-2 h-6 w-6 rounded-full border-2 border-white shadow-sm dark:border-gray-700"
                                                        style={{
                                                            backgroundColor:
                                                                option.toLowerCase(),
                                                            backgroundImage:
                                                                option.toLowerCase() ===
                                                                'white'
                                                                    ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                                                                    : 'none',
                                                            backgroundSize:
                                                                '4px 4px',
                                                        }}
                                                    />
                                                )}

                                                <span className="block text-center">
                                                    {option}
                                                </span>

                                                {isSelected && (
                                                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500">
                                                        <CheckCircle className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}

            {/* Selected Variant Summary */}
            {selectedVariant && (
                <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:border-green-700 dark:from-green-950/50 dark:to-emerald-950/50">
                    <div className="mb-3 flex items-center justify-between">
                        <h5 className="flex items-center gap-2 font-semibold text-green-900 dark:text-green-100">
                            <CheckCircle className="h-4 w-4" />
                            Selected Variant
                        </h5>
                        {selectedVariant.sku && (
                            <span className="rounded bg-green-100 px-2 py-1 font-mono text-xs text-green-600 dark:bg-green-900/50 dark:text-green-400">
                                SKU: {selectedVariant.sku}
                            </span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            {Object.entries(selectedVariant.attributes).map(
                                ([key, value]) => (
                                    <Badge
                                        key={key}
                                        variant="secondary"
                                        className="border-green-300 bg-white text-green-800 dark:border-green-600 dark:bg-gray-800 dark:text-green-200"
                                    >
                                        {key.charAt(0).toUpperCase() +
                                            key.slice(1)}
                                        : {value}
                                    </Badge>
                                ),
                            )}
                        </div>

                        <div className="flex items-center justify-between border-t border-green-200 pt-2 dark:border-green-700">
                            <div className="text-sm text-green-700 dark:text-green-300">
                                <span className="font-medium">
                                    {getStockStatus()}
                                </span>
                            </div>
                            {selectedVariant.price &&
                                selectedVariant.price !== product.price && (
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                            Special Price:{' '}
                                            {formatCurrency(
                                                selectedVariant.price,
                                                currency.symbol,
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quantity Selection */}
            <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Quantity
                </label>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            handleQuantityChange(Math.max(1, quantity - 1))
                        }
                        disabled={quantity <= 1}
                        className="h-10 w-10 border-gray-300 p-0 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                    >
                        -
                    </Button>
                    <div className="flex h-10 w-16 items-center justify-center rounded-md border border-gray-300 bg-white font-semibold text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
                        {quantity}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={
                            !selectedVariant ||
                            quantity >=
                                Math.min(
                                    selectedVariant.stock_quantity,
                                    maxQuantity,
                                )
                        }
                        className="h-10 w-10 border-gray-300 p-0 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                    >
                        +
                    </Button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Max:{' '}
                        {selectedVariant
                            ? Math.min(
                                  selectedVariant.stock_quantity,
                                  maxQuantity,
                              )
                            : maxQuantity}
                    </span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/50">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400" />
                    <span className="text-sm text-red-700 dark:text-red-300">
                        {error}
                    </span>
                </div>
            )}

            {/* Add to Cart Button */}
            <Button
                onClick={handleAddToCart}
                disabled={
                    !isVariantComplete() ||
                    !selectedVariant ||
                    selectedVariant.stock_quantity === 0
                }
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700"
                size="lg"
            >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {!isVariantComplete()
                    ? 'Select Options'
                    : !selectedVariant
                      ? 'Select Valid Combination'
                      : selectedVariant.stock_quantity === 0
                        ? 'Out of Stock'
                        : `Add to Cart - ${formatCurrency(getEffectivePrice() * quantity, currency.symbol)}`}
            </Button>

            {/* Stock Warning */}
            {selectedVariant &&
                selectedVariant.stock_quantity <= 5 &&
                selectedVariant.stock_quantity > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/50">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 text-orange-500 dark:text-orange-400" />
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                            ⚠️ Only {selectedVariant.stock_quantity} items left
                            in stock
                        </span>
                    </div>
                )}

            {/* Product Guarantee */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800/50">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                    <span>Premium Quality • Fast Shipping • Easy Returns</span>
                </div>
            </div>
        </div>
    );
}
