import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import { Project, User } from '@/types/index';
import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { Toaster } from 'sonner';

interface SidebarSectionItem {
    id: string;
    label: string;
    isActive?: boolean;
    onSelect?: (id: string) => void;
}

interface CustomerLayoutProps {
    auth?: {
        user?: User;
        project?: Project;
        modules?: string[];
    };
    header?: ReactNode;
    title?: string;
    sidebarSections?: SidebarSectionItem[];
}

export default function CustomerLayout({
    auth,
    header,
    children,
    title = 'Customer Dashboard',
    sidebarSections = [],
}: PropsWithChildren<CustomerLayoutProps>) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pageProps = usePage().props as any;
    const user = auth?.user || pageProps?.auth?.user;
    const projectIdentifier = user?.project_identifier || '';

    // Close sidebar when clicking outside on mobile
    const handleBackdropClick = () => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    // Navigation configuration
    const navigationItems = [
        {
            projectIdentifier: 'community',
            route: 'customer.communities',
            label: 'Communities',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
            ),
        },
        {
            projectIdentifier: 'logistics',
            route: 'customer.logistics',
            label: 'Logistics',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
            ),
        },
        {
            projectIdentifier: 'medical',
            route: 'customer.medical',
            label: 'Medical',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
            ),
        },
        {
            projectIdentifier: 'fnb',
            route: 'customer.fnb',
            label: 'F&B',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
            ),
        },
        {
            projectIdentifier: 'shop',
            route: 'customer.shop',
            label: 'Shop',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
            ),
        },
        {
            projectIdentifier: 'jobs',
            route: 'customer.jobs',
            label: 'Jobs',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
            ),
        },
        {
            projectIdentifier: 'travel',
            route: 'customer.travel',
            label: 'Travel',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            ),
        },
        {
            projectIdentifier: 'education',
            route: 'customer.education',
            label: 'Education',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
            ),
        },
        {
            projectIdentifier: 'finance',
            route: 'customer.finance',
            label: 'Finance',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            ),
        },
        {
            projectIdentifier: 'agriculture',
            route: 'customer.agriculture',
            label: 'Agriculture',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
            ),
        },
        {
            projectIdentifier: 'construction',
            route: 'customer.construction',
            label: 'Construction',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
            ),
        },
        {
            projectIdentifier: 'food-delivery',
            route: 'food-delivery.index',
            label: 'Browse Restaurants',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 7h18M3 12h18M3 17h18"
                />
            ),
        },
        {
            projectIdentifier: 'food-delivery',
            route: 'food-delivery.orders',
            label: 'My Orders',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m4 0V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10m16 0H5m4 0h6"
                />
            ),
        },
        {
            projectIdentifier: 'food-delivery',
            route: 'food-delivery.cart',
            label: 'Cart',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l3-7H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-5-4a2 2 0 11-4 0"
                />
            ),
        },
        {
            projectIdentifier: 'food-delivery',
            route: 'food-delivery.track',
            label: 'Track Order',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            ),
        },
    ];

    const isProfileRoute = route().current('customer.profile.edit');

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head title={title} />
            <Toaster richColors />

            {/* Backdrop Overlay (Mobile) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity lg:hidden"
                    onClick={handleBackdropClick}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-full transform bg-gradient-to-b from-indigo-900 to-indigo-800 transition-transform duration-300 ease-in-out sm:w-80 lg:w-64 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between border-b border-indigo-700 px-4">
                        <Link
                            href="/customer/dashboard"
                            className="flex items-center transition-transform hover:scale-105"
                        >
                            <ApplicationLogo className="block h-7 w-auto fill-current text-white" />
                            <span className="ml-2 text-lg font-black text-white">
                                Neulify
                            </span>
                        </Link>
                        {/* Close button for mobile */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="rounded-md p-1 text-white hover:bg-white/10 lg:hidden"
                            aria-label="Close sidebar"
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
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
                        <div className="flex flex-col space-y-2">
                            {/* Dashboard */}
                            <NavLink
                                href={route('customer.dashboard')}
                                active={route().current('customer.dashboard')}
                                className={`flex items-center px-4 py-2.5 text-white transition-all duration-200 ${
                                    route().current('customer.dashboard')
                                        ? 'bg-white/10 text-white'
                                        : 'hover:bg-white/10'
                                }`}
                            >
                                <svg
                                    className={`mr-3 h-5 w-5 text-white transition-transform duration-200 ${route().current('customer.dashboard') ? 'scale-110' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                                <span
                                    className={`font-medium ${route().current('customer.dashboard') ? 'text-white' : 'text-white/80'}`}
                                >
                                    Dashboard
                                </span>
                            </NavLink>

                            {/* Dynamic Navigation Items */}
                            {navigationItems
                                .filter(
                                    (item) =>
                                        item.projectIdentifier ===
                                        projectIdentifier,
                                )
                                .map((item) => (
                                    <NavLink
                                        key={item.route}
                                        href={route(item.route)}
                                        active={route().current(item.route)}
                                        className={`flex items-center px-4 py-2.5 text-white transition-all duration-200 ${
                                            route().current(item.route)
                                                ? 'bg-white/10 text-white'
                                                : 'hover:bg-white/10'
                                        }`}
                                    >
                                        <svg
                                            className={`mr-3 h-5 w-5 text-white transition-transform duration-200 ${route().current(item.route) ? 'scale-110' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            {item.icon}
                                        </svg>
                                        <span
                                            className={`font-medium ${route().current(item.route) ? 'text-white' : 'text-white/80'}`}
                                        >
                                            {item.label}
                                        </span>
                                    </NavLink>
                                ))}

                            {sidebarSections.length > 0 && (
                                <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
                                    <p className="px-4 text-xs font-semibold uppercase tracking-wide text-indigo-200/70">
                                        This Page
                                    </p>
                                    <div className="flex flex-col space-y-1">
                                        {sidebarSections.map((section) => (
                                            <button
                                                key={section.id}
                                                type="button"
                                                onClick={() => {
                                                    section.onSelect?.(section.id);
                                                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                                        setIsSidebarOpen(false);
                                                    }
                                                }}
                                                className={`flex items-center rounded-md px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                                                    section.isActive
                                                        ? 'bg-white/10 text-white'
                                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                <span className="mr-3 h-2 w-2 rounded-full bg-white/60" />
                                                <span>{section.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* User Profile */}
                    <div className="border-t border-indigo-700 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-medium text-white">
                                    {user?.name?.charAt(0)}
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-indigo-300">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-1">
                            <Link
                                href={route('customer.profile.edit')}
                                className={`flex w-full items-center rounded-lg px-4 py-2 text-sm transition-colors duration-150 ${
                                    isProfileRoute
                                        ? 'bg-white/10 text-white'
                                        : 'text-white hover:bg-white/5'
                                }`}
                            >
                                <svg
                                    className="mr-3 h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                Profile
                            </Link>
                            {/* Log Out */}
                            <Link
                                href={route('customer.logout')}
                                method="post"
                                as="button"
                                className="flex w-full items-center rounded-lg px-4 py-2 text-sm text-white transition-colors duration-150 hover:bg-white/5"
                            >
                                <svg
                                    className="mr-3 h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                                Log Out
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="transition-all duration-300 ease-in-out lg:ml-64">
                {/* Fixed Top Bar */}
                <div className="fixed left-0 right-0 top-0 z-30 border-b border-gray-200 bg-white shadow-sm transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800 lg:left-64">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="rounded-md p-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-indigo-400 lg:hidden"
                            aria-label="Toggle sidebar"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isSidebarOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                        {header && <div className="flex-1 px-4">{header}</div>}
                    </div>
                </div>

                {/* Page Content */}
                <main className="pt-16">
                    <div className="py-4 sm:py-6">
                        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
