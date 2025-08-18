import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import { ThemeProvider } from "@/Components/ThemeProvider";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from '@/Components/ui/button';
import { SparklesIcon, AlertCircle, Settings, ArrowLeft, Crown, History, Home } from 'lucide-react';
import { PageProps, User, Project } from '@/types/index';

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

export default function SubscriptionLayout({ children, header, user, auth: propAuth }: Props) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const { url } = usePage();
    const pageProps = usePage<{ auth: { user: any; project: any; modules: string[]; selectedTeamMember?: any } }>().props;
    // Merge prop auth with page auth, preferring prop auth if available
    const auth = propAuth || pageProps.auth;
    const authUser = user || auth.user;

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-white dark:bg-gray-800 relative">
                {/* Mobile Navigation Overlay */}
                <div
                    className={
                        (showingNavigationDropdown ? 'opacity-100 visible' : 'opacity-0 invisible') +
                        ' fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ease-in-out sm:hidden z-[60]'
                    }
                    onClick={() => setShowingNavigationDropdown(false)}
                >
                    <div 
                        className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-800 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                <span className="ml-3 text-xl font-bold text-white">Menu</span>
                            </div>
                            <button
                                onClick={() => setShowingNavigationDropdown(false)}
                                className="p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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
                                        className="flex items-center text-lg text-white/90 hover:text-white hover:bg-white/10 p-4 rounded-lg transition-colors"
                                    >
                                        <Home className="w-5 h-5 mr-3" />
                                        Back to Home
                                    </ResponsiveNavLink>
                                </div>

                                {/* Subscription Section */}
                                <div className="border-t border-white/10 pt-6">
                                    <div className="mb-4">
                                        <div className="font-medium text-lg text-white/90 flex items-center px-4">
                                            <Crown className="w-5 h-5 mr-3" />
                                            Subscription
                                        </div>
                                    </div>
                                    <ResponsiveNavLink 
                                        href={route('subscriptions.index')} 
                                        className="flex items-center text-lg text-white/80 hover:text-white hover:bg-white/10 p-4 rounded-lg transition-colors"
                                    >
                                        <SparklesIcon className="w-5 h-5 mr-3" />
                                        Premium Plans
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink 
                                        href={`${route('subscriptions.index')}?tab=history`} 
                                        className="flex items-center text-lg text-white/80 hover:text-white hover:bg-white/10 p-4 rounded-lg transition-colors"
                                    >
                                        <History className="w-5 h-5 mr-3" />
                                        Subscription History
                                    </ResponsiveNavLink>
                                </div>

                                {/* Account Section */}
                                <div className="border-t border-white/10 pt-6">
                                    <div className="mb-4">
                                        <div className="font-medium text-lg text-white/90 px-4">Account</div>
                                    </div>
                                    <ResponsiveNavLink 
                                        href={route('profile.edit')} 
                                        className="flex items-center text-lg text-white/80 hover:text-white hover:bg-white/10 p-4 rounded-lg transition-colors"
                                    >
                                        Profile
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink 
                                        href={route('logout')} 
                                        method="post" 
                                        as="button"
                                        className="flex items-center text-lg text-white/80 hover:text-white hover:bg-white/10 p-4 rounded-lg transition-colors w-full text-left"
                                    >
                                        Logout
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Header */}
                <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/80 shadow-sm">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="shrink-0 flex items-center">
                                    <Link href={route('home')} className="hover:opacity-80 transition-opacity">
                                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-900 dark:text-white" />
                                    </Link>
                                </div>
                                <div className="ml-2">
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">{authUser.name}</span>
                                </div>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden sm:flex sm:items-center sm:ml-6 space-x-4">
                                {/* User Dropdown */}
                                <div className="ml-3 relative">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button className="flex items-center text-sm font-medium text-gray-900 dark:text-white hover:text-blue-900 hover:bg-white/10 focus:outline-none transition ease-in-out duration-150 rounded-md px-3 py-2">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                        <span className="text-gray-900 dark:text-white font-medium text-sm">
                                                            {auth.selectedTeamMember?.first_name?.[0]}{auth.selectedTeamMember?.last_name?.[0]}
                                                        </span>
                                                    </div>
                                                    <div className="ml-2">
                                                        <div className="text-gray-900 dark:text-white font-medium">
                                                            {auth.selectedTeamMember?.full_name || authUser.name}
                                                        </div>
                                                    </div>
                                                    <ChevronDown className="ml-2 w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                </div>
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content align="right" width="48">
                                            <Dropdown.Link href={route('home')}>
                                                Home
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                            <Dropdown.Link 
                                                href={route('logout')} 
                                                method="post" 
                                                as="button"
                                                className="w-full text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
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
                                    onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 dark:text-white hover:text-blue-900 hover:bg-white/10 focus:outline-none focus:bg-white/10 focus:text-blue-900 transition duration-150 ease-in-out"
                                >
                                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path
                                            className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
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
                    <header className="bg-white dark:bg-gray-800 shadow">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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