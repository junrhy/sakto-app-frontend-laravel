import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../Components/ui/dialog";
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
    MoreHorizontal, 
    Clock, 
    User, 
    Phone, 
    Mail, 
    Edit, 
    Trash2, 
    CheckCircle, 
    XCircle, 
    CreditCard, 
    DollarSign,
    Calendar
} from 'lucide-react';
import { Appointment } from '../types/appointment';

interface DailyAppointmentsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
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
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'confirmed':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'completed':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'no_show':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export default function DailyAppointmentsDialog({
    isOpen,
    onClose,
    date,
    appointments,
    onEditAppointment,
    onDeleteAppointment,
    onUpdateStatus,
    onUpdatePaymentStatus,
    currency
}: DailyAppointmentsDialogProps) {
    // Sort appointments by time
    const sortedAppointments = [...appointments].sort((a, b) => {
        return a.appointment_time.localeCompare(b.appointment_time);
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Appointments for {formatDate(date)}
                        <Badge variant="outline" className="ml-2">
                            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {sortedAppointments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No appointments scheduled for this date.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedAppointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg">{appointment.patient_name}</h3>
                                            <Badge className={getStatusColor(appointment.status)}>
                                                {appointment.status.replace('_', ' ')}
                                            </Badge>
                                            <Badge className={getPaymentStatusColor(appointment.payment_status)}>
                                                {appointment.payment_status}
                                            </Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{formatTime(appointment.appointment_time)}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    <span className="capitalize">{appointment.appointment_type.replace('_', ' ')}</span>
                                                </div>
                                                
                                                {appointment.doctor_name && (
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        <span>Dr. {appointment.doctor_name}</span>
                                                    </div>
                                                )}
                                                
                                                {appointment.fee && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4" />
                                                        <span>{currency}{appointment.fee.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-2">
                                                {appointment.patient_phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4" />
                                                        <span>{appointment.patient_phone}</span>
                                                    </div>
                                                )}
                                                
                                                {appointment.patient_email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4" />
                                                        <span>{appointment.patient_email}</span>
                                                    </div>
                                                )}
                                                
                                                {appointment.notes && (
                                                    <div className="mt-2">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">Notes:</span>
                                                        <p className="text-sm mt-1 break-words whitespace-pre-wrap">{appointment.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
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
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
