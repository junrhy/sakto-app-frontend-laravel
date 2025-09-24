import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { ScrollArea } from '@/Components/ui/scroll-area';
import React from 'react';
import { Patient, ToothData } from '../types';
import DentalChart from './DentalChart';

interface DentalChartDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    editingDentalChart: ToothData[];
    onToothClick: (toothId: number) => void;
    onSave: () => void;
}

export const DentalChartDialog: React.FC<DentalChartDialogProps> = ({
    isOpen,
    onClose,
    patient,
    editingDentalChart,
    onToothClick,
    onSave,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">
                        Dental Chart for {patient?.name}
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh]">
                    {patient && (
                        <div className="space-y-4">
                            <DentalChart
                                teethData={editingDentalChart}
                                onToothClick={onToothClick}
                            />
                            <Button onClick={onSave}>Save Dental Chart</Button>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
