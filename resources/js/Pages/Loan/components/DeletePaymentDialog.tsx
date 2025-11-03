import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import type { DeletePaymentInfo } from '../types';
import { formatAmount } from '../utils';

interface DeletePaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentToDelete: DeletePaymentInfo | null;
    appCurrency: any;
    onConfirm: () => void;
}

export function DeletePaymentDialog({
    open,
    onOpenChange,
    paymentToDelete,
    appCurrency,
    onConfirm,
}: DeletePaymentDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Delete Payment</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    <div className="py-4">
                    <p>
                        Are you sure you want to delete this payment of{' '}
                        {paymentToDelete
                            ? formatAmount(paymentToDelete.amount, appCurrency)
                            : ''}
                        ?
                    </p>
                    <p className="mt-2 text-red-600">
                        This action cannot be undone.
                    </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Delete Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

