import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, AlertCircle, CheckCircle, Package, Star } from 'lucide-react';

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
    maxQuantity = 10 
}: VariantSelectorProps) {
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState<string>('');

    // Get available attribute options from variants
    const getAvailableAttributes = () => {
        const attributes: Record<string, string[]> = {};
        
        variants.forEach(variant => {
            if (variant.is_active && variant.stock_quantity > 0) {
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
    const findMatchingVariant = (attributes: Record<string, string>): Variant | null => {
        return variants.find(variant => 
            variant.is_active && 
            variant.stock_quantity > 0 &&
            Object.entries(attributes).every(([key, value]) => 
                variant.attributes[key] === value
            )
        ) || null;
    };

    // Handle attribute selection
    const handleAttributeChange = (attributeKey: string, value: string) => {
        const newAttributes = { ...selectedAttributes, [attributeKey]: value };
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
            setError(`Only ${selectedVariant.stock_quantity} items available in stock`);
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
            setError(`Only ${selectedVariant.stock_quantity} items available in stock`);
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
        return Object.keys(availableAttributes).length === 0 || 
               Object.keys(availableAttributes).every(key => selectedAttributes[key]);
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
    const getAttributeColorClass = (attributeKey: string, isSelected: boolean) => {
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
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl border border-blue-100 dark:border-blue-800">
                {product.thumbnail_url && (
                    <img 
                        src={product.thumbnail_url} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-white dark:border-gray-700 shadow-sm"
                    />
                )}
                <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(getEffectivePrice(), currency.symbol)}
                        </p>
                        {selectedVariant && selectedVariant.price && selectedVariant.price !== product.price && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                {formatCurrency(product.price, currency.symbol)}
                            </span>
                        )}
                    </div>
                    {selectedVariant && (
                        <div className="flex items-center gap-2 mt-2">
                            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                            <span className="text-sm text-green-700 dark:text-green-300 font-medium">{getStockStatus()}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Variant Selection */}
            {Object.keys(availableAttributes).length > 0 && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Choose Your Options</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Select your preferred options below</p>
                    </div>
                    
                    {Object.entries(availableAttributes).map(([attributeKey, options]) => (
                        <div key={attributeKey} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                                    {attributeKey}
                                </label>
                                {selectedAttributes[attributeKey] && (
                                    <Badge variant="outline" className="bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Selected
                                    </Badge>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {options.map(option => {
                                    const isSelected = selectedAttributes[attributeKey] === option;
                                    const isAvailable = variants.some(v => 
                                        v.is_active && 
                                        v.stock_quantity > 0 && 
                                        v.attributes[attributeKey] === option
                                    );
                                    
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => handleAttributeChange(attributeKey, option)}
                                            disabled={!isAvailable}
                                            className={`
                                                relative p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium
                                                ${getAttributeColorClass(attributeKey, isSelected)}
                                                ${!isAvailable ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400' : 'cursor-pointer'}
                                                ${isSelected ? 'shadow-md dark:shadow-gray-900/50' : 'hover:shadow-sm dark:hover:shadow-gray-900/30'}
                                            `}
                                        >
                                            {/* Color swatch for color attributes */}
                                            {attributeKey.toLowerCase() === 'color' && (
                                                <div 
                                                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-700 shadow-sm mx-auto mb-2"
                                                    style={{ 
                                                        backgroundColor: option.toLowerCase(),
                                                        backgroundImage: option.toLowerCase() === 'white' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                                                        backgroundSize: '4px 4px'
                                                    }}
                                                />
                                            )}
                                            
                                            <span className="block text-center">
                                                {option}
                                            </span>
                                            
                                            {isSelected && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Selected Variant Summary */}
            {selectedVariant && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-xl border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Selected Variant
                        </h5>
                        {selectedVariant.sku && (
                            <span className="text-xs text-green-600 dark:text-green-400 font-mono bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
                                SKU: {selectedVariant.sku}
                            </span>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            {Object.entries(selectedVariant.attributes).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="bg-white dark:bg-gray-800 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600">
                                    {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                                </Badge>
                            ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-green-200 dark:border-green-700">
                            <div className="text-sm text-green-700 dark:text-green-300">
                                <span className="font-medium">{getStockStatus()}</span>
                            </div>
                            {selectedVariant.price && selectedVariant.price !== product.price && (
                                <div className="text-right">
                                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                                        Special Price: {formatCurrency(selectedVariant.price, currency.symbol)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quantity Selection */}
            <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</label>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 p-0 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        -
                    </Button>
                    <div className="w-16 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 font-semibold text-gray-900 dark:text-gray-100">
                        {quantity}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={!selectedVariant || quantity >= Math.min(selectedVariant.stock_quantity, maxQuantity)}
                        className="w-10 h-10 p-0 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        +
                    </Button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Max: {selectedVariant ? Math.min(selectedVariant.stock_quantity, maxQuantity) : maxQuantity}
                    </span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                    <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                </div>
            )}

            {/* Add to Cart Button */}
            <Button
                onClick={handleAddToCart}
                disabled={!isVariantComplete() || !selectedVariant || selectedVariant.stock_quantity === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 shadow-lg"
                size="lg"
            >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {!isVariantComplete() 
                    ? 'Select Options' 
                    : !selectedVariant 
                    ? 'Select Variant' 
                    : selectedVariant.stock_quantity === 0 
                    ? 'Out of Stock' 
                    : `Add to Cart - ${formatCurrency(getEffectivePrice() * quantity, currency.symbol)}`
                }
            </Button>

            {/* Stock Warning */}
            {selectedVariant && selectedVariant.stock_quantity <= 5 && selectedVariant.stock_quantity > 0 && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                    <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                        ⚠️ Only {selectedVariant.stock_quantity} items left in stock
                    </span>
                </div>
            )}

            {/* Product Guarantee */}
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                    <span>Premium Quality • Fast Shipping • Easy Returns</span>
                </div>
            </div>
        </div>
    );
} 