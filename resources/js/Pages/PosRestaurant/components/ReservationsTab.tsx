import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Plus, Edit, Trash, Check, X } from "lucide-react";
import { Reservation, Table as TableType, BlockedDate } from '../types';

interface ReservationsTabProps {
    reservations: Reservation[];
    tables: TableType[];
    blockedDates?: BlockedDate[];
    currency_symbol: string;
    onAddReservation: (reservation: Omit<Reservation, 'id' | 'status'>) => void;
    onUpdateReservation: (id: number, reservation: Partial<Reservation>) => void;
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
    const [newReservation, setNewReservation] = useState<Omit<Reservation, 'id' | 'status'>>({
        name: '',
        date: '',
        time: '',
        guests: 1,
        tableId: 0,
        notes: '',
        contact: ''
    });

    const availableTables = useMemo(() => 
        tables.filter(table => table.status === 'available'),
        [tables]
    );

    const isDateBlocked = useCallback((date: string, time?: string) => {
        return blockedDates.some(blockedDate => {
            if (blockedDate.blocked_date !== date) return false;
            
            // If no specific time is provided, check if any timeslots exist (partial day block)
            if (!time) {
                return blockedDate.timeslots && blockedDate.timeslots.length > 0;
            }
            
            // Check if the specific time is in the blocked timeslots
            if (blockedDate.timeslots && blockedDate.timeslots.includes(time)) {
                return true;
            }
            
            return false;
        });
    }, [blockedDates]);

    const filteredReservations = useMemo(() => {
        return reservations.filter(reservation => {
            const reservationDate = new Date(reservation.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return reservationDate >= today;
        }).sort((a, b) => {
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

    const handleSubmitReservation = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (newReservation.name && newReservation.date && newReservation.time && newReservation.tableId) {
            if (isDateBlocked(newReservation.date, newReservation.time)) {
                alert('This time period is blocked and reservations are not available.');
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
                contact: ''
            });
        }
    }, [newReservation, onAddReservation, isDateBlocked]);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reservation Management</h2>
                        <p className="text-gray-600 dark:text-gray-400">Manage customer reservations and bookings</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Reservations</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{reservations.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                    <CardTitle className="text-gray-900 dark:text-white flex items-center">
                        <Check className="w-5 h-5 mr-2 text-orange-500" />
                        Reservations
                    </CardTitle>
                </CardHeader>
            <CardContent className="p-6">
                {/* Add New Reservation Form */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mb-6 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Reservation</h3>
                    <form onSubmit={handleSubmitReservation}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label htmlFor="reservationName">Name *</Label>
                            <Input
                                id="reservationName"
                                value={newReservation.name}
                                onChange={(e) => setNewReservation({ ...newReservation, name: e.target.value })}
                                required
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                            />
                        </div>
                        <div>
                            <Label htmlFor="reservationContact">Contact Number</Label>
                            <Input
                                id="reservationContact"
                                value={newReservation.contact}
                                onChange={(e) => setNewReservation({ ...newReservation, contact: e.target.value })}
                                placeholder="Phone number"
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                            />
                        </div>
                        <div>
                            <Label htmlFor="reservationDate">Date *</Label>
                            <Input
                                id="reservationDate"
                                type="date"
                                value={newReservation.date}
                                onChange={(e) => setNewReservation({ ...newReservation, date: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                required
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                            />
                        </div>
                        <div>
                            <Label htmlFor="reservationTime">Time *</Label>
                            <Input
                                id="reservationTime"
                                type="time"
                                value={newReservation.time}
                                onChange={(e) => setNewReservation({ ...newReservation, time: e.target.value })}
                                required
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                            />
                        </div>
                        <div>
                            <Label htmlFor="reservationGuests">Number of Guests *</Label>
                            <Input
                                id="reservationGuests"
                                type="number"
                                min="1"
                                value={newReservation.guests}
                                onChange={(e) => setNewReservation({ ...newReservation, guests: parseInt(e.target.value) })}
                                required
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                            />
                        </div>
                        <div>
                            <Label htmlFor="reservationTable">Table *</Label>
                            <Select 
                                value={newReservation.tableId.toString()} 
                                onValueChange={(value) => setNewReservation({ ...newReservation, tableId: parseInt(value) })}
                            >
                                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                    <SelectValue placeholder="Select table" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                    {availableTables.map((table) => (
                                        <SelectItem key={table.id} value={table.id.toString()} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">
                                            {table.name} ({table.seats} seats)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="reservationNotes">Notes</Label>
                            <Input
                                id="reservationNotes"
                                value={newReservation.notes}
                                onChange={(e) => setNewReservation({ ...newReservation, notes: e.target.value })}
                                placeholder="Special requests or additional information"
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 rounded-lg shadow-sm focus:shadow-md transition-all"
                            />
                        </div>
                    </div>
                        <Button 
                            type="submit"
                            className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Reservation
                        </Button>
                    </form>
                </div>

                {/* Reservations List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Reservations</h3>
                    
                    {filteredReservations.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">No upcoming reservations found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredReservations.map((reservation) => (
                                <Card key={reservation.id} className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{reservation.name}</h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                                                        {reservation.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <div>
                                                        <span className="font-medium">Date:</span> {reservation.date}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Time:</span> {reservation.time}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Guests:</span> {reservation.guests}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Table:</span> {tables.find(t => t.id === reservation.tableId)?.name || 'N/A'}
                                                    </div>
                                                </div>
                                                {reservation.contact && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                        <span className="font-medium">Contact:</span> {reservation.contact}
                                                    </div>
                                                )}
                                                {reservation.notes && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                        <span className="font-medium">Notes:</span> {reservation.notes}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                {reservation.status === 'pending' && (
                                                    <>
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => onConfirmReservation(reservation.id)}
                                                            className="bg-green-500 hover:bg-green-600 text-white"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="destructive"
                                                            onClick={() => onCancelReservation(reservation.id)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                {reservation.status === 'confirmed' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="destructive"
                                                        onClick={() => onCancelReservation(reservation.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => onDeleteReservation(reservation.id)}
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
