import React, { useState, useMemo } from 'react';
import { Button } from "../../../Components/ui/button";
import { Badge } from "../../../Components/ui/badge";
import { Input } from "../../../Components/ui/input";
import { Label } from "../../../Components/ui/label";
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
import { MoreHorizontal, Calendar, Clock, User, Phone, Mail, Edit, Trash2, CheckCircle, XCircle, CreditCard, DollarSign, Filter, X } from 'lucide-react';
import { Appointment } from '../types/appointment';
import AppointmentVipBadge from './AppointmentVipBadge';

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
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [showDateFilter, setShowDateFilter] = useState(false);

    // Filter appointments by selected date
    const filteredAppointments = useMemo(() => {
        if (!selectedDate) {
            return appointments;
        }
        
        return appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.appointment_date).toISOString().split('T')[0];
            return appointmentDate === selectedDate;
        });
    }, [appointments, selectedDate]);

    const clearDateFilter = () => {
        setSelectedDate('');
        setShowDateFilter(false);
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-4">
            {/* Date Filter Controls */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <Label className="text-sm font-medium">Filter by Date:</Label>
                    </div>
                    
                    {!showDateFilter ? (
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSelectedDate(today);
                                    setShowDateFilter(true);
                                }}
                                className="flex items-center space-x-1"
                            >
                                <Calendar className="h-3 w-3" />
                                <span>Today</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    setSelectedDate(tomorrow.toISOString().split('T')[0]);
                                    setShowDateFilter(true);
                                }}
                                className="flex items-center space-x-1"
                            >
                                <Calendar className="h-3 w-3" />
                                <span>Tomorrow</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (!selectedDate) {
                                        setSelectedDate(today);
                                    }
                                    setShowDateFilter(true);
                                }}
                                className="flex items-center space-x-1"
                            >
                                <Calendar className="h-3 w-3" />
                                <span>Pick Date</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-40"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearDateFilter}
                                className="flex items-center space-x-1"
                            >
                                <X className="h-3 w-3" />
                                <span>Clear</span>
                            </Button>
                        </div>
                    )}
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredAppointments.length} of {appointments.length} appointments
                    {selectedDate && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400">
                            for {formatDate(selectedDate + 'T00:00:00')}
                        </span>
                    )}
                </div>
            </div>

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
                    {filteredAppointments.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                {selectedDate ? (
                                    <div className="space-y-2">
                                        <Calendar className="h-8 w-8 mx-auto text-gray-400" />
                                        <div>No appointments found for {formatDate(selectedDate + 'T00:00:00')}</div>
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={clearDateFilter}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Show all appointments
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Calendar className="h-8 w-8 mx-auto text-gray-400" />
                                        <div>No appointments found</div>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredAppointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="font-medium flex items-center gap-2">
                                            {appointment.patient_name}
                                            <AppointmentVipBadge appointment={appointment} size="sm" />
                                        </div>
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
        </div>
    );
}
