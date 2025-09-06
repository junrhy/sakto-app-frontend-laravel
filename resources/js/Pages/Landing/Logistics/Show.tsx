import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
    identifier: string;
}

interface Truck {
    id: number;
    client_identifier: string;
    plate_number: string;
    model: string;
    capacity: number;
    status: string;
    last_maintenance: string | null;
    fuel_level: string;
    mileage: number;
    driver: string;
    driver_contact: string;
    created_at: string;
    updated_at: string;
    shipments: any[];
    fuel_updates: any[];
    maintenance_records: any[];
    bookings: Booking[];
}

interface BookingForm {
    truck_id: number;
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
}

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
    created_at: string;
    updated_at: string;
    truck: Truck;
}

interface User {
    id: number;
    name: string;
    email: string;
    identifier: string;
}

export default function Logistics({ auth, identifier }: PageProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [trucks, setTrucks] = useState<Truck[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [missingClientId, setMissingClientId] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    
    // Booking states
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
    const [bookingForm, setBookingForm] = useState<BookingForm>({
        truck_id: 0,
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
        cargo_weight: 0,
        cargo_unit: 'kg',
        special_requirements: '',
    });
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingReference, setBookingReference] = useState('');
    
    // Date filter states with default values
    const [filterPickupDate, setFilterPickupDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [filterDeliveryDate, setFilterDeliveryDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        // Check if identifier is provided in route parameter
        if (!identifier) {
            setMissingClientId(true);
            setLoading(false);
            return;
        }

        const fetchUserAndTrucks = async () => {
            try {
                setLoading(true);
                
                // Fetch user information
                const userResponse = await axios.get(`/logistics/user/search?client_identifier=${identifier}`);
                if (userResponse.data.success && userResponse.data.data) {
                    setUser(userResponse.data.data);
                }
                
                // Fetch trucks
                const trucksResponse = await axios.get(`/logistics/trucks/list?client_identifier=${identifier}`);
                
                // Check if response has data property
                if (trucksResponse.data && Array.isArray(trucksResponse.data)) {
                    // Direct array response
                    const transformedTrucks = trucksResponse.data.map((truck: any) => ({
                        id: truck.id,
                        client_identifier: truck.client_identifier,
                        plate_number: truck.plate_number,
                        model: truck.model,
                        capacity: truck.capacity,
                        status: truck.status,
                        last_maintenance: truck.last_maintenance,
                        fuel_level: truck.fuel_level,
                        mileage: truck.mileage,
                        driver: truck.driver,
                        driver_contact: truck.driver_contact,
                        created_at: truck.created_at,
                        updated_at: truck.updated_at,
                        shipments: truck.shipments || [],
                        fuel_updates: truck.fuel_updates || [],
                        maintenance_records: truck.maintenance_records || [],
                        bookings: truck.bookings || []
                    }));
                    setTrucks(transformedTrucks);
                } else if (trucksResponse.data.success && trucksResponse.data.data) {
                    // Success wrapper response
                    const transformedTrucks = trucksResponse.data.data.map((truck: any) => ({
                        id: truck.id,
                        client_identifier: truck.client_identifier,
                        plate_number: truck.plate_number,
                        model: truck.model,
                        capacity: truck.capacity,
                        status: truck.status,
                        last_maintenance: truck.last_maintenance,
                        fuel_level: truck.fuel_level,
                        mileage: truck.mileage,
                        driver: truck.driver,
                        driver_contact: truck.driver_contact,
                        created_at: truck.created_at,
                        updated_at: truck.updated_at,
                        shipments: truck.shipments || [],
                        fuel_updates: truck.fuel_updates || [],
                        maintenance_records: truck.maintenance_records || [],
                        bookings: truck.bookings || []
                    }));
                    setTrucks(transformedTrucks);
                } else {
                    setError('Unexpected response structure from server');
                    setTrucks([]);
                }
            } catch (err: any) {
                console.error('Failed to fetch data:', err);
                setError(`Failed to load data: ${err.response?.data?.message || err.message || 'Unknown error'}`);
                setTrucks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndTrucks();
    }, []);

    const formatPrice = (price: number) => {
        return `₱${price.toLocaleString()}/day`;
    };

    // Format date for better readability
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Handle pickup date change with auto-adjustment of delivery date
    const handlePickupDateChange = (newPickupDate: string) => {
        setFilterPickupDate(newPickupDate);
        
        // If pickup date is beyond delivery date, adjust delivery date to next day
        if (newPickupDate && filterDeliveryDate && new Date(newPickupDate) >= new Date(filterDeliveryDate)) {
            const nextDay = new Date(newPickupDate);
            nextDay.setDate(nextDay.getDate() + 1);
            setFilterDeliveryDate(nextDay.toISOString().split('T')[0]);
        }
    };

    // Check if truck has incomplete bookings
    const hasIncompleteBookings = (truck: Truck): boolean => {
        if (!truck.bookings || truck.bookings.length === 0) {
            return false;
        }
        
        // Check for bookings that are not completed or cancelled
        const incompleteStatuses = ['Pending', 'Confirmed', 'In Progress'];
        return truck.bookings.some(booking => incompleteStatuses.includes(booking.status));
    };

    // Check if truck has date conflicts with existing bookings
    const hasDateConflicts = (truck: Truck, pickupDate: string, deliveryDate: string): boolean => {
        if (!truck.bookings || truck.bookings.length === 0) {
            return false;
        }
        
        const incompleteStatuses = ['Pending', 'Confirmed', 'In Progress'];
        const incompleteBookings = truck.bookings.filter(booking => incompleteStatuses.includes(booking.status));
        
        if (incompleteBookings.length === 0) {
            return false;
        }
        
        // Check for date overlaps
        return incompleteBookings.some(booking => {
            const existingPickup = new Date(booking.pickup_date);
            const existingDelivery = new Date(booking.delivery_date);
            const requestedPickup = new Date(pickupDate);
            const requestedDelivery = new Date(deliveryDate);
            
            // Check if the date ranges overlap
            // Two date ranges overlap if: start1 <= end2 AND start2 <= end1
            return requestedPickup <= existingDelivery && existingPickup <= requestedDelivery;
        });
    };

    // Check if truck is available for specific dates
    const isTruckAvailableForDates = (truck: Truck, pickupDate: string, deliveryDate: string): boolean => {
        // First check if truck status is available
        if (truck.status !== 'Available') {
            return false;
        }
        
        // Then check for date conflicts
        return !hasDateConflicts(truck, pickupDate, deliveryDate);
    };

    // Get the reason why a truck cannot be booked
    const getBookingUnavailableReason = (truck: Truck, pickupDate?: string, deliveryDate?: string): string => {
        if (truck.status !== 'Available') {
            if (truck.status === 'In Transit') {
                return 'Currently in use';
            } else if (truck.status === 'Maintenance') {
                return 'Under maintenance';
            }
            return `Currently ${truck.status.toLowerCase()}`;
        }
        
        // If date filters are provided, check for date conflicts
        if (pickupDate && deliveryDate) {
            if (hasDateConflicts(truck, pickupDate, deliveryDate)) {
                return 'Date conflict';
            }
        } else if (hasIncompleteBookings(truck)) {
            const incompleteBookings = truck.bookings.filter(booking => 
                ['Pending', 'Confirmed', 'In Progress'].includes(booking.status)
            );
            if (incompleteBookings.length === 1) {
                return 'Already booked';
            } else {
                return 'Multiple bookings';
            }
        }
        
        return '';
    };

    const handleBookTruck = (truck: Truck) => {
        // Check if truck can be booked
        if (truck.status !== 'Available') {
            if (truck.status === 'In Transit') {
                alert('Sorry, this truck is currently in use. Please try another truck.');
            } else if (truck.status === 'Maintenance') {
                alert('Sorry, this truck is under maintenance. Please try another truck.');
            } else {
                alert(`Sorry, this truck is currently ${truck.status.toLowerCase()}. Please try another truck.`);
            }
            return;
        }
        
        // Check for date conflicts if date filters are set
        if (filterPickupDate && filterDeliveryDate) {
            if (hasDateConflicts(truck, filterPickupDate, filterDeliveryDate)) {
                alert('Sorry, this truck is not available for the selected dates. Please try different dates or another truck.');
                return;
            }
        } else if (hasIncompleteBookings(truck)) {
            const incompleteBookings = truck.bookings.filter(booking => 
                ['Pending', 'Confirmed', 'In Progress'].includes(booking.status)
            );
            if (incompleteBookings.length === 1) {
                alert('Sorry, this truck is already booked. Please try another truck or check back later.');
            } else {
                alert('Sorry, this truck has multiple bookings. Please try another truck or check back later.');
            }
            return;
        }
        
        setSelectedTruck(truck);
        setBookingForm({
            ...bookingForm,
            truck_id: truck.id,
            pickup_date: filterPickupDate || '',
            delivery_date: filterDeliveryDate || '',
        });
        setShowBookingModal(true);
        setBookingSuccess(false);
        setBookingReference('');
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBookingLoading(true);
        
        try {
            const response = await axios.post('/logistics/bookings/store', {
                ...bookingForm,
                client_identifier: identifier,
            });
            
            if (response.data.success) {
                setBookingSuccess(true);
                setBookingReference(response.data.booking_reference);
                // Reset form
                setBookingForm({
                    truck_id: 0,
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
                    cargo_weight: 0,
                    cargo_unit: 'kg',
                    special_requirements: '',
                });
            }
        } catch (err: any) {
            console.error('Failed to create booking:', err);
            alert(`Failed to create booking: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        } finally {
            setBookingLoading(false);
        }
    };

    const closeBookingModal = () => {
        setShowBookingModal(false);
        setSelectedTruck(null);
        setBookingSuccess(false);
        setBookingReference('');
    };

    // Show message if client_identifier is missing
    if (missingClientId) {
        return (
            <>
                <Head title="Truck Booking - Missing Client Identifier" />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="max-w-md mx-auto text-center">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="text-red-500 mb-4">
                                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Missing Client Identifier
                            </h2>
                            <p className="text-gray-600 mb-6">
                                The <code className="bg-gray-100 px-2 py-1 rounded">identifier</code> parameter is required in the URL.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Please ensure the URL includes: <br />
                                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    /logistics/your_client_id
                                </code>
                            </p>
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                    Example URLs:
                                </p>
                                <div className="text-left">
                                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                        /logistics/company123
                                    </p>
                                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-1">
                                        /logistics/logistics_company
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Truck Fleet - Available Trucks" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 lg:h-8 lg:w-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                                        {user ? `${user.name}` : 'Available Trucks'}
                                    </h1>
                                </div>
                                <div className="ml-9 lg:ml-11">
                                    <p className="text-sm lg:text-lg text-gray-700 font-medium">
                                        Find and Book Reliable Trucks
                                    </p>
                                    <p className="text-xs lg:text-sm text-gray-600 mt-1 hidden lg:block">
                                        Browse our fleet of verified trucks for your shipping needs
                                    </p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 w-full lg:w-auto">
                                <div className="flex flex-col lg:flex-row gap-4">
                                    {/* Navigation Menu */}
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href={`/logistics/${identifier}`}
                                            className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                        >
                                            Book Trucks
                                        </Link>
                                        <Link
                                            href={`/logistics/${identifier}/track`}
                                            className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                        >
                                            Track Booking
                                        </Link>
                                    </div>
                                    
                                    {/* Search Input */}
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search trucks..."
                                            className="w-full lg:w-80 pl-10 pr-4 py-2 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 text-sm font-medium shadow-sm"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Booking Date Filter Section */}
                <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-white/20 rounded-lg p-2 mr-3">
                                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Plan Your Shipment</h3>
                                            <p className="text-blue-100 text-sm">Select your pickup and delivery dates to find available trucks</p>
                                        </div>
                                    </div>
                                    {filterPickupDate && filterDeliveryDate && (
                                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                            ✓ Ready to book
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Date Selection Form */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Pickup Date */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Pickup Date
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={filterPickupDate}
                                                onChange={(e) => handlePickupDateChange(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white hover:bg-gray-50 transition-colors appearance-none"
                                                style={{
                                                    colorScheme: 'light',
                                                    WebkitAppearance: 'none',
                                                    MozAppearance: 'textfield'
                                                }}
                                            />
                                            {filterPickupDate && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">When do you need the truck to pick up your cargo?</p>
                                    </div>

                                    {/* Delivery Date */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Delivery Date
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                min={filterPickupDate || new Date().toISOString().split('T')[0]}
                                                value={filterDeliveryDate}
                                                onChange={(e) => setFilterDeliveryDate(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white hover:bg-gray-50 transition-colors appearance-none"
                                                style={{
                                                    colorScheme: 'light',
                                                    WebkitAppearance: 'none',
                                                    MozAppearance: 'textfield'
                                                }}
                                            />
                                            {filterDeliveryDate && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">When should the cargo be delivered to its destination?</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            const today = new Date();
                                            const tomorrow = new Date();
                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                            setFilterPickupDate(today.toISOString().split('T')[0]);
                                            setFilterDeliveryDate(tomorrow.toISOString().split('T')[0]);
                                        }}
                                        className="flex items-center justify-center px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Reset to Default
                                    </button>
                                    
                                    {filterPickupDate && filterDeliveryDate && (
                                        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                                            <div className="flex items-center text-green-700">
                                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm font-medium">
                                                    Showing trucks available from {formatDate(filterPickupDate)} to {formatDate(filterDeliveryDate)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
                    {loading ? (
                        <div className="flex justify-center items-center py-12 lg:py-20">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-gray-600 mx-auto"></div>
                                <p className="mt-3 lg:mt-4 text-sm lg:text-base text-gray-600">Loading trucks...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 lg:py-20">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 lg:p-8 max-w-2xl mx-auto">
                                <div className="flex items-center justify-center mb-4">
                                    <svg className="h-8 w-8 lg:h-12 lg:w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-base lg:text-lg font-medium text-red-800 mb-2">Failed to Load Trucks</h3>
                                <p className="text-sm lg:text-base text-red-700 mb-4">{error}</p>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="inline-flex items-center px-3 py-2 lg:px-4 lg:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Stats - Hidden on mobile to focus on trucks */}
                            <div className="mb-6 lg:mb-8 hidden lg:block">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-8 w-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">Total Trucks</p>
                                                <p className="text-2xl font-semibold text-gray-900">{trucks.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">
                                                    {filterPickupDate && filterDeliveryDate ? 'Available for Dates' : 'Available'}
                                                </p>
                                                <p className="text-2xl font-semibold text-gray-900">
                                                    {filterPickupDate && filterDeliveryDate 
                                                        ? trucks.filter(t => isTruckAvailableForDates(t, filterPickupDate, filterDeliveryDate)).length
                                                        : trucks.filter(t => t.status === 'Available' && !hasIncompleteBookings(t)).length
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">In Transit</p>
                                                <p className="text-2xl font-semibold text-gray-900">{trucks.filter(t => t.status === 'In Transit').length}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">Maintenance</p>
                                                <p className="text-2xl font-semibold text-gray-900">{trucks.filter(t => t.status === 'Maintenance').length}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Stats Summary */}
                            <div className="mb-4 lg:hidden">
                                <div className="bg-white rounded-lg shadow p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm text-gray-600">Total: <span className="font-semibold text-gray-900">{trucks.length}</span></span>
                                            <span className="text-sm text-gray-600">
                                                {filterPickupDate && filterDeliveryDate ? 'Available for Dates:' : 'Available:'} 
                                                <span className="font-semibold text-green-600">
                                                    {filterPickupDate && filterDeliveryDate 
                                                        ? trucks.filter(t => isTruckAvailableForDates(t, filterPickupDate, filterDeliveryDate)).length
                                                        : trucks.filter(t => t.status === 'Available' && !hasIncompleteBookings(t)).length
                                                    }
                                                </span>
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            In Transit: <span className="font-semibold text-blue-600">{trucks.filter(t => t.status === 'In Transit').length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trucks Grid */}
                            <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {trucks.map((truck) => (
                                    <div key={truck.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100">
                                        <div className="relative">
                                            <img
                                                className="w-full h-32 lg:h-40 object-cover rounded-t-lg"
                                                src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                                                alt={truck.model}
                                            />
                                        </div>
                                        <div className="p-3 lg:p-4">
                                            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">{truck.model}</h3>
                                            <div className="space-y-1 lg:space-y-2 text-xs lg:text-sm">
                                                <div className="flex items-center">
                                                    <svg className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                    <span className="text-gray-600">Capacity: {truck.capacity} tons</span>
                                                </div>
                                            </div>
                                            
                                            {/* Book Now Button or Unavailable Message */}
                                            <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-100">
                                                {(() => {
                                                    const isAvailable = filterPickupDate && filterDeliveryDate 
                                                        ? isTruckAvailableForDates(truck, filterPickupDate, filterDeliveryDate)
                                                        : truck.status === 'Available' && !hasIncompleteBookings(truck);
                                                    
                                                    return isAvailable ? (
                                                        <button
                                                            onClick={() => handleBookTruck(truck)}
                                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                                                        >
                                                            Book Now
                                                        </button>
                                                    ) : (
                                                        <div className="text-center">
                                                            <button
                                                                disabled
                                                                className="w-full bg-gray-300 text-gray-500 text-sm font-medium py-2 px-3 rounded-lg cursor-not-allowed"
                                                            >
                                                                {getBookingUnavailableReason(truck, filterPickupDate, filterDeliveryDate) || 'Not Available'}
                                                            </button>
                                                            {hasIncompleteBookings(truck) && !filterPickupDate && !filterDeliveryDate && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {truck.bookings.filter(booking => 
                                                                        ['Pending', 'Confirmed', 'In Progress'].includes(booking.status)
                                                                    ).length === 1 ? 'This truck is reserved' : 'Multiple reservations'}
                                                                </p>
                                                            )}
                                                            {filterPickupDate && filterDeliveryDate && hasDateConflicts(truck, filterPickupDate, filterDeliveryDate) && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Not available for selected dates
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {trucks.length === 0 && !loading && !error && (
                                <div className="text-center py-12 lg:py-20">
                                    <svg className="mx-auto h-8 w-8 lg:h-12 lg:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <h3 className="mt-2 text-sm lg:text-base font-medium text-gray-900">No trucks found</h3>
                                    <p className="mt-1 text-xs lg:text-sm text-gray-500">No trucks are currently available.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {bookingSuccess ? 'Booking Successful!' : 'Book Truck'}
                                </h2>
                                <button
                                    onClick={closeBookingModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {bookingSuccess ? (
                                <div className="text-center">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Confirmed!</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Your booking has been successfully created. Please save your booking reference number.
                                    </p>
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                        <p className="text-sm text-gray-600 mb-1">Booking Reference:</p>
                                        <p className="text-lg font-bold text-gray-900">{bookingReference}</p>
                                    </div>
                                    <button
                                        onClick={closeBookingModal}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleBookingSubmit}>
                                    {selectedTruck && (
                                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                            <h3 className="font-medium text-gray-900 mb-2">Selected Truck</h3>
                                            <p className="text-sm text-gray-600">
                                                {selectedTruck.model} - {selectedTruck.plate_number} (Capacity: {selectedTruck.capacity} tons)
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Customer Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={bookingForm.customer_name}
                                                onChange={(e) => setBookingForm({...bookingForm, customer_name: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={bookingForm.customer_email}
                                                onChange={(e) => setBookingForm({...bookingForm, customer_email: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={bookingForm.customer_phone}
                                                onChange={(e) => setBookingForm({...bookingForm, customer_phone: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Company
                                            </label>
                                            <input
                                                type="text"
                                                value={bookingForm.customer_company}
                                                onChange={(e) => setBookingForm({...bookingForm, customer_company: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pickup Location *
                                            </label>
                                            <textarea
                                                required
                                                value={bookingForm.pickup_location}
                                                onChange={(e) => setBookingForm({...bookingForm, pickup_location: e.target.value})}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Delivery Location *
                                            </label>
                                            <textarea
                                                required
                                                value={bookingForm.delivery_location}
                                                onChange={(e) => setBookingForm({...bookingForm, delivery_location: e.target.value})}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pickup Date *
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                value={bookingForm.pickup_date}
                                                onChange={(e) => setBookingForm({...bookingForm, pickup_date: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pickup Time *
                                            </label>
                                            <input
                                                type="time"
                                                required
                                                value={bookingForm.pickup_time}
                                                onChange={(e) => setBookingForm({...bookingForm, pickup_time: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Delivery Date *
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                min={bookingForm.pickup_date || new Date().toISOString().split('T')[0]}
                                                value={bookingForm.delivery_date}
                                                onChange={(e) => setBookingForm({...bookingForm, delivery_date: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Delivery Time *
                                            </label>
                                            <input
                                                type="time"
                                                required
                                                value={bookingForm.delivery_time}
                                                onChange={(e) => setBookingForm({...bookingForm, delivery_time: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Cargo Description *
                                            </label>
                                            <textarea
                                                required
                                                value={bookingForm.cargo_description}
                                                onChange={(e) => setBookingForm({...bookingForm, cargo_description: e.target.value})}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Special Requirements
                                            </label>
                                            <textarea
                                                value={bookingForm.special_requirements}
                                                onChange={(e) => setBookingForm({...bookingForm, special_requirements: e.target.value})}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Cargo Weight *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="0.01"
                                                step="0.01"
                                                value={bookingForm.cargo_weight}
                                                onChange={(e) => setBookingForm({...bookingForm, cargo_weight: parseFloat(e.target.value) || 0})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Cargo Unit *
                                            </label>
                                            <select
                                                required
                                                value={bookingForm.cargo_unit}
                                                onChange={(e) => setBookingForm({...bookingForm, cargo_unit: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="kg">Kilograms (kg)</option>
                                                <option value="tons">Tons</option>
                                                <option value="pieces">Pieces</option>
                                                <option value="pallets">Pallets</option>
                                                <option value="boxes">Boxes</option>
                                                <option value="liters">Liters</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={closeBookingModal}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={bookingLoading}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {bookingLoading ? 'Creating Booking...' : 'Create Booking'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
