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
import {
    Calculator,
    ChevronDown,
    ChevronUp,
    Edit,
    Link2,
    Plus,
    Trash,
    Unlink,
    User,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BlockedDate, Reservation, Table as TableType } from '../types';
import { DateCalendar } from './DateCalendar';

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
    onUpdateTableStatus?: (table: TableType) => void;
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
    onUpdateTableStatus,
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
    const [showDateTimeSection, setShowDateTimeSection] = useState(false);

    // Local state for optimistic UI updates
    const [tableStatuses, setTableStatuses] = useState<
        Record<
            number | string,
            'available' | 'occupied' | 'reserved' | 'joined'
        >
    >({});

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

    // Auto-select first available timeslot when date changes
    React.useEffect(() => {
        // Combine all timeslots from AM and PM
        const allTimeSlots = [...timeSlots.am, ...timeSlots.pm];

        // Find the first available (opened and not blocked) timeslot
        const firstAvailable = allTimeSlots.find((slot) => {
            const isOpened = isTimeSlotOpened(selectedDate, slot.value);
            const isBlocked = isTimeSlotBlocked(selectedDate, slot.value);
            return isOpened && !isBlocked;
        });

        // Set the first available timeslot if found
        if (firstAvailable) {
            setSelectedTime(firstAvailable.value);
        } else {
            // Clear selection if no timeslots are available
            setSelectedTime('');
        }
    }, [
        selectedDate,
        timeSlots,
        openedDates,
        blockedDates,
        isTimeSlotOpened,
        isTimeSlotBlocked,
    ]);

    // Check if a table is unavailable according to schedule
    const isTableUnavailableForSlot = useCallback(
        (tableId: number, date: string, time: string) => {
            return tableSchedules.some((schedule) => {
                // Extract date part from scheduleDate (handles both "2025-10-18" and "2025-10-18T00:00:00.000000Z")
                const scheduleDateOnly = schedule.scheduleDate.split('T')[0];

                return (
                    schedule.tableId === tableId &&
                    scheduleDateOnly === date &&
                    schedule.timeslots.includes(time) &&
                    schedule.status === 'unavailable'
                );
            });
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
            const isUnavailable = isTableUnavailableForSlot(
                tableId,
                selectedDate,
                selectedTime,
            );
            if (isUnavailable) return false;

            // Check if table is reserved
            const isReserved = isTableReservedForSlot(tableId);
            return !isReserved;
        },
        [
            selectedTime,
            selectedDate,
            isTableUnavailableForSlot,
            isTableReservedForSlot,
        ],
    );

    // Check if a table is joined for the selected time slot
    const getJoinedTablesForSlot = useCallback(
        (tableId: number) => {
            if (!selectedTime) return null;

            const schedule = tableSchedules.find((schedule) => {
                const scheduleDateOnly = schedule.scheduleDate.split('T')[0];
                return (
                    schedule.tableId === tableId &&
                    scheduleDateOnly === selectedDate &&
                    schedule.timeslots.includes(selectedTime) &&
                    schedule.status === 'joined'
                );
            });

            return schedule?.joinedWith || null;
        },
        [tableSchedules, selectedDate, selectedTime],
    );

    // Get table status for selected date/time
    const getTableStatusForSlot = useCallback(
        (table: TableType) => {
            if (!selectedTime) return tableStatuses[table.id] || table.status;

            const tableId =
                typeof table.id === 'number'
                    ? table.id
                    : parseInt(table.id.toString());

            // Check if table is joined in schedules
            const joinedWith = getJoinedTablesForSlot(tableId);
            if (joinedWith) return 'joined';

            // Check if table is unavailable in schedules
            const isUnavailable = isTableUnavailableForSlot(
                tableId,
                selectedDate,
                selectedTime,
            );
            if (isUnavailable) return 'unavailable';

            // Check if table is reserved
            const isReserved = isTableReservedForSlot(tableId);

            return isReserved
                ? 'reserved'
                : tableStatuses[table.id] || table.status;
        },
        [
            selectedTime,
            selectedDate,
            tableStatuses,
            getJoinedTablesForSlot,
            isTableUnavailableForSlot,
            isTableReservedForSlot,
        ],
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
            case 'unavailable':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
        if (!selectedTime || selectedTables.length === 0 || !onSetTableSchedule)
            return;

        // Check if timeslot is opened
        if (!isTimeSlotOpened(selectedDate, selectedTime)) {
            toast.error(
                'This time slot is not opened. Please open it first in the "Opened Dates" tab.',
            );
            return;
        }

        // Check if timeslot is blocked
        if (isTimeSlotBlocked(selectedDate, selectedTime)) {
            toast.error(
                'This time slot is blocked. You cannot manage table schedules on blocked dates.',
            );
            return;
        }

        onSetTableSchedule({
            tableIds: selectedTables,
            date: selectedDate,
            time: selectedTime,
            status: 'unavailable',
        });

        setSelectedTables([]);
    }, [
        selectedTables,
        selectedDate,
        selectedTime,
        onSetTableSchedule,
        isTimeSlotOpened,
        isTimeSlotBlocked,
    ]);

    const handleSetAvailable = useCallback(() => {
        if (!selectedTime || selectedTables.length === 0 || !onSetTableSchedule)
            return;

        // Check if timeslot is opened
        if (!isTimeSlotOpened(selectedDate, selectedTime)) {
            toast.error(
                'This time slot is not opened. Please open it first in the "Opened Dates" tab.',
            );
            return;
        }

        // Check if timeslot is blocked
        if (isTimeSlotBlocked(selectedDate, selectedTime)) {
            toast.error(
                'This time slot is blocked. You cannot manage table schedules on blocked dates.',
            );
            return;
        }

        onSetTableSchedule({
            tableIds: selectedTables,
            date: selectedDate,
            time: selectedTime,
            status: 'available',
        });

        setSelectedTables([]);
    }, [
        selectedTables,
        selectedDate,
        selectedTime,
        onSetTableSchedule,
        isTimeSlotOpened,
        isTimeSlotBlocked,
    ]);

    const handleJoinTablesForTime = useCallback(() => {
        if (!selectedTime || selectedTables.length < 2 || !onSetTableSchedule)
            return;

        // Check if timeslot is opened
        if (!isTimeSlotOpened(selectedDate, selectedTime)) {
            toast.error(
                'This time slot is not opened. Please open it first in the "Opened Dates" tab.',
            );
            return;
        }

        // Check if timeslot is blocked
        if (isTimeSlotBlocked(selectedDate, selectedTime)) {
            toast.error(
                'This time slot is blocked. You cannot manage table schedules on blocked dates.',
            );
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
    }, [
        selectedTables,
        selectedDate,
        selectedTime,
        onSetTableSchedule,
        isTimeSlotOpened,
        isTimeSlotBlocked,
    ]);

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-white">
                            <Calculator className="mr-2 h-4 w-4 text-green-500" />
                            Tables Overview
                        </CardTitle>
                        {canEdit && (
                            <Button
                                onClick={onAddTable}
                                size="sm"
                                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl"
                            >
                                <Plus className="mr-1 h-3 w-3" /> Add Table
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        {/* Date and Time Slot Selection */}
                        <div>
                            <Card className="rounded-lg border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                                    <div className="flex items-center justify-between gap-4">
                                        <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                            <Calculator className="mr-2 h-4 w-4 text-blue-500" />
                                            Select Date & Time to View Table
                                            Availability
                                        </CardTitle>
                                        <div className="flex items-center gap-3">
                                            {selectedTime && (
                                                <p className="whitespace-nowrap text-xs text-blue-800 dark:text-blue-200">
                                                    Viewing:{' '}
                                                    <strong>
                                                        {new Date(
                                                            selectedDate,
                                                        ).toLocaleDateString()}
                                                    </strong>{' '}
                                                    at{' '}
                                                    <strong>
                                                        {new Date(
                                                            `2000-01-01T${selectedTime}`,
                                                        ).toLocaleTimeString(
                                                            'en-US',
                                                            {
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                hour12: true,
                                                            },
                                                        )}
                                                    </strong>
                                                </p>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setShowDateTimeSection(
                                                        !showDateTimeSection,
                                                    )
                                                }
                                                className="h-8 w-8 flex-shrink-0 p-0 text-gray-700 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                {showDateTimeSection ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                {showDateTimeSection && (
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {/* Calendar Section */}
                                            <div>
                                                <Label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                                                    Select Date
                                                </Label>
                                                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                                                    Choose a date to view and
                                                    manage table availability
                                                </p>
                                                <div className="rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-700">
                                                    <div className="origin-top-left scale-90">
                                                        <DateCalendar
                                                            selectedDate={
                                                                selectedDate
                                                            }
                                                            onDateSelect={(
                                                                dateStr,
                                                            ) => {
                                                                setSelectedDate(
                                                                    dateStr,
                                                                );
                                                                setSelectedTime(
                                                                    '',
                                                                ); // Reset time when date changes
                                                            }}
                                                            blockedDates={[]}
                                                            minDate={new Date()}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Time Slots Section */}
                                            <div>
                                                <Label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                                    Select Time Slot (Optional)
                                                </Label>

                                                {/* Legend */}
                                                <div className="mb-2 flex flex-wrap gap-3 text-xs">
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
                                                            Reservations
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
                                                                {timeSlots.am.map(
                                                                    (
                                                                        timeSlot,
                                                                    ) => {
                                                                        const isSelected =
                                                                            selectedTime ===
                                                                            timeSlot.value;
                                                                        const isOpened =
                                                                            isTimeSlotOpened(
                                                                                selectedDate,
                                                                                timeSlot.value,
                                                                            );
                                                                        const isBlocked =
                                                                            isTimeSlotBlocked(
                                                                                selectedDate,
                                                                                timeSlot.value,
                                                                            );
                                                                        const hasReservations =
                                                                            hasReservationsForTimeslot(
                                                                                timeSlot.value,
                                                                            );
                                                                        const isDisabled =
                                                                            !isOpened ||
                                                                            isBlocked;
                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    timeSlot.value
                                                                                }
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    !isDisabled &&
                                                                                    setSelectedTime(
                                                                                        timeSlot.value,
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    isDisabled
                                                                                }
                                                                                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-all ${
                                                                                    !isOpened
                                                                                        ? 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-600 opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                                                                                        : isBlocked
                                                                                          ? 'cursor-not-allowed border-red-300 bg-red-500 text-white opacity-60'
                                                                                          : isSelected
                                                                                            ? 'border-blue-500 bg-blue-500 text-white shadow-md ring-2 ring-blue-300'
                                                                                            : hasReservations
                                                                                              ? 'cursor-pointer border-yellow-300 bg-yellow-100 text-yellow-800 hover:border-yellow-400 hover:bg-yellow-200 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50'
                                                                                              : 'cursor-pointer border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20'
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    timeSlot.display
                                                                                }
                                                                            </button>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* PM Column */}
                                                        <div>
                                                            <h4 className="mb-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                PM
                                                            </h4>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {timeSlots.pm.map(
                                                                    (
                                                                        timeSlot,
                                                                    ) => {
                                                                        const isSelected =
                                                                            selectedTime ===
                                                                            timeSlot.value;
                                                                        const isOpened =
                                                                            isTimeSlotOpened(
                                                                                selectedDate,
                                                                                timeSlot.value,
                                                                            );
                                                                        const isBlocked =
                                                                            isTimeSlotBlocked(
                                                                                selectedDate,
                                                                                timeSlot.value,
                                                                            );
                                                                        const hasReservations =
                                                                            hasReservationsForTimeslot(
                                                                                timeSlot.value,
                                                                            );
                                                                        const isDisabled =
                                                                            !isOpened ||
                                                                            isBlocked;
                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    timeSlot.value
                                                                                }
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    !isDisabled &&
                                                                                    setSelectedTime(
                                                                                        timeSlot.value,
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    isDisabled
                                                                                }
                                                                                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-all ${
                                                                                    !isOpened
                                                                                        ? 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-600 opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                                                                                        : isBlocked
                                                                                          ? 'cursor-not-allowed border-red-300 bg-red-500 text-white opacity-60'
                                                                                          : isSelected
                                                                                            ? 'border-blue-500 bg-blue-500 text-white shadow-md ring-2 ring-blue-300'
                                                                                            : hasReservations
                                                                                              ? 'cursor-pointer border-yellow-300 bg-yellow-100 text-yellow-800 hover:border-yellow-400 hover:bg-yellow-200 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50'
                                                                                              : 'cursor-pointer border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20'
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    timeSlot.display
                                                                                }
                                                                            </button>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {selectedTime &&
                                                    selectedTables.length >
                                                        0 && (
                                                        <div className="mt-3">
                                                            {/* Table Schedule Actions */}
                                                            <div className="rounded-md border border-purple-200 bg-purple-50 p-2 dark:border-purple-800/50 dark:bg-purple-900/10">
                                                                <p className="mb-1.5 text-xs font-semibold text-purple-800 dark:text-purple-200">
                                                                    Table
                                                                    Schedule
                                                                    Actions (
                                                                    {
                                                                        selectedTables.length
                                                                    }{' '}
                                                                    table
                                                                    {selectedTables.length >
                                                                    1
                                                                        ? 's'
                                                                        : ''}{' '}
                                                                    selected)
                                                                </p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-7 border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                                                        onClick={
                                                                            handleSetUnavailable
                                                                        }
                                                                        disabled={
                                                                            !onSetTableSchedule
                                                                        }
                                                                    >
                                                                        Set
                                                                        Unavailable
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-7 border-green-300 px-2 py-1 text-xs text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                                                                        onClick={
                                                                            handleSetAvailable
                                                                        }
                                                                        disabled={
                                                                            !onSetTableSchedule
                                                                        }
                                                                    >
                                                                        Set
                                                                        Available
                                                                    </Button>
                                                                    {selectedTables.length >=
                                                                        2 && (
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-7 border-blue-300 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                                            onClick={
                                                                                handleJoinTablesForTime
                                                                            }
                                                                            disabled={
                                                                                !onSetTableSchedule
                                                                            }
                                                                        >
                                                                            <Link2 className="mr-1 h-3 w-3" />
                                                                            Join
                                                                            for
                                                                            this
                                                                            Time
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        </div>

                        {/* Tables Listing */}
                        <div>
                            <Card className="rounded-lg border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                                    <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                        <Calculator className="mr-2 h-4 w-4 text-blue-500" />
                                        Tables Listing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {/* Summary Section */}
                                    {selectedTime && (
                                        <div className="mb-4">
                                            <div className="grid grid-cols-5 gap-2 text-xs">
                                                <div className="rounded-md bg-green-50 p-2 text-center dark:bg-green-900/20">
                                                    <p className="font-semibold text-green-800 dark:text-green-200">
                                                        {
                                                            tables.filter(
                                                                (t) => {
                                                                    const tableId =
                                                                        typeof t.id ===
                                                                        'number'
                                                                            ? t.id
                                                                            : parseInt(
                                                                                  t.id.toString(),
                                                                              );
                                                                    return isTableAvailableForSlot(
                                                                        tableId,
                                                                    );
                                                                },
                                                            ).length
                                                        }
                                                    </p>
                                                    <p className="text-green-700 dark:text-green-300">
                                                        Available
                                                    </p>
                                                </div>
                                                <div className="rounded-md bg-yellow-50 p-2 text-center dark:bg-yellow-900/20">
                                                    <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                                                        {
                                                            tables.filter(
                                                                (t) => {
                                                                    const tableId =
                                                                        typeof t.id ===
                                                                        'number'
                                                                            ? t.id
                                                                            : parseInt(
                                                                                  t.id.toString(),
                                                                              );
                                                                    return isTableReservedForSlot(
                                                                        tableId,
                                                                    );
                                                                },
                                                            ).length
                                                        }
                                                    </p>
                                                    <p className="text-yellow-700 dark:text-yellow-300">
                                                        Reserved
                                                    </p>
                                                </div>
                                                <div className="rounded-md bg-blue-50 p-2 text-center dark:bg-blue-900/20">
                                                    <p className="font-semibold text-blue-800 dark:text-blue-200">
                                                        {
                                                            tables.filter(
                                                                (t) => {
                                                                    const tableId =
                                                                        typeof t.id ===
                                                                        'number'
                                                                            ? t.id
                                                                            : parseInt(
                                                                                  t.id.toString(),
                                                                              );
                                                                    return (
                                                                        getJoinedTablesForSlot(
                                                                            tableId,
                                                                        ) !==
                                                                        null
                                                                    );
                                                                },
                                                            ).length
                                                        }
                                                    </p>
                                                    <p className="text-blue-700 dark:text-blue-300">
                                                        Joined
                                                    </p>
                                                </div>
                                                <div className="rounded-md bg-red-50 p-2 text-center dark:bg-red-900/20">
                                                    <p className="font-semibold text-red-800 dark:text-red-200">
                                                        {
                                                            tables.filter(
                                                                (t) => {
                                                                    const tableId =
                                                                        typeof t.id ===
                                                                        'number'
                                                                            ? t.id
                                                                            : parseInt(
                                                                                  t.id.toString(),
                                                                              );
                                                                    return isTableUnavailableForSlot(
                                                                        tableId,
                                                                        selectedDate,
                                                                        selectedTime,
                                                                    );
                                                                },
                                                            ).length
                                                        }
                                                    </p>
                                                    <p className="text-red-700 dark:text-red-300">
                                                        Unavailable
                                                    </p>
                                                </div>
                                                <div className="rounded-md bg-gray-50 p-2 text-center dark:bg-gray-700">
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                        {tables.length}
                                                    </p>
                                                    <p className="text-gray-700 dark:text-gray-300">
                                                        Total
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="flex items-end space-x-2">
                                            <div className="flex-1">
                                                <Label htmlFor="tableStatusFilter">
                                                    Filter by Status
                                                </Label>
                                                <Select
                                                    value={tableStatusFilter}
                                                    onValueChange={
                                                        onSetTableStatusFilter
                                                    }
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
                                                        availableTables.length >
                                                            0
                                                    }
                                                    onCheckedChange={
                                                        handleSelectAll
                                                    }
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

                                    {!selectedTime ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="text-center">
                                                <Calculator className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                                                <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">
                                                    Select a date and time slot
                                                    to view tables
                                                </p>
                                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                                                    Choose a time slot from the
                                                    calendar above to manage
                                                    table availability
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                                            {filteredTables.map((table) => {
                                                // Use local state for optimistic UI, fallback to table.status
                                                const currentStatus =
                                                    tableStatuses[table.id] ||
                                                    table.status;
                                                const displayStatus =
                                                    selectedTime
                                                        ? getTableStatusForSlot(
                                                              table,
                                                          )
                                                        : currentStatus;
                                                const isReservedForSlot =
                                                    selectedTime &&
                                                    isTableReservedForSlot(
                                                        typeof table.id ===
                                                            'number'
                                                            ? table.id
                                                            : parseInt(
                                                                  table.id.toString(),
                                                              ),
                                                    );

                                                return (
                                                    <Card
                                                        key={table.id}
                                                        className={`rounded-lg border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
                                                            displayStatus ===
                                                            'available'
                                                                ? 'border-green-200 hover:border-green-300 dark:border-green-700 dark:hover:border-green-600'
                                                                : displayStatus ===
                                                                    'unavailable'
                                                                  ? 'border-red-200 hover:border-red-300 dark:border-red-700 dark:hover:border-red-600'
                                                                  : displayStatus ===
                                                                      'reserved'
                                                                    ? 'border-yellow-200 hover:border-yellow-300 dark:border-yellow-700 dark:hover:border-yellow-600'
                                                                    : 'border-blue-200 hover:border-blue-300 dark:border-blue-700 dark:hover:border-blue-600'
                                                        } ${isReservedForSlot ? 'ring-2 ring-yellow-300 dark:ring-yellow-700' : ''}`}
                                                    >
                                                        <CardHeader className="p-3">
                                                            <div className="flex items-center justify-between">
                                                                <CardTitle className="text-sm text-gray-900 dark:text-white">
                                                                    {currentStatus ===
                                                                        'joined' &&
                                                                    table.joined_with ? (
                                                                        <>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-base">
                                                                                    {getStatusIcon(
                                                                                        currentStatus,
                                                                                    )}
                                                                                </span>
                                                                                <span>
                                                                                    {
                                                                                        table.name
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                Joined
                                                                                with:{' '}
                                                                                {
                                                                                    table.joined_with
                                                                                }
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-base">
                                                                                {getStatusIcon(
                                                                                    currentStatus,
                                                                                )}
                                                                            </span>
                                                                            <span>
                                                                                {
                                                                                    table.name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </CardTitle>
                                                                {table.status ===
                                                                    'available' && (
                                                                    <Checkbox
                                                                        checked={selectedTables.includes(
                                                                            typeof table.id ===
                                                                                'number'
                                                                                ? table.id
                                                                                : parseInt(
                                                                                      table.id.toString(),
                                                                                  ),
                                                                        )}
                                                                        onCheckedChange={(
                                                                            checked,
                                                                        ) =>
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
                                                        <CardContent className="p-3">
                                                            <p className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                                                                Seats:{' '}
                                                                {table.seats}
                                                                <div className="flex items-center gap-0.5">
                                                                    {Array.from(
                                                                        {
                                                                            length: table.seats,
                                                                        },
                                                                        (
                                                                            _,
                                                                            i,
                                                                        ) => (
                                                                            <User
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className="h-4 w-4 text-gray-500 dark:text-gray-400"
                                                                            />
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </p>
                                                            <div className="mt-1 space-y-1">
                                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                    Status:{' '}
                                                                    <span
                                                                        className={`rounded-full px-2 py-1 text-sm font-medium ${getStatusColor(displayStatus)}`}
                                                                    >
                                                                        {
                                                                            displayStatus
                                                                        }
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            {table.joined_with && (
                                                                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                                                    Joined
                                                                    Tables:{' '}
                                                                    {
                                                                        table.joined_with
                                                                    }
                                                                </p>
                                                            )}
                                                            {selectedTime &&
                                                                (() => {
                                                                    const tableId =
                                                                        typeof table.id ===
                                                                        'number'
                                                                            ? table.id
                                                                            : parseInt(
                                                                                  table.id.toString(),
                                                                              );
                                                                    const isUnavailable =
                                                                        isTableUnavailableForSlot(
                                                                            tableId,
                                                                            selectedDate,
                                                                            selectedTime,
                                                                        );
                                                                    const joinedWith =
                                                                        getJoinedTablesForSlot(
                                                                            tableId,
                                                                        );

                                                                    if (
                                                                        joinedWith
                                                                    ) {
                                                                        // Get names of joined tables
                                                                        const joinedTableIds =
                                                                            joinedWith
                                                                                .split(
                                                                                    ',',
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        id,
                                                                                    ) =>
                                                                                        parseInt(
                                                                                            id.trim(),
                                                                                        ),
                                                                                );
                                                                        const joinedTableNames =
                                                                            joinedTableIds
                                                                                .map(
                                                                                    (
                                                                                        id,
                                                                                    ) => {
                                                                                        const foundTable =
                                                                                            tables.find(
                                                                                                (
                                                                                                    t,
                                                                                                ) => {
                                                                                                    const tId =
                                                                                                        typeof t.id ===
                                                                                                        'number'
                                                                                                            ? t.id
                                                                                                            : parseInt(
                                                                                                                  t.id.toString(),
                                                                                                              );
                                                                                                    return (
                                                                                                        tId ===
                                                                                                        id
                                                                                                    );
                                                                                                },
                                                                                            );
                                                                                        return foundTable?.name;
                                                                                    },
                                                                                )
                                                                                .filter(
                                                                                    Boolean,
                                                                                )
                                                                                .join(
                                                                                    ', ',
                                                                                );

                                                                        return (
                                                                            <div className="mt-1.5 rounded-md bg-blue-50 p-1.5 dark:bg-blue-900/20">
                                                                                <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                                                                                    <Link2 className="mr-1 inline h-3 w-3" />
                                                                                    Joined
                                                                                </p>
                                                                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                                                                    With:{' '}
                                                                                    {
                                                                                        joinedTableNames
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        );
                                                                    }

                                                                    if (
                                                                        isReservedForSlot
                                                                    ) {
                                                                        return (
                                                                            <div className="mt-1.5 rounded-md bg-yellow-50 p-1.5 dark:bg-yellow-900/20">
                                                                                <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                                                                                    Reserved
                                                                                </p>
                                                                            </div>
                                                                        );
                                                                    }

                                                                    return null;
                                                                })()}
                                                        </CardContent>
                                                        <CardFooter className="flex flex-wrap gap-1.5 p-3">
                                                            {selectedTime &&
                                                                displayStatus ===
                                                                    'joined' &&
                                                                (() => {
                                                                    const tableId =
                                                                        typeof table.id ===
                                                                        'number'
                                                                            ? table.id
                                                                            : parseInt(
                                                                                  table.id.toString(),
                                                                              );
                                                                    const joinedWith =
                                                                        getJoinedTablesForSlot(
                                                                            tableId,
                                                                        );

                                                                    if (
                                                                        joinedWith
                                                                    ) {
                                                                        const joinedTableIds =
                                                                            joinedWith
                                                                                .split(
                                                                                    ',',
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        id,
                                                                                    ) =>
                                                                                        parseInt(
                                                                                            id.trim(),
                                                                                        ),
                                                                                );
                                                                        return (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => {
                                                                                    if (
                                                                                        onSetTableSchedule
                                                                                    ) {
                                                                                        onSetTableSchedule(
                                                                                            {
                                                                                                tableIds:
                                                                                                    joinedTableIds,
                                                                                                date: selectedDate,
                                                                                                time: selectedTime,
                                                                                                status: 'available', // Set back to available to remove join
                                                                                            },
                                                                                        );
                                                                                    }
                                                                                }}
                                                                                className="h-7 px-2 py-1 text-xs text-orange-600 hover:text-orange-700"
                                                                            >
                                                                                <Unlink className="mr-1 h-3 w-3" />
                                                                                Unjoin
                                                                            </Button>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })()}

                                                            {table.status ===
                                                                'available' && (
                                                                <>
                                                                    {canEdit && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() =>
                                                                                onEditTable(
                                                                                    table,
                                                                                )
                                                                            }
                                                                            className="h-7 px-2 py-1 text-xs text-blue-600 hover:text-blue-700"
                                                                        >
                                                                            <Edit className="h-3.5 w-3.5" />
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
                                                                            className="h-7 px-2 py-1"
                                                                        >
                                                                            <Trash className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    )}
                                                                </>
                                                            )}
                                                            {table.status ===
                                                                'occupied' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 px-2 py-1 text-xs text-green-600 hover:text-green-700"
                                                                >
                                                                    Complete
                                                                    Order
                                                                </Button>
                                                            )}
                                                            {table.status ===
                                                                'reserved' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 px-2 py-1 text-xs text-blue-600 hover:text-blue-700"
                                                                >
                                                                    Check In
                                                                </Button>
                                                            )}
                                                            {table.status ===
                                                                'joined' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        onUnjoinTables(
                                                                            [
                                                                                typeof table.id ===
                                                                                'number'
                                                                                    ? table.id
                                                                                    : parseInt(
                                                                                          table.id.toString(),
                                                                                      ),
                                                                            ],
                                                                        )
                                                                    }
                                                                    className="h-7 px-2 py-1 text-xs text-orange-600 hover:text-orange-700"
                                                                >
                                                                    <Unlink className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                        </CardFooter>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {selectedTime &&
                                        filteredTables.length === 0 && (
                                            <div className="py-8 text-center">
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    No tables found for the
                                                    selected filter.
                                                </p>
                                            </div>
                                        )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
