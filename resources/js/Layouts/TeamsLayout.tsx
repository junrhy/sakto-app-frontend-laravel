import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import { ThemeProvider } from "@/Components/ThemeProvider";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from '@/Components/ui/button';
import { SparklesIcon, AlertCircle, Users, Settings, Plus, ArrowLeft } from 'lucide-react';
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

export default function TeamsLayout({ children, header, user, auth: propAuth }: Props) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const { url } = usePage();
    const pageProps = usePage<{ auth: { user: any; project: any; modules: string[]; selectedTeamMember?: any } }>().props;
    // Merge prop auth with page auth, preferring prop auth if available
    const auth = propAuth || pageProps.auth;
    const authUser = user || auth.user;

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-white dark:bg-gray-800 relative">
                {/* Mobile Navigation */}
                <div
                    className={
                        (showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full') +
                        ' fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out sm:hidden bg-gradient-to-b from-gray-900 to-gray-800 shadow-lg z-[60] overflow-y-auto'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('home')} active={route().current('home')} className="text-white/90 hover:text-white hover:bg-white/10">
                            Home
                        </ResponsiveNavLink>

                        <div className="border-t border-white/10">
                            <div className="px-4 py-2">
                                <div className="font-medium text-base text-white/90">Team Management</div>
                                <ResponsiveNavLink href={route('teams.index')} className="text-white/80 hover:text-white hover:bg-white/10">
                                    Team Members
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('teams.create')} className="text-white/80 hover:text-white hover:bg-white/10">
                                    Add Member
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('teams.settings')} className="text-white/80 hover:text-white hover:bg-white/10">
                                    Settings
                                </ResponsiveNavLink>
                            </div>
                        </div>

                        <div className="border-t border-white/10">
                            <div className="px-4 py-2">
                                <div className="font-medium text-base text-white/90">Account</div>
                                <ResponsiveNavLink href={route('profile.edit')} className="text-white/80 hover:text-white hover:bg-white/10">
                                    Profile
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex sm:items-center sm:justify-between bg-white/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/80 shadow-sm">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="shrink-0 flex items-center">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-900 dark:text-white" />
                                </div>
                                <div className="ml-2">
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">{auth.user.name}</span>
                                </div>
                            </div>

                                                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                                {/* User Dropdown */}
                                <div className="ml-3 relative">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button className="flex items-center text-sm font-medium text-gray-900 dark:text-white hover:text-blue-900 hover:bg-white/10 focus:outline-none transition ease-in-out duration-150">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                        <span className="text-gray-900 dark:text-white font-medium text-sm">
                                                            {auth.selectedTeamMember?.first_name?.[0]}{auth.selectedTeamMember?.last_name?.[0]}
                                                        </span>
                                                    </div>
                                                    <div className="ml-2">
                                                        <div className="text-gray-900 dark:text-white font-medium">
                                                            {auth.selectedTeamMember?.full_name || auth.selectedTeamMember?.full_name}
                                                        </div>
                                                    </div>
                                                    <ChevronDown className="ml-2 w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                </div>
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content align="right" width="48">
                                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                            <Dropdown.Link 
                                                        href={route('logout', { project: auth.project.identifier })} 
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
                        </div>

                        {/* Mobile menu button */}
                        <div className="-mr-2 flex items-center sm:hidden">
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

                {/* Mobile Navigation Overlay */}
                {showingNavigationDropdown && (
                    <div
                        className="fixed inset-0 z-50 sm:hidden"
                        onClick={() => setShowingNavigationDropdown(false)}
                    />
                )}
            </div>
        </ThemeProvider>
    );
} 