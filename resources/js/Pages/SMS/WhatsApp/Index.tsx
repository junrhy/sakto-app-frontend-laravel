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
import { Loader2, MessageSquare, Send, Users, DollarSign } from 'lucide-react';
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
    whatsapp_number?: string;
    group?: string[];
}

interface Stats {
    sent: number;
    delivered: number;
    failed: number;
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
}

export default function Index({ auth, messages, stats }: Props) {
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [balance, setBalance] = useState<{
        balance: number;
        currency: string;
    } | null>(null);
    const [isLoadingPricing, setIsLoadingPricing] = useState(false);
    const [pricing, setPricing] = useState<any>(null);

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

    // WhatsApp number validation (international format)
    const whatsappRegex = /^\+[1-9]\d{1,14}$/;

    const addRecipient = () => {
        if (!newRecipient.trim()) {
            toast.error('Please enter a WhatsApp number');
            return;
        }

        if (!whatsappRegex.test(newRecipient.trim())) {
            toast.error('Please enter a valid international WhatsApp number (e.g., +1234567890)');
            return;
        }

        if (recipients.includes(newRecipient.trim())) {
            toast.error('This WhatsApp number is already added');
            return;
        }

        setRecipients([...recipients, newRecipient.trim()]);
        setNewRecipient('');
        toast.success('WhatsApp number added successfully');
    };

    const removeRecipient = (index: number) => {
        setRecipients(recipients.filter((_, i) => i !== index));
    };

    const fetchContacts = async () => {
        try {
            const response = await axios.get('/contacts/list');
            setContacts(response.data.contacts || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to load contacts');
        }
    };

    const toggleContactSelection = (contact: Contact) => {
        if (selectedContacts.some((c) => c.id === contact.id)) {
            setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id));
        } else {
            setSelectedContacts([...selectedContacts, contact]);
        }
    };

    const addSelectedContactsToRecipients = () => {
        const validContacts = selectedContacts.filter(contact => 
            contact.whatsapp_number && whatsappRegex.test(contact.whatsapp_number)
        );
        
        const newRecipients = validContacts.map(contact => contact.whatsapp_number!);
        const uniqueRecipients = [...new Set([...recipients, ...newRecipients])];
        
        setRecipients(uniqueRecipients);
        setSelectedContacts([]);
        setShowContactSelector(false);
        
        toast.success(`${validContacts.length} WhatsApp numbers added to recipients`);
    };

    const addAllContactsToRecipients = () => {
        const validContacts = contacts.filter(contact => 
            contact.whatsapp_number && whatsappRegex.test(contact.whatsapp_number)
        );
        
        const newRecipients = validContacts.map(contact => contact.whatsapp_number!);
        const uniqueRecipients = [...new Set([...recipients, ...newRecipients])];
        
        setRecipients(uniqueRecipients);
        setShowContactSelector(false);
        
        toast.success(`${validContacts.length} WhatsApp numbers added to recipients`);
    };

    const selectContactsByGroup = (group: string) => {
        const groupContacts = contacts.filter(contact => 
            contact.group && contact.group.includes(group) &&
            contact.whatsapp_number && whatsappRegex.test(contact.whatsapp_number)
        );
        
        setSelectedContacts(groupContacts);
        
        if (groupContacts.length > 0) {
            toast.success(
                `${groupContacts.length} contacts from group "${group}" with valid WhatsApp numbers selected`,
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
            (contact.whatsapp_number || '').includes(searchQuery) ||
            (contact.group || []).some((g) =>
                g.toLowerCase().includes(searchQuery.toLowerCase()),
            );

        const matchesGroup =
            groupFilter === 'all' ||
            (contact.group && contact.group.includes(groupFilter));

        return matchesSearch && matchesGroup;
    });

    const getBalance = async () => {
        setIsLoadingBalance(true);
        try {
            const response = await fetch('/sms-whatsapp/balance');
            const data = await response.json();
            setBalance(data);
        } catch (error) {
            console.error('Error fetching balance:', error);
            toast.error('Failed to fetch balance');
        } finally {
            setIsLoadingBalance(false);
        }
    };

    const getPricing = async () => {
        setIsLoadingPricing(true);
        try {
            const response = await fetch('/sms-whatsapp/pricing');
            const data = await response.json();
            setPricing(data);
        } catch (error) {
            console.error('Error fetching pricing:', error);
            toast.error('Failed to fetch pricing');
        } finally {
            setIsLoadingPricing(false);
        }
    };

    useEffect(() => {
        getPricing();
    }, []);

    const totalCredits = recipients.length * 5; // 5 credits per WhatsApp message

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (recipients.length === 0) {
            toast.error('Please add at least one WhatsApp number');
            return;
        }

        if (!data.message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (data.message.length > 1000) {
            toast.error('Message is too long (max 1000 characters)');
            return;
        }

        post('/sms-whatsapp/send', {
            data: {
                to: recipients,
                message: data.message,
            },
            onSuccess: () => {
                toast.success('WhatsApp message sent successfully!');
                setRecipients([]);
                setData('message', '');
            },
            onError: (errors) => {
                console.error('Send error:', errors);
                toast.error('Failed to send WhatsApp message');
            },
        });
    };

    const uniqueGroups = Array.from(
        new Set(contacts.flatMap((contact) => contact.group || [])),
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-900 dark:text-white">
                    WhatsApp Messaging
                </h2>
            }
        >
            <Head title="WhatsApp Messaging" />

            <div className="space-y-6">
                {/* Stats Section */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden border border-gray-200 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 bg-slate-50 dark:bg-slate-800/50">
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
                                        WhatsApp messages sent
                                    </p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                    <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border border-gray-200 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 bg-slate-50 dark:bg-slate-800/50">
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

                    <Card className="relative overflow-hidden border border-gray-200 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 bg-slate-50 dark:bg-slate-800/50">
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

                    <Card className="relative overflow-hidden border border-gray-200 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 bg-slate-50 dark:bg-slate-800/50">
                        <CardContent className="relative bg-slate-50 p-6 dark:bg-slate-800/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Account Balance
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                        {balance ? `$${balance.balance.toFixed(2)}` : '--'}
                                    </p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400">
                                        {balance ? 'Current balance' : 'Click to check balance'}
                                    </p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                                    <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Check Balance Button */}
                {!balance && (
                    <div className="flex justify-center">
                        <Button
                            onClick={getBalance}
                            disabled={isLoadingBalance}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {isLoadingBalance ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                'Check Balance'
                            )}
                        </Button>
                    </div>
                )}

                {/* Pricing Section */}
                {pricing && (
                    <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                        <CardHeader className="border-b border-gray-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-800">
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                WhatsApp Pricing
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                Current pricing for WhatsApp messages
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-slate-50 p-6 dark:bg-slate-800/50">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-700">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        WhatsApp Message
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        ${pricing.cost_per_message} {pricing.currency}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Send Message Form */}
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                            <CardHeader className="border-b border-gray-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-800">
                                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Send WhatsApp Message
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                    Send WhatsApp messages to multiple recipients
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 bg-slate-50 p-6 dark:bg-slate-800/50">
                                <form onSubmit={submit} className="space-y-6">
                                    {/* Recipients Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                WhatsApp Numbers
                                            </label>
                                            <Button
                                                type="button"
                                                onClick={() => setShowContactSelector(true)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                            >
                                                Select from Contacts
                                            </Button>
                                        </div>

                                        {/* Add Recipient Input */}
                                        <div className="flex gap-2">
                                            <Input
                                                type="text"
                                                placeholder="Enter WhatsApp number (e.g., +1234567890)"
                                                value={newRecipient}
                                                onChange={(e) => setNewRecipient(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addRecipient();
                                                    }
                                                }}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                onClick={addRecipient}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                Add
                                            </Button>
                                        </div>

                                        {/* Recipients List */}
                                        {recipients.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Recipients ({recipients.length})
                                                </p>
                                                <div className="space-y-2">
                                                    {recipients.map((recipient, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                                                        >
                                                            <span className="text-sm text-gray-900 dark:text-white">
                                                                {recipient}
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                onClick={() => removeRecipient(index)}
                                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                                size="sm"
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Credit Cost Info */}
                                        {recipients.length > 0 && (
                                            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                                    Sending this WhatsApp message will cost {totalCredits} credits per recipient.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Input */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Message
                                        </label>
                                        <Textarea
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            placeholder="Enter your WhatsApp message..."
                                            rows={4}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {data.message.length}/1000 characters
                                        </p>
                                    </div>

                                    {/* Send Button */}
                                    <Button
                                        type="submit"
                                        disabled={processing || recipients.length === 0}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send WhatsApp Message
                                            </>
                                        )}
                                    </Button>
                                </form>
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
                                Recent WhatsApp messages sent
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-slate-50 p-6 dark:bg-slate-800/50">
                            {messages.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No WhatsApp messages sent yet
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
                                                            message.status === 'delivered'
                                                                ? 'default'
                                                                : message.status === 'failed'
                                                                ? 'destructive'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {message.status}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(message.created_at).toLocaleString()}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-4xl max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl dark:bg-gray-800">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Select Contacts
                                </h3>
                                <Button
                                    onClick={() => setShowContactSelector(false)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white"
                                >
                                    Close
                                </Button>
                            </div>

                            {/* Search and Filter */}
                            <div className="mb-4 space-y-4">
                                <Input
                                    placeholder="Search contacts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full"
                                />
                                <div className="flex gap-2">
                                    <select
                                        value={groupFilter}
                                        onChange={(e) => setGroupFilter(e.target.value)}
                                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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

                            {/* Action Buttons */}
                            <div className="mb-4 flex gap-2">
                                <Button
                                    onClick={addSelectedContactsToRecipients}
                                    disabled={selectedContacts.length === 0}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    Add Selected ({selectedContacts.length})
                                </Button>
                                <Button
                                    onClick={addAllContactsToRecipients}
                                    disabled={filteredContacts.filter(contact => 
                                        contact.whatsapp_number && whatsappRegex.test(contact.whatsapp_number)
                                    ).length === 0}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Add All ({filteredContacts.filter(contact => 
                                        contact.whatsapp_number && whatsappRegex.test(contact.whatsapp_number)
                                    ).length})
                                </Button>
                            </div>

                            {/* Contacts Table */}
                            <div className="max-h-96 overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Select
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                WhatsApp Number
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                                Group
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                        {filteredContacts.map((contact) => {
                                            const hasValidWhatsAppNumber = contact.whatsapp_number && 
                                                whatsappRegex.test(contact.whatsapp_number);
                                            
                                            return (
                                                <tr
                                                    key={contact.id}
                                                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                                        !hasValidWhatsAppNumber ? 'opacity-50 bg-gray-100 dark:bg-gray-600' : ''
                                                    }`}
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedContacts.some((c) => c.id === contact.id)}
                                                            onChange={() => toggleContactSelection(contact)}
                                                            disabled={!hasValidWhatsAppNumber}
                                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        />
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                        {contact.first_name} {contact.last_name}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                        {contact.email}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                        {contact.whatsapp_number ? (
                                                            hasValidWhatsAppNumber ? (
                                                                <span className="text-green-600 dark:text-green-400">
                                                                    {contact.whatsapp_number}
                                                                </span>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-red-600 dark:text-red-400">
                                                                        {contact.whatsapp_number}
                                                                    </span>
                                                                    <span className="text-xs text-red-500 dark:text-red-400">
                                                                        (Not a valid WhatsApp number)
                                                                    </span>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <span className="text-gray-400 dark:text-gray-500">
                                                                No WhatsApp number
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                        {contact.group && contact.group.length > 0
                                                            ? contact.group.join(', ')
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
                </div>
            )}
        </AuthenticatedLayout>
    );
}
