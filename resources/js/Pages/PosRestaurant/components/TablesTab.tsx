import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Calculator, Edit, Link2, Plus, Trash, Unlink } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Table as TableType, Reservation, BlockedDate } from '../types';
import { DateCalendar } from './DateCalendar';
import { toast } from 'sonner';

interface TableSchedule {
    id: number;
    tableId: number;
    scheduleDate: string;
    timeslots: string[];
    status: 'available' | 'unavailable' | 'joined';
    joinedWith?: string | null;
    notes?: string | null;
}

interface OpenedDate {
    id: number;
    opened_date: string;
    timeslots: string[];
    reason?: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
}

interface TablesTabProps {
    tables: TableType[];
    reservations?: Reservation[];
    openedDates?: OpenedDate[];
    blockedDates?: BlockedDate[];
    tableSchedules?: TableSchedule[];
    currency_symbol: string;
    canEdit: boolean;
    canDelete: boolean;
    onAddTable: () => void;
    onEditTable: (table: TableType) => void;
    onDeleteTable: (tableId: number) => void;
    onJoinTables: (tableIds: number[]) => void;
    onUnjoinTables: (tableIds: number[]) => void;
    onSetTableStatusFilter: (
        filter: 'all' | 'available' | 'occupied' | 'reserved' | 'joined',
    ) => void;
    tableStatusFilter: 'all' | 'available' | 'occupied' | 'reserved' | 'joined';
    onSetTableSchedule?: (data: {
        tableIds: number[];
        date: string;
        time: string;
        status: 'available' | 'unavailable' | 'joined';
        joinedWith?: string;
    }) => void;
}

