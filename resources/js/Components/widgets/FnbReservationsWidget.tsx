import { Badge } from '@/Components/ui/badge';
import { CardContent } from '@/Components/ui/card';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import axios from 'axios';
import { format, isToday } from 'date-fns';
import { useEffect, useState } from 'react';

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
                const response = await axios.get(
                    '/pos-restaurant/reservations-overview',
                );
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
            pending:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            confirmed:
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            seated: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            completed:
                'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
            cancelled:
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };
        return colors[status];
    };

    const groupReservationsByDate = (reservations: Reservation[]) => {
        return reservations.reduce(
            (groups, reservation) => {
                const date = reservation.date;
                if (!groups[date]) {
                    groups[date] = [];
                }
                groups[date].push(reservation);
                return groups;
            },
            {} as Record<string, Reservation[]>,
        );
    };

    const renderReservationsList = (filteredReservations: Reservation[]) => {
        const groupedReservations =
            groupReservationsByDate(filteredReservations);
        const dates = Object.keys(groupedReservations).sort();

        return (
            <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-4">
                    {filteredReservations.length === 0 ? (
                        <div className="py-4 text-center text-gray-500">
                            No reservations found
                        </div>
                    ) : (
                        dates.map((date) => (
                            <div key={date} className="space-y-2">
                                <h4 className="sticky top-0 border-b bg-white py-1 text-sm font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                                    {format(new Date(date), 'EEE, MMM d')}
                                </h4>
                                {groupedReservations[date].map(
                                    (reservation) => (
                                        <div
                                            key={reservation.id}
                                            className="rounded-md border border-gray-200 p-2 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-800/50 dark:hover:border-gray-700"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="truncate font-medium dark:text-gray-200">
                                                            {reservation.name}
                                                        </h4>
                                                        <Badge
                                                            className={`${getStatusColor(reservation.status)} text-xs`}
                                                        >
                                                            {reservation.status
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                reservation.status.slice(
                                                                    1,
                                                                )}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm text-gray-500 dark:text-gray-400">
                                                        <p className="flex items-center gap-1">
                                                            <span className="text-xs">
                                                                🕒
                                                            </span>{' '}
                                                            {reservation.time}
                                                        </p>
                                                        <p className="flex items-center gap-1">
                                                            <span className="text-xs">
                                                                👥
                                                            </span>{' '}
                                                            {reservation.guests}
                                                        </p>
                                                        <p className="flex items-center gap-1">
                                                            <span className="text-xs">
                                                                📱
                                                            </span>{' '}
                                                            {
                                                                reservation.contact
                                                            }
                                                        </p>
                                                        {reservation.table_id && (
                                                            <p className="flex items-center gap-1">
                                                                <span className="text-xs">
                                                                    🪑
                                                                </span>{' '}
                                                                Table{' '}
                                                                {
                                                                    reservation.table_id
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    {reservation.notes && (
                                                        <div className="mt-1 rounded bg-gray-50 p-1.5 text-sm text-gray-600 dark:bg-gray-800/80 dark:text-gray-400">
                                                            <span className="text-xs">
                                                                📝
                                                            </span>{' '}
                                                            {reservation.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}
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
                <div className="flex h-48 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100" />
                </div>
            </CardContent>
        );
    }

    const todayReservations = reservations.filter((r) =>
        isToday(new Date(r.date)),
    );
    const tomorrowReservations = reservations.filter((r) =>
        isTomorrow(new Date(r.date)),
    );
    const upcomingReservations = reservations.filter((r) => {
        const date = new Date(r.date);
        return !isToday(date) && !isTomorrow(date);
    });

    return (
        <CardContent className="p-4">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold dark:text-gray-100">
                        Reservations
                    </h3>
                    <Badge variant="outline">{reservations.length} Total</Badge>
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
