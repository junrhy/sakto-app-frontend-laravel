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
import type { NewFundData } from '../types';

interface AddFundDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    newFund: NewFundData;
    onNewFundChange: (fund: Partial<NewFundData>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function AddFundDialog({
    open,
    onOpenChange,
    newFund,
    onNewFundChange,
    onSubmit,
}: AddFundDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Add New CBU Fund</DialogTitle>
                    <DialogDescription>
                        Create a new Capital Build Up fund
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newFund.name}
                                    onChange={(e) =>
                                        onNewFundChange({ name: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={newFund.description}
                                    onChange={(e) =>
                                        onNewFundChange({
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="target_amount">
                                    Target Amount
                                </Label>
                                <Input
                                    id="target_amount"
                                    type="number"
                                    value={newFund.target_amount}
                                    onChange={(e) =>
                                        onNewFundChange({
                                            target_amount: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="value_per_share">
                                    Value Per Share
                                </Label>
                                <Input
                                    id="value_per_share"
                                    type="number"
                                    min="0"
                                    value={newFund.value_per_share}
                                    onChange={(e) =>
                                        onNewFundChange({
                                            value_per_share: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="number_of_shares">
                                    Number of Shares (Calculated)
                                </Label>
                                <Input
                                    id="number_of_shares"
                                    type="number"
                                    min="0"
                                    value={
                                        newFund.total_amount &&
                                        newFund.value_per_share
                                            ? Math.ceil(
                                                  parseFloat(
                                                      newFund.total_amount,
                                                  ) /
                                                      parseFloat(
                                                          newFund.value_per_share,
                                                      ),
                                              )
                                            : 0
                                    }
                                    disabled
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={newFund.start_date}
                                    onChange={(e) =>
                                        onNewFundChange({
                                            start_date: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">
                                    End Date (Optional)
                                </Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={newFund.end_date}
                                    onChange={(e) =>
                                        onNewFundChange({
                                            end_date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-shrink-0 border-t border-gray-200 pt-4 dark:border-gray-700">
                        <Button type="submit">Save Fund</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

