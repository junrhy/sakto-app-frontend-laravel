import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Calendar, Plus } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { BlockedDate } from '../types';

interface BlockedDatesTabProps {
    blockedDates: BlockedDate[];
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
    onAddBlockedDate,
    onUpdateBlockedDate,
    onDeleteBlockedDate,
}) => {
    const [newBlockedDate, setNewBlockedDate] = useState<
        Omit<BlockedDate, 'id' | 'created_at' | 'updated_at'>
    >({
        blocked_date: new Date().toISOString().split('T')[0], // Default to today
        timeslots: [],
        reason: '',
        client_identifier: 'current_client', // This should come from auth
    });

    const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

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

    // Handle time slot selection (including unblocking already blocked slots)
    const handleTimeSlotToggle = useCallback((timeSlot: string) => {
        setSelectedTimeSlots((prev) => {
            if (prev.includes(timeSlot)) {
                return prev.filter((slot) => slot !== timeSlot);
            } else {
                return [...prev, timeSlot].sort();
            }
        });
    }, []);

    const handleFullDayToggle = useCallback(
        (isFullDay: boolean) => {
            if (isFullDay) {
                // Select all time slots when full day is checked
                const timeSlots = generateTimeSlots();
                const allTimeSlots = [...timeSlots.am, ...timeSlots.pm].map(
                    (slot) => slot.value,
                );
                setSelectedTimeSlots(allTimeSlots);
            } else {
                // Clear selection when full day is unchecked
                setSelectedTimeSlots([]);
            }
        },
        [generateTimeSlots],
    );

    const handleSubmitBlockedDate = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (newBlockedDate.blocked_date) {
                if (selectedTimeSlots.length === 0) {
                    alert(
                        'Please select at least one time slot to block or unblock.',
                    );
                    return;
                }

                // Get already blocked slots for this date
                const alreadyBlockedSlots = blockedDates
                    .filter(
                        (blocked) =>
                            blocked.blocked_date.split('T')[0] ===
                            newBlockedDate.blocked_date,
                    )
                    .flatMap((blocked) => blocked.timeslots);

                // Separate new slots to block and existing slots to unblock
                const newSlotsToBlock = selectedTimeSlots.filter(
                    (slot) => !alreadyBlockedSlots.includes(slot),
                );
                const slotsToUnblock = selectedTimeSlots.filter((slot) =>
                    alreadyBlockedSlots.includes(slot),
                );

                // Handle blocking new slots
                if (newSlotsToBlock.length > 0) {
                    const blockedDateEntry = {
                        ...newBlockedDate,
                        timeslots: newSlotsToBlock,
                    };
                    onAddBlockedDate(blockedDateEntry);
                }

                // Handle unblocking existing slots
                if (slotsToUnblock.length > 0) {
                    // Find blocked date entries that contain slots to unblock
                    const blockedEntriesToUpdate = blockedDates.filter(
                        (blocked) =>
                            blocked.blocked_date.split('T')[0] ===
                                newBlockedDate.blocked_date &&
                            blocked.timeslots.some((slot) =>
                                slotsToUnblock.includes(slot),
                            ),
                    );

                    // For each blocked entry, remove the unblocked slots
                    blockedEntriesToUpdate.forEach((blockedEntry) => {
                        const remainingSlots = blockedEntry.timeslots.filter(
                            (slot) => !slotsToUnblock.includes(slot),
                        );

                        if (remainingSlots.length === 0) {
                            // If no slots remain, delete the entire blocked date entry
                            onDeleteBlockedDate(blockedEntry.id);
                        } else {
                            // Update the blocked date entry with remaining slots
                            onUpdateBlockedDate(blockedEntry.id, {
                                timeslots: remainingSlots,
                            });
                        }
                    });
                }

                // Reset form
                setNewBlockedDate({
                    blocked_date: new Date().toISOString().split('T')[0], // Reset to today
                    timeslots: [],
                    reason: '',
                    client_identifier: 'current_client',
                });
                setSelectedTimeSlots([]);
            }
        },
        [
            newBlockedDate,
            selectedTimeSlots,
            blockedDates,
            onAddBlockedDate,
            onUpdateBlockedDate,
            onDeleteBlockedDate,
        ],
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-6 dark:border-red-800 dark:from-red-900/20 dark:to-orange-900/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Blocked Dates Management
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Block specific dates and time slots to prevent
                            reservations
                        </p>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                        <Calendar className="mr-2 h-5 w-5 text-red-500" />
                        Block New Date
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {/* Add New Blocked Date Form */}
                    <div className="rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-6 dark:border-red-800 dark:from-red-900/20 dark:to-orange-900/20">
                        <form onSubmit={handleSubmitBlockedDate}>
                            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="blockedDate">
                                        Date to Block *
                                    </Label>
                                    <Input
                                        id="blockedDate"
                                        type="date"
                                        value={newBlockedDate.blocked_date}
                                        onChange={(e) =>
                                            setNewBlockedDate({
                                                ...newBlockedDate,
                                                blocked_date: e.target.value,
                                            })
                                        }
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                        required
                                        className="rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm transition-all focus:border-red-500 focus:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-red-400"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="fullDay"
                                        checked={
                                            selectedTimeSlots.length ===
                                            timeSlots.am.length +
                                                timeSlots.pm.length
                                        }
                                        onChange={(e) =>
                                            handleFullDayToggle(
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-red-600 focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-red-600"
                                    />
                                    <Label
                                        htmlFor="fullDay"
                                        className="text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        Block Full Day (selects all time slots)
                                    </Label>
                                </div>
                                <div className="md:col-span-2">
                                    <Label>
                                        Select Time Slots to Block (30-minute
                                        intervals)
                                    </Label>

                                    {/* Legend */}
                                    <div className="mb-3 mt-2 flex flex-wrap gap-4 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"></div>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Available
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 rounded border border-red-500 bg-red-500"></div>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Selected
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 rounded border border-orange-300 bg-orange-200 dark:border-orange-600 dark:bg-orange-800"></div>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Already Blocked (click to
                                                unblock)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-2 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
                                        <div className="grid grid-cols-2 gap-6">
                                            {/* AM Column */}
                                            <div>
                                                <h4 className="mb-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    AM
                                                </h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {timeSlots.am.map(
                                                        (timeSlot) => {
                                                            const isSelected =
                                                                selectedTimeSlots.includes(
                                                                    timeSlot.value,
                                                                );
                                                            const isAlreadyBlocked =
                                                                blockedDates.some(
                                                                    (
                                                                        blocked,
                                                                    ) => {
                                                                        // Normalize dates to YYYY-MM-DD format for comparison
                                                                        const blockedDateStr =
                                                                            blocked.blocked_date.split(
                                                                                'T',
                                                                            )[0];
                                                                        const selectedDateStr =
                                                                            newBlockedDate.blocked_date;
                                                                        const dateMatch =
                                                                            blockedDateStr ===
                                                                            selectedDateStr;
                                                                        const slotMatch =
                                                                            blocked.timeslots.includes(
                                                                                timeSlot.value,
                                                                            );

                                                                        return (
                                                                            dateMatch &&
                                                                            slotMatch
                                                                        );
                                                                    },
                                                                );

                                                            const isDisabled =
                                                                false; // Allow clicking on all slots

                                                            return (
                                                                <button
                                                                    key={
                                                                        timeSlot.value
                                                                    }
                                                                    type="button"
                                                                    onClick={() =>
                                                                        !isDisabled &&
                                                                        handleTimeSlotToggle(
                                                                            timeSlot.value,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isDisabled
                                                                    }
                                                                    className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                                                                        isSelected
                                                                            ? 'border-red-500 bg-red-500 text-white'
                                                                            : isAlreadyBlocked
                                                                              ? 'border-orange-300 bg-orange-200 text-orange-800 hover:border-orange-400 hover:bg-orange-300 dark:border-orange-600 dark:bg-orange-800 dark:text-orange-200 dark:hover:border-orange-500 dark:hover:bg-orange-700'
                                                                              : 'border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-red-700 dark:hover:bg-red-900/20'
                                                                    } `}
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
                                                        (timeSlot) => {
                                                            const isSelected =
                                                                selectedTimeSlots.includes(
                                                                    timeSlot.value,
                                                                );
                                                            const isAlreadyBlocked =
                                                                blockedDates.some(
                                                                    (
                                                                        blocked,
                                                                    ) => {
                                                                        // Normalize dates to YYYY-MM-DD format for comparison
                                                                        const blockedDateStr =
                                                                            blocked.blocked_date.split(
                                                                                'T',
                                                                            )[0];
                                                                        const selectedDateStr =
                                                                            newBlockedDate.blocked_date;
                                                                        const dateMatch =
                                                                            blockedDateStr ===
                                                                            selectedDateStr;
                                                                        const slotMatch =
                                                                            blocked.timeslots.includes(
                                                                                timeSlot.value,
                                                                            );

                                                                        return (
                                                                            dateMatch &&
                                                                            slotMatch
                                                                        );
                                                                    },
                                                                );

                                                            const isDisabled =
                                                                false; // Allow clicking on all slots

                                                            return (
                                                                <button
                                                                    key={
                                                                        timeSlot.value
                                                                    }
                                                                    type="button"
                                                                    onClick={() =>
                                                                        !isDisabled &&
                                                                        handleTimeSlotToggle(
                                                                            timeSlot.value,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isDisabled
                                                                    }
                                                                    className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                                                                        isSelected
                                                                            ? 'border-red-500 bg-red-500 text-white'
                                                                            : isAlreadyBlocked
                                                                              ? 'border-orange-300 bg-orange-200 text-orange-800 hover:border-orange-400 hover:bg-orange-300 dark:border-orange-600 dark:bg-orange-800 dark:text-orange-200 dark:hover:border-orange-500 dark:hover:bg-orange-700'
                                                                              : 'border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-red-700 dark:hover:bg-red-900/20'
                                                                    } `}
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
                                        {(selectedTimeSlots.length > 0 ||
                                            blockedDates.some(
                                                (blocked) =>
                                                    blocked.blocked_date.split(
                                                        'T',
                                                    )[0] ===
                                                    newBlockedDate.blocked_date,
                                            )) && (
                                            <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                                {selectedTimeSlots.length >
                                                    0 && (
                                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                        Selected:{' '}
                                                        {
                                                            selectedTimeSlots.length
                                                        }{' '}
                                                        time slot(s)
                                                    </p>
                                                )}
                                                {blockedDates.some(
                                                    (blocked) =>
                                                        blocked.blocked_date.split(
                                                            'T',
                                                        )[0] ===
                                                        newBlockedDate.blocked_date,
                                                ) && (
                                                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                                        Already blocked:{' '}
                                                        {blockedDates
                                                            .filter(
                                                                (blocked) =>
                                                                    blocked.blocked_date.split(
                                                                        'T',
                                                                    )[0] ===
                                                                    newBlockedDate.blocked_date,
                                                            )
                                                            .reduce(
                                                                (
                                                                    total,
                                                                    blocked,
                                                                ) =>
                                                                    total +
                                                                    blocked
                                                                        .timeslots
                                                                        .length,
                                                                0,
                                                            )}{' '}
                                                        time slot(s)
                                                    </p>
                                                )}
                                                <p className="mt-1 text-xs text-blue-600 dark:text-blue-300">
                                                    {selectedTimeSlots.length >
                                                    0
                                                        ? (() => {
                                                              const alreadyBlockedSlots =
                                                                  blockedDates
                                                                      .filter(
                                                                          (
                                                                              blocked,
                                                                          ) =>
                                                                              blocked.blocked_date.split(
                                                                                  'T',
                                                                              )[0] ===
                                                                              newBlockedDate.blocked_date,
                                                                      )
                                                                      .flatMap(
                                                                          (
                                                                              blocked,
                                                                          ) =>
                                                                              blocked.timeslots,
                                                                      );
                                                              const newSlots =
                                                                  selectedTimeSlots.filter(
                                                                      (slot) =>
                                                                          !alreadyBlockedSlots.includes(
                                                                              slot,
                                                                          ),
                                                                  );
                                                              const unblockSlots =
                                                                  selectedTimeSlots.filter(
                                                                      (slot) =>
                                                                          alreadyBlockedSlots.includes(
                                                                              slot,
                                                                          ),
                                                                  );

                                                              if (
                                                                  newSlots.length >
                                                                      0 &&
                                                                  unblockSlots.length >
                                                                      0
                                                              ) {
                                                                  return `Will block ${newSlots.length} new slot(s) and unblock ${unblockSlots.length} existing slot(s)`;
                                                              } else if (
                                                                  newSlots.length >
                                                                  0
                                                              ) {
                                                                  return `Will block ${newSlots.length} new time slot(s)`;
                                                              } else if (
                                                                  unblockSlots.length >
                                                                  0
                                                              ) {
                                                                  return `Will unblock ${unblockSlots.length} time slot(s)`;
                                                              }
                                                              return 'Will update these time slots';
                                                          })()
                                                        : 'Select time slots to block or click orange slots to unblock'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="blockedReason">
                                        Reason (Optional)
                                    </Label>
                                    <Textarea
                                        id="blockedReason"
                                        value={newBlockedDate.reason}
                                        onChange={(e) =>
                                            setNewBlockedDate({
                                                ...newBlockedDate,
                                                reason: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., Private event, Maintenance, Holiday"
                                        className="rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm transition-all focus:border-red-500 focus:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-red-400"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:shadow-xl md:w-auto"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {selectedTimeSlots.length > 0
                                    ? `Update ${selectedTimeSlots.length} Time Slot(s)`
                                    : 'Select Time Slots'}
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
