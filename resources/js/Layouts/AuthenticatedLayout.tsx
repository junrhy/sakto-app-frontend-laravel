import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import { ThemeProvider } from "@/Components/ThemeProvider";
import { ModeToggle } from "@/Components/ModeToggle";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Toaster } from 'react-hot-toast';

interface DashboardType {
    id: number;
    name: string;
}

interface PageProps extends Record<string, any> {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

const getHeaderColorClass = (url: string): string => {
    const appParam = new URLSearchParams(url.split('?')[1]).get('app');

    // Check the entire URL path for specific routes
    if (url.includes('/retail') || url.includes('/pos-retail') || url.includes('/inventory') || appParam === 'retail') {
        return 'from-blue-600 via-blue-500 to-blue-400 dark:from-blue-950 dark:via-blue-900 dark:to-blue-800';
    }
    if (url.includes('/pos-restaurant') || url.includes('/fnb') || appParam === 'fnb') {
        return 'from-orange-600 via-orange-500 to-orange-400 dark:from-orange-950 dark:via-orange-900 dark:to-orange-800';
    }
    if (url.includes('/clinic') || appParam === 'clinic') {
        return 'from-emerald-600 via-emerald-500 to-emerald-400 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-800';
    }
    if (url.includes('/loan') || appParam === 'lending') {
        return 'from-purple-600 via-purple-500 to-purple-400 dark:from-purple-950 dark:via-purple-900 dark:to-purple-800';
    }
    if (url.includes('/rental-item') || appParam === 'rental-item') {
        return 'from-indigo-600 via-indigo-500 to-indigo-400 dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-800';
    }
    if (url.includes('/rental-property') || url.includes('/real-estate') || appParam === 'real-estate') {
        return 'from-red-600 via-red-500 to-red-400 dark:from-red-950 dark:via-red-900 dark:to-red-800';
    }
    if (url.includes('/transportation') || appParam === 'transportation') {
        return 'from-amber-600 via-amber-500 to-amber-400 dark:from-amber-950 dark:via-amber-900 dark:to-amber-800';
    }
    if (url.includes('/warehousing') || appParam === 'warehousing') {
        return 'from-teal-600 via-teal-500 to-teal-400 dark:from-teal-950 dark:via-teal-900 dark:to-teal-800';
    }
    if (url.includes('/payroll') || appParam === 'payroll') {
        return 'from-cyan-600 via-cyan-500 to-cyan-400 dark:from-cyan-950 dark:via-cyan-900 dark:to-cyan-800';
    }
    if (url.includes('/travel') || url.includes('/flight-search') || appParam === 'travel') {
        return 'from-pink-600 via-pink-500 to-pink-400 dark:from-pink-950 dark:via-pink-900 dark:to-pink-800';
    }
    if (url.includes('/sms') || url.includes('/sms-twilio') || url.includes('/sms-semaphore') || appParam === 'sms') {
        return 'from-violet-600 via-violet-500 to-violet-400 dark:from-violet-950 dark:via-violet-900 dark:to-violet-800';
    }
    if (url.includes('/email') || appParam === 'email') {
        return 'from-emerald-600 via-emerald-500 to-emerald-400 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-800';
    }
    if (url.includes('/contacts') || appParam === 'contacts') {
        return 'from-slate-600 via-slate-500 to-slate-400 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800';
    }
    if (url.includes('/credits') || appParam === 'credits') {
        return 'from-indigo-700 via-purple-600 to-indigo-500 dark:from-indigo-950 dark:via-purple-900 dark:to-indigo-800';
    }
    // Default gradient for unmatched routes
    return 'from-black via-gray-900 to-black dark:from-black dark:via-gray-950 dark:to-black';
};

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth: { user } } = usePage<PageProps>().props;
    const url = usePage().url;
    const appParam = new URLSearchParams(url.split('?')[1]).get('app');

    const hasDashboardAccess = !url.includes('help') && !url.includes('profile') && !url.includes('credits');

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const hasRetailAccess = url.includes('retail');
    const hasFnbAccess = url.includes('fnb');
    const hasWarehousingAccess = url.includes('warehousing');
    const hasTransportationAccess = url.includes('transportation');
    const hasRentalItemAccess = url.includes('rental-item');
    const hasRentalPropertyAccess = url.includes('real-estate');
    const hasClinicalAccess = url.includes('clinic');
    const hasLendingAccess = url.includes('lending');
    const hasPayrollAccess = url.includes('payroll');
    const hasTravelAccess = url.includes('travel');
    const hasSmsAccess = url.includes('sms');
    const hasEmailAccess = url.includes('email');
    const hasContactsAccess = url.includes('contacts');
    const hasCreditsAccess = url.includes('credits');
    // const hasClinicAccess = user.project?.modules?.some(
    //     module => module.identifier === 'clinic'
    // );

    const [newDashboardName, setNewDashboardName] = useState('');

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const [hideNav, setHideNav] = useState(() => {
        // Get stored preference from localStorage, default to false
        return localStorage.getItem('hideNav') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('hideNav', hideNav.toString());
    }, [hideNav]);

    const createNewDashboard = () => {
        if (newDashboardName.trim()) {
            // You can implement the dashboard creation logic here
            // For now, we'll just navigate to the dashboard page
            window.location.href = route('dashboard');
            setNewDashboardName("");
        }
    };

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-white dark:bg-gray-800 relative">
                <Toaster position="top-right" />
                
                {/* Mobile Navigation */}
                <div
                    className={
                        (showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full') +
                        ' fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out sm:hidden bg-gradient-to-b from-gray-900 to-gray-800 shadow-lg z-[60] overflow-y-auto'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('home')} active={route().current('home')} className="text-white/90 hover:text-white hover:bg-white/10">
                            Home
                        </ResponsiveNavLink>

                        {hasDashboardAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Dashboard</div>
                                    <ResponsiveNavLink href={`/dashboard?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        View Dashboards
                                    </ResponsiveNavLink>
                                    <button 
                                        className="w-full text-left block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-150"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsCreateDialogOpen(true);
                                            setShowingNavigationDropdown(false);
                                        }}
                                    >
                                        Create Dashboard
                                    </button>
                                </div>
                            </div>
                        )}

                        {hasRetailAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Retail</div>
                                    <ResponsiveNavLink href={`/pos-retail?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        POS
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink href={`/inventory?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Inventory
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink href={`/retail-sale?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Sales
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasFnbAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">F & B</div>
                                    <ResponsiveNavLink href={`/pos-restaurant?app=${appParam}&tab=tables`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Restaurant
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {(hasWarehousingAccess || hasTransportationAccess) && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Distribution</div>
                                    {hasWarehousingAccess && (
                                        <ResponsiveNavLink href={`/warehousing?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                            Warehousing
                                        </ResponsiveNavLink>
                                    )}
                                    {hasTransportationAccess && (
                                        <ResponsiveNavLink href={`/transportation?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                            Transportation
                                        </ResponsiveNavLink>
                                    )}
                                </div>
                            </div>
                        )}

                        {(hasRentalItemAccess || hasRentalPropertyAccess) && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Rental</div>
                                    {hasRentalItemAccess && (
                                        <ResponsiveNavLink href={`/rental-item?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                            Rental Items
                                        </ResponsiveNavLink>
                                    )}
                                    {hasRentalPropertyAccess && (
                                        <ResponsiveNavLink href={`/rental-property?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                            Rental Properties
                                        </ResponsiveNavLink>
                                    )}
                                </div>
                            </div>
                        )}

                        {hasClinicalAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Medical</div>
                                    <ResponsiveNavLink href={`/clinic?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Clinic
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasLendingAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Finance</div>
                                    <ResponsiveNavLink href={`/loan?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Loans
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasPayrollAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">HR</div>
                                    <ResponsiveNavLink href={`/payroll?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Payroll
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasTravelAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Travel</div>
                                    <ResponsiveNavLink href={`/travel?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Bookings
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink href={`/flight-search?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Flights
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasSmsAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">SMS</div>
                                    <ResponsiveNavLink href={`/sms-twilio?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Twilio SMS
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink href={`/sms-semaphore?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Semaphore SMS
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasEmailAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Communication</div>
                                    <ResponsiveNavLink href={`/email?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Email
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasContactsAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Directory</div>
                                    <ResponsiveNavLink href={`/contacts?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Contacts
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {showingNavigationDropdown && (
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] sm:hidden"
                        onClick={() => setShowingNavigationDropdown(false)}
                    />
                )}

                <nav className={`border-b border-gray-100 bg-gradient-to-r ${getHeaderColorClass(url)} sticky top-0 z-50 transition-transform duration-300 ${hideNav ? '-translate-y-full sm:block' : 'translate-y-0'}`}>
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex shrink-0 items-center">
                                    <Link href="/home" className="transition-transform hover:scale-105">
                                        <div className="flex items-center">
                                            <ApplicationLogo className="block h-9 w-auto fill-current text-white" />
                                            <span className="text-xl font-black ml-2 text-white">
                                                Sakto
                                            </span>
                                        </div>
                                    </Link>
                                </div>

                                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                    <NavLink
                                        href={route('home')}
                                        active={route().current('home')}
                                        className="transition-all duration-200 text-white/90 hover:text-white"
                                    >
                                        Home
                                    </NavLink>

                                    {hasDashboardAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Dashboards</span>
                                                            <svg
                                                                className="ml-2 -mr-0.5 h-4 w-4"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content>
                                                    <Dropdown.Link 
                                                        href={`/dashboard?app=${appParam}`}
                                                        as="button"
                                                        className="w-full text-left"
                                                    >
                                                        View Dashboard
                                                    </Dropdown.Link>
                                                    <Dropdown.Link 
                                                        href="#"
                                                        as="button"
                                                        className="w-full text-left"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setIsCreateDialogOpen(true);
                                                        }}
                                                    >
                                                        Create Dashboard
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}

                                    {hasRetailAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Retail</span>
                                                            <svg
                                                                className="ml-2 -mr-0.5 h-4 w-4"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content>
                                                    <Dropdown.Link href={`/pos-retail?app=${appParam}`}>
                                                        POS
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/inventory?app=${appParam}`}>
                                                        Inventory
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/retail-sale?app=${appParam}`}>
                                                        Sales
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasFnbAccess && (
                                        <NavLink
                                            href={`/pos-restaurant?app=${appParam}&tab=tables`}
                                            active={route().current('pos-restaurant')}
                                            className="transition-all duration-200 text-white/90 hover:text-white"
                                        >
                                            F & B
                                        </NavLink>
                                    )}
                                    {(hasWarehousingAccess || hasTransportationAccess) && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Distribution</span>
                                                            <svg
                                                                className="ml-2 -mr-0.5 h-4 w-4"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content>
                                                    {hasWarehousingAccess && (
                                                        <Dropdown.Link href={`/warehousing?app=${appParam}`}>
                                                            Warehousing
                                                        </Dropdown.Link>
                                                    )}
                                                    {hasTransportationAccess && (
                                                        <Dropdown.Link href={`/transportation?app=${appParam}`}>
                                                            Transportation
                                                        </Dropdown.Link>
                                                    )}
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {(hasRentalItemAccess || hasRentalPropertyAccess) && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Rental</span>
                                                            <svg
                                                                className="ml-2 -mr-0.5 h-4 w-4"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content>
                                                    {hasRentalItemAccess && (
                                                        <Dropdown.Link href={`/rental-item?app=${appParam}`}>
                                                            Rental Items
                                                        </Dropdown.Link>
                                                    )}
                                                    {hasRentalPropertyAccess && (
                                                        <Dropdown.Link href={`/rental-property?app=${appParam}`}>
                                                            Rental Properties
                                                        </Dropdown.Link>
                                                    )}
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasClinicalAccess && (
                                        <NavLink
                                            href={`/clinic?app=${appParam}`}
                                            active={route().current('clinic')}
                                            className="transition-all duration-200 text-white/90 hover:text-white"
                                        >
                                            Clinic
                                        </NavLink>
                                    )}
                                    {hasLendingAccess && (
                                        <NavLink
                                            href={`/loan?app=${appParam}`}
                                            active={route().current('loan')}
                                            className="transition-all duration-200 text-white/90 hover:text-white"
                                        >
                                            Loans
                                        </NavLink>
                                    )}
                                    {hasPayrollAccess && (
                                        <NavLink
                                            href={`/payroll?app=${appParam}`}
                                            active={route().current('payroll')}
                                            className="transition-all duration-200 text-white/90 hover:text-white"
                                        >
                                            Payroll
                                        </NavLink>
                                    )}
                                    {hasTravelAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Travel</span>
                                                            <svg
                                                                className="ml-2 -mr-0.5 h-4 w-4"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content>
                                                    <Dropdown.Link href={`/travel?app=${appParam}`}>
                                                        Bookings
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/flight-search?app=${appParam}`}>
                                                        Flights
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasSmsAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">SMS</span>
                                                            <svg
                                                                className="ml-2 -mr-0.5 h-4 w-4"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content>
                                                    <Dropdown.Link href={`/sms-twilio?app=${appParam}`}>
                                                        Twilio SMS
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/sms-semaphore?app=${appParam}`}>
                                                        Semaphore SMS
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasEmailAccess && (
                                        <NavLink
                                            href={`/email?app=${appParam}`}
                                            active={route().current('email')}
                                            className="transition-all duration-200 text-white/90 hover:text-white"
                                        >
                                            Email
                                        </NavLink>
                                    )}
                                    {hasContactsAccess && (
                                        <NavLink
                                            href={`/contacts?app=${appParam}`}
                                            active={route().current('contacts')}
                                            className="transition-all duration-200 text-white/90 hover:text-white"
                                        >
                                            Contacts
                                        </NavLink>
                                    )}
                                </div>
                            </div>

                            <div className="-me-2 flex items-center sm:hidden">
                                <button
                                    onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                    className="inline-flex items-center justify-center rounded-md p-2 text-white/80 transition duration-150 ease-in-out hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            className={
                                                !showingNavigationDropdown
                                                    ? 'inline-flex'
                                                    : 'hidden'
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={
                                                showingNavigationDropdown
                                                    ? 'inline-flex'
                                                    : 'hidden'
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="relative bg-white dark:bg-gray-800 min-h-screen">
                    {header && (
                        <header className="bg-white/80 shadow-sm backdrop-blur-lg dark:bg-gray-800/80">
                            <div className="px-4 py-6 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </header>
                    )}

                    <main className="py-6">
                        <div className="px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </main>
                </div>

                <button
                    onClick={() => setHideNav(!hideNav)}
                    className="hidden sm:block fixed top-2 right-2 z-50 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors duration-200"
                    aria-label="Toggle navigation"
                >
                    {hideNav ? (
                        <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                        <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    )}
                </button>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Dashboard</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <Input
                            placeholder="Dashboard name"
                            value={newDashboardName}
                            onChange={(e) => setNewDashboardName(e.target.value)}
                        />
                        <Button 
                            onClick={() => {
                                createNewDashboard();
                                setIsCreateDialogOpen(false);
                            }}
                            disabled={!newDashboardName.trim()}
                            className="w-full"
                        >
                            Create Dashboard
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </ThemeProvider>
    );
}
