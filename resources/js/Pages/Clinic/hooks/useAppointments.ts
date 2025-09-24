import { useCallback, useState } from 'react';
import {
    Appointment,
    AppointmentFilters,
    AppointmentStatusUpdate,
    NewAppointment,
} from '../types/appointment';

interface UseAppointmentsReturn {
    appointments: Appointment[];
    setAppointments: (appointments: Appointment[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    error: string | null;
    setError: (error: string | null) => void;
    fetchAppointments: (filters?: AppointmentFilters) => Promise<void>;
    createAppointment: (
        appointment: NewAppointment,
    ) => Promise<{ success: boolean; data?: Appointment; error?: string }>;
    updateAppointment: (
        id: number,
        appointment: Partial<NewAppointment>,
    ) => Promise<{ success: boolean; data?: Appointment; error?: string }>;
    deleteAppointment: (
        id: number,
    ) => Promise<{ success: boolean; error?: string }>;
    updateAppointmentStatus: (
        id: number,
        statusUpdate: AppointmentStatusUpdate,
    ) => Promise<{ success: boolean; data?: Appointment; error?: string }>;
    updateAppointmentPaymentStatus: (
        id: number,
        paymentStatus: string,
    ) => Promise<{ success: boolean; data?: Appointment; error?: string }>;
    fetchTodayAppointments: () => Promise<void>;
    fetchUpcomingAppointments: (limit?: number) => Promise<void>;
}

export function useAppointments(): UseAppointmentsReturn {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointments = useCallback(
        async (filters?: AppointmentFilters) => {
            setIsLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                if (filters?.status) params.append('status', filters.status);
                if (filters?.date) params.append('date', filters.date);
                if (filters?.patient_id)
                    params.append('patient_id', filters.patient_id.toString());

                const response = await fetch(
                    `/clinic/appointments?${params.toString()}`,
                );
                const data = await response.json();

                if (data.success) {
                    setAppointments(data.appointments || []);
                } else {
                    setError(data.error || 'Failed to fetch appointments');
                }
            } catch (err) {
                setError('Failed to fetch appointments');
                console.error('Error fetching appointments:', err);
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    const createAppointment = useCallback(
        async (appointment: NewAppointment) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch('/clinic/appointments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(appointment),
                });

                const data = await response.json();

                if (data.success) {
                    setAppointments((prev) => [...prev, data.data]);
                    return { success: true, data: data.data };
                } else {
                    setError(data.error || 'Failed to create appointment');
                    return {
                        success: false,
                        error: data.error || 'Failed to create appointment',
                    };
                }
            } catch (err) {
                const errorMessage = 'Failed to create appointment';
                setError(errorMessage);
                console.error('Error creating appointment:', err);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    const updateAppointment = useCallback(
        async (id: number, appointment: Partial<NewAppointment>) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/clinic/appointments/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(appointment),
                });

                const data = await response.json();

                if (data.success) {
                    setAppointments((prev) =>
                        prev.map((apt) => (apt.id === id ? data.data : apt)),
                    );
                    return { success: true, data: data.data };
                } else {
                    setError(data.error || 'Failed to update appointment');
                    return {
                        success: false,
                        error: data.error || 'Failed to update appointment',
                    };
                }
            } catch (err) {
                const errorMessage = 'Failed to update appointment';
                setError(errorMessage);
                console.error('Error updating appointment:', err);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    const deleteAppointment = useCallback(async (id: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/clinic/appointments/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                setAppointments((prev) => prev.filter((apt) => apt.id !== id));
                return { success: true };
            } else {
                setError(data.error || 'Failed to delete appointment');
                return {
                    success: false,
                    error: data.error || 'Failed to delete appointment',
                };
            }
        } catch (err) {
            const errorMessage = 'Failed to delete appointment';
            setError(errorMessage);
            console.error('Error deleting appointment:', err);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateAppointmentStatus = useCallback(
        async (id: number, statusUpdate: AppointmentStatusUpdate) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/clinic/appointments/${id}/status`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN':
                                document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute('content') || '',
                        },
                        body: JSON.stringify(statusUpdate),
                    },
                );

                const data = await response.json();

                if (data.success) {
                    setAppointments((prev) =>
                        prev.map((apt) => (apt.id === id ? data.data : apt)),
                    );
                    return { success: true, data: data.data };
                } else {
                    setError(
                        data.error || 'Failed to update appointment status',
                    );
                    return {
                        success: false,
                        error:
                            data.error || 'Failed to update appointment status',
                    };
                }
            } catch (err) {
                const errorMessage = 'Failed to update appointment status';
                setError(errorMessage);
                console.error('Error updating appointment status:', err);
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    const updateAppointmentPaymentStatus = useCallback(
        async (id: number, paymentStatus: string) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/clinic/appointments/${id}/payment-status`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN':
                                document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({ payment_status: paymentStatus }),
                    },
                );

                const data = await response.json();

                if (data.success) {
                    setAppointments((prev) =>
                        prev.map((apt) => (apt.id === id ? data.data : apt)),
                    );
                    return { success: true, data: data.data };
                } else {
                    setError(
                        data.error ||
                            'Failed to update appointment payment status',
                    );
                    return {
                        success: false,
                        error:
                            data.error ||
                            'Failed to update appointment payment status',
                    };
                }
            } catch (err) {
                const errorMessage =
                    'Failed to update appointment payment status';
                setError(errorMessage);
                console.error(
                    'Error updating appointment payment status:',
                    err,
                );
                return { success: false, error: errorMessage };
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    const fetchTodayAppointments = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/clinic/appointments/today');
            const data = await response.json();

            if (data.success) {
                setAppointments(data.appointments || []);
            } else {
                setError(data.error || "Failed to fetch today's appointments");
            }
        } catch (err) {
            setError("Failed to fetch today's appointments");
            console.error("Error fetching today's appointments:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUpcomingAppointments = useCallback(
        async (limit: number = 10) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/clinic/appointments/upcoming?limit=${limit}`,
                );
                const data = await response.json();

                if (data.success) {
                    setAppointments(data.appointments || []);
                } else {
                    setError(
                        data.error || 'Failed to fetch upcoming appointments',
                    );
                }
            } catch (err) {
                setError('Failed to fetch upcoming appointments');
                console.error('Error fetching upcoming appointments:', err);
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    return {
        appointments,
        setAppointments,
        isLoading,
        setIsLoading,
        error,
        setError,
        fetchAppointments,
        createAppointment,
        updateAppointment,
        deleteAppointment,
        updateAppointmentStatus,
        updateAppointmentPaymentStatus,
        fetchTodayAppointments,
        fetchUpcomingAppointments,
    };
}
