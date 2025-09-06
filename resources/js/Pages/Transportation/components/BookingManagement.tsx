import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/Components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Calendar as CalendarComponent } from '@/Components/ui/calendar';
import PaymentDialog from './PaymentDialog';
import BookingCalendar from './BookingCalendar';
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
    AlertTriangle,
    Truck,
    CreditCard,
    DollarSign,
    Plus,
    FileText,
    CalendarDays,
    List
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
    const [showAddBookingDialog, setShowAddBookingDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Pending');
    const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
    const [trucks, setTrucks] = useState<any[]>([]);
    const [pickupCalendarOpen, setPickupCalendarOpen] = useState(false);
    const [deliveryCalendarOpen, setDeliveryCalendarOpen] = useState(false);
    const [updateForm, setUpdateForm] = useState({
        status: '',
        notes: '',
        estimated_cost: 0
    });
    const [addBookingForm, setAddBookingForm] = useState({
        truck_id: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_company: '',
        pickup_location: '',
        delivery_location: '',
        pickup_date: '',
        pickup_time: '',
        delivery_date: '',
        delivery_time: '',
        cargo_description: '',
        cargo_weight: '',
        cargo_unit: 'kg',
        special_requirements: ''
    });

    useEffect(() => {
        fetchBookings();
        fetchStats();
        fetchTrucks();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/transportation/bookings/list');
            
            // Handle different response structures
            if (Array.isArray(response.data)) {
                setBookings(response.data);
            } else if (response.data && Array.isArray(response.data.data)) {
                setBookings(response.data.data);
            } else {
                console.error('Unexpected response structure:', response.data);
                setBookings([]);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('/transportation/bookings/stats');
            
            // Handle different response structures
            if (response.data && typeof response.data === 'object') {
                setStats(response.data);
            } else {
                console.error('Unexpected stats response structure:', response.data);
                setStats(null);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setStats(null);
        }
    };

    const fetchTrucks = async () => {
        try {
            const response = await axios.get('/transportation/fleet/list');
            
            // Handle different response structures
            if (Array.isArray(response.data)) {
                setTrucks(response.data);
            } else if (response.data && Array.isArray(response.data.data)) {
                setTrucks(response.data.data);
            } else {
                console.error('Unexpected trucks response structure:', response.data);
                setTrucks([]);
            }
        } catch (error) {
            console.error('Failed to fetch trucks:', error);
            setTrucks([]);
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

    const handleDeleteBooking = (booking: Booking) => {
        setBookingToDelete(booking);
        setShowDeleteDialog(true);
    };

    const confirmDeleteBooking = async () => {
        if (!bookingToDelete) return;

        // Only allow deletion of pending bookings
        if (bookingToDelete.status !== 'Pending') {
            alert('Only pending bookings can be deleted.');
            setShowDeleteDialog(false);
            setBookingToDelete(null);
            return;
        }

        try {
            await axios.delete(`/transportation/bookings/${bookingToDelete.id}`);
            fetchBookings();
            fetchStats();
            setShowDeleteDialog(false);
            setBookingToDelete(null);
        } catch (error) {
            console.error('Failed to delete booking:', error);
        }
    };

    const handleAddBooking = async () => {
        // Validate required fields
        const requiredFields = [
            'truck_id', 'customer_name', 'customer_email', 'customer_phone',
            'pickup_location', 'delivery_location', 'pickup_date', 'pickup_time',
            'delivery_date', 'delivery_time', 'cargo_description', 'cargo_weight'
        ];

        const missingFields = requiredFields.filter(field => !addBookingForm[field as keyof typeof addBookingForm]);
        
        if (missingFields.length > 0) {
            alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(addBookingForm.customer_email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Validate weight is a positive number
        const weight = parseFloat(addBookingForm.cargo_weight);
        if (isNaN(weight) || weight <= 0) {
            alert('Please enter a valid weight greater than 0');
            return;
        }

        // Validate delivery date is after pickup date
        if (new Date(addBookingForm.delivery_date) < new Date(addBookingForm.pickup_date)) {
            alert('Delivery date must be after pickup date');
            return;
        }

        try {
            const formData = {
                ...addBookingForm,
                truck_id: parseInt(addBookingForm.truck_id),
                cargo_weight: weight
            };

            await axios.post('/transportation/bookings', formData);
            setShowAddBookingDialog(false);
            setAddBookingForm({
                truck_id: '',
                customer_name: '',
                customer_email: '',
                customer_phone: '',
                customer_company: '',
                pickup_location: '',
                delivery_location: '',
                pickup_date: '',
                pickup_time: '',
                delivery_date: '',
                delivery_time: '',
                cargo_description: '',
                cargo_weight: '',
                cargo_unit: 'kg',
                special_requirements: ''
            });
            fetchBookings();
            fetchStats();
        } catch (error: any) {
            console.error('Failed to create booking:', error);
            
            let errorMessage = 'Failed to create booking. Please try again.';
            
            if (error.response) {
                const responseData = error.response.data;
                if (responseData.message) {
                    errorMessage = responseData.message;
                }
                if (responseData.errors) {
                    const validationErrors = Object.values(responseData.errors).flat();
                    errorMessage = `Validation errors: ${validationErrors.join(', ')}`;
                }
            } else if (error.request) {
                errorMessage = 'Unable to connect to the server. Please check your connection.';
            }
            
            alert(errorMessage);
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

    const filteredBookings = (Array.isArray(bookings) ? bookings : []).filter(booking => {
        const matchesSearch = 
            booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.booking_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.pickup_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.delivery_location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getBookingsForDate = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        return filteredBookings.filter(booking => 
            booking.pickup_date === dateString || booking.delivery_date === dateString
        );
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        
        // Handle different time formats
        let time;
        if (timeString.includes(':')) {
            // If it's already in HH:MM format
            const [hours, minutes] = timeString.split(':');
            time = new Date();
            time.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
            // If it's a full datetime string
            time = new Date(timeString);
        }
        
        return time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const formatDateForDisplay = (dateString: string) => {
        if (!dateString) return '';
        // Create date in local timezone to avoid timezone issues
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handlePickupDateSelect = (date: Date | undefined) => {
        if (date) {
            // Use local timezone to avoid date shifting
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            setAddBookingForm({...addBookingForm, pickup_date: formattedDate});
            setPickupCalendarOpen(false);
        }
    };

    const handleDeliveryDateSelect = (date: Date | undefined) => {
        if (date) {
            // Use local timezone to avoid date shifting
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            setAddBookingForm({...addBookingForm, delivery_date: formattedDate});
            setDeliveryCalendarOpen(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Booking Management</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Manage transportation bookings and reservations</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredBookings.length} bookings
                        </div>
                        <Button 
                            onClick={() => setShowAddBookingDialog(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Booking
                        </Button>
                    </div>
                </div>
            </div>
            <div className="p-6">
                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_bookings}</div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">Total Bookings</div>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending_bookings}</div>
                                <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed_bookings}</div>
                                <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.today_bookings}</div>
                                <div className="text-sm text-purple-600 dark:text-purple-400">Today</div>
                            </div>
                        </div>
                    )}

                    {/* Filters and View Toggle */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                                <Input
                                    placeholder="Search bookings..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
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
                            <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-2 ${viewMode === 'table' ? 'bg-orange-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('calendar')}
                                    className={`px-3 py-2 ${viewMode === 'calendar' ? 'bg-orange-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                >
                                    <CalendarDays className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Bookings View */}
                    {viewMode === 'table' ? (
                        /* Table View */
                        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                                <TableRow className="border-gray-200 dark:border-gray-700">
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Reference</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Customer</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Truck</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Pickup</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Delivery</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Cargo</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Payment</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Cost</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
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
                                        <TableRow key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                            <TableCell className="font-mono text-sm text-gray-900 dark:text-gray-100">
                                                {booking.booking_reference}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">{booking.customer_name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{booking.customer_email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Truck className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">{booking.truck.model}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{booking.truck.plate_number}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm text-gray-900 dark:text-gray-100">{formatDate(booking.pickup_date)}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(booking.pickup_time)}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm text-gray-900 dark:text-gray-100">{formatDate(booking.delivery_date)}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(booking.delivery_time)}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm text-gray-900 dark:text-gray-100">{booking.cargo_description}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
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
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {booking.estimated_cost ? formatCurrency(booking.estimated_cost) : 'TBD'}
                                                    </div>
                                                    {booking.paid_amount && (
                                                        <div className="text-sm text-green-600 dark:text-green-400">
                                                            Paid: {formatCurrency(booking.paid_amount)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setShowDetailsDialog(true);
                                                        }}
                                                        className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
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
                                                        className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-900/20"
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
                                                            className="h-8 w-8 p-0 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                                        >
                                                            <CreditCard className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    {booking.status === 'Pending' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteBooking(booking)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        </div>
                    ) : (
                        /* Calendar View */
                        <div className="space-y-6">
                            <BookingCalendar 
                                bookings={filteredBookings}
                                onDateClick={(date, bookings) => {
                                    // Handle date click - could show a popup or navigate to details
                                    console.log('Date clicked:', date, bookings);
                                }}
                            />
                            
                            {/* Booking Summary */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <CalendarDays className="w-5 h-5 text-orange-600" />
                                    Booking Summary
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                                            {filteredBookings.filter(b => b.status === 'Pending').length}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400 font-medium">Pending</div>
                                    </div>
                                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                            {filteredBookings.filter(b => b.status === 'Confirmed').length}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400 font-medium">Confirmed</div>
                                    </div>
                                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                                            {filteredBookings.filter(b => b.status === 'In Progress').length}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400 font-medium">In Progress</div>
                                    </div>
                                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                                            {filteredBookings.filter(b => b.status === 'Completed').length}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400 font-medium">Completed</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
            </div>

            {/* Booking Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-orange-600" />
                            Booking Details
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Complete information for booking {selectedBooking?.booking_reference}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="flex-1 overflow-y-auto space-y-8 pr-2">
                            {/* Header Section */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Booking Reference</Label>
                                        <div className="font-mono text-xl font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 px-3 py-2 rounded border border-gray-200 dark:border-gray-600">
                                            {selectedBooking.booking_reference}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</Label>
                                        <div className="flex items-center">
                                            {getStatusBadge(selectedBooking.status)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</Label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="text-gray-900 dark:text-gray-100">{selectedBooking.customer_name}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Address</Label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="text-gray-900 dark:text-gray-100">{selectedBooking.customer_email}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</Label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="text-gray-900 dark:text-gray-100">{selectedBooking.customer_phone}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Company</Label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <Building className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="text-gray-900 dark:text-gray-100">{selectedBooking.customer_company || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                    Location Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Pickup Location</Label>
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                            <span className="text-gray-900 dark:text-gray-100">{selectedBooking.pickup_location}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivery Location</Label>
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                            <span className="text-gray-900 dark:text-gray-100">{selectedBooking.delivery_location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                    Schedule Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Pickup Date & Time</Label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="text-gray-900 dark:text-gray-100">
                                                {formatDate(selectedBooking.pickup_date)} at {formatTime(selectedBooking.pickup_time)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivery Date & Time</Label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="text-gray-900 dark:text-gray-100">
                                                {formatDate(selectedBooking.delivery_date)} at {formatTime(selectedBooking.delivery_time)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cargo Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-indigo-600" />
                                    Cargo Details
                                </h3>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-start gap-3">
                                        <Package className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                        <div className="space-y-2">
                                            <div className="text-gray-900 dark:text-gray-100 font-medium">
                                                {selectedBooking.cargo_description}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Weight: <span className="font-semibold">{selectedBooking.cargo_weight} {selectedBooking.cargo_unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Special Requirements */}
                            {selectedBooking.special_requirements && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                        Special Requirements
                                    </h3>
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
                                            <span className="text-yellow-800 dark:text-yellow-200">{selectedBooking.special_requirements}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cost and Vehicle Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                    Cost & Vehicle Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Estimated Cost</Label>
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                            <div className="flex items-center gap-3">
                                                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                                    {selectedBooking.estimated_cost ? formatCurrency(selectedBooking.estimated_cost) : 'TBD'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Vehicle</Label>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-start gap-3">
                                                <Truck className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                                <div className="space-y-1">
                                                    <div className="text-gray-900 dark:text-gray-100 font-medium">
                                                        {selectedBooking.truck.model}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        Plate: {selectedBooking.truck.plate_number}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        Driver: {selectedBooking.truck.driver}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedBooking.notes && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-gray-600" />
                                        Additional Notes
                                    </h3>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-start gap-3">
                                            <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                            <span className="text-gray-900 dark:text-gray-100">{selectedBooking.notes}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Update Booking Dialog */}
            <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">Update Booking</DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Update the status and details for booking {selectedBooking?.booking_reference}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status
                            </Label>
                            <Select value={updateForm.status} onValueChange={(value) => setUpdateForm({...updateForm, status: value})}>
                                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    <SelectItem value="Pending" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Pending</SelectItem>
                                    <SelectItem value="Confirmed" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Confirmed</SelectItem>
                                    <SelectItem value="In Progress" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">In Progress</SelectItem>
                                    <SelectItem value="Completed" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Completed</SelectItem>
                                    <SelectItem value="Cancelled" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="estimated_cost" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Estimated Cost
                            </Label>
                            <Input
                                type="number"
                                value={updateForm.estimated_cost}
                                onChange={(e) => setUpdateForm({...updateForm, estimated_cost: parseFloat(e.target.value) || 0})}
                                placeholder="Enter estimated cost"
                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Notes
                            </Label>
                            <textarea
                                value={updateForm.notes}
                                onChange={(e) => setUpdateForm({...updateForm, notes: e.target.value})}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                rows={3}
                                placeholder="Add notes..."
                            />
                        </div>
                        <DialogFooter className="gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowUpdateDialog(false)}
                                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleUpdateBooking}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                Update Booking
                            </Button>
                        </DialogFooter>
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

            {/* Add Booking Dialog */}
            <Dialog open={showAddBookingDialog} onOpenChange={setShowAddBookingDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Booking</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Customer Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="customer_name">Customer Name *</Label>
                                    <Input
                                        id="customer_name"
                                        value={addBookingForm.customer_name}
                                        onChange={(e) => setAddBookingForm({...addBookingForm, customer_name: e.target.value})}
                                        placeholder="Enter customer name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customer_email">Email *</Label>
                                    <Input
                                        id="customer_email"
                                        type="email"
                                        value={addBookingForm.customer_email}
                                        onChange={(e) => setAddBookingForm({...addBookingForm, customer_email: e.target.value})}
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customer_phone">Phone *</Label>
                                    <Input
                                        id="customer_phone"
                                        value={addBookingForm.customer_phone}
                                        onChange={(e) => setAddBookingForm({...addBookingForm, customer_phone: e.target.value})}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="customer_company">Company</Label>
                                    <Input
                                        id="customer_company"
                                        value={addBookingForm.customer_company}
                                        onChange={(e) => setAddBookingForm({...addBookingForm, customer_company: e.target.value})}
                                        placeholder="Enter company name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Location Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="pickup_location">Pickup Location *</Label>
                                    <Input
                                        id="pickup_location"
                                        value={addBookingForm.pickup_location}
                                        onChange={(e) => setAddBookingForm({...addBookingForm, pickup_location: e.target.value})}
                                        placeholder="Enter pickup address"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="delivery_location">Delivery Location *</Label>
                                    <Input
                                        id="delivery_location"
                                        value={addBookingForm.delivery_location}
                                        onChange={(e) => setAddBookingForm({...addBookingForm, delivery_location: e.target.value})}
                                        placeholder="Enter delivery address"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Schedule Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Schedule Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="pickup_date">Pickup Date *</Label>
                                    <Popover open={pickupCalendarOpen} onOpenChange={setPickupCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {addBookingForm.pickup_date ? formatDateForDisplay(addBookingForm.pickup_date) : "Select pickup date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={addBookingForm.pickup_date ? new Date(addBookingForm.pickup_date + 'T00:00:00') : undefined}
                                                onSelect={handlePickupDateSelect}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <Label htmlFor="pickup_time">Pickup Time *</Label>
                                    <Input
                                        id="pickup_time"
                                        type="time"
                                        value={addBookingForm.pickup_time}
                                        onChange={(e) => setAddBookingForm({...addBookingForm, pickup_time: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="delivery_date">Delivery Date *</Label>
                                    <Popover open={deliveryCalendarOpen} onOpenChange={setDeliveryCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {addBookingForm.delivery_date ? formatDateForDisplay(addBookingForm.delivery_date) : "Select delivery date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={addBookingForm.delivery_date ? new Date(addBookingForm.delivery_date + 'T00:00:00') : undefined}
                                                onSelect={handleDeliveryDateSelect}
                                                disabled={(date) => {
                                                    const today = new Date(new Date().setHours(0, 0, 0, 0));
                                                    const pickupDate = addBookingForm.pickup_date ? new Date(addBookingForm.pickup_date + 'T00:00:00') : today;
                                                    return date < pickupDate;
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <Label htmlFor="delivery_time">Delivery Time *</Label>
                                    <Input
                                        id="delivery_time"
                                        type="time"
                                        value={addBookingForm.delivery_time}
                                        onChange={(e) => setAddBookingForm({...addBookingForm, delivery_time: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cargo Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Cargo Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="cargo_description">Cargo Description *</Label>
                                    <Input
                                        id="cargo_description"
                                        value={addBookingForm.cargo_description}
                                        onChange={(e) => setAddBookingForm({...addBookingForm, cargo_description: e.target.value})}
                                        placeholder="Describe the cargo"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="truck_id">Truck *</Label>
                                    <Select value={addBookingForm.truck_id} onValueChange={(value) => setAddBookingForm({...addBookingForm, truck_id: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a truck" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {trucks.map((truck) => (
                                                <SelectItem key={truck.id} value={truck.id.toString()}>
                                                    {truck.model} - {truck.plate_number} (Capacity: {truck.capacity}kg)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="cargo_weight">Weight *</Label>
                                    <Input
                                        id="cargo_weight"
                                        type="number"
                                        step="0.01"
                                        value={addBookingForm.cargo_weight}
                                        onChange={(e) => setAddBookingForm({...addBookingForm, cargo_weight: e.target.value})}
                                        placeholder="Enter weight"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="cargo_unit">Unit *</Label>
                                    <Select value={addBookingForm.cargo_unit} onValueChange={(value) => setAddBookingForm({...addBookingForm, cargo_unit: value})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                            <SelectItem value="tons">Tons</SelectItem>
                                            <SelectItem value="pieces">Pieces</SelectItem>
                                            <SelectItem value="pallets">Pallets</SelectItem>
                                            <SelectItem value="boxes">Boxes</SelectItem>
                                            <SelectItem value="liters">Liters</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="special_requirements">Special Requirements</Label>
                                <textarea
                                    id="special_requirements"
                                    value={addBookingForm.special_requirements}
                                    onChange={(e) => setAddBookingForm({...addBookingForm, special_requirements: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={3}
                                    placeholder="Any special handling requirements..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowAddBookingDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddBooking}>
                                Create Booking
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-gray-900 dark:text-gray-100">Delete Booking</DialogTitle>
                                <DialogDescription className="text-gray-600 dark:text-gray-400">
                                    This action cannot be undone.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Reference:</span>
                                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100">{bookingToDelete?.booking_reference}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer:</span>
                                    <span className="text-sm text-gray-900 dark:text-gray-100">{bookingToDelete?.customer_name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                                    <span className="text-sm text-gray-900 dark:text-gray-100">{bookingToDelete?.status}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pickup Date:</span>
                                    <span className="text-sm text-gray-900 dark:text-gray-100">{bookingToDelete?.pickup_date}</span>
                                </div>
                            </div>
                        </div>
                        {bookingToDelete?.status === 'Pending' ? (
                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-red-800 dark:text-red-200">
                                        <p className="font-medium">Warning: This will permanently delete the booking and all associated data.</p>
                                        <p className="mt-1">This action cannot be undone.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                        <p className="font-medium">Cannot Delete: Only pending bookings can be deleted.</p>
                                        <p className="mt-1">This booking has status: <span className="font-semibold">{bookingToDelete?.status}</span></p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setShowDeleteDialog(false);
                                setBookingToDelete(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={confirmDeleteBooking}
                            disabled={bookingToDelete?.status !== 'Pending'}
                            className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400 disabled:hover:bg-gray-400"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
