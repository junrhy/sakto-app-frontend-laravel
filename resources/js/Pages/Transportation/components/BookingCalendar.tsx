import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Copy,
    Plus,
} from 'lucide-react';
import { useState } from 'react';
import { Booking } from '../types';

interface BookingCalendarProps {
    bookings: Booking[];
    onDateClick?: (date: Date, bookings: Booking[]) => void;
}

export default function BookingCalendar({
    bookings,
    onDateClick,
}: BookingCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedBookings, setSelectedBookings] = useState<Booking[]>([]);
    const [bookingType, setBookingType] = useState<
        'pickup' | 'delivery' | null
    >(null);

    const getBookingsForDate = (date: Date) => {
        // Use local date formatting to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const pickupBookings = bookings.filter((booking) => {
            if (!booking.pickup_date) return false;
            const pickupDate = new Date(booking.pickup_date);
            const pickupYear = pickupDate.getFullYear();
            const pickupMonth = String(pickupDate.getMonth() + 1).padStart(
                2,
                '0',
            );
            const pickupDay = String(pickupDate.getDate()).padStart(2, '0');
            const pickupDateString = `${pickupYear}-${pickupMonth}-${pickupDay}`;
            return pickupDateString === dateString;
        });

        const deliveryBookings = bookings.filter((booking) => {
            if (!booking.delivery_date) return false;
            const deliveryDate = new Date(booking.delivery_date);
            const deliveryYear = deliveryDate.getFullYear();
            const deliveryMonth = String(deliveryDate.getMonth() + 1).padStart(
                2,
                '0',
            );
            const deliveryDay = String(deliveryDate.getDate()).padStart(2, '0');
            const deliveryDateString = `${deliveryYear}-${deliveryMonth}-${deliveryDay}`;
            return deliveryDateString === dateString;
        });

        return {
            pickup: pickupBookings,
            delivery: deliveryBookings,
            total: pickupBookings.length + deliveryBookings.length,
        };
    };

    const getMonthlyTotals = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        const monthlyPickups = bookings.filter((booking) => {
            if (!booking.pickup_date) return false;
            const pickupDate = new Date(booking.pickup_date);
            return (
                pickupDate.getFullYear() === year &&
                pickupDate.getMonth() === month
            );
        });

        const monthlyDeliveries = bookings.filter((booking) => {
            if (!booking.delivery_date) return false;
            const deliveryDate = new Date(booking.delivery_date);
            return (
                deliveryDate.getFullYear() === year &&
                deliveryDate.getMonth() === month
            );
        });

        return {
            pickups: monthlyPickups.length,
            deliveries: monthlyDeliveries.length,
            total: monthlyPickups.length + monthlyDeliveries.length,
        };
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-500';
            case 'Confirmed':
                return 'bg-blue-500';
            case 'In Progress':
                return 'bg-green-500';
            case 'Completed':
                return 'bg-emerald-500';
            case 'Cancelled':
                return 'bg-gray-500';
            default:
                return 'bg-gray-400';
        }
    };

    const openBookingDialog = (
        date: Date,
        bookings: Booking[],
        type: 'pickup' | 'delivery',
    ) => {
        setSelectedDate(date);
        setSelectedBookings(bookings);
        setBookingType(type);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedDate(null);
        setSelectedBookings([]);
        setBookingType(null);
    };

    const addToGoogleCalendar = (booking: Booking) => {
        const isPickup = bookingType === 'pickup';
        const eventDate = isPickup
            ? booking.pickup_date
            : booking.delivery_date;
        const eventTime = isPickup
            ? booking.pickup_time
            : booking.delivery_time;
        const location = isPickup
            ? booking.pickup_location
            : booking.delivery_location;

        if (!eventDate || !eventTime) {
            alert(
                'Date and time information is required to add to Google Calendar',
            );
            return;
        }

        try {
            // Parse date and time components directly without timezone conversion
            const dateStr = eventDate.split('T')[0]; // Get just the date part (YYYY-MM-DD)
            const [year, month, day] = dateStr.split('-');

            // Parse time components (HH:MM format)
            const [hours, minutes] = eventTime.split(':');

            // Create Google Calendar format directly from components
            const startDate = `${year}${month}${day}T${hours}${minutes}00`;

            // Calculate end time (1 hour later)
            const startHour = parseInt(hours);
            const startMinute = parseInt(minutes);
            const endHour = startHour + 1;
            const endDate = `${year}${month}${day}T${String(endHour).padStart(2, '0')}${minutes}00`;

            // Create event details
            const title = `${isPickup ? 'Pickup' : 'Delivery'} - ${booking.booking_reference}`;
            const description = `
Booking Reference: ${booking.booking_reference}
Customer: ${booking.customer_name}
${booking.customer_company ? `Company: ${booking.customer_company}` : ''}
${booking.customer_phone ? `Phone: ${booking.customer_phone}` : ''}
${booking.truck ? `Truck: ${booking.truck.plate_number} (${booking.truck.model})` : ''}
${booking.truck?.driver ? `Driver: ${booking.truck.driver}` : ''}
${booking.truck?.driver_contact ? `Driver Contact: ${booking.truck.driver_contact}` : ''}
Status: ${booking.status}
            `.trim();

            // Create Google Calendar URL
            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location || '')}`;

            // Open in new tab
            window.open(googleCalendarUrl, '_blank');
        } catch (error) {
            console.error('Error creating Google Calendar event:', error);
            alert(
                'Error creating calendar event. Please check the date and time format.',
            );
        }
    };

    const copyCalendarLink = async (booking: Booking) => {
        const isPickup = bookingType === 'pickup';
        const eventDate = isPickup
            ? booking.pickup_date
            : booking.delivery_date;
        const eventTime = isPickup
            ? booking.pickup_time
            : booking.delivery_time;
        const location = isPickup
            ? booking.pickup_location
            : booking.delivery_location;

        if (!eventDate || !eventTime) {
            alert(
                'Date and time information is required to generate calendar link',
            );
            return;
        }

        try {
            // Parse date and time components directly without timezone conversion
            const dateStr = eventDate.split('T')[0]; // Get just the date part (YYYY-MM-DD)
            const [year, month, day] = dateStr.split('-');

            // Parse time components (HH:MM format)
            const [hours, minutes] = eventTime.split(':');

            // Create Google Calendar format directly from components
            const startDate = `${year}${month}${day}T${hours}${minutes}00`;

            // Calculate end time (1 hour later)
            const startHour = parseInt(hours);
            const startMinute = parseInt(minutes);
            const endHour = startHour + 1;
            const endDate = `${year}${month}${day}T${String(endHour).padStart(2, '0')}${minutes}00`;

            // Create event details
            const title = `${isPickup ? 'Pickup' : 'Delivery'} - ${booking.booking_reference}`;
            const description = `
