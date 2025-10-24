import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

/**
 * WeekDatePicker - A reusable horizontal week view date picker component
 *
 * Features:
 * - Displays dates in a horizontal layout (3 days on mobile, 7 days on desktop)
 * - Automatically highlights the current date (Today)
 * - Shows visual indicators (dots) for dates with special meaning
 * - Previous/Next buttons to navigate through dates (shifts by 1 day)
 * - Fully responsive with dark mode support
 * - Smooth animations and hover effects
 *
 * @example
 * ```tsx
 * <WeekDatePicker
 *   selectedDate="2024-01-15"
 *   onDateSelect={(dateStr) => console.log('Selected:', dateStr)}
 *   datesWithIndicator={['2024-01-16', '2024-01-18']}
 *   label="Select Appointment Date"
 *   className="mb-4"
 * />
 * ```
 */
interface WeekDatePickerProps {
    /** Selected date in YYYY-MM-DD format */
    selectedDate: string;
    /** Callback when a date is selected, receives date string in YYYY-MM-DD format */
    onDateSelect: (dateStr: string) => void;
    /** Array of dates (YYYY-MM-DD) that should display an indicator dot */
    datesWithIndicator?: string[];
    /** Label text displayed above the date picker */
    label?: string;
    /** Additional CSS classes for the container */
    className?: string;
}

export const WeekDatePicker: React.FC<WeekDatePickerProps> = ({
    selectedDate,
    onDateSelect,
    datesWithIndicator = [],
    label = 'Quick Date Selection',
    className = '',
}) => {
    const [weekStartDate, setWeekStartDate] = useState<Date>(() => {
        // Start from today or selected date
        if (selectedDate) {
            const date = new Date(selectedDate);
            date.setHours(0, 0, 0, 0);
            return date;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    });

    // State to track screen size for responsive date count
    const [isMobile, setIsMobile] = useState(false);

    // Check screen size on mount and resize
    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // 768px is md breakpoint
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Generate dates based on screen size (3 for mobile, 7 for desktop)
    const weekDates = useMemo(() => {
        const dates = [];
        const daysToShow = isMobile ? 3 : 7;
        for (let i = 0; i < daysToShow; i++) {
            const date = new Date(weekStartDate);
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        return dates;
    }, [weekStartDate, isMobile]);

    // Get today's date string for comparison
    const todayStr = useMemo(() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }, []);

    // Navigation handlers for week view
    const handlePreviousDay = useCallback(() => {
        setWeekStartDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() - 1);
            return newDate;
        });
    }, []);

    const handleNextDay = useCallback(() => {
        setWeekStartDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 1);
            return newDate;
        });
    }, []);

    // Handle date selection from week view
    const handleWeekDateSelect = useCallback(
        (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            onDateSelect(dateStr);
        },
        [onDateSelect],
    );

    // Format selected date for display (e.g., "Oct 24, 2024")
    const formattedSelectedDate = useMemo(() => {
        if (!selectedDate) return '';
        const date = new Date(selectedDate);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }, [selectedDate]);

    return (
        <div className={className}>
            {/* Selected Date Display */}
            <div className="mb-3 text-center">
                <Label className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formattedSelectedDate || label}
                </Label>
            </div>

            {/* Navigation and Week Days Container */}
            <div className="flex items-stretch gap-3">
                {/* Previous Button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousDay}
                    className="flex h-auto w-12 flex-shrink-0 items-center justify-center p-2"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                {/* Week Days Container */}
                <div className="grid flex-1 grid-cols-3 gap-2 md:grid-cols-7">
                    {weekDates.map((date, index) => {
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        const isSelected = dateStr === selectedDate;
                        const isToday = dateStr === todayStr;
                        const hasIndicator =
                            datesWithIndicator.includes(dateStr);

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleWeekDateSelect(date)}
                                className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-all duration-200 hover:scale-105 ${
                                    isSelected
                                        ? 'border-blue-500 bg-blue-500 text-white shadow-lg ring-2 ring-blue-300'
                                        : isToday
                                          ? 'border-orange-400 bg-orange-50 text-orange-900 dark:border-orange-500 dark:bg-orange-900/20 dark:text-orange-100'
                                          : 'border-gray-200 bg-white text-gray-900 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-blue-500 dark:hover:bg-blue-900/20'
                                }`}
                            >
                                {/* Day of Week */}
                                <span
                                    className={`mb-1 text-xs font-medium uppercase ${
                                        isSelected
                                            ? 'text-white'
                                            : isToday
                                              ? 'text-orange-600 dark:text-orange-400'
                                              : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    {date.toLocaleDateString('en-US', {
                                        weekday: 'short',
                                    })}
                                </span>

                                {/* Date Number */}
                                <span
                                    className={`text-xl font-bold ${
                                        isSelected
                                            ? 'text-white'
                                            : isToday
                                              ? 'text-orange-900 dark:text-orange-100'
                                              : 'text-gray-900 dark:text-white'
                                    }`}
                                >
                                    {date.getDate()}
                                </span>

                                {/* Month */}
                                <span
                                    className={`mt-1 text-xs ${
                                        isSelected
                                            ? 'text-white/90'
                                            : isToday
                                              ? 'text-orange-700 dark:text-orange-300'
                                              : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    {date.toLocaleDateString('en-US', {
                                        month: 'short',
                                    })}
                                </span>

                                {/* Indicator Dot */}
                                {hasIndicator && !isSelected && (
                                    <div
                                        className={`absolute right-1 top-1 h-2 w-2 rounded-full ${
                                            isToday
                                                ? 'bg-orange-500'
                                                : 'bg-blue-500'
                                        }`}
                                    />
                                )}

                                {/* Today Badge */}
                                {isToday && !isSelected && (
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                        <Badge className="h-4 bg-orange-500 px-1.5 py-0 text-[10px] text-white">
                                            Today
                                        </Badge>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleNextDay}
                    className="flex h-auto w-12 flex-shrink-0 items-center justify-center p-2"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};
