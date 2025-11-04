import {
    ArrowRightStartOnRectangleIcon,
    Bars3Icon,
    CreditCardIcon,
    QuestionMarkCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';
import { RxEnvelopeOpen, RxHome, RxMix, RxPerson } from 'react-icons/rx';

interface NavItem {
    icon: React.ReactNode;
    label: string;
    route: string;
    notifications?: number;
    isHome?: boolean;
    isAction?: boolean;
    isLogout?: boolean;
    method?: 'get' | 'post';
}

const createNavItems = (
    unreadCount: number = 0,
    projectIdentifier: string = '',
): NavItem[] => [
    {
        icon: <RxHome />,
        label: 'Home',
        route: '/home',
        isHome: true,
    },
    {
        icon: <RxMix />,
        label: 'Apps',
        route: '/apps',
    },
    {
        icon: <RxEnvelopeOpen />,
        label: 'Inbox',
        route: '/inbox',
        notifications: unreadCount,
    },
    {
        icon: <RxPerson />,
        label: 'Profile',
        route: '/profile',
    },
    {
        icon: <CreditCardIcon className="h-6 w-6" />,
        label: 'Buy Credits',
        route: '/credits/buy',
        isAction: true,
    },
    {
        icon: <QuestionMarkCircleIcon className="h-6 w-6" />,
        label: 'Help',
        route: '/help',
    },
    {
        icon: <ArrowRightStartOnRectangleIcon className="h-6 w-6" />,
        label: 'Logout',
        route: `/logout/${projectIdentifier}`,
        isLogout: true,
        method: 'post',
    },
];

interface MobileSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export function MobileSidebarToggle({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-900 transition-colors hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 md:hidden"
            aria-label="Toggle menu"
        >
            <Bars3Icon className="h-6 w-6" />
        </button>
    );
}

export default function MobileSidebar({
    isOpen,
    onToggle,
}: MobileSidebarProps) {
    const { url } = usePage();
    const page = usePage();
    const pageProps = page.props as {
        auth?: { project?: { identifier?: string } };
        unreadCount?: number;
    };
    const unreadCount = pageProps.unreadCount ?? 0;
    const projectIdentifier = pageProps.auth?.project?.identifier ?? '';

    const items = createNavItems(unreadCount, projectIdentifier);

    return (
        <>
            {/* Overlay - Only visible when sidebar is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar - Only visible on mobile */}
            <div
                className={`fixed left-0 top-0 z-50 h-full w-full transform bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 md:hidden ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-full flex-col">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Menu
                        </h2>
                        <button
                            onClick={onToggle}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-2">
                            {items.map((item, index) => {
                                const isActive = url === item.route;
                                return (
                                    <Link
                                        key={index}
                                        href={item.route}
                                        method={item.method || 'get'}
                                        as={
                                            item.isLogout ? 'button' : undefined
                                        }
                                        onClick={onToggle}
                                        className={`relative flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                                            item.isAction
                                                ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700'
                                                : item.isLogout
                                                  ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                                                  : isActive
                                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <div className="relative text-2xl">
                                            {item.icon}
                                            {typeof item.notifications ===
                                                'number' &&
                                                item.notifications > 0 && (
                                                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                                                        {item.notifications > 9
                                                            ? '9+'
                                                            : item.notifications}
                                                    </div>
                                                )}
                                        </div>
                                        <span
                                            className={`text-base font-medium ${
                                                item.isAction
                                                    ? 'font-semibold'
                                                    : isActive
                                                      ? 'font-semibold'
                                                      : ''
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                            Neulify © {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
