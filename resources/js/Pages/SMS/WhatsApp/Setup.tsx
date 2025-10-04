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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
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

interface WhatsAppAccount {
    id: number;
    account_name: string;
    provider: string;
    phone_number: string;
    display_name: string;
    is_active: boolean;
    is_verified: boolean;
    last_verified_at: string;
    available_templates?: any[];
    created_at: string;
}

interface Template {
    name: string;
    language: string;
    category: string;
    components: any[];
    status: string;
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
    accounts: WhatsAppAccount[];
    hasActiveAccount: boolean;
}

export default function Setup({ auth, accounts, hasActiveAccount }: Props) {
    const [showSetupForm, setShowSetupForm] = useState(false);
    const [editingAccount, setEditingAccount] =
        useState<WhatsAppAccount | null>(null);
    const [testingAccount, setTestingAccount] = useState<number | null>(null);
    const [showTemplateManager, setShowTemplateManager] = useState(false);
    const [selectedAccountForTemplates, setSelectedAccountForTemplates] = useState<number | null>(null);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        language: 'en',
        category: 'UTILITY',
        components: [
            {
                type: 'BODY',
                text: '',
                example: {
                    body_text: ['']
                }
            }
        ]
    });

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
        provider: 'facebook',
        access_token: '',
        infobip_api_key: '',
        phone_number_id: '',
        infobip_sender_number: '',
        business_account_id: '',
        webhook_verify_token: '',
    });

    const openSetupForm = (account?: WhatsAppAccount) => {
        if (account) {
            setEditingAccount(account);
            setData({
                account_name: account.account_name,
                provider: account.provider || 'facebook',
                access_token: '',
                infobip_api_key: '',
                phone_number_id: '',
                infobip_sender_number: '',
                business_account_id: '',
                webhook_verify_token: '',
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

        if (data.provider === 'facebook') {
            if (!data.access_token.trim()) {
                toast.error('Please enter your WhatsApp access token');
                return;
            }

            if (!data.phone_number_id.trim()) {
                toast.error('Please enter your phone number ID');
                return;
            }

            if (!data.business_account_id.trim()) {
                toast.error('Please enter your business account ID');
                return;
            }
        } else if (data.provider === 'infobip') {
            if (!data.infobip_api_key.trim()) {
                toast.error('Please enter your Infobip API key');
                return;
            }

            if (!data.infobip_sender_number.trim()) {
                toast.error('Please enter your Infobip sender number');
                return;
            }
        }

        try {
            if (editingAccount) {
                await put(`/whatsapp-accounts/${editingAccount.id}`, {
                    onSuccess: () => {
                        toast.success('WhatsApp account updated successfully!');
                        closeSetupForm();
                    },
                    onError: (errors) => {
                        console.error('Update error:', errors);
                        toast.error('Failed to update WhatsApp account');
                    },
                });
            } else {
                await post('/whatsapp-accounts', {
                    onSuccess: () => {
                        toast.success(
                            'WhatsApp account connected successfully!',
                        );
                        closeSetupForm();
                    },
                    onError: (errors) => {
                        console.error('Create error:', errors);
                        toast.error('Failed to connect WhatsApp account');
                    },
                });
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('An error occurred while saving the account');
        }
    };

    const deleteAccount = async (accountId: number) => {
        if (
            !confirm(
                'Are you sure you want to deactivate this WhatsApp account?',
            )
        ) {
            return;
        }

        try {
            await destroy(`/whatsapp-accounts/${accountId}`, {
                onSuccess: () => {
                    toast.success('WhatsApp account deactivated successfully!');
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                    toast.error('Failed to deactivate WhatsApp account');
                },
            });
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('An error occurred while deactivating the account');
        }
    };

    const testAccount = async (accountId: number) => {
        setTestingAccount(accountId);
        try {
            const response = await axios.post(
                `/whatsapp-accounts/${accountId}/test`,
            );
            if (response.data.success) {
                toast.success('WhatsApp account connection test successful!');
            } else {
                toast.error('Connection test failed');
            }
        } catch (error: any) {
            console.error('Test error:', error);
            toast.error(
                error.response?.data?.error ||
                    'Failed to test WhatsApp account',
            );
        } finally {
            setTestingAccount(null);
        }
    };

    // Template Management Functions
    const openTemplateManager = (accountId: number) => {
        setSelectedAccountForTemplates(accountId);
        setShowTemplateManager(true);
    };

    const closeTemplateManager = () => {
        setShowTemplateManager(false);
        setSelectedAccountForTemplates(null);
        setNewTemplate({
            name: '',
            language: 'en',
            category: 'UTILITY',
            components: [
                {
                    type: 'BODY',
                    text: '',
                    example: {
                        body_text: ['']
                    }
                }
            ]
        });
    };

    const createTemplate = async () => {
        if (!newTemplate.name.trim() || !newTemplate.components[0].text.trim()) {
            toast.error('Please fill in template name and body text');
            return;
        }

        try {
            const response = await axios.post('/whatsapp-accounts/templates', {
                account_id: selectedAccountForTemplates,
                template: newTemplate
            });

            if (response.data.success) {
                toast.success('Template created successfully!');
                closeTemplateManager();
                // Refresh accounts data
                window.location.reload();
            } else {
                toast.error(response.data.message || 'Failed to create template');
            }
        } catch (error: any) {
            console.error('Template creation error:', error);
            toast.error(error.response?.data?.message || 'Failed to create template');
        }
    };

    const deleteTemplate = async (accountId: number, templateName: string) => {
        if (!confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
            return;
        }

        try {
            const response = await axios.delete('/whatsapp-accounts/templates', {
                data: {
                    account_id: accountId,
                    template_name: templateName
                }
            });

            if (response.data.success) {
                toast.success('Template deleted successfully!');
                // Refresh accounts data
                window.location.reload();
            } else {
                toast.error(response.data.message || 'Failed to delete template');
            }
        } catch (error: any) {
            console.error('Template deletion error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete template');
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-900 dark:text-white">
                    WhatsApp Account Setup
                </h2>
            }
        >
            <Head title="WhatsApp Account Setup" />

            <div className="space-y-6">
                {/* Setup Instructions */}
                <Card className="border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                    <CardHeader>
                        <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
                            <MessageSquare className="mr-2 h-5 w-5" />
                            WhatsApp Business API Setup
                        </CardTitle>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                            Connect your WhatsApp account to send messages through the platform. 
                            Choose between Facebook WhatsApp Business API or Infobip WhatsApp API.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="rounded-lg bg-blue-100 p-4 dark:bg-blue-800/30">
                                <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                                    WhatsApp Provider Options:
                                </h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
                                        <h5 className="font-semibold text-blue-900 dark:text-blue-100">Facebook WhatsApp Business API</h5>
                                        <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-blue-800 dark:text-blue-200">
                                            <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">Facebook Developers</a></li>
                                            <li>Create a new app or use existing one</li>
                                            <li>Add WhatsApp Business API to your app</li>
                                            <li>Get Access Token, Phone Number ID, and Business Account ID</li>
                                        </ol>
                                    </div>
                                    <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
                                        <h5 className="font-semibold text-blue-900 dark:text-blue-100">Infobip WhatsApp API</h5>
                                        <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-blue-800 dark:text-blue-200">
                                            <li>Sign up at <a href="https://portal.infobip.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">Infobip Portal</a></li>
                                            <li>Navigate to Channels &gt; WhatsApp</li>
                                            <li>Get your API Key and Sender Number</li>
                                            <li>Use template messages for better deliverability</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {hasActiveAccount ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            <span className="text-sm text-green-700 dark:text-green-300">
                                                You have an active WhatsApp
                                                account
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            <span className="text-sm text-amber-700 dark:text-amber-300">
                                                No active WhatsApp account found
                                            </span>
                                        </>
                                    )}
                                </div>
                                <Button
                                    onClick={() => openSetupForm()}
                                    className="bg-green-600 text-white hover:bg-green-700"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add WhatsApp Account
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Existing Accounts */}
                {accounts.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Your WhatsApp Accounts
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
                                                    <Badge variant="outline" className="text-xs">
                                                        {account.provider === 'infobip' ? 'Infobip' : 'Facebook'}
                                                    </Badge>
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
                                                    {account.phone_number && (
                                                        <p>
                                                            Phone:{' '}
                                                            {
                                                                account.phone_number
                                                            }
                                                        </p>
                                                    )}
                                                    {account.display_name && (
                                                        <p>
                                                            Display Name:{' '}
                                                            {
                                                                account.display_name
                                                            }
                                                        </p>
                                                    )}
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
                                                        openSetupForm(account)
                                                    }
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                                {account.provider === 'infobip' && (
                                                    <Button
                                                        onClick={() =>
                                                            openTemplateManager(account.id)
                                                        }
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                                                    >
                                                        <MessageSquare className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() =>
                                                        deleteAccount(
                                                            account.id,
                                                        )
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

                {/* Setup Form Modal */}
                {showSetupForm && (
                    <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600/50 backdrop-blur-sm dark:bg-gray-900/50">
                        <div className="relative top-20 mx-auto w-3/4 max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                                        <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {editingAccount
                                            ? 'Edit WhatsApp Account'
                                            : 'Add WhatsApp Account'}
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
                                        ? 'Update your WhatsApp credentials below.'
                                        : 'Choose your WhatsApp provider and enter credentials to start sending messages.'}
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
                                        placeholder="My WhatsApp Business"
                                        className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        required
                                    />
                                    {errors.account_name && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.account_name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="provider">
                                        WhatsApp Provider
                                    </Label>
                                    <Select
                                        value={data.provider}
                                        onValueChange={(value) => setData('provider', value)}
                                    >
                                        <SelectTrigger className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                                            <SelectValue placeholder="Select provider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="facebook">Facebook WhatsApp Business API</SelectItem>
                                            <SelectItem value="infobip">Infobip WhatsApp API</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.provider && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.provider}
                                        </p>
                                    )}
                                </div>

                                {data.provider === 'facebook' && (
                                    <>
                                        <div>
                                            <Label htmlFor="access_token">
                                                Access Token
                                            </Label>
                                            <Textarea
                                                id="access_token"
                                                value={data.access_token}
                                                onChange={(e) =>
                                                    setData(
                                                        'access_token',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter your WhatsApp Business API access token"
                                                className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                rows={3}
                                                required
                                            />
                                            {errors.access_token && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.access_token}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {data.provider === 'infobip' && (
                                    <>
                                        <div>
                                            <Label htmlFor="infobip_api_key">
                                                Infobip API Key
                                            </Label>
                                            <Input
                                                id="infobip_api_key"
                                                value={data.infobip_api_key}
                                                onChange={(e) =>
                                                    setData(
                                                        'infobip_api_key',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Your Infobip API Key (e.g., c3f63d76cc2274357d69f67b8f26d5bb-45c9396e-27d9-49a3-8efb-2777fe525fab)"
                                                className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                required
                                            />
                                            {errors.infobip_api_key && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.infobip_api_key}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="infobip_sender_number">
                                                Sender Phone Number
                                            </Label>
                                            <Input
                                                id="infobip_sender_number"
                                                value={data.infobip_sender_number}
                                                onChange={(e) =>
                                                    setData(
                                                        'infobip_sender_number',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="447860088970"
                                                className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                required
                                            />
                                            {errors.infobip_sender_number && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.infobip_sender_number}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {data.provider === 'facebook' && (
                                    <>
                                        <div>
                                            <Label htmlFor="phone_number_id">
                                                Phone Number ID
                                            </Label>
                                            <Input
                                                id="phone_number_id"
                                                value={data.phone_number_id}
                                                onChange={(e) =>
                                                    setData(
                                                        'phone_number_id',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="123456789012345"
                                                className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                required
                                            />
                                            {errors.phone_number_id && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.phone_number_id}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="business_account_id">
                                                Business Account ID
                                            </Label>
                                            <Input
                                                id="business_account_id"
                                                value={data.business_account_id}
                                                onChange={(e) =>
                                                    setData(
                                                        'business_account_id',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="123456789012345"
                                                className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                required
                                            />
                                            {errors.business_account_id && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {errors.business_account_id}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div>
                                    <Label htmlFor="webhook_verify_token">
                                        Webhook Verify Token (Optional)
                                    </Label>
                                    <Input
                                        id="webhook_verify_token"
                                        value={data.webhook_verify_token}
                                        onChange={(e) =>
                                            setData(
                                                'webhook_verify_token',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Your webhook verification token"
                                        className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                    />
                                    {errors.webhook_verify_token && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {errors.webhook_verify_token}
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
                                        className="bg-green-600 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
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

                {/* Template Management Modal */}
                {showTemplateManager && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Manage Templates
                                    </h3>
                                </div>
                                <button
                                    onClick={closeTemplateManager}
                                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Current Templates */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        Current Templates
                                    </h4>
                                    {(() => {
                                        const account = accounts.find(acc => acc.id === selectedAccountForTemplates);
                                        const templates = account?.available_templates || [];
                                        
                                        if (templates.length === 0) {
                                            return (
                                                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        No custom templates available. Create your first template below.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="space-y-2">
                                                {templates.map((template: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-gray-100">{template.name}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {template.language} • {template.category}
                                                            </p>
                                                            {template.components && template.components[0] && template.components[0].text && (
                                                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">
                                                                    "{template.components[0].text}"
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Button
                                                            onClick={() => deleteTemplate(selectedAccountForTemplates!, template.name)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Create New Template */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        Create New Template
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="template_name">Template Name</Label>
                                                <Input
                                                    id="template_name"
                                                    value={newTemplate.name}
                                                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                                                    placeholder="e.g., appointment_reminder"
                                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="template_language">Language</Label>
                                                <Select
                                                    value={newTemplate.language}
                                                    onValueChange={(value) => setNewTemplate({...newTemplate, language: value})}
                                                >
                                                    <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="en">English</SelectItem>
                                                        <SelectItem value="es">Spanish</SelectItem>
                                                        <SelectItem value="fr">French</SelectItem>
                                                        <SelectItem value="de">German</SelectItem>
                                                        <SelectItem value="it">Italian</SelectItem>
                                                        <SelectItem value="pt">Portuguese</SelectItem>
                                                        <SelectItem value="ru">Russian</SelectItem>
                                                        <SelectItem value="ja">Japanese</SelectItem>
                                                        <SelectItem value="ko">Korean</SelectItem>
                                                        <SelectItem value="zh">Chinese</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="template_category">Category</Label>
                                            <Select
                                                value={newTemplate.category}
                                                onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}
                                            >
                                                <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="UTILITY">Utility</SelectItem>
                                                    <SelectItem value="MARKETING">Marketing</SelectItem>
                                                    <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="template_body">Message Body</Label>
                                            <Textarea
                                                id="template_body"
                                                value={newTemplate.components[0].text}
                                                onChange={(e) => setNewTemplate({
                                                    ...newTemplate,
                                                    components: [{
                                                        ...newTemplate.components[0],
                                                        text: e.target.value
                                                    }]
                                                })}
                                                placeholder="Enter your template message. Use {{1}}, {{2}}, etc. for variables."
                                                className="min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                            />
                                            <div className="space-y-2 mt-2">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Use placeholders like {'{{1}}'}, {'{{2}}'} for dynamic content
                                                </p>
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Example:</p>
                                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                                        "Hello {'{{1}}'}, your appointment with Dr. {'{{2}}'} is scheduled for {'{{3}}'} at {'{{4}}'}."
                                                    </p>
                                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                        This will create 4 input fields: Name, Doctor, Date, Time
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3 pt-4">
                                            <Button
                                                onClick={closeTemplateManager}
                                                variant="outline"
                                                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={createTemplate}
                                                className="bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                <MessageSquare className="mr-2 h-4 w-4" />
                                                Create Template
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
