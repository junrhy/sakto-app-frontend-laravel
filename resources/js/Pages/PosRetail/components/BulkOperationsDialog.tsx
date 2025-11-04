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
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Settings } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface BulkOperationsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedCount: number;
    categories?: Category[];
    onBulkOperation: (operation: BulkOperation) => void;
}

export interface BulkOperation {
    type: 'price' | 'category' | 'stock' | 'delete';
    priceType?: 'percentage' | 'fixed';
    priceValue?: number;
    categoryId?: number;
    stockAction?: 'add' | 'remove' | 'set';
    stockValue?: number;
}

export default function BulkOperationsDialog({
    open,
    onOpenChange,
    selectedCount,
    categories = [],
    onBulkOperation,
}: BulkOperationsDialogProps) {
    const [operationType, setOperationType] = useState<
        'price' | 'category' | 'stock' | 'delete'
    >('price');
    const [priceType, setPriceType] = useState<'percentage' | 'fixed'>(
        'percentage',
    );
    const [priceValue, setPriceValue] = useState<string>('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [stockAction, setStockAction] = useState<'add' | 'remove' | 'set'>(
        'add',
    );
    const [stockValue, setStockValue] = useState<string>('');

    const handleSubmit = () => {
        if (operationType === 'delete') {
            onBulkOperation({ type: 'delete' });
            onOpenChange(false);
            return;
        }

        if (operationType === 'price') {
            const value = parseFloat(priceValue);
            if (!priceValue || isNaN(value) || value <= 0) {
                return;
            }
            onBulkOperation({
                type: 'price',
                priceType,
                priceValue: value,
            });
        } else if (operationType === 'category') {
            if (!categoryId) {
                return;
            }
            onBulkOperation({
                type: 'category',
                categoryId: parseInt(categoryId),
            });
        } else if (operationType === 'stock') {
            const value = parseInt(stockValue);
            if (!stockValue || isNaN(value) || value <= 0) {
                return;
            }
            onBulkOperation({
                type: 'stock',
                stockAction,
                stockValue: value,
            });
        }

        // Reset form
        setPriceValue('');
        setCategoryId('');
        setStockValue('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                        <Settings className="h-5 w-5" />
                        Bulk Operations ({selectedCount} selected)
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 overflow-y-auto py-4">
                    {/* Operation Type Selection */}
                    <div className="space-y-2">
                        <Label className="text-gray-900 dark:text-white">
                            Select Operation
                        </Label>
                        <Select
                            value={operationType}
                            onValueChange={(
                                value:
                                    | 'price'
                                    | 'category'
                                    | 'stock'
                                    | 'delete',
                            ) => setOperationType(value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="price">
                                    Update Prices
                                </SelectItem>
                                <SelectItem value="category">
                                    Change Category
                                </SelectItem>
                                <SelectItem value="stock">
                                    Adjust Stock
                                </SelectItem>
                                <SelectItem value="delete">
                                    Delete Products
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Price Update Form */}
                    {operationType === 'price' && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <Label className="text-gray-900 dark:text-white">
                                Price Update Options
                            </Label>
                            <RadioGroup
                                value={priceType}
                                onValueChange={(
                                    value: 'percentage' | 'fixed',
                                ) => setPriceType(value)}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="percentage"
                                        id="percentage"
                                    />
                                    <Label
                                        htmlFor="percentage"
                                        className="cursor-pointer text-gray-900 dark:text-white"
                                    >
                                        Percentage Change
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="fixed" id="fixed" />
                                    <Label
                                        htmlFor="fixed"
                                        className="cursor-pointer text-gray-900 dark:text-white"
                                    >
                                        Fixed Amount Change
                                    </Label>
                                </div>
                            </RadioGroup>
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-600 dark:text-gray-400">
                                    {priceType === 'percentage'
                                        ? 'Percentage (%)'
                                        : 'Amount'}
                                </Label>
                                <Input
                                    type="number"
                                    value={priceValue}
                                    onChange={(e) =>
                                        setPriceValue(e.target.value)
                                    }
                                    placeholder={
                                        priceType === 'percentage'
                                            ? 'Enter percentage (e.g., 10 for 10% increase)'
                                            : 'Enter amount to add/subtract'
                                    }
                                    step={
                                        priceType === 'percentage'
                                            ? '0.01'
                                            : '0.01'
                                    }
                                />
                                {priceType === 'percentage' && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Positive number increases prices,
                                        negative decreases
                                    </p>
                                )}
                                {priceType === 'fixed' && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Positive number adds to price, negative
                                        subtracts
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Category Update Form */}
                    {operationType === 'category' && (
                        <div className="space-y-2 rounded-lg border p-4">
                            <Label className="text-gray-900 dark:text-white">
                                Select New Category
                            </Label>
                            <Select
                                value={categoryId}
                                onValueChange={setCategoryId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">
                                        Uncategorized
                                    </SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id.toString()}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                All selected products will be moved to this
                                category
                            </p>
                        </div>
                    )}

                    {/* Stock Adjustment Form */}
                    {operationType === 'stock' && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <Label className="text-gray-900 dark:text-white">
                                Stock Adjustment Options
                            </Label>
                            <RadioGroup
                                value={stockAction}
                                onValueChange={(
                                    value: 'add' | 'remove' | 'set',
                                ) => setStockAction(value)}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="add" id="add" />
                                    <Label
                                        htmlFor="add"
                                        className="cursor-pointer text-gray-900 dark:text-white"
                                    >
                                        Add Stock
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="remove"
                                        id="remove"
                                    />
                                    <Label
                                        htmlFor="remove"
                                        className="cursor-pointer text-gray-900 dark:text-white"
                                    >
                                        Remove Stock
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="set" id="set" />
                                    <Label
                                        htmlFor="set"
                                        className="cursor-pointer text-gray-900 dark:text-white"
                                    >
                                        Set Stock Quantity
                                    </Label>
                                </div>
                            </RadioGroup>
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-600 dark:text-gray-400">
                                    Quantity
                                </Label>
                                <Input
                                    type="number"
                                    value={stockValue}
                                    onChange={(e) =>
                                        setStockValue(e.target.value)
                                    }
                                    placeholder="Enter quantity"
                                    min="0"
                                    step="1"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {stockAction === 'add' &&
                                        'This amount will be added to current stock'}
                                    {stockAction === 'remove' &&
                                        'This amount will be removed from current stock'}
                                    {stockAction === 'set' &&
                                        'Stock will be set to this exact quantity'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation */}
                    {operationType === 'delete' && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
                            <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                Warning: This action cannot be undone!
                            </p>
                            <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                                You are about to delete {selectedCount} product
                                {selectedCount !== 1 ? 's' : ''}. This will
                                permanently remove all selected products from
                                your inventory.
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter className="flex justify-between gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            (operationType === 'price' && !priceValue) ||
                            (operationType === 'category' && !categoryId) ||
                            (operationType === 'stock' && !stockValue)
                        }
                        className={
                            operationType === 'delete'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }
                    >
                        {operationType === 'delete'
                            ? `Delete ${selectedCount} Product${selectedCount !== 1 ? 's' : ''}`
                            : 'Apply Operation'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
