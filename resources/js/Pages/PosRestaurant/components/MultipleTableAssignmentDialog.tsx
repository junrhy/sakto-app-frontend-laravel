import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Check, MapPin, Users } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
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
    isTableUnavailableInSchedule: (
        tableId: number,
        date: string,
        time: string,
    ) => boolean;
    getJoinedTableInfo: (
        tableId: number,
        date: string,
        time: string,
    ) => {
        joinedWith: string;
        joinedTableIds: number[];
        totalSeats: number;
    } | null;
    preSelectedTableIds?: number[];
}

export const MultipleTableAssignmentDialog: React.FC<
    MultipleTableAssignmentDialogProps
> = ({
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
    const [selectedTableIds, setSelectedTableIds] =
        useState<number[]>(preSelectedTableIds);

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
        sortedLocations.forEach((location) => {
            sortedGrouped[location] = grouped[location];
        });

        return sortedGrouped;
    }, [tables]);

    // Calculate total seats from selected tables
    const totalSelectedSeats = useMemo(() => {
        return selectedTableIds.reduce((total, tableId) => {
            const table = tables.find((t) => {
                const tId =
                    typeof t.id === 'number' ? t.id : parseInt(t.id.toString());
                return tId === tableId;
            });
            return total + (table?.seats || 0);
        }, 0);
    }, [selectedTableIds, tables]);

    const handleTableToggle = (tableId: number) => {
        setSelectedTableIds((prev) => {
            if (prev.includes(tableId)) {
                return prev.filter((id) => id !== tableId);
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
        const tableId =
            typeof table.id === 'number'
                ? table.id
                : parseInt(table.id.toString());

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
        const tableId =
            typeof table.id === 'number'
                ? table.id
                : parseInt(table.id.toString());

        if (isTableReserved(tableId, selectedDate, selectedTime)) {
            return { status: 'reserved', message: 'Already reserved' };
        }

        if (isTableUnavailableInSchedule(tableId, selectedDate, selectedTime)) {
            return { status: 'unavailable', message: 'Unavailable' };
        }

        return { status: 'available', message: 'Available' };
    };

    const formatLocationName = (location: string) => {
        return (
            location.charAt(0).toUpperCase() +
            location.slice(1).replace(/_/g, ' ')
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex h-[80vh] max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                <DialogHeader className="border-b border-gray-200 pb-4 dark:border-gray-700">
                    <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Users className="h-5 w-5" />
                        Assign Tables
                    </DialogTitle>
                </DialogHeader>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    {/* Summary */}
                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/30">
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
                            {totalSelectedSeats < guests &&
                                selectedTableIds.length > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="border border-red-200 bg-red-100 text-xs text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200"
                                    >
                                        Insufficient capacity
                                    </Badge>
                                )}
                        </div>
                    </div>

                    {/* Tables by Location */}
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
                        {Object.entries(tablesByLocation).map(
                            ([location, locationTables]) => (
                                <Card
                                    key={location}
                                    className="overflow-hidden border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <CardHeader className="border-b border-gray-200 bg-gray-50 pb-3 dark:border-gray-600 dark:bg-gray-700">
                                        <CardTitle className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                            <MapPin className="h-4 w-4" />
                                            {formatLocationName(location)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="bg-white p-4 dark:bg-gray-800">
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                            {locationTables.map((table) => {
                                                const tableId =
                                                    typeof table.id === 'number'
                                                        ? table.id
                                                        : parseInt(
                                                              table.id.toString(),
                                                          );
                                                const isSelected =
                                                    selectedTableIds.includes(
                                                        tableId,
                                                    );
                                                const isAvailable =
                                                    isTableAvailable(table);
                                                const tableStatus =
                                                    getTableStatus(table);
                                                const isDisabled = !isAvailable;

                                                return (
                                                    <Card
                                                        key={table.id}
                                                        className={`cursor-pointer border transition-all duration-200 ${
                                                            isSelected
                                                                ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-500 dark:border-blue-600 dark:bg-blue-900/30'
                                                                : isDisabled
                                                                  ? 'cursor-not-allowed border-gray-300 bg-gray-100 opacity-50 dark:border-gray-600 dark:bg-gray-800'
                                                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700'
                                                        }`}
                                                        onClick={() =>
                                                            !isDisabled &&
                                                            handleTableToggle(
                                                                tableId,
                                                            )
                                                        }
                                                    >
                                                        <CardHeader className="p-0 pb-2">
                                                            <div className="relative w-full">
                                                                <Badge
                                                                    variant={
                                                                        tableStatus.status ===
                                                                        'available'
                                                                            ? 'default'
                                                                            : tableStatus.status ===
                                                                                'reserved'
                                                                              ? 'secondary'
                                                                              : 'destructive'
                                                                    }
                                                                    className="w-full justify-center text-xs"
                                                                >
                                                                    {
                                                                        tableStatus.message
                                                                    }
                                                                </Badge>
                                                                {isSelected && (
                                                                    <Check className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-blue-600 dark:text-blue-400" />
                                                                )}
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="p-0 pb-2 text-center">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                {table.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {table.seats}{' '}
                                                                seats
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            ),
                        )}
                    </div>
                </div>

                <DialogFooter className="mt-4 flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex-1 text-sm text-gray-600 dark:text-gray-300">
                        {selectedTableIds.length > 0 && (
                            <span>
                                Selected: {selectedTableIds.length} table(s)
                                with {totalSelectedSeats} total seats
                            </span>
                        )}
                    </div>
                    <div className="ml-4 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSelectedTableIds([]);
                                onClose();
                            }}
                            className="border-gray-300 px-4 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            disabled={
                                selectedTableIds.length === 0 ||
                                totalSelectedSeats < guests
                            }
                            className="bg-blue-600 px-4 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Assign {selectedTableIds.length} Table
                            {selectedTableIds.length !== 1 ? 's' : ''}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
