import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import PaymentDialog from './PaymentDialog';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Package, 
    User, 
    Phone, 
    Mail, 
    Building,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    AlertCircle,
    Truck,
    CreditCard,
    DollarSign
} from 'lucide-react';

interface Booking {
    id: number;
    booking_reference: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_company: string;
    pickup_location: string;
    delivery_location: string;
    pickup_date: string;
    pickup_time: string;
    delivery_date: string;
    delivery_time: string;
    cargo_description: string;
    cargo_weight: number;
    cargo_unit: string;
    special_requirements: string;
    estimated_cost: number;
    status: string;
    notes: string;
    payment_status: string;
    payment_method?: string;
    payment_reference?: string;
    paid_amount?: number;
    payment_date?: string;
    payment_notes?: string;
    created_at: string;
    updated_at: string;
    truck: {
        id: number;
        plate_number: string;
        model: string;
        capacity: number;
        driver: string;
    };
}

interface BookingStats {
    total_bookings: number;
    pending_bookings: number;
    confirmed_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
    today_bookings: number;
    upcoming_bookings: number;
}

export default function BookingManagement() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<BookingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [updateForm, setUpdateForm] = useState({
        status: '',
        notes: '',
        estimated_cost: 0
    });

    useEffect(() => {
        fetchBookings();
        fetchStats();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/transportation/bookings/list');
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('/transportation/bookings/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleUpdateBooking = async () => {
        if (!selectedBooking) return;

        try {
            await axios.put(`/transportation/bookings/${selectedBooking.id}`, updateForm);
            setShowUpdateDialog(false);
            fetchBookings();
            fetchStats();
        } catch (error) {
            console.error('Failed to update booking:', error);
        }
    };

    const handleDeleteBooking = async (bookingId: number) => {
        if (!confirm('Are you sure you want to delete this booking?')) return;

        try {
            await axios.delete(`/transportation/bookings/${bookingId}`);
            fetchBookings();
            fetchStats();
        } catch (error) {
            console.error('Failed to delete booking:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
            'Confirmed': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
            'In Progress': { color: 'bg-purple-100 text-purple-800', icon: Clock },
            'Completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'Cancelled': { color: 'bg-red-100 text-red-800', icon: XCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Pending'];
        const Icon = config.icon;

        return (
            <Badge className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {status}
            </Badge>
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
            'paid': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'failed': { color: 'bg-red-100 text-red-800', icon: XCircle },
            'refunded': { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['pending'];
        const Icon = config.icon;

        return (
            <Badge className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = 
            booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.booking_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.pickup_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.delivery_location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatTime = (timeString: string) => {
        return timeString;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Booking Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{stats.total_bookings}</div>
                                <div className="text-sm text-blue-600">Total Bookings</div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">{stats.pending_bookings}</div>
                                <div className="text-sm text-yellow-600">Pending</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{stats.completed_bookings}</div>
                                <div className="text-sm text-green-600">Completed</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{stats.today_bookings}</div>
                                <div className="text-sm text-purple-600">Today</div>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search bookings..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Truck</TableHead>
                                    <TableHead>Pickup</TableHead>
                                    <TableHead>Delivery</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8">
                                            Loading bookings...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredBookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8">
                                            No bookings found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-mono text-sm">
                                                {booking.booking_reference}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{booking.customer_name}</div>
                                                    <div className="text-sm text-gray-500">{booking.customer_email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Truck className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <div className="font-medium">{booking.truck.model}</div>
                                                        <div className="text-sm text-gray-500">{booking.truck.plate_number}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm">{formatDate(booking.pickup_date)}</div>
                                                    <div className="text-xs text-gray-500">{formatTime(booking.pickup_time)}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm">{formatDate(booking.delivery_date)}</div>
                                                    <div className="text-xs text-gray-500">{formatTime(booking.delivery_time)}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm">{booking.cargo_description}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {booking.cargo_weight} {booking.cargo_unit}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(booking.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {getPaymentStatusBadge(booking.payment_status)}
                                                    {booking.payment_method && (
                                                        <div className="text-xs text-gray-500">
                                                            {booking.payment_method.replace('_', ' ').toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium">
                                                        {booking.estimated_cost ? formatCurrency(booking.estimated_cost) : 'TBD'}
                                                    </div>
                                                    {booking.paid_amount && (
                                                        <div className="text-sm text-green-600">
                                                            Paid: {formatCurrency(booking.paid_amount)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setShowDetailsDialog(true);
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setUpdateForm({
                                                                status: booking.status,
                                                                notes: booking.notes || '',
                                                                estimated_cost: booking.estimated_cost || 0
                                                            });
                                                            setShowUpdateDialog(true);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    {booking.payment_status !== 'paid' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedBooking(booking);
                                                                setShowPaymentDialog(true);
                                                            }}
                                                            className="text-green-600 hover:text-green-700"
                                                        >
                                                            <CreditCard className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteBooking(booking.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Booking Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Booking Reference</Label>
                                    <div className="font-mono text-lg">{selectedBooking.booking_reference}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                                    <div>{getStatusBadge(selectedBooking.status)}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Customer Name</Label>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        {selectedBooking.customer_name}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        {selectedBooking.customer_email}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        {selectedBooking.customer_phone}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Company</Label>
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-gray-400" />
                                        {selectedBooking.customer_company || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Pickup Location</Label>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                        <div>{selectedBooking.pickup_location}</div>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Delivery Location</Label>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                        <div>{selectedBooking.delivery_location}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Pickup Date & Time</Label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {formatDate(selectedBooking.pickup_date)} at {formatTime(selectedBooking.pickup_time)}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Delivery Date & Time</Label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {formatDate(selectedBooking.delivery_date)} at {formatTime(selectedBooking.delivery_time)}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-500">Cargo Details</Label>
                                <div className="flex items-start gap-2">
                                    <Package className="w-4 h-4 text-gray-400 mt-1" />
                                    <div>
                                        <div>{selectedBooking.cargo_description}</div>
                                        <div className="text-sm text-gray-500">
                                            Weight: {selectedBooking.cargo_weight} {selectedBooking.cargo_unit}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedBooking.special_requirements && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Special Requirements</Label>
                                    <div>{selectedBooking.special_requirements}</div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Estimated Cost</Label>
                                    <div className="text-lg font-semibold">
                                        {selectedBooking.estimated_cost ? formatCurrency(selectedBooking.estimated_cost) : 'TBD'}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Truck Details</Label>
                                    <div>
                                        <div>{selectedBooking.truck.model}</div>
                                        <div className="text-sm text-gray-500">
                                            {selectedBooking.truck.plate_number} • Driver: {selectedBooking.truck.driver}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedBooking.notes && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Notes</Label>
                                    <div>{selectedBooking.notes}</div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Update Booking Dialog */}
            <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Booking</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={updateForm.status} onValueChange={(value) => setUpdateForm({...updateForm, status: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="estimated_cost">Estimated Cost</Label>
                            <Input
                                type="number"
                                value={updateForm.estimated_cost}
                                onChange={(e) => setUpdateForm({...updateForm, estimated_cost: parseFloat(e.target.value) || 0})}
                                placeholder="Enter estimated cost"
                            />
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                value={updateForm.notes}
                                onChange={(e) => setUpdateForm({...updateForm, notes: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                rows={3}
                                placeholder="Add notes..."
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateBooking}>
                                Update Booking
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Payment Dialog */}
            <PaymentDialog
                isOpen={showPaymentDialog}
                onClose={() => setShowPaymentDialog(false)}
                booking={selectedBooking}
                onPaymentSuccess={() => {
                    fetchBookings();
                    fetchStats();
                }}
            />
        </div>
    );
}
