import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import { ThemeProvider } from "@/Components/ThemeProvider";
import { Menu, X, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Button } from '@/Components/ui/button';
import { CreditCardIcon, SparklesIcon, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { PageProps, User, Project } from '@/types/index';
import { parseEnabledModules } from '@/lib/utils';
import { getIconByName, getSmartIconSuggestion } from '@/lib/iconLibrary';
import MobileMenu from '@/Components/Navigation/MobileMenu';
import DesktopMenu from '@/Components/Navigation/DesktopMenu';
// App interface and utility functions
interface App {
    icon: JSX.Element;
    title: string;
    route: string;
    bgColor: string;
    visible: boolean;
    description: string;
    price: number;
    rating: number;
    categories: string[];
    comingSoon: boolean;
    pricingType: 'free' | 'one-time' | 'subscription';
    includedInPlans?: string[];
    id?: number;
    identifier?: string;
    order?: number;
    isActive?: boolean;
    isInSubscription?: boolean;
    isUserAdded?: boolean;
    isAvailable?: boolean;
}

// Utility function to get icon for any app
const getIconForApp = (app: any): JSX.Element => {
    const IconComponent = getIconByName(app.icon || getSmartIconSuggestion(app.title));
    return <IconComponent />;
};

// Utility function to get apps directly from API
const fetchAppsFromAPI = async (): Promise<App[]> => {
    try {
        const response = await fetch('/api/apps');
        const data = await response.json();
        return (data.apps || []).map((app: any) => ({
            ...app,
            icon: getIconForApp(app),
            isInSubscription: app.isInSubscription || false,
            isUserAdded: app.isUserAdded || false,
            isAvailable: app.isAvailable || false
        }));
    } catch (error) {
        console.error('Failed to fetch apps:', error);
        return [];
    }
};

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
    user?: User;
    auth?: {
        user?: User;
        project?: Project;
        modules?: string[];
        userApps?: string[];
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        } | null;
    };
}

const formatNumber = (num: number | undefined | null) => {
    return num?.toLocaleString() ?? '0';
};

const getHeaderColorClass = (url: string, projectIdentifier?: string): string => {
    // First check URL-based colors for specific pages
    if (url.includes('subscriptions')) {
        return 'from-blue-600 via-blue-500 to-blue-400 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700';
    }
    if (url.includes('credits')) {
        return 'from-orange-600 via-orange-500 to-orange-400 dark:from-orange-900 dark:via-orange-800 dark:to-orange-700';
    }

    // Simple white on gray border colors for all projects
    return 'from-white to-gray-100 border-gray-200 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600';
};

const showAccessDialog = (appParam: string | null, auth: any, url: string, isLoadingApps: boolean): boolean => {
    // Don't show dialog while apps are still loading
    if (isLoadingApps) return false;
    
    // Parse enabled modules from project and get user apps
    const enabledModules = parseEnabledModules(auth?.project?.enabledModules);
    const userApps = auth?.userApps || [];
    
    // Helper function to check if user has access to a module (either in subscription or user-added)
    // This now uses database relationships instead of URL-based checking
    const hasModuleAccess = (moduleIdentifier: string) => {
        const isInSubscription = enabledModules.includes(moduleIdentifier);
        const isUserAdded = userApps.includes(moduleIdentifier);
        return isInSubscription || isUserAdded;
    };
    
    // Get the app identifier from URL path first (more comprehensive)
    let appIdentifier = getAppIdentifierFromUrl(url);
    
    // If no app identifier from URL path, try the app parameter
    if (!appIdentifier && appParam) {
        appIdentifier = appParam;
    }
    
    // If still no app identifier, no dialog needed
    if (!appIdentifier) return false;
    
    // Check if user has access to the current app
    const hasAccess = hasModuleAccess(appIdentifier);
    
    // Return true if user doesn't have access (show dialog to inform user)
    return !hasAccess;
};

