import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
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
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Check, Clock, Trash, X, Users, Plus, Calendar, User, Phone, MessageSquare, MapPin, CalendarDays, CalendarCheck, CalendarClock } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import {
    BlockedDate,
    OpenedDate,
    Reservation,
    Table as TableType,
} from '../types';
import { DateCalendar } from './DateCalendar';
import { MultipleTableAssignmentDialog } from './MultipleTableAssignmentDialog';

interface TableSchedule {
    id: number;
    tableId: number;
    scheduleDate: string;
    timeslots: string[];
    status: 'available' | 'unavailable' | 'joined';
    joinedWith?: string | null;
    notes?: string | null;
}

interface ReservationsTabProps {
    reservations: Reservation[];
    tables: TableType[];
    blockedDates?: BlockedDate[];
    openedDates?: OpenedDate[];
    tableSchedules?: TableSchedule[];
    currency_symbol: string;
    auth: {
        user: {
            identifier: string;
        };
    };
    onAddReservation: (reservation: Omit<Reservation, 'id' | 'status'>) => void;
    onUpdateReservation: (
        id: number,
        reservation: Partial<Reservation>,
    ) => void;
    onDeleteReservation: (id: number) => void;
    onConfirmReservation: (id: number) => void;
    onCancelReservation: (id: number) => void;
}

