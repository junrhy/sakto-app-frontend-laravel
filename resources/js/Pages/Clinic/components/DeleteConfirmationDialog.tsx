import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Patient } from '../types';

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    onConfirm: (patientId: string) => void;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
    isOpen,
    onClose,
    patient,
    onConfirm
}) => {
    const handleConfirm = () => {
        if (patient) {
            onConfirm(patient.id);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">Confirm Deletion</DialogTitle>
                </DialogHeader>
                <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete {patient?.name}? This action cannot be undone.
                </p>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
