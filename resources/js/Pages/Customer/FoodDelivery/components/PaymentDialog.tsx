import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';
import { FoodDeliveryOrder } from '../types';

interface PaymentDialogProps {
    order: FoodDeliveryOrder;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    clientIdentifier: string;
}

export default function PaymentDialog({
    order,
    open,
    onOpenChange,
    onSuccess,
    clientIdentifier,
}: PaymentDialogProps) {
    const [paymentMethod, setPaymentMethod] = useState<
        'online' | 'cash_on_delivery'
    >(order.payment_method);
    const [paymentReference, setPaymentReference] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await axios.post(
                `/food-delivery/payments/${order.id}/process`,
                {
                    payment_method: paymentMethod,
                    payment_reference: paymentReference || undefined,
                    client_identifier: clientIdentifier,
                },
            );

            if (response.data.success) {
                toast.success('Payment processed successfully');
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(
                    response.data.message || 'Failed to process payment',
                );
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Failed to process payment',
            );
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Process Payment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                            Order Total:{' '}
                            <span className="font-bold text-gray-900 dark:text-white">
                                {formatCurrency(order.total_amount)}
                            </span>
                        </p>
                    </div>

                    <div>
                        <Label>Payment Method</Label>
                        <RadioGroup
                            value={paymentMethod}
                            onValueChange={(
                                value: 'online' | 'cash_on_delivery',
                            ) => setPaymentMethod(value)}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="cash_on_delivery"
                                    id="cod"
                                />
                                <Label htmlFor="cod">Cash on Delivery</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="online" id="online" />
                                <Label htmlFor="online">Online Payment</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {paymentMethod === 'online' && (
                        <div>
                            <Label htmlFor="payment_reference">
                                Payment Reference
                            </Label>
                            <Input
                                id="payment_reference"
                                value={paymentReference}
                                onChange={(e) =>
                                    setPaymentReference(e.target.value)
                                }
                                placeholder="Transaction ID or reference number"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Processing...' : 'Process Payment'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
