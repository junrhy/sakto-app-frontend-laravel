import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';

interface Truck {
    id: number;
    plate_number: string;
    model: string;
    capacity: number;
    status: string;
    driver: string;
    driver_contact: string;
}

interface Booking {
    id: number;
    booking_reference: string;
    customer_name: string;
    customer_company?: string;
    customer_phone?: string;
    pickup_date: string;
    delivery_date: string;
    pickup_time?: string;
    delivery_time?: string;
    pickup_location?: string;
    delivery_location?: string;
    status: string;
    truck?: Truck;
}

interface BookingCalendarProps {
    bookings: Booking[];
    onDateClick?: (date: Date, bookings: Booking[]) => void;
}

export default function BookingCalendar({ bookings, onDateClick }: BookingCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedBookings, setSelectedBookings] = useState<Booking[]>([]);
    const [bookingType, setBookingType] = useState<'pickup' | 'delivery' | null>(null);

    const getBookingsForDate = (date: Date) => {
        // Use local date formatting to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        const pickupBookings = bookings.filter(booking => {
            if (!booking.pickup_date) return false;
            const pickupDate = new Date(booking.pickup_date);
            const pickupYear = pickupDate.getFullYear();
            const pickupMonth = String(pickupDate.getMonth() + 1).padStart(2, '0');
            const pickupDay = String(pickupDate.getDate()).padStart(2, '0');
            const pickupDateString = `${pickupYear}-${pickupMonth}-${pickupDay}`;
            return pickupDateString === dateString;
        });
        
        const deliveryBookings = bookings.filter(booking => {
            if (!booking.delivery_date) return false;
            const deliveryDate = new Date(booking.delivery_date);
            const deliveryYear = deliveryDate.getFullYear();
            const deliveryMonth = String(deliveryDate.getMonth() + 1).padStart(2, '0');
            const deliveryDay = String(deliveryDate.getDate()).padStart(2, '0');
            const deliveryDateString = `${deliveryYear}-${deliveryMonth}-${deliveryDay}`;
            return deliveryDateString === dateString;
        });
        
        return {
            pickup: pickupBookings,
            delivery: deliveryBookings,
            total: pickupBookings.length + deliveryBookings.length
        };
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-500';
            case 'Confirmed': return 'bg-blue-500';
            case 'In Progress': return 'bg-green-500';
            case 'Completed': return 'bg-emerald-500';
            case 'Cancelled': return 'bg-gray-500';
            default: return 'bg-gray-400';
        }
    };

    const openBookingDialog = (date: Date, bookings: Booking[], type: 'pickup' | 'delivery') => {
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
        setCurrentDate(prev => {
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
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days = getDaysInMonth(currentDate);
    const today = new Date();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
                        <CalendarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Transportation Bookings</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateMonth('prev')}
                        className="h-10 w-10 p-0 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateMonth('next')}
                        className="h-10 w-10 p-0 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-6 items-start">
                {/* Day headers */}
                {dayNames.map(day => (
                    <div key={day} className="p-4 text-center text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
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
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                        <div
                            key={day.toISOString()}
                            className={`
                                min-h-36 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer
                                hover:shadow-md hover:scale-[1.02] transition-all duration-200
                                ${isToday ? 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 border-orange-300 dark:border-orange-600 shadow-md' : ''}
                                ${!isCurrentMonth ? 'opacity-40 bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}
                                ${dayBookings.total > 0 && !isToday ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700' : ''}
                                ${!isCurrentMonth ? '' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                            `}
                            onClick={() => onDateClick?.(day, [...dayBookings.pickup, ...dayBookings.delivery])}
                        >
                            <div className="flex flex-col">
                                {/* Date number */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`
                                        text-lg font-bold
                                        ${isToday ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-gray-100'}
                                    `}>
                                        {day.getDate()}
                                    </div>
                                    {dayBookings.total > 0 && (
                                        <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                            {dayBookings.total}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Booking summary */}
                                {dayBookings.total > 0 && (
                                    <div className="flex flex-col gap-1 mt-2">
                                        {dayBookings.pickup.length > 0 && (
                                            <div 
                                                className="flex items-center gap-2 text-xs bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-700 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openBookingDialog(day, dayBookings.pickup, 'pickup');
                                                }}
                                            >
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span className="text-blue-700 dark:text-blue-300 font-medium">
                                                    {dayBookings.pickup.length} Pickup{dayBookings.pickup.length > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        )}
                                        {dayBookings.delivery.length > 0 && (
                                            <div 
                                                className="flex items-center gap-2 text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg border border-green-200 dark:border-green-700 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openBookingDialog(day, dayBookings.delivery, 'delivery');
                                                }}
                                            >
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-green-700 dark:text-green-300 font-medium">
                                                    {dayBookings.delivery.length} Delivery{dayBookings.delivery.length > 1 ? 's' : ''}
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
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Booking Status Legend</h4>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                        <div className="h-3 w-3 rounded-full bg-yellow-500 shadow-sm"></div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Pending</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                        <div className="h-3 w-3 rounded-full bg-blue-500 shadow-sm"></div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                        <div className="h-3 w-3 rounded-full bg-green-500 shadow-sm"></div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                        <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm"></div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Completed</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                        <div className="h-3 w-3 rounded-full bg-gray-500 shadow-sm"></div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Cancelled</span>
                    </div>
                </div>
            </div>

            {/* Booking Details Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">  
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${bookingType === 'pickup' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                            {bookingType === 'pickup' ? 'Pickup' : 'Delivery'} Bookings - {selectedDate?.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </DialogTitle>
                        
                        {/* Status Statistics */}
                        {selectedBookings.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map(status => {
                                    const count = selectedBookings.filter(booking => booking.status === status).length;
                                    if (count === 0) return null;
                                    
                                    return (
                                        <div key={status} className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                                            <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
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
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Reference</th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Company</th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Truck</th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Driver</th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Location</th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedBookings.map((booking, index) => (
                                        <tr key={booking.id} className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                                            <td className="py-3 px-2">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {booking.booking_reference}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="text-gray-700 dark:text-gray-300">
                                                    {booking.customer_name}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="text-gray-600 dark:text-gray-400 text-xs">
                                                    {booking.customer_company || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="text-gray-700 dark:text-gray-300 text-xs">
                                                    {booking.customer_phone || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)} text-white`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2">
                                                {booking.truck ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-blue-500">🚛</span>
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                                                                {booking.truck.plate_number}
                                                            </div>
                                                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                                                                {booking.truck.model}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500 text-xs">N/A</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2">
                                                {booking.truck?.driver ? (
                                                    <div className="text-gray-700 dark:text-gray-300 text-xs">
                                                        <div className="font-medium">
                                                            {booking.truck.driver}
                                                        </div>
                                                        {booking.truck.driver_contact && (
                                                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                                                                {booking.truck.driver_contact}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500 text-xs">N/A</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="text-gray-700 dark:text-gray-300 text-xs max-w-32 truncate" title={bookingType === 'pickup' ? (booking.pickup_location || 'N/A') : (booking.delivery_location || 'N/A')}>
                                                    {bookingType === 'pickup' ? (booking.pickup_location || 'N/A') : (booking.delivery_location || 'N/A')}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                {bookingType === 'pickup' 
                                                    ? (booking.pickup_time ? (
                                                        <div className="text-gray-700 dark:text-gray-300 text-xs">
                                                            <div className="font-medium">
                                                                {new Date(`2000-01-01T${booking.pickup_time}`).toLocaleTimeString('en-US', { 
                                                                    hour: 'numeric', 
                                                                    minute: '2-digit',
                                                                    hour12: true 
                                                                })}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500 text-xs">N/A</span>
                                                    ))
                                                    : (booking.delivery_time ? (
                                                        <div className="text-gray-700 dark:text-gray-300 text-xs">
                                                            <div className="font-medium">
                                                                {new Date(`2000-01-01T${booking.delivery_time}`).toLocaleTimeString('en-US', { 
                                                                    hour: 'numeric', 
                                                                    minute: '2-digit',
                                                                    hour12: true 
                                                                })}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500 text-xs">N/A</span>
                                                    ))
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No {bookingType} bookings found for this date.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