export const TablesTab: React.FC<TablesTabProps> = ({
    tables,
    reservations = [],
    openedDates = [],
    blockedDates = [],
    tableSchedules = [],
    currency_symbol,
    canEdit,
    canDelete,
    onAddTable,
    onEditTable,
    onDeleteTable,
    onJoinTables,
    onUnjoinTables,
    onSetTableStatusFilter,
    tableStatusFilter,
    onSetTableSchedule,
}) => {
    const [selectedTables, setSelectedTables] = useState<number[]>([]);
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const [selectedTime, setSelectedTime] = useState('');

    // Generate time slots with 30-minute intervals (same as ReservationsTab)
    const generateTimeSlots = useCallback(() => {
        const amSlots = [];
        const pmSlots = [];

        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const hours12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                const period = hour >= 12 ? 'PM' : 'AM';
                const displayTime = `${hours12}:${minute.toString().padStart(2, '0')} ${period}`;
                const slot = { value: timeString, display: displayTime };

                if (hour < 12) {
                    amSlots.push(slot);
                } else {
                    pmSlots.push(slot);
                }
            }
        }

        return { am: amSlots, pm: pmSlots };
    }, []);

    const timeSlots = useMemo(() => generateTimeSlots(), [generateTimeSlots]);

    // Check if a timeslot is opened
    const isTimeSlotOpened = useCallback(
        (date: string, time: string) => {
            // If no opened dates configured, all dates are available
            if (openedDates.length === 0) return true;
            
            // Check if this specific date and time is opened
            return openedDates.some((openedDate) => {
                const openedDateStr = openedDate.opened_date.split('T')[0];
                return (
                    openedDateStr === date &&
                    openedDate.timeslots &&
                    openedDate.timeslots.includes(time)
                );
            });
        },
        [openedDates],
    );

    // Check if a timeslot is blocked
    const isTimeSlotBlocked = useCallback(
        (date: string, time: string) => {
            return blockedDates.some((blockedDate) => {
                const blockedDateStr = blockedDate.blocked_date.split('T')[0];
                return (
                    blockedDateStr === date &&
                    blockedDate.timeslots &&
                    blockedDate.timeslots.includes(time)
                );
            });
        },
        [blockedDates],
    );

    // Check if a table is unavailable according to schedule
    const isTableUnavailableForSlot = useCallback(
        (tableId: number, date: string, time: string) => {
            return tableSchedules.some(
                (schedule) => {
                    // Extract date part from scheduleDate (handles both "2025-10-18" and "2025-10-18T00:00:00.000000Z")
                    const scheduleDateOnly = schedule.scheduleDate.split('T')[0];
                    
                    return (
                        schedule.tableId === tableId &&
                        scheduleDateOnly === date &&
                        schedule.timeslots.includes(time) &&
                        schedule.status === 'unavailable'
                    );
                }
            );
        },
        [tableSchedules],
    );

    // Check if a timeslot has any reservations
    const hasReservationsForTimeslot = useCallback(
        (time: string) => {
            return reservations.some(
                (reservation) =>
                    reservation.date === selectedDate &&
                    reservation.time === time &&
                    reservation.status !== 'cancelled',
            );
        },
        [reservations, selectedDate],
    );

    // Check if a table is reserved for the selected date and time
    const isTableReservedForSlot = useCallback(
        (tableId: number) => {
            if (!selectedTime) return false;
            return reservations.some(
                (reservation) =>
                    reservation.tableId === tableId &&
                    reservation.date === selectedDate &&
                    reservation.time === selectedTime &&
                    reservation.status !== 'cancelled',
            );
        },
        [reservations, selectedDate, selectedTime],
    );

    // Check if a table is available for the selected date and time
    const isTableAvailableForSlot = useCallback(
        (tableId: number) => {
            if (!selectedTime) return true;
            
            // Check if table is marked as unavailable in schedules
            const isUnavailable = isTableUnavailableForSlot(tableId, selectedDate, selectedTime);
            if (isUnavailable) return false;
            
            // Check if table is reserved
            const isReserved = isTableReservedForSlot(tableId);
            return !isReserved;
        },
        [selectedTime, selectedDate, isTableUnavailableForSlot, isTableReservedForSlot],
    );

    // Check if a table is joined for the selected time slot
    const getJoinedTablesForSlot = useCallback(
        (tableId: number) => {
            if (!selectedTime) return null;
            
            const schedule = tableSchedules.find(
                (schedule) => {
                    const scheduleDateOnly = schedule.scheduleDate.split('T')[0];
                    return (
                        schedule.tableId === tableId &&
                        scheduleDateOnly === selectedDate &&
                        schedule.timeslots.includes(selectedTime) &&
                        schedule.status === 'joined'
                    );
                }
            );
            
            return schedule?.joinedWith || null;
        },
        [tableSchedules, selectedDate, selectedTime],
    );

    // Get table status for selected date/time
    const getTableStatusForSlot = useCallback(
        (table: TableType) => {
            if (!selectedTime) return table.status;
            
            const tableId = typeof table.id === 'number' ? table.id : parseInt(table.id.toString());
            
            // Check if table is joined in schedules
            const joinedWith = getJoinedTablesForSlot(tableId);
            if (joinedWith) return 'joined';
            
            // Check if table is unavailable in schedules
            const isUnavailable = isTableUnavailableForSlot(tableId, selectedDate, selectedTime);
            if (isUnavailable) return 'occupied'; // Use 'occupied' to show as unavailable
            
            // Check if table is reserved
            const isReserved = isTableReservedForSlot(tableId);
            
            return isReserved ? 'reserved' : table.status;
        },
        [selectedTime, selectedDate, getJoinedTablesForSlot, isTableUnavailableForSlot, isTableReservedForSlot],
    );

    const filteredTables = useMemo(() => {
        if (!Array.isArray(tables)) return [];

        return tableStatusFilter === 'all'
            ? tables
            : tables.filter((table) => table.status === tableStatusFilter);
    }, [tables, tableStatusFilter]);

    const availableTables = useMemo(
        () => filteredTables.filter((table) => table.status === 'available'),
        [filteredTables],
    );

    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'occupied':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'reserved':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'joined':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    }, []);

    const getStatusIcon = useCallback((status: string) => {
        switch (status) {
            case 'available':
                return '🟢';
            case 'occupied':
                return '🔴';
            case 'reserved':
                return '🟡';
            case 'joined':
                return '🔵';
            default:
                return '⚪';
        }
    }, []);

    const handleTableSelect = useCallback(
        (tableId: number, checked: boolean) => {
            if (checked) {
                setSelectedTables((prev) => [...prev, tableId]);
            } else {
                setSelectedTables((prev) =>
                    prev.filter((id) => id !== tableId),
                );
            }
        },
        [],
    );

    const handleSelectAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                setSelectedTables(
                    availableTables.map((table) =>
                        typeof table.id === 'number'
                            ? table.id
                            : parseInt(table.id.toString()),
                    ),
                );
            } else {
                setSelectedTables([]);
            }
        },
        [availableTables],
    );

    // Table Schedule handlers
    const handleSetUnavailable = useCallback(() => {
        if (!selectedTime || selectedTables.length === 0 || !onSetTableSchedule) return;
        
        // Check if timeslot is opened
        if (!isTimeSlotOpened(selectedDate, selectedTime)) {
            toast.error('This time slot is not opened. Please open it first in the "Opened Dates" tab.');
            return;
        }
        
        // Check if timeslot is blocked
        if (isTimeSlotBlocked(selectedDate, selectedTime)) {
            toast.error('This time slot is blocked. You cannot manage table schedules on blocked dates.');
            return;
        }
        
        onSetTableSchedule({
            tableIds: selectedTables,
            date: selectedDate,
            time: selectedTime,
            status: 'unavailable',
        });
        
        setSelectedTables([]);
    }, [selectedTables, selectedDate, selectedTime, onSetTableSchedule, isTimeSlotOpened, isTimeSlotBlocked]);

    const handleSetAvailable = useCallback(() => {
        if (!selectedTime || selectedTables.length === 0 || !onSetTableSchedule) return;
        
        // Check if timeslot is opened
        if (!isTimeSlotOpened(selectedDate, selectedTime)) {
            toast.error('This time slot is not opened. Please open it first in the "Opened Dates" tab.');
            return;
        }
        
        // Check if timeslot is blocked
        if (isTimeSlotBlocked(selectedDate, selectedTime)) {
            toast.error('This time slot is blocked. You cannot manage table schedules on blocked dates.');
            return;
        }
        
        onSetTableSchedule({
            tableIds: selectedTables,
            date: selectedDate,
            time: selectedTime,
            status: 'available',
        });
        
        setSelectedTables([]);
    }, [selectedTables, selectedDate, selectedTime, onSetTableSchedule, isTimeSlotOpened, isTimeSlotBlocked]);

    const handleJoinTablesForTime = useCallback(() => {
        if (!selectedTime || selectedTables.length < 2 || !onSetTableSchedule) return;
        
        // Check if timeslot is opened
        if (!isTimeSlotOpened(selectedDate, selectedTime)) {
            toast.error('This time slot is not opened. Please open it first in the "Opened Dates" tab.');
            return;
        }
        
        // Check if timeslot is blocked
        if (isTimeSlotBlocked(selectedDate, selectedTime)) {
            toast.error('This time slot is blocked. You cannot manage table schedules on blocked dates.');
            return;
        }
        
        onSetTableSchedule({
            tableIds: selectedTables,
            date: selectedDate,
            time: selectedTime,
            status: 'joined',
            joinedWith: selectedTables.join(','),
        });
        
        setSelectedTables([]);
    }, [selectedTables, selectedDate, selectedTime, onSetTableSchedule, isTimeSlotOpened, isTimeSlotBlocked]);

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-gray-900 dark:text-white">
                            <Calculator className="mr-2 h-5 w-5 text-green-500" />
                            Tables Overview
                        </CardTitle>
                        {canEdit && (
                            <Button
                                onClick={onAddTable}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Table
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {/* Date and Time Slot Selection */}
                    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50/50 p-6 dark:border-blue-800/50 dark:bg-blue-900/10">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Select Date & Time to View Table Availability
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Calendar Section - Left Side */}
                            <div className="lg:col-span-6">
                                <Label className="mb-3 block text-sm font-medium text-gray-900 dark:text-white">
                                    Select Date
                                </Label>
                                <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
                                    <DateCalendar
                                        selectedDate={selectedDate}
                                        onDateSelect={(dateStr) => {
                                            setSelectedDate(dateStr);
                                            setSelectedTime(''); // Reset time when date changes
                                        }}
                                        blockedDates={[]}
                                        minDate={new Date()}
                                    />
                                </div>
                            </div>

                            {/* Time Slots Section - Right Side */}
                            <div className="lg:col-span-6">
                                <Label className="mb-3 block text-sm font-medium text-gray-900 dark:text-white">
                                    Select Time Slot (Optional)
                                </Label>

                                {/* Legend */}
                                <div className="mb-3 flex flex-wrap gap-3 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded border border-gray-400 bg-gray-300 dark:border-gray-700 dark:bg-gray-800"></div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Not Opened
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded border border-red-300 bg-red-500"></div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Blocked
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"></div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Available
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded border border-blue-500 bg-blue-500"></div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Selected
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded border border-yellow-300 bg-yellow-100 dark:border-yellow-700 dark:bg-yellow-900/30"></div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Has reservations
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* AM Column */}
                                        <div>
                                            <h4 className="mb-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                AM
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {timeSlots.am.map((timeSlot) => {
                                                    const isSelected = selectedTime === timeSlot.value;
                                                    const isOpened = isTimeSlotOpened(selectedDate, timeSlot.value);
                                                    const isBlocked = isTimeSlotBlocked(selectedDate, timeSlot.value);
                                                    const hasReservations = hasReservationsForTimeslot(timeSlot.value);
                                                    const isDisabled = !isOpened || isBlocked;
                                                    return (
                                                        <button
                                                            key={timeSlot.value}
                                                            type="button"
                                                            onClick={() => !isDisabled && setSelectedTime(timeSlot.value)}
                                                            disabled={isDisabled}
                                                            className={`rounded-md border px-2 py-1.5 text-sm font-medium transition-all ${
                                                                !isOpened
                                                                    ? 'border-gray-400 bg-gray-300 text-gray-600 cursor-not-allowed opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                                                                    : isBlocked
                                                                    ? 'border-red-300 bg-red-500 text-white cursor-not-allowed opacity-60'
                                                                    : isSelected
                                                                    ? 'border-blue-500 bg-blue-500 text-white shadow-md ring-2 ring-blue-300'
                                                                    : hasReservations
                                                                      ? 'border-yellow-300 bg-yellow-100 text-yellow-800 hover:border-yellow-400 hover:bg-yellow-200 cursor-pointer dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50'
                                                                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20'
                                                            }`}
                                                        >
                                                            {timeSlot.display}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* PM Column */}
                                        <div>
                                            <h4 className="mb-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                PM
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {timeSlots.pm.map((timeSlot) => {
                                                    const isSelected = selectedTime === timeSlot.value;
                                                    const isOpened = isTimeSlotOpened(selectedDate, timeSlot.value);
                                                    const isBlocked = isTimeSlotBlocked(selectedDate, timeSlot.value);
                                                    const hasReservations = hasReservationsForTimeslot(timeSlot.value);
                                                    const isDisabled = !isOpened || isBlocked;
                                                    return (
                                                        <button
                                                            key={timeSlot.value}
                                                            type="button"
                                                            onClick={() => !isDisabled && setSelectedTime(timeSlot.value)}
                                                            disabled={isDisabled}
                                                            className={`rounded-md border px-2 py-1.5 text-sm font-medium transition-all ${
                                                                !isOpened
                                                                    ? 'border-gray-400 bg-gray-300 text-gray-600 cursor-not-allowed opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                                                                    : isBlocked
                                                                    ? 'border-red-300 bg-red-500 text-white cursor-not-allowed opacity-60'
                                                                    : isSelected
                                                                    ? 'border-blue-500 bg-blue-500 text-white shadow-md ring-2 ring-blue-300'
                                                                    : hasReservations
                                                                      ? 'border-yellow-300 bg-yellow-100 text-yellow-800 hover:border-yellow-400 hover:bg-yellow-200 cursor-pointer dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50'
                                                                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20'
                                                            }`}
                                                        >
                                                            {timeSlot.display}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedTime && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                            <p className="text-xs text-blue-800 dark:text-blue-200">
                                                Viewing tables for: <strong>{new Date(selectedDate).toLocaleDateString()}</strong> at <strong>{new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</strong>
                                            </p>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setSelectedTime('')}
                                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                            >
                                                Clear Selection
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2 text-xs">
                                            <div className="rounded-md bg-green-50 p-2 text-center dark:bg-green-900/20">
                                                <p className="font-semibold text-green-800 dark:text-green-200">
                                                    {tables.filter(t => {
                                                        const tableId = typeof t.id === 'number' ? t.id : parseInt(t.id.toString());
                                                        return isTableAvailableForSlot(tableId);
                                                    }).length}
                                                </p>
                                                <p className="text-green-700 dark:text-green-300">Available</p>
                                            </div>
                                            <div className="rounded-md bg-yellow-50 p-2 text-center dark:bg-yellow-900/20">
                                                <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                                                    {tables.filter(t => {
                                                        const tableId = typeof t.id === 'number' ? t.id : parseInt(t.id.toString());
                                                        return isTableReservedForSlot(tableId);
                                                    }).length}
                                                </p>
                                                <p className="text-yellow-700 dark:text-yellow-300">Reserved</p>
                                            </div>
                                            <div className="rounded-md bg-blue-50 p-2 text-center dark:bg-blue-900/20">
                                                <p className="font-semibold text-blue-800 dark:text-blue-200">
                                                    {tables.filter(t => {
                                                        const tableId = typeof t.id === 'number' ? t.id : parseInt(t.id.toString());
                                                        return getJoinedTablesForSlot(tableId) !== null;
                                                    }).length}
                                                </p>
                                                <p className="text-blue-700 dark:text-blue-300">Joined</p>
                                            </div>
                                            <div className="rounded-md bg-red-50 p-2 text-center dark:bg-red-900/20">
                                                <p className="font-semibold text-red-800 dark:text-red-200">
                                                    {tables.filter(t => {
                                                        const tableId = typeof t.id === 'number' ? t.id : parseInt(t.id.toString());
                                                        return isTableUnavailableForSlot(tableId, selectedDate, selectedTime);
                                                    }).length}
                                                </p>
                                                <p className="text-red-700 dark:text-red-300">Unavailable</p>
                                            </div>
                                            <div className="rounded-md bg-gray-50 p-2 text-center dark:bg-gray-700">
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {tables.length}
                                                </p>
                                                <p className="text-gray-700 dark:text-gray-300">Total</p>
                                            </div>
                                        </div>
                                        
                                        {/* Table Schedule Actions */}
                                        {!selectedTime && selectedTables.length > 0 && (
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    💡 Select a time slot above to manage table schedules for specific times
                                                </p>
                                            </div>
                                        )}
                                        
                                        {selectedTime && selectedTables.length > 0 && (
                                            <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800/50 dark:bg-purple-900/10">
                                                <p className="mb-2 text-xs font-semibold text-purple-800 dark:text-purple-200">
                                                    Table Schedule Actions ({selectedTables.length} table{selectedTables.length > 1 ? 's' : ''} selected)
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                                        onClick={handleSetUnavailable}
                                                        disabled={!onSetTableSchedule}
                                                    >
                                                        Set Unavailable
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-green-300 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                                                        onClick={handleSetAvailable}
                                                        disabled={!onSetTableSchedule}
                                                    >
                                                        Set Available
                                                    </Button>
                                                    {selectedTables.length >= 2 && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                            onClick={handleJoinTablesForTime}
                                                            disabled={!onSetTableSchedule}
                                                        >
                                                            <Link2 className="mr-1 h-3 w-3" />
                                                            Join for this Time
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex items-end space-x-2">
                            <div className="flex-1">
                                <Label htmlFor="tableStatusFilter">
                                    Filter by Status
                                </Label>
                                <Select
                                    value={tableStatusFilter}
                                    onValueChange={onSetTableStatusFilter}
                                >
                                    <SelectTrigger
                                        id="tableStatusFilter"
                                        className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent className="border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
                                        <SelectItem
                                            value="all"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            All
                                        </SelectItem>
                                        <SelectItem
                                            value="available"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            Available
                                        </SelectItem>
                                        <SelectItem
                                            value="occupied"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            Occupied
                                        </SelectItem>
                                        <SelectItem
                                            value="reserved"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            Reserved
                                        </SelectItem>
                                        <SelectItem
                                            value="joined"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            Joined
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {availableTables.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="selectAllTables"
                                    checked={
                                        selectedTables.length ===
                                            availableTables.length &&
                                        availableTables.length > 0
                                    }
                                    onCheckedChange={handleSelectAll}
                                />
                                <Label
                                    htmlFor="selectAllTables"
                                    className="text-sm text-gray-600 dark:text-gray-400"
                                >
                                    Select All Available (
                                    {availableTables.length})
                                </Label>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredTables.map((table) => {
                            const displayStatus = selectedTime ? getTableStatusForSlot(table) : table.status;
                            const isReservedForSlot = selectedTime && isTableReservedForSlot(
                                typeof table.id === 'number' ? table.id : parseInt(table.id.toString())
                            );
                            
                            return (
                            <Card
                                key={table.id}
                                className={`rounded-xl border-gray-200 bg-white shadow-md transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
                                    displayStatus === 'available'
                                        ? 'border-green-200 hover:border-green-300 dark:border-green-700 dark:hover:border-green-600'
                                        : displayStatus === 'occupied'
                                          ? 'border-red-200 hover:border-red-300 dark:border-red-700 dark:hover:border-red-600'
                                          : displayStatus === 'reserved'
                                            ? 'border-yellow-200 hover:border-yellow-300 dark:border-yellow-700 dark:hover:border-yellow-600'
                                            : 'border-blue-200 hover:border-blue-300 dark:border-blue-700 dark:hover:border-blue-600'
                                } ${isReservedForSlot ? 'ring-2 ring-yellow-300 dark:ring-yellow-700' : ''}`}
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-gray-900 dark:text-white">
                                            {table.status === 'joined' &&
                                            table.joined_with ? (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {getStatusIcon(
                                                                table.status,
                                                            )}
                                                        </span>
                                                        <span>
                                                            {table.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Joined with:{' '}
                                                        {table.joined_with}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span>
                                                        {getStatusIcon(
                                                            table.status,
                                                        )}
                                                    </span>
                                                    <span>{table.name}</span>
                                                </div>
                                            )}
                                        </CardTitle>
                                        {table.status === 'available' && (
                                            <Checkbox
                                                checked={selectedTables.includes(
                                                    typeof table.id === 'number'
                                                        ? table.id
                                                        : parseInt(
                                                              table.id.toString(),
                                                          ),
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handleTableSelect(
                                                        typeof table.id ===
                                                            'number'
                                                            ? table.id
                                                            : parseInt(
                                                                  table.id.toString(),
                                                              ),
                                                        checked as boolean,
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Seats: {table.seats}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Status:{' '}
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(displayStatus)}`}
                                        >
                                            {displayStatus}
                                        </span>
                                    </p>
                                    {table.joined_with && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Joined Tables: {table.joined_with}
                                        </p>
                                    )}
                                    {selectedTime && (() => {
                                        const tableId = typeof table.id === 'number' ? table.id : parseInt(table.id.toString());
                                        const isUnavailable = isTableUnavailableForSlot(tableId, selectedDate, selectedTime);
                                        const joinedWith = getJoinedTablesForSlot(tableId);
                                        
                                        if (joinedWith) {
                                            // Get names of joined tables
                                            const joinedTableIds = joinedWith.split(',').map(id => parseInt(id.trim()));
                                            const joinedTableNames = joinedTableIds
                                                .map(id => {
                                                    const foundTable = tables.find(t => {
                                                        const tId = typeof t.id === 'number' ? t.id : parseInt(t.id.toString());
                                                        return tId === id;
                                                    });
                                                    return foundTable?.name;
                                                })
                                                .filter(Boolean)
                                                .join(', ');
                                            
                                            return (
                                                <div className="mt-2 rounded-md bg-blue-50 p-2 dark:bg-blue-900/20">
                                                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                                                        <Link2 className="mr-1 inline h-3 w-3" />
                                                        Joined for selected time
                                                    </p>
                                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                                        With: {joinedTableNames}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        
                                        if (isUnavailable) {
                                            return (
                                                <div className="mt-2 rounded-md bg-red-50 p-2 dark:bg-red-900/20">
                                                    <p className="text-xs font-medium text-red-800 dark:text-red-200">
                                                        Unavailable for selected time
                                                    </p>
                                                </div>
                                            );
                                        }
                                        
                                        if (isReservedForSlot) {
                                            return (
                                                <div className="mt-2 rounded-md bg-yellow-50 p-2 dark:bg-yellow-900/20">
                                                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                                                        Reserved for selected time
                                                    </p>
                                                </div>
                                            );
                                        }
                                        
                                        return null;
                                    })()}
                                </CardContent>
                                <CardFooter className="flex flex-wrap gap-2">
                                    {selectedTime && displayStatus === 'joined' && (() => {
                                        const tableId = typeof table.id === 'number' ? table.id : parseInt(table.id.toString());
                                        const joinedWith = getJoinedTablesForSlot(tableId);
                                        
                                        if (joinedWith) {
                                            const joinedTableIds = joinedWith.split(',').map(id => parseInt(id.trim()));
                                            return (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        if (onSetTableSchedule) {
                                                            onSetTableSchedule({
                                                                tableIds: joinedTableIds,
                                                                date: selectedDate,
                                                                time: selectedTime,
                                                                status: 'available', // Set back to available to remove join
                                                            });
                                                        }
                                                    }}
                                                    className="text-orange-600 hover:text-orange-700"
                                                >
                                                    <Unlink className="mr-1 h-3 w-3" />
                                                    Unjoin for this Time
                                                </Button>
                                            );
                                        }
                                        return null;
                                    })()}
                                    
                                    {table.status === 'available' && (
                                        <>
                                            {canEdit && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        onEditTable(table)
                                                    }
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        onDeleteTable(
                                                            typeof table.id ===
                                                                'number'
                                                                ? table.id
                                                                : parseInt(
                                                                      table.id.toString(),
                                                                  ),
                                                        )
                                                    }
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </>
                                    )}
                                    {table.status === 'occupied' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            Complete Order
                                        </Button>
                                    )}
                                    {table.status === 'reserved' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            Check In
                                        </Button>
                                    )}
                                    {table.status === 'joined' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                onUnjoinTables([
                                                    typeof table.id === 'number'
                                                        ? table.id
                                                        : parseInt(
                                                              table.id.toString(),
                                                          ),
                                                ])
                                            }
                                            className="text-orange-600 hover:text-orange-700"
                                        >
                                            <Unlink className="h-4 w-4" />
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                            );
                        })}
                    </div>

                    {filteredTables.length === 0 && (
                        <div className="py-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                No tables found for the selected filter.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
