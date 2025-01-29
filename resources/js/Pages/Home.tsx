import React from 'react';
import { Link as InertiaLink } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { ThemeProvider, useTheme } from "@/Components/ThemeProvider";
import { Button } from '@/Components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/Components/ui/dropdown-menu";
import { apps } from '@/data/apps';
import { QuestionMarkCircleIcon, ArrowRightStartOnRectangleIcon, UserIcon, CreditCardIcon } from '@heroicons/react/24/outline';
// @ts-ignore
import { Sun, Moon, Monitor } from 'lucide-react';

interface Props {
    auth: {
        user: {
            name: string;
            credits?: number;
        };
    };
}

export default function Home({ auth }: Props) {
    const { theme, setTheme } = useTheme();

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
                        <div className="flex flex-col items-cente">
                            <div className="w-full flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                    <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                                    <span className="ml-2 text-xl font-bold text-white">Sakto</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="hidden sm:flex items-center gap-2">
                                        <div className="text-white bg-white/10 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg">
                                            <span className="text-sm font-medium">{auth.user.credits ?? 0} Credits</span>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1.5 font-semibold border-0 [text-shadow:_0_1px_1px_rgba(0,0,0,0.2)]"
                                            onClick={() => window.location.href = route('credits.buy')}
                                        >
                                            <CreditCardIcon className="w-4 h-4" />
                                            Buy Credits
                                        </Button>
                                    </div>
                                    {/* Mobile Credits Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="sm:hidden text-white hover:text-blue-100 hover:bg-white/10"
                                        onClick={() => window.location.href = route('credits.buy')}
                                    >
                                        <CreditCardIcon className="w-5 h-5" />
                                    </Button>
                                    <div className="relative inline-block">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    className="text-white hover:text-blue-100 hover:bg-white/10 transition-colors duration-200 flex items-center gap-2 px-3 py-2 h-auto font-normal border-0 no-underline hover:no-underline focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                                                >
                                                    <UserIcon className="w-5 h-5" />
                                                    <span>{auth.user.name}</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent 
                                                align="end" 
                                                alignOffset={0}
                                                sideOffset={8}
                                                className="w-56 z-50"
                                                onCloseAutoFocus={(e) => e.preventDefault()}
                                                collisionPadding={16}
                                            >
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger className="flex items-center">
                                                        {theme === 'dark' ? (
                                                            <Moon className="h-4 w-4 mr-2" />
                                                        ) : (
                                                            <Sun className="h-4 w-4 mr-2" />
                                                        )}
                                                        <span>Theme</span>
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem 
                                                            onClick={() => setTheme("light")}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Sun className="mr-2 h-4 w-4" />
                                                            <span>Light</span>
                                                            {theme === "light" && <span className="ml-auto">✓</span>}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => setTheme("dark")}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Moon className="mr-2 h-4 w-4" />
                                                            <span>Dark</span>
                                                            {theme === "dark" && <span className="ml-auto">✓</span>}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => setTheme("system")}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Monitor className="mr-2 h-4 w-4" />
                                                            <span>System</span>
                                                            {theme === "system" && <span className="ml-auto">✓</span>}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                <DropdownMenuItem asChild>
                                                    <InertiaLink 
                                                        href={route('help')}
                                                        className="flex items-center"
                                                    >
                                                        <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                                                        <span>Help</span>
                                                    </InertiaLink>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" />
                                                    <InertiaLink 
                                                        href={route('logout')} 
                                                        method="post" 
                                                        as="button"
                                                        className="w-full text-left"
                                                    >
                                                        Logout
                                                    </InertiaLink>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center mb-6 landscape:hidden">
                            <span className="text-lg text-white text-opacity-90 mt-1 text-center max-w-2xl">
                                {auth.user.credits ?? 0} Credits
                            </span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 pt-[180px] landscape:pt-[120px] md:pt-[200px] overflow-y-auto mb-4">
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4 lg:gap-6 gap-y-8 md:gap-y-10 lg:gap-y-12 w-full mx-auto">
                        {apps.filter(app => app.visible).sort((a, b) => a.title.localeCompare(b.title)).map((app) => (
                            <InertiaLink
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
                            </InertiaLink>
                        ))}
                    </div>
                </div>
                <BottomNav />
            </div>
        </ThemeProvider>
    );
}