// Helper function to extract app identifier from URL path
const getAppIdentifierFromUrl = (url: string): string | null => {
    // List of all app route prefixes
    const appRoutes = [
        'clinic', 'clinical', 'pos-retail', 'retail', 'pos-restaurant', 'fnb',
        'warehousing', 'transportation', 'rental-item', 'rental-items', 
        'rental-property', 'rental-properties', 'loan', 'lending', 'payroll', 
        'travel', 'sms', 'email', 'contacts', 'family-tree', 'genealogy', 
        'events', 'challenges', 'content-creator', 'products', 'pages', 
        'healthcare', 'mortuary', 'billers', 'bill-payments', 'courses'
    ];
    
    // Extract pathname from URL, properly handling hostname exclusion
    let pathname: string;
    try {
        // If URL is a full URL with protocol, use URL constructor
        if (url.startsWith('http://') || url.startsWith('https://')) {
            const urlObj = new URL(url);
            pathname = urlObj.pathname;
        } else {
            // If URL is just a path, remove query params and hash
            pathname = url.split('?')[0].split('#')[0];
        }
    } catch (error) {
        // Fallback to simple string splitting if URL parsing fails
        pathname = url.split('?')[0].split('#')[0];
    }
    
    // Map some route names to their module identifiers
    const routeToModuleMap: { [key: string]: string } = {
        'pos-retail': 'retail',
        'pos-restaurant': 'fnb',
        'rental-item': 'rental-items',
        'rental-property': 'rental-properties',
        'family-tree': 'genealogy',
        'loan': 'lending'
    };
    
    // Check if URL contains any app route
    for (const route of appRoutes) {
        // Check for exact route match at the beginning of path segments
        const routePattern = new RegExp(`(^|/)${route}(/|$)`, 'i');
        if (routePattern.test(pathname)) {
            return routeToModuleMap[route] || route;
        }
    }
    
    return null;
};

