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
import { apps } from '@/data/apps';
import { useState, useMemo, useEffect } from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';

interface ExchangeRates {
    PHP?: number;
    [key: string]: number | undefined;
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

        fetchCredits();
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
                ? price * (exchangeRates.PHP || 56.50) // Use API rate or fallback
                : price;
            
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

    const formatNumber = (num: number | undefined | null) => {
        return num?.toLocaleString() ?? '0';
    };

    return (
        <div className="relative min-h-screen pb-16 bg-white dark:bg-gray-900 overflow-x-hidden">
            <Head title="Apps" />

            <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-10">
                <div className="container mx-auto px-4 pt-4">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-full flex justify-between items-center mb-2">
                            <div className="flex items-center">
                                <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                                <span className="ml-2 text-xl font-bold text-white">Sakto</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4">
                                <div className="hidden sm:flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.location.href = route('credits.spent-history', { clientIdentifier: auth.user.identifier })}
                                        className="text-white bg-white/10 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg hover:bg-white/20"
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

            <div className="w-full px-4 pt-[100px] landscape:pt-[80px] md:pt-[100px]">
                <div className="py-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white/95 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-sm sm:rounded-lg p-6">
                            {/* Search and Filter Section */}
                            <div className="mb-8">
                                <div className="flex gap-4 mb-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <Input
                                            placeholder="Search apps..."
                                            className="pl-10 bg-white dark:bg-gray-900/50 backdrop-blur-sm border-gray-300 dark:border-gray-700"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
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
                                            className={`cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                                                selectedCategory === category ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                                            }`}
                                            onClick={() => setSelectedCategory(category)}
                                        >
                                            {category}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Apps Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredApps && filteredApps.length > 0 ? (
                                    filteredApps.map((app) => (
                                        <Card 
                                            key={app.title} 
                                            className={`hover:shadow-lg transition-shadow border border-gray-100 dark:border-0 bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm ${
                                                app.comingSoon ? 'opacity-75' : ''
                                            }`}
                                        >
                                            <CardHeader>
                                                <div className="flex items-center gap-4">
                                                    <div className={`min-w-[4rem] w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center ${app.bgColor} shadow-sm ${
                                                        app.comingSoon ? 'opacity-50' : ''
                                                    }`}>
                                                        <div className="text-2xl">
                                                            {app.icon}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <CardTitle className="text-gray-900 dark:text-white">{app.title}</CardTitle>
                                                            {app.comingSoon && (
                                                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400 text-xs">
                                                                    Coming Soon
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
                                                            className={`bg-gray-50 dark:bg-gray-900/50 text-xs ${
                                                                app.comingSoon ? 'opacity-75' : ''
                                                            }`}
                                                        >
                                                                {category}
                                                        </Badge>
                                                    ))}
                                                </div>
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
                                                                ? `${formatPrice(app.price)}/mo`
                                                                : formatPrice(app.price)
                                                            }
                                                        </span>
                                                        {app.pricingType !== 'free' && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {app.pricingType === 'subscription' ? 'Monthly subscription' : 'One-time payment'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Button 
                                                        variant={app.visible ? "ghost" : "outline"}
                                                        disabled={app.comingSoon}
                                                        className={`${
                                                            app.comingSoon
                                                                ? "bg-gray-100 text-gray-400 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-800 cursor-not-allowed"
                                                                : app.visible 
                                                                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50" 
                                                                    : "dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white"
                                                        }`}
                                                        onClick={() => {
                                                            if (app.visible) {
                                                                window.location.href = `${app.route}`;
                                                            }
                                                        }}
                                                    >
                                                        {app.comingSoon ? "Coming Soon" : app.visible ? "Open" : "Install"}
                                                    </Button>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-8">
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