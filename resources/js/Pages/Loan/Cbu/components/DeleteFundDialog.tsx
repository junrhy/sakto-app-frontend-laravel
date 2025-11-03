import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import type { CbuFund } from '../types';

interface DeleteFundDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fundToDelete: CbuFund | null;
    onConfirm: () => void;
}

export function DeleteFundDialog({
    open,
    onOpenChange,
    fundToDelete,
    onConfirm,
}: DeleteFundDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete CBU Fund</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the fund "
                        {fundToDelete?.name}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    <div className="py-4">
                        <p className="text-sm text-gray-500">
                            This will permanently delete the fund and all
                            associated contributions and withdrawals.
                        </p>
                    </div>
                </div>
                <DialogFooter className="flex-shrink-0 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Delete Fund
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

