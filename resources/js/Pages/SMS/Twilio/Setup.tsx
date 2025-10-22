import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Project, User } from '@/types/index';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    CheckCircle,
    Loader2,
    MessageSquare,
    Plus,
    Settings,
    Star,
    Trash2,
    Wifi,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface TwilioAccount {
    id: number;
    account_name: string;
    account_sid: string;
    phone_number: string;
    default_country_code: string;
    is_active: boolean;
    is_verified: boolean;
    is_default: boolean;
    last_verified_at: string;
    created_at: string;
}

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
    accounts: TwilioAccount[];
    hasActiveAccount: boolean;
}

export default function Setup({ auth, accounts, hasActiveAccount }: Props) {
    const [showSetupForm, setShowSetupForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState<TwilioAccount | null>(
        null,
    );
    const [testingAccount, setTestingAccount] = useState<number | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm({
        account_name: '',
        account_sid: '',
        auth_token: '',
        phone_number: '',
        default_country_code: '+1',
    });

    const openSetupForm = (account?: TwilioAccount) => {
        if (account) {
            setEditingAccount(account);
            setData({
                account_name: account.account_name,
                account_sid: account.account_sid,
                auth_token: '',
                phone_number: account.phone_number || '',
                default_country_code: account.default_country_code || '+1',
            });
        } else {
            setEditingAccount(null);
            reset();
        }
        setShowSetupForm(true);
    };

    const closeSetupForm = () => {
        setShowSetupForm(false);
        setEditingAccount(null);
        reset();
    };

    const submitAccount = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.account_name.trim()) {
            toast.error('Please enter an account name');
            return;
        }

        if (!data.account_sid.trim()) {
            toast.error('Please enter your Twilio Account SID');
            return;
        }

        if (!data.auth_token.trim()) {
            toast.error('Please enter your Twilio Auth Token');
            return;
        }

        try {
            if (editingAccount) {
                await put(`/twilio-accounts/${editingAccount.id}`, {
                    onSuccess: () => {
                        toast.success('Twilio account updated successfully!');
                        closeSetupForm();
                    },
                    onError: (errors) => {
                        console.error('Update error:', errors);
                        toast.error('Failed to update Twilio account');
                    },
                });
            } else {
                await post('/twilio-accounts', {
                    onSuccess: () => {
                        toast.success('Twilio account connected successfully!');
                        closeSetupForm();
                    },
                    onError: (errors) => {
                        console.error('Create error:', errors);
                        toast.error('Failed to connect Twilio account');
                    },
                });
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('An error occurred while saving the account');
        }
    };

    const deleteAccount = async (accountId: number) => {
        if (!confirm('Are you sure you want to delete this Twilio account?')) {
            return;
        }

        try {
            await destroy(`/twilio-accounts/${accountId}`, {
                onSuccess: () => {
                    toast.success('Twilio account deleted successfully!');
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                    toast.error('Failed to delete Twilio account');
                },
            });
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('An error occurred while deleting the account');
        }
    };

    const testAccount = async (accountId: number) => {
        setTestingAccount(accountId);
        try {
            const response = await axios.post(
                `/twilio-accounts/${accountId}/verify`,
            );
            if (response.data.success) {
                toast.success('Twilio account verified successfully!');
                if (response.data.account_balance !== undefined) {
                    toast.info(
                        `Account balance: ${response.data.account_balance}`,
                    );
                }
                if (response.data.account_status) {
                    toast.info(
                        `Account status: ${response.data.account_status}`,
                    );
                }
                // Reload page after a short delay to show toast messages
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                toast.error('Connection test failed');
            }
        } catch (error: any) {
            console.error('Test error:', error);
            toast.error(
                error.response?.data?.error || 'Failed to test Twilio account',
            );
        } finally {
            setTestingAccount(null);
        }
    };

    const toggleActive = async (accountId: number) => {
        try {
            await axios.post(`/twilio-accounts/${accountId}/toggle-active`);
            toast.success('Account status updated successfully!');
            // Reload page after a short delay to show toast message
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error: any) {
            console.error('Toggle error:', error);
            toast.error('Failed to update account status');
        }
    };

    const setDefault = async (accountId: number, account: TwilioAccount) => {
        // Check if account is active and verified
        if (!account.is_active || !account.is_verified) {
            toast.error(
                'Only active and verified accounts can be set as default',
            );
            return;
        }

        try {
            await axios.post(`/twilio-accounts/${accountId}/set-default`);
            toast.success('Default account set successfully!');
            // Reload page after a short delay to show toast message
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error: any) {
            console.error('Set default error:', error);
            toast.error(
                error.response?.data?.error || 'Failed to set default account',
            );
        }
    };

    const unsetDefault = async (accountId: number) => {
        try {
            await axios.post(`/twilio-accounts/${accountId}/unset-default`);
            toast.success('Default account unset successfully!');
            // Reload page after a short delay to show toast message
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error: any) {
            console.error('Unset default error:', error);
            toast.error('Failed to unset default account');
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-900 dark:text-white">
                    Twilio Account Setup
                </h2>
            }
        >
            <Head title="Twilio Account Setup" />

            <div className="space-y-6">
                {/* Setup Instructions */}
                <Card className="border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                    <CardHeader>
                        <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Twilio SMS API Setup
                        </CardTitle>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                            Connect your Twilio account to send SMS messages
                            through the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="rounded-lg bg-blue-100 p-4 dark:bg-blue-800/30">
                                <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                                    How to get your Twilio credentials:
                                </h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                    <li>
                                        Go to{' '}
                                        <a
                                            href="https://console.twilio.com/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            Twilio Console
                                        </a>
                                    </li>
                                    <li>
                                        Sign up for a Twilio account or log in
                                        to your existing account
                                    </li>
                                    <li>
                                        Get your Account SID and Auth Token from
                                        the dashboard
                                    </li>
                                    <li>
                                        Purchase a phone number for sending SMS
                                        (optional but recommended)
                                    </li>
                                    <li>
                                        Set your default country code for
                                        international messaging
                                    </li>
                                    <li>
                                        Set one account as default for automatic
                                        SMS notifications
                                    </li>
                                </ol>
                            </div>

                            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                                <h4 className="mb-2 flex items-center font-semibold text-yellow-900 dark:text-yellow-100">
                                    <Star className="mr-2 h-4 w-4" />
                                    Default Account Feature
                                </h4>
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    The default account will be automatically
                                    used for sending SMS notifications when
                                    reservations are created. You can set any
                                    active and verified account as the default
                                    by clicking the star icon. If no default is
                                    set, the system will use the first available
                                    active verified account.
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {hasActiveAccount ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            <span className="text-sm text-green-700 dark:text-green-300">
                                                You have an active Twilio
                                                account
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            <span className="text-sm text-amber-700 dark:text-amber-300">
                                                No active Twilio account found
                                            </span>
                                        </>
                                    )}
                                </div>
                                <Button
                                    onClick={() => openSetupForm()}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Twilio Account
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Existing Accounts */}
                {accounts.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Your Twilio Accounts
                        </h3>
                        <div className="grid gap-4">
                            {accounts.map((account) => (
                                <Card
                                    key={account.id}
                                    className="border border-gray-200 dark:border-gray-700"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center space-x-3">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {account.account_name}
                                                    </h4>
                                                    <div className="flex space-x-2">
                                                        {account.is_default && (
                                                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                                <Star className="mr-1 h-3 w-3 fill-current" />
                                                                Default
                                                            </Badge>
                                                        )}
                                                        <Badge
                                                            variant={
                                                                account.is_verified
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                            className={
                                                                account.is_verified
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                    : ''
                                                            }
                                                        >
                                                            {account.is_verified ? (
                                                                <>
                                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                                    Verified
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <AlertCircle className="mr-1 h-3 w-3" />
                                                                    Not Verified
                                                                </>
                                                            )}
                                                        </Badge>
                                                        <Badge
                                                            variant={
                                                                account.is_active
                                                                    ? 'default'
                                                                    : 'destructive'
                                                            }
                                                        >
                                                            {account.is_active
                                                                ? 'Active'
                                                                : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <p>
                                                        Account SID:{' '}
                                                        {account.account_sid.substring(
                                                            0,
                                                            8,
                                                        )}
                                                        ...
                                                    </p>
                                                    {account.phone_number && (
                                                        <p>
                                                            Phone:{' '}
                                                            {
                                                                account.phone_number
                                                            }
                                                        </p>
                                                    )}
                                                    <p>
                                                        Country Code:{' '}
                                                        {
                                                            account.default_country_code
                                                        }
                                                    </p>
                                                    <p>
                                                        Created:{' '}
                                                        {new Date(
                                                            account.created_at,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                    {account.last_verified_at && (
                                                        <p>
                                                            Last Verified:{' '}
                                                            {new Date(
                                                                account.last_verified_at,
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                <Button
                                                    onClick={() =>
                                                        testAccount(account.id)
                                                    }
                                                    disabled={
                                                        testingAccount ===
                                                        account.id
                                                    }
                                                    variant="outline"
                                                    size="sm"
                                                    title="Test Connection"
                                                >
                                                    {testingAccount ===
                                                    account.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Wifi className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                {account.is_default ? (
                                                    <Button
                                                        onClick={() =>
                                                            unsetDefault(
                                                                account.id,
                                                            )
                                                        }
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-300"
                                                        title="Unset as Default"
                                                    >
                                                        <Star className="h-4 w-4 fill-current" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() =>
                                                            setDefault(
                                                                account.id,
                                                                account,
                                                            )
                                                        }
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-300"
                                                        title="Set as Default"
                                                        disabled={
                                                            !account.is_active ||
                                                            !account.is_verified
                                                        }
                                                    >
                                                        <Star className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() =>
                                                        toggleActive(account.id)
                                                    }
                                                    variant="outline"
                                                    size="sm"
                                                    className={
                                                        account.is_active
                                                            ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20 dark:hover:text-amber-300'
                                                            : 'text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-300'
                                                    }
                                                    title={
                                                        account.is_active
                                                            ? 'Deactivate Account'
                                                            : 'Activate Account'
                                                    }
                                                >
                                                    {account.is_active
                                                        ? 'Deactivate'
                                                        : 'Activate'}
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        openSetupForm(account)
                                                    }
                                                    variant="outline"
                                                    size="sm"
                                                    title="Edit Account"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        deleteAccount(
                                                            account.id,
                                                        )
                                                    }
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                                                    title="Delete Account"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Setup Form Modal */}
                {showSetupForm && (
                    <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600/50 backdrop-blur-sm dark:bg-gray-900/50">
                        <div className="relative top-20 mx-auto w-3/4 max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {editingAccount
                                            ? 'Edit Twilio Account'
                                            : 'Add Twilio Account'}
                                    </h3>
                                </div>
                                <button
                                    onClick={closeSetupForm}
                                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {editingAccount
                                        ? 'Update your Twilio credentials below.'
                                        : 'Enter your Twilio credentials to start sending SMS messages.'}
                                </p>
                            </div>

                            <form
                                onSubmit={submitAccount}
                                className="space-y-6"
                            >
                                <div>
                                    <Label htmlFor="account_name">
                                        Account Name
                                    </Label>
                                    <Input
                                        id="account_name"
                                        value={data.account_name}
                                        onChange={(e) =>
                                            setData(
                                                'account_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="My Twilio Account"
                                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        required
                                    />
                                    {errors.account_name && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.account_name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="account_sid">
                                        Account SID
                                    </Label>
                                    <Input
                                        id="account_sid"
                                        value={data.account_sid}
                                        onChange={(e) =>
                                            setData(
                                                'account_sid',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        required
                                    />
                                    {errors.account_sid && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.account_sid}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="auth_token">
                                        Auth Token
                                    </Label>
                                    <Input
                                        id="auth_token"
                                        type="password"
                                        value={data.auth_token}
                                        onChange={(e) =>
                                            setData(
                                                'auth_token',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter your Twilio Auth Token"
                                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        required
                                    />
                                    {errors.auth_token && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.auth_token}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="phone_number">
                                        Phone Number (Optional)
                                    </Label>
                                    <Input
                                        id="phone_number"
                                        value={data.phone_number}
                                        onChange={(e) =>
                                            setData(
                                                'phone_number',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="+1234567890"
                                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                    />
                                    {errors.phone_number && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.phone_number}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="default_country_code">
                                        Default Country Code
                                    </Label>
                                    <Input
                                        id="default_country_code"
                                        value={data.default_country_code}
                                        onChange={(e) =>
                                            setData(
                                                'default_country_code',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="+1"
                                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        required
                                    />
                                    {errors.default_country_code && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.default_country_code}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <Button
                                        type="button"
                                        onClick={closeSetupForm}
                                        variant="outline"
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {editingAccount
                                                    ? 'Updating...'
                                                    : 'Connecting...'}
                                            </>
                                        ) : (
                                            <>
                                                <MessageSquare className="mr-2 h-4 w-4" />
                                                {editingAccount
                                                    ? 'Update Account'
                                                    : 'Connect Account'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
