import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { ThemeProvider } from "@/Components/ThemeProvider";
import { PageProps, User, Project } from '@/types/index';

interface Props {
    children: React.ReactNode;
    header?: React.ReactNode;
    user?: User;
    auth?: {
        user?: User;
        project?: Project;
        modules?: string[];
    };
}

const getHeaderColorClass = (url: string): string => {
    const appParam = new URLSearchParams(url.split('?')[1]).get('app');
    return 'from-rose-600 via-rose-500 to-rose-400 dark:from-rose-950 dark:via-rose-900 dark:to-rose-800';
};

export default function SidebarLayout({ children, header, user, auth }: Props) {
    const { url } = usePage();
    const pageProps = usePage<{ auth: { user: any } }>().props;
    const authUser = user || pageProps.auth.user;
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
    const hasBillersAccess = (auth?.modules?.includes('billers') && appParam === 'billers') ?? false;
    const hasBillPaymentsAccess = (auth?.modules?.includes('bill-payments') && appParam === 'bill-payments') ?? false;
    const hasCoursesAccess = (auth?.modules?.includes('courses') && appParam === 'courses') ?? false;

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-white dark:bg-gray-800">
                {/* Sidebar */}
                <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-gray-900 to-gray-800 shadow-lg overflow-y-auto">
                    <div className="flex items-center justify-center h-16 px-4 border-b border-white/10">
                        <Link href="/home" className="transition-transform hover:scale-105">
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-white" />
                                <span className="text-xl font-black ml-2 text-white">
                                    Sakto
                                </span>
                            </div>
                        </Link>
                    </div>

                    <nav className="space-y-1 pb-3 pt-2">
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

                        {hasBillersAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Billers</div>
                                    <ResponsiveNavLink href={`/billers?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Billers
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasBillPaymentsAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Bill Payments</div>
                                    <ResponsiveNavLink href={`/bill-payments?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Bill Payments
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {hasCoursesAccess && (
                            <div className="border-t border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-white/90">Courses</div>
                                    <ResponsiveNavLink href={`/courses?app=${appParam}`} className="text-white/80 hover:text-white hover:bg-white/10">
                                        Course Management
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="ml-64">
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
            </div>
        </ThemeProvider>
    );
} 