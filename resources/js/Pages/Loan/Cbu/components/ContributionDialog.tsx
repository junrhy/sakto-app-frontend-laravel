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
import type { ContributionData } from '../types';

interface ContributionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contribution: ContributionData;
    onContributionChange: (contribution: Partial<ContributionData>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function ContributionDialog({
    open,
    onOpenChange,
    contribution,
    onContributionChange,
    onSubmit,
}: ContributionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Contribution</DialogTitle>
                    <DialogDescription>
                        Add a new contribution to the CBU fund
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={onSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={contribution.amount}
                                    onChange={(e) =>
                                        onContributionChange({
                                            amount: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contribution_date">
                                    Contribution Date
                                </Label>
                                <Input
                                    id="contribution_date"
                                    type="date"
                                    value={contribution.contribution_date}
                                    onChange={(e) =>
                                        onContributionChange({
                                            contribution_date: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input
                                    id="notes"
                                    value={contribution.notes}
                                    onChange={(e) =>
                                        onContributionChange({
                                            notes: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-shrink-0 border-t border-gray-200 pt-4 dark:border-gray-700">
                        <Button type="submit">Save Contribution</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
