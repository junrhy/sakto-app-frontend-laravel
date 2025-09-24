import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { ThemeProvider } from '@/Components/ThemeProvider';
import { Project, User } from '@/types/index';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Crown, History, Home, SparklesIcon } from 'lucide-react';
import { useState } from 'react';

interface Props {
    children: React.ReactNode;
    header?: React.ReactNode;
    user?: User;
    auth?: {
        user?: User;
        project?: Project;
        modules?: string[];
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

const formatNumber = (num: number | undefined | null) => {
    return num?.toLocaleString() ?? '0';
};

export default function SubscriptionLayout({
    children,
    header,
    user,
    auth: propAuth,
}: Props) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const { url } = usePage();
    const pageProps = usePage<{
        auth: {
            user: any;
            project: any;
            modules: string[];
            selectedTeamMember?: any;
        };
    }>().props;
    // Merge prop auth with page auth, preferring prop auth if available
    const auth = propAuth || pageProps.auth;
    const authUser = user || auth.user;

    return (
        <ThemeProvider>
            <div className="relative min-h-screen bg-white dark:bg-gray-800">
                {/* Mobile Navigation Overlay */}
                <div
                    className={
                        (showingNavigationDropdown
                            ? 'visible opacity-100'
                            : 'invisible opacity-0') +
                        ' fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-all duration-300 ease-in-out sm:hidden'
                    }
                    onClick={() => setShowingNavigationDropdown(false)}
                >
                    <div
                        className="absolute inset-0 flex flex-col bg-gradient-to-b from-blue-900 to-blue-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/10 p-6">
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                <span className="ml-3 text-xl font-bold text-white">
                                    Menu
                                </span>
                            </div>
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(false)
                                }
                                className="rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
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

                        {/* Navigation Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="space-y-6 p-6">
                                {/* Home Section */}
                                <div>
                                    <ResponsiveNavLink
                                        href={route('home')}
                                        className="flex items-center rounded-lg p-4 text-lg text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                                    >
                                        <Home className="mr-3 h-5 w-5" />
                                        Back to Home
                                    </ResponsiveNavLink>
                                </div>

                                {/* Subscription Section */}
                                <div className="border-t border-white/10 pt-6">
                                    <div className="mb-4">
                                        <div className="flex items-center px-4 text-lg font-medium text-white/90">
                                            <Crown className="mr-3 h-5 w-5" />
                                            Subscription
                                        </div>
                                    </div>
                                    <ResponsiveNavLink
                                        href={route('subscriptions.index')}
                                        className="flex items-center rounded-lg p-4 text-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                                    >
                                        <SparklesIcon className="mr-3 h-5 w-5" />
                                        Premium Plans
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        href={`${route('subscriptions.index')}?tab=history`}
                                        className="flex items-center rounded-lg p-4 text-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                                    >
                                        <History className="mr-3 h-5 w-5" />
                                        Subscription History
                                    </ResponsiveNavLink>
                                </div>

                                {/* Account Section */}
                                <div className="border-t border-white/10 pt-6">
                                    <div className="mb-4">
                                        <div className="px-4 text-lg font-medium text-white/90">
                                            Account
                                        </div>
                                    </div>
                                    <ResponsiveNavLink
                                        href={route('profile.edit')}
                                        className="flex items-center rounded-lg p-4 text-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                                    >
                                        Profile
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex w-full items-center rounded-lg p-4 text-left text-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                                    >
                                        Logout
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Header */}
                <div className="border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex shrink-0 items-center">
                                    <Link
                                        href={route('home')}
                                        className="transition-opacity hover:opacity-80"
                                    >
                                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-900 dark:text-white" />
                                    </Link>
                                </div>
                                <div className="ml-2">
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        {authUser.name}
                                    </span>
                                </div>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden space-x-4 sm:ml-6 sm:flex sm:items-center">
                                {/* User Dropdown */}
                                <div className="relative ml-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition duration-150 ease-in-out hover:bg-white/10 hover:text-blue-900 focus:outline-none dark:text-white">
                                                <div className="flex items-center">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {
                                                                auth
                                                                    .selectedTeamMember
                                                                    ?.first_name?.[0]
                                                            }
                                                            {
                                                                auth
                                                                    .selectedTeamMember
                                                                    ?.last_name?.[0]
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="ml-2">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {auth
                                                                .selectedTeamMember
                                                                ?.full_name ||
                                                                authUser.name}
                                                        </div>
                                                    </div>
                                                    <ChevronDown className="ml-2 h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                </div>
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content
                                            align="right"
                                            width="48"
                                        >
                                            <Dropdown.Link href={route('home')}>
                                                Home
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route('profile.edit')}
                                            >
                                                Profile
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="w-full text-left text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                            >
                                                Logout
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>

                            {/* Mobile menu button */}
                            <div className="flex items-center sm:hidden">
                                <button
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) => !previousState,
                                        )
                                    }
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-900 transition duration-150 ease-in-out hover:bg-white/10 hover:text-blue-900 focus:bg-white/10 focus:text-blue-900 focus:outline-none dark:text-white"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            className={
                                                !showingNavigationDropdown
                                                    ? 'inline-flex'
                                                    : 'hidden'
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={
                                                showingNavigationDropdown
                                                    ? 'inline-flex'
                                                    : 'hidden'
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Heading */}
                {header && (
                    <header className="bg-white shadow dark:bg-gray-800">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main>{children}</main>
            </div>
        </ThemeProvider>
    );
}
