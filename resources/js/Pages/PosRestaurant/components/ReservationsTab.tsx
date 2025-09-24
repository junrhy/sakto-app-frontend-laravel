import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Check, Plus, Trash, X } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { BlockedDate, Reservation, Table as TableType } from '../types';

interface ReservationsTabProps {
    reservations: Reservation[];
    tables: TableType[];
    blockedDates?: BlockedDate[];
    currency_symbol: string;
    onAddReservation: (reservation: Omit<Reservation, 'id' | 'status'>) => void;
    onUpdateReservation: (
        id: number,
        reservation: Partial<Reservation>,
    ) => void;
    onDeleteReservation: (id: number) => void;
    onConfirmReservation: (id: number) => void;
    onCancelReservation: (id: number) => void;
}

export const ReservationsTab: React.FC<ReservationsTabProps> = ({
    reservations,
    tables,
    blockedDates = [],
    currency_symbol,
    onAddReservation,
    onUpdateReservation,
    onDeleteReservation,
    onConfirmReservation,
    onCancelReservation,
}) => {
    const [newReservation, setNewReservation] = useState<
        Omit<Reservation, 'id' | 'status'>
    >({
        name: '',
        date: '',
        time: '',
        guests: 1,
        tableId: 0,
        notes: '',
        contact: '',
    });

    const availableTables = useMemo(
        () => tables.filter((table) => table.status === 'available'),
        [tables],
    );

    const isDateBlocked = useCallback(
        (date: string, time?: string) => {
            return blockedDates.some((blockedDate) => {
                if (blockedDate.blocked_date !== date) return false;

                // If no specific time is provided, check if any timeslots exist (partial day block)
                if (!time) {
                    return (
                        blockedDate.timeslots &&
                        blockedDate.timeslots.length > 0
                    );
                }

                // Check if the specific time is in the blocked timeslots
                if (
                    blockedDate.timeslots &&
                    blockedDate.timeslots.includes(time)
                ) {
                    return true;
                }

                return false;
            });
        },
        [blockedDates],
    );

    const filteredReservations = useMemo(() => {
        return reservations
            .filter((reservation) => {
                const reservationDate = new Date(reservation.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return reservationDate >= today;
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.time}`);
                const dateB = new Date(`${b.date} ${b.time}`);
                return dateA.getTime() - dateB.getTime();
            });
    }, [reservations]);

    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'confirmed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    }, []);

    const handleSubmitReservation = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (
                newReservation.name &&
                newReservation.date &&
                newReservation.time &&
                newReservation.tableId
            ) {
                if (isDateBlocked(newReservation.date, newReservation.time)) {
                    alert(
                        'This time period is blocked and reservations are not available.',
                    );
                    return;
                }
                onAddReservation(newReservation);
                setNewReservation({
                    name: '',
                    date: '',
                    time: '',
                    guests: 1,
                    tableId: 0,
                    notes: '',
                    contact: '',
                });
            }
        },
        [newReservation, onAddReservation, isDateBlocked],
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 p-6 dark:border-orange-800 dark:from-orange-900/20 dark:to-red-900/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Reservation Management
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage customer reservations and bookings
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Total Reservations
                            </p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {reservations.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                        <Check className="mr-2 h-5 w-5 text-orange-500" />
                        Reservations
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {/* Add New Reservation Form */}
                    <div className="mb-6 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Add New Reservation
                        </h3>
                        <form onSubmit={handleSubmitReservation}>
                            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="reservationName">
                                        Name *
                                    </Label>
                                    <Input
                                        id="reservationName"
                                        value={newReservation.name}
                                        onChange={(e) =>
                                            setNewReservation({
                                                ...newReservation,
                                                name: e.target.value,
                                            })
                                        }
                                        required
                                        className="rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reservationContact">
                                        Contact Number
                                    </Label>
                                    <Input
                                        id="reservationContact"
                                        value={newReservation.contact}
                                        onChange={(e) =>
                                            setNewReservation({
                                                ...newReservation,
                                                contact: e.target.value,
                                            })
                                        }
                                        placeholder="Phone number"
                                        className="rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reservationDate">
                                        Date *
                                    </Label>
                                    <Input
                                        id="reservationDate"
                                        type="date"
                                        value={newReservation.date}
                                        onChange={(e) =>
                                            setNewReservation({
                                                ...newReservation,
                                                date: e.target.value,
                                            })
                                        }
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                        required
                                        className="rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reservationTime">
                                        Time *
                                    </Label>
                                    <Input
                                        id="reservationTime"
                                        type="time"
                                        value={newReservation.time}
                                        onChange={(e) =>
                                            setNewReservation({
                                                ...newReservation,
                                                time: e.target.value,
                                            })
                                        }
                                        required
                                        className="rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reservationGuests">
                                        Number of Guests *
                                    </Label>
                                    <Input
                                        id="reservationGuests"
                                        type="number"
                                        min="1"
                                        value={newReservation.guests}
                                        onChange={(e) =>
                                            setNewReservation({
                                                ...newReservation,
                                                guests: parseInt(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        required
                                        className="rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="reservationTable">
                                        Table *
                                    </Label>
                                    <Select
                                        value={newReservation.tableId.toString()}
                                        onValueChange={(value) =>
                                            setNewReservation({
                                                ...newReservation,
                                                tableId: parseInt(value),
                                            })
                                        }
                                    >
                                        <SelectTrigger className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                            <SelectValue placeholder="Select table" />
                                        </SelectTrigger>
                                        <SelectContent className="border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
                                            {availableTables.map((table) => (
                                                <SelectItem
                                                    key={table.id}
                                                    value={table.id.toString()}
                                                    className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                                >
                                                    {table.name} ({table.seats}{' '}
                                                    seats)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="reservationNotes">
                                        Notes
                                    </Label>
                                    <Input
                                        id="reservationNotes"
                                        value={newReservation.notes}
                                        onChange={(e) =>
                                            setNewReservation({
                                                ...newReservation,
                                                notes: e.target.value,
                                            })
                                        }
                                        placeholder="Special requests or additional information"
                                        className="rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl md:w-auto"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Reservation
                            </Button>
                        </form>
                    </div>

                    {/* Reservations List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Upcoming Reservations
                        </h3>

                        {filteredReservations.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No upcoming reservations found.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredReservations.map((reservation) => (
                                    <Card
                                        key={reservation.id}
                                        className="border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                                            {reservation.name}
                                                        </h4>
                                                        <span
                                                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(reservation.status)}`}
                                                        >
                                                            {reservation.status}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300 md:grid-cols-4">
                                                        <div>
                                                            <span className="font-medium">
                                                                Date:
                                                            </span>{' '}
                                                            {reservation.date}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">
                                                                Time:
                                                            </span>{' '}
                                                            {reservation.time}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">
                                                                Guests:
                                                            </span>{' '}
                                                            {reservation.guests}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">
                                                                Table:
                                                            </span>{' '}
                                                            {tables.find(
                                                                (t) =>
                                                                    t.id ===
                                                                    reservation.tableId,
                                                            )?.name || 'N/A'}
                                                        </div>
                                                    </div>
                                                    {reservation.contact && (
                                                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                                            <span className="font-medium">
                                                                Contact:
                                                            </span>{' '}
                                                            {
                                                                reservation.contact
                                                            }
                                                        </div>
                                                    )}
                                                    {reservation.notes && (
                                                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                                            <span className="font-medium">
                                                                Notes:
                                                            </span>{' '}
                                                            {reservation.notes}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4 flex gap-2">
                                                    {reservation.status ===
                                                        'pending' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    onConfirmReservation(
                                                                        reservation.id,
                                                                    )
                                                                }
                                                                className="bg-green-500 text-white hover:bg-green-600"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    onCancelReservation(
                                                                        reservation.id,
                                                                    )
                                                                }
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {reservation.status ===
                                                        'confirmed' && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                onCancelReservation(
                                                                    reservation.id,
                                                                )
                                                            }
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            onDeleteReservation(
                                                                reservation.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
