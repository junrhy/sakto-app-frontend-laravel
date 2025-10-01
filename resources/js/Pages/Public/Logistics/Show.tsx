import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

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
                const userResponse = await axios.get(
                    `/logistics/user/search?client_identifier=${identifier}`,
                );
                if (userResponse.data.success && userResponse.data.data) {
                    setUser(userResponse.data.data);
                }

                // Fetch trucks
                const trucksResponse = await axios.get(
                    `/logistics/trucks/list?client_identifier=${identifier}`,
                );

                // Check if response has data property
                if (trucksResponse.data && Array.isArray(trucksResponse.data)) {
                    // Direct array response
                    const transformedTrucks = trucksResponse.data.map(
                        (truck: any) => ({
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
                            maintenance_records:
                                truck.maintenance_records || [],
                            bookings: truck.bookings || [],
                        }),
                    );
                    setTrucks(transformedTrucks);
                } else if (
                    trucksResponse.data.success &&
                    trucksResponse.data.data
                ) {
                    // Success wrapper response
                    const transformedTrucks = trucksResponse.data.data.map(
                        (truck: any) => ({
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
                            maintenance_records:
                                truck.maintenance_records || [],
                            bookings: truck.bookings || [],
                        }),
                    );
                    setTrucks(transformedTrucks);
                } else {
                    setError('Unexpected response structure from server');
                    setTrucks([]);
                }
            } catch (err: any) {
                console.error('Failed to fetch data:', err);
                setError(
                    `Failed to load data: ${err.response?.data?.message || err.message || 'Unknown error'}`,
                );
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
            day: 'numeric',
        });
    };

    // Handle pickup date change with auto-adjustment of delivery date
    const handlePickupDateChange = (newPickupDate: string) => {
        setFilterPickupDate(newPickupDate);

        // If pickup date is beyond delivery date, adjust delivery date to next day
        if (
            newPickupDate &&
            filterDeliveryDate &&
            new Date(newPickupDate) >= new Date(filterDeliveryDate)
        ) {
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
        return truck.bookings.some((booking) =>
            incompleteStatuses.includes(booking.status),
        );
    };

    // Check if truck has date conflicts with existing bookings
    const hasDateConflicts = (
        truck: Truck,
        pickupDate: string,
        deliveryDate: string,
    ): boolean => {
        if (!truck.bookings || truck.bookings.length === 0) {
            return false;
        }

        const incompleteStatuses = ['Pending', 'Confirmed', 'In Progress'];
        const incompleteBookings = truck.bookings.filter((booking) =>
            incompleteStatuses.includes(booking.status),
        );

        if (incompleteBookings.length === 0) {
            return false;
        }

        // Check for date overlaps
        return incompleteBookings.some((booking) => {
            const existingPickup = new Date(booking.pickup_date);
            const existingDelivery = new Date(booking.delivery_date);
            const requestedPickup = new Date(pickupDate);
            const requestedDelivery = new Date(deliveryDate);

            // Check if the date ranges overlap
            // Two date ranges overlap if: start1 <= end2 AND start2 <= end1
            return (
                requestedPickup <= existingDelivery &&
                existingPickup <= requestedDelivery
            );
        });
    };

    // Check if truck is available for specific dates
    const isTruckAvailableForDates = (
        truck: Truck,
        pickupDate: string,
        deliveryDate: string,
    ): boolean => {
        // First check if truck status is available
        if (truck.status !== 'Available') {
            return false;
        }

        // Then check for date conflicts
        return !hasDateConflicts(truck, pickupDate, deliveryDate);
    };

    // Get the reason why a truck cannot be booked
    const getBookingUnavailableReason = (
        truck: Truck,
        pickupDate?: string,
        deliveryDate?: string,
    ): string => {
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
            const incompleteBookings = truck.bookings.filter((booking) =>
                ['Pending', 'Confirmed', 'In Progress'].includes(
                    booking.status,
                ),
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
                alert(
                    'Sorry, this truck is currently in use. Please try another truck.',
                );
            } else if (truck.status === 'Maintenance') {
                alert(
                    'Sorry, this truck is under maintenance. Please try another truck.',
                );
            } else {
                alert(
                    `Sorry, this truck is currently ${truck.status.toLowerCase()}. Please try another truck.`,
                );
            }
            return;
        }

        // Check for date conflicts if date filters are set
        if (filterPickupDate && filterDeliveryDate) {
            if (hasDateConflicts(truck, filterPickupDate, filterDeliveryDate)) {
                alert(
                    'Sorry, this truck is not available for the selected dates. Please try different dates or another truck.',
                );
                return;
            }
        } else if (hasIncompleteBookings(truck)) {
            const incompleteBookings = truck.bookings.filter((booking) =>
                ['Pending', 'Confirmed', 'In Progress'].includes(
                    booking.status,
                ),
            );
            if (incompleteBookings.length === 1) {
                alert(
                    'Sorry, this truck is already booked. Please try another truck or check back later.',
                );
            } else {
                alert(
                    'Sorry, this truck has multiple bookings. Please try another truck or check back later.',
                );
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
            alert(
                `Failed to create booking: ${err.response?.data?.message || err.message || 'Unknown error'}`,
            );
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
                <div className="flex min-h-screen items-center justify-center bg-gray-50">
                    <div className="mx-auto max-w-md text-center">
                        <div className="rounded-lg bg-white p-8 shadow-lg">
                            <div className="mb-4 text-red-500">
                                <svg
                                    className="mx-auto h-16 w-16"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            <h2 className="mb-4 text-2xl font-bold text-gray-900">
                                Missing Client Identifier
                            </h2>
                            <p className="mb-6 text-gray-600">
                                The{' '}
                                <code className="rounded bg-gray-100 px-2 py-1">
                                    identifier
                                </code>{' '}
                                parameter is required in the URL.
                            </p>
                            <p className="mb-6 text-sm text-gray-500">
                                Please ensure the URL includes: <br />
                                <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                                    /logistics/your_client_id
                                </code>
                            </p>
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                    Example URLs:
                                </p>
                                <div className="text-left">
                                    <p className="rounded bg-gray-50 p-2 text-xs text-gray-500">
                                        /logistics/company123
                                    </p>
                                    <p className="mt-1 rounded bg-gray-50 p-2 text-xs text-gray-500">
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
                <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-12">
                        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                            <div className="flex-1">
                                <div className="mb-2 flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-6 w-6 text-gray-700 lg:h-8 lg:w-8"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                            />
                                        </svg>
                                    </div>
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-4xl">
                                        {user
                                            ? `${user.name}`
                                            : 'Available Trucks'}
                                    </h1>
                                </div>
                                <div className="ml-9 lg:ml-11">
                                    <p className="text-sm font-medium text-gray-700 lg:text-lg">
                                        Find and Book Reliable Trucks
                                    </p>
                                    <p className="mt-1 hidden text-xs text-gray-600 lg:block lg:text-sm">
                                        Browse our fleet of verified trucks for
                                        your shipping needs
                                    </p>
                                </div>
                            </div>
                            <div className="w-full flex-shrink-0 lg:w-auto">
                                <div className="flex flex-col gap-4 lg:flex-row">
                                    {/* Navigation Menu */}
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href={`/logistics/${identifier}`}
                                            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-gray-900"
                                        >
                                            Book Trucks
                                        </Link>
                                        <Link
                                            href={`/logistics/${identifier}/track`}
                                            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-gray-900"
                                        >
                                            Track Booking
                                        </Link>
                                    </div>

                                    {/* Search Input */}
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <svg
                                                className="h-5 w-5 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search trucks..."
                                            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 lg:w-80 lg:rounded-xl lg:py-3"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Booking Date Filter Section */}
                <div className="border-b border-gray-200 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="mr-3 rounded-lg bg-white/20 p-2">
                                            <svg
                                                className="h-6 w-6 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">
                                                Plan Your Shipment
                                            </h3>
                                            <p className="text-sm text-blue-100">
                                                Select your pickup and delivery
                                                dates to find available trucks
                                            </p>
                                        </div>
                                    </div>
                                    {filterPickupDate && filterDeliveryDate && (
                                        <div className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
                                            ✓ Ready to book
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Date Selection Form */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {/* Pickup Date */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <svg
                                                className="mr-2 h-4 w-4 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            Pickup Date
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                min={
                                                    new Date()
                                                        .toISOString()
                                                        .split('T')[0]
                                                }
                                                value={filterPickupDate}
                                                onChange={(e) =>
                                                    handlePickupDateChange(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full appearance-none rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm transition-colors hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                                style={{
                                                    colorScheme: 'light',
                                                    WebkitAppearance: 'none',
                                                    MozAppearance: 'textfield',
                                                }}
                                            />
                                            {filterPickupDate && (
                                                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transform">
                                                    <svg
                                                        className="h-5 w-5 text-green-500"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            When do you need the truck to pick
                                            up your cargo?
                                        </p>
                                    </div>

                                    {/* Delivery Date */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <svg
                                                className="mr-2 h-4 w-4 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            Delivery Date
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                min={
                                                    filterPickupDate ||
                                                    new Date()
                                                        .toISOString()
                                                        .split('T')[0]
                                                }
                                                value={filterDeliveryDate}
                                                onChange={(e) =>
                                                    setFilterDeliveryDate(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full appearance-none rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm transition-colors hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                                style={{
                                                    colorScheme: 'light',
                                                    WebkitAppearance: 'none',
                                                    MozAppearance: 'textfield',
                                                }}
                                            />
                                            {filterDeliveryDate && (
                                                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transform">
                                                    <svg
                                                        className="h-5 w-5 text-green-500"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            When should the cargo be delivered
                                            to its destination?
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        onClick={() => {
                                            const today = new Date();
                                            const tomorrow = new Date();
                                            tomorrow.setDate(
                                                tomorrow.getDate() + 1,
                                            );
                                            setFilterPickupDate(
                                                today
                                                    .toISOString()
                                                    .split('T')[0],
                                            );
                                            setFilterDeliveryDate(
                                                tomorrow
                                                    .toISOString()
                                                    .split('T')[0],
                                            );
                                        }}
                                        className="flex items-center justify-center rounded-lg border-2 border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                                    >
                                        <svg
                                            className="mr-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                            />
                                        </svg>
                                        Reset to Default
                                    </button>

                                    {filterPickupDate && filterDeliveryDate && (
                                        <div className="flex-1 rounded-lg border border-green-200 bg-green-50 px-4 py-2">
                                            <div className="flex items-center text-green-700">
                                                <svg
                                                    className="mr-2 h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <span className="text-sm font-medium">
                                                    Showing trucks available
                                                    from{' '}
                                                    {formatDate(
                                                        filterPickupDate,
                                                    )}{' '}
                                                    to{' '}
                                                    {formatDate(
                                                        filterDeliveryDate,
                                                    )}
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
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 lg:py-20">
                            <div className="text-center">
                                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-600 lg:h-12 lg:w-12"></div>
                                <p className="mt-3 text-sm text-gray-600 lg:mt-4 lg:text-base">
                                    Loading trucks...
                                </p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="py-12 text-center lg:py-20">
                            <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-6 lg:p-8">
                                <div className="mb-4 flex items-center justify-center">
                                    <svg
                                        className="h-8 w-8 text-red-400 lg:h-12 lg:w-12"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-base font-medium text-red-800 lg:text-lg">
                                    Failed to Load Trucks
                                </h3>
                                <p className="mb-4 text-sm text-red-700 lg:text-base">
                                    {error}
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 lg:px-4 lg:py-2"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Stats - Hidden on mobile to focus on trucks */}
                            <div className="mb-6 hidden lg:mb-8 lg:block">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    <div className="rounded-lg bg-white p-6 shadow">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className="h-8 w-8 text-gray-700"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">
                                                    Total Trucks
                                                </p>
                                                <p className="text-2xl font-semibold text-gray-900">
                                                    {trucks.length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-white p-6 shadow">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className="h-8 w-8 text-green-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">
                                                    {filterPickupDate &&
                                                    filterDeliveryDate
                                                        ? 'Available for Dates'
                                                        : 'Available'}
                                                </p>
                                                <p className="text-2xl font-semibold text-gray-900">
                                                    {filterPickupDate &&
                                                    filterDeliveryDate
                                                        ? trucks.filter((t) =>
                                                              isTruckAvailableForDates(
                                                                  t,
                                                                  filterPickupDate,
                                                                  filterDeliveryDate,
                                                              ),
                                                          ).length
                                                        : trucks.filter(
                                                              (t) =>
                                                                  t.status ===
                                                                      'Available' &&
                                                                  !hasIncompleteBookings(
                                                                      t,
                                                                  ),
                                                          ).length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-white p-6 shadow">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className="h-8 w-8 text-blue-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">
                                                    In Transit
                                                </p>
                                                <p className="text-2xl font-semibold text-gray-900">
                                                    {
                                                        trucks.filter(
                                                            (t) =>
                                                                t.status ===
                                                                'In Transit',
                                                        ).length
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-white p-6 shadow">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className="h-8 w-8 text-yellow-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-500">
                                                    Maintenance
                                                </p>
                                                <p className="text-2xl font-semibold text-gray-900">
                                                    {
                                                        trucks.filter(
                                                            (t) =>
                                                                t.status ===
                                                                'Maintenance',
                                                        ).length
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Stats Summary */}
                            <div className="mb-4 lg:hidden">
                                <div className="rounded-lg bg-white p-4 shadow">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm text-gray-600">
                                                Total:{' '}
                                                <span className="font-semibold text-gray-900">
                                                    {trucks.length}
                                                </span>
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {filterPickupDate &&
                                                filterDeliveryDate
                                                    ? 'Available for Dates:'
                                                    : 'Available:'}
                                                <span className="font-semibold text-green-600">
                                                    {filterPickupDate &&
                                                    filterDeliveryDate
                                                        ? trucks.filter((t) =>
                                                              isTruckAvailableForDates(
                                                                  t,
                                                                  filterPickupDate,
                                                                  filterDeliveryDate,
                                                              ),
                                                          ).length
                                                        : trucks.filter(
                                                              (t) =>
                                                                  t.status ===
                                                                      'Available' &&
                                                                  !hasIncompleteBookings(
                                                                      t,
                                                                  ),
                                                          ).length}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            In Transit:{' '}
                                            <span className="font-semibold text-blue-600">
                                                {
                                                    trucks.filter(
                                                        (t) =>
                                                            t.status ===
                                                            'In Transit',
                                                    ).length
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trucks Grid */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                                {trucks.map((truck) => (
                                    <div
                                        key={truck.id}
                                        className="rounded-lg border border-gray-100 bg-white shadow-md transition-shadow duration-200 hover:shadow-lg"
                                    >
                                        <div className="relative">
                                            <img
                                                className="h-32 w-full rounded-t-lg object-cover lg:h-40"
                                                src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                                                alt={truck.model}
                                            />
                                        </div>
                                        <div className="p-3 lg:p-4">
                                            <h3 className="mb-2 text-base font-semibold text-gray-900 lg:text-lg">
                                                {truck.model}
                                            </h3>
                                            <div className="space-y-1 text-xs lg:space-y-2 lg:text-sm">
                                                <div className="flex items-center">
                                                    <svg
                                                        className="mr-2 h-3 w-3 text-gray-400 lg:h-4 lg:w-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                                        />
                                                    </svg>
                                                    <span className="text-gray-600">
                                                        Capacity:{' '}
                                                        {truck.capacity} tons
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Book Now Button or Unavailable Message */}
                                            <div className="mt-3 border-t border-gray-100 pt-3 lg:mt-4 lg:pt-4">
                                                {(() => {
                                                    const isAvailable =
                                                        filterPickupDate &&
                                                        filterDeliveryDate
                                                            ? isTruckAvailableForDates(
                                                                  truck,
                                                                  filterPickupDate,
                                                                  filterDeliveryDate,
                                                              )
                                                            : truck.status ===
                                                                  'Available' &&
                                                              !hasIncompleteBookings(
                                                                  truck,
                                                              );

                                                    return isAvailable ? (
                                                        <button
                                                            onClick={() =>
                                                                handleBookTruck(
                                                                    truck,
                                                                )
                                                            }
                                                            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700"
                                                        >
                                                            Book Now
                                                        </button>
                                                    ) : (
                                                        <div className="text-center">
                                                            <button
                                                                disabled
                                                                className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-3 py-2 text-sm font-medium text-gray-500"
                                                            >
                                                                {getBookingUnavailableReason(
                                                                    truck,
                                                                    filterPickupDate,
                                                                    filterDeliveryDate,
                                                                ) ||
                                                                    'Not Available'}
                                                            </button>
                                                            {hasIncompleteBookings(
                                                                truck,
                                                            ) &&
                                                                !filterPickupDate &&
                                                                !filterDeliveryDate && (
                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        {truck.bookings.filter(
                                                                            (
                                                                                booking,
                                                                            ) =>
                                                                                [
                                                                                    'Pending',
                                                                                    'Confirmed',
                                                                                    'In Progress',
                                                                                ].includes(
                                                                                    booking.status,
                                                                                ),
                                                                        )
                                                                            .length ===
                                                                        1
                                                                            ? 'This truck is reserved'
                                                                            : 'Multiple reservations'}
                                                                    </p>
                                                                )}
                                                            {filterPickupDate &&
                                                                filterDeliveryDate &&
                                                                hasDateConflicts(
                                                                    truck,
                                                                    filterPickupDate,
                                                                    filterDeliveryDate,
                                                                ) && (
                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        Not
                                                                        available
                                                                        for
                                                                        selected
                                                                        dates
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
                                <div className="py-12 text-center lg:py-20">
                                    <svg
                                        className="mx-auto h-8 w-8 text-gray-400 lg:h-12 lg:w-12"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 lg:text-base">
                                        No trucks found
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500 lg:text-sm">
                                        No trucks are currently available.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
                        <div className="p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {bookingSuccess
                                        ? 'Booking Successful!'
                                        : 'Book Truck'}
                                </h2>
                                <button
                                    onClick={closeBookingModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {bookingSuccess ? (
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                        <svg
                                            className="h-6 w-6 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                                        Booking Confirmed!
                                    </h3>
                                    <p className="mb-4 text-sm text-gray-600">
                                        Your booking has been successfully
                                        created. Please save your booking
                                        reference number.
                                    </p>
                                    <div className="mb-6 rounded-lg bg-gray-50 p-4">
                                        <p className="mb-1 text-sm text-gray-600">
                                            Booking Reference:
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {bookingReference}
                                        </p>
                                    </div>
                                    <button
                                        onClick={closeBookingModal}
                                        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleBookingSubmit}>
                                    {selectedTruck && (
                                        <div className="mb-6 rounded-lg bg-gray-50 p-4">
                                            <h3 className="mb-2 font-medium text-gray-900">
                                                Selected Truck
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {selectedTruck.model} -{' '}
                                                {selectedTruck.plate_number}{' '}
                                                (Capacity:{' '}
                                                {selectedTruck.capacity} tons)
                                            </p>
                                        </div>
                                    )}

                                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Customer Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={
                                                    bookingForm.customer_name
                                                }
                                                onChange={(e) =>
                                                    setBookingForm({
                                                        ...bookingForm,
                                                        customer_name:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={
                                                    bookingForm.customer_email
                                                }
                                                onChange={(e) =>
                                                    setBookingForm({
                                                        ...bookingForm,
                                                        customer_email:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Phone *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={
                                                    bookingForm.customer_phone
                                                }
                                                onChange={(e) =>
                                                    setBookingForm({
                                                        ...bookingForm,
                                                        customer_phone:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Company
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    bookingForm.customer_company
                                                }
                                                onChange={(e) =>
                                                    setBookingForm({
                                                        ...bookingForm,
                                                        customer_company:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Pickup Location *
                                            </label>
                                            <textarea
                                                required
                                                value={
                                                    bookingForm.pickup_location
                                                }
                                                onChange={(e) =>
                                                    setBookingForm({
                                                        ...bookingForm,
                                                        pickup_location:
                                                            e.target.value,
                                                    })
                                                }
                                                rows={3}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Delivery Location *
                                            </label>
                                            <textarea
                                                required
                                                value={
                                                    bookingForm.delivery_location
                                                }
                                                onChange={(e) =>
                                                    setBookingForm({
                                                        ...bookingForm,
                                                        delivery_location:
                                                            e.target.value,
                                                    })
                                                }
                                                rows={3}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Pickup Date *
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                min={
                                                    new Date()
                                                        .toISOString()
                                                        .split('T')[0]
                                                }
                                                value={bookingForm.pickup_date}
                                                onChange={(e) =>
                                                    setBookingForm({
                                                        ...bookingForm,
                                                        pickup_date:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Pickup Time *
                                            </label>
                                            <input
                                                type="time"
                                                required
                                                value={bookingForm.pickup_time}
                                                onChange={(e) =>
                                                    setBookingForm({
                                                        ...bookingForm,
                                                        pickup_time:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Delivery Date *
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                min={
                                                    bookingForm.pickup_date ||
                                                    new Date()
                                                        .toISOString()
                                                        .split('T')[0]
                                                }
                                                value={
                                                    bookingForm.delivery_date
                                                }
                                                onChange={(e) =>
                                                    setBookingForm({
                                                        ...bookingForm,
                                                        delivery_date:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Delivery Time *
                                            </label>
                                            <input
                                                type="time"
                                                required
                                                value={
                                                    bookingForm.delivery_time
                                                }
                                                onChange={(e) =>
                                                    setBookingForm({
                                                        ...bookingForm,
                                                        delivery_time:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Cargo Description *
                                            </label>
                                            <textarea
                                                required
                                                value={
                                                    bookingForm.cargo_description
                                                }
                                                onChange={(e) =>
                                                    setBookingForm({
                                                        ...bookingForm,
                                                        cargo_description:
                                                            e.target.value,
                                                    })
                                                }
                                                rows={3}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Special Requirements
                                            </label>
                                            <textarea
                                                value={
                                                    bookingForm.special_requirements
                                                }
                                                onChange={(e) =>
                                                    setBookingForm({
                                                        ...bookingForm,
                                                        special_requirements:
                                                            e.target.value,
                                                    })
                                                }
                                                rows={3}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Cargo Weight *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="0.01"
                                                step="0.01"
                                                value={bookingForm.cargo_weight}
                                                onChange={(e) =>
                                                    setBookingForm({
                                                        ...bookingForm,
                                                        cargo_weight:
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                Cargo Unit *
                                            </label>
                                            <select
                                                required
                                                value={bookingForm.cargo_unit}
                                                onChange={(e) =>
                                                    setBookingForm({
                                                        ...bookingForm,
                                                        cargo_unit:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="kg">
                                                    Kilograms (kg)
                                                </option>
                                                <option value="tons">
                                                    Tons
                                                </option>
                                                <option value="pieces">
                                                    Pieces
                                                </option>
                                                <option value="pallets">
                                                    Pallets
                                                </option>
                                                <option value="boxes">
                                                    Boxes
                                                </option>
                                                <option value="liters">
                                                    Liters
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={closeBookingModal}
                                            className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={bookingLoading}
                                            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {bookingLoading
                                                ? 'Creating Booking...'
                                                : 'Create Booking'}
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
