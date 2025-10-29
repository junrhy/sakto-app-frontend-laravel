import ApplicationLogo from '@/Components/ApplicationLogo';
import BottomNav from '@/Components/BottomNav';
import MobileSidebar, { MobileSidebarToggle } from '@/Components/MobileSidebar';
import { ThemeProvider, useTheme } from '@/Components/ThemeProvider';
import TrialBanner from '@/Components/TrialBanner';
import TrialInstructions from '@/Components/TrialInstructions';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Progress } from '@/Components/ui/progress';
import { getIconByName, getSmartIconSuggestion } from '@/lib/iconLibrary';
import {
    ArrowRightStartOnRectangleIcon,
    ChartBarIcon,
    CreditCardIcon,
    QuestionMarkCircleIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { Link as InertiaLink } from '@inertiajs/react';
import { useEffect, useState } from 'react';
// App interface and utility functions
interface App {
    icon: JSX.Element;
    title: string;
    route: string;
    bgColor: string;
    visible: boolean;
    description: string;
    price: number;
    rating: number;
    categories: string[];
    comingSoon: boolean;
    pricingType: 'free' | 'one-time' | 'subscription';
    includedInPlans?: string[];
    id?: number;
    identifier?: string;
    order?: number;
    isActive?: boolean;
    isInSubscription?: boolean;
    isUserAdded?: boolean;
    isAvailable?: boolean;
}

// Utility function to get icon for any app
const getIconForApp = (app: any): JSX.Element => {
    const IconComponent = getIconByName(
        app.icon || getSmartIconSuggestion(app.title),
    );
    return <IconComponent />;
};

// Utility function to get apps directly from API
const fetchAppsFromAPI = async (): Promise<App[]> => {
    try {
        const response = await fetch('/api/apps');
        const data = await response.json();
        return (data.apps || []).map((app: any) => ({
            ...app,
            icon: getIconForApp(app),
            isInSubscription: app.isInSubscription || false,
            isUserAdded: app.isUserAdded || false,
            isAvailable: app.isAvailable || false,
        }));
    } catch (error) {
        console.error('Failed to fetch apps:', error);
        return [];
    }
};
// @ts-ignore

interface Props {
    auth: {
        user: {
            name: string;
            credits?: number;
            identifier?: string;
            theme?: 'light' | 'dark' | 'system';
            subscription?: {
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
                    features: any;
                };
            } | null;
            trial?: {
                active: boolean;
                started_at: string | null;
                ends_at: string | null;
                days_remaining: number;
                expired: boolean;
            };
            has_access?: boolean;
        };
        project: {
            enabledModules: string[];
            identifier: string;
        };
        modules: string[];
        teamMembers: Array<{
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        }>;
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        } | null;
    };
    usageLimits?: {
        [key: string]: {
            current: number;
            limit: number;
            percentage: number;
            remaining: number;
            unlimited: boolean;
        };
    };
}

