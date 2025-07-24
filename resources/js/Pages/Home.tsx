import React, { useEffect, useState } from 'react';
import { Link as InertiaLink } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { ThemeProvider, useTheme } from "@/Components/ThemeProvider";
import { Button } from '@/Components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { getApps, type App } from '@/data/apps';
import { QuestionMarkCircleIcon, ArrowRightStartOnRectangleIcon, UserIcon, CreditCardIcon } from '@heroicons/react/24/outline';
// @ts-ignore
import { Sun, Moon, Monitor } from 'lucide-react';
import { parseEnabledModules } from '@/lib/utils';

interface Props {
    auth: {
        user: {
            name: string;
            credits?: number;
            identifier?: string;
            theme?: 'light' | 'dark' | 'system';
        };
        project: {
            enabledModules: string[];
            identifier: string;
        };
        modules: string[];
        teamMembers: Array<{
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        }>;
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        } | null;
    };
}

interface Subscription {
    plan: {
        name: string;
        unlimited_access: boolean;
        slug?: string;
    };
    end_date: string;
}

export default function Home({ auth }: Props) {
    const { theme, setTheme } = useTheme();
    const [credits, setCredits] = useState<number>(auth.user.credits ?? 0);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoadingSubscription, setIsLoadingSubscription] = useState<boolean>(true);
    const [apps, setApps] = useState<App[]>([]);
    const [isLoadingApps, setIsLoadingApps] = useState<boolean>(true);

    console.log(auth);

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
                        } else {
                            setSubscription(null);
                        }
                    } else {
                        setSubscription(null);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch subscription:', error);
                setSubscription(null);
            } finally {
                setIsLoadingSubscription(false);
            }
        };

        fetchCredits();
        fetchSubscription();
        fetchApps();
    }, [auth.user.identifier]);

    const getBorderColor = (colorClass: string) => {
        const colorMap: { [key: string]: string } = {
            'text-blue-500': '#475569', // slate-600
            'text-orange-500': '#475569', // slate-600
            'text-green-500': '#475569', // slate-600
            'text-purple-500': '#475569', // slate-600
            'text-indigo-500': '#475569', // slate-600
            'text-red-500': '#475569', // slate-600
            'text-yellow-500': '#475569', // slate-600
            'text-teal-500': '#475569', // slate-600
            'text-cyan-500': '#475569', // slate-600
            'text-pink-500': '#475569', // slate-600
        };
        return colorMap[colorClass] || '#475569'; // Default to slate-600
    };

    const firstName = auth.user.name.split(' ')[0];

    const formatNumber = (num: number | undefined | null) => {
        return num?.toLocaleString() ?? '0';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <ThemeProvider>
            <div className="relative min-h-screen pb-16 bg-gray-50 dark:bg-gray-900">
                {/* Message for users without subscription */}
                {!isLoadingSubscription && !subscription && (
                    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 z-20 py-1 text-center text-white text-sm">
                        <div className="container mx-auto px-4 flex items-center justify-center flex-wrap gap-2">
                            <span className="font-medium">Subscribe to a plan to continue using all features!</span>
                            <Button 
                                variant="link" 
                                size="sm" 
                                className="text-white underline p-0 h-auto"
                                onClick={() => window.location.href = route('subscriptions.index')}
                            >
                                View Plans
                            </Button>
                        </div>
                    </div>
                )}
                
                <div className={`fixed ${!isLoadingSubscription && !subscription ? 'top-7' : 'top-0'} left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/80 z-10 shadow-sm`}>
                    <div className="container mx-auto px-4 pt-4">
                        <div className="flex flex-col items-center">
                            <div className="w-full flex justify-between items-center mb-6">
                                <div className="flex items-center">
                                    <ApplicationLogo className="h-10 w-auto fill-current text-gray-900 dark:text-white" />
                                    <div className="ml-2">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">{auth.user.name}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="hidden sm:flex items-center">
                                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.location.href = route('credits.spent-history', { clientIdentifier: auth.user.identifier })}
                                                className="text-gray-900 dark:text-white px-3 py-1.5 rounded-l-lg rounded-r-none hover:bg-gray-200 dark:hover:bg-gray-700 border-r border-gray-200 dark:border-gray-700"
                                            >
                                                <span className="text-sm font-medium">{formatNumber(credits)} Credits</span>
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1.5 font-semibold border-0 rounded-l-none rounded-r-lg [text-shadow:_0_1px_1px_rgba(0,0,0,0.2)]"
                                                onClick={() => window.location.href = route('credits.buy')}
                                            >
                                                <CreditCardIcon className="w-4 h-4" />
                                                Buy
                                            </Button>
                                        </div>
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
                                                    <span>{auth.selectedTeamMember?.full_name || auth.user.name}</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent 
                                                align="end" 
                                                alignOffset={0}
                                                sideOffset={8}
                                                className="w-56 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                                onCloseAutoFocus={(e) => e.preventDefault()}
                                                collisionPadding={16}
                                            >
                                                <DropdownMenuItem asChild>
                                                    <InertiaLink 
                                                        href={route('help')}
                                                        className="flex items-center text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                                                        <span>Help</span>
                                                    </InertiaLink>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" />
                                                    <InertiaLink 
                                                        href={route('logout', { project: auth.project.identifier })} 
                                                        method="post" 
                                                        as="button"
                                                        className="w-full text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
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

                        <div className="flex flex-col items-center mb-6 landscape:hidden">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.location.href = route('credits.history', { clientIdentifier: auth.user.identifier })}
                                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <span className="text-lg text-gray-900 dark:text-white text-opacity-90 mt-1 text-center max-w-2xl">
                                    {formatNumber(credits)} Credits
                                </span>
                            </Button>
                            {subscription && (
                                <div className="text-gray-900 dark:text-white text-opacity-80 text-sm mt-1">
                                    <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-medium mr-1">
                                        {subscription.plan.name}
                                    </span>
                                    Active until {formatDate(subscription.end_date)} • Premium access
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`container mx-auto px-4 ${!isLoadingSubscription && !subscription ? 'pt-[220px]' : 'pt-[180px]'} landscape:pt-[140px] md:pt-[220px] overflow-y-auto mb-4`}>
                    {/* Show subscription message when user has no subscription */}
                    {!isLoadingSubscription && !subscription && (
                        <div className="mb-8 text-center">
                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 dark:from-blue-600 dark:via-purple-700 dark:to-indigo-800 rounded-2xl p-8 border-0 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
                                {/* Animated background elements */}
                                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                                    <div className="absolute top-4 left-4 w-20 h-20 bg-white rounded-full animate-pulse"></div>
                                    <div className="absolute top-12 right-8 w-16 h-16 bg-white rounded-full animate-pulse delay-1000"></div>
                                    <div className="absolute bottom-8 left-12 w-12 h-12 bg-white rounded-full animate-pulse delay-500"></div>
                                    <div className="absolute bottom-4 right-4 w-24 h-24 bg-white rounded-full animate-pulse delay-1500"></div>
                                </div>
                                
                                {/* Main content */}
                                <div className="relative z-10">
                                    <div className="flex justify-center mb-6">
                                        <div className="relative">
                                            <div className="text-6xl mb-2 animate-bounce">🚀</div>
                                            <div className="absolute -top-2 -right-2 text-2xl animate-ping">✨</div>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">
                                        Unlock Premium Features
                                    </h3>
                                    
                                    <p className="text-blue-100 mb-6 max-w-lg mx-auto text-lg leading-relaxed">
                                        Get unlimited access to all apps, advanced features, and exclusive content. 
                                        <span className="font-semibold text-white"> Start your journey today!</span>
                                    </p>
                                    
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                                        <div className="flex items-center text-blue-100">
                                            <span className="text-green-400 mr-2">✓</span>
                                            <span>Unlimited Access</span>
                                        </div>
                                        <div className="flex items-center text-blue-100">
                                            <span className="text-green-400 mr-2">✓</span>
                                            <span>Premium Support</span>
                                        </div>
                                        <div className="flex items-center text-blue-100">
                                            <span className="text-green-400 mr-2">✓</span>
                                            <span>Advanced Features</span>
                                        </div>
                                    </div>
                                    
                                    <Button 
                                        onClick={() => window.location.href = route('subscriptions.index')}
                                        className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-3 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
                                    >
                                        🎯 Explore Plans Now
                                    </Button>
                                    
                                    <p className="text-blue-200 text-sm mt-4 opacity-90">
                                        Join thousands of satisfied users
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4 lg:gap-6 gap-y-8 md:gap-y-10 lg:gap-y-12 w-full mx-auto">
                        {apps.filter(app => {
                            // Convert app title to match module name format (lowercase and hyphenated)
                            const normalizedAppTitle = app.title.toLowerCase().replace(/\s+/g, '-');
                            
                            // Only show apps that are in enabledModules
                            const enabledModules = parseEnabledModules(auth.project.enabledModules);
                            if (!enabledModules.includes(normalizedAppTitle)) {
                                return false;
                            }
                            
                            // Show app if it's marked as visible
                            if (app.visible) return true;
                            
                            // Show subscription apps if user has an active subscription that includes this app
                            if (app.pricingType === 'subscription' && subscription && subscription.plan.slug && app.includedInPlans?.includes(subscription.plan.slug)) {
                                return true;
                            }
                            
                            return false;
                        }).sort((a, b) => a.title.localeCompare(b.title)).map((app) => (
                            <InertiaLink
                                key={app.title}
                                href={app.route}
                                className="flex flex-col items-center"
                            >
                                <div 
                                    className={`w-20 h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-2 transform hover:-translate-y-1 transition-all duration-200 shadow-md hover:shadow-lg dark:shadow-gray-800/50`}
                                    style={{ 
                                        borderWidth: '1px', 
                                        borderColor: theme === 'dark' ? 'rgba(148, 163, 184, 0.3)' : getBorderColor(app.bgColor)
                                    }}
                                >
                                    <div className={`text-4xl dark:text-slate-300`}>
                                        {app.icon}
                                    </div>
                                </div>
                                <h2 className="text-sm font-medium text-gray-800 dark:text-gray-300 text-center">
                                    {app.title}
                                </h2>
                            </InertiaLink>
                        ))}
                    </div>
                </div>
                
                <BottomNav />
            </div>
        </ThemeProvider>
    );
}
