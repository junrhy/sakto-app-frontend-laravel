import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Banknote, CreditCard } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface PaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentAmount: number, paymentMethod: 'cash' | 'card') => void;
    totalAmount: number;
    currencySymbol: string;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    totalAmount,
    currencySymbol,
}) => {
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [amountReceived, setAmountReceived] = useState<string>('');
    const [change, setChange] = useState<number>(0);

    // Calculate change whenever amount received changes
    useEffect(() => {
        const received = parseFloat(amountReceived) || 0;
        const changeAmount = received - totalAmount;
        setChange(changeAmount >= 0 ? changeAmount : 0);
    }, [amountReceived, totalAmount]);

    // Auto-fill exact amount for card payment
    useEffect(() => {
        if (paymentMethod === 'card') {
            setAmountReceived(totalAmount.toFixed(2));
        }
    }, [paymentMethod, totalAmount]);

    const handleConfirm = () => {
        const received = parseFloat(amountReceived) || 0;
        if (received >= totalAmount) {
            onConfirm(received, paymentMethod);
            handleClose();
        }
    };

    const handleClose = () => {
        setPaymentMethod('cash');
        setAmountReceived('');
        setChange(0);
        onClose();
    };

    const isValidPayment = parseFloat(amountReceived) >= totalAmount;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Complete Payment
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Process payment and complete the order
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Total Amount Display */}
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Total Amount:
                            </span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {currencySymbol}
                                {totalAmount.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Payment Method
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                                    paymentMethod === 'cash'
                                        ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                }`}
                            >
                                <Banknote className="h-5 w-5" />
                                <span className="font-semibold">Cash</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('card')}
                                className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                                    paymentMethod === 'card'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                }`}
                            >
                                <CreditCard className="h-5 w-5" />
                                <span className="font-semibold">Card</span>
                            </button>
                        </div>
                    </div>

                    {/* Amount Received Input */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="amountReceived"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Amount Received
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                {currencySymbol}
                            </span>
                            <Input
                                id="amountReceived"
                                type="number"
                                step="0.01"
                                value={amountReceived}
                                onChange={(e) =>
                                    setAmountReceived(e.target.value)
                                }
                                placeholder="0.00"
                                disabled={paymentMethod === 'card'}
                                className="pl-8 text-lg font-semibold text-gray-900 dark:text-white"
                                autoFocus
                            />
                        </div>
                        {!isValidPayment && amountReceived && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                Amount received must be at least{' '}
                                {currencySymbol}
                                {totalAmount.toFixed(2)}
                            </p>
                        )}
                    </div>

                    {/* Change Display */}
                    {paymentMethod === 'cash' && isValidPayment && (
                        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Change:
                                </span>
                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {currencySymbol}
                                    {change.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    {paymentMethod === 'card' && (
                        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Card payment will charge the exact amount of{' '}
                                {currencySymbol}
                                {totalAmount.toFixed(2)}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!isValidPayment}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Complete Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
