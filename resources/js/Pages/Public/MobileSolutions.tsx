import { Head, Link, router } from '@inertiajs/react';
import {
    BadgeCheck,
    Briefcase,
    Crown,
    GraduationCap,
    HardHat,
    Landmark,
    LogOut,
    Mail,
    MapPin,
    Package,
    Plane,
    ShieldCheck,
    ShoppingBag,
    Sprout,
    Stethoscope,
    Truck,
    Users,
    UtensilsCrossed,
} from 'lucide-react';
import React from 'react';

interface Solution {
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    gradient: string;
    comingSoon: boolean;
    projectIdentifier: string;
}

interface UserAddress {
    id: number;
    address_type: string;
    street: string;
    unit_number?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
    is_primary: boolean;
}

interface Subscription {
    id: number;
    identifier: string;
    status: string;
    start_date: string;
    end_date: string;
    plan: {
        id: number;
        name: string;
        slug: string;
        unlimited_access: boolean;
        features: string[];
    } | null;
}

interface Project {
    id: number;
    name: string;
    identifier: string;
    enabledModules: string[];
}

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            contact_number: string;
            email_verified_at: string | null;
            is_admin: boolean;
            identifier: string;
            project_identifier: string;
            created_at: string;
            subscription: Subscription | null;
            addresses: UserAddress[];
        } | null;
        project: Project | null;
    };
}

