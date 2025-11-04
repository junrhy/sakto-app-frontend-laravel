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
import { useState } from 'react';
import { toast } from 'sonner';

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    totalAmount: number;
    appCurrency: any;
    subtotal?: number;
    discountAmount?: number;
    appliedDiscount?: any;
    onConfirm: (data: {
        payment_method: 'cash' | 'card';
        cash_received?: number;
        change?: number;
    }) => Promise<void>;
}

export default function PaymentDialog({
    open,
    onOpenChange,
    totalAmount,
    appCurrency,
    subtotal,
    discountAmount = 0,
    appliedDiscount,
    onConfirm,
}: PaymentDialogProps) {
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [cashReceived, setCashReceived] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async () => {
        if (paymentMethod === 'cash') {
            const cashReceivedAmount = parseFloat(cashReceived);
            if (isNaN(cashReceivedAmount) || cashReceivedAmount < totalAmount) {
                toast.error(
                    'Invalid amount received. Please enter a valid amount.',
                );
                return;
            }

            const change = cashReceivedAmount - totalAmount;

            setIsProcessing(true);
            try {
                await onConfirm({
                    payment_method: 'cash',
                    cash_received: cashReceivedAmount,
                    change: change,
                });
                // Reset form
                setCashReceived('');
                setPaymentMethod('cash');
            } catch (error) {
                console.error('Error completing sale:', error);
            } finally {
                setIsProcessing(false);
            }
        } else {
            setIsProcessing(true);
            try {
                await onConfirm({
                    payment_method: 'card',
                });
            } catch (error) {
                console.error('Error completing sale:', error);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const change =
        paymentMethod === 'cash' && cashReceived
            ? Math.max(0, parseFloat(cashReceived) - totalAmount)
            : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        Complete Sale
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800 space-y-2">
                        {subtotal !== undefined && subtotal !== totalAmount && (
                            <>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Subtotal:</span>
                                    <span>{appCurrency.symbol}{subtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && appliedDiscount && (
                                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                        <span>Discount ({appliedDiscount.name}):</span>
                                        <span>-{appCurrency.symbol}{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                            </>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Total Amount
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {appCurrency.symbol}
                                {totalAmount.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="paymentMethod"
                            className="text-gray-900 dark:text-white"
                        >
                            Payment Method
                        </Label>
                        <Select
                            value={paymentMethod}
                            onValueChange={(value: 'cash' | 'card') =>
                                setPaymentMethod(value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {paymentMethod === 'cash' && (
                        <div className="space-y-2">
                            <Label
                                htmlFor="cashReceived"
                                className="text-gray-900 dark:text-white"
                            >
                                Cash Received
                            </Label>
                            <Input
                                id="cashReceived"
                                type="number"
                                value={cashReceived}
                                onChange={(e) =>
                                    setCashReceived(e.target.value)
                                }
                                placeholder="Enter amount received"
                                min={totalAmount}
                                step="0.01"
                            />
                            {change > 0 && (
                                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Change
                                    </div>
                                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                                        {appCurrency.symbol}
                                        {change.toFixed(2)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter className="flex justify-between gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={
                            isProcessing ||
                            (paymentMethod === 'cash' && !cashReceived)
                        }
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold shadow-md transition-all duration-200"
                    >
                        {isProcessing ? 'Processing...' : 'Confirm Sale'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
