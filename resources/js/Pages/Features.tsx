import ApplicationLogo from '@/Components/ApplicationLogo';
import { getHost } from '@/lib/utils';
import {
    HeartIcon,
    TruckIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Features({ auth }: PageProps) {
    const hostname = getHost();
    const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
    const [isLegalDropdownOpen, setIsLegalDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(
        hostname === 'sakto' ? 'Komunidad' : 'Community',
    );
    const productsDropdownRef = useRef<HTMLDivElement>(null);
    const legalDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                productsDropdownRef.current &&
                !productsDropdownRef.current.contains(event.target as Node)
            ) {
                setIsProductsDropdownOpen(false);
            }
            if (
                legalDropdownRef.current &&
                !legalDropdownRef.current.contains(event.target as Node)
            ) {
                setIsLegalDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const productsMenuItems =
        hostname === 'sakto'
            ? [
                  { name: 'Komunidad', href: route('community') },
                  { name: 'Logistika', href: route('logistics') },
                  { name: 'Medikal', href: route('medical') },
                  { name: 'Lakbay', href: route('travel.landing') },
                  { name: 'Hatid', href: route('delivery') },
                  { name: 'Taohan', href: route('jobs') },
                  { name: 'Merkado', href: route('shop') },
              ]
            : [
                  { name: 'Community', href: route('community') },
                  { name: 'Logistics', href: route('logistics') },
                  { name: 'Medical', href: route('medical') },
                  { name: 'Travel', href: route('travel.landing') },
                  { name: 'Delivery', href: route('delivery') },
                  { name: 'Jobs', href: route('jobs') },
                  { name: 'Shop', href: route('shop') },
              ];

    const legalMenuItems = [
        { name: 'Privacy Policy', href: route('privacy-policy') },
        { name: 'Terms & Conditions', href: route('terms-and-conditions') },
        { name: 'Cookie Policy', href: route('cookie-policy') },
        { name: 'FAQ', href: route('faq') },
    ];

    const projectFeatures = {
        [hostname === 'sakto' ? 'Komunidad' : 'Community']: {
            name: hostname === 'sakto' ? 'Komunidad' : 'Community',
            project: 'community',
            icon: UserGroupIcon,
            features: [
                {
                    title: 'Genealogy',
                    description:
                        'Create and manage family trees with an interactive viewer, relationship mapping, and genealogy tracking features.',
                },
                {
                    title: 'Email Integration',
                    description:
                        'Send emails to your customers and clients. Supports multiple email providers and templates. Easy to integrate with your existing apps.',
                },
                {
                    title: 'SMS Integration',
                    description:
                        'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.',
                },
                {
                    title: 'Contacts Management',
                    description:
                        'Manage your contacts and address book. Keep track of customer information, leads, and business relationships all in one place.',
                },
                {
                    title: 'Pages',
                    description:
                        'Create and manage pages, including articles, pages, and posts.',
                },
                {
                    title: 'Challenges',
                    description:
                        'Create and manage challenges, including participants, progress, and rewards.',
                },
                {
                    title: 'Content Creator',
                    description:
                        'Create and manage content, including articles, pages, and posts.',
                },
                {
                    title: 'Digital Products',
                    description:
                        'Create and manage digital products, including ebooks, courses, and memberships.',
                },
                {
                    title: 'Healthcare',
                    description:
                        'Manage healthcare services, patient records, and medical appointments.',
                },
            ],
        },
        [hostname === 'sakto' ? 'Logistika' : 'Logistics']: {
            name: hostname === 'sakto' ? 'Logistika' : 'Logistics',
            project: 'logistics',
            icon: TruckIcon,
            features: [
                {
                    title: 'Payroll System',
                    description:
                        'Employee payroll system with tax calculation, attendance tracking, and automated salary disbursement.',
                },
                {
                    title: 'Contacts Management',
                    description:
                        'Manage your contacts and address book. Keep track of customer information, leads, and business relationships all in one place.',
                },
                {
                    title: 'Email Integration',
                    description:
                        'Send emails to your customers and clients. Supports multiple email providers and templates. Easy to integrate with your existing apps.',
                },
                {
                    title: 'SMS Integration',
                    description:
                        'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.',
                },
                {
                    title: 'Warehousing System',
                    description:
                        'Advanced warehouse management with inventory tracking, order fulfillment, and space optimization tools.',
                },
                {
                    title: 'Transportation System',
                    description:
                        'Fleet management system with route optimization, vehicle maintenance tracking, and driver scheduling.',
                },
            ],
        },
        [hostname === 'sakto' ? 'Medikal' : 'Medical']: {
            name: hostname === 'sakto' ? 'Medikal' : 'Medical',
            project: 'medical',
            icon: HeartIcon,
            features: [
                {
                    title: 'Clinical Management',
                    description:
                        'Medical practice management with patient records, appointment scheduling, and billing system.',
                },
                {
                    title: 'Payroll System',
                    description:
                        'Employee payroll system with tax calculation, attendance tracking, and automated salary disbursement.',
                },
                {
                    title: 'Contacts Management',
                    description:
                        'Manage your contacts and address book. Keep track of customer information, leads, and business relationships all in one place.',
                },
                {
                    title: 'Email Integration',
                    description:
                        'Send emails to your customers and clients. Supports multiple email providers and templates. Easy to integrate with your existing apps.',
                },
                {
                    title: 'SMS Integration',
                    description:
                        'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.',
                },
            ],
        },
        [hostname === 'sakto' ? 'Lakbay' : 'Travel']: {
            name: hostname === 'sakto' ? 'Lakbay' : 'Travel',
            project: 'travel',
            icon: TruckIcon,
            features: [
                {
                    title: 'Travel Booking',
                    description:
                        'Complete travel booking system with flight, hotel, and car rental reservations. Real-time availability and pricing.',
                },
                {
                    title: 'Itinerary Management',
                    description:
                        'Create and manage travel itineraries with detailed schedules, bookings, and travel documents.',
                },
                {
                    title: 'Customer Management',
                    description:
                        'Manage travel customers with booking history, preferences, and loyalty programs.',
                },
                {
                    title: 'Email Integration',
                    description:
                        'Send travel confirmations and updates to customers. Supports multiple email providers and templates.',
                },
                {
                    title: 'SMS Integration',
                    description:
                        'Send travel notifications and updates via SMS. Supports Twilio and Semaphore integration.',
                },
                {
                    title: 'Payment Processing',
                    description:
                        'Secure payment processing for travel bookings with multiple payment methods and currency support.',
                },
            ],
        },
        [hostname === 'sakto' ? 'Hatid' : 'Delivery']: {
            name: hostname === 'sakto' ? 'Hatid' : 'Delivery',
            project: 'delivery',
            icon: TruckIcon,
            features: [
                {
                    title: 'Delivery Management',
                    description:
                        'Complete delivery management system with order tracking, route optimization, and delivery scheduling.',
                },
                {
                    title: 'Driver Management',
                    description:
                        'Manage delivery drivers with scheduling, performance tracking, and route assignments.',
                },
                {
                    title: 'Customer Management',
                    description:
                        'Manage delivery customers with order history, preferences, and delivery addresses.',
                },
                {
                    title: 'Email Integration',
                    description:
                        'Send delivery notifications and updates to customers. Supports multiple email providers and templates.',
                },
                {
                    title: 'SMS Integration',
                    description:
                        'Send delivery notifications and tracking updates via SMS. Supports Twilio and Semaphore integration.',
                },
                {
                    title: 'Real-time Tracking',
                    description:
                        'Real-time delivery tracking with GPS location updates and estimated delivery times.',
                },
            ],
        },
        [hostname === 'sakto' ? 'Taohan' : 'Jobs']: {
            name: hostname === 'sakto' ? 'Taohan' : 'Jobs',
            project: 'jobs',
            icon: UserGroupIcon,
            features: [
                {
                    title: 'Job Posting',
                    description:
                        'Create and manage job postings with detailed descriptions, requirements, and application tracking.',
                },
                {
                    title: 'Candidate Management',
                    description:
                        'Manage job candidates with applications, resumes, and interview scheduling.',
                },
                {
                    title: 'Employer Management',
                    description:
                        'Manage employers with company profiles, job postings, and candidate matching.',
                },
                {
                    title: 'Email Integration',
                    description:
                        'Send job notifications and updates to candidates and employers. Supports multiple email providers and templates.',
                },
                {
                    title: 'SMS Integration',
                    description:
                        'Send job alerts and notifications via SMS. Supports Twilio and Semaphore integration.',
                },
                {
                    title: 'Application Tracking',
                    description:
                        'Track job applications with status updates, interview scheduling, and hiring pipeline management.',
                },
            ],
        },
        [hostname === 'sakto' ? 'Merkado' : 'Shop']: {
            name: hostname === 'sakto' ? 'Merkado' : 'Shop',
            project: 'shop',
            icon: TruckIcon,
            features: [
                {
                    title: 'Product Management',
                    description:
                        'Complete product management system with inventory tracking, pricing, and product variations.',
                },
                {
                    title: 'Order Management',
                    description:
                        'Manage orders with processing, fulfillment, and shipping tracking. Complete order lifecycle management.',
                },
                {
                    title: 'Customer Management',
                    description:
                        'Manage shop customers with purchase history, preferences, and loyalty programs.',
                },
                {
                    title: 'Email Integration',
                    description:
                        'Send order confirmations and updates to customers. Supports multiple email providers and templates.',
                },
                {
                    title: 'SMS Integration',
                    description:
                        'Send order notifications and updates via SMS. Supports Twilio and Semaphore integration.',
                },
                {
                    title: 'Payment Processing',
                    description:
                        'Secure payment processing for online orders with multiple payment methods and currency support.',
                },
            ],
        },
    };

    return (
        <>
            <Head title={`Features - ${hostname}`} />
            <div className="min-h-screen from-white via-indigo-50/30 to-white dark:bg-gray-900">
                {/* Navigation */}
                <nav className="fixed left-1/2 top-4 z-50 mx-auto w-[95%] max-w-7xl -translate-x-1/2 rounded-2xl border border-gray-100 bg-white/90 shadow-lg shadow-gray-200/50 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80 dark:shadow-gray-900/50">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-100" />
                                    <span className="ml-2 bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-xl font-bold text-transparent dark:text-gray-100">
                                        {hostname === 'sakto'
                                            ? 'Sakto Solutions'
                                            : hostname}
                                    </span>
                                </Link>
                            </div>
                            <div className="flex items-center">
                                {/* Solutions Dropdown */}
                                <div
                                    className="relative"
                                    ref={productsDropdownRef}
                                >
                                    <button
                                        onClick={() =>
                                            setIsProductsDropdownOpen(
                                                !isProductsDropdownOpen,
                                            )
                                        }
                                        className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Our Solutions
                                        <svg
                                            className={`ml-1 h-4 w-4 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>
                                    {isProductsDropdownOpen && (
                                        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                            {productsMenuItems.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className="block px-4 py-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
                                                    onClick={() =>
                                                        setIsProductsDropdownOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {hostname === 'neulify' && (
                                    <Link
                                        href={route('neulify')}
                                        className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Our Company
                                    </Link>
                                )}
                                <Link
                                    href={route('features')}
                                    className="rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 transition-colors duration-200 dark:bg-indigo-900/30 dark:text-indigo-400"
                                >
                                    Features
                                </Link>
                                <Link
                                    href={route('pricing')}
                                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white"
                                >
                                    Pricing
                                </Link>
                                <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                                {/* Legal Dropdown */}
                                <div
                                    className="relative"
                                    ref={legalDropdownRef}
                                >
                                    <button
                                        onClick={() =>
                                            setIsLegalDropdownOpen(
                                                !isLegalDropdownOpen,
                                            )
                                        }
                                        className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Legal
                                        <svg
                                            className={`ml-1 h-4 w-4 transition-transform duration-200 ${isLegalDropdownOpen ? 'rotate-180' : ''}`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>
                                    {isLegalDropdownOpen && (
                                        <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                            {legalMenuItems.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className="block px-4 py-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
                                                    onClick={() =>
                                                        setIsLegalDropdownOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Features Section */}
                <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:text-white sm:text-5xl">
                            Tailored Solutions for Every Industry
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            From community services to enterprise solutions,
                            we've got you covered
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="mt-12 flex justify-center">
                        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                            {Object.entries(projectFeatures).map(
                                ([key, project]) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                            activeTab === key
                                                ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-700 dark:text-indigo-400'
                                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                                        }`}
                                    >
                                        <project.icon className="h-5 w-5" />
                                        {project.name}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-12">
                        {Object.entries(projectFeatures).map(
                            ([key, project]) => (
                                <div
                                    key={key}
                                    className={
                                        activeTab === key ? 'block' : 'hidden'
                                    }
                                >
                                    <div className="mb-6 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <project.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                            <h2 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent dark:from-indigo-400 dark:to-purple-400">
                                                {project.name}
                                            </h2>
                                        </div>
                                        <Link
                                            href={
                                                project.project === 'community'
                                                    ? route('community')
                                                    : project.project ===
                                                        'logistics'
                                                      ? route('logistics')
                                                      : project.project ===
                                                          'medical'
                                                        ? route('medical')
                                                        : project.project ===
                                                            'travel'
                                                          ? route(
                                                                'travel.landing',
                                                            )
                                                          : project.project ===
                                                              'delivery'
                                                            ? route('delivery')
                                                            : project.project ===
                                                                'jobs'
                                                              ? route('jobs')
                                                              : project.project ===
                                                                  'shop'
                                                                ? route('shop')
                                                                : '#'
                                            }
                                            className="inline-flex items-center rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-indigo-500 hover:to-purple-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            Learn More
                                            <svg
                                                className="-mr-1 ml-2 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                />
                                            </svg>
                                        </Link>
                                    </div>
                                    <div className="mb-6 h-px bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        {project.features.map((feature) => (
                                            <div
                                                key={feature.title}
                                                className="group relative"
                                            >
                                                <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 transition duration-200 group-hover:opacity-20 dark:group-hover:opacity-30"></div>
                                                <div className="relative rounded-lg bg-white p-4 shadow-sm transition duration-200 hover:shadow-lg hover:shadow-indigo-500/10 dark:bg-gray-800">
                                                    <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                                                        {feature.title}
                                                    </h3>
                                                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                © {new Date().getFullYear()} {hostname}. All
                                rights reserved.
                            </p>
                            <div className="flex items-center space-x-6">
                                <Link
                                    href={route('privacy-policy')}
                                    className="text-sm text-gray-600 transition-colors duration-200 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                >
                                    Privacy Policy
                                </Link>
                                <Link
                                    href={route('terms-and-conditions')}
                                    className="text-sm text-gray-600 transition-colors duration-200 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                >
                                    Terms
                                </Link>
                                <Link
                                    href={route('cookie-policy')}
                                    className="text-sm text-gray-600 transition-colors duration-200 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                >
                                    Cookies
                                </Link>
                                <Link
                                    href={route('faq')}
                                    className="text-sm text-gray-600 transition-colors duration-200 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                >
                                    FAQ
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
