import MobileSidebar from '@/Components/MobileSidebar';
import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { UserIcon } from '@heroicons/react/24/outline';
import { CreditCard, Receipt, Settings, Shield, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import AccountSettings from './Partials/AccountSettings';
import BillingHistory from './Partials/BillingHistory';
import DangerZone from './Partials/DangerZone';
import PreferencesSettings from './Partials/PreferencesSettings';
import ProfileHeader from './Partials/ProfileHeader';
import SecuritySettings from './Partials/SecuritySettings';
import SubscriptionManagement from './Partials/SubscriptionManagement';
import TeamManagement from './Partials/TeamManagement';

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
    const [isLoadingSubscription, setIsLoadingSubscription] =
        useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>('team');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Check if current team member has administrator role
    const isAdministrator =
        auth.selectedTeamMember?.roles?.includes('admin') || false;

    // Check if team members exist
    const hasTeamMembers = auth.teamMembers && auth.teamMembers.length > 0;

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                if (auth.user.identifier) {
                    const response = await fetch(
                        `/credits/${auth.user.identifier}/balance`,
                    );
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
                    const response = await fetch(
                        `/subscriptions/${auth.user.identifier}/active`,
                    );
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
        if (
            !isAdministrator &&
            hasTeamMembers &&
            ['account', 'security', 'preferences', 'danger'].includes(activeTab)
        ) {
            setActiveTab('team');
        }
    }, [isAdministrator, hasTeamMembers, activeTab]);

    const formatNumber = (num: number | undefined | null) => {
        return num?.toLocaleString() ?? '0';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge
                variant="default"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
                Active
            </Badge>
        ) : (
            <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
                Inactive
            </Badge>
        );
    };

    return (
        <div className="relative min-h-screen bg-gray-50 pb-16 dark:bg-gray-900 md:pb-0">
            {/* Mobile Sidebar */}
            <MobileSidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <ProfileHeader
                isLoadingSubscription={isLoadingSubscription}
                subscription={subscription}
                credits={credits}
                auth={auth}
                formatNumber={formatNumber}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <div
                className={`container mx-auto px-4 ${!isLoadingSubscription && !subscription ? 'pt-[120px]' : 'pt-[100px]'} md:pt-[100px] landscape:pt-[80px]`}
            >
                <div className="py-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Account Settings
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Manage your account settings, team members, and
                                preferences
                            </p>
                        </div>

                        {/* Tabs */}
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="space-y-6"
                        >
                            {/* Mobile Select Dropdown */}
                            <div className="md:hidden">
                                <Select
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                                >
                                    <SelectTrigger className="w-full bg-white dark:bg-gray-800">
                                        <SelectValue placeholder="Select a section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="team">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>Team</span>
                                            </div>
                                        </SelectItem>
                                        {(isAdministrator ||
                                            !hasTeamMembers) && (
                                            <>
                                                <SelectItem value="account">
                                                    <div className="flex items-center gap-2">
                                                        <UserIcon className="h-4 w-4" />
                                                        <span>Account</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="subscriptions">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="h-4 w-4" />
                                                        <span>
                                                            Subscriptions
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="billing">
                                                    <div className="flex items-center gap-2">
                                                        <Receipt className="h-4 w-4" />
                                                        <span>Billing</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="security">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4" />
                                                        <span>Security</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="preferences">
                                                    <div className="flex items-center gap-2">
                                                        <Settings className="h-4 w-4" />
                                                        <span>Preferences</span>
                                                    </div>
                                                </SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Desktop Tabs */}
                            <TabsList className="hidden w-auto justify-start overflow-x-auto rounded-lg bg-gray-100 p-1 dark:bg-gray-800 md:flex">
                                <TabsTrigger
                                    value="team"
                                    className="flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Users className="h-4 w-4" />
                                    <span>Team</span>
                                </TabsTrigger>
                                {(isAdministrator || !hasTeamMembers) && (
                                    <>
                                        <TabsTrigger
                                            value="account"
                                            className="flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <UserIcon className="h-4 w-4" />
                                            <span>Account</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="subscriptions"
                                            className="flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <CreditCard className="h-4 w-4" />
                                            <span>Subscriptions</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="billing"
                                            className="flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <Receipt className="h-4 w-4" />
                                            <span>Billing</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="security"
                                            className="flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <Shield className="h-4 w-4" />
                                            <span>Security</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="preferences"
                                            className="flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <Settings className="h-4 w-4" />
                                            <span>Preferences</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="danger"
                                            className="flex items-center gap-2 whitespace-nowrap text-red-600 dark:text-red-400"
                                        >
                                            <span>Danger</span>
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
                            <TabsContent
                                value="subscriptions"
                                className="space-y-6"
                            >
                                <SubscriptionManagement
                                    userIdentifier={auth.user.identifier || ''}
                                />
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
                            <TabsContent
                                value="preferences"
                                className="space-y-6"
                            >
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
