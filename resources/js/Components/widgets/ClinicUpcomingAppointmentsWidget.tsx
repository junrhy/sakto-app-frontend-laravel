import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Calendar, Clock, User, Phone, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UpcomingAppointment {
    id: number;
    patient_name: string;
    patient_phone: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    treatment_type: string;
    notes: string;
    doctor_name: string;
    is_urgent: boolean;
}

export function ClinicUpcomingAppointmentsWidget() {
    const [appointments, setAppointments] = useState<UpcomingAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUpcomingAppointments();
    }, []);

    const fetchUpcomingAppointments = async () => {
        try {
            setLoading(true);
            const response = await fetch('/clinic/appointments/upcoming?limit=5');
            
            if (!response.ok) {
                throw new Error('Failed to fetch upcoming appointments');
            }
            
            const data = await response.json();
            setAppointments(data.appointments || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load upcoming appointments');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'rescheduled':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const getUrgencyColor = (isUrgent: boolean) => {
        return isUrgent 
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    };

    const isToday = (dateString: string) => {
        const today = new Date().toDateString();
        const appointmentDate = new Date(dateString).toDateString();
        return today === appointmentDate;
    };

    const isTomorrow = (dateString: string) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const appointmentDate = new Date(dateString);
        return tomorrow.toDateString() === appointmentDate.toDateString();
    };

    const getDateLabel = (dateString: string) => {
        if (isToday(dateString)) return 'Today';
        if (isTomorrow(dateString)) return 'Tomorrow';
        return formatDate(dateString);
    };

    if (loading) {
        return (
            <CardContent className="p-6">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </CardContent>
        );
    }

    if (error) {
        return (
            <CardContent className="p-6">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                </div>
            </CardContent>
        );
    }

    if (appointments.length === 0) {
        return (
            <CardContent className="p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No upcoming appointments</p>
                </div>
            </CardContent>
        );
    }

    return (
        <CardContent className="p-6">
            <div className="space-y-3">
                {appointments.map((appointment) => (
                    <div key={appointment.id} className={`p-4 rounded-lg border ${
                        appointment.is_urgent 
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {appointment.patient_name}
                                </span>
                                {appointment.is_urgent && (
                                    <Badge className={getUrgencyColor(appointment.is_urgent)}>
                                        URGENT
                                    </Badge>
                                )}
                            </div>
                            <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status.toUpperCase()}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {getDateLabel(appointment.appointment_date)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatTime(appointment.appointment_time)}
                                </p>
                            </div>
                        </div>

                        <div className="mb-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Treatment</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {appointment.treatment_type}
                            </p>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{appointment.doctor_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{appointment.patient_phone}</span>
                            </div>
                        </div>

                        {appointment.notes && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span className="font-medium">Notes:</span> {appointment.notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </CardContent>
    );
}
