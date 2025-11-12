import { Link, usePage } from '@inertiajs/react';
import React from 'react';

import { PageProps } from '@/types';
import { RxEnvelopeOpen, RxHome, RxMix, RxPerson } from 'react-icons/rx';

interface NavItem {
    icon: React.ReactNode;
    label: string;
    route: string;
    notifications?: number;
    isHome?: boolean;
}

const createNavItems = (unreadCount: number = 0): NavItem[] => [
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
];

export default function BottomNav() {
    const page = usePage<PageProps>();
    const { url } = page;
    const unreadCount = page.props.unreadCount ?? 0;
    const projectIdentifier = page.props.auth?.user?.project_identifier ?? null;

    const items = createNavItems(unreadCount).filter((item) =>
        projectIdentifier === 'enterprise' ? true : item.route !== '/apps',
    );

    return (
        <div className="fixed bottom-0 left-0 right-0 hidden border-t border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 md:block">
            <div className="flex h-16 items-center justify-around">
                {items.map((item, index) => {
                    return (
                        <Link
                            key={index}
                            href={item.route}
                            className={`relative flex h-full w-full flex-col items-center justify-center ${
                                url === item.route
                                    ? 'text-black dark:text-white'
                                    : 'text-gray-600 dark:text-gray-400'
                            } transition-colors hover:text-black dark:hover:text-white`}
                        >
                            <div className="relative mb-1 text-xl">
                                {item.icon}
                                {typeof item.notifications === 'number' &&
                                    item.notifications > 0 && (
                                        <div className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                            {item.notifications > 9
                                                ? '9+'
                                                : item.notifications}
                                        </div>
                                    )}
                            </div>
                            <span className="text-xs">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
