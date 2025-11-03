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
import { Calculator } from 'lucide-react';
import type { Bill } from '../types';
import { formatAmount } from '../utils';

interface BillDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedBill: Bill | null;
    billNote: string;
    appCurrency: any;
    canEdit: boolean;
    onBillNoteChange: (value: string) => void;
    onStatusUpdate: (billId: number, update: { status: 'pending' | 'paid' | 'overdue'; note?: string }) => void;
}

export function BillDetailsDialog({
    open,
    onOpenChange,
    selectedBill,
    billNote,
    appCurrency,
    canEdit,
    onBillNoteChange,
    onStatusUpdate,
}: BillDetailsDialogProps) {
    if (!selectedBill) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Bill Details</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Bill Number</Label>
                            <div className="font-mono">
                                #{String(selectedBill.bill_number).padStart(4, '0')}
                            </div>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <div className="mt-1">
                                {selectedBill.status
                                    ? selectedBill.status
                                          .charAt(0)
                                          .toUpperCase() +
                                      selectedBill.status.slice(1)
                                    : 'Unknown'}
                            </div>
                        </div>
                        <div>
                            <Label>Due Date</Label>
                            <div>
                                {new Date(selectedBill.due_date).toLocaleDateString()}
                            </div>
                        </div>
                        <div>
                            <Label>Created At</Label>
                            <div>
                                {new Date(selectedBill.created_at).toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <Label>Principal Amount</Label>
                            <div className="font-medium">
                                {formatAmount(selectedBill.principal, appCurrency)}
                            </div>
                        </div>
                        <div>
                            <Label>Interest Amount</Label>
                            <div className="font-medium">
                                {formatAmount(selectedBill.interest, appCurrency)}
                            </div>
                        </div>
                        <div>
                            <Label>Penalty Amount</Label>
                            <div className="font-medium text-red-600 dark:text-red-400">
                                {parseFloat(selectedBill.penalty_amount) > 0
                                    ? formatAmount(
                                          selectedBill.penalty_amount,
                                          appCurrency,
                                      )
                                    : '-'}
                            </div>
                        </div>
                        <div>
                            <Label>Total Amount</Label>
                            <div className="font-medium">
                                {formatAmount(
                                    selectedBill.total_amount,
                                    appCurrency,
                                )}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <Label>Total Amount Due</Label>
                            <div className="text-lg font-semibold">
                                {formatAmount(
                                    selectedBill.total_amount_due,
                                    appCurrency,
                                )}
                            </div>
                        </div>
                        {selectedBill.note && (
                            <div className="col-span-2">
                                <Label>Note</Label>
                                <div className="mt-1 text-gray-600 dark:text-gray-300">
                                    {selectedBill.note}
                                </div>
                            </div>
                        )}
                        <div className="col-span-2">
                            <Label htmlFor="billNote">Add Note</Label>
                            <Input
                                id="billNote"
                                value={billNote}
                                onChange={(e) => onBillNoteChange(e.target.value)}
                                placeholder="Add a note about this bill..."
                            />
                        </div>
                        {selectedBill.installment_amount && (
                            <div className="col-span-2">
                                <Label>Installment Amount</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Calculator className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">
                                        {formatAmount(
                                            selectedBill.installment_amount,
                                            appCurrency,
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    {canEdit && (
                        <Button
                            onClick={() =>
                                onStatusUpdate(selectedBill.id, {
                                    status:
                                        (selectedBill.status || 'pending') ===
                                        'pending'
                                            ? 'paid'
                                            : 'pending',
                                    note: billNote,
                                })
                            }
                        >
                            Mark as{' '}
                            {(selectedBill.status || 'pending') === 'pending'
                                ? 'Paid'
                                : 'Pending'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

