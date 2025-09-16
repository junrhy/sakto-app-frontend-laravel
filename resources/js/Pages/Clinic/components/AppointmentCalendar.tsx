import React, { useState, useMemo } from 'react';
import { Button } from "../../../Components/ui/button";
import { Badge } from "../../../Components/ui/badge";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator 
} from "../../../Components/ui/dropdown-menu";
import { 
    ChevronLeft, 
    ChevronRight, 
    MoreHorizontal, 
    Calendar, 
    Clock, 
    User, 
    Phone, 
    Mail, 
    Edit, 
    Trash2, 
    CheckCircle, 
    XCircle, 
    CreditCard, 
    DollarSign 
} from 'lucide-react';
import { Appointment } from '../types/appointment';
import DailyAppointmentsDialog from './DailyAppointmentsDialog';

interface AppointmentCalendarProps {
    appointments: Appointment[];
    onEditAppointment: (appointment: Appointment) => void;
    onDeleteAppointment: (appointment: Appointment) => void;
    onUpdateStatus: (appointment: Appointment, status: string) => void;
    onUpdatePaymentStatus: (appointment: Appointment, paymentStatus: string) => void;
    currency: string;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'scheduled':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-700';
        case 'confirmed':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-700';
        case 'completed':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-700';
        case 'no_show':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-700';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
};

