import React from 'react';
import { Link } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { ThemeProvider } from "@/Components/ThemeProvider";
import { ModeToggle } from "@/Components/ModeToggle";
import { apps } from '@/data/apps';
import { QuestionMarkCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
}

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
        return colorMap[colorClass] || '#3B82F6';
    };

    const firstName = auth.user.name.split(' ')[0];

    return (
        <ThemeProvider>
            <div className="relative min-h-screen pb-16 bg-gray-50 dark:bg-gray-900">
                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-10 shadow-lg">
                    <div className="container mx-auto px-4 pt-4">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-full flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                    <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                                    <span className="ml-2 text-xl font-bold text-white">Sakto</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <ModeToggle />
                                    <Link 
                                        href="/help"
                                        className="text-white hover:text-blue-100 transition-colors duration-200 flex items-center gap-1"
                                    >
                                        <QuestionMarkCircleIcon className="w-5 h-5" />
                                        <span className="text-md font-semibold">Help</span>
                                    </Link>
                                    <Link 
                                        href={route('logout')} 
                                        method="post" 
                                        as="button"
                                        className="text-white hover:text-blue-100 transition-colors duration-200 flex items-center gap-1"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                        <span className="text-md font-semibold">Logout</span>
                                    </Link>
                                </div>
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
                        {apps.filter(app => app.visible).sort((a, b) => a.title.localeCompare(b.title)).map((app) => (
                            <Link
                                key={app.title}
                                href={app.route}
                                className="flex flex-col items-center"
                            >
                                <div 
                                    className={`w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-2 transform hover:-translate-y-1 transition-all duration-200 shadow-md hover:shadow-lg dark:shadow-gray-800`}
                                    style={{ borderWidth: '2px', borderColor: getBorderColor(app.bgColor) }}
                                >
                                    <div className={`text-4xl ${app.bgColor}`}>
                                        {app.icon}
                                    </div>
                                </div>
                                <h2 className="text-sm font-medium text-gray-800 dark:text-gray-300 text-center">
                                    {app.title}
                                </h2>
                            </Link>
                        ))}
                    </div>
                </div>
                <BottomNav />
            </div>
        </ThemeProvider>
    );
}
