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
import type { WithdrawalData } from '../types';

interface WithdrawDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    withdrawal: WithdrawalData;
    onWithdrawalChange: (withdrawal: Partial<WithdrawalData>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function WithdrawDialog({
    open,
    onOpenChange,
    withdrawal,
    onWithdrawalChange,
    onSubmit,
}: WithdrawDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Process Withdrawal</DialogTitle>
                    <DialogDescription>
                        Process a withdrawal from the CBU fund
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="withdrawal_amount">Amount</Label>
                                <Input
                                    id="withdrawal_amount"
                                    type="number"
                                    value={withdrawal.amount}
                                    onChange={(e) =>
                                        onWithdrawalChange({
                                            amount: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="withdrawal_date">
                                    Withdrawal Date
                                </Label>
                                <Input
                                    id="withdrawal_date"
                                    type="date"
                                    value={withdrawal.withdrawal_date}
                                    onChange={(e) =>
                                        onWithdrawalChange({
                                            withdrawal_date: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="withdrawal_notes">Notes</Label>
                                <Input
                                    id="withdrawal_notes"
                                    value={withdrawal.notes}
                                    onChange={(e) =>
                                        onWithdrawalChange({
                                            notes: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-shrink-0 border-t border-gray-200 pt-4 dark:border-gray-700">
                        <Button type="submit">Process Withdrawal</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