const getPaymentStatusColor = (status: string) => {
    switch (status) {
        case 'paid':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'partial':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'pending':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
};

const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export default function AppointmentCalendar({ 
    appointments, 
    onEditAppointment, 
    onDeleteAppointment, 
    onUpdateStatus,
    onUpdatePaymentStatus,
    currency 
}: AppointmentCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDailyDialogOpen, setIsDailyDialogOpen] = useState(false);

    // Get appointments for the current month
    const appointmentsForMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        return appointments.filter(appointment => {
            // Handle both date string and datetime string formats
            const appointmentDate = new Date(appointment.appointment_date);
            return appointmentDate.getUTCFullYear() === year && appointmentDate.getUTCMonth() === month;
        });
    }, [appointments, currentDate]);

    // Group appointments by date
    const appointmentsByDate = useMemo(() => {
        const grouped: { [key: string]: Appointment[] } = {};
        
        appointmentsForMonth.forEach(appointment => {
            // Extract just the date part (YYYY-MM-DD) from the appointment_date
            const appointmentDate = new Date(appointment.appointment_date);
            const dateKey = appointmentDate.toISOString().split('T')[0];
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(appointment);
        });
        
        return grouped;
    }, [appointmentsForMonth]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        const currentDay = new Date(startDate);
        
        // Generate 42 days (6 weeks)
        for (let i = 0; i < 42; i++) {
            const dateKey = currentDay.toISOString().split('T')[0];
            const isCurrentMonth = currentDay.getMonth() === month;
            const isToday = currentDay.toDateString() === new Date().toDateString();
            
            days.push({
                date: new Date(currentDay),
                dateKey,
                isCurrentMonth,
                isToday,
                appointments: appointmentsByDate[dateKey] || []
            });
            
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        return days;
    }, [currentDate, appointmentsByDate]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    };

    const handleDateClick = (date: Date, appointments: Appointment[]) => {
        if (appointments.length > 0) {
            setSelectedDate(date);
            setIsDailyDialogOpen(true);
        }
    };

    const closeDailyDialog = () => {
        setIsDailyDialogOpen(false);
        setSelectedDate(null);
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateMonth('prev')}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-semibold">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateMonth('next')}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                >
                    Today
                </Button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => (
                        <div
                            key={index}
                            className={`
                                min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 rounded-lg
                                ${day.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}
                                ${day.isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                                ${day.appointments.length > 0 ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors' : ''}
                            `}
                            onClick={() => handleDateClick(day.date, day.appointments)}
                        >
                            <div className={`
                                text-sm font-medium mb-1
                                ${day.isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'}
                                ${day.isToday ? 'text-blue-600 dark:text-blue-400' : ''}
                            `}>
                                {day.date.getDate()}
                            </div>
                            
                            {/* Appointments for this day */}
                            <div className="space-y-1">
                                {day.appointments.slice(0, 2).map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className={`
                                            p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity
                                            ${getStatusColor(appointment.status)}
                                        `}
                                        title={`${appointment.patient_name} - ${formatTime(appointment.appointment_time)} - ${appointment.appointment_type}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">
                                                    {appointment.patient_name}
                                                </div>
                                                <div className="text-xs opacity-75">
                                                    {formatTime(appointment.appointment_time)}
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-4 w-4 p-0 hover:bg-white/20"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-3 w-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onEditAppointment(appointment)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    {appointment.status === 'scheduled' && (
                                                        <DropdownMenuItem onClick={() => onUpdateStatus(appointment, 'confirmed')}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Confirm
                                                        </DropdownMenuItem>
                                                    )}
                                                    {appointment.status === 'confirmed' && (
                                                        <DropdownMenuItem onClick={() => onUpdateStatus(appointment, 'completed')}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Mark Complete
                                                        </DropdownMenuItem>
                                                    )}
                                                    {appointment.status !== 'cancelled' && (
                                                        <DropdownMenuItem onClick={() => onUpdateStatus(appointment, 'cancelled')}>
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Cancel
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    {/* Payment Status Options */}
                                                    {appointment.payment_status !== 'paid' && (
                                                        <DropdownMenuItem onClick={() => onUpdatePaymentStatus(appointment, 'paid')}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Mark as Paid
                                                        </DropdownMenuItem>
                                                    )}
                                                    {appointment.payment_status !== 'partial' && (
                                                        <DropdownMenuItem onClick={() => onUpdatePaymentStatus(appointment, 'partial')}>
                                                            <DollarSign className="mr-2 h-4 w-4" />
                                                            Mark as Partial
                                                        </DropdownMenuItem>
                                                    )}
                                                    {appointment.payment_status !== 'pending' && (
                                                        <DropdownMenuItem onClick={() => onUpdatePaymentStatus(appointment, 'pending')}>
                                                            <CreditCard className="mr-2 h-4 w-4" />
                                                            Mark as Pending
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem 
                                                        onClick={() => onDeleteAppointment(appointment)}
                                                        className="text-red-600 dark:text-red-400"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Show more indicator if there are more than 2 appointments */}
                                {day.appointments.length > 2 && (
                                    <div 
                                        className="text-xs text-blue-600 dark:text-blue-400 text-center cursor-pointer hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDateClick(day.date, day.appointments);
                                        }}
                                    >
                                        +{day.appointments.length - 2} more
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200 dark:bg-blue-900 dark:border-blue-700"></div>
                        <span>Scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-100 border border-green-200 dark:bg-green-900 dark:border-green-700"></div>
                        <span>Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200 dark:bg-gray-900 dark:border-gray-700"></div>
                        <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-100 border border-red-200 dark:bg-red-900 dark:border-red-700"></div>
                        <span>Cancelled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-orange-100 border border-orange-200 dark:bg-orange-900 dark:border-orange-700"></div>
                        <span>No Show</span>
                    </div>
                </div>
            </div>

            {/* Daily Appointments Dialog */}
            {selectedDate && (
                <DailyAppointmentsDialog
                    isOpen={isDailyDialogOpen}
                    onClose={closeDailyDialog}
                    date={selectedDate}
                    appointments={selectedDate ? appointmentsByDate[selectedDate.toISOString().split('T')[0]] || [] : []}
                    onEditAppointment={onEditAppointment}
                    onDeleteAppointment={onDeleteAppointment}
                    onUpdateStatus={onUpdateStatus}
                    onUpdatePaymentStatus={onUpdatePaymentStatus}
                    currency={currency}
                />
            )}
        </div>
    );
}
