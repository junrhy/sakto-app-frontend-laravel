import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
    identifier: string;
    travel: {
        id: number;
        name: string;
        email: string;
        contact_number: string;
        app_currency: string;
        created_at: string;
        identifier: string;
        slug: string;
    };
}

interface Destination {
    id: number;
    name: string;
    country: string;
    image: string;
    price: number;
    rating: number;
    duration: string;
}

interface Flight {
    id: number;
    from: string;
    to: string;
    airline: string;
    price: number;
    duration: string;
    departure: string;
    arrival: string;
}

export default function TravelShow({ auth, identifier, travel }: PageProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useState('flights');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock destinations data
    const destinations: Destination[] = [
        {
            id: 1,
            name: 'Bali',
            country: 'Indonesia',
            image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            price: 899,
            rating: 4.8,
            duration: '7 days',
        },
        {
            id: 2,
            name: 'Santorini',
            country: 'Greece',
            image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            price: 1299,
            rating: 4.9,
            duration: '10 days',
        },
        {
            id: 3,
            name: 'Tokyo',
            country: 'Japan',
            image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            price: 1499,
            rating: 4.7,
            duration: '8 days',
        },
        {
            id: 4,
            name: 'New York',
            country: 'USA',
            image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            price: 999,
            rating: 4.6,
            duration: '6 days',
        },
    ];

    // Mock flights data
    const flights: Flight[] = [
        {
            id: 1,
            from: 'Manila',
            to: 'Bangkok',
            airline: 'Philippine Airlines',
            price: 299,
            duration: '3h 45m',
            departure: '08:30',
            arrival: '12:15',
        },
        {
            id: 2,
            from: 'Manila',
            to: 'Singapore',
            airline: 'Cebu Pacific',
            price: 199,
            duration: '3h 20m',
            departure: '14:00',
            arrival: '17:20',
        },
        {
            id: 3,
            from: 'Manila',
            to: 'Tokyo',
            airline: 'Japan Airlines',
            price: 599,
            duration: '4h 15m',
            departure: '10:30',
            arrival: '14:45',
        },
    ];

    const features = [
        {
            title: 'Flight Booking',
            description:
                'Search and book flights to destinations worldwide with real-time pricing and availability.',
            icon: (
                <svg
                    className="h-8 w-8 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                </svg>
            ),
        },
        {
            title: 'Hotel Reservations',
            description:
                'Find and book hotels, resorts, and accommodations that match your preferences and budget.',
            icon: (
                <svg
                    className="h-8 w-8 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"
                    />
                </svg>
            ),
        },
        {
            title: 'Travel Packages',
            description:
                'Discover curated travel packages that combine flights, hotels, and activities for the perfect trip.',
            icon: (
                <svg
                    className="h-8 w-8 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                    />
                </svg>
            ),
        },
        {
            title: 'Travel Insurance',
            description:
                'Comprehensive travel insurance coverage to protect your journey and give you peace of mind.',
            icon: (
                <svg
                    className="h-8 w-8 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                </svg>
            ),
        },
    ];

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <>
            <Head title="Travel & Tourism Platform" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 bg-white/90 shadow-sm backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex flex-shrink-0 items-center">
                                    <ApplicationLogo className="block h-9 w-auto" />
                                    <span className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
                                        Travel
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={route('travel')}
                                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                                >
                                    ← Back to Overview
                                </Link>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search destinations..."
                                        className="w-64 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login', {
                                                project: 'travel',
                                            })}
                                            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register', {
                                                project: 'travel',
                                            })}
                                            className="ml-4 inline-flex items-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            className="h-full w-full object-cover"
                            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
                            alt="Travel destinations"
                        />
                        <div className="absolute inset-0 bg-black/40"></div>
                    </div>
                    <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                                <span className="block">Explore the World</span>
                                <span className="block text-blue-200">
                                    One Journey at a Time
                                </span>
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-200">
                                Discover amazing destinations, book flights, and
                                create unforgettable travel experiences with our
                                comprehensive travel platform.
                            </p>
                            <div className="mt-10">
                                <Link
                                    href={route('register', {
                                        project: 'travel',
                                    })}
                                    className="inline-flex items-center rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-base font-medium text-white hover:from-blue-700 hover:to-indigo-700"
                                >
                                    Start Your Journey
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Tabs */}
                <div className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-lg">
                        <div className="mb-6 flex space-x-1">
                            {['flights', 'hotels', 'packages'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`rounded-md px-6 py-2 text-sm font-medium transition-colors ${
                                        activeTab === tab
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'flights' && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <input
                                    type="text"
                                    placeholder="From"
                                    className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="To"
                                    className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="date"
                                    className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {activeTab === 'hotels' && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <input
                                    type="text"
                                    placeholder="Destination"
                                    className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="date"
                                    placeholder="Check-in"
                                    className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="date"
                                    placeholder="Check-out"
                                    className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {activeTab === 'packages' && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <input
                                    type="text"
                                    placeholder="Destination"
                                    className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <select className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>Select Package Type</option>
                                    <option>Beach Getaway</option>
                                    <option>City Break</option>
                                    <option>Adventure Tour</option>
                                    <option>Cultural Experience</option>
                                </select>
                            </div>
                        )}

                        <div className="mt-4">
                            <button className="w-full rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:from-blue-700 hover:to-indigo-700">
                                Search{' '}
                                {activeTab.charAt(0).toUpperCase() +
                                    activeTab.slice(1)}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Everything You Need for Your Journey
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Comprehensive travel services to make your trip
                            planning seamless and enjoyable.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => (
                            <div key={feature.title} className="text-center">
                                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    {feature.icon}
                                </div>
                                <h3 className="mb-2 text-lg font-medium text-gray-900">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Destinations */}
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Popular Destinations
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Discover trending destinations that travelers love.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {destinations.map((destination) => (
                            <div
                                key={destination.id}
                                className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
                            >
                                <div className="relative pb-[60%]">
                                    <img
                                        src={destination.image}
                                        alt={destination.name}
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                    <div className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-sm font-medium text-gray-900">
                                        ${destination.price}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {destination.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {destination.country}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-yellow-400">
                                                ★
                                            </span>
                                            <span className="ml-1 text-sm text-gray-600">
                                                {destination.rating}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {destination.duration}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Flight Deals */}
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Flight Deals
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Best prices on flights from Manila to popular
                            destinations.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {flights.map((flight) => (
                            <div
                                key={flight.id}
                                className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {flight.from} → {flight.to}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {flight.airline}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-blue-600">
                                            ${flight.price}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {flight.duration}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Departure: {flight.departure}</span>
                                    <span>Arrival: {flight.arrival}</span>
                                </div>
                                <button className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                                    Book Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
                    <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Ready to Start Your Adventure?
                        </h2>
                        <p className="mt-4 text-xl text-blue-100">
                            Join thousands of travelers who trust us for their
                            journey planning.
                        </p>
                        <div className="mt-8">
                            <Link
                                href={route('register', { project: 'travel' })}
                                className="inline-flex items-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-blue-600 hover:bg-gray-50"
                            >
                                Create Your Account
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-gray-900">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                            <div>
                                <ApplicationLogo className="block h-8 w-auto text-white" />
                                <p className="mt-4 text-gray-400">
                                    Your trusted partner for unforgettable
                                    travel experiences.
                                </p>
                            </div>
                            <div>
                                <h3 className="mb-4 font-medium text-white">
                                    Services
                                </h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-white"
                                        >
                                            Flight Booking
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-white"
                                        >
                                            Hotel Reservations
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-white"
                                        >
                                            Travel Packages
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-white"
                                        >
                                            Travel Insurance
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-4 font-medium text-white">
                                    Support
                                </h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-white"
                                        >
                                            Help Center
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-white"
                                        >
                                            Contact Us
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="hover:text-white"
                                        >
                                            Travel Tips
                                        </a>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('faq')}
                                            className="hover:text-white"
                                        >
                                            FAQ
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-4 font-medium text-white">
                                    Legal
                                </h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li>
                                        <Link
                                            href={route('privacy-policy')}
                                            className="hover:text-white"
                                        >
                                            Privacy Policy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('terms-and-conditions')}
                                            className="hover:text-white"
                                        >
                                            Terms of Service
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('cookie-policy')}
                                            className="hover:text-white"
                                        >
                                            Cookie Policy
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
                            <p className="text-gray-400">
                                &copy; 2024 Travel Platform. All rights
                                reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
