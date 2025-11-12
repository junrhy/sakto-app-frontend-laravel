import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Head, Link, router } from '@inertiajs/react';
import {
    BadgeCheck,
    Briefcase,
    Building2,
    Clock,
    Crown,
    GraduationCap,
    HardHat,
    Landmark,
    LogOut,
    Mail,
    MapPin,
    MoreHorizontal,
    Package,
    Plane,
    Plus,
    RotateCcw,
    ShieldCheck,
    ShoppingBag,
    Sprout,
    Stethoscope,
    Truck,
    Users,
    UtensilsCrossed,
    X,
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
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');

    const portalLabelMap: Record<string, string> = {
        client: 'Admin Portal',
        employee: 'Employee Portal',
        merchant: 'Merchant Portal',
        customer: 'Customer Portal',
    };

    const headerLabel = (typeParam && portalLabelMap[typeParam]) || 'Apps';

    const storageKey = 'mobileSolutions.selectedApps';

    const hasTypeSelection = !auth.user && Boolean(typeParam);
    const canSelectType = !auth.user && !typeParam;

    const handleLogout = () => {
        router.post(
            route('logout'),
            {
                mobile: '1',
            },
            {
                onFinish: () => router.visit('/public?mobile=1'),
            },
        );
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

    // Helper function to get dynamic href based on type
    const getHref = React.useCallback(
        (projectIdentifier: string, defaultHref: string) => {
            if (typeParam === 'customer') {
                return `/customer/login?project=${projectIdentifier}`;
            } else if (typeParam === 'employee') {
                return `/employee/login?project=${projectIdentifier}`;
            } else if (typeParam === 'merchant') {
                return `/merchant/login?project=${projectIdentifier}`;
            } else if (typeParam === 'client') {
                return `/login?project=${projectIdentifier}`;
            }
            return defaultHref;
        },
        [typeParam],
    );

    const allSolutions: Solution[] = React.useMemo(
        () => [
            {
                name: 'Community',
                description:
                    'Connect teams, manage events, and streamline communications',
                icon: Users,
                href: getHref('community', '/community'),
                gradient: 'from-blue-500 to-blue-600',
                comingSoon: false,
                projectIdentifier: 'community',
            },
            {
                name: 'Medical',
                description:
                    'Streamline appointments, patient records, and clinic operations',
                icon: Stethoscope,
                href: getHref('medical', '/medical'),
                gradient: 'from-green-500 to-emerald-600',
                comingSoon: false,
                projectIdentifier: 'medical',
            },
            {
                name: 'Logistics',
                description:
                    'Manage shipments, routes, and track fleet operations',
                icon: Truck,
                href: getHref('logistics', '/logistics'),
                gradient: 'from-orange-500 to-red-500',
                comingSoon: false,
                projectIdentifier: 'logistics',
            },
            {
                name: 'Shop',
                description:
                    'Manage wholesale operations, inventory, and purchasing',
                icon: ShoppingBag,
                href: getHref('shop', '/shop'),
                gradient: 'from-purple-500 to-pink-500',
                comingSoon: false,
                projectIdentifier: 'shop',
            },
            {
                name: 'Delivery',
                description:
                    'Coordinate food service, catering, and supply operations',
                icon: Package,
                href: getHref('delivery', '/delivery'),
                gradient: 'from-red-500 to-rose-600',
                comingSoon: false,
                projectIdentifier: 'delivery',
            },
            {
                name: 'HR',
                description: 'Manage your own human resources business',
                icon: Briefcase,
                href: getHref('hr', '/hr'),
                gradient: 'from-indigo-500 to-purple-600',
                comingSoon: false,
                projectIdentifier: 'hr',
            },
            {
                name: 'Travel',
                description:
                    'Corporate bookings, expenses, and travel coordination',
                icon: Plane,
                href: getHref('travel', '/travel'),
                gradient: 'from-cyan-500 to-blue-500',
                comingSoon: false,
                projectIdentifier: 'travel',
            },
            {
                name: 'F&B',
                description:
                    'Handle restaurant operations, inventory, and orders',
                icon: UtensilsCrossed,
                href: getHref('fnb', '/fnb'),
                gradient: 'from-amber-500 to-orange-600',
                comingSoon: false,
                projectIdentifier: 'fnb',
            },
            {
                name: 'Education',
                description:
                    'Manage courses, students, and school administration',
                icon: GraduationCap,
                href: getHref('education', '/education'),
                gradient: 'from-violet-500 to-purple-600',
                comingSoon: false,
                projectIdentifier: 'education',
            },
            {
                name: 'Finance',
                description:
                    'Handle accounting, budgeting, and financial reporting',
                icon: Landmark,
                href: getHref('finance', '/finance'),
                gradient: 'from-emerald-500 to-teal-600',
                comingSoon: true,
                projectIdentifier: 'finance',
            },
            {
                name: 'Agriculture',
                description:
                    'Optimize farm operations, yields, and supply chains',
                icon: Sprout,
                href: getHref('agriculture', '/agriculture'),
                gradient: 'from-green-500 to-lime-600',
                comingSoon: true,
                projectIdentifier: 'agriculture',
            },
            {
                name: 'Construction',
                description:
                    'Manage construction projects, teams, and resources',
                icon: HardHat,
                href: getHref('construction', '/construction'),
                gradient: 'from-yellow-500 to-orange-600',
                comingSoon: false,
                projectIdentifier: 'construction',
            },
        ],
        [getHref],
    );

    const [selectedAppIds, setSelectedAppIds] = React.useState<string[]>(() => {
        if (auth.user) {
            return allSolutions
                .filter(
                    (solution) =>
                        solution.projectIdentifier ===
                        auth.user?.project_identifier,
                )
                .map((solution) => solution.projectIdentifier);
        }

        if (typeof window !== 'undefined') {
            const stored = window.localStorage.getItem(storageKey);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        return parsed.filter(
                            (identifier): identifier is string =>
                                typeof identifier === 'string' &&
                                allSolutions.some(
                                    (solution) =>
                                        solution.projectIdentifier ===
                                        identifier,
                                ),
                        );
                    }
                } catch (error) {
                    console.error(
                        'Failed to parse stored app selections',
                        error,
                    );
                }
            }
        }

        return [];
    });

    const selectedSolutions = allSolutions.filter((solution) =>
        selectedAppIds.includes(solution.projectIdentifier),
    );

    const availableSolutions = allSolutions.filter(
        (solution) =>
            !solution.comingSoon &&
            !selectedAppIds.includes(solution.projectIdentifier),
    );

    const [removalTarget, setRemovalTarget] = React.useState<string | null>(
        null,
    );
    const longPressTimeoutRef = React.useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    const handleAddSolution = (identifier: string) => {
        setRemovalTarget(null);
        setSelectedAppIds((prev) =>
            prev.includes(identifier) ? prev : [...prev, identifier],
        );
    };

    const handleRemoveSolution = (identifier: string) => {
        setSelectedAppIds((prev) => prev.filter((id) => id !== identifier));
    };

    React.useEffect(() => {
        if (!auth.user && typeof window !== 'undefined') {
            window.localStorage.setItem(
                storageKey,
                JSON.stringify(selectedAppIds),
            );
        }
    }, [selectedAppIds, auth.user]);

    const startLongPress = React.useCallback((identifier: string) => {
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
        }

        longPressTimeoutRef.current = setTimeout(() => {
            setRemovalTarget(identifier);
        }, 600);
    }, []);

    const clearLongPress = React.useCallback(() => {
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
        }
    }, []);

    React.useEffect(() => {
        return () => {
            if (longPressTimeoutRef.current) {
                clearTimeout(longPressTimeoutRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (!removalTarget) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest('[data-app-tile-id]')) {
                return;
            }

            setRemovalTarget(null);
            clearLongPress();
        };

        document.addEventListener('pointerdown', handlePointerDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [removalTarget, clearLongPress]);

    const handleResetFactorySettings = React.useCallback(() => {
        setSelectedAppIds([]);
        setRemovalTarget(null);
        clearLongPress();

        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(storageKey);
        }

        router.visit('/public?mobile=1');
    }, [clearLongPress, router]);

    React.useEffect(() => {
        if (auth.user) {
            const userSolutions = allSolutions
                .filter(
                    (solution) =>
                        solution.projectIdentifier ===
                        auth.user?.project_identifier,
                )
                .map((solution) => solution.projectIdentifier);

            setSelectedAppIds((prev) => {
                const hasSameLength =
                    prev.length === userSolutions.length &&
                    userSolutions.every((id) => prev.includes(id));

                return hasSameLength ? prev : userSolutions;
            });
        } else if (typeof window !== 'undefined') {
            const stored = window.localStorage.getItem(storageKey);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        const valid = parsed.filter(
                            (identifier): identifier is string =>
                                typeof identifier === 'string' &&
                                allSolutions.some(
                                    (solution) =>
                                        solution.projectIdentifier ===
                                        identifier,
                                ),
                        );

                        setSelectedAppIds((prev) => {
                            const hasSameLength =
                                prev.length === valid.length &&
                                valid.every((id) => prev.includes(id));
                            return hasSameLength ? prev : valid;
                        });
                    }
                } catch (error) {
                    console.error(
                        'Failed to parse stored app selections',
                        error,
                    );
                }
            } else {
                setSelectedAppIds([]);
            }
        }
    }, [auth.user, auth.user?.project_identifier, allSolutions]);

    return (
        <>
            <Head title="Neulify Apps" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                {/* Status Bar */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3 dark:border-gray-800">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Neulify
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {headerLabel}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center justify-center rounded-full p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                                <MoreHorizontal className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {canSelectType && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.visit(
                                                '/public?mobile=1&type=customer',
                                            )
                                        }
                                        className="cursor-pointer"
                                    >
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>Customer</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.visit(
                                                '/public?mobile=1&type=employee',
                                            )
                                        }
                                        className="cursor-pointer"
                                    >
                                        <Clock className="mr-2 h-4 w-4" />
                                        <span>Employee</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.visit(
                                                '/public?mobile=1&type=merchant',
                                            )
                                        }
                                        className="cursor-pointer"
                                    >
                                        <Building2 className="mr-2 h-4 w-4" />
                                        <span>Merchant</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.visit(
                                                '/public?mobile=1&type=client',
                                            )
                                        }
                                        className="cursor-pointer"
                                    >
                                        <Briefcase className="mr-2 h-4 w-4" />
                                        <span>Client</span>
                                    </DropdownMenuItem>
                                </>
                            )}
                            {hasTypeSelection && (
                                <DropdownMenuItem
                                    onClick={handleResetFactorySettings}
                                    className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    <span>Reset Settings</span>
                                </DropdownMenuItem>
                            )}
                            {auth.user && (
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* App Grid Container */}
                <div className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
                    {/* Apps Grid */}
                    {auth.user ? (
                        selectedSolutions.length > 0 ? (
                            selectedSolutions.length === 1 ? (
                                // Single app layout for authenticated users
                                <div className="flex flex-col items-center justify-center space-y-3 py-4">
                                    {/* User Profile Card */}
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

                                    {/* App Card */}
                                    {selectedSolutions.map((solution) => {
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
                                                            {
                                                                solution.description
                                                            }
                                                        </p>

                                                        {/* Action Buttons */}
                                                        <div className="flex flex-row justify-center gap-2">
                                                            {/* Open App Button */}
                                                            <Link
                                                                href={
                                                                    solution.href
                                                                }
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
                                                                <span>
                                                                    Logout
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                // Multi-app grid layout for authenticated users with multiple apps
                                <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 lg:gap-8">
                                    {selectedSolutions.map((solution) => {
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
                        )
                    ) : (
                        <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 lg:gap-8">
                            {selectedSolutions.map((solution) => {
                                const Icon = solution.icon;
                                const isDisabled = solution.comingSoon;
                                const showRemove =
                                    removalTarget ===
                                    solution.projectIdentifier;

                                const appContent = (
                                    <div
                                        className="group relative"
                                        data-app-tile-id={
                                            solution.projectIdentifier
                                        }
                                        onMouseDown={() =>
                                            startLongPress(
                                                solution.projectIdentifier,
                                            )
                                        }
                                        onMouseUp={clearLongPress}
                                        onMouseLeave={clearLongPress}
                                        onTouchStart={() =>
                                            startLongPress(
                                                solution.projectIdentifier,
                                            )
                                        }
                                        onTouchEnd={clearLongPress}
                                        onTouchCancel={clearLongPress}
                                    >
                                        {showRemove && (
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    clearLongPress();
                                                    setRemovalTarget(null);
                                                    handleRemoveSolution(
                                                        solution.projectIdentifier,
                                                    );
                                                }}
                                                className="absolute -top-2 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-white/80 bg-red-500 text-white shadow-md transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 dark:border-gray-900 dark:bg-red-600 dark:hover:bg-red-500"
                                                aria-label={`Remove ${solution.name}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}

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
                                    <div key={solution.name}>{appContent}</div>
                                ) : (
                                    <Link
                                        key={solution.name}
                                        href={solution.href}
                                        onClick={(event) => {
                                            if (
                                                removalTarget ===
                                                solution.projectIdentifier
                                            ) {
                                                event.preventDefault();
                                                setRemovalTarget(null);
                                                clearLongPress();
                                            }
                                        }}
                                    >
                                        {appContent}
                                    </Link>
                                );
                            })}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="group relative flex flex-col items-center justify-center text-center text-xs font-medium text-gray-500 transition hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 sm:text-sm"
                                        type="button"
                                    >
                                        <div className="relative mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white text-gray-500 transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
                                            <Plus className="h-8 w-8 text-gray-400 dark:text-gray-500 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
                                            <div className="absolute inset-0 rounded-2xl border border-white/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:border-white/10"></div>
                                        </div>
                                        {availableSolutions.length > 0 ? (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Add
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                All apps added
                                            </span>
                                        )}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="w-56"
                                >
                                    {availableSolutions.length > 0 ? (
                                        availableSolutions.map((solution) => {
                                            const IconComponent = solution.icon;
                                            return (
                                                <DropdownMenuItem
                                                    key={
                                                        solution.projectIdentifier
                                                    }
                                                    onClick={() =>
                                                        handleAddSolution(
                                                            solution.projectIdentifier,
                                                        )
                                                    }
                                                    className="cursor-pointer"
                                                >
                                                    <IconComponent className="mr-2 h-4 w-4" />
                                                    <span>{solution.name}</span>
                                                </DropdownMenuItem>
                                            );
                                        })
                                    ) : (
                                        <DropdownMenuItem
                                            disabled
                                            className="text-gray-400 focus:text-gray-400 dark:text-gray-500 dark:focus:text-gray-500"
                                        >
                                            All apps have been added
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
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
