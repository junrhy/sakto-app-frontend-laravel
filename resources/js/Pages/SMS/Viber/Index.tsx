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
import {
    AlertCircle,
    CreditCard,
    Loader2,
    MessageSquare,
    Send,
    Users,
} from 'lucide-react';
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
    contact_number?: string;
    viber?: string;
    group?: string[];
}

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
    messages: Message[];
    stats: {
        sent: number;
        delivered: number;
        failed: number;
    };
    accounts: ViberAccount[];
    hasActiveAccount: boolean;
}

export default function Index({
    auth,
    messages,
    stats,
    accounts,
    hasActiveAccount,
}: Props) {
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

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
    const [credits, setCredits] = useState<number>(auth.user.credits ?? 0);
    const [selectedAccount, setSelectedAccount] = useState<number | null>(
        accounts.length > 0 ? accounts[0].id : null,
    );

    // Viber number validation (international format or local format)
    const viberRegex = /^(\+[1-9]\d{1,14}|0\d{9,10})$/;

    const addRecipient = () => {
        if (!newRecipient.trim()) return;

        // Validate Viber number format
        if (!viberRegex.test(newRecipient.trim())) {
            toast.error(
                'Please enter a valid phone number (e.g., +1234567890 or 0123456789)',
            );
            return;
        }

        if (!recipients.includes(newRecipient.trim())) {
            setRecipients([...recipients, newRecipient.trim()]);
            setNewRecipient('');
        } else {
            toast.error('This number is already in the recipient list');
        }
    };

    const removeRecipient = (index: number) => {
        setRecipients(recipients.filter((_, i) => i !== index));
    };

    const addContactToRecipients = (contact: Contact) => {
        const viberNumber = contact.viber || contact.contact_number;
        if (
            viberNumber &&
            viberRegex.test(viberNumber) &&
            !recipients.includes(viberNumber)
        ) {
            setRecipients([...recipients, viberNumber]);
            toast.success('Contact added to recipients');
        } else if (!viberNumber) {
            toast.error('This contact has no Viber number');
        } else if (!viberRegex.test(viberNumber)) {
            toast.error('Invalid Viber number format');
        } else {
            toast.error('This number is already in the recipient list');
        }
    };

    const removeContactFromRecipients = (contact: Contact) => {
        const viberNumber = contact.viber || contact.contact_number;
        if (viberNumber) {
            setRecipients(recipients.filter((num) => num !== viberNumber));
        }
    };

    const addSelectedContactsToRecipients = () => {
        const validContacts = selectedContacts.filter((contact) => {
            const viberNumber = contact.viber || contact.contact_number;
            return viberNumber && viberRegex.test(viberNumber);
        });

        const newRecipients = validContacts.map(
            (contact) => contact.viber || contact.contact_number!,
        );
        const uniqueRecipients = [
            ...new Set([...recipients, ...newRecipients]),
        ];

        setRecipients(uniqueRecipients);
        setSelectedContacts([]);
        setShowContactSelector(false);

        toast.success(
            `${validContacts.length} Viber numbers added to recipients`,
        );
    };

    const addAllContactsToRecipients = () => {
        const validContacts = contacts.filter((contact) => {
            const viberNumber = contact.viber || contact.contact_number;
            return viberNumber && viberRegex.test(viberNumber);
        });

        const newRecipients = validContacts.map(
            (contact) => contact.viber || contact.contact_number!,
        );
        const uniqueRecipients = [
            ...new Set([...recipients, ...newRecipients]),
        ];

        setRecipients(uniqueRecipients);
        setShowContactSelector(false);

        toast.success(
            `${validContacts.length} Viber numbers added to recipients`,
        );
    };

    const selectContactsByGroup = (group: string) => {
        const groupContacts = contacts.filter((contact) => {
            const viberNumber = contact.viber || contact.contact_number;
            return (
                contact.group &&
                contact.group.includes(group) &&
                viberNumber &&
                viberRegex.test(viberNumber)
            );
        });

        setSelectedContacts(groupContacts);
    };

    const handleSendMessage = async () => {
        if (recipients.length === 0) {
            toast.error('Please add at least one recipient');
            return;
        }

        if (!data.message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (!selectedAccount) {
            toast.error('Please select a Viber account');
            return;
        }

        try {
            const response = await axios.post(route('viber-sms.send'), {
                to: recipients,
                message: data.message,
                account_id: selectedAccount,
            });

            if (response.data.success) {
                toast.success('Viber messages sent successfully!');
                setData('message', '');
                setRecipients([]);
            } else {
                toast.error('Failed to send messages');
            }
        } catch (error) {
            console.error('Send message error:', error);
            toast.error('Failed to send messages');
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await axios.get('/contacts/list');
            setContacts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to load contacts');
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const filteredContacts = contacts.filter((contact) => {
        const viberNumber = contact.viber || contact.contact_number;
        const matchesSearch =
            contact.first_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            contact.last_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (viberNumber && viberNumber.includes(searchQuery)) ||
            contact.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGroup =
            groupFilter === 'all' ||
            (contact.group && contact.group.includes(groupFilter));

        return matchesSearch && matchesGroup;
    });

    const uniqueGroups = Array.from(
        new Set(contacts.flatMap((contact) => contact.group || [])),
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-900 dark:text-white">
                    Viber Messaging
                </h2>
            }
        >
            <Head title="Viber Messaging" />

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
                                            Viber Account Not Set Up
                                        </h3>
                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            You need to connect your Viber
                                            Public Account to send messages.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() =>
                                        (window.location.href =
                                            '/viber-accounts?app=sms')
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
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <MessageSquare className="h-5 w-5" />
                                <span>Select Viber Account</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {accounts.map((account) => (
                                    <div
                                        key={account.id}
                                        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                                            selectedAccount === account.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                                        }`}
                                        onClick={() =>
                                            setSelectedAccount(account.id)
                                        }
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {account.account_name}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {account.uri}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge
                                                    variant={
                                                        account.is_verified
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {account.is_verified
                                                        ? 'Verified'
                                                        : 'Unverified'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Section */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                                        Viber messages sent
                                    </p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                    <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                                        Successfully delivered
                                    </p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                                    <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                                        Failed to deliver
                                    </p>
                                </div>
                                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                                    <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                                    <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                                    Send Viber Message
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                    Send Viber messages to multiple recipients
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 bg-slate-50 p-6 dark:bg-slate-800/50">
                                {/* Recipients Section */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="newRecipient"
                                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                        >
                                            Add Viber Number
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
                                                placeholder="Enter Viber number (e.g., +639260049848 or 09260049848)"
                                                className="flex-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
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
                                                    setShowContactSelector(true)
                                                }
                                                className="bg-green-600 text-white hover:bg-green-700"
                                            >
                                                Select from Contacts
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Recipients List */}
                                    {recipients.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Recipients ({recipients.length})
                                            </label>
                                            {recipients.map(
                                                (recipient, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
                                                    >
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {recipient}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                removeRecipient(
                                                                    index,
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Message Input */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Message
                                    </label>
                                    <Textarea
                                        placeholder="Enter your message here..."
                                        value={data.message}
                                        onChange={(e) =>
                                            setData('message', e.target.value)
                                        }
                                        rows={4}
                                        className="resize-none border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>
                                            {data.message.length}/1000
                                            characters
                                        </span>
                                        <span>Credits: {credits}</span>
                                    </div>
                                </div>

                                {/* Send Button */}
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={
                                            processing ||
                                            recipients.length === 0 ||
                                            !data.message.trim() ||
                                            !selectedAccount
                                        }
                                        className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send Messages (
                                                {recipients.length})
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Message History */}
                <div className="mt-8">
                    <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                        <CardHeader className="border-b border-gray-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-800">
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Message History
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                Recent Viber messages sent
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-slate-50 p-6 dark:bg-slate-800/50">
                            {messages.length === 0 ? (
                                <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    No Viber messages sent yet
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-700"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        To: {message.to}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {message.body}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge
                                                        variant={
                                                            message.status ===
                                                            'delivered'
                                                                ? 'default'
                                                                : message.status ===
                                                                    'failed'
                                                                  ? 'destructive'
                                                                  : 'secondary'
                                                        }
                                                    >
                                                        {message.status}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(
                                                            message.created_at,
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
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
                                        {uniqueGroups.map((group) => (
                                            <option key={group} value={group}>
                                                {group}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 flex gap-2">
                            <Button
                                onClick={addSelectedContactsToRecipients}
                                disabled={selectedContacts.length === 0}
                                className="bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                Add Selected ({selectedContacts.length})
                            </Button>
                            <Button
                                onClick={addAllContactsToRecipients}
                                disabled={
                                    filteredContacts.filter((contact) => {
                                        const viberNumber =
                                            contact.viber ||
                                            contact.contact_number;
                                        return (
                                            viberNumber &&
                                            viberRegex.test(viberNumber)
                                        );
                                    }).length === 0
                                }
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                Add All (
                                {
                                    filteredContacts.filter((contact) => {
                                        const viberNumber =
                                            contact.viber ||
                                            contact.contact_number;
                                        return (
                                            viberNumber &&
                                            viberRegex.test(viberNumber)
                                        );
                                    }).length
                                }
                                )
                            </Button>
                        </div>

                        {/* Contacts Table */}
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
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Viber Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Group
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {filteredContacts.map((contact) => {
                                        const viberNumber =
                                            contact.viber ||
                                            contact.contact_number;
                                        const hasValidViberNumber =
                                            viberNumber &&
                                            viberRegex.test(viberNumber);

                                        return (
                                            <tr
                                                key={contact.id}
                                                className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                                    !hasValidViberNumber
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
                                                        onChange={() => {
                                                            if (
                                                                selectedContacts.some(
                                                                    (c) =>
                                                                        c.id ===
                                                                        contact.id,
                                                                )
                                                            ) {
                                                                setSelectedContacts(
                                                                    selectedContacts.filter(
                                                                        (c) =>
                                                                            c.id !==
                                                                            contact.id,
                                                                    ),
                                                                );
                                                            } else {
                                                                setSelectedContacts(
                                                                    [
                                                                        ...selectedContacts,
                                                                        contact,
                                                                    ],
                                                                );
                                                            }
                                                        }}
                                                        disabled={
                                                            !hasValidViberNumber
                                                        }
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                    {contact.first_name}{' '}
                                                    {contact.last_name}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                    {contact.email}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                    {viberNumber ? (
                                                        hasValidViberNumber ? (
                                                            <span className="text-green-600 dark:text-green-400">
                                                                {viberNumber}
                                                            </span>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-red-600 dark:text-red-400">
                                                                    {
                                                                        viberNumber
                                                                    }
                                                                </span>
                                                                <span className="text-xs text-red-500 dark:text-red-400">
                                                                    (Not a valid
                                                                    Viber
                                                                    number)
                                                                </span>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500">
                                                            No Viber number
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                    {contact.group &&
                                                    contact.group.length > 0
                                                        ? contact.group.join(
                                                              ', ',
                                                          )
                                                        : 'No group'}
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
