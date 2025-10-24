import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
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
    Calendar,
    Check,
    ChevronDown,
    ChevronUp,
    Edit,
    Link2,
    MapPin,
    Plus,
    Trash,
    Unlink,
    User,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BlockedDate, Reservation, Table as TableType } from '../types';
import { WeekDatePicker } from './WeekDatePicker';

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
    onCreateReservation?: (date: string, time: string, tableIds: number[]) => void;
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
    onCreateReservation,
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
    const [showDateTimeSection, setShowDateTimeSection] = useState(true);

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
            // If no opened dates configured, restaurant is closed - no timeslots available
            if (openedDates.length === 0) return false;

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

    // Synchronize local table statuses with actual table data
    React.useEffect(() => {
        if (tables && Array.isArray(tables)) {
            // Clear any local statuses that don't match the actual table status
            const updatedStatuses: Record<number | string, 'available' | 'occupied' | 'reserved' | 'joined'> = {};
            
            tables.forEach((table) => {
                // Only keep local status if it's different from actual status
                // This allows for optimistic updates while preventing stale data
                if (tableStatuses[table.id] && tableStatuses[table.id] !== table.status) {
                    // Keep the local status for optimistic updates
                    updatedStatuses[table.id] = tableStatuses[table.id];
                }
            });
            
            setTableStatuses(updatedStatuses);
        }
    }, [tables]);

    // Function to clear local table status (useful for debugging or manual reset)
    const clearTableStatus = React.useCallback((tableId: number | string) => {
        setTableStatuses(prev => {
            const updated = { ...prev };
            delete updated[tableId];
            return updated;
        });
    }, []);

    // Function to clear all local table statuses
    const clearAllTableStatuses = React.useCallback(() => {
        setTableStatuses({});
    }, []);

    // Debug function - expose to window for console access
    React.useEffect(() => {
        (window as any).clearTableStatus = clearTableStatus;
        (window as any).clearAllTableStatuses = clearAllTableStatuses;
        (window as any).getTableStatuses = () => tableStatuses;
        (window as any).getTables = () => tables;
    }, [clearTableStatus, clearAllTableStatuses, tableStatuses, tables]);

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
                (reservation) => {
                    // Check if reservation matches date and time
                    const matchesDateTime = reservation.date === selectedDate &&
                        reservation.time === selectedTime &&
                        reservation.status !== 'cancelled';
                    
                    if (!matchesDateTime) return false;
                    
                    // Check single table reservation
                    if (reservation.tableId === tableId) return true;
                    
                    // Check multiple table reservation
                    if (reservation.tableIds && reservation.tableIds.includes(tableId)) return true;
                    
                    return false;
                }
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

    // Group filtered tables by location
    const tablesByLocation = useMemo(() => {
        const grouped: Record<string, TableType[]> = {};
        
        filteredTables.forEach((table) => {
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
    }, [filteredTables]);

    const formatLocationName = (location: string) => {
        return location.charAt(0).toUpperCase() + location.slice(1).replace(/_/g, ' ');
    };

    return (
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
                                        {/* Week Date Picker */}
                                        <WeekDatePicker
                                            selectedDate={selectedDate}
                                            onDateSelect={(dateStr) => {
                                                setSelectedDate(dateStr);
                                                setSelectedTime(''); // Reset time when date changes
                                            }}
                                            datesWithIndicator={[]}
                                            className="mb-6"
                                        />

                                        <div className="grid grid-cols-1 gap-4">
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
                                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                                        {/* AM Column */}
                                                        <div>
                                                            <h4 className="mb-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 md:mb-3 md:text-sm">
                                                                AM
                                                            </h4>
                                                            <div className="grid grid-cols-3 gap-1 md:grid-cols-4 md:gap-2 lg:grid-cols-3 xl:grid-cols-4">
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
                                                                                className={`whitespace-nowrap rounded border px-0.5 py-0.5 text-xs font-medium transition-all md:rounded-md md:px-2 md:py-1 md:text-sm ${
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
                                                            <h4 className="mb-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 md:mb-3 md:text-sm">
                                                                PM
                                                            </h4>
                                                            <div className="grid grid-cols-3 gap-1 md:grid-cols-4 md:gap-2 lg:grid-cols-3 xl:grid-cols-4">
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
                                                                                className={`whitespace-nowrap rounded border px-0.5 py-0.5 text-xs font-medium transition-all md:rounded-md md:px-2 md:py-1 md:text-sm ${
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
                                                                    {selectedTables.length >= 2 && 
                                                                        (() => {
                                                                            // Check if all selected tables are already joined together
                                                                            const firstTableJoined = getJoinedTablesForSlot(selectedTables[0]);
                                                                            if (!firstTableJoined) return true;
                                                                            
                                                                            const joinedTableIds = firstTableJoined.split(',').map(id => parseInt(id.trim()));
                                                                            const allTablesJoined = selectedTables.every(tableId => 
                                                                                joinedTableIds.includes(tableId)
                                                                            );
                                                                            
                                                                            return !allTablesJoined;
                                                                        })() && (
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
                                                                    {onCreateReservation && (
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-7 border-orange-300 px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                                                                            onClick={() => {
                                                                                onCreateReservation(
                                                                                    selectedDate,
                                                                                    selectedTime,
                                                                                    selectedTables
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Calendar className="mr-1 h-3 w-3" />
                                                                            Add
                                                                            Reservation
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
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                            <Calculator className="mr-2 h-4 w-4 text-blue-500" />
                                            Tables Listing
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
                                        <div className="space-y-4">
                                            {Object.entries(tablesByLocation).map(([location, locationTables]) => (
                                                <Card key={location} className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                                    <CardHeader className="pb-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                                        <CardTitle className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                                            <MapPin className="h-4 w-4" />
                                                            {formatLocationName(location)}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4 bg-white dark:bg-gray-800">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                                                            {locationTables.map((table) => {
                                                                const tableId = typeof table.id === 'number' ? table.id : parseInt(table.id.toString());
                                                                const isSelected = selectedTables.includes(tableId);
                                                                const currentStatus = tableStatuses[table.id] || table.status;
                                                                const displayStatus = selectedTime ? getTableStatusForSlot(table) : currentStatus;
                                                                const isReservedForSlot = selectedTime && isTableReservedForSlot(tableId);
                                                                const joinedWith = selectedTime ? getJoinedTablesForSlot(tableId) : table.joined_with;

                                                                // Get status badge info
                                                                const getStatusBadge = () => {
                                                                    if (isReservedForSlot) {
                                                                        return { variant: 'secondary' as const, text: 'Reserved' };
                                                                    }
                                                                    if (displayStatus === 'available') {
                                                                        return { variant: 'default' as const, text: 'Available' };
                                                                    }
                                                                    if (displayStatus === 'unavailable') {
                                                                        return { variant: 'destructive' as const, text: 'Unavailable' };
                                                                    }
                                                                    if (displayStatus === 'occupied') {
                                                                        return { variant: 'secondary' as const, text: 'Occupied' };
                                                                    }
                                                                    if (displayStatus === 'joined') {
                                                                        return { variant: 'default' as const, text: 'Joined' };
                                                                    }
                                                                    return { variant: 'default' as const, text: displayStatus };
                                                                };

                                                                const statusBadge = getStatusBadge();

                                                                return (
                                                                    <Card
                                                                        key={table.id}
                                                                        className={`cursor-pointer transition-all duration-200 border ${
                                                                            isSelected 
                                                                                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600' 
                                                                                : displayStatus === 'available'
                                                                                ? 'hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                                                : displayStatus === 'unavailable'
                                                                                ? 'opacity-75 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                                                                : displayStatus === 'reserved'
                                                                                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                                                                                : displayStatus === 'joined'
                                                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                                                                                : 'hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                                        }`}
                                                                        onClick={() => {
                                                                            if (displayStatus === 'available') {
                                                                                handleTableSelect(tableId, !isSelected);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <CardHeader className="p-3 pb-2">
                                                                            <div className="relative w-full">
                                                                                <Badge 
                                                                                    variant={statusBadge.variant}
                                                                                    className="text-xs w-full justify-center"
                                                                                >
                                                                                    {statusBadge.text}
                                                                                </Badge>
                                                                                {isSelected && (
                                                                                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 absolute top-1/2 right-2 transform -translate-y-1/2" />
                                                                                )}
                                                                            </div>
                                                                        </CardHeader>
                                                                        <CardContent className="p-3 pb-2 text-center">
                                                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                                {table.name}
                                                                            </h4>
                                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                {table.seats} seats
                                                                            </p>
                                                                            {joinedWith && (
                                                                                <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                                                                                    <Link2 className="inline h-3 w-3 mr-1" />
                                                                                    Joined
                                                                                </div>
                                                                            )}
                                                                        </CardContent>
                                                                        <CardFooter className="flex justify-center gap-1.5 p-2 border-t border-gray-200 dark:border-gray-600">
                                                                            {/* Action Buttons */}
                                                                            {selectedTime && displayStatus === 'available' && onCreateReservation && (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        onCreateReservation(selectedDate, selectedTime, [tableId]);
                                                                                    }}
                                                                                    title="Add Reservation"
                                                                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                                                                >
                                                                                    <Calendar className="h-4 w-4" />
                                                                                </Button>
                                                                            )}
                                                                            {canEdit && displayStatus === 'available' && (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        onEditTable(table);
                                                                                    }}
                                                                                    title="Edit Table"
                                                                                >
                                                                                    <Edit className="h-4 w-4" />
                                                                                </Button>
                                                                            )}
                                                                            {canDelete && displayStatus === 'available' && (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        onDeleteTable(tableId);
                                                                                    }}
                                                                                    title="Delete Table"
                                                                                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                                                                                >
                                                                                    <Trash className="h-4 w-4" />
                                                                                </Button>
                                                                            )}
                                                                            {selectedTime && displayStatus === 'joined' && joinedWith && (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        if (onSetTableSchedule) {
                                                                                            const joinedTableIds = joinedWith.split(',').map(id => parseInt(id.trim()));
                                                                                            onSetTableSchedule({
                                                                                                tableIds: joinedTableIds,
                                                                                                date: selectedDate,
                                                                                                time: selectedTime,
                                                                                                status: 'available',
                                                                                            });
                                                                                        }
                                                                                    }}
                                                                                    title="Unjoin Tables"
                                                                                    className="text-orange-600 hover:text-orange-700 dark:text-orange-400"
                                                                                >
                                                                                    <Unlink className="h-4 w-4" />
                                                                                </Button>
                                                                            )}
                                                                        </CardFooter>
                                                                    </Card>
                                                                );
                                                            })}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
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
    );
};
