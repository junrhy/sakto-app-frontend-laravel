import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { 
    UserGroupIcon, 
    TruckIcon, 
    HeartIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState, useRef } from 'react';
import { getHost } from '@/lib/utils';

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
    const productsDropdownRef = useRef<HTMLDivElement>(null);
    const legalDropdownRef = useRef<HTMLDivElement>(null);
    const hostname = getHost();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target as Node)) {
                setIsProductsDropdownOpen(false);
            }
            if (legalDropdownRef.current && !legalDropdownRef.current.contains(event.target as Node)) {
                setIsLegalDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    const projects = {
        Komunidad: [
            {
                title: 'Genealogy',
                description: 'Create and manage family trees with an interactive viewer, relationship mapping, and genealogy tracking features.'
            },
            {
                title: 'Email Integration',
                description: 'Send emails to your customers and clients. Supports multiple email providers and templates. Easy to integrate with your existing apps.'
            },
            {
                title: 'SMS Integration',
                description: 'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.'
            },
            {
                title: 'Contacts Management',
                description: 'Manage your contacts and address book. Keep track of customer information, leads, and business relationships all in one place.'
            },
            {
                title: 'Pages',
                description: 'Create and manage pages, including articles, pages, and posts.'
            },
            {
                title: 'Challenges',
                description: 'Create and manage challenges, including participants, progress, and rewards.'
            },
            {
                title: 'Content Creator',
                description: 'Create and manage content, including articles, pages, and posts.'
            },
            {
                title: 'Digital Products',
                description: 'Create and manage digital products, including ebooks, courses, and memberships.'
            },
            {
                title: 'Healthcare',
                description: 'Manage healthcare services, patient records, and medical appointments.'
            }
        ],
        Logistika: [
            {
                title: 'Payroll System',
                description: 'Employee payroll system with tax calculation, attendance tracking, and automated salary disbursement.'
            },
            {
                title: 'Contacts Management',
                description: 'Manage your contacts and address book. Keep track of customer information, leads, and business relationships all in one place.'
            },
            {
                title: 'Email Integration',
                description: 'Send emails to your customers and clients. Supports multiple email providers and templates. Easy to integrate with your existing apps.'
            },
            {
                title: 'SMS Integration',
                description: 'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.'
            },
            {
                title: 'Warehousing System',
                description: 'Advanced warehouse management with inventory tracking, order fulfillment, and space optimization tools.'
            },
            {
                title: 'Transportation System',
                description: 'Fleet management system with route optimization, vehicle maintenance tracking, and driver scheduling.'
            }
        ],
        Medikal: [
            {
                title: 'Clinical Management',
                description: 'Medical practice management with patient records, appointment scheduling, and billing system.'
            },
            {
                title: 'Payroll System',
                description: 'Employee payroll system with tax calculation, attendance tracking, and automated salary disbursement.'
            },
            {
                title: 'Contacts Management',
                description: 'Manage your contacts and address book. Keep track of customer information, leads, and business relationships all in one place.'
            },
            {
                title: 'Email Integration',
                description: 'Send emails to your customers and clients. Supports multiple email providers and templates. Easy to integrate with your existing apps.'
            },
            {
                title: 'SMS Integration',
                description: 'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.'
            }
        ]
    };

    return (
        <>
            <Head title={`Features - ${hostname}`} />
            <div className="min-h-screen from-white via-indigo-50/30 to-white dark:bg-gray-900">
                {/* Navigation */}
                <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/90 shadow-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center">
                                    <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent dark:text-gray-100">{hostname}</span>
                                </Link>
                            </div>
                            <div className="flex items-center">
                                {auth.user ? (
                                    <Link
                                        href={route('home')}
                                        className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                    >
                                        Home
                                    </Link>
                                ) : (
                                    <>
                                        {/* Solutions Dropdown */}
                                        <div className="relative" ref={productsDropdownRef}>
                                            <button
                                                onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                                                className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                                            >
                                                Solutions
                                                <svg
                                                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {isProductsDropdownOpen && (
                                                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                                    {productsMenuItems.map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-white transition-colors duration-200"
                                                            onClick={() => setIsProductsDropdownOpen(false)}
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <Link
                                            href={route('features')}
                                            className="text-indigo-600 dark:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-indigo-50 dark:bg-indigo-900/30"
                                        >
                                            Features
                                        </Link>
                                        <Link
                                            href={route('pricing')}
                                            className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                        >
                                            Pricing
                                        </Link>
                                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                                        {/* Legal Dropdown */}
                                        <div className="relative" ref={legalDropdownRef}>
                                            <button
                                                onClick={() => setIsLegalDropdownOpen(!isLegalDropdownOpen)}
                                                className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                                            >
                                                Legal
                                                <svg
                                                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${isLegalDropdownOpen ? 'rotate-180' : ''}`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {isLegalDropdownOpen && (
                                                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                                    {legalMenuItems.map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-white transition-colors duration-200"
                                                            onClick={() => setIsLegalDropdownOpen(false)}
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                                        <Link
                                            href={route('login')}
                                            className="group inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                                        >
                                            <span>Log in</span>
                                            <svg className="ml-2 -mr-1 w-4 h-4 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Features Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 bg-clip-text dark:text-white sm:text-5xl">
                            Tailored Solutions for Every Industry
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            From community services to enterprise solutions, we've got you covered
                        </p>
                    </div>

                    {Object.entries(projects).map(([projectName, apps]) => (
                        <div key={projectName} className="mt-16">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    {projectName === 'Community' && <UserGroupIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
                                    {projectName === 'Logistics' && <TruckIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
                                    {projectName === 'Medical' && <HeartIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />}
                                    <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text dark:from-indigo-400 dark:to-purple-400">{projectName}</h2>
                                </div>
                                <Link
                                    href={`/register?project=${projectName.toLowerCase()}`}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    Get Started
                                    <svg className="ml-2 -mr-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            </div>
                            <div className="h-px bg-gradient-to-r from-indigo-500/50 to-transparent mb-6"></div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {apps.map((app) => (
                                    <div key={app.title} className="group relative">
                                        <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 transition duration-200"></div>
                                        <div className="relative p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition duration-200">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                                                {app.title}
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                                {app.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <footer className="bg-white/80 backdrop-blur-sm dark:bg-gray-900/90 border-t border-gray-100 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                © {new Date().getFullYear()} {hostname}. All rights reserved.
                            </p>
                            <div className="flex items-center space-x-6">
                                <Link
                                    href={route('privacy-policy')}
                                    className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
                                >
                                    Privacy Policy
                                </Link>
                                <Link
                                    href={route('terms-and-conditions')}
                                    className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
                                >
                                    Terms
                                </Link>
                                <Link
                                    href={route('cookie-policy')}
                                    className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
                                >
                                    Cookies
                                </Link>
                                <Link
                                    href={route('faq')}
                                    className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
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