export default function Home({ auth, usageLimits = {} }: Props) {
    const { theme } = useTheme();
    const [credits, setCredits] = useState<number>(auth.user.credits ?? 0);
    const [apps, setApps] = useState<App[]>([]);
    const [isLoadingApps, setIsLoadingApps] = useState<boolean>(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showMobileTrialInfo, setShowMobileTrialInfo] = useState(false);

    // Use shared subscription and trial data
    const subscription = auth.user.subscription;
    const trial = auth.user.trial;
    const hasAccess = auth.user.has_access ?? false;

    // Check if subscription is active and not expired
    const isSubscriptionActive =
        subscription &&
        subscription.status === 'active' &&
        new Date(subscription.end_date) > new Date();

    // Check if user is on trial
    const isOnTrial = trial?.active ?? false;

    useEffect(() => {
        const fetchApps = async () => {
            try {
                setIsLoadingApps(true);
                const appData = await fetchAppsFromAPI();
                setApps(appData);
            } catch (error) {
                console.error('Failed to fetch apps:', error);
            } finally {
                setIsLoadingApps(false);
            }
        };

        const fetchCredits = async () => {
            try {
                if (auth.user.identifier) {
                    const response = await fetch(
                        `/credits/${auth.user.identifier}/balance`,
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setCredits(data.available_credit);
                    }
                }
            } catch (error) {
                // Silently ignore credit fetch errors
                setCredits(0);
            }
        };

        fetchCredits();
        fetchApps();
    }, [auth.user.identifier]);

    // Check if we should show the mobile trial info (once per day)
    useEffect(() => {
        const checkDailyTrialInfo = () => {
            // Only show on mobile devices
            const isMobile = window.innerWidth < 768;
            if (!isMobile) return;

            // Only show if user is on trial and not subscribed
            if (!isOnTrial || isSubscriptionActive) return;

            // Check localStorage for last shown date
            const lastShown = localStorage.getItem('lastMobileTrialInfoShown');
            const today = new Date().toDateString();

            // Show if never shown or if shown on a different day
            if (!lastShown || lastShown !== today) {
                setShowMobileTrialInfo(true);
                localStorage.setItem('lastMobileTrialInfoShown', today);
            }
        };

        checkDailyTrialInfo();
    }, [isOnTrial, isSubscriptionActive]);

    const getBorderColor = (colorClass: string) => {
        const colorMap: { [key: string]: string } = {
            'text-blue-500': '#475569', // slate-600
            'text-orange-500': '#475569', // slate-600
            'text-green-500': '#475569', // slate-600
            'text-purple-500': '#475569', // slate-600
            'text-indigo-500': '#475569', // slate-600
            'text-red-500': '#475569', // slate-600
            'text-yellow-500': '#475569', // slate-600
            'text-teal-500': '#475569', // slate-600
            'text-cyan-500': '#475569', // slate-600
            'text-pink-500': '#475569', // slate-600
        };
        return colorMap[colorClass] || '#475569'; // Default to slate-600
    };

    const formatNumber = (num: number | undefined | null) => {
        return num?.toLocaleString() ?? '0';
    };

    // Check if any usage limit has reached 90% or more
    const hasLimitWarning =
        usageLimits &&
        Object.values(usageLimits).some(
            (info) => !info.unlimited && info.percentage >= 90,
        );

    return (
        <ThemeProvider>
            <div className="relative min-h-screen bg-gray-50 pb-16 dark:bg-gray-900 md:pb-0">
                {/* Mobile Sidebar */}
                <MobileSidebar
                    isOpen={isSidebarOpen}
                    onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                {/* Trial/Subscription Status Banner */}
                {!hasAccess && !isOnTrial && (
                    <div className="fixed left-0 right-0 top-0 z-20 bg-gradient-to-r from-blue-600 to-indigo-600 py-1 text-center text-sm text-white">
                        <div className="container mx-auto flex flex-wrap items-center justify-center gap-2 px-4">
                            <span className="font-medium">
                                {trial?.expired
                                    ? 'Your trial has expired. Subscribe to continue!'
                                    : 'Subscribe to a plan to access all features!'}
                            </span>
                            <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-white underline"
                                onClick={() =>
                                    (window.location.href = route(
                                        'subscriptions.index',
                                    ))
                                }
                            >
                                View Plans
                            </Button>
                        </div>
                    </div>
                )}
                {isOnTrial && !isSubscriptionActive && (
                    <div className="fixed left-0 right-0 top-0 z-20 bg-gradient-to-r from-green-600 to-emerald-600 py-1 text-center text-sm text-white">
                        <div className="container mx-auto flex flex-wrap items-center justify-center gap-2 px-4">
                            <span className="font-medium">
                                🎉 Free Trial Active: {trial?.days_remaining}{' '}
                                {trial?.days_remaining === 1 ? 'day' : 'days'}{' '}
                                remaining
                            </span>
                            <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-white underline"
                                onClick={() =>
                                    (window.location.href = route(
                                        'subscriptions.index',
                                    ))
                                }
                            >
                                Subscribe Now
                            </Button>
                        </div>
                    </div>
                )}

                <div
                    className={`fixed ${!hasAccess || (isOnTrial && !isSubscriptionActive) ? 'top-7' : 'top-0'} left-0 right-0 z-10 border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80`}
                >
                    <div className="container mx-auto px-4 pt-4">
                        <div className="flex flex-col items-center">
                            <div className="mb-6 flex w-full items-center justify-between">
                                <div className="mr-4 flex min-w-0 flex-1 items-center gap-2">
                                    <MobileSidebarToggle
                                        onClick={() =>
                                            setIsSidebarOpen(!isSidebarOpen)
                                        }
                                    />
                                    <ApplicationLogo className="hidden h-8 w-auto flex-shrink-0 rounded-lg border-2 border-gray-800 fill-current p-2 text-gray-900 dark:border-white dark:text-white sm:block sm:h-10" />
                                    <div className="min-w-0 flex-1 sm:ml-2">
                                        <span className="block truncate text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                                            {auth.user.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="hidden items-center sm:flex">
                                        <div className="flex items-center overflow-hidden rounded-lg bg-gray-100 shadow-sm dark:bg-gray-700">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    (window.location.href =
                                                        route(
                                                            'credits.spent-history',
                                                            {
                                                                clientIdentifier:
                                                                    auth.user
                                                                        .identifier,
                                                            },
                                                        ))
                                                }
                                                className="rounded-l-lg rounded-r-none border-r border-gray-200 px-3 py-1.5 text-gray-900 hover:bg-gray-200 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                                            >
                                                <span className="text-sm font-medium">
                                                    {formatNumber(credits)}{' '}
                                                    Credits
                                                </span>
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="flex items-center gap-1.5 rounded-l-none rounded-r-lg border-0 bg-gradient-to-r from-orange-400 to-orange-500 font-semibold text-white shadow-lg transition-all duration-200 [text-shadow:_0_1px_1px_rgba(0,0,0,0.2)] hover:from-orange-500 hover:to-orange-600 hover:shadow-xl dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700"
                                                onClick={() =>
                                                    (window.location.href =
                                                        route('credits.buy'))
                                                }
                                            >
                                                <CreditCardIcon className="h-4 w-4" />
                                                Buy
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Usage Limits Dropdown */}
                                    {hasAccess &&
                                        usageLimits &&
                                        Object.keys(usageLimits).length > 0 && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="relative flex h-auto items-center gap-2 rounded-lg border-0 px-3 py-2 font-normal text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                                    >
                                                        <ChartBarIcon className="h-5 w-5" />
                                                        <span className="relative hidden sm:inline">
                                                            Usage
                                                            {hasLimitWarning && (
                                                                <span className="absolute -right-2 -top-1 flex h-3 w-3">
                                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                                                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                                                                </span>
                                                            )}
                                                        </span>
                                                        {/* Show badge on icon for mobile when text is hidden */}
                                                        {hasLimitWarning && (
                                                            <span className="absolute right-1 top-1 flex h-3 w-3 sm:hidden">
                                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                                                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                                                            </span>
                                                        )}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    alignOffset={0}
                                                    sideOffset={8}
                                                    className="z-50 w-80 border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                                                >
                                                    <div className="space-y-4">
                                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            F&B Plan Usage
                                                        </h3>
                                                        {Object.entries(
                                                            usageLimits,
                                                        ).map(
                                                            ([
                                                                resource,
                                                                info,
                                                            ]) => {
                                                                const formatResourceName =
                                                                    (
                                                                        key: string,
                                                                    ): string => {
                                                                        return key
                                                                            .split(
                                                                                '_',
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    word,
                                                                                ) =>
                                                                                    word
                                                                                        .charAt(
                                                                                            0,
                                                                                        )
                                                                                        .toUpperCase() +
                                                                                    word.slice(
                                                                                        1,
                                                                                    ),
                                                                            )
                                                                            .join(
                                                                                ' ',
                                                                            );
                                                                    };

                                                                const getProgressColor =
                                                                    (
                                                                        percentage: number,
                                                                    ) => {
                                                                        if (
                                                                            percentage >=
                                                                            90
                                                                        )
                                                                            return 'bg-red-500 dark:bg-red-400';
                                                                        if (
                                                                            percentage >=
                                                                            75
                                                                        )
                                                                            return 'bg-orange-500 dark:bg-orange-400';
                                                                        return 'bg-green-500 dark:bg-green-400';
                                                                    };

                                                                const getStatusColor =
                                                                    (
                                                                        percentage: number,
                                                                    ) => {
                                                                        if (
                                                                            percentage >=
                                                                            90
                                                                        )
                                                                            return 'text-red-600 dark:text-red-400';
                                                                        if (
                                                                            percentage >=
                                                                            75
                                                                        )
                                                                            return 'text-orange-600 dark:text-orange-400';
                                                                        return 'text-green-600 dark:text-green-400';
                                                                    };

                                                                return (
                                                                    <div
                                                                        key={
                                                                            resource
                                                                        }
                                                                        className="space-y-2"
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                {formatResourceName(
                                                                                    resource,
                                                                                )}
                                                                            </h4>
                                                                            {info.unlimited ? (
                                                                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                                                                    Unlimited
                                                                                </span>
                                                                            ) : (
                                                                                <span
                                                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                                        info.percentage >=
                                                                                        90
                                                                                            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                                                                                            : info.percentage >=
                                                                                                75
                                                                                              ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                                                                                              : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                                                                    }`}
                                                                                >
                                                                                    {info.remaining >=
                                                                                    0
                                                                                        ? `${info.remaining} left`
                                                                                        : 'Limit reached'}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {!info.unlimited && (
                                                                            <>
                                                                                <Progress
                                                                                    value={
                                                                                        info.percentage
                                                                                    }
                                                                                    className="h-2"
                                                                                    indicatorClassName={getProgressColor(
                                                                                        info.percentage,
                                                                                    )}
                                                                                />
                                                                                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                                                                    <span>
                                                                                        {
                                                                                            info.current
                                                                                        }{' '}
                                                                                        used
                                                                                    </span>
                                                                                    <span
                                                                                        className={getStatusColor(
                                                                                            info.percentage,
                                                                                        )}
                                                                                    >
                                                                                        {info.percentage.toFixed(
                                                                                            0,
                                                                                        )}

                                                                                        %
                                                                                        of{' '}
                                                                                        {
                                                                                            info.limit
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                );
                                                            },
                                                        )}

                                                        {/* Upgrade Plan Button */}
                                                        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                                            <Button
                                                                onClick={() =>
                                                                    (window.location.href =
                                                                        route(
                                                                            'subscriptions.index',
                                                                        ))
                                                                }
                                                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800"
                                                            >
                                                                <CreditCardIcon className="mr-2 h-4 w-4" />
                                                                Upgrade Plan
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}

                                    <div className="relative hidden md:inline-block">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="flex h-auto items-center gap-2 border-0 px-3 py-2 font-normal text-gray-900 no-underline transition-colors duration-200 hover:bg-white/10 hover:text-blue-900 hover:no-underline focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-white"
                                                >
                                                    <UserIcon className="h-5 w-5" />
                                                    <span>
                                                        {auth.selectedTeamMember
                                                            ?.full_name ||
                                                            auth.user.name}
                                                    </span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                alignOffset={0}
                                                sideOffset={8}
                                                className="z-50 w-56 border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                                                onCloseAutoFocus={(e) =>
                                                    e.preventDefault()
                                                }
                                                collisionPadding={16}
                                            >
                                                <DropdownMenuItem asChild>
                                                    <InertiaLink
                                                        href={route('help')}
                                                        className="flex items-center text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                                    >
                                                        <QuestionMarkCircleIcon className="mr-2 h-5 w-5" />
                                                        <span>Help</span>
                                                    </InertiaLink>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <ArrowRightStartOnRectangleIcon className="mr-2 h-5 w-5" />
                                                    <InertiaLink
                                                        href={route('logout', {
                                                            project:
                                                                auth.project
                                                                    .identifier,
                                                        })}
                                                        method="post"
                                                        as="button"
                                                        className="w-full text-left text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                                    >
                                                        Logout
                                                    </InertiaLink>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-3 flex items-center justify-center gap-2 landscape:hidden">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    (window.location.href = route(
                                        'credits.history',
                                        {
                                            clientIdentifier:
                                                auth.user.identifier,
                                        },
                                    ))
                                }
                                className="h-auto py-1 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                            >
                                <span className="text-center text-sm font-medium text-gray-900 dark:text-white">
                                    {formatNumber(credits)} Credits
                                </span>
                            </Button>
                            {isSubscriptionActive && (
                                <span className="rounded-full bg-purple-500 px-2 py-0.5 text-xs font-medium text-white">
                                    {subscription.plan.name}
                                </span>
                            )}
                            {isOnTrial && !isSubscriptionActive && (
                                <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                                    Trial: {trial?.days_remaining}d left
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className={`container mx-auto px-4 ${!hasAccess || (isOnTrial && !isSubscriptionActive) ? 'pt-[180px]' : 'pt-[160px]'} mb-4 overflow-y-auto md:pt-[220px] landscape:pt-[140px]`}
                >
                    {/* Show trial banner if user is on trial AND no active subscription */}
                    {isOnTrial && trial && !isSubscriptionActive && (
                        <>
                            {/* Mobile: Show simplified trial info once per day */}
                            {showMobileTrialInfo && (
                                <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 md:hidden">
                                    <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
                                        Your free trial ends in {trial.days_remaining} {trial.days_remaining === 1 ? 'day' : 'days'}
                                    </h3>
                                    <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                                        Subscribe now to continue enjoying all premium features without interruption.
                                    </p>
                                    <Button
                                        onClick={() => {
                                            window.location.href = route('subscriptions.index');
                                        }}
                                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                                    >
                                        View Subscription Plans
                                    </Button>
                                </div>
                            )}

                            {/* Desktop: Show full trial banner and instructions */}
                            <div className="hidden md:block">
                                <TrialBanner
                                    daysRemaining={trial.days_remaining}
                                    endsAt={trial.ends_at || ''}
                                    className="mb-6"
                                />
                                <TrialInstructions
                                    projectIdentifier={
                                        auth.project?.identifier || 'trial'
                                    }
                                    className="mb-8"
                                />
                            </div>
                        </>
                    )}

                    {/* Show upgrade prompt when user has no access */}
                    {!hasAccess && !isOnTrial && (
                        <div className="mb-8 text-center">
                            <div className="relative transform overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] dark:from-blue-600 dark:via-purple-700 dark:to-indigo-800">
                                {/* Animated background elements */}
                                <div className="absolute left-0 top-0 h-full w-full opacity-10">
                                    <div className="absolute left-4 top-4 h-20 w-20 animate-pulse rounded-full bg-white"></div>
                                    <div className="absolute right-8 top-12 h-16 w-16 animate-pulse rounded-full bg-white delay-1000"></div>
                                    <div className="absolute bottom-8 left-12 h-12 w-12 animate-pulse rounded-full bg-white delay-500"></div>
                                    <div className="delay-1500 absolute bottom-4 right-4 h-24 w-24 animate-pulse rounded-full bg-white"></div>
                                </div>

                                {/* Main content */}
                                <div className="relative z-10">
                                    <div className="mb-6 flex justify-center">
                                        <div className="relative">
                                            <div className="mb-2 animate-bounce text-6xl">
                                                {trial?.expired ? '⏰' : '🚀'}
                                            </div>
                                            <div className="absolute -right-2 -top-2 animate-ping text-2xl">
                                                ✨
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="mb-3 text-2xl font-bold text-white drop-shadow-lg">
                                        {trial?.expired
                                            ? 'Your Trial Has Ended'
                                            : 'Unlock Premium Features'}
                                    </h3>

                                    <p className="mx-auto mb-6 max-w-lg text-lg leading-relaxed text-blue-100">
                                        {trial?.expired ? (
                                            <>
                                                Thank you for trying our
                                                platform!{' '}
                                                <span className="font-semibold text-white">
                                                    Subscribe now to continue
                                                    accessing all features.
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                Get unlimited access to all
                                                apps, advanced features, and
                                                exclusive content.
                                                <span className="font-semibold text-white">
                                                    {' '}
                                                    Start your journey today!
                                                </span>
                                            </>
                                        )}
                                    </p>

                                    <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                        <div className="flex items-center text-blue-100">
                                            <span className="mr-2 text-green-400">
                                                ✓
                                            </span>
                                            <span>Unlimited Access</span>
                                        </div>
                                        <div className="flex items-center text-blue-100">
                                            <span className="mr-2 text-green-400">
                                                ✓
                                            </span>
                                            <span>Premium Support</span>
                                        </div>
                                        <div className="flex items-center text-blue-100">
                                            <span className="mr-2 text-green-400">
                                                ✓
                                            </span>
                                            <span>Advanced Features</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() =>
                                            (window.location.href = route(
                                                'subscriptions.index',
                                            ))
                                        }
                                        className="transform rounded-xl bg-white px-8 py-3 text-lg font-bold text-blue-600 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50 hover:shadow-2xl"
                                    >
                                        🎯{' '}
                                        {trial?.expired
                                            ? 'Subscribe Now'
                                            : 'Explore Plans Now'}
                                    </Button>

                                    <p className="mt-4 text-sm text-blue-200 opacity-90">
                                        Join thousands of satisfied users
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Apps Grid */}
                    <div className="mx-auto grid w-full grid-cols-3 gap-3 gap-y-6 md:grid-cols-5 md:gap-4 md:gap-y-10 lg:grid-cols-6 lg:gap-6 lg:gap-y-12">
                        {apps
                            .filter((app) => {
                                // If user has no access (no subscription and no trial), hide all apps
                                if (!hasAccess) {
                                    return false;
                                }
                                // Show apps that are available (either in subscription or user-added)
                                return app.isAvailable;
                            })
                            .sort((a, b) => a.title.localeCompare(b.title))
                            .map((app) => (
                                <InertiaLink
                                    key={app.title}
                                    href={app.route}
                                    className="flex flex-col items-center"
                                >
                                    <div
                                        className={`mb-2 flex h-16 w-16 transform items-center justify-center rounded-xl bg-white/80 shadow-md backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800/80 dark:shadow-gray-800/50 md:h-20 md:w-20 md:rounded-2xl`}
                                        style={{
                                            borderWidth: '1px',
                                            borderColor:
                                                theme === 'dark'
                                                    ? 'rgba(148, 163, 184, 0.3)'
                                                    : getBorderColor(
                                                          app.bgColor,
                                                      ),
                                        }}
                                    >
                                        <div
                                            className={`text-3xl dark:text-slate-300 md:text-4xl`}
                                        >
                                            {app.icon}
                                        </div>
                                    </div>
                                    <h2 className="text-center text-xs font-medium text-gray-800 dark:text-gray-300 md:text-sm">
                                        {app.title}
                                    </h2>
                                </InertiaLink>
                            ))}
                    </div>
                </div>

                {/* Bottom Nav - Hidden on mobile, visible on desktop, and hidden when on trial without subscription */}
                {!(isOnTrial && !isSubscriptionActive) && (
                    <div className="hidden md:block">
                        <BottomNav />
                    </div>
                )}
            </div>
        </ThemeProvider>
    );
}
