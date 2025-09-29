import ApplicationLogo from '@/Components/ApplicationLogo';
import BottomNav from '@/Components/BottomNav';
import { ThemeProvider, useTheme } from '@/Components/ThemeProvider';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { getIconByName, getSmartIconSuggestion } from '@/lib/iconLibrary';
import {
    ArrowRightStartOnRectangleIcon,
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
}

export default function Home({ auth }: Props) {
    const { theme } = useTheme();
    const [credits, setCredits] = useState<number>(auth.user.credits ?? 0);
    const [apps, setApps] = useState<App[]>([]);
    const [isLoadingApps, setIsLoadingApps] = useState<boolean>(true);

    // Use shared subscription data instead of separate state
    const subscription = auth.user.subscription;

    // Check if subscription is active and not expired
    const isSubscriptionActive =
        subscription &&
        subscription.status === 'active' &&
        new Date(subscription.end_date) > new Date();

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

    return (
        <ThemeProvider>
            <div className="relative min-h-screen bg-gray-50 pb-16 dark:bg-gray-900">
                {/* Message for users without subscription */}
                {!isSubscriptionActive && (
                    <div className="fixed left-0 right-0 top-0 z-20 bg-gradient-to-r from-blue-600 to-indigo-600 py-1 text-center text-sm text-white">
                        <div className="container mx-auto flex flex-wrap items-center justify-center gap-2 px-4">
                            <span className="font-medium">
                                Subscribe to a plan to continue using all
                                features!
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

                <div
                    className={`fixed ${!isSubscriptionActive ? 'top-7' : 'top-0'} left-0 right-0 z-10 border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80`}
                >
                    <div className="container mx-auto px-4 pt-4">
                        <div className="flex flex-col items-center">
                            <div className="mb-6 flex w-full items-center justify-between">
                                <div className="mr-4 flex min-w-0 flex-1 items-center">
                                    <ApplicationLogo className="hidden h-8 w-auto flex-shrink-0 fill-current text-gray-900 dark:text-white sm:block sm:h-10" />
                                    <div className="ml-0 min-w-0 flex-1 sm:ml-2">
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
                                    {/* Mobile Credits Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white hover:bg-white/10 hover:text-blue-100 sm:hidden"
                                        onClick={() =>
                                            (window.location.href =
                                                route('credits.buy'))
                                        }
                                    >
                                        <CreditCardIcon className="h-5 w-5" />
                                    </Button>
                                    <div className="relative inline-block">
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

                        <div className="mb-6 flex flex-col items-center landscape:hidden">
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
                                className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                            >
                                <span className="mt-1 max-w-2xl text-center text-lg text-gray-900 text-opacity-90 dark:text-white">
                                    {formatNumber(credits)} Credits
                                </span>
                            </Button>
                            {isSubscriptionActive && (
                                <div className="mt-1 text-sm text-gray-900 text-opacity-80 dark:text-white">
                                    <span className="mr-1 rounded-full bg-purple-500 px-2 py-0.5 text-xs font-medium text-white">
                                        {subscription.plan.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className={`container mx-auto px-4 ${!isSubscriptionActive ? 'pt-[220px]' : 'pt-[200px]'} mb-4 overflow-y-auto md:pt-[220px] landscape:pt-[160px]`}
                >
                    {/* Show subscription message when user has no subscription */}
                    {!isSubscriptionActive && (
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
                                                🚀
                                            </div>
                                            <div className="absolute -right-2 -top-2 animate-ping text-2xl">
                                                ✨
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="mb-3 text-2xl font-bold text-white drop-shadow-lg">
                                        Unlock Premium Features
                                    </h3>

                                    <p className="mx-auto mb-6 max-w-lg text-lg leading-relaxed text-blue-100">
                                        Get unlimited access to all apps,
                                        advanced features, and exclusive
                                        content.
                                        <span className="font-semibold text-white">
                                            {' '}
                                            Start your journey today!
                                        </span>
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
                                        🎯 Explore Plans Now
                                    </Button>

                                    <p className="mt-4 text-sm text-blue-200 opacity-90">
                                        Join thousands of satisfied users
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mx-auto grid w-full grid-cols-4 gap-3 gap-y-6 md:grid-cols-5 md:gap-4 md:gap-y-10 lg:grid-cols-6 lg:gap-6 lg:gap-y-12">
                        {apps
                            .filter((app) => {
                                // If no active subscription, hide all apps
                                if (!isSubscriptionActive) {
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

                <BottomNav />
            </div>
        </ThemeProvider>
    );
}
