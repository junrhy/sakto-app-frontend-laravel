import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';
import React from 'react';

interface DeleteMenuItemDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    menuItemName?: string;
    isBulkDelete?: boolean;
    itemCount?: number;
    selectedIds?: number[];
}

export const DeleteMenuItemDialog: React.FC<DeleteMenuItemDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    menuItemName,
    isBulkDelete = false,
    itemCount = 0,
}) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        {isBulkDelete
                            ? 'Delete Multiple Menu Items'
                            : 'Delete Menu Item'}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="mb-2 font-medium text-gray-900 dark:text-white">
                                {isBulkDelete
                                    ? `Are you sure you want to delete ${itemCount} menu items?`
                                    : `Are you sure you want to delete "${menuItemName}"?`}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isBulkDelete
                                    ? 'This action will permanently remove all selected menu items from your system. This action cannot be undone.'
                                    : 'This action will permanently remove this menu item from your system. This action cannot be undone.'}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleConfirm}
                        className="flex-1 bg-red-500 text-white hover:bg-red-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isBulkDelete
                            ? `Delete ${itemCount} Items`
                            : 'Delete Item'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
