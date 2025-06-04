import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import { ThemeProvider } from "@/Components/ThemeProvider";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from '@/Components/ui/button';
import { CreditCardIcon, SparklesIcon } from 'lucide-react';
import { PageProps } from '@/types';

interface DashboardType {
    id: number;
    name: string;
}

interface Module {
    identifier: string;
}

interface Props {
    children: React.ReactNode;
    header?: React.ReactNode;
    auth?: {
        user: any;
        project: any;
        modules: any;
    };
}

const formatNumber = (num: number | undefined | null) => {
    return num?.toLocaleString() ?? '0';
};

const getHeaderColorClass = (url: string): string => {
    const appParam = new URLSearchParams(url.split('?')[1]).get('app');
 
    // Default gradient for unmatched routes
    return 'from-rose-600 via-rose-500 to-rose-400 dark:from-rose-950 dark:via-rose-900 dark:to-rose-800';
};

export default function Authenticated({ children, header, auth }: Props) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [credits, setCredits] = useState<number>(0);

    const { url } = usePage();
    const pageProps = usePage<{ auth: { user: any } }>().props;
    const authUser = auth?.user || pageProps.auth.user;

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                if (authUser.identifier) {
                    const response = await fetch(`/credits/${authUser.identifier}/balance`);
                    if (response.ok) {
                        const data = await response.json();
                        setCredits(data.available_credit);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch credits:', error);
            }
        };

        fetchCredits();
    }, [authUser.identifier]);

    const appParam = new URLSearchParams(url.split('?')[1]).get('app');

    const hasDashboardAccess = !url.includes('help') && !url.includes('profile') && !url.includes('credits') && !url.includes('subscriptions') && !url.includes('dashboard');

    const hasRetailAccess = (auth?.modules?.includes('retail') && appParam === 'retail') ?? false;
    const hasFnbAccess = (auth?.modules?.includes('fnb') && appParam === 'fnb') ?? false;
    const hasWarehousingAccess = (auth?.modules?.includes('warehousing') && appParam === 'warehousing') ?? false;
    const hasTransportationAccess = (auth?.modules?.includes('transportation') && appParam === 'transportation') ?? false;
    const hasRentalItemAccess = (auth?.modules?.includes('rental-items') && appParam === 'rental-items') ?? false;
    const hasRentalPropertyAccess = (auth?.modules?.includes('rental-properties') && appParam === 'rental-properties') ?? false;
    const hasClinicalAccess = (auth?.modules?.includes('clinical') && appParam === 'clinical') ?? false;
    const hasLendingAccess = (auth?.modules?.includes('lending') && appParam === 'lending') ?? false;
    const hasPayrollAccess = (auth?.modules?.includes('payroll') && appParam === 'payroll') ?? false;
    const hasTravelAccess = (auth?.modules?.includes('travel') && appParam === 'travel') ?? false;
    const hasSmsAccess = (auth?.modules?.includes('sms') && appParam === 'sms') ?? false;
    const hasEmailAccess = (auth?.modules?.includes('email') && appParam === 'email') ?? false;
    const hasContactsAccess = (auth?.modules?.includes('contacts') && appParam === 'contacts') ?? false;
    const hasGenealogyAccess = (auth?.modules?.includes('genealogy') && appParam === 'genealogy') ?? false;
    const hasEventsAccess = (auth?.modules?.includes('events') && appParam === 'events') ?? false;
    const hasChallengesAccess = (auth?.modules?.includes('challenges') && appParam === 'challenges') ?? false;
    const hasContentCreatorAccess = (auth?.modules?.includes('content-creator') && appParam === 'content-creator') ?? false;
    const hasDigitalProductsAccess = (auth?.modules?.includes('digital-products') && appParam === 'digital-products') ?? false;
    const hasPagesAccess = (auth?.modules?.includes('pages') && appParam === 'pages') ?? false;
    const hasHealthInsuranceAccess = (auth?.modules?.includes('health-insurance') && appParam === 'health-insurance') ?? false;

    const [hideNav, setHideNav] = useState(() => {
        // Get stored preference from localStorage, default to false
        return localStorage.getItem('hideNav') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('hideNav', hideNav.toString());
    }, [hideNav]);

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-white dark:bg-gray-800 relative">
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
                                        My Dashboard
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink href={`/dashboards?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Dashboard Gallery
                                    </ResponsiveNavLink>
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
                                    <ResponsiveNavLink href={`/email/templates?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Email Templates
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

                        {hasGenealogyAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Genealogy</div>
                                    <ResponsiveNavLink href={`/genealogy?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Genealogy
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink href={`/genealogy/edit-requests?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Edit Requests
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasEventsAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Events</div>
                                    <ResponsiveNavLink href={`/events?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Events
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasChallengesAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Challenges</div>
                                    <ResponsiveNavLink href={`/challenges?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Challenges
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasContentCreatorAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Content Creator</div>
                                    <ResponsiveNavLink href={`/content-creator?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Content Creator
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasDigitalProductsAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Digital Products</div>
                                    <ResponsiveNavLink href={`/digital-products?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Digital Products
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasPagesAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Pages</div>
                                    <ResponsiveNavLink href={`/pages?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Pages
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasHealthInsuranceAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Health Insurance</div>
                                    <ResponsiveNavLink href={`/health-insurance?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Health Insurance
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
                                {/* Mobile Menu Button */}
                                <div className="flex items-center sm:hidden mr-2">
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
                                                        My Dashboard
                                                    </Dropdown.Link>
                                                    
                                                    <Dropdown.Link 
                                                        href={`/dashboards?app=${appParam}`}
                                                        as="button"
                                                        className="w-full text-left"
                                                    >
                                                        Dashboard Gallery
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
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">F & B</span>
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
                                                    <Dropdown.Link href={`/pos-restaurant?app=${appParam}&tab=tables`}>
                                                        Restaurant
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/pos-restaurant/settings?app=${appParam}`}>
                                                        Settings
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
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
                                                    {hasRentalItemAccess && (
                                                        <Dropdown.Link href={`/rental-item/settings?app=${appParam}`}>
                                                            Settings
                                                        </Dropdown.Link>
                                                    )}
                                                    {hasRentalPropertyAccess && (
                                                        <Dropdown.Link href={`/rental-property/settings?app=${appParam}`}>
                                                            Settings
                                                        </Dropdown.Link>
                                                    )}
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasClinicalAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Clinic</span>
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
                                                    <Dropdown.Link href={`/clinic?app=${appParam}`}>
                                                        Clinic
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/clinic/settings?app=${appParam}`}>
                                                        Settings
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasLendingAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Loans</span>
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
                                                    <Dropdown.Link href={`/loan?app=${appParam}`}>
                                                        Loans
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/loan/cbu?app=${appParam}`}>
                                                        CBU
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/loan/settings?app=${appParam}`}>
                                                        Settings
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasPayrollAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Payroll</span>
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
                                                    <Dropdown.Link href={`/payroll?app=${appParam}`}>
                                                        Payroll
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/payroll/settings?app=${appParam}`}>
                                                        Settings
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
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
                                                    <Dropdown.Link href={`/sms/settings?app=${appParam}`}>
                                                        Settings
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasEmailAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Email</span>
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
                                                    <Dropdown.Link href={`/email?app=${appParam}`}>
                                                        Email
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/email/templates?app=${appParam}`}>
                                                        Email Templates
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/email/settings?app=${appParam}`}>
                                                        Settings
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasContactsAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Contacts</span>
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
                                                    <Dropdown.Link href={`/contacts?app=${appParam}`}>
                                                        Contacts
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/contacts/settings?app=${appParam}`}>
                                                        Settings
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasGenealogyAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Genealogy</span>
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
                                                    <Dropdown.Link href={`/genealogy?app=${appParam}`}>
                                                        Members
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/genealogy/edit-requests?app=${appParam}`}>
                                                        Edit Requests
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/genealogy/${authUser.identifier}/full-view?app=${appParam}`}>
                                                        Tree View
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/genealogy/${authUser.identifier}/circular?app=${appParam}`}>
                                                        Circular View
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/genealogy/${authUser.identifier}/printable?app=${appParam}`}>
                                                        Lineage View
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/genealogy/${authUser.identifier}/members?app=${appParam}`}>
                                                        Members List
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/genealogy/settings?app=${appParam}`}>
                                                        Settings
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasEventsAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Events</span>
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
                                                    <Dropdown.Link href={`/events?app=${appParam}`}>
                                                        Events
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/events/settings?app=${appParam}`}>
                                                        Settings
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasChallengesAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Challenges</span>
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
                                                    <Dropdown.Link href={`/challenges?app=${appParam}`}>
                                                        Challenges
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/challenges/settings?app=${appParam}`}>
                                                        Settings
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasContentCreatorAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Content Creator</span>
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
                                                    <Dropdown.Link href={`/content-creator?app=${appParam}`}>
                                                        Content Creator
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/content-creator/settings?app=${appParam}`}>
                                                        Settings
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasDigitalProductsAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Digital Products</span>
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
                                                    <Dropdown.Link href={`/digital-products?app=${appParam}`}>
                                                        Digital Products
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/digital-products/settings?app=${appParam}`}>
                                                        Settings
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasPagesAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Pages</span>
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
                                                    <Dropdown.Link href={`/pages?app=${appParam}`}>
                                                        Pages
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={`/pages/settings?app=${appParam}`}>
                                                        Settings
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                    {hasHealthInsuranceAccess && (
                                        <div className="inline-flex items-center">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className="inline-flex rounded-md">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                        >
                                                            <span className="mt-[1px]">Health Insurance</span>
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
                                                    <Dropdown.Link href={`/health-insurance?app=${appParam}`}>
                                                        Members
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.location.href = route('credits.spent-history', { clientIdentifier: authUser.identifier })}
                                        className="text-white bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20"
                                    >
                                        <span className="text-sm font-medium">{formatNumber(credits)} Credits</span>
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1.5 font-semibold border-0 [text-shadow:_0_1px_1px_rgba(0,0,0,0.2)]"
                                        onClick={() => window.location.href = route('credits.buy')}
                                    >
                                        <CreditCardIcon className="w-4 h-4" />
                                        Buy Credits
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white dark:from-purple-500 dark:to-purple-600 dark:hover:from-purple-600 dark:hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1.5 font-semibold border-0 [text-shadow:_0_1px_1px_rgba(0,0,0,0.2)]"
                                        onClick={() => window.location.href = route('subscriptions.index')}
                                    >
                                        <SparklesIcon className="w-4 h-4" />
                                        Subscriptions
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
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white/90 transition-all duration-200 ease-in-out hover:text-white focus:outline-none"
                                                >
                                                    {authUser.name}
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
                                            <Dropdown.Link href={route('help')}>
                                                Help
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('logout', { project: auth?.project?.identifier || 'trial' })} method="post" as="button">
                                                Logout
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
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
        </ThemeProvider>
    );
}
