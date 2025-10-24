import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import axios from 'axios';
import {
    Calendar,
    CheckCircle,
    Clock,
    Loader2,
    MapPin,
    MessageSquare,
    Phone,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ReservationData {
    id: number;
    name: string;
    date: string;
    time: string;
    guests: number;
    table_ids: number[];
    status: string;
    contact?: string;
    notes?: string;
    confirmed_at?: string;
}

interface ReservationConfirmationProps {
    token: string;
    reservation?: ReservationData | null;
    error?: string | null;
}

export default function ReservationConfirmation({
    token,
    reservation: initialReservation,
    error: initialError,
}: ReservationConfirmationProps) {
    const [reservation, setReservation] = useState<ReservationData | null>(
        initialReservation || null,
    );
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState<string | null>(initialError || null);

    const handleConfirmReservation = async () => {
        try {
            setConfirming(true);

            const response = await axios.post(
                `http://127.0.0.1:8001/api/fnb-reservations/confirm/${token}`,
            );

            if (response.data.status === 'success') {
                setConfirmed(true);
                toast.success('Reservation confirmed successfully!');
            } else {
                setError(
                    response.data.message || 'Failed to confirm reservation',
                );
            }
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || 'Failed to confirm reservation';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setConfirming(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-gray-600 dark:text-gray-400">
                        Loading reservation details...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                            Error
                        </h2>
                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                            {error}
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                            Reservation Not Found
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            The reservation you're looking for could not be
                            found.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
            <div className="mx-auto max-w-2xl px-4">
                <Card className="shadow-lg">
                    <CardHeader className="pb-4 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            Reservation Confirmation
                        </CardTitle>
                        <p className="text-gray-600 dark:text-gray-400">
                            Please review your reservation details and confirm
                            if everything is correct.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Reservation Status */}
                        <div className="text-center">
                            <Badge
                                className={`text-sm font-medium ${
                                    confirmed
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : reservation.status === 'confirmed'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}
                            >
                                {confirmed || reservation.status === 'confirmed'
                                    ? 'Confirmed'
                                    : 'Pending Confirmation'}
                            </Badge>
                        </div>

                        {/* Customer Info */}
                        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                            <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                <Users className="h-4 w-4" />
                                Customer Information
                            </h3>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {reservation.name}
                            </p>
                            {reservation.contact && (
                                <p className="mt-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                    <Phone className="h-3 w-3" />
                                    {reservation.contact}
                                </p>
                            )}
                        </div>

                        {/* Reservation Details */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Date & Time */}
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                    <Calendar className="h-4 w-4" />
                                    Date & Time
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {formatDate(reservation.date)}
                                </p>
                                <p className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(reservation.time)}
                                </p>
                            </div>

                            {/* Party Size */}
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                    <Users className="h-4 w-4" />
                                    Party Size
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {reservation.guests}{' '}
                                    {reservation.guests === 1
                                        ? 'Guest'
                                        : 'Guests'}
                                </p>
                            </div>
                        </div>

                        {/* Tables */}
                        {reservation.table_ids &&
                            reservation.table_ids.length > 0 && (
                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                    <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                        <MapPin className="h-4 w-4" />
                                        Assigned Tables
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Table
                                        {reservation.table_ids.length > 1
                                            ? 's'
                                            : ''}
                                        : {reservation.table_ids.join(', ')}
                                    </p>
                                </div>
                            )}

                        {/* Notes */}
                        {reservation.notes && (
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                    <MessageSquare className="h-4 w-4" />
                                    Special Notes
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {reservation.notes}
                                </p>
                            </div>
                        )}

                        {/* Confirmation Button */}
                        {!confirmed && reservation.status !== 'confirmed' && (
                            <div className="pt-4 text-center">
                                <Button
                                    onClick={handleConfirmReservation}
                                    disabled={confirming}
                                    className="w-full bg-green-600 text-white hover:bg-green-700 sm:w-auto"
                                    size="lg"
                                >
                                    {confirming ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Confirming...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Confirm Reservation
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Success Message */}
                        {(confirmed || reservation.status === 'confirmed') && (
                            <div className="pt-4 text-center">
                                <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-medium">
                                        Reservation Confirmed!
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    We look forward to serving you!
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
