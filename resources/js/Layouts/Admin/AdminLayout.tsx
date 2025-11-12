import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import { Project, User } from '@/types/index';
import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { Toaster } from 'sonner';

interface AdminLayoutProps {
    auth?: {
        user?: User;
        project?: Project;
        modules?: string[];
    };
    header?: ReactNode;
    title?: string;
}

export default function AdminLayout({
    auth,
    header,
    children,
    title = 'Admin Dashboard',
}: PropsWithChildren<AdminLayoutProps>) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const pageProps = usePage().props as any;
    const user = auth?.user || pageProps?.auth?.user;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head title={title} />
            <Toaster richColors />

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-gray-900 to-gray-800 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-center border-b border-gray-700 px-4">
                        <Link
                            href="/admin/dashboard"
                            className="transition-transform hover:scale-105"
                        >
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-7 w-auto fill-current text-white" />
                                <span className="ml-2 text-lg font-black text-white">
                                    Neulify{' '}
                                    <span className="text-blue-400">Admin</span>
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
                        <div className="flex flex-col space-y-2">
                            {/* Dashboard */}
                            <NavLink
                                href={route('admin.dashboard')}
                                active={route().current('admin.dashboard')}
                                className={`flex items-center px-4 py-2.5 text-white transition-all duration-200 ${
                                    route().current('admin.dashboard')
                                        ? 'bg-white/10 text-white'
                                        : 'hover:bg-white/10'
                                }`}
                            >
                                <svg
                                    className={`mr-3 h-5 w-5 text-white transition-transform duration-200 ${route().current('admin.dashboard') ? 'scale-110' : ''}`}
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
                                    className={`font-medium ${route().current('admin.dashboard') ? 'text-white' : 'text-white/80'}`}
                                >
                                    Dashboard
                                </span>
                            </NavLink>

                            {/* User Management */}
                            <NavLink
                                href={route('admin.users.index')}
                                active={
                                    route().current('admin.users.index') ||
                                    route().current('admin.users.create') ||
                                    route().current('admin.users.edit')
                                }
                                className={`flex items-center px-4 py-2.5 text-white transition-all duration-200 ${
                                    route().current('admin.users.index') ||
                                    route().current('admin.users.create') ||
                                    route().current('admin.users.edit')
                                        ? 'bg-white/10 text-white'
                                        : 'hover:bg-white/10'
                                }`}
                            >
                                <svg
                                    className={`mr-3 h-5 w-5 text-white transition-transform duration-200 ${route().current('admin.users.index') || route().current('admin.users.create') || route().current('admin.users.edit') ? 'scale-110' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                                <span
                                    className={`font-medium ${route().current('admin.users.index') || route().current('admin.users.create') || route().current('admin.users.edit') ? 'text-white' : 'text-white/80'}`}
                                >
                                    Users
                                </span>
                            </NavLink>

                            {/* Project Management */}
                            <NavLink
                                href={route('admin.projects.index')}
                                active={route().current('admin.projects.*')}
                                className={`flex items-center px-4 py-2.5 text-white transition-all duration-200 ${
                                    route().current('admin.projects.*')
                                        ? 'bg-white/10 text-white'
                                        : 'hover:bg-white/10'
                                }`}
                            >
                                <svg
                                    className={`mr-3 h-5 w-5 text-white transition-transform duration-200 ${route().current('admin.projects.*') ? 'scale-110' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                </svg>
                                <span
                                    className={`font-medium ${route().current('admin.projects.*') ? 'text-white' : 'text-white/80'}`}
                                >
                                    Projects
                                </span>
                            </NavLink>

                            {/* Apps Management */}
                            <NavLink
                                href={route('admin.apps.index')}
                                active={route().current('admin.apps.*')}
                                className={`flex items-center px-4 py-2.5 text-white transition-all duration-200 ${
                                    route().current('admin.apps.*')
                                        ? 'bg-white/10 text-white'
                                        : 'hover:bg-white/10'
                                }`}
                            >
                                <svg
                                    className={`mr-3 h-5 w-5 text-white transition-transform duration-200 ${route().current('admin.apps.*') ? 'scale-110' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                <span
                                    className={`font-medium ${route().current('admin.apps.*') ? 'text-white' : 'text-white/80'}`}
                                >
                                    Apps
                                </span>
                            </NavLink>

                            {/* Wallet Management */}
                            <NavLink
                                href={route('admin.wallets.index')}
                                active={route().current('admin.wallets.index')}
                                className={`flex items-center px-4 py-2.5 text-white transition-all duration-200 ${
                                    route().current('admin.wallets.index')
                                        ? 'bg-white/10 text-white'
                                        : 'hover:bg-white/10'
                                }`}
                            >
                                <svg
                                    className={`mr-3 h-5 w-5 text-white transition-transform duration-200 ${
                                        route().current('admin.wallets.index')
                                            ? 'scale-110'
                                            : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h1m4 4h9a2 2 0 002-2v-6a2 2 0 00-2-2h-9a2 2 0 00-2 2v6a2 2 0 002 2zm0 0a2 2 0 002-2v-4a2 2 0 00-2-2H6"
                                    />
                                </svg>
                                <span
                                    className={`font-medium ${
                                        route().current('admin.wallets.index')
                                            ? 'text-white'
                                            : 'text-white/80'
                                    }`}
                                >
                                    Wallets
                                </span>
                            </NavLink>

                            {/* Subscription Management */}
                            <NavLink
                                href={route('admin.subscriptions.index')}
                                active={route().current(
                                    'admin.subscriptions.index',
                                )}
                                className={`flex items-center px-4 py-2.5 text-white transition-all duration-200 ${
                                    route().current('admin.subscriptions.index')
                                        ? 'bg-white/10 text-white'
                                        : 'hover:bg-white/10'
                                }`}
                            >
                                <svg
                                    className={`mr-3 h-5 w-5 text-white transition-transform duration-200 ${route().current('admin.subscriptions.index') ? 'scale-110' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                                <span
                                    className={`font-medium ${route().current('admin.subscriptions.index') ? 'text-white' : 'text-white/80'}`}
                                >
                                    Subscriptions
                                </span>
                            </NavLink>
                        </div>
                    </nav>

                    {/* User Profile */}
                    <div className="border-t border-gray-700 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 font-medium text-white">
                                    {user?.name?.charAt(0)}
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-1">
                            {/* Settings */}
                            <Link
                                href={route('admin.settings.index')}
                                className="flex items-center rounded-lg px-4 py-2 text-sm text-white transition-colors duration-150 hover:bg-white/5"
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
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                Settings
                            </Link>

                            {/* Log Out */}
                            <Link
                                href={route('admin.logout')}
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
            <div
                className={`${isSidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300 ease-in-out`}
            >
                {/* Fixed Top Bar */}
                <div
                    className={`fixed right-0 top-0 z-40 border-b border-gray-200 bg-white shadow-sm transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800 ${isSidebarOpen ? 'left-64' : 'left-0'}`}
                >
                    <div className="flex h-16 items-center justify-between px-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="rounded-md p-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-blue-400"
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
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                        {header && <div className="flex-1 px-4">{header}</div>}
                    </div>
                </div>

                {/* Page Content */}
                <main className="pt-16">
                    <div className="py-6">
                        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
