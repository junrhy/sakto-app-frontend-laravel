import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateCurrencyForm from './Partials/UpdateCurrencyForm';
import UpdateThemeForm from './Partials/UpdateThemeForm';
import UpdateColorThemeForm from './Partials/UpdateColorThemeForm';
import UpdateAddressesForm from './Partials/UpdateAddressesForm';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link as InertiaLink } from '@inertiajs/react';
import { ArrowLeft, Link } from 'lucide-react';
import { ThemeProvider, useTheme } from "@/Components/ThemeProvider";
import { Button } from '@/Components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/Components/ui/dropdown-menu";
import { QuestionMarkCircleIcon, ArrowRightStartOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline';
// @ts-ignore
import { Sun, Moon, Monitor } from 'lucide-react';
import BottomNav from '@/Components/BottomNav';

export default function Edit({
    mustVerifyEmail,
    status,
    addresses,
    currency,
    auth,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    addresses: Array<any>;
    currency: any;
    auth: {
        user: {
            name: string;
        };
    };
}) {
    const { theme, setTheme } = useTheme();

    return (
        <ThemeProvider>
            <div className="relative min-h-screen pb-16 bg-white dark:bg-gray-900">
                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-10">
                    <div className="container mx-auto px-4 pt-4">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-full flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                    <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                                    <span className="ml-2 text-xl font-bold text-white">Sakto</span>
                                </div>
                                <div className="flex items-center gap-4">
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
                    </div>
                </div>

                <div className="container mx-auto px-4 pt-[100px] landscape:pt-[80px] md:pt-[100px]">
                    <div className="py-12">
                        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </div>

                            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                                <UpdateAddressesForm 
                                    addresses={addresses}
                                    className="w-full" 
                                />
                            </div>

                            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                                <UpdatePasswordForm className="max-w-xl" />
                            </div>

                            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                                <UpdateCurrencyForm 
                                    currency={currency}
                                    className="max-w-xl" 
                                />
                            </div>

                            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                                <UpdateThemeForm className="max-w-xl" />
                            </div>

                            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                                <UpdateColorThemeForm className="max-w-xl" />
                            </div>

                            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                                <DeleteUserForm className="max-w-xl" />
                            </div>
                        </div>
                    </div>
                </div>
                <BottomNav />
            </div>
        </ThemeProvider>
    );
}