export const ReservationsTab: React.FC<ReservationsTabProps> = ({
    reservations,
    tables,
    blockedDates = [],
    openedDates = [],
    tableSchedules = [],
    currency_symbol,
    auth,
    onAddReservation,
    onUpdateReservation,
    onDeleteReservation,
    onConfirmReservation,
    onCancelReservation,
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isMultipleTableDialogOpen, setIsMultipleTableDialogOpen] = useState(false);
    const [isAssignTableDialogOpen, setIsAssignTableDialogOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [reservationFilter, setReservationFilter] = useState<
        'today' | 'selected' | 'upcoming'
    >('upcoming');
    const [newReservation, setNewReservation] = useState<
        Omit<Reservation, 'id' | 'status'>
    >(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return {
            name: '',
            date: `${year}-${month}-${day}`,
            time: '',
            guests: 1,
            tableId: 0,
            tableIds: [],
            notes: '',
            contact: '',
        };
    });

    // Generate time slots with 30-minute intervals (same as BlockedDates)
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

    const isTimeSlotBlocked = useCallback(
        (date: string, time: string) => {
            // Direct match since we're now using 30-minute intervals
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

    const isTimeSlotReserved = useCallback(
        (date: string, time: string) => {
            return reservations.some(
                (reservation) =>
                    reservation.date === date &&
                    reservation.time === time &&
                    reservation.status !== 'cancelled',
            );
        },
        [reservations],
    );

    // Check if a table is unavailable according to schedule
    const isTableUnavailableInSchedule = useCallback(
        (tableId: number, date: string, time: string) => {
            return tableSchedules.some((schedule) => {
                // Extract date part from scheduleDate
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

    // Get joined table info for a specific table and time slot
    const getJoinedTableInfo = useCallback(
        (tableId: number, date: string, time: string) => {
            const schedule = tableSchedules.find((schedule) => {
                const scheduleDateOnly = schedule.scheduleDate.split('T')[0];

                return (
                    schedule.tableId === tableId &&
                    scheduleDateOnly === date &&
                    schedule.timeslots.includes(time) &&
                    schedule.status === 'joined'
                );
            });

            if (!schedule?.joinedWith) return null;

            // Get total seats of joined tables
            const joinedTableIds = schedule.joinedWith
                .split(',')
                .map((id) => parseInt(id.trim()));
            const totalSeats = joinedTableIds.reduce((sum, id) => {
                const table = tables.find((t) => {
                    const tId =
                        typeof t.id === 'number'
                            ? t.id
                            : parseInt(t.id.toString());
                    return tId === id;
                });
                return sum + (table?.seats || 0);
            }, 0);

            return {
                joinedWith: schedule.joinedWith,
                joinedTableIds,
                totalSeats,
            };
        },
        [tableSchedules, tables],
    );

    const isTableReserved = useCallback(
        (tableId: number, date: string, time: string) => {
            return reservations.some((reservation) => {
                const reservationTableId =
                    reservation.tableId || (reservation as any).table_id;
                return (
                    reservationTableId === tableId &&
                    reservation.date === date &&
                    reservation.time === time &&
                    reservation.status !== 'cancelled'
                );
            });
        },
        [reservations],
    );

    // Get dates that have reservations
    const datesWithReservations = useMemo(() => {
        return Array.from(
            new Set(
                reservations
                    .filter((r) => r.status !== 'cancelled')
                    .map((r) => r.date),
            ),
        );
    }, [reservations]);

    // Get reservations for the selected date
    const reservationsForSelectedDate = useMemo(() => {
        return reservations.filter(
            (reservation) => reservation.date === newReservation.date,
        );
    }, [reservations, newReservation.date]);

    const filteredReservations = useMemo(() => {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        return reservations
            .filter((reservation) => {
                if (reservationFilter === 'today') {
                    return reservation.date === todayStr;
                } else if (reservationFilter === 'selected') {
                    return reservation.date === newReservation.date;
                } else {
                    // upcoming
                    const reservationDate = new Date(reservation.date);
                    today.setHours(0, 0, 0, 0);
                    return reservationDate >= today;
                }
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.time}`);
                const dateB = new Date(`${b.date} ${b.time}`);
                return dateA.getTime() - dateB.getTime();
            });
    }, [reservations, reservationFilter, newReservation.date]);

    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'confirmed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    }, []);

    const handleTimeSlotSelect = useCallback(
        (date: string, time: string) => {
            setSelectedDate(date);
            setSelectedTime(time);
            setNewReservation((prev) => {
                // Check if currently selected table is now reserved for this time slot
                const shouldResetTable =
                    prev.tableId && isTableReserved(prev.tableId, date, time);

                return {
                    ...prev,
                    date,
                    time,
                    // Reset table if it's now reserved for this time slot
                    tableId: shouldResetTable ? 0 : prev.tableId,
                };
            });
            setIsDialogOpen(true);
        },
        [isTableReserved],
    );

    const handleMultipleTableAssignment = useCallback((selectedTableIds: number[]) => {
        setNewReservation(prev => ({
            ...prev,
            tableIds: selectedTableIds,
            tableId: selectedTableIds.length > 0 ? selectedTableIds[0] : 0, // Keep first table as primary
        }));
        setIsMultipleTableDialogOpen(false);
        toast.success(`Assigned ${selectedTableIds.length} table(s) to reservation`);
    }, []);

    const handleAssignTables = useCallback((reservation: Reservation) => {
        setSelectedReservation(reservation);
        setIsAssignTableDialogOpen(true);
    }, []);

    const handleAssignTableUpdate = useCallback((selectedTableIds: number[]) => {
        if (selectedReservation) {
            onUpdateReservation(selectedReservation.id, {
                tableIds: selectedTableIds,
            });
            setIsAssignTableDialogOpen(false);
            setSelectedReservation(null);
            // Toast message is handled by the API hook
        }
    }, [selectedReservation, onUpdateReservation]);

    const handleSubmitReservation = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            // Validate required fields with specific messages
            if (!newReservation.name) {
                toast.error('Please enter customer name');
                return;
            }

            if (!newReservation.date || !newReservation.time) {
                toast.error('Please select date and time');
                return;
            }

            // Note: Table availability is now handled by the multiple table assignment dialog
            // Users can only select from available tables in the assignment dialog

            // Check if tables are assigned
            if (!newReservation.tableIds || newReservation.tableIds.length === 0) {
                toast.error('Please assign at least one table for this reservation');
                return;
            }

            // Check if selected tables have sufficient total capacity
            const totalSelectedSeats = newReservation.tableIds.reduce((total, tableId) => {
                const table = tables.find(t => {
                    const tId = typeof t.id === 'number' ? t.id : parseInt(t.id.toString());
                    return tId === tableId;
                });
                return total + (table?.seats || 0);
            }, 0);

            if (totalSelectedSeats < newReservation.guests) {
                toast.error(`Selected tables have insufficient capacity. Total seats: ${totalSelectedSeats}, Required: ${newReservation.guests}`);
                return;
            }

            // Check if time slot is opened
            if (!isTimeSlotOpened(newReservation.date, newReservation.time)) {
                toast.error(
                    'This date/time is not available for reservations. Please open it in the "Opened Dates" tab first.',
                );
                return;
            }

            // Check if time slot is blocked
            if (isTimeSlotBlocked(newReservation.date, newReservation.time)) {
                toast.error(
                    'This time slot is blocked and reservations are not available.',
                );
                return;
            }

            // Submit reservation
            onAddReservation(newReservation);

            // Reset form but keep the date
            setNewReservation((prev) => ({
                name: '',
                date: prev.date,
                time: '',
                guests: 1,
                tableId: 0,
                tableIds: [],
                notes: '',
                contact: '',
            }));
            setIsDialogOpen(false);
            toast.success('Reservation created successfully!');
        },
        [
            newReservation,
            onAddReservation,
            isTimeSlotOpened,
            isTimeSlotBlocked,
            isTimeSlotReserved,
            tables,
            isTableReserved,
            isTableUnavailableInSchedule,
            getJoinedTableInfo,
        ],
    );

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-white">
                            <Check className="mr-2 h-4 w-4 text-orange-500" />
                            Reservations
                        </CardTitle>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                const url = `/pos-restaurant/reservation?client_identifier=${auth.user.identifier}`;
                                window.open(url, '_blank');
                            }}
                            className="flex items-center gap-2"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Online Reservation
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {/* Calendar and Time Slots Section */}
                    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Calendar Section - Left Side */}
                        <div className="lg:col-span-6">
                            <Label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                                Select Date *
                            </Label>
                            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                                Choose a date to create a new reservation
                            </p>
                            <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
                                <DateCalendar
                                    selectedDate={newReservation.date}
                                    onDateSelect={(dateStr) => {
                                        setNewReservation({
                                            ...newReservation,
                                            date: dateStr,
                                            time: '', // Reset time when date changes
                                        });
                                    }}
                                    blockedDates={datesWithReservations}
                                    minDate={
                                        new Date(
                                            new Date().setHours(0, 0, 0, 0),
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {/* Time Slots Section - Right Side */}
                        <div className="lg:col-span-6">
                            <Label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                Select Time Slot *
                            </Label>

                            {/* Legend */}
                            <div className="mb-2 flex flex-wrap gap-3 text-xs">
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
                                <div className="flex items-center gap-1.5">
                                    <div className="h-3 w-3 rounded border border-red-500 bg-red-500"></div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Blocked
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
                                <div className="grid grid-cols-2 gap-2 md:gap-4">
                                    {/* AM Column */}
                                    <div>
                                        <h4 className="mb-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 md:mb-3 md:text-sm">
                                            AM
                                        </h4>
                                        <div className="grid grid-cols-2 gap-1 md:gap-2">
                                            {timeSlots.am.map((timeSlot) => {
                                                const isSelected =
                                                    newReservation.time ===
                                                    timeSlot.value;
                                                const isOpened =
                                                    isTimeSlotOpened(
                                                        newReservation.date,
                                                        timeSlot.value,
                                                    );
                                                const isBlocked =
                                                    isTimeSlotBlocked(
                                                        newReservation.date,
                                                        timeSlot.value,
                                                    );
                                                const isReserved =
                                                    isTimeSlotReserved(
                                                        newReservation.date,
                                                        timeSlot.value,
                                                    );
                                                const isDisabled =
                                                    !isOpened || isBlocked;

                                                return (
                                                    <button
                                                        key={timeSlot.value}
                                                        type="button"
                                                        onClick={() =>
                                                            !isDisabled &&
                                                            handleTimeSlotSelect(
                                                                newReservation.date,
                                                                timeSlot.value,
                                                            )
                                                        }
                                                        disabled={isDisabled}
                                                        className={`whitespace-nowrap rounded border px-0.5 py-0.5 text-xs font-medium transition-all md:rounded-md md:px-2 md:py-1 md:text-sm ${
                                                            isSelected
                                                                ? 'border-blue-500 bg-blue-500 text-white shadow-md ring-2 ring-blue-300'
                                                                : !isOpened
                                                                  ? 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-600 opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                                                                  : isBlocked
                                                                    ? 'cursor-not-allowed border-red-300 bg-red-500 text-white opacity-60'
                                                                    : isReserved
                                                                      ? 'cursor-pointer border-yellow-300 bg-yellow-100 text-yellow-800 hover:border-yellow-400 hover:bg-yellow-200 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50'
                                                                      : 'cursor-pointer border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20'
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
                                        <h4 className="mb-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 md:mb-3 md:text-sm">
                                            PM
                                        </h4>
                                        <div className="grid grid-cols-2 gap-1 md:gap-2">
                                            {timeSlots.pm.map((timeSlot) => {
                                                const isSelected =
                                                    newReservation.time ===
                                                    timeSlot.value;
                                                const isOpened =
                                                    isTimeSlotOpened(
                                                        newReservation.date,
                                                        timeSlot.value,
                                                    );
                                                const isBlocked =
                                                    isTimeSlotBlocked(
                                                        newReservation.date,
                                                        timeSlot.value,
                                                    );
                                                const isReserved =
                                                    isTimeSlotReserved(
                                                        newReservation.date,
                                                        timeSlot.value,
                                                    );
                                                const isDisabled =
                                                    !isOpened || isBlocked;

                                                return (
                                                    <button
                                                        key={timeSlot.value}
                                                        type="button"
                                                        onClick={() =>
                                                            !isDisabled &&
                                                            handleTimeSlotSelect(
                                                                newReservation.date,
                                                                timeSlot.value,
                                                            )
                                                        }
                                                        disabled={isDisabled}
                                                        className={`whitespace-nowrap rounded border px-0.5 py-0.5 text-xs font-medium transition-all md:rounded-md md:px-2 md:py-1 md:text-sm ${
                                                            isSelected
                                                                ? 'border-blue-500 bg-blue-500 text-white shadow-md ring-2 ring-blue-300'
                                                                : !isOpened
                                                                  ? 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-600 opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                                                                  : isBlocked
                                                                    ? 'cursor-not-allowed border-red-300 bg-red-500 text-white opacity-60'
                                                                    : isReserved
                                                                      ? 'cursor-pointer border-yellow-300 bg-yellow-100 text-yellow-800 hover:border-yellow-400 hover:bg-yellow-200 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50'
                                                                      : 'cursor-pointer border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20'
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

                            {/* Show reservations for selected date */}
                            {reservationsForSelectedDate.length > 0 && (
                                <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50/50 p-3 dark:border-yellow-800/50 dark:bg-yellow-900/10">
                                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">
                                        <Clock className="mr-1 inline h-3 w-3" />
                                        {reservationsForSelectedDate.length}{' '}
                                        reservation
                                        {reservationsForSelectedDate.length !==
                                        1
                                            ? 's'
                                            : ''}{' '}
                                        on this date
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reservations List */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Reservations
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {filteredReservations.length} reservation{filteredReservations.length !== 1 ? 's' : ''} found
                                    </p>
                                </div>
                            </div>

                            {/* Enhanced Filter Buttons */}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    variant={
                                        reservationFilter === 'today'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() =>
                                        setReservationFilter('today')
                                    }
                                    className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                                >
                                    <CalendarDays className="h-4 w-4" />
                                    <span className="hidden sm:inline">Today</span>
                                    <span className="sm:hidden">Today</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant={
                                        reservationFilter === 'selected'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() =>
                                        setReservationFilter('selected')
                                    }
                                    className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                                >
                                    <CalendarCheck className="h-4 w-4" />
                                    <span className="hidden sm:inline">Selected Date</span>
                                    <span className="sm:hidden">Selected</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant={
                                        reservationFilter === 'upcoming'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() =>
                                        setReservationFilter('upcoming')
                                    }
                                    className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                                >
                                    <CalendarClock className="h-4 w-4" />
                                    <span className="hidden sm:inline">Upcoming</span>
                                    <span className="sm:hidden">Upcoming</span>
                                </Button>
                            </div>
                        </div>

                        {filteredReservations.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                    <Calendar className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                                    No reservations found
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {reservationFilter === 'today' &&
                                        'No reservations scheduled for today.'}
                                    {reservationFilter === 'selected' &&
                                        `No reservations found for ${new Date(newReservation.date).toLocaleDateString()}.`}
                                    {reservationFilter === 'upcoming' &&
                                        'No upcoming reservations found.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {filteredReservations.map((reservation) => (
                                    <Card
                                        key={reservation.id}
                                        className="group border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500"
                                    >
                                        <CardContent className="p-4">
                                            {/* Header Section */}
                                            <div className="mb-3 flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            {reservation.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                className={`${getStatusColor(reservation.status)} text-xs font-medium`}
                                                            >
                                                                {reservation.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    {reservation.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    onConfirmReservation(
                                                                        reservation.id,
                                                                    )
                                                                }
                                                                className="bg-green-500 text-white hover:bg-green-600"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    onCancelReservation(
                                                                        reservation.id,
                                                                    )
                                                                }
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {reservation.status === 'confirmed' && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                onCancelReservation(
                                                                    reservation.id,
                                                                )
                                                            }
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            onDeleteReservation(
                                                                reservation.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Main Info Grid */}
                                            <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                {/* Date & Time */}
                                                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                                                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {reservation.date}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {reservation.time}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Guests */}
                                                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                                                    <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {reservation.guests} Guest{reservation.guests !== 1 ? 's' : ''}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Party Size
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Tables */}
                                                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                                                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {(() => {
                                                                // Handle multiple tables
                                                                if (reservation.tableIds && reservation.tableIds.length > 0) {
                                                                    const tableNames = reservation.tableIds.map(tableId => {
                                                                        const foundTable = tables.find(t => {
                                                                            const tId = typeof t.id === 'number' ? t.id : parseInt(t.id.toString());
                                                                            return tId === tableId;
                                                                        });
                                                                        return foundTable?.name || `Table ${tableId}`;
                                                                    });
                                                                    return tableNames.join(', ');
                                                                }
                                                                
                                                                // Fallback to single table
                                                                const tableId =
                                                                    reservation.tableId ||
                                                                    (
                                                                        reservation as any
                                                                    ).table_id;
                                                                const foundTable =
                                                                    tables.find(
                                                                        (t) =>
                                                                            t.id ===
                                                                            tableId,
                                                                    );
                                                                return (
                                                                    foundTable?.name ||
                                                                    'N/A'
                                                                );
                                                            })()}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {reservation.tableIds && reservation.tableIds.length > 1 ? 'Tables' : 'Table'}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleAssignTables(reservation)}
                                                        className="ml-2 h-8 w-8 p-0"
                                                    >
                                                        <Users className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                {/* Contact */}
                                                {reservation.contact && (
                                                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                                                        <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {reservation.contact}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Contact
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Notes Section */}
                                            {reservation.notes && (
                                                <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                                                    <div className="flex items-start gap-2">
                                                        <MessageSquare className="mt-0.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                                Notes
                                                            </p>
                                                            <p className="text-sm text-gray-900 dark:text-white">
                                                                {reservation.notes}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Reservation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Reservation</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Selected Date and Time Display */}
                        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="font-medium text-blue-900 dark:text-blue-100">
                                    {selectedDate && selectedTime && (
                                        <>
                                            {new Date(
                                                selectedDate,
                                            ).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                            {' at '}
                                            {new Date(
                                                `2000-01-01T${selectedTime}`,
                                            ).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true,
                                            })}
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>

                        <form
                            onSubmit={handleSubmitReservation}
                            className="space-y-4"
                        >
                            <div>
                                <Label htmlFor="customer_name">
                                    Customer Name *
                                </Label>
                                <Input
                                    id="customer_name"
                                    value={newReservation.name}
                                    onChange={(e) =>
                                        setNewReservation((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="customer_contact">
                                    Contact Number
                                </Label>
                                <Input
                                    id="customer_contact"
                                    value={newReservation.contact}
                                    onChange={(e) =>
                                        setNewReservation((prev) => ({
                                            ...prev,
                                            contact: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter contact number"
                                />
                            </div>

                            <div>
                                <Label htmlFor="party_size">Party Size *</Label>
                                <Input
                                    id="party_size"
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={newReservation.guests}
                                    onChange={(e) => {
                                        const newGuests =
                                            parseInt(e.target.value) || 1;
                                        setNewReservation((prev) => {
                                            // Check if currently selected table is still valid
                                            const selectedTable = tables.find(
                                                (t) =>
                                                    t.id.toString() ===
                                                    prev.tableId.toString(),
                                            );
                                            const shouldResetTable =
                                                selectedTable &&
                                                selectedTable.seats < newGuests;

                                            return {
                                                ...prev,
                                                guests: newGuests,
                                                // Reset table selection if it's no longer valid
                                                tableId: shouldResetTable
                                                    ? 0
                                                    : prev.tableId,
                                            };
                                        });
                                    }}
                                    required
                                />
                                {tables.length > 0 &&
                                    newReservation.time &&
                                    (() => {
                                        const processedJoinedGroups =
                                            new Set<string>();
                                        let availableCount = 0;

                                        tables.forEach((t) => {
                                            const tableId =
                                                typeof t.id === 'number'
                                                    ? t.id
                                                    : parseInt(t.id.toString());
                                            const joinedInfo =
                                                getJoinedTableInfo(
                                                    tableId,
                                                    newReservation.date,
                                                    newReservation.time,
                                                );

                                            if (joinedInfo) {
                                                // Count joined group only once
                                                if (
                                                    !processedJoinedGroups.has(
                                                        joinedInfo.joinedWith,
                                                    )
                                                ) {
                                                    processedJoinedGroups.add(
                                                        joinedInfo.joinedWith,
                                                    );

                                                    const isGroupReserved =
                                                        joinedInfo.joinedTableIds.some(
                                                            (id) =>
                                                                isTableReserved(
                                                                    id,
                                                                    newReservation.date,
                                                                    newReservation.time,
                                                                ),
                                                        );
                                                    const hasCapacity =
                                                        joinedInfo.totalSeats >=
                                                        newReservation.guests;

                                                    if (
                                                        hasCapacity &&
                                                        !isGroupReserved
                                                    ) {
                                                        availableCount++;
                                                    }
                                                }
                                            } else {
                                                // Regular table
                                                const hasCapacity =
                                                    t.seats >=
                                                    newReservation.guests;
                                                const isReserved =
                                                    isTableReserved(
                                                        tableId,
                                                        newReservation.date,
                                                        newReservation.time,
                                                    );
                                                const isUnavailable =
                                                    isTableUnavailableInSchedule(
                                                        tableId,
                                                        newReservation.date,
                                                        newReservation.time,
                                                    );

                                                if (
                                                    hasCapacity &&
                                                    !isReserved &&
                                                    !isUnavailable
                                                ) {
                                                    availableCount++;
                                                }
                                            }
                                        });

                                        return (
                                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                {availableCount} available
                                                table(s) for this time slot
                                            </p>
                                        );
                                    })()}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label htmlFor="table_assign">Tables *</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsMultipleTableDialogOpen(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <Users className="h-4 w-4" />
                                        Assign
                                    </Button>
                                </div>
                                
                                {/* Show assigned tables */}
                                {newReservation.tableIds && newReservation.tableIds.length > 0 ? (
                                    <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <span className="text-sm font-medium text-green-900 dark:text-green-100">
                                                Assigned Tables ({newReservation.tableIds.length})
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {newReservation.tableIds.map((tableId) => {
                                                const table = tables.find(t => {
                                                    const tId = typeof t.id === 'number' ? t.id : parseInt(t.id.toString());
                                                    return tId === tableId;
                                                });
                                                return (
                                                    <Badge key={tableId} variant="secondary" className="text-xs">
                                                        {table?.name} ({table?.seats} seats)
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                                            Total capacity: {newReservation.tableIds.reduce((total, tableId) => {
                                                const table = tables.find(t => {
                                                    const tId = typeof t.id === 'number' ? t.id : parseInt(t.id.toString());
                                                    return tId === tableId;
                                                });
                                                return total + (table?.seats || 0);
                                            }, 0)} seats
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                        <div className="text-center text-gray-500 dark:text-gray-400">
                                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No tables assigned</p>
                                            <p className="text-xs">Click "Assign" to select tables for this reservation</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="special_requests">
                                    Special Requests
                                </Label>
                                <Textarea
                                    id="special_requests"
                                    value={newReservation.notes}
                                    onChange={(e) =>
                                        setNewReservation((prev) => ({
                                            ...prev,
                                            notes: e.target.value,
                                        }))
                                    }
                                    placeholder="Any special requests or notes"
                                    rows={3}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Create Reservation
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Multiple Table Assignment Dialog */}
            <MultipleTableAssignmentDialog
                isOpen={isMultipleTableDialogOpen}
                onClose={() => setIsMultipleTableDialogOpen(false)}
                onConfirm={handleMultipleTableAssignment}
                tables={tables}
                selectedDate={newReservation.date}
                selectedTime={newReservation.time}
                guests={newReservation.guests}
                tableSchedules={tableSchedules}
                isTableReserved={isTableReserved}
                isTableUnavailableInSchedule={isTableUnavailableInSchedule}
                getJoinedTableInfo={getJoinedTableInfo}
            />

            {/* Assign Tables Dialog for Existing Reservations */}
            {selectedReservation && (
                <MultipleTableAssignmentDialog
                    isOpen={isAssignTableDialogOpen}
                    onClose={() => {
                        setIsAssignTableDialogOpen(false);
                        setSelectedReservation(null);
                    }}
                    onConfirm={handleAssignTableUpdate}
                    tables={tables}
                    selectedDate={selectedReservation.date}
                    selectedTime={selectedReservation.time}
                    guests={selectedReservation.guests}
                    tableSchedules={tableSchedules}
                    isTableReserved={isTableReserved}
                    isTableUnavailableInSchedule={isTableUnavailableInSchedule}
                    getJoinedTableInfo={getJoinedTableInfo}
                    preSelectedTableIds={selectedReservation.tableIds || []}
                />
            )}
        </div>
    );
};
