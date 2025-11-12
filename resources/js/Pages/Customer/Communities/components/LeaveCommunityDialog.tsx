import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Community } from '../types';

interface LeaveCommunityDialogProps {
    open: boolean;
    community: Community | null;
    isProcessing: boolean;
    onClose: () => Promise<void> | void;
    onConfirm: () => Promise<void> | void;
}

export function LeaveCommunityDialog({
    open,
    community,
    isProcessing,
    onClose,
    onConfirm,
}: LeaveCommunityDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(dialogOpen) => {
                if (!dialogOpen) {
                    onClose();
                }
            }}
        >
            <DialogContent className="max-w-md border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-100">
                        Leave Community
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Are you sure you want to leave{' '}
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {community?.name}
                        </span>
                        ? You will need to request to join again if you change
                        your mind.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="space-x-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full sm:w-auto"
                        disabled={isProcessing}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="w-full sm:w-auto"
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <svg
                                    className="mr-2 h-4 w-4 animate-spin"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Leaving...
                            </>
                        ) : (
                            'Leave Community'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
