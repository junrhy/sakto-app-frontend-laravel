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
                            Viber Public Account Setup
                        </CardTitle>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                            Connect your Viber Public Account to send messages
                            to your customers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="rounded-lg bg-blue-100 p-4 dark:bg-blue-800/30">
                                <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                                    How to get your Viber Public Account credentials:
                                </h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                    <li>
                                        Create a Viber Public Account at{' '}
                                        <a
                                            href="https://partners.viber.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            partners.viber.com
                                        </a>
                                    </li>
                                    <li>
                                        Complete the verification process for your business
                                    </li>
                                    <li>
                                        Get your Auth Token from the Viber Partners dashboard
                                    </li>
                                    <li>
                                        Configure webhook URL to receive message status updates
                                    </li>
                                </ol>
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
                                <Button onClick={() => setShowAddForm(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Account
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>


                {/* Add/Edit Account Form */}
                {showAddForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {editingAccount
                                    ? 'Edit Viber Account'
                                    : 'Add New Viber Account'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                        placeholder="My Viber Business Account"
                                        required
                                    />
                                    {errors.account_name && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.account_name}
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
                                        placeholder="Your Viber Public Account Auth Token"
                                        required
                                    />
                                    {errors.auth_token && (
                                        <p className="mt-1 text-sm text-red-500">
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
                                        placeholder="https://yourdomain.com/webhook/viber"
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

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setEditingAccount(null);
                                            reset();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {editingAccount
                                                    ? 'Updating...'
                                                    : 'Creating...'}
                                            </>
                                        ) : editingAccount ? (
                                            'Update Account'
                                        ) : (
                                            'Create Account'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
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
                                                            {account.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <p>
                                                        URI: {account.uri}
                                                    </p>
                                                    <p>
                                                        Public Account ID: {account.public_account_id}
                                                    </p>
                                                    <p>
                                                        Created: {new Date(account.created_at).toLocaleDateString()}
                                                    </p>
                                                    {account.last_verified_at && (
                                                        <p>
                                                            Last verified: {new Date(account.last_verified_at).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    onClick={() => handleTest(account.id)}
                                                    disabled={testingAccount === account.id}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    {testingAccount === account.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Wifi className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() => handleEdit(account)}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(account.id)}
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
