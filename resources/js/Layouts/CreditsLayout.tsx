import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import MobileSidebar, { MobileSidebarToggle } from '@/Components/MobileSidebar';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { ThemeProvider } from '@/Components/ThemeProvider';
import { Project, User } from '@/types/index';
import { usePage } from '@inertiajs/react';
import { ChevronDown, CreditCard, History, Home, Wallet } from 'lucide-react';
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

export default function CreditsLayout({
    children,
    header,
    user,
    auth: propAuth,
}: Props) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
                {/* Mobile Sidebar */}
                <MobileSidebar
                    isOpen={isSidebarOpen}
                    onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                {/* Desktop Navigation */}
                <div className="border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80 sm:flex sm:items-center sm:justify-between">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MobileSidebarToggle
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                />
                                <a
                                    href={route('home')}
                                    className="flex items-center transition-opacity hover:opacity-80"
                                >
                                    <div className="ml-2">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                                            {authUser.name}
                                        </span>
                                    </div>
                                </a>
                            </div>

                            <div className="hidden space-x-4 sm:ml-6 sm:flex sm:items-center">
                                {/* User Dropdown */}
                                <div className="relative ml-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition duration-150 ease-in-out hover:bg-white/10 hover:text-green-900 focus:outline-none dark:text-white">
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
                        </div>
                    </div>
                </div>

                {/* Page Heading */}
                {header && (
                    <header className="bg-white dark:bg-gray-800">
                        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