export default function Authenticated({ children, header, user, auth: propAuth }: Props) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [credits, setCredits] = useState<number>(0);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [apps, setApps] = useState<App[]>([]);
    const [isLoadingApps, setIsLoadingApps] = useState<boolean>(true);

    const { url } = usePage();
    const pageProps = usePage<{ auth: { user: any; project: any; modules: string[]; userApps: string[]; selectedTeamMember?: any } }>().props;
    // Merge prop auth with page auth, preferring prop auth if available
    const auth = propAuth || pageProps.auth;
    const authUser = user || auth.user;
    const appParam = new URLSearchParams(url.split('?')[1]).get('app');

    // Parse enabled modules from project and get user apps
    const enabledModules = parseEnabledModules(auth?.project?.enabledModules);
    const userApps = auth?.userApps || [];

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
                // Silently ignore credit fetch errors
                setCredits(0);
            }
        };

        const fetchApps = async () => {
            try {
                setIsLoadingApps(true);
                const appData = await fetchAppsFromAPI();
                setApps(appData);
            } catch (error) {
                console.error('Failed to fetch apps:', error);
                setApps([]);
            } finally {
                setIsLoadingApps(false);
            }
        };

        fetchCredits();
        fetchApps();
    }, [authUser.identifier]);

    const hasDashboardAccess = !url.includes('help') && !url.includes('profile') && !url.includes('credits') && !url.includes('subscriptions');

    // Helper function to check if user has access to a module (either in subscription or user-added)
    // This now uses database relationships instead of URL-based checking
    const hasModuleAccess = (moduleIdentifier: string) => {
        const isInSubscription = enabledModules.includes(moduleIdentifier);
        const isUserAdded = userApps.includes(moduleIdentifier);
        return isInSubscription || isUserAdded;
    };

    // Menu logic is now handled by separate components (MobileMenu and DesktopMenu)

    // Comprehensive route protection: Show dialog for unauthorized app routes
    // Covers both dashboard routes (?app=) and direct app routes (/clinic, /products, etc.)
    // Dialog cannot be dismissed - users must choose an action to proceed

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-white dark:bg-gray-800 relative">
                {/* Access Control Dialog */}
                <Dialog open={showAccessDialog(appParam, auth, url, isLoadingApps)} onOpenChange={() => {}}>
                    <DialogContent className="sm:max-w-md [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()}>
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                    <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <DialogTitle className="text-lg font-semibold">Access Required</DialogTitle>
                            </div>
                            <DialogDescription className="text-base">
                                You don't have access to this feature yet. Choose how you'd like to gain access:
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 mt-4">
                            <Button 
                                onClick={() => window.location.href = route('subscriptions.index')}
                                className="w-full justify-start gap-2"
                                variant="default"
                            >
                                <CreditCardIcon className="h-4 w-4" />
                                Upgrade Subscription Plan
                            </Button>
                            <Button 
                                onClick={() => window.location.href = route('apps')}
                                className="w-full justify-start gap-2"
                                variant="outline"
                            >
                                <SparklesIcon className="h-4 w-4" />
                                Add App to Collection
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Mobile Navigation */}
                <div
                    className={
                        (showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full') +
                        ' fixed inset-y-0 left-0 w-full transform transition-transform duration-300 ease-in-out sm:hidden bg-gradient-to-b from-gray-900 to-gray-800 shadow-lg z-[70] overflow-y-auto'
                    }
                >
                    {/* Close Button */}
                    <div className="flex justify-end p-4">
                        <button
                            onClick={() => setShowingNavigationDropdown(false)}
                            className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 focus:outline-none"
                        >
                            <svg
                                className="h-6 w-6"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="space-y-1 pb-3 px-4">
                        <ResponsiveNavLink href={route('home')} active={route().current('home')} className="text-gray-800 dark:text-white/90 hover:text-white hover:bg-white/10">
                            Home
                        </ResponsiveNavLink>

                        {hasDashboardAccess && (
                            <div className="border-t border-gray-200 dark:border-white/10">
                                <div className="px-4 py-2">
                                    <div className="font-medium text-base text-gray-800 dark:text-white/90">Dashboard</div>
                                    <ResponsiveNavLink href={`/dashboard?app=${appParam}`} className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                                        My Dashboard
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink href={`/dashboards?app=${appParam}`} className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                                        Dashboard Gallery
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}

                        {/* Dynamic Menu Categories */}
                        <MobileMenu 
                            hasModuleAccess={hasModuleAccess}
                            appParam={appParam}
                            url={url}
                        />

                        {/* Mobile User Section */}
                        <div className="border-t border-gray-200 dark:border-white/10 mt-auto">
                            <div className="px-4 py-3">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="flex-1">
                                        <div className="text-gray-800 dark:text-white/90 font-medium text-base">
                                            {auth.selectedTeamMember?.full_name || authUser.name}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <ResponsiveNavLink href={route('profile.edit')} className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                                        Profile
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink href="/help" className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                                        Help
                                    </ResponsiveNavLink>
                                    <div className="border-t border-white/20 pt-1">
                                        <ResponsiveNavLink 
                                            href={route('logout', { project: auth.project?.identifier })} 
                                            method="post" 
                                            as="button"
                                            className="w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                        >
                                            Logout
                                        </ResponsiveNavLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showingNavigationDropdown && (
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65] sm:hidden"
                        onClick={() => setShowingNavigationDropdown(false)}
                    />
                )}

                <nav className={`border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r ${getHeaderColorClass(url, authUser.project_identifier)} fixed top-0 left-0 right-0 z-20 transition-all duration-300 ${
                    sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
                }`}>
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                {/* Mobile Menu Button */}
                                <div className="flex items-center sm:hidden mr-2">
                                    <button
                                        onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                        className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 dark:text-white/80 transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white focus:bg-gray-100 dark:focus:bg-white/10 focus:text-gray-900 dark:focus:text-white focus:outline-none"
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



                                <div className="hidden space-x-8 sm:-my-px sm:flex">
                                    <NavLink
                                        href={route('home')}
                                        active={route().current('home')}
                                        className="transition-all duration-200 text-gray-700 dark:text-gray-800 dark:text-white/90 hover:text-gray-900 dark:hover:text-white"
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
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-700 dark:text-gray-800 dark:text-white/90 transition-all duration-200 ease-in-out hover:text-gray-900 dark:hover:text-white focus:outline-none"
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

                                    <DesktopMenu
                                        hasModuleAccess={hasModuleAccess}
                                        appParam={appParam}
                                        url={url}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </nav>

                {/* Sidebar */}
                <div className={`fixed left-0 top-0 h-screen z-30 transition-all duration-300 ease-in-out ${
                    sidebarCollapsed ? 'w-16' : 'w-64'
                } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600 shadow-lg hidden lg:block flex flex-col`}>
                    {/* Sidebar Toggle Button - Positioned on the border */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={`absolute top-4 z-[70] w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-lg flex items-center justify-center text-gray-700 dark:text-white/80 transition-all duration-300 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-1 right-[-12px]`}
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="h-3 w-3" />
                        ) : (
                            <ChevronLeft className="h-3 w-3" />
                        )}
                    </button>

                    {/* Sidebar Navbar */}
                    <div className="h-16 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-white to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center px-3 flex-shrink-0">
                        {sidebarCollapsed ? (
                            <div className="flex items-center justify-center w-full">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-gray-800 dark:text-white" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-full min-w-0">
                                <span className="text-lg font-bold text-gray-800 dark:text-white truncate block">
                                    {authUser.name}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {/* Sidebar Content - Flex layout to push user menu to bottom */}
                    <div className="flex flex-col flex-1 min-h-0">
                        {/* Apps Section - Scrollable */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4 pb-8">
                                {!sidebarCollapsed && (
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                                        Apps
                                    </h3>
                                )}
                                <div className="space-y-1 max-h-96 overflow-y-auto hide-scrollbar">
                                    {isLoadingApps ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 dark:border-gray-300"></div>
                                        </div>
                                    ) : (
                                        (() => {
                                            const enabledModules = parseEnabledModules(auth?.project?.enabledModules);
                                            const filteredApps = apps.filter(app => {
                                                // Convert app title to match module name format (lowercase and hyphenated)
                                                const normalizedAppTitle = app.title.toLowerCase().replace(/\s+/g, '-');
                                                
                                                // Show apps that are either in subscription or user-added
                                                const isInSubscription = enabledModules.includes(normalizedAppTitle);
                                                const isUserAdded = app.isUserAdded || false;
                                                
                                                // Show app if it's in subscription or user-added
                                                if (isInSubscription || isUserAdded) {
                                                    return true;
                                                }
                                                
                                                return false;
                                            });
                                            
                                            // If no apps are shown due to filtering, show all visible apps as fallback
                                            const appsToShow = filteredApps.length > 0 ? filteredApps : apps.filter(app => app.visible);
                                            
                                            // If still no apps, show all apps for debugging
                                            const finalAppsToShow = appsToShow.length > 0 ? appsToShow : apps;
                                            
                                            if (finalAppsToShow.length === 0) {
                                                return (
                                                    <div className="text-center py-4">
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">No apps available</p>
                                                    </div>
                                                );
                                            }
                                            
                                            return finalAppsToShow.sort((a, b) => a.title.localeCompare(b.title)).map((app) => (
                                                <Link
                                                    key={app.title}
                                                    href={app.route}
                                                    className={`flex items-center transition-colors duration-200 ${
                                                        sidebarCollapsed ? 'justify-center px-2 py-1.5' : 'px-2 py-1.5'
                                                    }`}
                                                    title={app.title}
                                                >
                                                    <div className={`flex-shrink-0 flex items-center justify-center ${
                                                        sidebarCollapsed ? 'w-10 h-10' : 'w-8 h-8 mr-3'
                                                    }`}>
                                                        <div className={`text-gray-600 dark:text-gray-300 ${
                                                            sidebarCollapsed ? 'text-xl' : 'text-lg'
                                                        }`}>
                                                            {app.icon}
                                                        </div>
                                                    </div>
                                                    {!sidebarCollapsed && (
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                                {app.title}
                                                            </p>
                                                        </div>
                                                    )}
                                                </Link>
                                            ));
                                        })()
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* User Menu at Bottom - Always stays at bottom */}
                        <div className="border-t border-gray-200 dark:border-gray-600 px-4 pt-2 pb-1 flex-shrink-0">
                            {!sidebarCollapsed && (
                                <div className="space-y-1">
                                    {/* User Name */}
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                                        {auth.selectedTeamMember?.full_name || authUser.name}
                                    </h3>
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-md"
                                        title="Edit Profile"
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </Link>
                                    
                                    <Link
                                        href="/help"
                                        className="flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-md"
                                        title="Help & Support"
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Help
                                    </Link>
                                    
                                    <Link
                                        href={route('logout', { project: auth.project?.identifier })} 
                                        method="post"
                                        as="button"
                                        className="flex items-center w-full px-2 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors duration-200 rounded-md"
                                        title="Sign Out"
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </Link>
                                </div>
                            )}
                            
                            {sidebarCollapsed && (
                                <div className="flex flex-col items-center space-y-1">
                                    <Link
                                        href={route('profile.edit')}
                                        className="p-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-md"
                                        title="Edit Profile"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </Link>
                                    
                                    <Link
                                        href="/help"
                                        className="p-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-md"
                                        title="Help & Support"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </Link>
                                    
                                    <Link
                                        href={route('logout', { project: auth.project?.identifier })} 
                                        method="post"
                                        as="button"
                                        className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors duration-200 rounded-md"
                                        title="Sign Out"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main content with sidebar offset */}
                <div className={`relative bg-white dark:bg-gray-800 min-h-screen transition-all duration-300 ease-in-out pt-16 ${
                    sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
                }`}>
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
