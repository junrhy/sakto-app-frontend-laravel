import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { ThemeProvider } from "@/Components/ThemeProvider";
import { ModeToggle } from "@/Components/ModeToggle";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";

interface PageProps extends Record<string, any> {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth: { user } } = usePage<PageProps>().props;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const hasRetailAccess = true;
    const hasFnbAccess = true;
    const hasWarehousingAccess = true;
    const hasTransportationAccess = true;
    const hasRentalItemAccess = true;
    const hasRentalPropertyAccess = true;
    const hasClinicalAccess = true;
    const hasLendingAccess = true;
    const hasPayrollAccess = true;
    // const hasClinicAccess = user.project?.modules?.some(
    //     module => module.identifier === 'clinic'
    // );

    const [newDashboardName, setNewDashboardName] = useState('');

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
        <div className="min-h-screen bg-white dark:bg-gray-800">
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-lg dark:border-gray-700 dark:bg-gray-800/80 sticky top-0 z-50">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="transition-transform hover:scale-105">
                                    <div className="flex items-center">
                                        <ApplicationLogo className="block h-9 w-auto" />
                                        <span className="text-xl font-black ml-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            Sakto
                                        </span>
                                    </div>
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <div className="inline-flex items-center">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-600 dark:text-gray-200 transition-all duration-200 ease-in-out hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                                                >
                                                    <span className="mt-[1px]">Dashboard</span>
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
                                                href={route('dashboard')}
                                                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                View Dashboards
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

                                {hasRetailAccess && (
                                    <div className="inline-flex items-center">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <span className="inline-flex rounded-md">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-600 dark:text-gray-200 transition-all duration-200 ease-in-out hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
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
                                                    Retail
                                                </Dropdown.Link>
                                                <Dropdown.Link href={route('inventory')}>
                                                    Inventory
                                                </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                )}
                                {hasFnbAccess && (
                                    <NavLink
                                        href={route('pos-restaurant')}
                                        active={route().current('pos-restaurant')}
                                        className="transition-all duration-200 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                                    >
                                        Restaurant
                                    </NavLink>
                                )}
                                {(hasWarehousingAccess || hasTransportationAccess) && (
                                    <div className="inline-flex items-center">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <span className="inline-flex rounded-md">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-600 dark:text-gray-200 transition-all duration-200 ease-in-out hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
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
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-600 dark:text-gray-200 transition-all duration-200 ease-in-out hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
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
                                        className="transition-all duration-200 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                                    >
                                        Clinic
                                    </NavLink>
                                )}
                                {hasLendingAccess && (
                                    <NavLink
                                        href={route('loan')}
                                        active={route().current('loan')}
                                        className="transition-all duration-200 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                                    >
                                        Loans
                                    </NavLink>
                                )}
                                {hasPayrollAccess && (
                                    <NavLink
                                        href={route('payroll')}
                                        active={route().current('payroll')}
                                        className="transition-all duration-200 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                                    >
                                        Payroll
                                    </NavLink>
                                )}
                                <NavLink
                                    href={route('help')}
                                    active={route().current('help')}
                                    className="transition-all duration-200 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
                                >
                                    Help
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center space-x-4">
                            <ModeToggle />
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-medium leading-4 text-gray-500 transition-all duration-200 ease-in-out hover:bg-gray-50 hover:text-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-gray-700/80 dark:hover:text-blue-400"
                                            >
                                                {user.name}
                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
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
                                            href={route('profile.edit')}
                                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState: any) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
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
                        <div className="px-4 py-2">
                            <div className="font-medium text-base text-gray-700 dark:text-gray-200">Dashboard</div>
                            <ResponsiveNavLink href={route('dashboard')} className="ml-3">
                                View Dashboards
                            </ResponsiveNavLink>
                            <button 
                                className="w-full text-left ml-3 block pl-3 pr-4 py-2 text-base font-medium text-gray-600 transition duration-150 ease-in-out hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:text-gray-800 focus:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsCreateDialogOpen(true);
                                }}
                            >
                                Create Dashboard
                            </button>
                        </div>

                        {hasRetailAccess && (
                            <div className="px-4 py-2">
                                <div className="font-medium text-base text-gray-700 dark:text-gray-200">Retail</div>
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
                                <div className="font-medium text-base text-gray-700 dark:text-gray-200">Restaurant</div>
                                <ResponsiveNavLink href={route('pos-restaurant')} className="ml-3">
                                    Restaurant
                                </ResponsiveNavLink>
                            </div>
                        )}

                        {(hasWarehousingAccess || hasTransportationAccess) && (
                            <div className="px-4 py-2">
                                <div className="font-medium text-base text-gray-700 dark:text-gray-200">Distribution</div>
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
                                <div className="font-medium text-base text-gray-700 dark:text-gray-200">Rental</div>
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
                            >
                                Clinic
                            </ResponsiveNavLink>
                        )}

                        {hasLendingAccess && (
                            <ResponsiveNavLink
                                href={route('loan')}
                                active={route().current('loan')}
                            >
                                Loans
                            </ResponsiveNavLink>
                        )}

                        {hasPayrollAccess && (
                            <ResponsiveNavLink
                                href={route('payroll')}
                                active={route().current('payroll')}
                            >
                                Payroll
                            </ResponsiveNavLink>
                        )}

                        <ResponsiveNavLink
                            href={route('help')}
                            active={route().current('help')}
                        >
                            Help
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-600 px-4 py-4">
                        <div className="flex items-center">
                            <ModeToggle />
                            <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">Toggle theme</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

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
