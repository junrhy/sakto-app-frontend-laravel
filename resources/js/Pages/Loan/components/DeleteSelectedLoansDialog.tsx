import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import type { DeleteWarningInfo } from '../types';
import { formatAmount } from '../utils';

interface DeleteSelectedLoansDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedLoans: number[];
    deleteWarningInfo: DeleteWarningInfo;
    appCurrency: any;
    onConfirm: () => void;
}

export function DeleteSelectedLoansDialog({
    open,
    onOpenChange,
    selectedLoans,
    deleteWarningInfo,
    appCurrency,
    onConfirm,
}: DeleteSelectedLoansDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Confirm Delete Selected</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-4 py-4">
                    <p className="font-semibold text-red-600">
                        Warning! This action cannot be undone.
                    </p>
                    <div className="space-y-2">
                        <p>You are about to delete:</p>
                        <ul className="list-inside list-disc space-y-1">
                            <li>
                                <span className="font-semibold">
                                    {selectedLoans.length}
                                </span>{' '}
                                total loans
                            </li>
                            {deleteWarningInfo.activeLoans > 0 && (
                                <li className="text-red-600">
                                    <span className="font-semibold">
                                        {deleteWarningInfo.activeLoans}
                                    </span>{' '}
                                    active loans
                                </li>
                            )}
                            <li>
                                Total loan amount:{' '}
                                <span className="font-semibold">
                                    {formatAmount(
                                        deleteWarningInfo.totalAmount,
                                        appCurrency,
                                    )}
                                </span>
                            </li>
                        </ul>
                        {deleteWarningInfo.activeLoans > 0 && (
                            <p className="text-sm text-red-600">
                                ⚠️ Warning: You are about to delete active loans.
                                Make sure all payments are properly recorded
                                before proceeding.
                            </p>
                        )}
                    </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Delete Selected
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

