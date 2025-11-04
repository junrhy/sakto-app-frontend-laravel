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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Calendar } from '@/Components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface Discount {
    id?: number;
    name: string;
    description?: string;
    type: 'percentage' | 'fixed' | 'buy_x_get_y';
    value: number;
    min_quantity?: number;
    buy_quantity?: number;
    get_quantity?: number;
    min_purchase_amount?: number;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
    applicable_items?: number[];
    applicable_categories?: number[];
    usage_limit?: number;
}

interface DiscountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    discount?: Discount | null;
    categories?: Array<{ id: number; name: string }>;
    items?: Array<{ id: number; name: string }>;
    onSuccess?: () => void;
}

export default function DiscountDialog({
    open,
    onOpenChange,
    discount,
    categories = [],
    items = [],
    onSuccess,
}: DiscountDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Discount>({
        name: '',
        description: '',
        type: 'percentage',
        value: 0,
        min_quantity: undefined,
        buy_quantity: undefined,
        get_quantity: undefined,
        min_purchase_amount: undefined,
        start_date: undefined,
        end_date: undefined,
        is_active: true,
        applicable_items: undefined,
        applicable_categories: undefined,
        usage_limit: undefined,
    });

    const isEditing = discount !== null && discount !== undefined;

    useEffect(() => {
        if (discount) {
            setFormData({
                name: discount.name || '',
                description: discount.description || '',
                type: discount.type || 'percentage',
                value: discount.value || 0,
                min_quantity: discount.min_quantity,
                buy_quantity: discount.buy_quantity,
                get_quantity: discount.get_quantity,
                min_purchase_amount: discount.min_purchase_amount,
                start_date: discount.start_date,
                end_date: discount.end_date,
                is_active: discount.is_active ?? true,
                applicable_items: discount.applicable_items,
                applicable_categories: discount.applicable_categories,
                usage_limit: discount.usage_limit,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                type: 'percentage',
                value: 0,
                min_quantity: undefined,
                buy_quantity: undefined,
                get_quantity: undefined,
                min_purchase_amount: undefined,
                start_date: undefined,
                end_date: undefined,
                is_active: true,
                applicable_items: undefined,
                applicable_categories: undefined,
                usage_limit: undefined,
            });
        }
    }, [discount, open]);

    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    useEffect(() => {
        if (discount) {
            setSelectedItems(discount.applicable_items || []);
            setSelectedCategories(discount.applicable_categories || []);
        } else {
            setSelectedItems([]);
            setSelectedCategories([]);
        }
    }, [discount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);

        try {
            const payload: any = {
                name: formData.name,
                description: formData.description || null,
                type: formData.type,
                value: formData.value,
                min_quantity: formData.min_quantity || null,
                buy_quantity: formData.buy_quantity || null,
                get_quantity: formData.get_quantity || null,
                min_purchase_amount: formData.min_purchase_amount || null,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                is_active: formData.is_active,
                applicable_items: selectedItems.length > 0 ? selectedItems : null,
                applicable_categories: selectedCategories.length > 0 ? selectedCategories : null,
                usage_limit: formData.usage_limit || null,
            };

            if (isEditing && discount?.id) {
                router.put(`/inventory/discounts/${discount.id}`, payload, {
                    preserveState: true,
                    onSuccess: () => {
                        toast.success('Discount updated successfully');
                        onOpenChange(false);
                        if (onSuccess) onSuccess();
                    },
                    onError: () => {
                        toast.error('Failed to update discount');
                    },
                    onFinish: () => setIsLoading(false),
                });
            } else {
                router.post('/inventory/discounts', payload, {
                    preserveState: true,
                    onSuccess: () => {
                        toast.success('Discount created successfully');
                        onOpenChange(false);
                        if (onSuccess) onSuccess();
                    },
                    onError: () => {
                        toast.error('Failed to create discount');
                    },
                    onFinish: () => setIsLoading(false),
                });
            }
        } catch (error) {
            console.error('Error saving discount:', error);
            toast.error('Failed to save discount');
            setIsLoading(false);
        }
    };

    const toggleItem = (itemId: number) => {
        setSelectedItems((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        );
    };

    const toggleCategory = (categoryId: number) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        {isEditing ? 'Edit Discount' : 'Create Discount'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 overflow-y-auto py-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-900 dark:text-white">
                                    Discount Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                    placeholder="Summer Sale 2025"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-gray-900 dark:text-white">
                                    Discount Type <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: 'percentage' | 'fixed' | 'buy_x_get_y') =>
                                        setFormData({ ...formData, type: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                                        <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-gray-900 dark:text-white">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Discount description..."
                                rows={2}
                            />
                        </div>

                        {/* Discount Value */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {formData.type === 'percentage' && (
                                <div className="space-y-2">
                                    <Label htmlFor="value" className="text-gray-900 dark:text-white">
                                        Percentage <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={formData.value}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                value: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        required
                                        placeholder="10"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        % off
                                    </p>
                                </div>
                            )}

                            {formData.type === 'fixed' && (
                                <div className="space-y-2">
                                    <Label htmlFor="value" className="text-gray-900 dark:text-white">
                                        Fixed Amount <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.value}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                value: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                        required
                                        placeholder="5.00"
                                    />
                                </div>
                            )}

                            {formData.type === 'buy_x_get_y' && (
                                <>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="buy_quantity"
                                            className="text-gray-900 dark:text-white"
                                        >
                                            Buy Quantity <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="buy_quantity"
                                            type="number"
                                            min="1"
                                            value={formData.buy_quantity || ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    buy_quantity: parseInt(e.target.value) || undefined,
                                                })
                                            }
                                            required={formData.type === 'buy_x_get_y'}
                                            placeholder="2"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="get_quantity"
                                            className="text-gray-900 dark:text-white"
                                        >
                                            Get Quantity <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="get_quantity"
                                            type="number"
                                            min="1"
                                            value={formData.get_quantity || ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    get_quantity: parseInt(e.target.value) || undefined,
                                                })
                                            }
                                            required={formData.type === 'buy_x_get_y'}
                                            placeholder="1"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Conditions */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="min_quantity"
                                    className="text-gray-900 dark:text-white"
                                >
                                    Minimum Quantity (Optional)
                                </Label>
                                <Input
                                    id="min_quantity"
                                    type="number"
                                    min="1"
                                    value={formData.min_quantity || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            min_quantity: e.target.value
                                                ? parseInt(e.target.value)
                                                : undefined,
                                        })
                                    }
                                    placeholder="Minimum items required"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="min_purchase_amount"
                                    className="text-gray-900 dark:text-white"
                                >
                                    Minimum Purchase Amount (Optional)
                                </Label>
                                <Input
                                    id="min_purchase_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.min_purchase_amount || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            min_purchase_amount: e.target.value
                                                ? parseFloat(e.target.value)
                                                : undefined,
                                        })
                                    }
                                    placeholder="Minimum purchase amount"
                                />
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-gray-900 dark:text-white">
                                    Start Date (Optional)
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !formData.start_date && 'text-muted-foreground',
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.start_date ? (
                                                format(new Date(formData.start_date), 'PPP')
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={
                                                formData.start_date
                                                    ? new Date(formData.start_date)
                                                    : undefined
                                            }
                                            onSelect={(date) =>
                                                setFormData({
                                                    ...formData,
                                                    start_date: date
                                                        ? format(date, 'yyyy-MM-dd')
                                                        : undefined,
                                                })
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-900 dark:text-white">
                                    End Date (Optional)
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !formData.end_date && 'text-muted-foreground',
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.end_date ? (
                                                format(new Date(formData.end_date), 'PPP')
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={
                                                formData.end_date
                                                    ? new Date(formData.end_date)
                                                    : undefined
                                            }
                                            onSelect={(date) =>
                                                setFormData({
                                                    ...formData,
                                                    end_date: date
                                                        ? format(date, 'yyyy-MM-dd')
                                                        : undefined,
                                                })
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Applicable Items */}
                        {items.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-gray-900 dark:text-white">
                                    Applicable Items (Optional)
                                </Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Leave empty to apply to all items
                                </p>
                                <div className="max-h-32 space-y-2 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 p-2">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`item-${item.id}`}
                                                checked={selectedItems.includes(item.id)}
                                                onCheckedChange={() => toggleItem(item.id)}
                                            />
                                            <Label
                                                htmlFor={`item-${item.id}`}
                                                className="text-sm font-normal text-gray-900 dark:text-white cursor-pointer"
                                            >
                                                {item.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Applicable Categories */}
                        {categories.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-gray-900 dark:text-white">
                                    Applicable Categories (Optional)
                                </Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Leave empty to apply to all categories
                                </p>
                                <div className="max-h-32 space-y-2 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 p-2">
                                    {categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`category-${category.id}`}
                                                checked={selectedCategories.includes(category.id)}
                                                onCheckedChange={() => toggleCategory(category.id)}
                                            />
                                            <Label
                                                htmlFor={`category-${category.id}`}
                                                className="text-sm font-normal text-gray-900 dark:text-white cursor-pointer"
                                            >
                                                {category.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Usage Limit */}
                        <div className="space-y-2">
                            <Label htmlFor="usage_limit" className="text-gray-900 dark:text-white">
                                Usage Limit (Optional)
                            </Label>
                            <Input
                                id="usage_limit"
                                type="number"
                                min="1"
                                value={formData.usage_limit || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        usage_limit: e.target.value
                                            ? parseInt(e.target.value)
                                            : undefined,
                                    })
                                }
                                placeholder="Maximum times discount can be used"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Leave empty for unlimited usage
                            </p>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, is_active: checked as boolean })
                                }
                            />
                            <Label
                                htmlFor="is_active"
                                className="text-sm font-normal text-gray-900 dark:text-white cursor-pointer"
                            >
                                Active (discount is currently active)
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
                            ) : (
                                isEditing ? 'Update Discount' : 'Create Discount'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

