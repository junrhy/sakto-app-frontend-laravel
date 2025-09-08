import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateCurrencyForm from './Partials/UpdateCurrencyForm';
import UpdateAddressesForm from './Partials/UpdateAddressesForm';
import UpdateSubscriptionForm from './Partials/UpdateSubscriptionForm';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link as InertiaLink } from '@inertiajs/react';
import { ArrowLeft, Link, Users, UserPlus, Settings, Shield, CreditCard, MapPin, Globe } from 'lucide-react';
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
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h2>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                                            {isAdministrator 
                                                ? "Manage your team members and their access permissions"
                                                : "View your current team member information"
                                            }
                                        </p>
                                    </div>
                                    {isAdministrator && (
                                        <Button
                                            onClick={() => window.location.href = route('teams.create')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Add Team Member
                                        </Button>
                                    )}
                                </div>

                                {/* Current Team Member */}
                                {hasTeamMembers && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <UserIcon className="w-5 h-5" />
                                                Current Team Member
                                            </CardTitle>
                                            <CardDescription>
                                                You are currently logged in as this team member
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-8">
                                                {/* Profile Header */}
                                                <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                                    <Avatar className="h-20 w-20 ring-4 ring-white dark:ring-gray-800 shadow-lg">
                                                        <AvatarImage src={auth.selectedTeamMember?.profile_picture} />
                                                        <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xl font-bold">
                                                            {getInitials(auth.selectedTeamMember?.full_name?.split(' ')[0] || '', auth.selectedTeamMember?.full_name?.split(' ')[1] || '')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                                            {auth.selectedTeamMember?.full_name}
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                                                            {auth.selectedTeamMember?.email}
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-3 py-1">
                                                                Active
                                                            </Badge>
                                                            {auth.selectedTeamMember?.roles?.map((role) => (
                                                                <Badge key={role} variant="outline" className="px-3 py-1">
                                                                    {role}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Information Grid */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Contact Information Card */}
                                                    <Card className="bg-gray-50/50 dark:bg-gray-800/50 border-0 shadow-sm">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                                <UserIcon className="w-5 h-5 text-gray-600" />
                                                                Contact Information
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                                                <span className="text-gray-600 dark:text-gray-400 font-medium">Email</span>
                                                                <span className="text-gray-900 dark:text-white font-semibold">
                                                                    {auth.selectedTeamMember?.email || 'Not provided'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between py-2">
                                                                <span className="text-gray-600 dark:text-gray-400 font-medium">Contact Number</span>
                                                                <span className="text-gray-900 dark:text-white font-semibold">
                                                                    {auth.selectedTeamMember?.contact_number || 'Not provided'}
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Account Status Card */}
                                                    <Card className="bg-gray-50/50 dark:bg-gray-800/50 border-0 shadow-sm">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                                <Settings className="w-5 h-5 text-gray-600" />
                                                                Account Status
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                                                <span className="text-gray-600 dark:text-gray-400 font-medium">Status</span>
                                                                <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                                    Active
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                                                <span className="text-gray-600 dark:text-gray-400 font-medium">Email Verified</span>
                                                                <span className={`font-semibold ${auth.selectedTeamMember?.email_verified ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                                                    {auth.selectedTeamMember?.email_verified ? '✓ Verified' : '✗ Not Verified'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between py-2">
                                                                <span className="text-gray-600 dark:text-gray-400 font-medium">Last Login</span>
                                                                <span className="text-gray-900 dark:text-white font-semibold">
                                                                    {auth.selectedTeamMember?.last_logged_in ? formatDate(auth.selectedTeamMember.last_logged_in) : 'Never'}
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Roles & Permissions Card */}
                                                    <Card className="bg-gray-50/50 dark:bg-gray-800/50 border-0 shadow-sm">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                                <Shield className="w-5 h-5 text-gray-600" />
                                                                Roles & Permissions
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <div>
                                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Roles</h5>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {auth.selectedTeamMember?.roles?.length ? (
                                                                        auth.selectedTeamMember.roles.map((role) => (
                                                                            <Badge key={role} variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                                                {role}
                                                                            </Badge>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-sm text-gray-500 dark:text-gray-400">No roles assigned</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allowed Applications</h5>
                                                                {auth.selectedTeamMember?.allowed_apps?.length ? (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {auth.selectedTeamMember.allowed_apps.slice(0, 4).map((app) => (
                                                                            <Badge key={app} variant="outline" className="text-xs">
                                                                                {app}
                                                                            </Badge>
                                                                        ))}
                                                                        {auth.selectedTeamMember.allowed_apps.length > 4 && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                +{auth.selectedTeamMember.allowed_apps.length - 4} more
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm text-gray-500 dark:text-gray-400">No apps assigned</span>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Preferences Card */}
                                                    <Card className="bg-gray-50/50 dark:bg-gray-800/50 border-0 shadow-sm">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                                <Globe className="w-5 h-5 text-gray-600" />
                                                                Preferences
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                                                <span className="text-gray-600 dark:text-gray-400 font-medium">Timezone</span>
                                                                <span className="text-gray-900 dark:text-white font-semibold">
                                                                    {auth.selectedTeamMember?.timezone || 'Default'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between py-2">
                                                                <span className="text-gray-600 dark:text-gray-400 font-medium">Language</span>
                                                                <span className="text-gray-900 dark:text-white font-semibold">
                                                                    {auth.selectedTeamMember?.language || 'Default'}
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Notes Section */}
                                                {auth.selectedTeamMember?.notes && (
                                                    <Card className="bg-gray-50/50 dark:bg-gray-800/50 border-0 shadow-sm">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                                <span className="text-xl">📝</span>
                                                                Notes
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="p-4 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/30">
                                                                <p className="text-gray-700 dark:text-gray-300">
                                                                    {auth.selectedTeamMember.notes}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {/* Password Update Section */}
                                                <Card className="bg-gray-50/50 dark:bg-gray-800/50 border-0 shadow-sm">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="flex items-center gap-2 text-lg">
                                                            <Shield className="w-5 h-5 text-gray-600" />
                                                            Security Settings
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="p-4 bg-gray-100/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/30 rounded-lg">
                                                            <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium">
                                                                Update your team member password to maintain account security.
                                                            </p>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.location.href = route('team-member.password')}
                                                                className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50"
                                                            >
                                                                <Shield className="w-4 h-4 mr-2" />
                                                                Update Team Member Password
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* All Team Members */}
                                {(isAdministrator || !hasTeamMembers) && (
                                    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Users className="w-5 h-5 text-gray-600" />
                                                All Team Members ({auth.teamMembers?.length || 0})
                                            </CardTitle>
                                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                                View and manage all team members in your account
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {auth.teamMembers?.map((member) => (
                                                    <div key={member.identifier} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                                                        <div className="flex items-center gap-4">
                                                            <Avatar className="h-12 w-12 ring-2 ring-gray-200 dark:ring-gray-700">
                                                                <AvatarImage src={member.profile_picture} />
                                                                <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
                                                                    {getInitials(member.first_name, member.last_name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                                    {member.full_name}
                                                                </h4>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                                    {member.email}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    {member.roles?.map((role) => (
                                                                        <Badge key={role} variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-1">
                                                                            {role}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {getStatusBadge(member.is_active)}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.location.href = route('teams.show', { identifier: member.identifier })}
                                                                className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50"
                                                            >
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!auth.teamMembers || auth.teamMembers.length === 0) && (
                                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                                            <Users className="w-8 h-8 opacity-50" />
                                                        </div>
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Team Members</h3>
                                                        <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by adding your first team member to collaborate together.</p>
                                                        <Button
                                                            variant="default"
                                                            className="bg-gray-600 hover:bg-gray-700 text-white"
                                                            onClick={() => window.location.href = route('teams.create')}
                                                        >
                                                            <UserPlus className="w-4 h-4 mr-2" />
                                                            Add First Team Member
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {isAdministrator && (
                                    <div className="flex justify-center pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.href = route('teams.index')}
                                            className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50"
                                        >
                                            <Settings className="w-4 h-4 mr-2" />
                                            Manage Team Settings
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Subscriptions Tab */}
                            <TabsContent value="subscriptions" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            Subscription Management
                                        </CardTitle>
                                        <CardDescription>
                                            Manage your subscription plans and billing information.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <UpdateSubscriptionForm 
                                            userIdentifier={auth.user.identifier}
                                            className="w-full" 
                                            hideHeader={true}
                                        />
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
