import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    FaHome, 
    FaStore, 
    FaStar, 
    FaInbox, 
    FaUser 
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
        route: '/',
        isHome: true
    },
    {
        icon: <FaStore />,
        label: 'Shop',
        route: '/shop'
    },
    {
        icon: <FaStar />,
        label: 'Highlights',
        route: '/highlights'
    },
    {
        icon: <FaInbox />,
        label: 'Inbox',
        route: '/inbox',
        notifications: 3 // Only keeping notifications for Inbox
    },
    {
        icon: <FaUser />,
        label: 'Profile',
        route: '/profile'
    }
];

export default function BottomNav() {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item, index) => (
                    item.isHome ? (
                        <div
                            key={index}
                            className="relative flex flex-col items-center justify-center w-full h-full text-blue-500"
                        >
                            <div className="relative text-xl mb-1">
                                {item.icon}
                            </div>
                            <span className="text-xs">
                                {item.label}
                            </span>
                        </div>
                    ) : (
                        <Link
                            key={index}
                            href={item.route}
                            className="relative flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-blue-500"
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
                    )
                ))}
            </div>
        </div>
    );
} 