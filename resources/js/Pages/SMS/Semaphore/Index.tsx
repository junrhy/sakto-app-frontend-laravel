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
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Project, User } from '@/types/index';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Message {
    id: string;
    to: string;
    body: string;
    status: string;
    created_at: string;
}

interface Contact {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    sms_number?: string;
    group?: string[];
}

interface Stats {
    sent: number;
    delivered: number;
    failed: number;
}

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
    messages: Message[];
    stats: Stats;
    accounts: SemaphoreAccount[];
    hasActiveAccount: boolean;
}

export default function Index({ auth, messages, stats, accounts, hasActiveAccount }: Props) {
    const [credits, setCredits] = useState<number>(auth.user.credits ?? 0);
    const [isLoadingPricing, setIsLoadingPricing] = useState(false);
    const [pricing, setPricing] = useState<any>(null);

    // Debug logging
    console.log('Semaphore Index Props:', { accounts, hasActiveAccount, accountsCount: accounts?.length });

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - check their roles
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    const { data, setData, post, processing, errors, reset } = useForm({
        to: '',
        message: '',
    });


    const [recipients, setRecipients] = useState<string[]>([]);
    const [newRecipient, setNewRecipient] = useState<string>('');
    const [showContactSelector, setShowContactSelector] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState<string>('all');
    const [selectedAccount, setSelectedAccount] = useState<number | null>(
        accounts.length > 0 ? accounts[0].id : null,
    );

    const addRecipient = () => {
        if (!newRecipient.trim()) {
            toast.error('Please enter a phone number');
            return;
        }

        const philippinePhoneRegex = /^(\+63|0)?9\d{9}$/;
        if (!philippinePhoneRegex.test(newRecipient.trim())) {
            toast.error(
                'Please enter a valid Philippine phone number (e.g., +639123456789 or 09123456789)',
            );
            return;
        }

        if (recipients.includes(newRecipient.trim())) {
            toast.error('This phone number is already added');
            return;
        }

        setRecipients([...recipients, newRecipient.trim()]);
        setNewRecipient('');
        toast.success('Phone number added successfully');
    };

    const removeRecipient = (index: number) => {
        setRecipients(recipients.filter((_, i) => i !== index));
    };

    // Load contacts on component mount
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await axios.get('/contacts/list');
                if (response.data.success) {
                    setContacts(response.data.data || []);
                } else {
                    toast.error('Failed to fetch contacts');
                }
            } catch (error) {
                toast.error('Failed to fetch contacts');
            }
        };

        fetchContacts();
        fetchCredits();
    }, []);

    const toggleContactSelection = (contact: Contact) => {
        setSelectedContacts((prev) => {
            const isSelected = prev.some((c) => c.id === contact.id);
            if (isSelected) {
                return prev.filter((c) => c.id !== contact.id);
            } else {
                return [...prev, contact];
            }
        });
    };

    const addSelectedContactsToRecipients = () => {
        const phoneNumbers = selectedContacts
            .filter((contact) => contact.sms_number)
            .map((contact) => contact.sms_number!);

        if (phoneNumbers.length === 0) {
            toast.error('Selected contacts do not have phone numbers');
            return;
        }

        // Validate Philippine phone numbers before adding
        const philippinePhoneRegex = /^(\+63|0)?9\d{9}$/;
        const validNumbers = phoneNumbers.filter((num) =>
            philippinePhoneRegex.test(num),
        );

        if (validNumbers.length === 0) {
            toast.error(
                'Selected contacts do not have valid Philippine phone numbers',
            );
            return;
        }

        // Add only new numbers (avoid duplicates)
        const newRecipients = validNumbers.filter(
            (num) => !recipients.includes(num),
        );
        setRecipients([...recipients, ...newRecipients]);
        setSelectedContacts([]);
        setShowContactSelector(false);
        toast.success(
            `${newRecipients.length} Philippine phone numbers added from contacts`,
        );
    };

    const addAllContactsToRecipients = () => {
        const phoneNumbers = contacts
            .filter((contact) => contact.sms_number)
            .map((contact) => contact.sms_number!);

        if (phoneNumbers.length === 0) {
            toast.error('No contacts have phone numbers');
            return;
        }

        // Validate Philippine phone numbers before adding
        const philippinePhoneRegex = /^(\+63|0)?9\d{9}$/;
        const validNumbers = phoneNumbers.filter((num) =>
            philippinePhoneRegex.test(num),
        );

        if (validNumbers.length === 0) {
            toast.error('No contacts have valid Philippine phone numbers');
            return;
        }

        // Add only new numbers (avoid duplicates)
        const newRecipients = validNumbers.filter(
            (num) => !recipients.includes(num),
        );
        setRecipients([...recipients, ...newRecipients]);
        setShowContactSelector(false);
        toast.success(
            `${newRecipients.length} Philippine phone numbers added from contacts`,
        );
    };

    const selectContactsByGroup = (group: string) => {
        if (group === 'all') {
            const validContacts = contacts.filter(
                (contact) =>
                    contact.sms_number &&
                    /^(\+63|0)?9\d{9}$/.test(contact.sms_number),
            );
            setSelectedContacts(validContacts);
            toast.success(
                `${validContacts.length} contacts with valid Philippine numbers selected`,
            );
        } else {
            const groupContacts = contacts.filter(
                (contact) =>
                    contact.group?.includes(group) &&
                    contact.sms_number &&
                    /^(\+63|0)?9\d{9}$/.test(contact.sms_number),
            );
            setSelectedContacts(groupContacts);
            toast.success(
                `${groupContacts.length} contacts from group "${group}" with valid Philippine numbers selected`,
            );
        }
    };

    const filteredContacts = contacts.filter((contact) => {
        const matchesSearch =
            contact.first_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            contact.last_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (contact.sms_number || '').includes(searchQuery) ||
            (contact.group || []).some((g) =>
                g.toLowerCase().includes(searchQuery.toLowerCase()),
            );

        const matchesGroup =
            groupFilter === 'all' ||
            (contact.group && contact.group.includes(groupFilter));

        return matchesSearch && matchesGroup;
    });

    const getPricing = async () => {
        setIsLoadingPricing(true);
        try {
            const response = await fetch('/sms-semaphore/pricing');
            const data = await response.json();
            if (data.error) {
                toast.error('Failed to fetch pricing: ' + data.error);
            } else {
                setPricing(data);
            }
        } catch (error) {
            toast.error('Failed to fetch pricing');
        } finally {
            setIsLoadingPricing(false);
        }
    };

    const fetchCredits = async () => {
        try {
            if (auth.user.identifier) {
                const response = await fetch(
                    `/credits/${auth.user.identifier}/balance`,
                );
                if (response.ok) {
                    const data = await response.json();
                    setCredits(data.available_credit || 0);
                }
            }
        } catch (error) {
            console.error('Error fetching credits:', error);
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (recipients.length === 0) {
            toast.error('Please add at least one phone number');
            return;
        }

        if (!data.message || !data.message.trim()) {
            toast.error('Message is required');
            return;
        }

        try {
            // Calculate total credits needed (2 credits per recipient)
            const totalCredits = recipients.length * 2;

            // First, try to spend credits
            const creditResponse = await axios.post('/credits/spend', {
                amount: totalCredits,
                purpose: 'Philippine SMS Sending',
                reference_id: `sms_semaphore_${Date.now()}`,
            });

            if (!creditResponse.data.success) {
                toast.error(
                    'Insufficient credits to send SMS. Please purchase more credits.',
                );
                return;
            }

            post('/sms-semaphore/send', {
                data: {
                    ...data,
                    to: recipients.join(','),
                    account_id: selectedAccount,
                },
                onSuccess: () => {
                    toast.success('Message sent successfully!');
                    reset();
                    setRecipients([]);
                    setNewRecipient('');
                },
                onError: (errors) => {
                    toast.error('Failed to send message');
                },
            });
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Failed to send message',
            );
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'bg-green-500';
            case 'failed':
                return 'bg-red-500';
            case 'sent':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <AuthenticatedLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Philippine SMS
                </h2>
            }
        >
            <Head title="Philippine SMS" />

            <div className="space-y-6">
                {/* Account Setup Status */}
                {!hasActiveAccount && (
                    <Card className="border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    <div>
                                        <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                                            Semaphore Account Setup Required
                                        </h3>
                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            Connect your Semaphore account to start sending Philippine SMS messages
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() =>
                                        (window.location.href =
                                            '/semaphore-accounts?app=sms')
                                    }
                                    className="bg-amber-600 text-white hover:bg-amber-700"
                                >
                                    Set Up Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Account Selection */}
                {accounts.length > 0 && (
                    <Card className="border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        Select Account
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Choose which account to use for sending messages
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={selectedAccount || ''}
                                        onChange={(e) =>
                                            setSelectedAccount(
                                                Number(e.target.value),
                                            )
                                        }
                                        className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    >
                                        {accounts.length === 0 ? (
                                            <option value="">No accounts available</option>
                                        ) : (
                                            accounts.map((account) => (
                                                <option
                                                    key={account.id}
                                                    value={account.id}
                                                >
                                                    {account.account_name} ({account.sender_name})
                                                    {!account.is_verified && ' - Not Verified'}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    <Button
                                        onClick={() =>
                                            (window.location.href =
                                                '/semaphore-accounts?app=sms')
                                        }
                                        variant="outline"
                                        className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                                    >
                                        Manage Accounts
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Total Sent Card */}
                        <Card className="relative overflow-hidden border border-gray-200 bg-slate-50 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-slate-800/50">
                            <CardContent className="relative bg-slate-50 p-6 dark:bg-slate-800/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Total Sent
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                            {stats.sent}
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                            All messages sent
                                        </p>
                                    </div>
                                    <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                        <svg
                                            className="h-6 w-6 text-blue-600 dark:text-blue-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivered Card */}
                        <Card className="relative overflow-hidden border border-gray-200 bg-slate-50 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-slate-800/50">
                            <CardContent className="relative bg-slate-50 p-6 dark:bg-slate-800/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Delivered
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                            {stats.delivered}
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-400">
                                            {stats.sent > 0
                                                ? `${Math.round((stats.delivered / stats.sent) * 100)}% success rate`
                                                : '0% success rate'}
                                        </p>
                                    </div>
                                    <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                                        <svg
                                            className="h-6 w-6 text-green-600 dark:text-green-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Failed Card */}
                        <Card className="relative overflow-hidden border border-gray-200 bg-slate-50 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-slate-800/50">
                            <CardContent className="relative bg-slate-50 p-6 dark:bg-slate-800/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Failed
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                            {stats.failed}
                                        </p>
                                        <p className="text-xs text-red-600 dark:text-red-400">
                                            {stats.sent > 0
                                                ? `${Math.round((stats.failed / stats.sent) * 100)}% failure rate`
                                                : '0% failure rate'}
                                        </p>
                                    </div>
                                    <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                                        <svg
                                            className="h-6 w-6 text-red-600 dark:text-red-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Credits Card */}
                        <Card className="relative overflow-hidden border border-gray-200 bg-slate-50 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-slate-800/50">
                            <CardContent className="relative bg-slate-50 p-6 dark:bg-slate-800/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Available Credits
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                            {credits.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                            Credits available
                                        </p>
                                    </div>
                                    <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                        <svg
                                            className="h-6 w-6 text-blue-600 dark:text-blue-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Send Message Form */}
                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                                <CardHeader className="border-b border-gray-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-800">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Send Message
                                    </CardTitle>
                                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                        Send SMS messages (Max 160 characters)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 bg-slate-50 p-6 dark:bg-slate-800/50">
                                    <form
                                        onSubmit={submit}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="newRecipient"
                                                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                                >
                                                    Add Philippine Phone Number
                                                </label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="newRecipient"
                                                        type="text"
                                                        value={newRecipient}
                                                        onChange={(e) =>
                                                            setNewRecipient(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="+639123456789"
                                                        className="flex-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                        onKeyPress={(e) => {
                                                            if (
                                                                e.key ===
                                                                'Enter'
                                                            ) {
                                                                e.preventDefault();
                                                                addRecipient();
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={addRecipient}
                                                        className="bg-indigo-600 text-white hover:bg-indigo-700"
                                                    >
                                                        Add
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowContactSelector(
                                                                true,
                                                            )
                                                        }
                                                        className="bg-green-600 text-white hover:bg-green-700"
                                                    >
                                                        Select from Contacts
                                                    </Button>
                                                </div>
                                            </div>

                                            {recipients.length > 0 && (
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        Recipients (
                                                        {recipients.length})
                                                    </label>
                                                    <div className="max-h-32 space-y-2 overflow-y-auto">
                                                        {recipients.map(
                                                            (
                                                                recipient,
                                                                index,
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700"
                                                                >
                                                                    <span className="text-sm text-gray-900 dark:text-gray-100">
                                                                        {
                                                                            recipient
                                                                        }
                                                                    </span>
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeRecipient(
                                                                                index,
                                                                            )
                                                                        }
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {errors.to && (
                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                    {errors.to}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label
                                                htmlFor="message"
                                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                            >
                                                Message
                                            </label>
                                            <div className="space-y-2">
                                                <Textarea
                                                    id="message"
                                                    value={data.message}
                                                    onChange={(e) =>
                                                        setData(
                                                            'message',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Type your message here..."
                                                    className="min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                    maxLength={160}
                                                />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {data.message.length}/160
                                                    characters
                                                </p>
                                            </div>
                                            {errors.message && (
                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                    {errors.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <svg
                                                        className="mr-2 h-5 w-5 text-yellow-500"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Sending this SMS will cost{' '}
                                                    {recipients.length > 0
                                                        ? recipients.length * 2
                                                        : 2}{' '}
                                                    credits per recipient from
                                                    your balance
                                                </div>
                                                {recipients.length > 0 &&
                                                    credits <
                                                        recipients.length *
                                                            2 && (
                                                        <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                                                            <svg
                                                                className="mr-2 h-4 w-4"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                            Insufficient
                                                            credits. You need{' '}
                                                            {recipients.length *
                                                                2}{' '}
                                                            credits but only
                                                            have {credits}.
                                                        </div>
                                                    )}
                                            </div>
                                            {canEdit && (
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        processing ||
                                                        recipients.length ===
                                                            0 ||
                                                        credits <
                                                            recipients.length *
                                                                2
                                                    }
                                                    className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <Loader2 className="-ml-1 mr-3 h-5 w-5 animate-spin text-white" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg
                                                                className="mr-2 h-5 w-5"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                                />
                                                            </svg>
                                                            Send Message
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Message History */}
                    <Card className="mt-8 overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                        <CardHeader className="border-b border-gray-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-800">
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Message History
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                Recent messages sent through Philippine SMS
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-slate-50 p-6 dark:bg-slate-800/50">
                            <div className="space-y-4">
                                {messages.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No messages sent yet
                                    </p>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-700"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        {message.to}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {message.body}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className={`${getStatusColor(
                                                        message.status,
                                                    )} text-white`}
                                                >
                                                    {message.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(
                                                    message.created_at,
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            {/* Contact Selector Modal */}
            {showContactSelector && (
                <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
                    <div className="relative top-20 mx-auto w-3/4 rounded-md border bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Select Contacts
                            </h3>
                            <button
                                onClick={() => setShowContactSelector(false)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
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

                        <div className="mb-4 space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search contacts..."
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <div>
                                    <select
                                        value={groupFilter}
                                        onChange={(e) =>
                                            setGroupFilter(e.target.value)
                                        }
                                        className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                    >
                                        <option value="all">All Groups</option>
                                        {Array.from(
                                            new Set(
                                                contacts.flatMap(
                                                    (contact) =>
                                                        contact.group || [],
                                                ),
                                            ),
                                        ).map((group) => (
                                            <option key={group} value={group}>
                                                {group}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() =>
                                        selectContactsByGroup(groupFilter)
                                    }
                                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Select Group
                                </button>
                            </div>
                        </div>

                        <div className="mb-4 flex justify-between">
                            <button
                                onClick={addSelectedContactsToRecipients}
                                disabled={selectedContacts.length === 0}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Add Selected ({selectedContacts.length})
                            </button>
                            <button
                                onClick={addAllContactsToRecipients}
                                disabled={
                                    filteredContacts.filter(
                                        (contact) =>
                                            contact.sms_number &&
                                            /^(\+63|0)?9\d{9}$/.test(
                                                contact.sms_number,
                                            ),
                                    ).length === 0
                                }
                                className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Add All (
                                {
                                    filteredContacts.filter(
                                        (contact) =>
                                            contact.sms_number &&
                                            /^(\+63|0)?9\d{9}$/.test(
                                                contact.sms_number,
                                            ),
                                    ).length
                                }
                                )
                            </button>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Select
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Phone Number
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {filteredContacts.map((contact) => {
                                        const hasValidPhilippineNumber =
                                            contact.sms_number &&
                                            /^(\+63|0)?9\d{9}$/.test(
                                                contact.sms_number,
                                            );

                                        return (
                                            <tr
                                                key={contact.id}
                                                className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                                    !hasValidPhilippineNumber
                                                        ? 'bg-gray-100 opacity-50 dark:bg-gray-600'
                                                        : ''
                                                }`}
                                            >
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedContacts.some(
                                                            (c) =>
                                                                c.id ===
                                                                contact.id,
                                                        )}
                                                        onChange={() =>
                                                            toggleContactSelection(
                                                                contact,
                                                            )
                                                        }
                                                        disabled={
                                                            !hasValidPhilippineNumber
                                                        }
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {contact.first_name}{' '}
                                                        {contact.last_name}
                                                    </div>
                                                    {contact.group &&
                                                        contact.group.length >
                                                            0 && (
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {contact.group.map(
                                                                    (
                                                                        group,
                                                                        index,
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                        >
                                                                            {
                                                                                group
                                                                            }
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                    {contact.sms_number ? (
                                                        hasValidPhilippineNumber ? (
                                                            <span className="text-green-600 dark:text-green-400">
                                                                {
                                                                    contact.sms_number
                                                                }
                                                            </span>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-red-600 dark:text-red-400">
                                                                    {
                                                                        contact.sms_number
                                                                    }
                                                                </span>
                                                                <span className="text-xs text-red-500 dark:text-red-400">
                                                                    (Not a valid
                                                                    Philippine
                                                                    number)
                                                                </span>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500">
                                                            No phone number
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
