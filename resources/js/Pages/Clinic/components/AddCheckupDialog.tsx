import { Button } from '@/Components/ui/button';
import { Calendar } from '@/Components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import { Textarea } from '@/Components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React from 'react';
import { CheckupDate, NewCheckupResult, Patient } from '../types';

interface AddCheckupDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    checkupData: NewCheckupResult;
    setCheckupData: (data: NewCheckupResult) => void;
    checkupDateTime: CheckupDate;
    setCheckupDateTime: (date: CheckupDate) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const AddCheckupDialog: React.FC<AddCheckupDialogProps> = ({
    isOpen,
    onClose,
    patient,
    checkupData,
    setCheckupData,
    checkupDateTime,
    setCheckupDateTime,
    onSubmit,
}) => {
    const handleClose = () => {
        setCheckupData({
            checkup_date: '',
            date: '',
            diagnosis: '',
            treatment: '',
            notes: '',
        });
        setCheckupDateTime({ date: undefined });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">
                        Add Checkup Record for {patient?.name}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-gray-900 dark:text-white">
                            Date
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !checkupDateTime.date &&
                                            'text-muted-foreground',
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {checkupDateTime.date ? (
                                        format(checkupDateTime.date, 'PPP')
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={checkupDateTime.date}
                                    onSelect={(date) =>
                                        setCheckupDateTime({
                                            date: date || undefined,
                                        })
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Label
                            htmlFor="diagnosis"
                            className="text-gray-900 dark:text-white"
                        >
                            Diagnosis
                        </Label>
                        <Textarea
                            id="diagnosis"
                            value={checkupData.diagnosis}
                            onChange={(e) =>
                                setCheckupData({
                                    ...checkupData,
                                    diagnosis: e.target.value,
                                })
                            }
                            className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <Label
                            htmlFor="treatment"
                            className="text-gray-900 dark:text-white"
                        >
                            Treatment
                        </Label>
                        <Textarea
                            id="treatment"
                            value={checkupData.treatment}
                            onChange={(e) =>
                                setCheckupData({
                                    ...checkupData,
                                    treatment: e.target.value,
                                })
                            }
                            className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <Label
                            htmlFor="notes"
                            className="text-gray-900 dark:text-white"
                        >
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            value={checkupData.notes}
                            onChange={(e) =>
                                setCheckupData({
                                    ...checkupData,
                                    notes: e.target.value,
                                })
                            }
                            className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Save Checkup</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
