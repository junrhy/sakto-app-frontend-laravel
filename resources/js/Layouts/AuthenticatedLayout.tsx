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
    
    switch (appParam) {
        case 'retail':
            return 'from-blue-600 via-blue-500 to-blue-400';
        case 'fnb':
            return 'from-orange-600 via-orange-500 to-orange-400';
        case 'clinic':
            return 'from-emerald-600 via-emerald-500 to-emerald-400';
        case 'lending':
            return 'from-purple-600 via-purple-500 to-purple-400';
        case 'rental-item':
            return 'from-indigo-600 via-indigo-500 to-indigo-400';
        case 'real-estate':
            return 'from-red-600 via-red-500 to-red-400';
        case 'transportation':
            return 'from-amber-600 via-amber-500 to-amber-400';
        case 'warehousing':
            return 'from-teal-600 via-teal-500 to-teal-400';
        case 'payroll':
            return 'from-cyan-600 via-cyan-500 to-cyan-400';
        case 'travel':
            return 'from-pink-600 via-pink-500 to-pink-400';
        default:
            return 'from-purple-600 via-purple-500 to-blue-400'; // Default gradient
    }
};

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth: { user } } = usePage<PageProps>().props;
    const url = usePage().url;

    const hasDashboardAccess = !url.includes('help') && !url.includes('profile');

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
            <nav className={`border-b border-gray-100 bg-gradient-to-r ${getHeaderColorClass(url)} sticky top-0 z-50 transition-transform duration-300 ${hideNav ? '-translate-y-full' : 'translate-y-0'}`}>
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
                                                    href="/dashboard"
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
                                                <Dropdown.Link href={route('pos-retail')}>
                                                    POS
                                                </Dropdown.Link>
                                                <Dropdown.Link href={route('inventory')}>
                                                    Inventory
                                                </Dropdown.Link>
                                                <Dropdown.Link href={route('retail-sale')}>
                                                    Sales
                                                </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                )}
                                {hasFnbAccess && (
                                    <NavLink
                                        href={route('pos-restaurant', { tab: "tables" })}
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
                                                    <Dropdown.Link href={route('warehousing')}>
                                                        Warehousing
                                                    </Dropdown.Link>
                                                )}
                                                {hasTransportationAccess && (
                                                    <Dropdown.Link href={route('transportation')}>
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
                                                    <Dropdown.Link href={route('rental-item')}>
                                                        Rental Items
                                                    </Dropdown.Link>
                                                )}
                                                {hasRentalPropertyAccess && (
                                                    <Dropdown.Link href={route('rental-property')}>
                                                        Rental Properties
                                                    </Dropdown.Link>
                                                )}
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                )}
                                {hasClinicalAccess && (
                                    <NavLink
                                        href={route('clinic')}
                                        active={route().current('clinic')}
                                        className="transition-all duration-200 text-white/90 hover:text-white"
                                    >
                                        Clinic
                                    </NavLink>
                                )}
                                {hasLendingAccess && (
                                    <NavLink
                                        href={route('loan')}
                                        active={route().current('loan')}
                                        className="transition-all duration-200 text-white/90 hover:text-white"
                                    >
                                        Loans
                                    </NavLink>
                                )}
                                {hasPayrollAccess && (
                                    <NavLink
                                        href={route('payroll')}
                                        active={route().current('payroll')}
                                        className="transition-all duration-200 text-white/90 hover:text-white"
                                    >
                                        Payroll
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState: any) => !previousState,
                                    )
                                }
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

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        {hasDashboardAccess && (
                            <div className="px-4 py-2">
                                <div className="font-medium text-base text-white">Dashboard</div>
                                <ResponsiveNavLink href={route('dashboard')} className="ml-2 text-white">
                                    View Dashboards
                                </ResponsiveNavLink>
                                <button 
                                    className="w-full text-left ml-3 block pl-3 pr-4 py-2 text-base font-medium text-white transition duration-150 ease-in-out hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:text-gray-800 focus:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsCreateDialogOpen(true);
                                    }}
                                >
                                    Create Dashboard
                                </button>
                            </div>
                        )}

                        {hasRetailAccess && (
                            <div className="px-4 py-2">
                                <div className="font-medium text-base text-white">Retail</div>
                                <ResponsiveNavLink href={route('pos-retail')} className="ml-3">
                                    Retail
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('inventory')} className="ml-3">
                                    Inventory
                                </ResponsiveNavLink>
                            </div>
                        )}

                        {hasFnbAccess && (
                            <div className="px-4 py-2">
                                <div className="font-medium text-base text-white">Restaurant</div>
                                <ResponsiveNavLink href={route('pos-restaurant')} className="ml-3">
                                    Restaurant
                                </ResponsiveNavLink>
                            </div>
                        )}

                        {(hasWarehousingAccess || hasTransportationAccess) && (
                            <div className="px-4 py-2">
                                <div className="font-medium text-base text-white">Distribution</div>
                                {hasWarehousingAccess && (
                                    <ResponsiveNavLink href={route('warehousing')} className="ml-3">
                                        Warehousing
                                    </ResponsiveNavLink>
                                )}
                                {hasTransportationAccess && (
                                    <ResponsiveNavLink href={route('transportation')} className="ml-3">
                                        Transportation
                                    </ResponsiveNavLink>
                                )}
                            </div>
                        )}

                        {(hasRentalItemAccess || hasRentalPropertyAccess) && (
                            <div className="px-4 py-2">
                                <div className="font-medium text-base text-white">Rental</div>
                                {hasRentalItemAccess && (
                                    <ResponsiveNavLink href={route('rental-item')} className="ml-3">
                                        Rental Items
                                    </ResponsiveNavLink>
                                )}
                                {hasRentalPropertyAccess && (
                                    <ResponsiveNavLink href={route('rental-property')} className="ml-3">
                                        Rental Properties
                                    </ResponsiveNavLink>
                                )}
                            </div>
                        )}

                        {hasClinicalAccess && (
                            <ResponsiveNavLink
                                href={route('clinic')}
                                active={route().current('clinic')}
                                className="text-white"
                            >
                                Clinic
                            </ResponsiveNavLink>
                        )}

                        {hasLendingAccess && (
                            <ResponsiveNavLink
                                href={route('loan')}
                                active={route().current('loan')}
                                className="text-white"
                            >
                                Loans
                            </ResponsiveNavLink>
                        )}

                        {hasPayrollAccess && (
                            <ResponsiveNavLink
                                href={route('payroll')}
                                active={route().current('payroll')}
                                className="text-white"
                            >
                                Payroll
                            </ResponsiveNavLink>
                        )}
                    </div>
                </div>
            </nav>

            <div className={`transition-all duration-300 ${hideNav ? '-translate-y-16' : 'translate-y-0'}`}>
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
                className="fixed top-2 right-2 z-50 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors duration-200"
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