export default function MobileSolutions({ auth }: PageProps) {
    const handleLogout = () => {
        router.post(route('logout'), {
            mobile: '1',
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
        });
    };

    const primaryAddress =
        auth.user?.addresses?.find((addr) => addr.is_primary) ||
        auth.user?.addresses?.[0];

    const allSolutions: Solution[] = [
        {
            name: 'Community',
            description:
                'Connect teams, manage events, and streamline communications',
            icon: Users,
            href: '/community',
            gradient: 'from-blue-500 to-blue-600',
            comingSoon: false,
            projectIdentifier: 'community',
        },
        {
            name: 'Medical',
            description:
                'Streamline appointments, patient records, and clinic operations',
            icon: Stethoscope,
            href: '/medical',
            gradient: 'from-green-500 to-emerald-600',
            comingSoon: false,
            projectIdentifier: 'medical',
        },
        {
            name: 'Logistics',
            description: 'Manage shipments, routes, and track fleet operations',
            icon: Truck,
            href: '/logistics',
            gradient: 'from-orange-500 to-red-500',
            comingSoon: false,
            projectIdentifier: 'logistics',
        },
        {
            name: 'Shop',
            description:
                'Manage wholesale operations, inventory, and purchasing',
            icon: ShoppingBag,
            href: '/shop',
            gradient: 'from-purple-500 to-pink-500',
            comingSoon: true,
            projectIdentifier: 'shop',
        },
        {
            name: 'Delivery',
            description:
                'Coordinate food service, catering, and supply operations',
            icon: Package,
            href: '/delivery',
            gradient: 'from-red-500 to-rose-600',
            comingSoon: true,
            projectIdentifier: 'delivery',
        },
        {
            name: 'Jobs',
            description: 'Manage hiring, onboarding, and workforce planning',
            icon: Briefcase,
            href: '/jobs',
            gradient: 'from-indigo-500 to-purple-600',
            comingSoon: true,
            projectIdentifier: 'jobs',
        },
        {
            name: 'Travel',
            description:
                'Corporate bookings, expenses, and travel coordination',
            icon: Plane,
            href: '/travel',
            gradient: 'from-cyan-500 to-blue-500',
            comingSoon: true,
            projectIdentifier: 'travel',
        },
        {
            name: 'F&B',
            description: 'Handle restaurant operations, inventory, and orders',
            icon: UtensilsCrossed,
            href: '/fnb',
            gradient: 'from-amber-500 to-orange-600',
            comingSoon: false,
            projectIdentifier: 'fnb',
        },
        {
            name: 'Education',
            description: 'Manage courses, students, and school administration',
            icon: GraduationCap,
            href: '/education',
            gradient: 'from-violet-500 to-purple-600',
            comingSoon: true,
            projectIdentifier: 'education',
        },
        {
            name: 'Finance',
            description:
                'Handle accounting, budgeting, and financial reporting',
            icon: Landmark,
            href: '/finance',
            gradient: 'from-emerald-500 to-teal-600',
            comingSoon: true,
            projectIdentifier: 'finance',
        },
        {
            name: 'Agriculture',
            description: 'Optimize farm operations, yields, and supply chains',
            icon: Sprout,
            href: '/agriculture',
            gradient: 'from-green-500 to-lime-600',
            comingSoon: true,
            projectIdentifier: 'agriculture',
        },
        {
            name: 'Construction',
            description: 'Manage construction projects, teams, and resources',
            icon: HardHat,
            href: '/construction',
            gradient: 'from-yellow-500 to-orange-600',
            comingSoon: true,
            projectIdentifier: 'construction',
        },
    ];

    // Filter solutions based on authentication status
    // If user is logged in, show only their registered app(s)
    // If not logged in, show all apps
    const solutions = auth.user
        ? allSolutions.filter(
              (solution) =>
                  solution.projectIdentifier === auth.user?.project_identifier,
          )
        : allSolutions;

    return (
        <>
            <Head title="Neulify Apps" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                {/* Status Bar */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3 dark:border-gray-800">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {new Date().toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                        })}
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                        Neulify
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="h-1 w-1 rounded-full bg-gray-700 dark:bg-gray-300"></div>
                        <div className="h-1 w-1 rounded-full bg-gray-700 dark:bg-gray-300"></div>
                        <div className="h-1 w-1 rounded-full bg-gray-700 dark:bg-gray-300"></div>
                    </div>
                </div>

                {/* App Grid Container */}
                <div className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
                    {/* Apps Grid */}
                    {solutions.length > 0 ? (
                        auth.user && solutions.length === 1 ? (
                            // Single app layout for authenticated users
                            <div className="flex flex-col items-center justify-center space-y-3 py-4">
                                {/* User Profile Card */}
                                {auth.user && (
                                    <div className="w-full max-w-md">
                                        <div className="rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
                                            {/* User Header with Name and Badges */}
                                            <div className="mb-3 flex flex-wrap items-center gap-1.5">
                                                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                                    {auth.user.name}
                                                </h2>
                                                {auth.user
                                                    .email_verified_at && (
                                                    <span title="Verified">
                                                        <BadgeCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                    </span>
                                                )}
                                                {auth.user.is_admin && (
                                                    <span title="Admin">
                                                        <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    </span>
                                                )}
                                            </div>

                                            {/* Grid Layout for Info */}
                                            <div className="space-y-2">
                                                {/* Email */}
                                                <div className="flex items-start gap-1.5">
                                                    <Mail className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                                                    <span className="text-xs text-gray-900 dark:text-white">
                                                        {auth.user.email}
                                                    </span>
                                                </div>

                                                {/* Two Column Grid */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    {/* Organization */}
                                                    {auth.project && (
                                                        <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                                                Organization
                                                            </p>
                                                            <p className="mt-0.5 text-xs font-semibold text-gray-900 dark:text-white">
                                                                {
                                                                    auth.project
                                                                        .name
                                                                }
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Member Since */}
                                                    <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                                            Member Since
                                                        </p>
                                                        <p className="mt-0.5 text-xs font-semibold text-gray-900 dark:text-white">
                                                            {formatDate(
                                                                auth.user
                                                                    .created_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Subscription - Full Width */}
                                                {auth.user.subscription && (
                                                    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-2 dark:from-blue-900/20 dark:to-indigo-900/20">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1.5">
                                                                <Crown className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                                                                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                                                    {auth.user
                                                                        .subscription
                                                                        .plan
                                                                        ?.name ||
                                                                        'Free'}
                                                                </span>
                                                            </div>
                                                            <span
                                                                className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                                                    auth.user
                                                                        .subscription
                                                                        .status ===
                                                                    'active'
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                                }`}
                                                            >
                                                                {
                                                                    auth.user
                                                                        .subscription
                                                                        .status
                                                                }
                                                            </span>
                                                        </div>
                                                        {auth.user.subscription
                                                            .end_date && (
                                                            <p className="mt-1 text-[10px] text-gray-600 dark:text-gray-400">
                                                                Until{' '}
                                                                {formatDate(
                                                                    auth.user
                                                                        .subscription
                                                                        .end_date,
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Address */}
                                                <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-700">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                                            Address
                                                        </p>
                                                    </div>
                                                    {primaryAddress ? (
                                                        <div className="mt-1 text-xs text-gray-900 dark:text-white">
                                                            <p>
                                                                {
                                                                    primaryAddress.street
                                                                }
                                                                {primaryAddress.unit_number
                                                                    ? `, ${primaryAddress.unit_number}`
                                                                    : ''}
                                                            </p>
                                                            <p>
                                                                {
                                                                    primaryAddress.city
                                                                }
                                                                ,{' '}
                                                                {
                                                                    primaryAddress.state
                                                                }{' '}
                                                                {
                                                                    primaryAddress.postal_code
                                                                }
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-1">
                                                            <p className="text-[10px] italic text-gray-500 dark:text-gray-400">
                                                                No address
                                                                specified
                                                            </p>
                                                            <Link
                                                                href="/profile"
                                                                className="mt-0.5 inline-flex items-center text-[10px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                Add address →
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* App Card */}
                                {solutions.map((solution) => {
                                    const Icon = solution.icon;
                                    const isDisabled = solution.comingSoon;

                                    return (
                                        <div
                                            key={solution.name}
                                            className="w-full max-w-md"
                                        >
                                            <div className="rounded-2xl bg-white p-5 shadow-lg transition-all duration-300 dark:bg-gray-800">
                                                {/* App Icon */}
                                                <div className="mb-4 flex justify-center">
                                                    <div
                                                        className={`relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ${solution.gradient}`}
                                                    >
                                                        <Icon className="h-10 w-10 text-white" />
                                                    </div>
                                                </div>

                                                {/* App Details */}
                                                <div className="text-center">
                                                    <h2 className="mb-1.5 text-lg font-bold text-gray-900 dark:text-white">
                                                        {solution.name}
                                                    </h2>
                                                    <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
                                                        {solution.description}
                                                    </p>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-row justify-center gap-2">
                                                        {/* Open App Button */}
                                                        <Link
                                                            href={solution.href}
                                                            className="group/btn flex-1"
                                                        >
                                                            <div
                                                                className={`inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 ${solution.gradient}`}
                                                            >
                                                                <span>
                                                                    Open
                                                                </span>
                                                                <svg
                                                                    className="ml-1 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        </Link>

                                                        {/* Logout Button */}
                                                        <button
                                                            onClick={
                                                                handleLogout
                                                            }
                                                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-red-600 hover:shadow-lg active:scale-95 dark:bg-red-600 dark:hover:bg-red-700"
                                                        >
                                                            <LogOut className="h-4 w-4" />
                                                            <span>Logout</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            // Multi-app grid layout for non-authenticated users
                            <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 lg:gap-8">
                                {solutions.map((solution) => {
                                    const Icon = solution.icon;
                                    const isDisabled = solution.comingSoon;

                                    const appContent = (
                                        <div className="group relative">
                                            {/* App Icon */}
                                            <div
                                                className={`relative mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-all duration-300 sm:h-20 sm:w-20 lg:h-24 lg:w-24 ${
                                                    solution.gradient
                                                } ${
                                                    isDisabled
                                                        ? 'cursor-not-allowed opacity-50 saturate-0'
                                                        : 'hover:scale-110 hover:shadow-2xl active:scale-95'
                                                }`}
                                            >
                                                <Icon className="h-8 w-8 text-white sm:h-10 sm:w-10 lg:h-12 lg:w-12" />

                                                {/* Coming Soon Badge */}
                                                {isDisabled && (
                                                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-[8px] font-bold text-white dark:bg-gray-200 dark:text-gray-900">
                                                        !
                                                    </div>
                                                )}

                                                {/* Shine Effect */}
                                                {!isDisabled && (
                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                                )}
                                            </div>

                                            {/* App Name */}
                                            <div className="text-center">
                                                <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                                                    {solution.name}
                                                </p>
                                                {isDisabled && (
                                                    <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                                                        Soon
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );

                                    return isDisabled ? (
                                        <div key={solution.name}>
                                            {appContent}
                                        </div>
                                    ) : (
                                        <Link
                                            key={solution.name}
                                            href={solution.href}
                                        >
                                            {appContent}
                                        </Link>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="mb-4 rounded-full bg-gray-200 p-6 dark:bg-gray-800">
                                <svg
                                    className="h-12 w-12 text-gray-400 dark:text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                    />
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                No apps available
                            </p>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Please contact support if you need access to
                                additional apps.
                            </p>
                        </div>
                    )}

                    {/* Dock Indicator */}
                    <div className="mt-12 flex justify-center">
                        <div className="h-1 w-20 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                    </div>
                </div>

                {/* Bottom Info */}
                <div className="fixed bottom-4 left-0 right-0 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} Neulify. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </>
    );
}
