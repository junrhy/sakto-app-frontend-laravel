import { Head, Link as InertiaLink } from '@inertiajs/react';
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
import { apps, App } from '@/data/apps';
import { useState, useMemo, useEffect } from 'react';
import { CreditCardIcon, SparklesIcon } from '@heroicons/react/24/outline';

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

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
            credits?: number;
            identifier?: string;
            app_currency: {
                symbol: string;
            };
        };
    };
}

export default function Apps({ auth }: PageProps) {
    const { theme, setTheme } = useTheme();
    const [credits, setCredits] = useState<number>(auth.user.credits ?? 0);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoadingSubscription, setIsLoadingSubscription] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});
    const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ PHP: 56.50 }); // Default fallback rate

    // Fetch credits first
    useEffect(() => {
        const fetchCredits = async () => {
            try {
                console.log(auth.user.identifier);
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
    }, []);

    // Filter apps based on search query and selected category
    const filteredApps = useMemo(() => {
        return apps.filter(app => {
            const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                app.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || app.categories.includes(selectedCategory);
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

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

            <div className={`fixed ${!isLoadingSubscription && !subscription ? 'top-7' : 'top-0'} left-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/80 z-10 shadow-sm`}>
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

            <div className={`w-full px-4 ${!isLoadingSubscription && !subscription ? 'pt-[120px]' : 'pt-[100px]'} landscape:pt-[80px] md:pt-[100px]`}>
                <div className="py-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white/95 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-sm sm:rounded-lg p-6">
                            {/* Search and Filter Section */}
                            <div className="mb-8">
                                <div className="flex gap-4 mb-4">
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
                                    {allCategories.map((category) => (
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
                                </div>
                            </div>

                            {/* Apps Grid */}
                            <div className="space-y-8">
                                {/* Free Apps Section */}
                                {groupedApps.freeApps.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                                            <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">Free</span>
                                            Free Apps
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {groupedApps.freeApps.map((app) => (
                                                <Card 
                                                    key={app.title} 
                                                    className="hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                                                >
                                                    <CardHeader>
                                                        <div className="flex items-center gap-4">
                                                            <div className={`min-w-[4rem] w-16 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center ${app.bgColor} shadow-sm`}>
                                                                <div className="text-2xl dark:text-slate-300">
                                                                    {app.icon}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <CardTitle className="text-gray-900 dark:text-white">{app.title}</CardTitle>
                                                                    {isAppIncludedInCurrentPlan(app) && (
                                                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 text-xs">
                                                                            Included in your plan
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <CardDescription className="text-gray-600 dark:text-gray-300">
                                                                        {expandedDescriptions[app.title] ? app.description : truncateDescription(app.description)}
                                                                    </CardDescription>
                                                                    {app.description.length > 80 && (
                                                                        <button
                                                                            onClick={() => toggleDescription(app.title)}
                                                                            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mt-1 focus:outline-none"
                                                                        >
                                                                            {expandedDescriptions[app.title] ? 'Read less' : 'Read more'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {app.categories.map((category) => (
                                                                <Badge 
                                                                    key={category} 
                                                                    variant="secondary" 
                                                                    className="bg-gray-50 dark:bg-gray-900/50 text-xs"
                                                                >
                                                                        {category}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        
                                                        {/* Subscription Plan Information */}
                                                        {app.includedInPlans && app.includedInPlans.length > 0 ? (
                                                            <div className="mt-3">
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Included in plans:</p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {app.includedInPlans.map((plan) => (
                                                                        <Badge 
                                                                            key={plan} 
                                                                            variant="outline" 
                                                                            className={`text-xs ${
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
                                                        ) : (
                                                            <div className="mt-3">
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Not included in any subscription plan
                                                                </p>
                                                            </div>
                                                        )}
                                                    </CardHeader>
                                                    <CardFooter className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-yellow-500">⭐</span>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                                {app.rating}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                                                    Free
                                                                </span>
                                                            </div>
                                                            <Button 
                                                                variant="ghost"
                                                                className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
                                                                onClick={() => {
                                                                    if (app.visible) {
                                                                        window.location.href = `${app.route}`;
                                                                    } else if (app.includedInPlans && app.includedInPlans.length > 0) {
                                                                        // Redirect to subscription page with the first plan from includedInPlans
                                                                        window.location.href = route('subscriptions.index', { 
                                                                            highlight_plan: app.includedInPlans[0],
                                                                            app: app.title
                                                                        });
                                                                    } else {
                                                                        // If no plans included, just go to subscription page
                                                                        window.location.href = route('subscriptions.index');
                                                                    }
                                                                }}
                                                            >
                                                                {app.visible ? "Open" : "Subscribe"}
                                                            </Button>
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Paid Apps Section */}
                                {groupedApps.paidApps.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">Paid</span>
                                            Paid Apps
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {groupedApps.paidApps.map((app) => (
                                                <Card 
                                                    key={app.title} 
                                                    className="hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                                                >
                                                    <CardHeader>
                                                        <div className="flex items-center gap-4">
                                                            <div className={`min-w-[4rem] w-16 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center ${app.bgColor} shadow-sm`}>
                                                                <div className="text-2xl dark:text-slate-300">
                                                                    {app.icon}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <CardTitle className="text-gray-900 dark:text-white">{app.title}</CardTitle>
                                                                    {isAppIncludedInCurrentPlan(app) && (
                                                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 text-xs">
                                                                            Included in your plan
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <CardDescription className="text-gray-600 dark:text-gray-300">
                                                                        {expandedDescriptions[app.title] ? app.description : truncateDescription(app.description)}
                                                                    </CardDescription>
                                                                    {app.description.length > 80 && (
                                                                        <button
                                                                            onClick={() => toggleDescription(app.title)}
                                                                            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mt-1 focus:outline-none"
                                                                        >
                                                                            {expandedDescriptions[app.title] ? 'Read less' : 'Read more'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {app.categories.map((category) => (
                                                                <Badge 
                                                                    key={category} 
                                                                    variant="secondary" 
                                                                    className="bg-gray-50 dark:bg-gray-900/50 text-xs"
                                                                >
                                                                        {category}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        
                                                        {/* Subscription Plan Information */}
                                                        {app.includedInPlans && app.includedInPlans.length > 0 ? (
                                                            <div className="mt-3">
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Included in plans:</p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {app.includedInPlans.map((plan) => (
                                                                        <Badge 
                                                                            key={plan} 
                                                                            variant="outline" 
                                                                            className={`text-xs ${
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
                                                        ) : (
                                                            <div className="mt-3">
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Not included in any subscription plan
                                                                </p>
                                                            </div>
                                                        )}
                                                    </CardHeader>
                                                    <CardFooter className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-yellow-500">⭐</span>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{app.rating}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                                    {app.pricingType === 'subscription' 
                                                                        ? 'Subscription Only'
                                                                        : formatPrice(app.price)
                                                                    }
                                                                </span>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {app.pricingType === 'subscription' ? 'Available on subscription plans' : 'One-time payment'}
                                                                </span>
                                                            </div>
                                                            <Button 
                                                                variant={app.visible ? "ghost" : "outline"}
                                                                className={app.visible 
                                                                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800" 
                                                                    : "border-slate-200 dark:border-slate-700 dark:text-slate-300"
                                                                }
                                                                onClick={() => {
                                                                    if (app.visible) {
                                                                        window.location.href = `${app.route}`;
                                                                    } else if (app.includedInPlans && app.includedInPlans.length > 0) {
                                                                        // Redirect to subscription page with the first plan from includedInPlans
                                                                        window.location.href = route('subscriptions.index', { 
                                                                            highlight_plan: app.includedInPlans[0],
                                                                            app: app.title
                                                                        });
                                                                    } else {
                                                                        // If no plans included, just go to subscription page
                                                                        window.location.href = route('subscriptions.index');
                                                                    }
                                                                }}
                                                            >
                                                                {app.visible ? "Open" : "Subscribe"}
                                                            </Button>
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Coming Soon Apps Section */}
                                {groupedApps.comingSoonApps.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                                            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">Coming Soon</span>
                                            Coming Soon
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {groupedApps.comingSoonApps.map((app) => (
                                                <Card 
                                                    key={app.title} 
                                                    className="hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm opacity-75"
                                                >
                                                    <CardHeader>
                                                        <div className="flex items-center gap-4">
                                                            <div className={`min-w-[4rem] w-16 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center ${app.bgColor} shadow-sm opacity-50`}>
                                                                <div className="text-2xl dark:text-slate-300">
                                                                    {app.icon}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <CardTitle className="text-gray-900 dark:text-white">{app.title}</CardTitle>
                                                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400 text-xs">
                                                                        Coming Soon
                                                                    </Badge>
                                                                </div>
                                                                <div>
                                                                    <CardDescription className="text-gray-600 dark:text-gray-300">
                                                                        {expandedDescriptions[app.title] ? app.description : truncateDescription(app.description)}
                                                                    </CardDescription>
                                                                    {app.description.length > 80 && (
                                                                        <button
                                                                            onClick={() => toggleDescription(app.title)}
                                                                            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mt-1 focus:outline-none"
                                                                        >
                                                                            {expandedDescriptions[app.title] ? 'Read less' : 'Read more'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {app.categories.map((category) => (
                                                                <Badge 
                                                                    key={category} 
                                                                    variant="secondary" 
                                                                    className="bg-gray-50 dark:bg-gray-900/50 text-xs opacity-75"
                                                                >
                                                                        {category}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        
                                                        {/* Subscription Plan Information */}
                                                        {app.includedInPlans && app.includedInPlans.length > 0 ? (
                                                            <div className="mt-3">
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Will be included in plans:</p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {app.includedInPlans.map((plan) => (
                                                                        <Badge 
                                                                            key={plan} 
                                                                            variant="outline" 
                                                                            className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                                                        >
                                                                            {plan.replace('-plan', '').replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-3">
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Not included in any subscription plan
                                                                </p>
                                                            </div>
                                                        )}
                                                    </CardHeader>
                                                    <CardFooter className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-yellow-500">⭐</span>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{app.rating}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                                    {app.pricingType === 'free' 
                                                                        ? 'Free'
                                                                        : app.pricingType === 'subscription' 
                                                                            ? 'Subscription Only'
                                                                            : formatPrice(app.price)
                                                                    }
                                                                </span>
                                                                {app.pricingType !== 'free' && (
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {app.pricingType === 'subscription' ? 'Available on subscription plans' : 'One-time payment'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No apps found message */}
                                {filteredApps.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {searchQuery || selectedCategory 
                                                ? "No apps found matching your criteria" 
                                                : "Loading apps..."}
                                        </p>
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