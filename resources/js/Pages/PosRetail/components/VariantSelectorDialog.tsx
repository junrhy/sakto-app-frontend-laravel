import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Layers } from 'lucide-react';
import { useState } from 'react';

interface Variant {
    id: number;
    sku?: string;
    barcode?: string;
    price?: number;
    quantity: number;
    attributes: Record<string, string>;
    image?: string;
    is_active: boolean;
}

interface VariantSelectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productName: string;
    basePrice: number;
    basePriceFormatted: string;
    variants: Variant[];
    appCurrency?: any;
    onSelectVariant: (variant: Variant | null) => void;
}

export default function VariantSelectorDialog({
    open,
    onOpenChange,
    productName,
    basePrice,
    basePriceFormatted,
    variants,
    appCurrency,
    onSelectVariant,
}: VariantSelectorDialogProps) {
    const [selectedVariantId, setSelectedVariantId] = useState<string>('base');

    const handleConfirm = () => {
        if (selectedVariantId === 'base') {
            onSelectVariant(null);
        } else {
            const variant = variants.find((v) => v.id.toString() === selectedVariantId);
            if (variant) {
                onSelectVariant(variant);
            }
        }
        onOpenChange(false);
    };

    const formatAttributes = (attributes: Record<string, string>) => {
        return Object.entries(attributes)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    };

    const getPrice = (variant: Variant | null) => {
        if (variant && variant.price) {
            return variant.price;
        }
        return basePrice;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Layers className="h-5 w-5" />
                        Select Variant - {productName}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <RadioGroup
                        value={selectedVariantId}
                        onValueChange={setSelectedVariantId}
                    >
                        {/* Base Product Option */}
                        <div className="flex items-center space-x-2 rounded-lg border border-gray-200 dark:border-gray-600 p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <RadioGroupItem value="base" id="base" />
                            <Label
                                htmlFor="base"
                                className="flex flex-1 cursor-pointer items-center justify-between"
                            >
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        Base Product
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {basePriceFormatted}
                                    </div>
                                </div>
                            </Label>
                        </div>

                        {/* Variant Options */}
                        {variants
                            .filter((v) => v.is_active && v.quantity > 0)
                            .map((variant) => (
                                <div
                                    key={variant.id}
                                    className="flex items-center space-x-2 rounded-lg border border-gray-200 dark:border-gray-600 p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <RadioGroupItem
                                        value={variant.id.toString()}
                                        id={`variant-${variant.id}`}
                                    />
                                    <Label
                                        htmlFor={`variant-${variant.id}`}
                                        className="flex flex-1 cursor-pointer items-center justify-between"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {formatAttributes(variant.attributes)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {variant.price
                                                    ? appCurrency
                                                        ? `${appCurrency.symbol}${variant.price.toFixed(2)}`
                                                        : `$${variant.price.toFixed(2)}`
                                                    : basePriceFormatted}
                                                {' • '}
                                                Stock: {variant.quantity}
                                            </div>
                                        </div>
                                    </Label>
                                </div>
                            ))}
                    </RadioGroup>

                    {variants.filter((v) => v.is_active && v.quantity > 0).length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No active variants available. Using base product.
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
                        Add to Cart
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

