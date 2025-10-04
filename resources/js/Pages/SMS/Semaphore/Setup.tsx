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

interface SemaphoreAccount {
    id: number;
    account_name: string;
    api_key: string;
    sender_name: string;
    is_active: boolean;
    is_verified: boolean;
    last_verified_at?: string;
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
    accounts: SemaphoreAccount[];
    hasActiveAccount: boolean;
}

export default function Setup({ auth, accounts, hasActiveAccount }: Props) {
    const [showSetupForm, setShowSetupForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState<SemaphoreAccount | null>(
        null,
    );
    const [testingAccount, setTestingAccount] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        account_name: '',
        api_key: '',
        sender_name: '',
    });

    const openSetupForm = () => {
        setShowSetupForm(true);
        reset();
        setEditingAccount(null);
    };

    const closeSetupForm = () => {
        setShowSetupForm(false);
        setEditingAccount(null);
        reset();
    };

    const editAccount = (account: SemaphoreAccount) => {
        setEditingAccount(account);
        setData({
            account_name: account.account_name,
            api_key: account.api_key,
            sender_name: account.sender_name,
        });
        setShowSetupForm(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingAccount) {
            post(`/semaphore-accounts/${editingAccount.id}`, {
                onSuccess: () => {
                    toast.success('Semaphore account updated successfully!');
                    closeSetupForm();
                },
                onError: (errors) => {
                    toast.error('Failed to update Semaphore account');
                },
            });
        } else {
            post('/semaphore-accounts', {
                onSuccess: () => {
                    toast.success('Semaphore account connected successfully!');
                    closeSetupForm();
                },
                onError: (errors) => {
                    toast.error('Failed to connect Semaphore account');
                },
            });
        }
    };

    const deleteAccount = async (accountId: number) => {
        if (!confirm('Are you sure you want to delete this Semaphore account?')) {
            return;
        }

        try {
            await axios.delete(`/semaphore-accounts/${accountId}`);
            toast.success('Semaphore account deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete Semaphore account');
        }
    };

    const toggleActive = async (accountId: number) => {
        try {
            const response = await axios.post(`/semaphore-accounts/${accountId}/toggle`);
            if (response.data.success) {
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error('Failed to toggle account status');
        }
    };

    const testConnection = async (accountId: number) => {
        setTestingAccount(accountId);
        try {
            const response = await axios.post(`/semaphore-accounts/${accountId}/test`);
            if (response.data.success) {
                toast.success('Semaphore account connection test successful!');
                if (response.data.account_balance !== undefined) {
                    toast.info(
                        `Account balance: ${response.data.account_balance} ${response.data.currency}`,
                    );
                }
            } else {
                toast.error(response.data.error || 'Connection test failed');
            }
        } catch (error: any) {
            console.error('Test error:', error);
            toast.error(
                error.response?.data?.error || 'Failed to test Semaphore account',
            );
        } finally {
            setTestingAccount(null);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-900 dark:text-white">
                    Semaphore SMS Setup
                </h2>
            }
        >
            <Head title="Semaphore SMS Setup" />

            <div className="space-y-6">
                {/* Setup Instructions */}
                <Card className="border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                    <CardHeader>
                        <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Semaphore SMS Setup
                        </CardTitle>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                            Connect your Semaphore account to send SMS messages
                            through the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="rounded-lg bg-blue-100 p-4 dark:bg-blue-800/30">
                                <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                                    How to get your Semaphore SMS credentials:
                                </h4>
                                <ol className="list-inside list-decimal space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                    <li>
                                        Go to{' '}
                                        <a
                                            href="https://semaphore.co/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            Semaphore
                                        </a>{' '}
                                        and create an account
                                    </li>
                                    <li>
                                        Log in to your Semaphore dashboard
                                    </li>
                                    <li>
                                        Go to API Settings and get your API Key
                                    </li>
                                    <li>
                                        Set up your sender name (maximum 11 characters)
                                    </li>
                                    <li>
                                        Ensure you have sufficient credits for sending messages
                                    </li>
                                </ol>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {hasActiveAccount ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            <span className="text-sm text-green-700 dark:text-green-300">
                                                You have an active Semaphore
                                                account
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            <span className="text-sm text-amber-700 dark:text-amber-300">
                                                No active Semaphore account found
                                            </span>
                                        </>
                                    )}
                                </div>
                                <Button onClick={openSetupForm}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Account
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Existing Accounts */}
                {accounts.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Your Semaphore Accounts
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
                                                        Sender: {account.sender_name}
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
                                                    onClick={() => testConnection(account.id)}
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
                                                    onClick={() => editAccount(account)}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => toggleActive(account.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className={
                                                        account.is_active
                                                            ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20 dark:hover:text-amber-300'
                                                            : 'text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-300'
                                                    }
                                                >
                                                    {account.is_active ? 'Deactivate' : 'Activate'}
                                                </Button>
                                                <Button
                                                    onClick={() => deleteAccount(account.id)}
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

                {/* Setup Form Modal */}
                {showSetupForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>
                                    {editingAccount
                                        ? 'Edit Semaphore Account'
                                        : 'Connect Semaphore Account'}
                                </CardTitle>
                                <CardDescription>
                                    {editingAccount
                                        ? 'Update your Semaphore account details'
                                        : 'Enter your Semaphore account credentials'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submit} className="space-y-4">
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
                                            placeholder="My Semaphore Account"
                                            required
                                        />
                                        {errors.account_name && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.account_name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="api_key">
                                            API Key
                                        </Label>
                                        <Input
                                            id="api_key"
                                            type="password"
                                            value={data.api_key}
                                            onChange={(e) =>
                                                setData('api_key', e.target.value)
                                            }
                                            placeholder="Enter your Semaphore API key"
                                            required
                                        />
                                        {errors.api_key && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.api_key}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="sender_name">
                                            Sender Name
                                        </Label>
                                        <Input
                                            id="sender_name"
                                            value={data.sender_name}
                                            onChange={(e) =>
                                                setData(
                                                    'sender_name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="SENDER"
                                            maxLength={11}
                                            required
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Maximum 11 characters
                                        </p>
                                        {errors.sender_name && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {errors.sender_name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={closeSetupForm}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {editingAccount
                                                        ? 'Updating...'
                                                        : 'Connecting...'}
                                                </>
                                            ) : editingAccount ? (
                                                'Update Account'
                                            ) : (
                                                'Connect Account'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
