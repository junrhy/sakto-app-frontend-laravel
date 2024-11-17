import { CardContent } from "@/Components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";
import { format, isToday } from "date-fns";
import { Badge } from "@/Components/ui/badge";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";

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

    const groupReservationsByDate = (reservations: Reservation[]) => {
        return reservations.reduce((groups, reservation) => {
            const date = reservation.date;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(reservation);
            return groups;
        }, {} as Record<string, Reservation[]>);
    };

    const renderReservationsList = (filteredReservations: Reservation[]) => {
        const groupedReservations = groupReservationsByDate(filteredReservations);
        const dates = Object.keys(groupedReservations).sort();

        return (
            <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-4">
                    {filteredReservations.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">
                            No reservations found
                        </div>
                    ) : (
                        dates.map((date) => (
                            <div key={date} className="space-y-2">
                                <h4 className="font-medium text-sm text-gray-600 sticky top-0 bg-white py-1 border-b">
                                    {format(new Date(date), 'EEE, MMM d')}
                                </h4>
                                {groupedReservations[date].map((reservation) => (
                                    <div
                                        key={reservation.id}
                                        className="p-2 rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium truncate">
                                                        {reservation.name}
                                                    </h4>
                                                    <Badge className={`${getStatusColor(reservation.status)} text-xs`}>
                                                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-gray-500 grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
                                                    <p className="flex items-center gap-1">
                                                        <span className="text-xs">🕒</span> {reservation.time}
                                                    </p>
                                                    <p className="flex items-center gap-1">
                                                        <span className="text-xs">👥</span> {reservation.guests}
                                                    </p>
                                                    <p className="flex items-center gap-1">
                                                        <span className="text-xs">📱</span> {reservation.contact}
                                                    </p>
                                                    {reservation.table_id && (
                                                        <p className="flex items-center gap-1">
                                                            <span className="text-xs">🪑</span> Table {reservation.table_id}
                                                        </p>
                                                    )}
                                                </div>
                                                {reservation.notes && (
                                                    <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-1.5 rounded">
                                                        <span className="text-xs">📝</span> {reservation.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        );
    };

    const isTomorrow = (date: Date) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return (
            date.getDate() === tomorrow.getDate() &&
            date.getMonth() === tomorrow.getMonth() &&
            date.getFullYear() === tomorrow.getFullYear()
        );
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

    const todayReservations = reservations.filter(r => isToday(new Date(r.date)));
    const tomorrowReservations = reservations.filter(r => isTomorrow(new Date(r.date)));
    const upcomingReservations = reservations.filter(r => {
        const date = new Date(r.date);
        return !isToday(date) && !isTomorrow(date);
    });

    return (
        <CardContent className="p-4">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Reservations</h3>
                    <Badge variant="outline">
                        {reservations.length} Total
                    </Badge>
                </div>

                <Tabs defaultValue="today" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="today">
                            Today's ({todayReservations.length})
                        </TabsTrigger>
                        <TabsTrigger value="tomorrow">
                            Tomorrow's ({tomorrowReservations.length})
                        </TabsTrigger>
                        <TabsTrigger value="upcoming">
                            Upcoming ({upcomingReservations.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="today" className="mt-4">
                        {renderReservationsList(todayReservations)}
                    </TabsContent>
                    <TabsContent value="tomorrow" className="mt-4">
                        {renderReservationsList(tomorrowReservations)}
                    </TabsContent>
                    <TabsContent value="upcoming" className="mt-4">
                        {renderReservationsList(upcomingReservations)}
                    </TabsContent>
                </Tabs>
            </div>
        </CardContent>
    );
} 