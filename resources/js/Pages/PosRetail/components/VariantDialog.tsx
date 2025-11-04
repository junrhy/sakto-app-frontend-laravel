import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface VariantAttribute {
    key: string;
    value: string;
}

interface Variant {
    id?: number;
    sku?: string;
    barcode?: string;
    price?: number;
    quantity: number;
    attributes: VariantAttribute[];
    image?: string;
    is_active: boolean;
}

interface VariantDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: number;
    variant?: Variant | null;
    onSuccess?: () => void;
}

export default function VariantDialog({
    open,
    onOpenChange,
    productId,
    variant,
    onSuccess,
}: VariantDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Variant>({
        sku: '',
        barcode: '',
        price: undefined,
        quantity: 0,
        attributes: [{ key: '', value: '' }],
        image: '',
        is_active: true,
    });

    const isEditing = variant !== null && variant !== undefined;

    useEffect(() => {
        if (variant) {
            setFormData({
                sku: variant.sku || '',
                barcode: variant.barcode || '',
                price: variant.price,
                quantity: variant.quantity || 0,
                attributes:
                    variant.attributes && variant.attributes.length > 0
                        ? variant.attributes
                        : [{ key: '', value: '' }],
                image: variant.image || '',
                is_active: variant.is_active ?? true,
            });
        } else {
            setFormData({
                sku: '',
                barcode: '',
                price: undefined,
                quantity: 0,
                attributes: [{ key: '', value: '' }],
                image: '',
                is_active: true,
            });
        }
    }, [variant, open]);

    const addAttribute = () => {
        setFormData({
            ...formData,
            attributes: [...formData.attributes, { key: '', value: '' }],
        });
    };

    const removeAttribute = (index: number) => {
        setFormData({
            ...formData,
            attributes: formData.attributes.filter((_, i) => i !== index),
        });
    };

    const updateAttribute = (
        index: number,
        field: 'key' | 'value',
        value: string,
    ) => {
        const newAttributes = [...formData.attributes];
        newAttributes[index] = { ...newAttributes[index], [field]: value };
        setFormData({ ...formData, attributes: newAttributes });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate attributes
        const validAttributes = formData.attributes.filter(
            (attr) => attr.key.trim() && attr.value.trim(),
        );
        if (validAttributes.length === 0) {
            toast.error(
                'Please add at least one attribute (e.g., Size: L, Color: Red)',
            );
            return;
        }

        setIsLoading(true);

        try {
            const payload: any = {
                sku: formData.sku || null,
                barcode: formData.barcode || null,
                price: formData.price || null,
                quantity: formData.quantity,
                attributes: validAttributes.reduce(
                    (acc, attr) => {
                        acc[attr.key] = attr.value;
                        return acc;
                    },
                    {} as Record<string, string>,
                ),
                image: formData.image || null,
                is_active: formData.is_active,
            };

            if (isEditing && variant?.id) {
                router.put(
                    `/inventory/${productId}/variants/${variant.id}`,
                    payload,
                    {
                        preserveState: true,
                        onSuccess: () => {
                            toast.success('Variant updated successfully');
                            onOpenChange(false);
                            if (onSuccess) onSuccess();
                        },
                        onError: () => {
                            toast.error('Failed to update variant');
                        },
                        onFinish: () => setIsLoading(false),
                    },
                );
            } else {
                router.post(`/inventory/${productId}/variants`, payload, {
                    preserveState: true,
                    onSuccess: () => {
                        toast.success('Variant created successfully');
                        onOpenChange(false);
                        if (onSuccess) onSuccess();
                    },
                    onError: () => {
                        toast.error('Failed to create variant');
                    },
                    onFinish: () => setIsLoading(false),
                });
            }
        } catch (error) {
            console.error('Error saving variant:', error);
            toast.error('Failed to save variant');
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEditing ? 'Edit Variant' : 'Add Variant'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 overflow-y-auto py-4">
                        {/* SKU and Barcode */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="sku"
                                    className="text-gray-900 dark:text-white"
                                >
                                    SKU (Optional)
                                </Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            sku: e.target.value,
                                        })
                                    }
                                    placeholder="Variant SKU"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="barcode"
                                    className="text-gray-900 dark:text-white"
                                >
                                    Barcode (Optional)
                                </Label>
                                <Input
                                    id="barcode"
                                    value={formData.barcode}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            barcode: e.target.value,
                                        })
                                    }
                                    placeholder="Variant barcode"
                                />
                            </div>
                        </div>

                        {/* Price and Quantity */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="price"
                                    className="text-gray-900 dark:text-white"
                                >
                                    Price (Optional)
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            price: e.target.value
                                                ? parseFloat(e.target.value)
                                                : undefined,
                                        })
                                    }
                                    placeholder="Override product price"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Leave empty to use product price
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="quantity"
                                    className="text-gray-900 dark:text-white"
                                >
                                    Quantity{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="0"
                                    value={formData.quantity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            quantity:
                                                parseInt(e.target.value) || 0,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        {/* Attributes */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-gray-900 dark:text-white">
                                    Attributes{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addAttribute}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Attribute
                                </Button>
                            </div>
                            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-4 dark:border-gray-600">
                                {formData.attributes.map((attr, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2"
                                    >
                                        <Input
                                            placeholder="Attribute (e.g., Size)"
                                            value={attr.key}
                                            onChange={(e) =>
                                                updateAttribute(
                                                    index,
                                                    'key',
                                                    e.target.value,
                                                )
                                            }
                                            className="flex-1"
                                        />
                                        <Input
                                            placeholder="Value (e.g., L)"
                                            value={attr.value}
                                            onChange={(e) =>
                                                updateAttribute(
                                                    index,
                                                    'value',
                                                    e.target.value,
                                                )
                                            }
                                            className="flex-1"
                                        />
                                        {formData.attributes.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    removeAttribute(index)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Example: Size: L, Color: Red
                            </p>
                        </div>

                        {/* Image URL */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="image"
                                className="text-gray-900 dark:text-white"
                            >
                                Image URL (Optional)
                            </Label>
                            <Input
                                id="image"
                                value={formData.image || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        image: e.target.value,
                                    })
                                }
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        is_active: e.target.checked,
                                    })
                                }
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label
                                htmlFor="is_active"
                                className="cursor-pointer text-sm font-normal text-gray-900 dark:text-white"
                            >
                                Active (visible in POS)
                            </Label>
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg
                                        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    {isEditing ? 'Updating...' : 'Creating...'}
                                </span>
                            ) : isEditing ? (
                                'Update Variant'
                            ) : (
                                'Create Variant'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
