import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateCurrencyForm from './Partials/UpdateCurrencyForm';
import UpdateAddressesForm from './Partials/UpdateAddressesForm';
import UpdateSubscriptionForm from './Partials/UpdateSubscriptionForm';
import MonthlyBillingView from './Partials/MonthlyBillingView';
import SubscriptionManagement from './Partials/SubscriptionManagement';
import TeamManagement from './Partials/TeamManagement';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link as InertiaLink } from '@inertiajs/react';
import { ArrowLeft, Link, Users, UserPlus, Settings, Shield, CreditCard, MapPin, Globe, Receipt } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { QuestionMarkCircleIcon, ArrowRightStartOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline';
import BottomNav from '@/Components/BottomNav';
import { useState, useEffect } from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ModeToggle } from '@/Components/ModeToggle';
import { useTheme } from '@/Components/ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { toast } from 'sonner';

interface Subscription {
    plan: {
        name: string;
        unlimited_access: boolean;
    };
    end_date: string;
}

interface TeamMember {
    identifier: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    roles: string[];
    allowed_apps: string[];
    is_active: boolean;
    last_logged_in: string;
    profile_picture?: string;
}




export default function Edit({
    mustVerifyEmail,
    status,
    addresses,
    currency,
    auth,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    addresses: Array<any>;
    currency: any;
    auth: {
        user: {
            name: string;
            credits?: number;
            identifier?: string;
        };
        project: {
            identifier: string;
        };
        selectedTeamMember: {
            full_name: string;
            profile_picture?: string;
            roles?: string[];
            email?: string;
            contact_number?: string;
            allowed_apps?: string[];
            email_verified?: boolean;
            last_logged_in?: string;
            timezone?: string;
            language?: string;
            notes?: string;
        };
        teamMembers: TeamMember[];
    };
}) {
    const [credits, setCredits] = useState<number>(auth.user.credits ?? 0);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoadingSubscription, setIsLoadingSubscription] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>('team');

    // Check if current team member has administrator role
    const isAdministrator = auth.selectedTeamMember?.roles?.includes('admin') || false;

    // Check if team members exist
    const hasTeamMembers = auth.teamMembers && auth.teamMembers.length > 0;

    useEffect(() => {
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
                // Silently ignore credit fetch errors
                setCredits(0);
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

    // Redirect to team tab if non-administrator tries to access restricted tabs
    useEffect(() => {
        if (!isAdministrator && hasTeamMembers && ['account', 'security', 'preferences', 'danger'].includes(activeTab)) {
            setActiveTab('team');
        }
    }, [isAdministrator, hasTeamMembers, activeTab]);

    const formatNumber = (num: number | undefined | null) => {
        return num?.toLocaleString() ?? '0';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                Inactive
            </Badge>
        );
    };

    return (
        <div className="relative min-h-screen pb-16 bg-gray-50 dark:bg-gray-900">
            {/* Message for users without subscription */}
            {!isLoadingSubscription && !subscription && (
                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 z-20 py-1 text-center text-white text-sm">
                    <span className="font-medium">Subscribe to a plan to continue using all features!</span>
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

            <div className={`fixed ${!isLoadingSubscription && !subscription ? 'top-7' : 'top-0'} left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/80 z-10 shadow-sm`}>
                <div className="container mx-auto px-4 pt-4">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-full flex justify-between items-center mb-2">
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
                                            <DropdownMenuItem>
                                                <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                                                <InertiaLink href="/help" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Help</InertiaLink>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" />
                                                <InertiaLink 
                                                    href={route('logout', { project: auth.project?.identifier || '' })} 
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
                </div>
            </div>

            <div className={`container mx-auto px-4 ${!isLoadingSubscription && !subscription ? 'pt-[120px]' : 'pt-[100px]'} landscape:pt-[80px] md:pt-[100px]`}>
                <div className="py-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Manage your account settings, team members, and preferences
                            </p>

                        </div>

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className="flex w-auto overflow-x-auto bg-gray-100 dark:bg-gray-800 p-1 rounded-lg justify-start">
                                <TabsTrigger value="team" className="flex items-center gap-2 whitespace-nowrap">
                                    <Users className="w-4 h-4" />
                                    <span className="hidden sm:inline">Team</span>
                                </TabsTrigger>
                                {(isAdministrator || !hasTeamMembers) && (
                                    <>
                                        <TabsTrigger value="account" className="flex items-center gap-2 whitespace-nowrap">
                                            <UserIcon className="w-4 h-4" />
                                            <span className="hidden sm:inline">Account</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="subscriptions" className="flex items-center gap-2 whitespace-nowrap">
                                            <span className="hidden sm:inline">Subscriptions</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="billing" className="flex items-center gap-2 whitespace-nowrap">
                                            <Receipt className="w-4 h-4" />
                                            <span className="hidden sm:inline">Billing</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="security" className="flex items-center gap-2 whitespace-nowrap">
                                            <Shield className="w-4 h-4" />
                                            <span className="hidden sm:inline">Security</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="preferences" className="flex items-center gap-2 whitespace-nowrap">
                                            <Settings className="w-4 h-4" />
                                            <span className="hidden sm:inline">Preferences</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="danger" className="flex items-center gap-2 text-red-600 dark:text-red-400 whitespace-nowrap">
                                            <span className="hidden sm:inline">Danger</span>
                                        </TabsTrigger>
                                    </>
                                )}
                            </TabsList>

                            {/* Account Tab */}
                            <TabsContent value="account" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserIcon className="w-5 h-5" />
                                            Profile Information
                                        </CardTitle>
                                        <CardDescription>
                                            Update your account's profile information and email address.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <UpdateProfileInformationForm
                                            mustVerifyEmail={mustVerifyEmail}
                                            status={status}
                                            className="max-w-xl"
                                            hideHeader={true}
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Addresses
                                        </CardTitle>
                                        <CardDescription>
                                            Manage your delivery and billing addresses.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <UpdateAddressesForm 
                                            addresses={addresses}
                                            className="w-full" 
                                            hideHeader={true}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Team Tab */}
                            <TabsContent value="team" className="space-y-6">
                                <TeamManagement 
                                    isAdministrator={isAdministrator}
                                    hasTeamMembers={hasTeamMembers}
                                    selectedTeamMember={auth.selectedTeamMember}
                                    teamMembers={auth.teamMembers}
                                />
                            </TabsContent>

                            {/* Subscriptions Tab */}
                            <TabsContent value="subscriptions" className="space-y-6">
                                <SubscriptionManagement userIdentifier={auth.user.identifier || ''} />
                            </TabsContent>

                            {/* Billing History Tab */}
                            <TabsContent value="billing" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Receipt className="w-5 h-5" />
                                            Billing History
                                        </CardTitle>
                                        <CardDescription>
                                            View your app purchases and subscription billing history.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <MonthlyBillingView />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Security Tab */}
                            <TabsContent value="security" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="w-5 h-5" />
                                            Password
                                        </CardTitle>
                                        <CardDescription>
                                            Ensure your account is using a long, random password to stay secure.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <UpdatePasswordForm className="max-w-xl" hideHeader={true} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Preferences Tab */}
                            <TabsContent value="preferences" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Globe className="w-5 h-5" />
                                            Theme Settings
                                        </CardTitle>
                                        <CardDescription>
                                            Select your preferred theme for the application interface.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {(() => {
                                            const { theme, setTheme } = useTheme();
                                            const options = [
                                                { value: 'light', label: 'Light', icon: Sun },
                                                { value: 'dark', label: 'Dark', icon: Moon },
                                                { value: 'system', label: 'System', icon: Monitor },
                                            ];
                                            return (
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
                                                    <span className="text-gray-700 dark:text-gray-200 font-medium min-w-[70px]">Theme:</span>
                                                    <div className="flex gap-2">
                                                        {options.map(({ value, label, icon: Icon }) => (
                                                            <Button
                                                                key={value}
                                                                type="button"
                                                                variant={theme === value ? 'default' : 'outline'}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-150
                                                                    ${theme === value
                                                                        ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/80'
                                                                        : 'bg-white dark:bg-gray-900/60 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/80'}
                                                                `}
                                                                aria-pressed={theme === value}
                                                                onClick={() => setTheme(value as "light" | "dark" | "system")}
                                                            >
                                                                <Icon className="w-5 h-5" />
                                                                <span className="hidden sm:inline">{label}</span>
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Globe className="w-5 h-5" />
                                            Currency Settings
                                        </CardTitle>
                                        <CardDescription>
                                            Set your preferred currency for transactions and displays.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <UpdateCurrencyForm 
                                            currency={currency}
                                            className="max-w-xl" 
                                            hideHeader={true}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Danger Tab */}
                            <TabsContent value="danger" className="space-y-6">
                                <Card className="border-red-200 dark:border-red-800">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                            Delete Account
                                        </CardTitle>
                                        <CardDescription className="text-red-600 dark:text-red-400">
                                            Permanently delete your account and all of its data.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <DeleteUserForm className="max-w-xl" hideHeader={true} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
}