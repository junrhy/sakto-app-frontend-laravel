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
import type { CbuFund } from '../types';

interface EditFundDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingFund: CbuFund | null;
    onEditingFundChange: (fund: Partial<CbuFund> | null) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function EditFundDialog({
    open,
    onOpenChange,
    editingFund,
    onEditingFundChange,
    onSubmit,
}: EditFundDialogProps) {
    if (!editingFund) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Edit CBU Fund</DialogTitle>
                    <DialogDescription>
                        Modify the Capital Build Up fund details
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={onSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_name">Name</Label>
                                <Input
                                    id="edit_name"
                                    value={editingFund.name || ''}
                                    onChange={(e) =>
                                        onEditingFundChange({
                                            ...editingFund,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_description">
                                    Description
                                </Label>
                                <Input
                                    id="edit_description"
                                    value={editingFund.description || ''}
                                    onChange={(e) =>
                                        onEditingFundChange({
                                            ...editingFund,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_target_amount">
                                    Target Amount
                                </Label>
                                <Input
                                    id="edit_target_amount"
                                    type="number"
                                    value={editingFund.target_amount || ''}
                                    onChange={(e) =>
                                        onEditingFundChange({
                                            ...editingFund,
                                            target_amount: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_value_per_share">
                                    Value Per Share
                                </Label>
                                <Input
                                    id="edit_value_per_share"
                                    type="number"
                                    min="0"
                                    value={editingFund.value_per_share || ''}
                                    onChange={(e) =>
                                        onEditingFundChange({
                                            ...editingFund,
                                            value_per_share: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_number_of_shares">
                                    Number of Shares (Calculated)
                                </Label>
                                <Input
                                    id="edit_number_of_shares"
                                    type="number"
                                    min="0"
                                    value={
                                        editingFund.total_amount &&
                                        editingFund.value_per_share
                                            ? Math.ceil(
                                                  parseFloat(
                                                      editingFund.total_amount,
                                                  ) /
                                                      parseFloat(
                                                          editingFund.value_per_share,
                                                      ),
                                              )
                                            : 0
                                    }
                                    disabled
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_start_date">
                                    Start Date
                                </Label>
                                <Input
                                    id="edit_start_date"
                                    type="date"
                                    value={editingFund.start_date || ''}
                                    onChange={(e) =>
                                        onEditingFundChange({
                                            ...editingFund,
                                            start_date: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_end_date">
                                    End Date (Optional)
                                </Label>
                                <Input
                                    id="edit_end_date"
                                    type="date"
                                    value={editingFund.end_date || ''}
                                    onChange={(e) =>
                                        onEditingFundChange({
                                            ...editingFund,
                                            end_date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex-shrink-0 border-t border-gray-200 pt-4 dark:border-gray-700">
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
