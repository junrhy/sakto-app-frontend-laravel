import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { Search, Truck, MapPin, Calendar, Clock, Package, User, Phone, Mail, Building } from 'lucide-react';

interface PageProps {
    identifier: string;
}

interface BookingDetails {
    id: number;
    booking_reference: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_company: string | null;
    pickup_location: string;
    delivery_location: string;
    pickup_date: string;
    pickup_time: string;
    delivery_date: string;
    delivery_time: string;
    cargo_description: string;
    cargo_weight: number | string;
    cargo_unit: string;
    special_requirements: string | null;
    estimated_cost: number | string;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    truck?: {
        id: number;
        plate_number: string;
        model: string;
        capacity: number;
        driver: string;
        driver_contact: string;
    };
    pricing_breakdown?: {
        base_rate: number | string;
        distance_rate: number | string;
        weight_rate: number | string;
        special_handling_rate: number | string;
        fuel_surcharge: number | string;
        peak_hour_surcharge: number | string;
        weekend_surcharge: number | string;
        holiday_surcharge: number | string;
        driver_overtime_rate: number | string;
        insurance_cost: number | string;
        toll_fees: number | string;
        parking_fees: number | string;
        config_used: string;
        config_version: string;
    };
}

const TrackBooking: React.FC<PageProps> = ({ identifier }) => {
    const [bookingReference, setBookingReference] = useState('');
    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleTrackBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingReference.trim()) {
            setError('Please enter a booking reference');
            return;
        }

        setLoading(true);
        setError('');
        setBooking(null);
        setSearched(true);

        try {
            const response = await axios.get(`/logistics/bookings/reference`, {
                params: { 
                    client_identifier: identifier,
                    booking_reference: bookingReference.trim() 
                }
            });

            if (response.data.success) {
                setBooking(response.data.data);
            } else {
                setError(response.data.message || 'Booking not found');
            }
        } catch (err: any) {
            console.error('Failed to fetch booking:', err);
            setError(err.response?.data?.message || 'Failed to fetch booking details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'Pending': { variant: 'secondary', color: 'bg-gray-100 text-gray-800' },
            'Confirmed': { variant: 'default', color: 'bg-blue-100 text-blue-800' },
            'In Progress': { variant: 'default', color: 'bg-yellow-100 text-yellow-800' },
            'Completed': { variant: 'default', color: 'bg-green-100 text-green-800' },
            'Cancelled': { variant: 'destructive', color: 'bg-red-100 text-red-800' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Pending'];

        return (
            <Badge className={config.color}>
                {status}
            </Badge>
        );
    };

    const formatCurrency = (amount: number | string | null | undefined) => {
        if (amount === null || amount === undefined || amount === '') {
            return '₱0';
        }
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numericAmount)) {
            return '₱0';
        }
        return `₱${numericAmount.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return timeString;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Head title="Track Booking - Logistics" />

            <div className="container mx-auto px-4 max-w-4xl">
                {/* Navigation Menu */}
                <div className="flex justify-center mb-6">
                    <div className="flex items-center space-x-4 bg-white rounded-lg shadow-sm px-4 py-2">
                        <Link
                            href={`/logistics/${identifier}`}
                            className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                            Book Trucks
                        </Link>
                        <Link
                            href={`/logistics/${identifier}/track`}
                            className="text-blue-700 hover:text-blue-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-blue-50"
                        >
                            Track Booking
                        </Link>
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Track Your Booking
                    </h1>
                    <p className="text-gray-600">
                        Enter your booking reference to check the status of your transportation booking
                    </p>
                </div>

                {/* Search Form */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Find Your Booking
                        </CardTitle>
                        <CardDescription>
                            Enter the booking reference number provided when you made your booking
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleTrackBooking} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="booking_reference">Booking Reference</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="booking_reference"
                                        type="text"
                                        placeholder="e.g., BK-2025-001234"
                                        value={bookingReference}
                                        onChange={(e) => setBookingReference(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Searching...' : 'Track Booking'}
                                    </Button>
                                </div>
                            </div>
                        </form>

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800">{error}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Booking Details */}
                {booking && (
                    <div className="space-y-6">
                        {/* Booking Status Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Booking #{booking.booking_reference}
                                        </CardTitle>
                                        <CardDescription>
                                            Created on {formatDate(booking.created_at)}
                                        </CardDescription>
                                    </div>
                                    {getStatusBadge(booking.status)}
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-500">Name</Label>
                                        <p className="font-medium">{booking.customer_name}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-500">Company</Label>
                                        <p className="font-medium">{booking.customer_company || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-500">Email</Label>
                                        <p className="font-medium flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            {booking.customer_email}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-500">Phone</Label>
                                        <p className="font-medium flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {booking.customer_phone}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trip Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Trip Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Pickup Location</Label>
                                            <p className="font-medium">{booking.pickup_location}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Delivery Location</Label>
                                            <p className="font-medium">{booking.delivery_location}</p>
                                        </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Pickup Date & Time</Label>
                                            <p className="font-medium flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(booking.pickup_date)} at {formatTime(booking.pickup_time)}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Delivery Date & Time</Label>
                                            <p className="font-medium flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(booking.delivery_date)} at {formatTime(booking.delivery_time)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cargo Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Cargo Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Description</Label>
                                            <p className="font-medium">{booking.cargo_description}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Weight</Label>
                                            <p className="font-medium">{booking.cargo_weight} {booking.cargo_unit}</p>
                                        </div>
                                    </div>
                                    {booking.special_requirements && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Special Requirements</Label>
                                            <p className="font-medium">{booking.special_requirements}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vehicle Information */}
                        {booking.truck && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="h-5 w-5" />
                                        Assigned Vehicle
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Plate Number</Label>
                                            <p className="font-medium">{booking.truck.plate_number}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Model</Label>
                                            <p className="font-medium">{booking.truck.model}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Capacity</Label>
                                            <p className="font-medium">{booking.truck.capacity} tons</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Driver</Label>
                                            <p className="font-medium">{booking.truck.driver || 'TBD'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pricing Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Pricing Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-semibold">Total Estimated Cost:</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {formatCurrency(booking.estimated_cost)}
                                        </span>
                                    </div>
                                    
                                    {booking.pricing_breakdown && (
                                        <>
                                            <Separator />
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-gray-700">Cost Breakdown:</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span>Base Rate:</span>
                                                        <span>{formatCurrency(booking.pricing_breakdown.base_rate)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Distance Rate:</span>
                                                        <span>{formatCurrency(booking.pricing_breakdown.distance_rate)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Weight Rate:</span>
                                                        <span>{formatCurrency(booking.pricing_breakdown.weight_rate)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Special Handling:</span>
                                                        <span>{formatCurrency(booking.pricing_breakdown.special_handling_rate)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Fuel Surcharge:</span>
                                                        <span>{formatCurrency(booking.pricing_breakdown.fuel_surcharge)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Additional Costs:</span>
                                                        <span>{formatCurrency(
                                                            (typeof booking.pricing_breakdown.insurance_cost === 'string' ? parseFloat(booking.pricing_breakdown.insurance_cost) : booking.pricing_breakdown.insurance_cost || 0) +
                                                            (typeof booking.pricing_breakdown.toll_fees === 'string' ? parseFloat(booking.pricing_breakdown.toll_fees) : booking.pricing_breakdown.toll_fees || 0) +
                                                            (typeof booking.pricing_breakdown.parking_fees === 'string' ? parseFloat(booking.pricing_breakdown.parking_fees) : booking.pricing_breakdown.parking_fees || 0)
                                                        )}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {booking.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700">{booking.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* No Results Message */}
                {searched && !booking && !loading && !error && (
                    <Card>
                        <CardContent className="text-center py-8">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Booking Found</h3>
                            <p className="text-gray-600">
                                We couldn't find a booking with the reference number you provided. 
                                Please check the reference number and try again.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default TrackBooking;
