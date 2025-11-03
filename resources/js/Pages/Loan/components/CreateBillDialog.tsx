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

interface CreateBillDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentLoan: Loan | null;
    billDueDate: string;
    billPenalty: string;
    billNote: string;
    appCurrency: any;
    canEdit: boolean;
    onDueDateChange: (value: string) => void;
    onPenaltyChange: (value: string) => void;
    onNoteChange: (value: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export function CreateBillDialog({
    open,
    onOpenChange,
    currentLoan,
    billDueDate,
    billPenalty,
    billNote,
    appCurrency,
    canEdit,
    onDueDateChange,
    onPenaltyChange,
    onNoteChange,
    onConfirm,
    onCancel,
}: CreateBillDialogProps) {
    if (!currentLoan) return null;

    const baseAmount = currentLoan.installment_amount
        ? parseFloat(currentLoan.installment_amount)
        : parseFloat(currentLoan.total_balance) -
          parseFloat(currentLoan.paid_amount);

    const totalAmountDue =
        baseAmount + parseFloat(billPenalty || '0');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Create Bill</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    <div className="grid gap-4 py-4">
                    <div className="mb-4 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Base Amount
                            </span>
                            <span className="text-lg">
                                {formatAmount(baseAmount.toString(), appCurrency)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Penalty
                            </span>
                            <span className="text-lg text-red-600 dark:text-red-400">
                                {billPenalty && parseFloat(billPenalty) > 0
                                    ? `+ ${formatAmount(billPenalty, appCurrency)}`
                                    : '+ 0.00'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                            <span className="text-sm font-medium">
                                Total Amount Due
                            </span>
                            <span className="text-lg font-semibold">
                                {formatAmount(
                                    totalAmountDue.toString(),
                                    appCurrency,
                                )}
                            </span>
                        </div>
                        {currentLoan.installment_amount && (
                            <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Remaining Balance
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {formatAmount(
                                        (
                                            parseFloat(currentLoan.total_balance) -
                                            parseFloat(currentLoan.paid_amount)
                                        ).toString(),
                                        appCurrency,
                                    )}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="billDueDate" className="text-right">
                            Due Date{' '}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="billDueDate"
                            type="date"
                            value={billDueDate}
                            onChange={(e) => onDueDateChange(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="billPenalty" className="text-right">
                            Penalty
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="billPenalty"
                                type="number"
                                step="0.01"
                                value={billPenalty}
                                onChange={(e) => onPenaltyChange(e.target.value)}
                                placeholder="0.00"
                                className="col-span-3"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Optional penalty amount to add to the bill
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="billNote" className="text-right">
                            Note
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="billNote"
                                type="text"
                                value={billNote}
                                onChange={(e) => onNoteChange(e.target.value)}
                                placeholder="Add a note about this bill..."
                                className="col-span-3"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Optional note or description for this bill
                            </p>
                        </div>
                    </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    {canEdit && (
                        <Button onClick={onConfirm}>Create Bill</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

