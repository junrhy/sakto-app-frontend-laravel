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
import type { DividendData } from '../types';

interface DividendDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dividend: DividendData;
    onDividendChange: (dividend: Partial<DividendData>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function DividendDialog({
    open,
    onOpenChange,
    dividend,
    onDividendChange,
    onSubmit,
}: DividendDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Dividend</DialogTitle>
                    <DialogDescription>
                        Add a dividend payment to the CBU fund
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="dividend_amount">Amount</Label>
                                <Input
                                    id="dividend_amount"
                                    type="number"
                                    value={dividend.amount}
                                    onChange={(e) =>
                                        onDividendChange({
                                            amount: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dividend_date">
                                    Dividend Date
                                </Label>
                                <Input
                                    id="dividend_date"
                                    type="date"
                                    value={dividend.dividend_date}
                                    onChange={(e) =>
                                        onDividendChange({
                                            dividend_date: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dividend_notes">Notes</Label>
                                <Input
                                    id="dividend_notes"
                                    value={dividend.notes}
                                    onChange={(e) =>
                                        onDividendChange({
                                            notes: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-shrink-0 border-t border-gray-200 pt-4 dark:border-gray-700">
                        <Button type="submit">Save Dividend</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

