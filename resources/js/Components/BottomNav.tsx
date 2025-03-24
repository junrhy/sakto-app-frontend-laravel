import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

import { 
    RxHome,
    RxMix,
    RxEnvelopeOpen,
    RxPerson
} from 'react-icons/rx';

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
        isHome: true
    },
    {
        icon: <RxMix />,
        label: 'Apps',
        route: '/apps'
    },
    {
        icon: <RxEnvelopeOpen />,
        label: 'Inbox',
        route: '/inbox',
        notifications: unreadCount
    },
    {
        icon: <RxPerson />,
        label: 'Profile',
        route: '/profile'
    }
];

interface Props {
    unreadCount?: number;
}

export default function BottomNav() {
    const { url } = usePage();
    const page = usePage<{ auth: { user: any }; unreadCount?: number }>();
    const unreadCount = page.props.unreadCount ?? 0;

    const items = createNavItems(unreadCount);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
            <div className="flex justify-around items-center h-16">
                {items.map((item, index) => {
                    return (
                        <Link
                            key={index}
                            href={item.route}
                            className={`relative flex flex-col items-center justify-center w-full h-full ${
                                url === item.route 
                                    ? 'text-black dark:text-white' 
                                    : 'text-gray-600 dark:text-gray-400'
                            } hover:text-black dark:hover:text-white transition-colors`}
                        >
                            <div className="relative text-xl mb-1">
                                {item.icon}
                                {typeof item.notifications === 'number' && item.notifications > 0 && (
                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {item.notifications > 9 ? '9+' : item.notifications}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
} 