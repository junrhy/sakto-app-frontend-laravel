import React from 'react';
import { Link } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { 
    FaStore, 
    FaUtensils, 
    FaHospital, 
    FaHandHoldingUsd,
    FaBuilding,
    FaBus,
    FaWarehouse,
    FaQuestionCircle,
    FaPlane,
    FaBoxOpen,
    FaUsers
} from 'react-icons/fa';

interface AppCard {
    icon: React.ReactNode;
    title: string;
    route: string;
    bgColor: string;
    visible: boolean;
}

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
}

const apps: AppCard[] = [
    {
        icon: <FaStore />,
        title: 'Retail',
        route: '/dashboard?app=retail',
        bgColor: 'text-blue-500',
        visible: true
    },
    {
        icon: <FaUtensils />,
        title: 'F&B',
        route: '/dashboard?app=fnb',
        bgColor: 'text-orange-500',
        visible: true
    },
    {
        icon: <FaHospital />,
        title: 'Clinic',
        route: '/dashboard?app=clinic',
        bgColor: 'text-green-500',
        visible: true
    },
    {
        icon: <FaHandHoldingUsd />,
        title: 'Lending',
        route: '/dashboard?app=lending',
        bgColor: 'text-purple-500',
        visible: true
    },
    {
        icon: <FaBoxOpen />,
        title: 'Rental',
        route: '/dashboard?app=rental-item',
        bgColor: 'text-indigo-500',
        visible: true
    },
    {
        icon: <FaBuilding />,
        title: 'Real Estate',
        route: '/dashboard?app=real-estate',
        bgColor: 'text-red-500',
        visible: true
    },
    {
        icon: <FaBus />,
        title: 'Transportation',
        route: '/dashboard?app=transportation',
        bgColor: 'text-yellow-500',
        visible: false
    },
    {
        icon: <FaWarehouse />,
        title: 'Warehousing',
        route: '/dashboard?app=warehousing',
        bgColor: 'text-teal-500',
        visible: false
    },
    {
        icon: <FaUsers />,
        title: 'Payroll',
        route: '/dashboard?app=payroll',
        bgColor: 'text-cyan-500',
        visible: true
    },
    {
        icon: <FaPlane />,
        title: 'Travel',
        route: '/dashboard?app=travel',
        bgColor: 'text-pink-500',
        visible: false
    }
];

export default function Home({ auth }: Props) {
    const getBorderColor = (colorClass: string) => {
        const colorMap: { [key: string]: string } = {
            'text-blue-500': '#3B82F6',
            'text-orange-500': '#F97316',
            'text-green-500': '#22C55E',
            'text-purple-500': '#A855F7',
            'text-indigo-500': '#6366F1',
            'text-red-500': '#EF4444',
            'text-yellow-500': '#EAB308',
            'text-teal-500': '#14B8A6',
            'text-cyan-500': '#06B6D4',
            'text-pink-500': '#EC4899',
        };
        return colorMap[colorClass] || '#3B82F6'; // default to blue if color not found
    };

    const firstName = auth.user.name.split(' ')[0];

    return (
        <div className="relative min-h-screen pb-16">
            <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-black via-gray-900 to-black z-10">
                <div className="container mx-auto px-4 pt-4">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-full flex justify-between items-center mb-2">
                            <div className="flex items-center">
                                <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                                <span className="ml-2 text-xl font-bold text-white">Sakto</span>
                            </div>
                            <Link 
                                href="/help"
                                className="text-white hover:text-blue-100 transition-colors duration-200"
                            >
                                <span className="text-md font-semibold">Help</span>
                            </Link>
                        </div>
                        <h2 className="text-xl font-semibold text-white landscape:hidden">
                            Hello, {firstName}
                        </h2>
                    </div>

                    <div className="flex flex-col items-center mb-6 landscape:hidden">
                        <span className="text-lg text-white text-opacity-90 mt-1 text-center max-w-2xl">
                            Choose the app you need to get started.
                        </span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pt-[180px] landscape:pt-[120px] md:pt-[200px] overflow-y-auto mb-4">
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4 lg:gap-6 gap-y-8 md:gap-y-10 lg:gap-y-12 w-full mx-auto">
                    {apps.filter(app => app.visible).sort((a, b) => a.title.localeCompare(b.title)).map((app, index) => (
                        <Link
                            key={index}
                            href={app.route}
                            className="flex flex-col items-center"
                        >
                            <div 
                                className={`w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-2 transform hover:-translate-y-1 transition-all duration-200`}
                                style={{ borderWidth: '2px', borderColor: getBorderColor(app.bgColor) }}
                            >
                                <div className={`text-4xl ${app.bgColor}`}>
                                    {app.icon}
                                </div>
                            </div>
                            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                                {app.title}
                            </h2>
                        </Link>
                    ))}
                </div>
            </div>
            <BottomNav />
        </div>
    );
}
