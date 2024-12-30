import { Head, Link } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Search } from 'lucide-react';
import { ThemeProvider } from "@/Components/ThemeProvider";
import { ModeToggle } from "@/Components/ModeToggle";
import { apps } from '@/data/apps';
import { useState, useMemo } from 'react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
            app_currency: {
                symbol: string;
            };
        };
    };
}

export default function Apps({ auth }: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});

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
            const formattedNumber = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(price);
            return `${auth.user.app_currency.symbol}${formattedNumber}`;
        } catch (error) {
            console.error('Price formatting error:', error);
            return `${auth.user.app_currency.symbol}${price.toFixed(2)}`;
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

    // Debug logs
    console.log('Auth:', auth);
    console.log('User Currency:', auth?.user?.app_currency);
    console.log('Filtered Apps:', filteredApps);

    return (
        <ThemeProvider>
            <div className="relative min-h-screen pb-16 bg-white dark:bg-gray-900">
                <Head title="Apps" />

                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-10">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                                <span className="ml-2 text-xl font-bold text-white">Sakto</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <ModeToggle />
                                <Link 
                                    href="/help"
                                    className="text-white hover:text-blue-100 transition-colors duration-200"
                                >
                                    <span className="text-md font-semibold">Help</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 pt-[100px] landscape:pt-[80px] md:pt-[100px]">
                    <div className="py-12">
                        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-sm sm:rounded-lg p-6">
                                {/* Search and Filter Section */}
                                <div className="mb-8">
                                    <div className="flex gap-4 mb-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            <Input
                                                placeholder="Search apps..."
                                                className="pl-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-700"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            className="dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white dark:border-gray-700"
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
                                                className={`cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 ${
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
                                                className={`hover:shadow-lg transition-shadow border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm ${
                                                    app.comingSoon ? 'opacity-75' : ''
                                                }`}
                                            >
                                                <CardHeader>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`min-w-[4rem] w-16 h-16 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center ${app.bgColor} shadow-sm ${
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
                                                                className={`bg-gray-100/50 dark:bg-gray-900/50 text-xs ${
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
                                                                        ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50" 
                                                                        : "dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white"
                                                            }`}
                                                        >
                                                            {app.comingSoon ? "Coming Soon" : app.visible ? "Installed" : "Install"}
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
        </ThemeProvider>
    );
}
