import { Badge } from '@/Components/ui/badge';
import { CardContent } from '@/Components/ui/card';
import { AlertCircle, Calendar, Clock, Phone, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TodayAppointment {
    id: number;
    patient_name: string;
    patient_phone: string;
    appointment_time: string;
    duration: number;
    status: string;
    payment_status: string;
    notes?: string;
    is_vip: boolean;
}

export function ClinicTodayAppointmentsWidget() {
    const [appointments, setAppointments] = useState<TodayAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTodayAppointments();
    }, []);

    const fetchTodayAppointments = async () => {
        try {
            setLoading(true);
            const response = await fetch('/clinic/appointments/today');

            if (!response.ok) {
                throw new Error("Failed to fetch today's appointments");
            }

            const data = await response.json();
            setAppointments(data.appointments || []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load today's appointments",
            );
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timeString: string) => {
        try {
            // Handle different time formats
            let date;

            // If it's already a full datetime string
            if (timeString.includes('T') || timeString.includes(' ')) {
                date = new Date(timeString);
            } else {
                // If it's just a time string (HH:MM), create a date for today
                const today = new Date();
                const [hours, minutes] = timeString.split(':');
                date = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                    parseInt(hours),
                    parseInt(minutes),
                );
            }

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return timeString; // Return original string if invalid
            }

            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch (error) {
            console.warn('Error formatting time:', timeString, error);
            return timeString; // Return original string if error
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'completed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'overdue':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const isUpcoming = (appointmentTime: string) => {
        try {
            const now = new Date();
            let appointment;

            // Handle different time formats
            if (
                appointmentTime.includes('T') ||
                appointmentTime.includes(' ')
            ) {
                appointment = new Date(appointmentTime);
            } else {
                // If it's just a time string (HH:MM), create a date for today
                const today = new Date();
                const [hours, minutes] = appointmentTime.split(':');
                appointment = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                    parseInt(hours),
                    parseInt(minutes),
                );
            }

            // Check if appointment date is valid
            if (isNaN(appointment.getTime())) {
                return false;
            }

            const diffInHours =
                (appointment.getTime() - now.getTime()) / (1000 * 60 * 60);
            return diffInHours > 0 && diffInHours <= 2; // Next 2 hours
        } catch (error) {
            console.warn(
                'Error checking if appointment is upcoming:',
                appointmentTime,
                error,
            );
            return false;
        }
    };

    if (loading) {
        return (
            <CardContent className="p-6">
                <div className="flex h-32 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
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
                    <Calendar className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                    <p>No appointments scheduled for today</p>
                </div>
            </CardContent>
        );
    }

    return (
        <CardContent className="p-6">
            <div className="space-y-3">
                {appointments.map((appointment) => (
                    <div
                        key={appointment.id}
                        className={`rounded-lg border p-4 ${
                            isUpcoming(appointment.appointment_time)
                                ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                        }`}
                    >
                        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {formatTime(appointment.appointment_time)}
                                </span>
                                {isUpcoming(appointment.appointment_time) && (
                                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                        Upcoming
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    className={getStatusColor(
                                        appointment.status,
                                    )}
                                >
                                    {appointment.status}
                                </Badge>
                                <Badge
                                    className={getPaymentStatusColor(
                                        appointment.payment_status,
                                    )}
                                >
                                    {appointment.payment_status}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {appointment.patient_name}
                                    </span>
                                    {appointment.is_vip && (
                                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                            VIP
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {appointment.patient_phone}
                                    </div>
                                    <span>{appointment.duration} min</span>
                                </div>
                            </div>
                        </div>

                        {appointment.notes && (
                            <div className="mt-2 rounded bg-gray-100 p-2 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                {appointment.notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </CardContent>
    );
}
