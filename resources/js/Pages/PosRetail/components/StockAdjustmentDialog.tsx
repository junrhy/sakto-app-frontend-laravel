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
import { Textarea } from '@/Components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Plus, Minus, RotateCcw } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    quantity: number;
}

interface StockAdjustmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    appCurrency: {
        symbol: string;
        decimal_separator?: string;
        thousands_separator?: string;
    };
    performedBy?: string;
    onSuccess: () => void;
}

type AdjustmentType = 'add' | 'remove' | 'adjust';

export default function StockAdjustmentDialog({
    open,
    onOpenChange,
    product,
    appCurrency,
    performedBy = '',
    onSuccess,
}: StockAdjustmentDialogProps) {
    const [adjustmentType, setAdjustmentType] =
        useState<AdjustmentType>('add');
    const [quantity, setQuantity] = useState<string>('');
    const [newQuantity, setNewQuantity] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [referenceNumber, setReferenceNumber] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open && product) {
            setQuantity('');
            setNewQuantity(product.quantity.toString());
            setReason('');
            setReferenceNumber('');
            setAdjustmentType('add');
        }
    }, [open, product]);

    const handleSubmit = async () => {
        if (!product) return;

        try {
            setIsLoading(true);

            let endpoint = '';
            let payload: any = {
                reason: reason || undefined,
                reference_number: referenceNumber || undefined,
                performed_by: performedBy || undefined,
            };

            switch (adjustmentType) {
                case 'add':
                    if (!quantity || parseInt(quantity) <= 0) {
                        toast.error('Please enter a valid quantity');
                        setIsLoading(false);
                        return;
                    }
                    endpoint = `/inventory/${product.id}/stock/add`;
                    payload.quantity = parseInt(quantity);
                    break;

                case 'remove':
                    if (!quantity || parseInt(quantity) <= 0) {
                        toast.error('Please enter a valid quantity');
                        setIsLoading(false);
                        return;
                    }
                    if (parseInt(quantity) > product.quantity) {
                        toast.error(
                            `Cannot remove more than available stock (${product.quantity})`,
                        );
                        setIsLoading(false);
                        return;
                    }
                    endpoint = `/inventory/${product.id}/stock/remove`;
                    payload.quantity = parseInt(quantity);
                    break;

                case 'adjust':
                    if (!newQuantity || parseInt(newQuantity) < 0) {
                        toast.error('Please enter a valid quantity');
                        setIsLoading(false);
                        return;
                    }
                    if (!reason.trim()) {
                        toast.error('Reason is required for stock adjustments');
                        setIsLoading(false);
                        return;
                    }
                    endpoint = `/inventory/${product.id}/stock/adjust`;
                    payload.new_quantity = parseInt(newQuantity);
                    break;
            }

            router.post(endpoint, payload, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        adjustmentType === 'add'
                            ? 'Stock added successfully'
                            : adjustmentType === 'remove'
                              ? 'Stock removed successfully'
                              : 'Stock adjusted successfully',
                    );
                    onSuccess();
                    onOpenChange(false);
                },
                onError: (errors: Record<string, string>) => {
                    const errorMessage =
                        errors.error ||
                        'Failed to update stock. Please try again.';
                    toast.error(errorMessage);
                },
            });
        } catch (error: any) {
            console.error('Stock adjustment error:', error);
            toast.error(error.message || 'Failed to update stock');
        } finally {
            setIsLoading(false);
        }
    };

    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        Manage Stock - {product.name}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {/* Current Stock Display */}
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Current Stock
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {product.quantity} units
                        </div>
                    </div>

                    {/* Adjustment Type */}
                    <div className="space-y-2">
                        <Label className="text-gray-900 dark:text-white">
                            Adjustment Type
                        </Label>
                        <Select
                            value={adjustmentType}
                            onValueChange={(value: AdjustmentType) =>
                                setAdjustmentType(value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="add">
                                    <div className="flex items-center">
                                        <Plus className="mr-2 h-4 w-4 text-green-600" />
                                        Add Stock
                                    </div>
                                </SelectItem>
                                <SelectItem value="remove">
                                    <div className="flex items-center">
                                        <Minus className="mr-2 h-4 w-4 text-red-600" />
                                        Remove Stock
                                    </div>
                                </SelectItem>
                                <SelectItem value="adjust">
                                    <div className="flex items-center">
                                        <RotateCcw className="mr-2 h-4 w-4 text-blue-600" />
                                        Adjust Stock
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Quantity Input based on type */}
                    {adjustmentType === 'adjust' ? (
                        <div className="space-y-2">
                            <Label htmlFor="newQuantity" className="text-gray-900 dark:text-white">
                                New Quantity{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="newQuantity"
                                type="number"
                                min="0"
                                value={newQuantity}
                                onChange={(e) => setNewQuantity(e.target.value)}
                                placeholder="Enter new quantity"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Current: {product.quantity} → New: {newQuantity || '0'}
                                {newQuantity &&
                                    parseInt(newQuantity) !== product.quantity && (
                                        <span
                                            className={
                                                parseInt(newQuantity) > product.quantity
                                                    ? 'ml-2 text-green-600'
                                                    : 'ml-2 text-red-600'
                                            }
                                        >
                                            (
                                            {parseInt(newQuantity) > product.quantity
                                                ? '+'
                                                : ''}
                                            {parseInt(newQuantity) - product.quantity})
                                        </span>
                                    )}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-gray-900 dark:text-white">
                                Quantity{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder={
                                    adjustmentType === 'add'
                                        ? 'Enter quantity to add'
                                        : 'Enter quantity to remove'
                                }
                                max={
                                    adjustmentType === 'remove'
                                        ? product.quantity
                                        : undefined
                                }
                            />
                            {adjustmentType === 'remove' && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Available: {product.quantity} units
                                </p>
                            )}
                        </div>
                    )}

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-gray-900 dark:text-white">
                            Reason{' '}
                            {adjustmentType === 'adjust' && (
                                <span className="text-red-500">*</span>
                            )}
                        </Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Restock, Damage, Return, Correction..."
                            rows={3}
                        />
                    </div>

                    {/* Reference Number */}
                    <div className="space-y-2">
                        <Label htmlFor="referenceNumber" className="text-gray-900 dark:text-white">
                            Reference Number (Optional)
                        </Label>
                        <Input
                            id="referenceNumber"
                            value={referenceNumber}
                            onChange={(e) =>
                                setReferenceNumber(e.target.value)
                            }
                            placeholder="e.g., PO-12345, Invoice-001"
                        />
                    </div>
                </div>
                <DialogFooter className="flex justify-between gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={
                            adjustmentType === 'add'
                                ? 'bg-green-600 hover:bg-green-700'
                                : adjustmentType === 'remove'
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : 'bg-blue-600 hover:bg-blue-700'
                        }
                    >
                        {isLoading
                            ? 'Processing...'
                            : adjustmentType === 'add'
                              ? 'Add Stock'
                              : adjustmentType === 'remove'
                                ? 'Remove Stock'
                                : 'Adjust Stock'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

