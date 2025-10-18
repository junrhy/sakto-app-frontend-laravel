import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Calendar } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { DateCalendar } from './DateCalendar';
import { toast } from 'sonner';

interface OpenedDate {
    id: number;
    opened_date: string;
    timeslots: string[];
    reason?: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
}

interface OpenedDatesTabProps {
    openedDates: OpenedDate[];
    onAddOpenedDate: (
        openedDate: Omit<OpenedDate, 'id' | 'created_at' | 'updated_at'>,
    ) => void;
    onUpdateOpenedDate: (
        id: number,
        openedDate: Partial<OpenedDate>,
    ) => void;
    onDeleteOpenedDate: (id: number) => void;
}

export const OpenedDatesTab: React.FC<OpenedDatesTabProps> = ({
    openedDates,
    onAddOpenedDate,
    onUpdateOpenedDate,
    onDeleteOpenedDate,
}) => {
    const [newOpenedDate, setNewOpenedDate] = useState<
        Omit<OpenedDate, 'id' | 'created_at' | 'updated_at'>
    >(() => {
        // Get today's date in local timezone
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return {
            opened_date: `${year}-${month}-${day}`,
            timeslots: [],
            reason: '',
            client_identifier: 'current_client',
        };
    });

    const [loadingSlots, setLoadingSlots] = useState<string[]>([]);
    const [optimisticOpenedDates, setOptimisticOpenedDates] =
        useState<OpenedDate[]>(openedDates);

    // Sync optimistic state with props when they change
    React.useEffect(() => {
        setOptimisticOpenedDates(openedDates);
    }, [openedDates]);

    // Generate time slots with 30-minute intervals
    const generateTimeSlots = useCallback(() => {
        const amSlots = [];
        const pmSlots = [];

        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayTime = convertTo12Hour(timeString);
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

    // Convert 24-hour format to 12-hour format with AM/PM
    const convertTo12Hour = useCallback((time24: string) => {
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }, []);

    const timeSlots = generateTimeSlots();

    // Get list of dates that have opened timeslots
    const datesWithOpenings = useMemo(() => {
        return Array.from(
            new Set(
                optimisticOpenedDates.map((opened) =>
                    opened.opened_date.split('T')[0],
                ),
            ),
        );
    }, [optimisticOpenedDates]);

    // Handle instant open/close on time slot click
    const handleTimeSlotToggle = useCallback(
        async (timeSlot: string) => {
            // Prevent multiple clicks on the same slot
            if (loadingSlots.includes(timeSlot)) return;

            setLoadingSlots((prev) => [...prev, timeSlot]);

            // Check if this slot is already opened
            const alreadyOpenedEntry = optimisticOpenedDates.find(
                (opened) =>
                    opened.opened_date.split('T')[0] ===
                        newOpenedDate.opened_date &&
                    opened.timeslots.includes(timeSlot),
            );

            try {
                if (alreadyOpenedEntry) {
                    // CLOSE: Remove this slot
                    const remainingSlots = alreadyOpenedEntry.timeslots.filter(
                        (slot) => slot !== timeSlot,
                    );

                    // Optimistically update UI immediately
                    if (remainingSlots.length === 0) {
                        // Remove entire entry from optimistic state
                        setOptimisticOpenedDates((prev) =>
                            prev.filter((b) => b.id !== alreadyOpenedEntry.id),
                        );
                        // Delete entire entry if no slots remain
                        await onDeleteOpenedDate(alreadyOpenedEntry.id);
                    } else {
                        // Update optimistic state with remaining slots
                        setOptimisticOpenedDates((prev) =>
                            prev.map((b) =>
                                b.id === alreadyOpenedEntry.id
                                    ? { ...b, timeslots: remainingSlots }
                                    : b,
                            ),
                        );
                        // Update with remaining slots
                        await onUpdateOpenedDate(alreadyOpenedEntry.id, {
                            opened_date: alreadyOpenedEntry.opened_date.split('T')[0],
                            timeslots: remainingSlots,
                            client_identifier: alreadyOpenedEntry.client_identifier,
                        });
                    }
                } else {
                    // OPEN: Add this slot
                    const openedDateEntry = {
                        opened_date: newOpenedDate.opened_date,
                        timeslots: [timeSlot],
                        reason: '',
                        client_identifier: 'current_client',
                    };

                    // Optimistically add to UI immediately (with temporary ID)
                    const tempId = Date.now();
                    setOptimisticOpenedDates((prev) => [
                        ...prev,
                        {
                            ...openedDateEntry,
                            id: tempId,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        } as OpenedDate,
                    ]);

                    await onAddOpenedDate(openedDateEntry);
                }
            } catch (error) {
                // Revert optimistic update on error
                setOptimisticOpenedDates(openedDates);
            } finally {
                setLoadingSlots((prev) => prev.filter((s) => s !== timeSlot));
            }
        },
        [
            loadingSlots,
            optimisticOpenedDates,
            openedDates,
            newOpenedDate.opened_date,
            onDeleteOpenedDate,
            onUpdateOpenedDate,
            onAddOpenedDate,
        ],
    );

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                        <Calendar className="mr-2 h-5 w-5 text-green-500" />
                        Opened Dates Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {/* Add New Opened Date Form */}
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50/50 p-6 dark:border-green-800/50 dark:bg-green-900/10">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Select Date & Time Slots to Open
                        </h3>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            {/* Calendar Section - Left Side (50%) */}
                            <div className="lg:col-span-6">
                                <Label className="mb-3 block text-sm font-medium text-gray-900 dark:text-white">
                                    Select Date to Open
                                </Label>
                                <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
                                    <DateCalendar
                                        selectedDate={newOpenedDate.opened_date}
                                        onDateSelect={(dateStr) => {
                                            setNewOpenedDate({
                                                ...newOpenedDate,
                                                opened_date: dateStr,
                                            });
                                        }}
                                        blockedDates={datesWithOpenings}
                                        minDate={
                                            new Date(
                                                new Date().setHours(
                                                    0,
                                                    0,
                                                    0,
                                                    0,
                                                ),
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Time Slots Section - Right Side (50%) */}
                            <div className="lg:col-span-6">
                                <div className="mb-3 flex items-center justify-between">
                                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                                        Click to Open/Close Time Slots
                                    </Label>
                                </div>

                                {/* Legend */}
                                <div className="mb-3 flex flex-wrap gap-3 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"></div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Closed
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded border border-green-500 bg-green-500"></div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Open
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
                                                    const isOpened =
                                                        optimisticOpenedDates.some(
                                                            (opened) =>
                                                                opened.opened_date.split(
                                                                    'T',
                                                                )[0] ===
                                                                    newOpenedDate.opened_date &&
                                                                opened.timeslots.includes(
                                                                    timeSlot.value,
                                                                ),
                                                        );
                                                    const isLoading =
                                                        loadingSlots.includes(
                                                            timeSlot.value,
                                                        );

                                                    return (
                                                        <button
                                                            key={timeSlot.value}
                                                            type="button"
                                                            onClick={() =>
                                                                handleTimeSlotToggle(
                                                                    timeSlot.value,
                                                                )
                                                            }
                                                            disabled={isLoading}
                                                            className={`rounded-md border px-3 py-2 text-sm font-medium shadow-sm transition-all ${
                                                                isOpened
                                                                    ? 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-green-500 dark:hover:bg-green-900/20'
                                                            } ${isLoading ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
                                                        >
                                                            {isLoading ? (
                                                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                                            ) : (
                                                                timeSlot.display
                                                            )}
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
                                                    const isOpened =
                                                        optimisticOpenedDates.some(
                                                            (opened) =>
                                                                opened.opened_date.split(
                                                                    'T',
                                                                )[0] ===
                                                                    newOpenedDate.opened_date &&
                                                                opened.timeslots.includes(
                                                                    timeSlot.value,
                                                                ),
                                                        );
                                                    const isLoading =
                                                        loadingSlots.includes(
                                                            timeSlot.value,
                                                        );

                                                    return (
                                                        <button
                                                            key={timeSlot.value}
                                                            type="button"
                                                            onClick={() =>
                                                                handleTimeSlotToggle(
                                                                    timeSlot.value,
                                                                )
                                                            }
                                                            disabled={isLoading}
                                                            className={`rounded-md border px-3 py-2 text-sm font-medium shadow-sm transition-all ${
                                                                isOpened
                                                                    ? 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                                                                    : 'border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-green-500 dark:hover:bg-green-900/20'
                                                            } ${isLoading ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
                                                        >
                                                            {isLoading ? (
                                                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                                            ) : (
                                                                timeSlot.display
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Opened Dates List */}
                    <div className="mt-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Currently Opened Dates
                        </h3>
                        {optimisticOpenedDates.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400">
                                No opened dates configured. Click time slots above to open dates for reservations.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {optimisticOpenedDates.map((openedDate) => (
                                    <Card
                                        key={openedDate.id}
                                        className="border-green-200 bg-green-50/50 dark:border-green-700 dark:bg-green-900/10"
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {new Date(
                                                            openedDate.opened_date,
                                                        ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            },
                                                        )}
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {openedDate.timeslots.sort((a, b) => a.localeCompare(b)).map((slot) => (
                                                            <span
                                                                key={slot}
                                                                className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-200"
                                                            >
                                                                {convertTo12Hour(slot)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {openedDate.reason && (
                                                        <p className="mt-2 text-sm italic text-gray-500 dark:text-gray-400">
                                                            {openedDate.reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

