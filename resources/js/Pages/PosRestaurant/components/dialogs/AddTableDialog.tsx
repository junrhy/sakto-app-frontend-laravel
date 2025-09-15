import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";

interface AddTableDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, seats: number) => void;
}

export const AddTableDialog: React.FC<AddTableDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    const [tableName, setTableName] = useState("");
    const [tableSeats, setTableSeats] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tableName.trim() && tableSeats > 0) {
            onConfirm(tableName.trim(), tableSeats);
            setTableName("");
            setTableSeats(1);
            onClose();
        }
    };

    const handleClose = () => {
        setTableName("");
        setTableSeats(1);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Table</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tableName" className="text-right">
                                Table Name
                            </Label>
                            <Input
                                id="tableName"
                                value={tableName}
                                onChange={(e) => setTableName(e.target.value)}
                                className="col-span-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
                                placeholder="e.g., Table 5"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tableSeats" className="text-right">
                                Number of Seats
                            </Label>
                            <Input
                                id="tableSeats"
                                type="number"
                                min="1"
                                value={tableSeats}
                                onChange={(e) => setTableSeats(parseInt(e.target.value))}
                                className="col-span-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
                                required
                            />
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                            Add Table
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
