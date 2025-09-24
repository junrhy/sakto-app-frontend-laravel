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
    const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
    const [isLegalDropdownOpen, setIsLegalDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Komunidad');
    const productsDropdownRef = useRef<HTMLDivElement>(null);
    const legalDropdownRef = useRef<HTMLDivElement>(null);
    const hostname = getHost();

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

    const productsMenuItems = [
        { name: 'Komunidad', href: route('community') },
        { name: 'Logistika', href: route('logistics') },
        { name: 'Medikal', href: route('medical') },
        { name: 'Lakbay', href: route('travel.landing') },
        { name: 'Hatid', href: route('delivery') },
        { name: 'Taohan', href: route('jobs') },
        { name: 'Merkado', href: route('shop') },
    ];

    const legalMenuItems = [
        { name: 'Privacy Policy', href: route('privacy-policy') },
        { name: 'Terms & Conditions', href: route('terms-and-conditions') },
        { name: 'Cookie Policy', href: route('cookie-policy') },
        { name: 'FAQ', href: route('faq') },
    ];

    const projectFeatures = {
        Komunidad: {
            name: 'Komunidad',
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
        Logistika: {
            name: 'Logistika',
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
        Medikal: {
            name: 'Medikal',
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
    };

    return (
        <>
            <Head title={`Features - ${hostname}`} />
            <div className="min-h-screen from-white via-indigo-50/30 to-white dark:bg-gray-900">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center">
                                    <span className="bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-xl font-bold text-transparent dark:text-gray-100">
                                        {hostname}
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
                                        Solutions
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
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
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
                                            href={`/register?project=${project.project}`}
                                            className="inline-flex items-center rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-indigo-500 hover:to-purple-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            Get Started
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
