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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import axios from 'axios';

interface TravelBooking {
    id: number;
    customerName: string;
    packageId: number;
    travelDate: string;
    numberOfPeople: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled';
}

interface TravelPackage {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: string;
    inclusions: string[];
    type: 'Standard' | 'Premium' | 'Luxury';
}

interface Props {
    initialPackages: TravelPackage[];
    initialBookings: TravelBooking[];
}

export default function Travel({ initialPackages, initialBookings }: Props) {
    const [bookings, setBookings] = useState<TravelBooking[]>(initialBookings);
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState<TravelBooking | null>(null);
    const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [packages, setPackages] = useState<TravelPackage[]>(initialPackages);
    const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
    const [currentPackage, setCurrentPackage] = useState<TravelPackage | null>(null);

    const handleAddBooking = () => {
        setCurrentBooking(null);
        setIsBookingDialogOpen(true);
    };

    const handleEditBooking = (booking: TravelBooking) => {
        setCurrentBooking(booking);
        setIsBookingDialogOpen(true);
    };

    const handleDeleteBooking = async (id: number) => {
        try {
            await axios.delete(`/travel/bookings/${id}`);
            setBookings(bookings.filter(booking => booking.id !== id));
            setSelectedBookings(selectedBookings.filter(bookingId => bookingId !== id));
        } catch (error) {
            console.error('Error deleting booking:', error);
        }
    };

    const handleSaveBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentBooking) {
            try {
                if (currentBooking.id) {
                    const response = await axios.put(`/travel/bookings/${currentBooking.id}`, currentBooking);
                    setBookings(bookings.map(booking => 
                        booking.id === currentBooking.id ? response.data : booking
                    ));
                } else {
                    const response = await axios.post('/travel/bookings', currentBooking);
                    setBookings([...bookings, response.data]);
                }
                setIsBookingDialogOpen(false);
                setCurrentBooking(null);
            } catch (error) {
                console.error('Error saving booking:', error);
            }
        }
    };

    const handleAddPackage = () => {
        setCurrentPackage(null);
        setIsPackageDialogOpen(true);
    };

    const handleEditPackage = (pkg: TravelPackage) => {
        setCurrentPackage(pkg);
        setIsPackageDialogOpen(true);
    };

    const handleDeletePackage = async (id: number) => {
        try {
            await axios.delete(`/travel/packages/${id}`);
            setPackages(packages.filter(pkg => pkg.id !== id));
        } catch (error) {
            console.error('Error deleting package:', error);
        }
    };

    const handleSavePackage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentPackage) {
            try {
                if (currentPackage.id) {
                    const response = await axios.put(`/travel/packages/${currentPackage.id}`, currentPackage);
                    setPackages(packages.map(pkg => 
                        pkg.id === currentPackage.id ? response.data : pkg
                    ));
                } else {
                    const response = await axios.post('/travel/packages', currentPackage);
                    setPackages([...packages, response.data]);
                }
                setIsPackageDialogOpen(false);
                setCurrentPackage(null);
            } catch (error) {
                console.error('Error saving package:', error);
            }
        }
    };

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking =>
            booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.packageId.toString().includes(searchTerm.toLowerCase())
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

    const getPackageById = (packageId: number) => {
        return packages.find(pkg => pkg.id === packageId);
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
                <Tabs defaultValue="bookings" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="bookings">Bookings</TabsTrigger>
                        <TabsTrigger value="packages">Packages</TabsTrigger>
                    </TabsList>

                    <TabsContent value="bookings">
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
                                            <TableHead>Package</TableHead>
                                            <TableHead>Package Type</TableHead>
                                            <TableHead>Travel Date</TableHead>
                                            <TableHead>People</TableHead>
                                            <TableHead>Total Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedBookings.map((booking) => {
                                            const packageDetails = getPackageById(booking.packageId);
                                            return (
                                                <TableRow key={booking.id}>
                                                    <TableCell>{booking.customerName}</TableCell>
                                                    <TableCell>{packageDetails?.name}</TableCell>
                                                    <TableCell>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            packageDetails?.type === 'Premium' ? 'bg-purple-100 text-purple-800' :
                                                            packageDetails?.type === 'Luxury' ? 'bg-indigo-100 text-indigo-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {packageDetails?.type}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>{booking.travelDate}</TableCell>
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
                                            );
                                        })}
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
                                            <Label htmlFor="package" className="text-right">Package</Label>
                                            <Select
                                                value={currentBooking?.packageId?.toString() || ''}
                                                onValueChange={(value) => {
                                                    const selectedPackage = packages.find(pkg => pkg.id === parseInt(value));
                                                    setCurrentBooking({ 
                                                        ...currentBooking!, 
                                                        packageId: parseInt(value),
                                                        totalPrice: (selectedPackage?.price || 0) * (currentBooking?.numberOfPeople || 1)
                                                    });
                                                }}
                                            >
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Select package" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {packages.map((pkg) => (
                                                        <SelectItem key={pkg.id} value={pkg.id.toString()}>
                                                            {pkg.name} - ₱{pkg.price.toLocaleString()}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="numberOfPeople" className="text-right">Number of People</Label>
                                            <Input
                                                id="numberOfPeople"
                                                type="number"
                                                min="1"
                                                value={currentBooking?.numberOfPeople || ''}
                                                onChange={(e) => {
                                                    const people = parseInt(e.target.value);
                                                    const selectedPackage = packages.find(pkg => pkg.id === currentBooking?.packageId);
                                                    setCurrentBooking({ 
                                                        ...currentBooking!, 
                                                        numberOfPeople: people,
                                                        totalPrice: (selectedPackage?.price || 0) * people
                                                    });
                                                }}
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
                    </TabsContent>

                    <TabsContent value="packages">
                        <Card>
                            <CardHeader>
                                <CardTitle>Package Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between mb-4">
                                    <Button onClick={handleAddPackage}>
                                        <Plus className="mr-2 h-4 w-4" /> New Package
                                    </Button>
                                </div>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {packages.map((pkg) => (
                                            <TableRow key={pkg.id}>
                                                <TableCell>{pkg.name}</TableCell>
                                                <TableCell>{pkg.duration}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        pkg.type === 'Premium' ? 'bg-purple-100 text-purple-800' :
                                                        pkg.type === 'Luxury' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {pkg.type}
                                                    </span>
                                                </TableCell>
                                                <TableCell>₱{pkg.price.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm" className="mr-2" 
                                                        onClick={() => handleEditPackage(pkg)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </Button>
                                                    <Button variant="destructive" size="sm" 
                                                        onClick={() => handleDeletePackage(pkg.id)}>
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{currentPackage?.id ? 'Edit Package' : 'New Package'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSavePackage}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Package Name</Label>
                                    <Input
                                        id="name"
                                        value={currentPackage?.name || ''}
                                        onChange={(e) => setCurrentPackage({ ...currentPackage!, name: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="duration" className="text-right">Duration</Label>
                                    <Input
                                        id="duration"
                                        value={currentPackage?.duration || ''}
                                        onChange={(e) => setCurrentPackage({ ...currentPackage!, duration: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="type" className="text-right">Type</Label>
                                    <Select
                                        value={currentPackage?.type || ''}
                                        onValueChange={(value: 'Standard' | 'Premium' | 'Luxury') => 
                                            setCurrentPackage({ ...currentPackage!, type: value })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Standard">Standard</SelectItem>
                                            <SelectItem value="Premium">Premium</SelectItem>
                                            <SelectItem value="Luxury">Luxury</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="price" className="text-right">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={currentPackage?.price || ''}
                                        onChange={(e) => setCurrentPackage({ ...currentPackage!, price: Number(e.target.value) })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">Description</Label>
                                    <Input
                                        id="description"
                                        value={currentPackage?.description || ''}
                                        onChange={(e) => setCurrentPackage({ ...currentPackage!, description: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save Package</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
