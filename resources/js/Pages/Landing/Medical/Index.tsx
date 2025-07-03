import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useEffect, useState } from 'react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    experience: string;
    rating: number;
    reviews: number;
    image: string;
    available: boolean;
}

interface Service {
    id: number;
    name: string;
    description: string;
    icon: string;
    price: string;
}

export default function Medical({ auth }: PageProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const featuredDoctors: Doctor[] = [
        {
            id: 1,
            name: 'Dr. Maria Santos',
            specialty: 'Cardiology',
            experience: '15 years',
            rating: 4.9,
            reviews: 234,
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            available: true
        },
        {
            id: 2,
            name: 'Dr. John Rodriguez',
            specialty: 'Dermatology',
            experience: '12 years',
            rating: 4.8,
            reviews: 189,
            image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            available: true
        },
        {
            id: 3,
            name: 'Dr. Sarah Kim',
            specialty: 'Pediatrics',
            experience: '10 years',
            rating: 4.9,
            reviews: 312,
            image: 'https://images.unsplash.com/photo-1594824475544-3c0b0c0c0c0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            available: true
        },
        {
            id: 4,
            name: 'Dr. Michael Chen',
            specialty: 'Orthopedics',
            experience: '18 years',
            rating: 4.7,
            reviews: 156,
            image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            available: false
        }
    ];

    const medicalServices: Service[] = [
        {
            id: 1,
            name: 'Telemedicine',
            description: 'Virtual consultations with healthcare professionals from the comfort of your home.',
            icon: '🏥',
            price: 'From ₱500'
        },
        {
            id: 2,
            name: 'Health Records',
            description: 'Secure digital storage and management of your medical history and records.',
            icon: '📋',
            price: 'Free'
        },
        {
            id: 3,
            name: 'Appointment Booking',
            description: 'Easy scheduling and management of medical appointments with specialists.',
            icon: '📅',
            price: 'Free'
        },
        {
            id: 4,
            name: 'Prescription Management',
            description: 'Digital prescriptions and medication tracking for better health outcomes.',
            icon: '💊',
            price: 'From ₱200'
        }
    ];

    const specialties = [
        { id: 'all', name: 'All Specialties' },
        { id: 'cardiology', name: 'Cardiology' },
        { id: 'dermatology', name: 'Dermatology' },
        { id: 'pediatrics', name: 'Pediatrics' },
        { id: 'orthopedics', name: 'Orthopedics' },
        { id: 'neurology', name: 'Neurology' },
        { id: 'psychiatry', name: 'Psychiatry' },
    ];

    return (
        <>
            <Head title="Medical Platform - Healthcare Solutions" />
            <div className="min-h-screen bg-gray-50">
                {/* Navigation */}
                <nav className="bg-white shadow-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <div className="flex-shrink-0 flex items-center">
                                    <ApplicationLogo className="block h-9 w-auto" />
                                    <span className="ml-2 text-xl font-bold text-gray-900">Medical</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login', { project: 'medical' })}
                                            className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register', { project: 'medical' })}
                                            className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-800">
                    <div className="absolute inset-0">
                        <img
                            className="w-full h-full object-cover opacity-10"
                            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                            alt="Medical background"
                        />
                    </div>
                    <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Your Health, Our Priority
                            </h1>
                            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
                                Connect with healthcare professionals, manage your health records, and access quality medical care anytime, anywhere.
                            </p>
                            <div className="mt-10">
                                <Link
                                    href={route('register', { project: 'medical' })}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Comprehensive Healthcare Services
                        </h2>
                        <p className="mt-4 text-lg text-gray-500">
                            Everything you need for better health management in one platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {medicalServices.map((service) => (
                            <div key={service.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                                <div className="text-4xl mb-4">{service.icon}</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                                <p className="text-gray-600 mb-4">{service.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-blue-600 font-semibold">{service.price}</span>
                                    <Link
                                        href={route('register', { project: 'medical' })}
                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                    >
                                        Learn More →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Featured Doctors Section */}
                <div className="bg-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Meet Our Healthcare Professionals
                            </h2>
                            <p className="mt-4 text-lg text-gray-500">
                                Experienced doctors ready to provide quality care
                            </p>
                        </div>

                        {/* Specialty Filter */}
                        <div className="mb-8">
                            <div className="flex space-x-4 overflow-x-auto pb-4 justify-center">
                                {specialties.map((specialty) => (
                                    <button
                                        key={specialty.id}
                                        onClick={() => setSelectedSpecialty(specialty.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                                            selectedSpecialty === specialty.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {specialty.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredDoctors.map((doctor) => (
                                <div key={doctor.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                                    <div className="relative">
                                        <img
                                            className="w-full h-48 object-cover"
                                            src={doctor.image}
                                            alt={doctor.name}
                                        />
                                        {doctor.available && (
                                            <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                                                Available
                                            </span>
                                        )}
                                        {!doctor.available && (
                                            <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                                                Unavailable
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                                        <p className="text-sm text-blue-600 font-medium">{doctor.specialty}</p>
                                        <p className="text-sm text-gray-500">{doctor.experience} experience</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span className="ml-1 text-sm text-gray-600">{doctor.rating}</span>
                                                <span className="ml-1 text-sm text-gray-500">({doctor.reviews} reviews)</span>
                                            </div>
                                            <Link
                                                href={route('register', { project: 'medical' })}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                Book Appointment
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-gray-50 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Why Choose Our Medical Platform?
                            </h2>
                            <p className="mt-4 text-lg text-gray-500">
                                Advanced features designed for modern healthcare
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Secure & Private</h3>
                                <p className="text-gray-600">Your health data is protected with industry-leading security standards and HIPAA compliance.</p>
                            </div>

                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">24/7 Access</h3>
                                <p className="text-gray-600">Access your health records and book appointments anytime, anywhere with our mobile app.</p>
                            </div>

                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white mb-4">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Quality Care</h3>
                                <p className="text-gray-600">Connect with verified healthcare professionals and receive personalized care plans.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-blue-600">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
                        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            <span className="block">Ready to take control of your health?</span>
                            <span className="block text-blue-200">Start your journey today.</span>
                        </h2>
                        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                            <div className="inline-flex rounded-md shadow">
                                <Link
                                    href={route('register', { project: 'medical' })}
                                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
                                >
                                    Get Started
                                </Link>
                            </div>
                            <div className="ml-3 inline-flex rounded-md shadow">
                                <Link
                                    href={route('login', { project: 'medical' })}
                                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-400"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-white">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
                        <div className="flex justify-center space-x-6 md:order-2">
                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Facebook</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Instagram</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.09 1.064.077 1.791.232 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.233.636.388 1.363.465 2.427.077 1.067.09 1.407.09 4.123v.08c0 2.643-.012 2.987-.09 4.043-.077 1.064-.232 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.233-1.363.388-2.427.465-1.067.077-1.407.09-4.123.09h-.08c-2.643 0-2.987-.012-4.043-.09-1.064-.077-1.791-.232-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.233-.636-.388-1.363-.465-2.427-.077-1.022-.087-1.379-.087-4.123v-.08c0-2.643.012-2.987.09-4.043.077-1.064.232-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.233 1.363-.388 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Twitter</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                        </div>
                        <div className="mt-8 md:mt-0 md:order-1">
                            <p className="text-center text-base text-gray-400">
                                &copy; 2024 Medical Platform. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
} 