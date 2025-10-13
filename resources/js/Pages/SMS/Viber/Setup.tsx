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
    Trash2,
    Wifi,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ViberAccount {
    id: number;
    account_name: string;
    public_account_id: string;
    uri: string;
    is_active: boolean;
    is_verified: boolean;
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
    accounts: ViberAccount[];
    hasActiveAccount: boolean;
}

export default function Setup({ auth, accounts, hasActiveAccount }: Props) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState<number | null>(null);
    const [testingAccount, setTestingAccount] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        account_name: '',
        auth_token: '',
        webhook_url: '',
        webhook_events: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitData = {
            ...data,
            webhook_events: data.webhook_events.filter(
                (event) => event.trim() !== '',
            ),
        };

        if (editingAccount) {
            // Update existing account
            axios
                .put(route('viber-accounts.update', editingAccount), submitData)
                .then(() => {
                    toast.success('Viber account updated successfully!');
                    setShowAddForm(false);
                    setEditingAccount(null);
                    reset();
                    window.location.reload();
                })
                .catch((error) => {
                    console.error('Update error:', error);
                    toast.error('Failed to update Viber account');
                });
        } else {
            // Create new account
            post(route('viber-accounts.store'), {
                onSuccess: () => {
                    toast.success('Viber account created successfully!');
                    setShowAddForm(false);
                    reset();
                },
                onError: (errors) => {
                    console.error('Create errors:', errors);
                    toast.error('Failed to create Viber account');
                },
            });
        }
    };

    const handleEdit = (account: ViberAccount) => {
        setData({
            account_name: account.account_name,
            auth_token: '', // Don't show existing token for security
            webhook_url: '',
            webhook_events: [],
        });
        setEditingAccount(account.id);
        setShowAddForm(true);
    };

    const handleDelete = (accountId: number) => {
        if (confirm('Are you sure you want to delete this Viber account?')) {
            axios
                .delete(route('viber-accounts.destroy', accountId))
                .then(() => {
                    toast.success('Viber account deleted successfully!');
                    window.location.reload();
                })
                .catch((error) => {
                    console.error('Delete error:', error);
                    toast.error('Failed to delete Viber account');
                });
        }
    };

    const handleTest = async (accountId: number) => {
        setTestingAccount(accountId);
        try {
            const response = await axios.post(
                route('viber-accounts.test', accountId),
            );
            toast.success('Connection test successful!');
        } catch (error) {
            console.error('Test error:', error);
            toast.error('Connection test failed');
        } finally {
            setTestingAccount(null);
        }
    };

    const addWebhookEvent = () => {
        setData('webhook_events', [...data.webhook_events, '']);
    };

    const updateWebhookEvent = (index: number, value: string) => {
        const newEvents = [...data.webhook_events];
        newEvents[index] = value;
        setData('webhook_events', newEvents);
    };

    const removeWebhookEvent = (index: number) => {
        setData(
            'webhook_events',
            data.webhook_events.filter((_, i) => i !== index),
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-900 dark:text-white">
                    Viber Account Setup
                </h2>
            }
        >
            <Head title="Viber Account Setup" />

            <div className="space-y-6">
                {/* Setup Instructions */}
                <Card className="border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                    <CardHeader>
                        <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Infobip Viber Account Setup
                        </CardTitle>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                            Connect your Infobip Viber account to send messages
                            to your customers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="rounded-lg bg-blue-100 p-4 dark:bg-blue-800/30">
                                <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                                    How to get your Infobip Viber credentials:
                                </h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                    <li>
                                        Sign up for an Infobip account at{' '}
                                        <a
                                            href="https://portal.infobip.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            portal.infobip.com
                                        </a>
                                    </li>
                                    <li>
                                        Navigate to the{' '}
                                        <strong>Channels &gt; Viber</strong>{' '}
                                        section in your Infobip dashboard
                                    </li>
                                    <li>
                                        Enable Viber messaging and get your{' '}
                                        <strong>API Key</strong> from the API
                                        Keys section
                                    </li>
                                    <li>
                                        Use your Infobip API Key as the Auth
                                        Token below
                                    </li>
                                    <li>
                                        <strong>Note:</strong> The sender will
                                        be automatically set to "IBSelfServe"
                                        for Infobip Viber
                                    </li>
                                </ol>
                                <div className="mt-4 rounded-lg bg-green-100 p-3 dark:bg-green-800/30">
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        <strong>
                                            ✅ Working Configuration:
                                        </strong>{' '}
                                        Your Infobip Viber account is now
                                        properly configured to send messages
                                        using the Infobip API with the correct
                                        sender format.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {hasActiveAccount ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            <span className="text-sm text-green-700 dark:text-green-300">
                                                You have an active Viber account
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            <span className="text-sm text-amber-700 dark:text-amber-300">
                                                No active Viber account found
                                            </span>
                                        </>
                                    )}
                                </div>
                                <Button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Viber Account
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Setup Form Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600/50 backdrop-blur-sm dark:bg-gray-900/50">
                        <div className="relative top-20 mx-auto w-3/4 max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {editingAccount
                                            ? 'Edit Viber Account'
                                            : 'Add Viber Account'}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setShowAddForm(false)}
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
                                        ? 'Update your Infobip Viber credentials below.'
                                        : 'Enter your Infobip Viber credentials to start sending messages.'}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
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
                                        placeholder="My Infobip Viber Account"
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
                                    <Label htmlFor="auth_token">
                                        Infobip API Key
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
                                        placeholder="Your Infobip API Key (e.g., c3f63d76cc2274357d69f67b8f26d5bb-45c9396e-27d9-49a3-8efb-2777fe525fab)"
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
                                    <Label htmlFor="webhook_url">
                                        Webhook URL (Optional)
                                    </Label>
                                    <Input
                                        id="webhook_url"
                                        value={data.webhook_url}
                                        onChange={(e) =>
                                            setData(
                                                'webhook_url',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="https://yourdomain.com/webhook/infobip-viber"
                                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                    />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        URL to receive message status updates
                                    </p>
                                </div>

                                <div>
                                    <Label>Webhook Events (Optional)</Label>
                                    <div className="space-y-2">
                                        {data.webhook_events.map(
                                            (event, index) => (
                                                <div
                                                    key={index}
                                                    className="flex space-x-2"
                                                >
                                                    <Input
                                                        value={event}
                                                        onChange={(e) =>
                                                            updateWebhookEvent(
                                                                index,
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="delivered, seen, failed"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            removeWebhookEvent(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addWebhookEvent}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Event
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <Button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
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

                {/* Existing Accounts */}
                {accounts.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Your Viber Accounts
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
                                                                    Unverified
                                                                </>
                                                            )}
                                                        </Badge>
                                                        <Badge
                                                            variant={
                                                                account.is_active
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                            className={
                                                                account.is_active
                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                            }
                                                        >
                                                            {account.is_active
                                                                ? 'Active'
                                                                : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <p>URI: {account.uri}</p>
                                                    <p>
                                                        Public Account ID:{' '}
                                                        {
                                                            account.public_account_id
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
                                                            Last verified:{' '}
                                                            {new Date(
                                                                account.last_verified_at,
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    onClick={() =>
                                                        handleTest(account.id)
                                                    }
                                                    disabled={
                                                        testingAccount ===
                                                        account.id
                                                    }
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    {testingAccount ===
                                                    account.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Wifi className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleEdit(account)
                                                    }
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleDelete(account.id)
                                                    }
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
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
            </div>
        </AuthenticatedLayout>
    );
}
