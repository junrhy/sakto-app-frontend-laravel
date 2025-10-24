import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import React, { useEffect, useState } from 'react';
import { EditTableData } from '../../types';

interface EditTableDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (
        id: number,
        name: string,
        seats: number,
        location: string,
    ) => void;
    editTableData: EditTableData | null;
}

export const EditTableDialog: React.FC<EditTableDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    editTableData,
}) => {
    const [tableName, setTableName] = useState('');
    const [tableSeats, setTableSeats] = useState(1);
    const [tableLocation, setTableLocation] = useState('indoor');

    useEffect(() => {
        if (editTableData) {
            setTableName(editTableData.name);
            setTableSeats(editTableData.seats);
            setTableLocation(editTableData.location || 'indoor');
        }
    }, [editTableData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tableName.trim() && tableSeats > 0 && editTableData) {
            onConfirm(
                editTableData.id,
                tableName.trim(),
                tableSeats,
                tableLocation,
            );
            onClose();
        }
    };

    const handleClose = () => {
        setTableName('');
        setTableSeats(1);
        setTableLocation('indoor');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Table</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor="editTableName"
                                className="text-right"
                            >
                                Table Name
                            </Label>
                            <Input
                                id="editTableName"
                                value={tableName}
                                onChange={(e) => setTableName(e.target.value)}
                                className="col-span-3 border border-gray-300 bg-white text-gray-900 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                placeholder="e.g., Table 5"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor="editTableSeats"
                                className="text-right"
                            >
                                Number of Seats
                            </Label>
                            <Input
                                id="editTableSeats"
                                type="number"
                                min="1"
                                value={tableSeats}
                                onChange={(e) =>
                                    setTableSeats(parseInt(e.target.value))
                                }
                                className="col-span-3 border border-gray-300 bg-white text-gray-900 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor="editTableLocation"
                                className="text-right"
                            >
                                Location
                            </Label>
                            <Select
                                value={tableLocation}
                                onValueChange={setTableLocation}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="indoor">
                                        Indoor
                                    </SelectItem>
                                    <SelectItem value="outdoor">
                                        Outdoor
                                    </SelectItem>
                                    <SelectItem value="bar">Bar</SelectItem>
                                    <SelectItem value="2nd_floor">
                                        2nd Floor
                                    </SelectItem>
                                    <SelectItem value="rooftop">
                                        Rooftop
                                    </SelectItem>
                                    <SelectItem value="private_room">
                                        Private Room
                                    </SelectItem>
                                    <SelectItem value="terrace">
                                        Terrace
                                    </SelectItem>
                                    <SelectItem value="garden">
                                        Garden
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                            Update Table
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
