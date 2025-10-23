import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { CheckCircle, XCircle, Calendar, Clock, Users, MapPin, Phone, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

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

export default function ReservationConfirmation({ token, reservation: initialReservation, error: initialError }: ReservationConfirmationProps) {
    const [reservation, setReservation] = useState<ReservationData | null>(initialReservation || null);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState<string | null>(initialError || null);

    const handleConfirmReservation = async () => {
        try {
            setConfirming(true);
            
            const response = await axios.post(`http://127.0.0.1:8001/api/fnb-reservations/confirm/${token}`);
            
            if (response.data.status === 'success') {
                setConfirmed(true);
                toast.success('Reservation confirmed successfully!');
            } else {
                setError(response.data.message || 'Failed to confirm reservation');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to confirm reservation';
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
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600 dark:text-gray-400">Loading reservation details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Error
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Reservation Not Found
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            The reservation you're looking for could not be found.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <Card className="shadow-lg">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            Reservation Confirmation
                        </CardTitle>
                        <p className="text-gray-600 dark:text-gray-400">
                            Please review your reservation details and confirm if everything is correct.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Reservation Status */}
                        <div className="text-center">
                            <Badge 
                                className={`text-sm font-medium ${
                                    confirmed ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    reservation.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}
                            >
                                {confirmed || reservation.status === 'confirmed' ? 'Confirmed' : 'Pending Confirmation'}
                            </Badge>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Customer Information
                            </h3>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {reservation.name}
                            </p>
                            {reservation.contact && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                    <Phone className="h-3 w-3" />
                                    {reservation.contact}
                                </p>
                            )}
                        </div>

                        {/* Reservation Details */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Date & Time */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Date & Time
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {formatDate(reservation.date)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(reservation.time)}
                                </p>
                            </div>

                            {/* Party Size */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Party Size
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {reservation.guests} {reservation.guests === 1 ? 'Guest' : 'Guests'}
                                </p>
                            </div>
                        </div>

                        {/* Tables */}
                        {reservation.table_ids && reservation.table_ids.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Assigned Tables
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Table{reservation.table_ids.length > 1 ? 's' : ''}: {reservation.table_ids.join(', ')}
                                </p>
                            </div>
                        )}

                        {/* Notes */}
                        {reservation.notes && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
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
                            <div className="text-center pt-4">
                                <Button
                                    onClick={handleConfirmReservation}
                                    disabled={confirming}
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                                    size="lg"
                                >
                                    {confirming ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Confirming...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Confirm Reservation
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Success Message */}
                        {(confirmed || reservation.status === 'confirmed') && (
                            <div className="text-center pt-4">
                                <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-medium">Reservation Confirmed!</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
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
