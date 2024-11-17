import { CardContent } from "@/Components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Badge } from "@/Components/ui/badge";
import { ScrollArea } from "@/Components/ui/scroll-area";

interface Reservation {
    id: number;
    name: string;
    date: string;
    time: string;
    guests: string;
    table_id: string;
    notes?: string;
    contact: string;
    status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
    client_identifier: string;
    created_at: string;
    updated_at: string;
}

export function FnbReservationsWidget() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await axios.get('/pos-restaurant/reservations-overview');
                setReservations(response.data);
            } catch (error) {
                console.error('Error fetching reservations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
        // Refresh every 5 minutes
        const interval = setInterval(fetchReservations, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: Reservation['status']) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            seated: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status];
    };

    if (loading) {
        return (
            <CardContent>
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
            </CardContent>
        );
    }

    return (
        <CardContent>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Today's Reservations</h3>
                    <Badge variant="outline">
                        {reservations.length} Total
                    </Badge>
                </div>
                
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                        {reservations.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                No reservations for today
                            </div>
                        ) : (
                            reservations.map((reservation) => (
                                <div
                                    key={reservation.id}
                                    className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium">{reservation.name}</h4>
                                            <div className="text-sm text-gray-500 space-y-1">
                                                <p>
                                                    🕒 {reservation.time}
                                                </p>
                                                <p>
                                                    👥 Party of {reservation.guests}
                                                </p>
                                                <p>
                                                    📱 {reservation.contact}
                                                </p>
                                                {reservation.table_id && (
                                                    <p>
                                                        🪑 Table {reservation.table_id}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={getStatusColor(reservation.status)}>
                                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                        </Badge>
                                    </div>
                                    {reservation.notes && (
                                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                            📝 {reservation.notes}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </CardContent>
    );
} 