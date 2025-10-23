import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Check, Users, MapPin } from 'lucide-react';
import React, { useMemo, useState, useEffect } from 'react';
import { Table as TableType } from '../types';

interface TableSchedule {
    id: number;
    tableId: number;
    scheduleDate: string;
    timeslots: string[];
    status: 'available' | 'unavailable' | 'joined';
    joinedWith?: string | null;
    notes?: string | null;
}

interface MultipleTableAssignmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedTableIds: number[]) => void;
    tables: TableType[];
    selectedDate: string;
    selectedTime: string;
    guests: number;
    tableSchedules?: TableSchedule[];
    isTableReserved: (tableId: number, date: string, time: string) => boolean;
    isTableUnavailableInSchedule: (tableId: number, date: string, time: string) => boolean;
    getJoinedTableInfo: (tableId: number, date: string, time: string) => {
        joinedWith: string;
        joinedTableIds: number[];
        totalSeats: number;
    } | null;
    preSelectedTableIds?: number[];
}

export const MultipleTableAssignmentDialog: React.FC<MultipleTableAssignmentDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    tables,
    selectedDate,
    selectedTime,
    guests,
    tableSchedules = [],
    isTableReserved,
    isTableUnavailableInSchedule,
    getJoinedTableInfo,
    preSelectedTableIds = [],
}) => {
    const [selectedTableIds, setSelectedTableIds] = useState<number[]>(preSelectedTableIds);

    // Update selected table IDs when dialog opens with new preSelectedTableIds
    useEffect(() => {
        if (isOpen) {
            setSelectedTableIds(preSelectedTableIds);
        }
    }, [isOpen, preSelectedTableIds]);

    // Group tables by location
    const tablesByLocation = useMemo(() => {
        const grouped: Record<string, TableType[]> = {};
        
        tables.forEach((table) => {
            const location = table.location || 'indoor';
            if (!grouped[location]) {
                grouped[location] = [];
            }
            grouped[location].push(table);
        });

        // Sort locations alphabetically
        const sortedLocations = Object.keys(grouped).sort();
        const sortedGrouped: Record<string, TableType[]> = {};
        sortedLocations.forEach(location => {
            sortedGrouped[location] = grouped[location];
        });

        return sortedGrouped;
    }, [tables]);

    // Calculate total seats from selected tables
    const totalSelectedSeats = useMemo(() => {
        return selectedTableIds.reduce((total, tableId) => {
            const table = tables.find(t => {
                const tId = typeof t.id === 'number' ? t.id : parseInt(t.id.toString());
                return tId === tableId;
            });
            return total + (table?.seats || 0);
        }, 0);
    }, [selectedTableIds, tables]);

    const handleTableToggle = (tableId: number) => {
        setSelectedTableIds(prev => {
            if (prev.includes(tableId)) {
                return prev.filter(id => id !== tableId);
            } else {
                return [...prev, tableId];
            }
        });
    };

    const handleConfirm = () => {
        if (selectedTableIds.length === 0) {
            return;
        }
        onConfirm(selectedTableIds);
        setSelectedTableIds([]);
    };

    const isTableAvailable = (table: TableType) => {
        const tableId = typeof table.id === 'number' ? table.id : parseInt(table.id.toString());
        
        // Check if table is reserved
        if (isTableReserved(tableId, selectedDate, selectedTime)) {
            return false;
        }

        // Check if table is unavailable in schedule
        if (isTableUnavailableInSchedule(tableId, selectedDate, selectedTime)) {
            return false;
        }

        return true;
    };

    const getTableStatus = (table: TableType) => {
        const tableId = typeof table.id === 'number' ? table.id : parseInt(table.id.toString());
        
        if (isTableReserved(tableId, selectedDate, selectedTime)) {
            return { status: 'reserved', message: 'Already reserved' };
        }
        
        if (isTableUnavailableInSchedule(tableId, selectedDate, selectedTime)) {
            return { status: 'unavailable', message: 'Unavailable' };
        }

        return { status: 'available', message: 'Available' };
    };

    const formatLocationName = (location: string) => {
        return location.charAt(0).toUpperCase() + location.slice(1).replace(/_/g, ' ');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-4xl h-[80vh] max-h-[80vh] overflow-hidden flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Users className="h-5 w-5" />
                        Assign Tables
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {/* Summary */}
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                                <span className="font-medium text-blue-900 dark:text-blue-100">
                                    Party Size: {guests} guests
                                </span>
                                <span className="font-medium text-blue-900 dark:text-blue-100">
                                    Selected Tables: {selectedTableIds.length}
                                </span>
                                <span className="font-medium text-blue-900 dark:text-blue-100">
                                    Total Seats: {totalSelectedSeats}
                                </span>
                            </div>
                            {totalSelectedSeats < guests && selectedTableIds.length > 0 && (
                                <Badge variant="destructive" className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700">
                                    Insufficient capacity
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Tables by Location */}
                    <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
                        {Object.entries(tablesByLocation).map(([location, locationTables]) => (
                            <Card key={location} className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                <CardHeader className="pb-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                    <CardTitle className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                        <MapPin className="h-4 w-4" />
                                        {formatLocationName(location)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 bg-white dark:bg-gray-800">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                        {locationTables.map((table) => {
                                            const tableId = typeof table.id === 'number' ? table.id : parseInt(table.id.toString());
                                            const isSelected = selectedTableIds.includes(tableId);
                                            const isAvailable = isTableAvailable(table);
                                            const tableStatus = getTableStatus(table);
                                            const isDisabled = !isAvailable;

                                            return (
                                                <Card 
                                                    key={table.id} 
                                                    className={`cursor-pointer transition-all duration-200 border ${
                                                        isSelected 
                                                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600' 
                                                            : isDisabled
                                                            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                                                            : 'hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                    }`}
                                                    onClick={() => !isDisabled && handleTableToggle(tableId)}
                                                >
                                                    <CardHeader className="p-0 pb-2">
                                                        <div className="relative w-full">
                                                            <Badge 
                                                                variant={
                                                                    tableStatus.status === 'available' 
                                                                        ? 'default' 
                                                                        : tableStatus.status === 'reserved'
                                                                        ? 'secondary'
                                                                        : 'destructive'
                                                                }
                                                                className="text-xs w-full justify-center"
                                                            >
                                                                {tableStatus.message}
                                                            </Badge>
                                                            {isSelected && (
                                                                <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 absolute top-1/2 right-2 transform -translate-y-1/2" />
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-0 pb-2 text-center">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                                            {table.name} 
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {table.seats} seats
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4 mt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                        {selectedTableIds.length > 0 && (
                            <span>
                                Selected: {selectedTableIds.length} table(s) with {totalSelectedSeats} total seats
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3 ml-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSelectedTableIds([]);
                                onClose();
                            }}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            disabled={selectedTableIds.length === 0 || totalSelectedSeats < guests}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Assign {selectedTableIds.length} Table{selectedTableIds.length !== 1 ? 's' : ''}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
