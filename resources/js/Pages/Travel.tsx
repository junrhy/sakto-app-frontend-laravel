import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Plus, Edit, Trash, Search, Plane } from "lucide-react";
import { Checkbox } from "@/Components/ui/checkbox";

interface TravelBooking {
    id: number;
    customerName: string;
    destination: string;
    travelDate: string;
    packageType: string;
    numberOfPeople: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled';
}

const INITIAL_BOOKINGS: TravelBooking[] = [
    {
        id: 1,
        customerName: "John Smith",
        destination: "Boracay",
        travelDate: "2024-04-15",
        packageType: "Premium",
        numberOfPeople: 2,
        totalPrice: 25000,
        status: 'confirmed'
    },
    {
        id: 2,
        customerName: "Maria Santos",
        destination: "Palawan",
        travelDate: "2024-05-01",
        packageType: "Standard",
        numberOfPeople: 4,
        totalPrice: 40000,
        status: 'pending'
    }
];

export default function Travel() {
    const [bookings, setBookings] = useState<TravelBooking[]>(INITIAL_BOOKINGS);
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState<TravelBooking | null>(null);
    const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleAddBooking = () => {
        setCurrentBooking(null);
        setIsBookingDialogOpen(true);
    };

    const handleEditBooking = (booking: TravelBooking) => {
        setCurrentBooking(booking);
        setIsBookingDialogOpen(true);
    };

    const handleDeleteBooking = (id: number) => {
        setBookings(bookings.filter(booking => booking.id !== id));
        setSelectedBookings(selectedBookings.filter(bookingId => bookingId !== id));
    };

    const handleSaveBooking = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentBooking) {
            if (currentBooking.id) {
                setBookings(bookings.map(booking => 
                    booking.id === currentBooking.id ? currentBooking : booking
                ));
            } else {
                setBookings([...bookings, { ...currentBooking, id: Date.now() }]);
            }
        }
        setIsBookingDialogOpen(false);
        setCurrentBooking(null);
    };

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking =>
            booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.destination.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [bookings, searchTerm]);

    const paginatedBookings = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredBookings, currentPage]);

    const pageCount = Math.ceil(filteredBookings.length / itemsPerPage);

    const calculateTotalRevenue = () => {
        return bookings.reduce((total, booking) => total + booking.totalPrice, 0);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Travel Management
                </h2>
            }
        >
            <Head title="Travel Management" />

            <div className="p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>Travel Bookings Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold">${calculateTotalRevenue().toLocaleString()}</div>
                                <div className="text-gray-500">Total Revenue</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{bookings.length}</div>
                                <div className="text-gray-500">Total Bookings</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    {bookings.filter(b => b.status === 'pending').length}
                                </div>
                                <div className="text-gray-500">Pending Bookings</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Booking Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between mb-4">
                            <Button onClick={handleAddBooking}>
                                <Plus className="mr-2 h-4 w-4" /> New Booking
                            </Button>
                            <div className="flex items-center space-x-2">
                                <Search className="h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search bookings..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64"
                                />
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer Name</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Travel Date</TableHead>
                                    <TableHead>Package</TableHead>
                                    <TableHead>People</TableHead>
                                    <TableHead>Total Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedBookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell>{booking.customerName}</TableCell>
                                        <TableCell>{booking.destination}</TableCell>
                                        <TableCell>{booking.travelDate}</TableCell>
                                        <TableCell>{booking.packageType}</TableCell>
                                        <TableCell>{booking.numberOfPeople}</TableCell>
                                        <TableCell>₱{booking.totalPrice.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" className="mr-2" 
                                                onClick={() => handleEditBooking(booking)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" 
                                                onClick={() => handleDeleteBooking(booking.id)}>
                                                <Trash className="mr-2 h-4 w-4" /> Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex justify-between items-center mt-4">
                            <div>
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                                    disabled={currentPage === pageCount}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{currentBooking?.id ? 'Edit Booking' : 'New Booking'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveBooking}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="customerName" className="text-right">Customer Name</Label>
                                    <Input
                                        id="customerName"
                                        value={currentBooking?.customerName || ''}
                                        onChange={(e) => setCurrentBooking({ ...currentBooking!, customerName: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="destination" className="text-right">Destination</Label>
                                    <Input
                                        id="destination"
                                        value={currentBooking?.destination || ''}
                                        onChange={(e) => setCurrentBooking({ ...currentBooking!, destination: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="travelDate" className="text-right">Travel Date</Label>
                                    <Input
                                        id="travelDate"
                                        type="date"
                                        value={currentBooking?.travelDate || ''}
                                        onChange={(e) => setCurrentBooking({ ...currentBooking!, travelDate: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="status" className="text-right">Status</Label>
                                    <Select
                                        value={currentBooking?.status || ''}
                                        onValueChange={(value: 'pending' | 'confirmed' | 'cancelled') => 
                                            setCurrentBooking({ ...currentBooking!, status: value })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save Booking</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
