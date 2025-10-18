import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Calendar, Edit2, Save, X } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { BlockedDate, OpenedDate } from '../types';
import { DateCalendar } from './DateCalendar';
import { toast } from 'sonner';

interface BlockedDatesTabProps {
    blockedDates: BlockedDate[];
    openedDates?: OpenedDate[];
    onAddBlockedDate: (
        blockedDate: Omit<BlockedDate, 'id' | 'created_at' | 'updated_at'>,
    ) => void;
    onUpdateBlockedDate: (
        id: number,
        blockedDate: Partial<BlockedDate>,
    ) => void;
    onDeleteBlockedDate: (id: number) => void;
}

export const BlockedDatesTab: React.FC<BlockedDatesTabProps> = ({
    blockedDates,
    openedDates = [],
    onAddBlockedDate,
    onUpdateBlockedDate,
    onDeleteBlockedDate,
}) => {
    const [newBlockedDate, setNewBlockedDate] = useState<
        Omit<BlockedDate, 'id' | 'created_at' | 'updated_at'>
    >(() => {
        // Get today's date in local timezone
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return {
            blocked_date: `${year}-${month}-${day}`,
            timeslots: [],
            reason: '',
            client_identifier: 'current_client', // This should come from auth
        };
    });

    const [loadingSlots, setLoadingSlots] = useState<string[]>([]);
    const [editingReasonId, setEditingReasonId] = useState<number | null>(null);
    const [editingReason, setEditingReason] = useState<string>('');
    const [optimisticBlockedDates, setOptimisticBlockedDates] =
        useState<BlockedDate[]>(blockedDates);

    // Sync optimistic state with props when they change
    React.useEffect(() => {
        setOptimisticBlockedDates(blockedDates);
    }, [blockedDates]);

    // Generate time slots with 30-minute intervals in 12-hour format, separated by AM/PM
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

    // Get list of dates that have blocked timeslots
    const datesWithBlocks = useMemo(() => {
        return Array.from(
            new Set(
                optimisticBlockedDates.map((blocked) =>
                    blocked.blocked_date.split('T')[0],
                ),
            ),
        );
    }, [optimisticBlockedDates]);

    // Handle instant block/unblock on time slot click
    const handleTimeSlotToggle = useCallback(
        async (timeSlot: string) => {
            // Prevent multiple clicks on the same slot
            if (loadingSlots.includes(timeSlot)) return;

            // Check if this slot is opened (only if opened dates are configured)
            if (openedDates.length > 0) {
                const isOpened = openedDates.some((opened) => {
                    const openedDateStr = opened.opened_date.split('T')[0];
                    return (
                        openedDateStr === newBlockedDate.blocked_date &&
                        opened.timeslots &&
                        opened.timeslots.includes(timeSlot)
                    );
                });
                
                if (!isOpened) {
                    toast.error('This time slot is not opened. Please open it first in the "Opened Dates" tab before blocking.');
                    return;
                }
            }

            setLoadingSlots((prev) => [...prev, timeSlot]);

            // Check if this slot is already blocked
            const alreadyBlockedEntry = optimisticBlockedDates.find(
                (blocked) =>
                    blocked.blocked_date.split('T')[0] ===
                        newBlockedDate.blocked_date &&
                    blocked.timeslots.includes(timeSlot),
            );

            try {
                if (alreadyBlockedEntry) {
                    // UNBLOCK: Remove this slot
                    const remainingSlots = alreadyBlockedEntry.timeslots.filter(
                        (slot) => slot !== timeSlot,
                    );

                    // Optimistically update UI immediately
                    if (remainingSlots.length === 0) {
                        // Remove entire entry from optimistic state
                        setOptimisticBlockedDates((prev) =>
                            prev.filter((b) => b.id !== alreadyBlockedEntry.id),
                        );
                        // Delete entire entry if no slots remain
                        await onDeleteBlockedDate(alreadyBlockedEntry.id);
                    } else {
                        // Update optimistic state with remaining slots
                        setOptimisticBlockedDates((prev) =>
                            prev.map((b) =>
                                b.id === alreadyBlockedEntry.id
                                    ? { ...b, timeslots: remainingSlots }
                                    : b,
                            ),
                        );
                        // Update with remaining slots
                        await onUpdateBlockedDate(alreadyBlockedEntry.id, {
                            blocked_date: alreadyBlockedEntry.blocked_date.split('T')[0],
                            timeslots: remainingSlots,
                            client_identifier: alreadyBlockedEntry.client_identifier,
                        });
                    }
                } else {
                    // BLOCK: Add this slot
                    const blockedDateEntry = {
                        blocked_date: newBlockedDate.blocked_date,
                        timeslots: [timeSlot],
                        reason: '',
                        client_identifier: 'current_client',
                    };

                    // Optimistically add to UI immediately (with temporary ID)
                    const tempId = Date.now();
                    setOptimisticBlockedDates((prev) => [
                        ...prev,
                        {
                            ...blockedDateEntry,
                            id: tempId,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        } as BlockedDate,
                    ]);

                    await onAddBlockedDate(blockedDateEntry);
                }
            } catch (error) {
                // Revert optimistic update on error
                setOptimisticBlockedDates(blockedDates);
            } finally {
                setLoadingSlots((prev) => prev.filter((s) => s !== timeSlot));
            }
        },
        [
            loadingSlots,
            optimisticBlockedDates,
            blockedDates,
            openedDates,
            newBlockedDate.blocked_date,
            onDeleteBlockedDate,
            onUpdateBlockedDate,
            onAddBlockedDate,
        ],
    );

    // Handle editing reason for a blocked date
    const handleEditReason = useCallback((blockedDate: BlockedDate) => {
        setEditingReasonId(blockedDate.id);
        setEditingReason(blockedDate.reason || '');
    }, []);

    const handleSaveReason = useCallback(async (blockedDate: BlockedDate) => {
        if (editingReasonId !== blockedDate.id) return;
        
        try {
            // Optimistically update UI
            setOptimisticBlockedDates((prev) =>
                prev.map((b) =>
                    b.id === blockedDate.id
                        ? { ...b, reason: editingReason }
                        : b,
                ),
            );
            
            await onUpdateBlockedDate(blockedDate.id, {
                reason: editingReason,
            });
            
            setEditingReasonId(null);
            setEditingReason('');
        } catch (error) {
            setOptimisticBlockedDates(blockedDates);
            toast.error('Failed to update reason');
        }
    }, [editingReasonId, editingReason, onUpdateBlockedDate, blockedDates]);

    const handleCancelEditReason = useCallback(() => {
        setEditingReasonId(null);
        setEditingReason('');
    }, []);

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                        <Calendar className="mr-2 h-5 w-5 text-red-500" />
                        Block New Date
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {/* Blocked Dates Management */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-800/50 dark:bg-amber-900/10">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                                {/* Calendar Section - Left Side */}
                                <div className="lg:col-span-6">
                                    <Label className="mb-3 block text-sm font-medium text-gray-900 dark:text-white">
                                        Select Date to Block *
                                    </Label>
                                    <div className="rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
                                        <DateCalendar
                                            selectedDate={newBlockedDate.blocked_date}
                                            onDateSelect={(dateStr) => {
                                                setNewBlockedDate({
                                                    ...newBlockedDate,
                                                    blocked_date: dateStr,
                                                });
                                            }}
                                            blockedDates={datesWithBlocks}
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

                                {/* Time Slots Section - Right Side */}
                                <div className="lg:col-span-6">
                                    <div className="mb-3 flex items-center justify-between">
                                        <Label className="text-sm font-medium text-gray-900 dark:text-white">
                                            Click to Block/Unblock Time Slots
                                        </Label>
                                    </div>

                                    {/* Legend */}
                                    <div className="mb-3 flex flex-wrap gap-3 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-3 w-3 rounded border border-gray-400 bg-gray-300 dark:border-gray-700 dark:bg-gray-800"></div>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Not Opened
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-3 w-3 rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"></div>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Available to Block
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
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* AM Column */}
                                            <div>
                                                <h4 className="mb-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    AM
                                                </h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {timeSlots.am.map(
                                                        (timeSlot) => {
                                                            const isOpened = openedDates.length === 0 || openedDates.some(
                                                                (opened) => {
                                                                    const openedDateStr = opened.opened_date.split('T')[0];
                                                                    return (
                                                                        openedDateStr === newBlockedDate.blocked_date &&
                                                                        opened.timeslots &&
                                                                        opened.timeslots.includes(timeSlot.value)
                                                                    );
                                                                }
                                                            );
                                                            
                                                            const isBlocked =
                                                                optimisticBlockedDates.some(
                                                                    (
                                                                        blocked,
                                                                    ) => {
                                                                        const blockedDateStr =
                                                                            blocked.blocked_date.split(
                                                                                'T',
                                                                            )[0];
                                                                        const selectedDateStr =
                                                                            newBlockedDate.blocked_date;
                                                                        return (
                                                                            blockedDateStr ===
                                                                                selectedDateStr &&
                                                                            blocked.timeslots.includes(
                                                                                timeSlot.value,
                                                                            )
                                                                        );
                                                                    },
                                                                );

                                                            const isLoading =
                                                                loadingSlots.includes(
                                                                    timeSlot.value,
                                                                );

                                                            return (
                                                                <button
                                                                    key={
                                                                        timeSlot.value
                                                                    }
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleTimeSlotToggle(
                                                                            timeSlot.value,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isLoading || !isOpened
                                                                    }
                                                                    className={`rounded-md border px-2 py-1.5 text-sm font-medium transition-all relative ${
                                                                        !isOpened
                                                                            ? 'border-gray-400 bg-gray-300 text-gray-600 cursor-not-allowed opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                                                                            : isBlocked
                                                                            ? 'border-red-500 bg-red-500 text-white hover:bg-red-600'
                                                                            : 'border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-red-700 dark:hover:bg-red-900/20'
                                                                    } ${isLoading ? 'opacity-50 cursor-wait' : (!isOpened ? 'cursor-not-allowed' : 'cursor-pointer')}`}
                                                                >
                                                                    {isLoading ? (
                                                                        <span className="flex items-center justify-center">
                                                                            <svg
                                                                                className="animate-spin h-4 w-4"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <circle
                                                                                    className="opacity-25"
                                                                                    cx="12"
                                                                                    cy="12"
                                                                                    r="10"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="4"
                                                                                    fill="none"
                                                                                />
                                                                                <path
                                                                                    className="opacity-75"
                                                                                    fill="currentColor"
                                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                                />
                                                                            </svg>
                                                                        </span>
                                                                    ) : (
                                                                        timeSlot.display
                                                                    )}
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
                                                        (timeSlot) => {
                                                            const isOpened = openedDates.length === 0 || openedDates.some(
                                                                (opened) => {
                                                                    const openedDateStr = opened.opened_date.split('T')[0];
                                                                    return (
                                                                        openedDateStr === newBlockedDate.blocked_date &&
                                                                        opened.timeslots &&
                                                                        opened.timeslots.includes(timeSlot.value)
                                                                    );
                                                                }
                                                            );
                                                            
                                                            const isBlocked =
                                                                optimisticBlockedDates.some(
                                                                    (
                                                                        blocked,
                                                                    ) => {
                                                                        const blockedDateStr =
                                                                            blocked.blocked_date.split(
                                                                                'T',
                                                                            )[0];
                                                                        const selectedDateStr =
                                                                            newBlockedDate.blocked_date;
                                                                        return (
                                                                            blockedDateStr ===
                                                                                selectedDateStr &&
                                                                            blocked.timeslots.includes(
                                                                                timeSlot.value,
                                                                            )
                                                                        );
                                                                    },
                                                                );

                                                            const isLoading =
                                                                loadingSlots.includes(
                                                                    timeSlot.value,
                                                                );

                                                            return (
                                                                <button
                                                                    key={
                                                                        timeSlot.value
                                                                    }
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleTimeSlotToggle(
                                                                            timeSlot.value,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isLoading || !isOpened
                                                                    }
                                                                    className={`rounded-md border px-2 py-1.5 text-sm font-medium transition-all relative ${
                                                                        !isOpened
                                                                            ? 'border-gray-400 bg-gray-300 text-gray-600 cursor-not-allowed opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                                                                            : isBlocked
                                                                            ? 'border-red-500 bg-red-500 text-white hover:bg-red-600'
                                                                            : 'border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-red-700 dark:hover:bg-red-900/20'
                                                                    } ${isLoading ? 'opacity-50 cursor-wait' : (!isOpened ? 'cursor-not-allowed' : 'cursor-pointer')}`}
                                                                >
                                                                    {isLoading ? (
                                                                        <span className="flex items-center justify-center">
                                                                            <svg
                                                                                className="animate-spin h-4 w-4"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <circle
                                                                                    className="opacity-25"
                                                                                    cx="12"
                                                                                    cy="12"
                                                                                    r="10"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="4"
                                                                                    fill="none"
                                                                                />
                                                                                <path
                                                                                    className="opacity-75"
                                                                                    fill="currentColor"
                                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                                />
                                                                            </svg>
                                                                        </span>
                                                                    ) : (
                                                                        timeSlot.display
                                                                    )}
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        </div>
                    </div>

                    {/* Blocked Dates List */}
                    <div className="mt-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Currently Blocked Dates
                        </h3>
                        {optimisticBlockedDates.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400">
                                No blocked dates configured. Click time slots above to block dates and prevent reservations.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {optimisticBlockedDates.map((blockedDate) => (
                                    <Card
                                        key={blockedDate.id}
                                        className="border-red-200 bg-red-50/50 dark:border-red-700 dark:bg-red-900/10"
                                    >
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {new Date(
                                                                blockedDate.blocked_date,
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
                                                            {blockedDate.timeslots.sort((a, b) => a.localeCompare(b)).map((slot) => (
                                                                <span
                                                                    key={slot}
                                                                    className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-200"
                                                                >
                                                                    {convertTo12Hour(slot)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Reason Section */}
                                                <div className="border-t border-red-200 pt-3 dark:border-red-700">
                                                    {editingReasonId === blockedDate.id ? (
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                Reason for Blocking (Optional)
                                                            </Label>
                                                            <Textarea
                                                                value={editingReason}
                                                                onChange={(e) => setEditingReason(e.target.value)}
                                                                placeholder="e.g., Holiday, Maintenance, Private event..."
                                                                className="resize-none text-sm text-gray-900 dark:text-white"
                                                                rows={2}
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={() => handleSaveReason(blockedDate)}
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                >
                                                                    <Save className="mr-1 h-3 w-3" />
                                                                    Save
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={handleCancelEditReason}
                                                                >
                                                                    <X className="mr-1 h-3 w-3" />
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1">
                                                                {blockedDate.reason ? (
                                                                    <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                                                                        <span className="font-semibold">Reason:</span> {blockedDate.reason}
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-xs italic text-gray-500 dark:text-gray-400">
                                                                        No reason provided
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleEditReason(blockedDate)}
                                                                className="shrink-0"
                                                            >
                                                                <Edit2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
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
