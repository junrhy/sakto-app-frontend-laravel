import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import { Project, User } from '@/types/index';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { Toaster } from 'sonner';

interface MerchantLayoutProps {
    auth?: {
        user?: User;
        project?: Project;
        modules?: string[];
    };
    header?: ReactNode;
    title?: string;
}

const navigation = [
    {
        label: 'Dashboard',
        route: 'merchant.dashboard',
        description: 'Overview of your performance',
    },
];

export default function MerchantLayout({
    auth,
    header,
    children,
    title = 'Merchant Dashboard',
}: PropsWithChildren<MerchantLayoutProps>) {
    const page = usePage<any>();
    const user = auth?.user ?? page.props.auth?.user;
    const project = auth?.project ?? page.props.auth?.project;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const logout = () => {
        router.post(route('merchant.logout'));
    };

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head title={title} />
            <Toaster richColors />

            <div className="flex h-full">
                <aside
                    className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white shadow-xl transition-transform duration-200 dark:bg-gray-900 lg:static lg:w-64 lg:translate-x-0 ${
                        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-800">
                        <Link href="/merchant/dashboard" className="flex items-center gap-3">
                            <ApplicationLogo className="block h-10 w-auto" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    Merchant Portal
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {project?.name || 'Multi-app Control Center'}
                                </p>
                            </div>
                        </Link>
                        <button
                            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800"
                            onClick={toggleSidebar}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="space-y-1 px-4 py-6">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.route}
                                href={route(item.route)}
                                active={route().current(item.route)}
                                className="group flex flex-col rounded-lg px-4 py-3 text-left"
                            >
                                <span className="text-sm font-medium text-gray-800 transition group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
                                    {item.label}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.description}
                                </span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="mt-auto border-t border-gray-200 px-6 py-6 dark:border-gray-800">
                        <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/30">
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                                Merchant Tips
                            </p>
                            <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-200">
                                Customize your storefront, monitor orders, and manage your team from one dashboard.
                            </p>
                        </div>
                    </div>
                </aside>

                <div className="flex flex-1 flex-col">
                    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center gap-3">
                            <button
                                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800"
                                onClick={toggleSidebar}
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div>
                                {header ?? (
                                    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Manage orders, inventory, and business insights
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.email}
                                </p>
                            </div>
                            <button
                                onClick={logout}
                                className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 transition hover:border-red-300 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-gray-700 dark:text-gray-300 dark:hover:border-red-400 dark:hover:text-red-300"
                            >
                                Logout
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 p-6 md:p-10">
                        <div className="mx-auto w-full max-w-6xl">{children}</div>
                    </main>
                </div>
            </div>
        </div>
    );
}
