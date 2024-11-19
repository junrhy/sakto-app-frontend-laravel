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
    FaKey,
    FaUsers
} from 'react-icons/fa';

interface AppCard {
    icon: React.ReactNode;
    title: string;
    route: string;
    bgColor: string;
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
        bgColor: 'bg-blue-500'
    },
    {
        icon: <FaUtensils />,
        title: 'F&B',
        route: '/dashboard?app=fnb',
        bgColor: 'bg-orange-500'
    },
    {
        icon: <FaHospital />,
        title: 'Clinic',
        route: '/dashboard?app=clinic',
        bgColor: 'bg-green-500'
    },
    {
        icon: <FaHandHoldingUsd />,
        title: 'Lending',
        route: '/dashboard?app=lending',
        bgColor: 'bg-purple-500'
    },
    {
        icon: <FaKey />,
        title: 'Rental',
        route: '/dashboard?app=rental-item',
        bgColor: 'bg-indigo-500'
    },
    {
        icon: <FaBuilding />,
        title: 'Real Estate',
        route: '/dashboard?app=real-estate',
        bgColor: 'bg-red-500'
    },
    {
        icon: <FaBus />,
        title: 'Transportation',
        route: '/dashboard?app=transportation',
        bgColor: 'bg-yellow-500'
    },
    {
        icon: <FaWarehouse />,
        title: 'Warehousing',
        route: '/dashboard?app=warehousing',
        bgColor: 'bg-teal-500'
    },
    {
        icon: <FaUsers />,
        title: 'Payroll',
        route: '/dashboard?app=payroll',
        bgColor: 'bg-cyan-500'
    },
    {
        icon: <FaPlane />,
        title: 'Travel',
        route: '/dashboard?app=travel',
        bgColor: 'bg-pink-500'
    }
];

export default function Home({ auth }: Props) {
    const firstName = auth.user.name.split(' ')[0];

    return (
        <div className="relative min-h-screen pb-16">
            <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 z-10">
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
                            Sakto Apps is your all-in-one business solutions. Choose the app you need to get started.
                        </span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pt-[240px] landscape:pt-[120px] md:pt-[200px] overflow-y-auto mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                    {apps.map((app, index) => (
                        <Link
                            key={index}
                            href={app.route}
                            className={`${app.bgColor} hover:opacity-90 transition-opacity duration-200 rounded-lg p-6 flex flex-col items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform duration-200`}
                        >
                            <div className="text-5xl mb-4">
                                {app.icon}
                            </div>
                            <h2 className="text-xl font-semibold">
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
