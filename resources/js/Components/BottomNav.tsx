import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    FaHome, 
    FaStore, 
    FaStar, 
    FaInbox, 
    FaUser,
    FaComments,
    FaPlus
} from 'react-icons/fa';

interface NavItem {
    icon: React.ReactNode;
    label: string;
    route: string;
    notifications?: number;
    isHome?: boolean;
}

const navItems: NavItem[] = [
    {
        icon: <FaHome />,
        label: 'Home',
        route: '/home',
        isHome: true
    },
    {
        icon: <FaPlus />,
        label: 'Apps',
        route: '/apps'
    },
    {
        icon: <FaInbox />,
        label: 'Inbox',
        route: '/inbox',
        notifications: 3
    },
    {
        icon: <FaUser />,
        label: 'Profile',
        route: '/profile'
    }
];

export default function BottomNav() {
    const { url } = usePage();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item, index) => (
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
                            {item.notifications && item.notifications > 0 && (
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {item.notifications > 9 ? '9+' : item.notifications}
                                </div>
                            )}
                        </div>
                        <span className="text-xs">
                            {item.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
} 