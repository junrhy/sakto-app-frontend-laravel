import React from 'react';
import { Button } from "../../../Components/ui/button";
import { Badge } from "../../../Components/ui/badge";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "../../../Components/ui/table";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator 
} from "../../../Components/ui/dropdown-menu";
import { MoreHorizontal, Calendar, Clock, User, Phone, Mail, Edit, Trash2, CheckCircle, XCircle, CreditCard, DollarSign } from 'lucide-react';
import { Appointment } from '../types/appointment';

interface AppointmentTableProps {
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

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

export default function AppointmentTable({ 
    appointments, 
    onEditAppointment, 
    onDeleteAppointment, 
    onUpdateStatus,
    onUpdatePaymentStatus,
    currency 
}: AppointmentTableProps) {
    return (
        <div className="rounded-md border border-gray-200 dark:border-gray-700">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {appointments.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No appointments found
                            </TableCell>
                        </TableRow>
                    ) : (
                        appointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="font-medium">{appointment.patient_name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            {appointment.patient_phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {appointment.patient_phone}
                                                </div>
                                            )}
                                            {appointment.patient_email && (
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {appointment.patient_email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(appointment.appointment_date)}
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                            <Clock className="h-3 w-3" />
                                            {formatTime(appointment.appointment_time)}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {appointment.appointment_type.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {appointment.doctor_name || '-'}
                                </TableCell>
                                <TableCell>
                                    {appointment.fee ? `${currency}${appointment.fee.toLocaleString()}` : '-'}
                                </TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(appointment.status)}>
                                        {appointment.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getPaymentStatusColor(appointment.payment_status)}>
                                        {appointment.payment_status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
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
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
