import { Head, Link as InertiaLink, usePage } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
// @ts-ignore
import { Search, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from "@/Components/ThemeProvider";
import { QuestionMarkCircleIcon, ArrowRightStartOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { getApps, type App } from '@/data/apps';
import { useState, useMemo, useEffect } from 'react';
import { CreditCardIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { PageProps } from '@/types';
import { User } from '@/types';

interface ExchangeRates {
    PHP?: number;
    [key: string]: number | undefined;
}

interface Subscription {
    plan: {
        name: string;
        unlimited_access: boolean;
        slug: string;
    };
    end_date: string;
}

interface Props extends PageProps {
    flash?: {
        type: 'info' | 'success' | 'error';
        message: string;
    };
    auth: {
        user: User & {
            identifier: string;
            app_currency: {
                symbol: string;
            };
            credits: number;
            is_admin: boolean;
            project_identifier: string;
            theme: 'light' | 'dark' | 'system';
            theme_color: string;
        };
    };
    [key: string]: any;
}

export default function Apps() {
    const { flash, auth } = usePage<Props>().props;
    const { theme, setTheme } = useTheme();
    const [credits, setCredits] = useState<number>(auth.user.credits ?? 0);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoadingSubscription, setIsLoadingSubscription] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});
    const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ PHP: 56.50 }); // Default fallback rate
    const [selectedApp, setSelectedApp] = useState<App | null>(null);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [apps, setApps] = useState<App[]>([]);
    const [isLoadingApps, setIsLoadingApps] = useState<boolean>(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                setIsLoadingApps(true);
                const appData = await getApps();
                setApps(appData);
            } catch (error) {
                console.error('Failed to fetch apps:', error);
            } finally {
                setIsLoadingApps(false);
            }
        };

        const fetchCredits = async () => {
            try {
                if (auth.user.identifier) {
                    const response = await fetch(`/credits/${auth.user.identifier}/balance`);
                    if (response.ok) {
                        const data = await response.json();
                        setCredits(data.available_credit);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch credits:', error);
            }
        };

        const fetchSubscription = async () => {
            try {
                if (auth.user.identifier) {
                    setIsLoadingSubscription(true);
                    const response = await fetch(`/subscriptions/${auth.user.identifier}/active`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.active) {
                            setSubscription(data.subscription);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch subscription:', error);
            } finally {
                setIsLoadingSubscription(false);
            }
        };

        fetchApps();
        fetchCredits();
        fetchSubscription();
    }, [auth.user.identifier]);

    // Then fetch exchange rates
    useEffect(() => {
        const fetchExchangeRates = async () => {
            try {
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const data = await response.json();
                setExchangeRates(data.rates);
            } catch (error) {
                console.error('Failed to fetch exchange rates:', error);
                // Keep using the fallback rate
            }
        };

        fetchExchangeRates();
    }, []);

    const toggleDescription = (appTitle: string) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [appTitle]: !prev[appTitle]
        }));
    };

    const truncateDescription = (description: string, maxLength: number = 80) => {
        if (description.length <= maxLength) return description;
        return description.slice(0, maxLength).trim() + '...';
    };

    // Format price with user's currency
    const formatPrice = (price: number) => {
        if (price === 0) return 'Free';
        try {
            const convertedPrice = auth.user.app_currency.symbol === '₱' 
                ? price
                : price * (exchangeRates.USD || 56.50) // Use API rate or fallback;
            
            const formattedNumber = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(convertedPrice);
            return `${auth.user.app_currency.symbol}${formattedNumber}`;
        } catch (error) {
            console.error('Price formatting error:', error);
            const convertedPrice = auth.user.app_currency.symbol === '₱' 
                ? price * (exchangeRates.PHP || 56.50)
                : price;
            return `${auth.user.app_currency.symbol}${convertedPrice.toFixed(2)}`;
        }
    };

    // Get unique categories from all apps
    const allCategories = useMemo(() => {
        const categories = new Set<string>();
        apps.forEach(app => {
            app.categories.forEach(category => categories.add(category));
        });
        return Array.from(categories).sort();
    }, [apps]);

    // Get visible categories based on showAllCategories state
    const visibleCategories = useMemo(() => {
        return showAllCategories ? allCategories : allCategories.slice(0, 5);
    }, [allCategories, showAllCategories]);

    // Filter apps based on search query and selected category
    const filteredApps = useMemo(() => {
        return apps.filter(app => {
            const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                app.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || app.categories.includes(selectedCategory);
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory, apps]);

    // Group apps by their status (free, paid, coming soon)
    const groupedApps = useMemo(() => {
        const freeApps = filteredApps.filter(app => app.pricingType === 'free' && !app.comingSoon);
        const paidApps = filteredApps.filter(app => (app.pricingType === 'one-time' || app.pricingType === 'subscription') && !app.comingSoon);
        const comingSoonApps = filteredApps.filter(app => app.comingSoon);
        
        return { freeApps, paidApps, comingSoonApps };
    }, [filteredApps]);

    const formatNumber = (num: number | undefined | null) => {
        return num?.toLocaleString() ?? '0';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Check if an app is included in the user's current subscription plan
    const isAppIncludedInCurrentPlan = (app: App) => {
        if (!subscription || !app.includedInPlans) return false;
        return app.includedInPlans.includes(subscription.plan.slug);
    };

    return (
        <div className="relative min-h-screen pb-16 bg-white dark:bg-gray-900 overflow-x-hidden">
            <Head title="Apps" />

            {/* Flash Message */}
            {flash && flash.message && (
                <div className={`fixed top-0 left-0 right-0 z-50 p-4 text-center text-sm font-medium ${
                    flash.type === 'info' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                        : flash.type === 'success'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                }`}>
                    {flash.message}
                </div>
            )}

            {/* Message for users without subscription */}
            {!isLoadingSubscription && !subscription && (
                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 z-20 py-1 text-center text-white text-sm">
                    <span className="font-medium">Upgrade to a subscription plan for unlimited access to all features!</span>
                    <Button 
                        variant="link" 
                        size="sm" 
                        className="text-white underline ml-2 p-0 h-auto"
                        onClick={() => window.location.href = route('subscriptions.index')}
                    >
                        View Plans
                    </Button>
                </div>
            )}

            <div className={`fixed ${!isLoadingSubscription && !subscription ? 'top-[52px]' : 'top-0'} left-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/80 z-10 shadow-sm`}>
                <div className="container mx-auto px-4 pt-4">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-full flex justify-between items-center mb-2">
                            <div className="flex items-center">
                                <ApplicationLogo className="h-10 w-auto fill-current text-gray-900 dark:text-white" />
                                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Sakto</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4">
                                <div className="hidden sm:flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.location.href = route('credits.spent-history', { clientIdentifier: auth.user.identifier })}
                                        className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
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
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                className="text-gray-900 dark:text-white hover:text-blue-900 hover:bg-white/10 transition-colors duration-200 flex items-center gap-2 px-3 py-2 h-auto font-normal border-0 no-underline hover:no-underline focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
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
                                            <DropdownMenuItem>
                                                <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                                                <InertiaLink href="/help">Help</InertiaLink>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" />
                                                <InertiaLink 
                                                    href={route('logout', { project: auth.user.project_identifier })} 
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

            <div className={`w-full px-4 ${!isLoadingSubscription && !subscription ? 'pt-[120px]' : 'pt-[100px]'} landscape:pt-[80px] md:pt-[100px]`}>
                <div className="py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left Column - App Listing */}
                            <div className="lg:col-span-4 bg-gray-50/50 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-sm sm:rounded-lg p-4 md:p-6">
                                {/* Search and Filter Section */}
                                <div className="mb-6">
                                    <div className="flex flex-col sm:flex-row gap-3 mb-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                                            <Input
                                                placeholder="Search apps..."
                                                className="pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            className="bg-white/80 hover:bg-slate-50 dark:bg-gray-800/80 dark:hover:bg-gray-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                            onClick={() => setSelectedCategory(null)}
                                        >
                                            All Categories
                                        </Button>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {visibleCategories.map((category) => (
                                            <Badge 
                                                key={category}
                                                variant="secondary" 
                                                className={`cursor-pointer bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 ${
                                                    selectedCategory === category ? 'ring-2 ring-slate-500 dark:ring-slate-400' : ''
                                                }`}
                                                onClick={() => setSelectedCategory(category)}
                                            >
                                                {category}
                                            </Badge>
                                        ))}
                                        {allCategories.length > 5 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                                onClick={() => setShowAllCategories(!showAllCategories)}
                                            >
                                                {showAllCategories ? 'Show Less' : `Show ${allCategories.length - 5} More`}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Apps List */}
                                <div className="space-y-4">
                                    {/* Free Apps */}
                                    {groupedApps.freeApps.length > 0 && (
                                        <div>
                                            <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                                                <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">Free</span>
                                                Free Apps
                                            </h2>
                                            <div className="space-y-3">
                                                {groupedApps.freeApps.map((app) => (
                                                    <Card 
                                                        key={app.title} 
                                                        className="hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800/50 bg-white dark:bg-gray-800/80 backdrop-blur-sm cursor-pointer"
                                                        onClick={() => setSelectedApp(app)}
                                                    >
                                                        <CardHeader className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`min-w-[3rem] w-12 h-12 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center ${app.bgColor} shadow-sm`}>
                                                                    <div className="text-xl dark:text-slate-300">
                                                                        {app.icon}
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <CardTitle className="text-base text-gray-900 dark:text-white">{app.title}</CardTitle>
                                                                        {!isAppIncludedInCurrentPlan(app) && app.includedInPlans && app.includedInPlans.length > 0 && (
                                                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 text-xs">
                                                                                Available on {app.includedInPlans[0].replace('-plan', '').replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <CardDescription className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                                                                        {app.description}
                                                                    </CardDescription>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Paid Apps */}
                                    {groupedApps.paidApps.length > 0 && (
                                        <div>
                                            <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                                                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">Paid</span>
                                                Paid Apps
                                            </h2>
                                            <div className="space-y-3">
                                                {groupedApps.paidApps.map((app) => (
                                                    <Card 
                                                        key={app.title} 
                                                        className="hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800/50 bg-white dark:bg-gray-800/80 backdrop-blur-sm cursor-pointer"
                                                        onClick={() => setSelectedApp(app)}
                                                    >
                                                        <CardHeader className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`min-w-[3rem] w-12 h-12 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center ${app.bgColor} shadow-sm`}>
                                                                    <div className="text-xl dark:text-slate-300">
                                                                        {app.icon}
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <CardTitle className="text-base text-gray-900 dark:text-white">{app.title}</CardTitle>
                                                                        {!isAppIncludedInCurrentPlan(app) && app.includedInPlans && app.includedInPlans.length > 0 && (
                                                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 text-xs">
                                                                                Available on {app.includedInPlans[0].replace('-plan', '').replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <CardDescription className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                                                                        {app.description}
                                                                    </CardDescription>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Coming Soon Apps */}
                                    {groupedApps.comingSoonApps.length > 0 && (
                                        <div>
                                            <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                                                <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">Coming Soon</span>
                                                Coming Soon
                                            </h2>
                                            <div className="space-y-3">
                                                {groupedApps.comingSoonApps.map((app) => (
                                                    <Card 
                                                        key={app.title} 
                                                        className="hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800/50 bg-white dark:bg-gray-800/80 backdrop-blur-sm opacity-75 cursor-pointer"
                                                        onClick={() => setSelectedApp(app)}
                                                    >
                                                        <CardHeader className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`min-w-[3rem] w-12 h-12 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center ${app.bgColor} shadow-sm opacity-50`}>
                                                                    <div className="text-xl dark:text-slate-300">
                                                                        {app.icon}
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <CardTitle className="text-base text-gray-900 dark:text-white">{app.title}</CardTitle>
                                                                    </div>
                                                                    <CardDescription className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                                                                        {app.description}
                                                                    </CardDescription>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - App Details */}
                            <div className="lg:col-span-8 bg-gray-50/50 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-sm sm:rounded-lg p-4 md:p-6">
                                {selectedApp ? (
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`min-w-[4rem] w-16 h-16 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center ${selectedApp.bgColor} shadow-sm`}>
                                                <div className="text-2xl dark:text-slate-300">
                                                    {selectedApp.icon}
                                                </div>
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedApp.title}</h2>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-yellow-500">⭐</span>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{selectedApp.rating}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                                            <p className="text-gray-600 dark:text-gray-300">{selectedApp.description}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Categories</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedApp.categories.map((category) => (
                                                    <Badge 
                                                        key={category} 
                                                        variant="secondary" 
                                                        className="bg-gray-50 dark:bg-gray-900/50"
                                                    >
                                                        {category}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {selectedApp.includedInPlans && selectedApp.includedInPlans.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Available Plans</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedApp.includedInPlans.map((plan) => (
                                                        <Badge 
                                                            key={plan} 
                                                            variant="outline" 
                                                            className={`${
                                                                subscription && subscription.plan.slug === plan
                                                                ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700"
                                                                : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                                            }`}
                                                        >
                                                            {plan.replace('-plan', '').replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                            {subscription && subscription.plan.slug === plan && (
                                                                <span className="ml-1">✓</span>
                                                            )}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {selectedApp.pricingType === 'free' 
                                                            ? 'Free'
                                                            : selectedApp.pricingType === 'subscription' 
                                                                ? 'Subscription Only'
                                                                : formatPrice(selectedApp.price)
                                                        }
                                                    </span>
                                                    {selectedApp.pricingType !== 'free' && (
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 block">
                                                            {selectedApp.pricingType === 'subscription' ? 'Available on subscription plans' : 'One-time payment'}
                                                        </span>
                                                    )}
                                                </div>
                                                <Button 
                                                    variant={selectedApp.visible ? "default" : "outline"}
                                                    className={selectedApp.visible 
                                                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                                        : "border-slate-200 dark:border-slate-700"
                                                    }
                                                    onClick={() => {
                                                        if (selectedApp.visible) {
                                                            window.location.href = `${selectedApp.route}`;
                                                        } else if (selectedApp.includedInPlans && selectedApp.includedInPlans.length > 0) {
                                                            window.location.href = route('subscriptions.index', { 
                                                                highlight_plan: selectedApp.includedInPlans[0],
                                                                app: selectedApp.title
                                                            });
                                                        } else {
                                                            window.location.href = route('subscriptions.index');
                                                        }
                                                    }}
                                                >
                                                    {selectedApp.visible ? "Open App" : "Subscribe Now"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center py-8">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
                                            <Search className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Explore Our Apps</h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                                            Browse through our collection of powerful apps. Select an app from the list to view detailed information, features, and subscription options.
                                        </p>
                                        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                                                <div className="text-2xl mb-2">🎯</div>
                                                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Free Apps</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Access basic features at no cost</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                                                <div className="text-2xl mb-2">⚡</div>
                                                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Pro Apps</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Enhanced features for professionals</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                                                <div className="text-2xl mb-2">🏢</div>
                                                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Business Apps</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Complete solutions for enterprises</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}