Booking Reference: ${booking.booking_reference}
Customer: ${booking.customer_name}
${booking.customer_company ? `Company: ${booking.customer_company}` : ''}
${booking.customer_phone ? `Phone: ${booking.customer_phone}` : ''}
${booking.truck ? `Truck: ${booking.truck.plate_number} (${booking.truck.model})` : ''}
${booking.truck?.driver ? `Driver: ${booking.truck.driver}` : ''}
${booking.truck?.driver_contact ? `Driver Contact: ${booking.truck.driver_contact}` : ''}
Status: ${booking.status}
            `.trim();

            // Create Google Calendar URL
            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location || '')}`;

            // Copy to clipboard
            await navigator.clipboard.writeText(googleCalendarUrl);
            alert('Calendar link copied to clipboard!');
        } catch (error) {
            console.error('Error copying calendar link:', error);
            alert('Error copying calendar link. Please try again.');
        }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days = getDaysInMonth(currentDate);
    const today = new Date();
    const monthlyTotals = getMonthlyTotals(currentDate);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-3 shadow-md">
                        <CalendarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {monthNames[currentDate.getMonth()]}{' '}
                            {currentDate.getFullYear()}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Transportation Bookings
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateMonth('prev')}
                        className="h-10 w-10 p-0 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 dark:hover:border-orange-700 dark:hover:bg-orange-900/20"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateMonth('next')}
                        className="h-10 w-10 p-0 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 dark:hover:border-orange-700 dark:hover:bg-orange-900/20"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Monthly Summary */}
            <div className="mb-8 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-green-50 p-6 dark:border-blue-700 dark:from-blue-900/20 dark:to-green-900/20">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    Monthly Summary - {monthNames[currentDate.getMonth()]}{' '}
                    {currentDate.getFullYear()}
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {monthlyTotals.pickups.toLocaleString()}
                                </div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Pickups
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                                <div className="h-4 w-4 rounded-full bg-green-500"></div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {monthlyTotals.deliveries.toLocaleString()}
                                </div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Deliveries
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="mb-6 grid grid-cols-7 items-start gap-2">
                {/* Day headers */}
                {dayNames.map((day) => (
                    <div
                        key={day}
                        className="rounded-lg bg-gray-50 p-4 text-center text-sm font-bold text-gray-700 dark:bg-gray-700/50 dark:text-gray-300"
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => {
                    if (!day) {
                        return <div key={index} className="min-h-32"></div>;
                    }

                    const dayBookings = getBookingsForDate(day);
                    const isToday = day.toDateString() === today.toDateString();
                    const isCurrentMonth =
                        day.getMonth() === currentDate.getMonth();

                    return (
                        <div
                            key={day.toISOString()}
                            className={`min-h-36 cursor-pointer rounded-xl border border-gray-200 p-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-md dark:border-gray-700 ${isToday ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md dark:border-orange-600 dark:from-orange-900/30 dark:to-orange-800/20' : ''} ${!isCurrentMonth ? 'bg-gray-50 opacity-40 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'} ${dayBookings.total > 0 && !isToday ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-700 dark:from-green-900/20 dark:to-emerald-900/20' : ''} ${!isCurrentMonth ? '' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'} `}
                            onClick={() =>
                                onDateClick?.(day, [
                                    ...dayBookings.pickup,
                                    ...dayBookings.delivery,
                                ])
                            }
                        >
                            <div className="flex flex-col">
                                {/* Date number */}
                                <div className="mb-2 flex items-center justify-between">
                                    <div
                                        className={`text-lg font-bold ${isToday ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-gray-100'} `}
                                    >
                                        {day.getDate()}
                                    </div>
                                    {dayBookings.total > 0 && (
                                        <div className="rounded-full bg-green-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
                                            {dayBookings.total}
                                        </div>
                                    )}
                                </div>

                                {/* Booking summary */}
                                {dayBookings.total > 0 && (
                                    <div className="mt-2 flex flex-col gap-1">
                                        {dayBookings.pickup.length > 0 && (
                                            <div
                                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-xs transition-colors hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openBookingDialog(
                                                        day,
                                                        dayBookings.pickup,
                                                        'pickup',
                                                    );
                                                }}
                                            >
                                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                <span className="font-medium text-blue-700 dark:text-blue-300">
                                                    {dayBookings.pickup.length}{' '}
                                                    Pickup
                                                    {dayBookings.pickup.length >
                                                    1
                                                        ? 's'
                                                        : ''}
                                                </span>
                                            </div>
                                        )}
                                        {dayBookings.delivery.length > 0 && (
                                            <div
                                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-xs transition-colors hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openBookingDialog(
                                                        day,
                                                        dayBookings.delivery,
                                                        'delivery',
                                                    );
                                                }}
                                            >
                                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                <span className="font-medium text-green-700 dark:text-green-300">
                                                    {
                                                        dayBookings.delivery
                                                            .length
                                                    }{' '}
                                                    Delivery
                                                    {dayBookings.delivery
                                                        .length > 1
                                                        ? 's'
                                                        : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="rounded-xl border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Booking Status Legend
                </h4>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                        <div className="h-3 w-3 rounded-full bg-yellow-500 shadow-sm"></div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                            Pending
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                        <div className="h-3 w-3 rounded-full bg-blue-500 shadow-sm"></div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                            Confirmed
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                        <div className="h-3 w-3 rounded-full bg-green-500 shadow-sm"></div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                            In Progress
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                        <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm"></div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                            Completed
                        </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                        <div className="h-3 w-3 rounded-full bg-gray-500 shadow-sm"></div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                            Cancelled
                        </span>
                    </div>
                </div>
            </div>

            {/* Booking Details Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div
                                className={`h-3 w-3 rounded-full ${bookingType === 'pickup' ? 'bg-blue-500' : 'bg-green-500'}`}
                            ></div>
                            {bookingType === 'pickup' ? 'Pickup' : 'Delivery'}{' '}
                            Bookings -{' '}
                            {selectedDate?.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </DialogTitle>

                        {/* Status Statistics */}
                        {selectedBookings.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {[
                                    'Pending',
                                    'Confirmed',
                                    'In Progress',
                                    'Completed',
                                    'Cancelled',
                                ].map((status) => {
                                    const count = selectedBookings.filter(
                                        (booking) => booking.status === status,
                                    ).length;
                                    if (count === 0) return null;

                                    return (
                                        <div
                                            key={status}
                                            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-700"
                                        >
                                            <div
                                                className={`h-2 w-2 rounded-full ${getStatusColor(status)}`}
                                            ></div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {status}: {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </DialogHeader>

                    <div className="overflow-x-auto">
                        {selectedBookings.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="px-2 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                                            Reference
                                        </th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                                            Customer
                                        </th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                                            Status
                                        </th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                                            Truck
                                        </th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                                            Driver
                                        </th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                                            Location
                                        </th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                                            Time
                                        </th>
                                        <th className="px-2 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedBookings.map((booking, index) => (
                                        <tr
                                            key={booking.id}
                                            className={`border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}
                                        >
                                            <td className="px-2 py-3">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {booking.booking_reference}
                                                </div>
                                            </td>
                                            <td className="px-2 py-3">
                                                <div className="text-xs text-gray-700 dark:text-gray-300">
                                                    <div className="font-medium">
                                                        {booking.customer_name}
                                                    </div>
                                                    {booking.customer_company && (
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                                            {
                                                                booking.customer_company
                                                            }
                                                        </div>
                                                    )}
                                                    {booking.customer_phone && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-500">
                                                            📞{' '}
                                                            {
                                                                booking.customer_phone
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(booking.status)} text-white`}
                                                >
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3">
                                                {booking.truck ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-blue-500">
                                                            🚛
                                                        </span>
                                                        <div>
                                                            <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                                                {
                                                                    booking
                                                                        .truck
                                                                        .plate_number
                                                                }
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {
                                                                    booking
                                                                        .truck
                                                                        .model
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                        N/A
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-2 py-3">
                                                {booking.truck?.driver ? (
                                                    <div className="text-xs text-gray-700 dark:text-gray-300">
                                                        <div className="font-medium">
                                                            {
                                                                booking.truck
                                                                    .driver
                                                            }
                                                        </div>
                                                        {booking.truck
                                                            .driver_contact && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {
                                                                    booking
                                                                        .truck
                                                                        .driver_contact
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                        N/A
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-2 py-3">
                                                <div
                                                    className="max-w-32 truncate text-xs text-gray-700 dark:text-gray-300"
                                                    title={
                                                        bookingType === 'pickup'
                                                            ? booking.pickup_location ||
                                                              'N/A'
                                                            : booking.delivery_location ||
                                                              'N/A'
                                                    }
                                                >
                                                    {bookingType === 'pickup'
                                                        ? booking.pickup_location ||
                                                          'N/A'
                                                        : booking.delivery_location ||
                                                          'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-2 py-3">
                                                {bookingType === 'pickup' ? (
                                                    booking.pickup_time ? (
                                                        <div className="text-xs text-gray-700 dark:text-gray-300">
                                                            <div className="font-medium">
                                                                {new Date(
                                                                    `2000-01-01T${booking.pickup_time}`,
                                                                ).toLocaleTimeString(
                                                                    'en-US',
                                                                    {
                                                                        hour: 'numeric',
                                                                        minute: '2-digit',
                                                                        hour12: true,
                                                                    },
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                                            N/A
                                                        </span>
                                                    )
                                                ) : booking.delivery_time ? (
                                                    <div className="text-xs text-gray-700 dark:text-gray-300">
                                                        <div className="font-medium">
                                                            {new Date(
                                                                `2000-01-01T${booking.delivery_time}`,
                                                            ).toLocaleTimeString(
                                                                'en-US',
                                                                {
                                                                    hour: 'numeric',
                                                                    minute: '2-digit',
                                                                    hour12: true,
                                                                },
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                        N/A
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-2 py-3">
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            addToGoogleCalendar(
                                                                booking,
                                                            )
                                                        }
                                                        className="h-8 px-2 text-xs hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-700 dark:hover:bg-blue-900/20"
                                                        title="Add to Google Calendar"
                                                    >
                                                        <Plus className="mr-1 h-3 w-3" />
                                                        Calendar
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            copyCalendarLink(
                                                                booking,
                                                            )
                                                        }
                                                        className="h-8 px-2 text-xs hover:border-green-300 hover:bg-green-50 dark:hover:border-green-700 dark:hover:bg-green-900/20"
                                                        title="Copy calendar link to share"
                                                    >
                                                        <Copy className="mr-1 h-3 w-3" />
                                                        Copy
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                No {bookingType} bookings found for this date.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
