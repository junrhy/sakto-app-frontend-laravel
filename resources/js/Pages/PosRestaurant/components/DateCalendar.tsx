import { Button } from '@/Components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface DateCalendarProps {
    selectedDate: string; // YYYY-MM-DD format
    onDateSelect: (date: string) => void;
    blockedDates?: string[]; // Array of blocked dates in YYYY-MM-DD format
    minDate?: Date; // Minimum selectable date
}

export const DateCalendar: React.FC<DateCalendarProps> = ({
    selectedDate,
    onDateSelect,
    blockedDates = [],
    minDate,
}) => {
    const [currentMonth, setCurrentMonth] = useState(() => {
        if (selectedDate) {
            return new Date(selectedDate + 'T00:00:00');
        }
        return new Date();
    });

    const daysInMonth = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (number | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days in the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    }, [currentMonth]);

    const monthYear = useMemo(() => {
        return currentMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    }, [currentMonth]);

    const handlePreviousMonth = () => {
        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1,
                1,
            ),
        );
    };

    const handleNextMonth = () => {
        setCurrentMonth(
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1,
                1,
            ),
        );
    };

    const handleDateClick = (day: number) => {
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        // Check if date is disabled
        const clickedDate = new Date(year, currentMonth.getMonth(), day);
        if (minDate && clickedDate < minDate) {
            return;
        }

        onDateSelect(dateStr);
    };

    const isDateSelected = (day: number | null) => {
        if (day === null) return false;
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;
        return dateStr === selectedDate;
    };

    const isDateBlocked = (day: number | null) => {
        if (day === null) return false;
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;
        return blockedDates.includes(dateStr);
    };

    const isDateDisabled = (day: number | null) => {
        if (day === null) return true;
        if (!minDate) return false;
        const clickedDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day,
        );
        return clickedDate < minDate;
    };

    const isToday = (day: number | null) => {
        if (day === null) return false;
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear()
        );
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="w-full">
            {/* Header with month/year and navigation */}
            <div className="mb-4 flex items-center justify-between">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousMonth}
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {monthYear}
                </h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleNextMonth}
                    className="h-8 w-8 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Week day headers */}
            <div className="mb-2 grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-600 dark:text-gray-400"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((day, index) => {
                    if (day === null) {
                        return (
                            <div
                                key={`empty-${index}`}
                                className="aspect-square"
                            />
                        );
                    }

                    const selected = isDateSelected(day);
                    const blocked = isDateBlocked(day);
                    const disabled = isDateDisabled(day);
                    const today = isToday(day);

                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => !disabled && handleDateClick(day)}
                            disabled={disabled}
                            className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                                selected
                                    ? 'bg-amber-500 text-white ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-gray-700'
                                    : blocked
                                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                      : today && !disabled
                                        ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800'
                                        : disabled
                                          ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                                          : 'text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700'
                            } `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-200 pt-3 text-xs dark:border-gray-600">
                <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 rounded border-2 border-amber-500 bg-amber-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                        Selected
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 rounded bg-orange-100 dark:bg-orange-900/30"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                        Has Blocks
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-4 w-4 rounded bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:ring-blue-800"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                        Today
                    </span>
                </div>
            </div>
        </div>
    );
};
