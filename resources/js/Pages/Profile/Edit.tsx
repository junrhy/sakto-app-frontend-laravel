import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import UpdateSubscriptionForm from './Partials/UpdateSubscriptionForm';
import SubscriptionManagement from './Partials/SubscriptionManagement';
import TeamManagement from './Partials/TeamManagement';
import ProfileHeader from './Partials/ProfileHeader';
import AccountSettings from './Partials/AccountSettings';
import SecuritySettings from './Partials/SecuritySettings';
import DangerZone from './Partials/DangerZone';
import BillingHistory from './Partials/BillingHistory';
import PreferencesSettings from './Partials/PreferencesSettings';
import { Users, UserPlus, Settings, Shield, Receipt } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { UserIcon } from '@heroicons/react/24/outline';
import BottomNav from '@/Components/BottomNav';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
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
            <ProfileHeader 
                isLoadingSubscription={isLoadingSubscription}
                subscription={subscription}
                credits={credits}
                auth={auth}
                formatNumber={formatNumber}
            />

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
                                <AccountSettings 
                                            mustVerifyEmail={mustVerifyEmail}
                                            status={status}
                                            addresses={addresses}
                                        />
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
                                <BillingHistory />
                            </TabsContent>

                            {/* Security Tab */}
                            <TabsContent value="security" className="space-y-6">
                                <SecuritySettings />
                            </TabsContent>

                            {/* Preferences Tab */}
                            <TabsContent value="preferences" className="space-y-6">
                                <PreferencesSettings currency={currency} />
                            </TabsContent>

                            {/* Danger Tab */}
                            <TabsContent value="danger" className="space-y-6">
                                <DangerZone />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}