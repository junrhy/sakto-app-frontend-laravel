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
import type { Loan } from '../types';
import { formatAmount } from '../utils';

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentLoan: Loan | null;
    paymentAmount: string;
    paymentDate: string;
    paymentError: string;
    appCurrency: any;
    onPaymentAmountChange: (value: string) => void;
    onPaymentDateChange: (value: string) => void;
    onConfirm: () => void;
}

export function PaymentDialog({
    open,
    onOpenChange,
    currentLoan,
    paymentAmount,
    paymentDate,
    paymentError,
    appCurrency,
    onPaymentAmountChange,
    onPaymentDateChange,
    onConfirm,
}: PaymentDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor="paymentAmount"
                                className="text-right"
                            >
                                Payment Amount
                            </Label>
                            <Input
                                id="paymentAmount"
                                type="number"
                                value={paymentAmount}
                                onChange={(e) =>
                                    onPaymentAmountChange(e.target.value)
                                }
                                className="col-span-3"
                            />
                        </div>
                        {paymentError && (
                            <div className="col-span-4 text-sm text-red-500">
                                {paymentError}
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="paymentDate" className="text-right">
                                Payment Date
                            </Label>
                            <Input
                                id="paymentDate"
                                type="date"
                                value={paymentDate}
                                onChange={(e) =>
                                    onPaymentDateChange(e.target.value)
                                }
                                className="col-span-3"
                            />
                        </div>
                        {currentLoan && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">
                                    Remaining Balance
                                </Label>
                                <div className="col-span-3">
                                    {formatAmount(
                                        parseFloat(currentLoan.total_balance) -
                                            parseFloat(currentLoan.paid_amount),
                                        appCurrency,
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={onConfirm}>Confirm Payment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
