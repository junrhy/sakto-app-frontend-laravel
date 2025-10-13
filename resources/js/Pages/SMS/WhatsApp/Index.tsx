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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Project, User } from '@/types/index';
import { Head, router, useForm } from '@inertiajs/react';
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
    whatsapp?: string;
    group?: string[];
}

interface Stats {
    sent: number;
    delivered: number;
    failed: number;
}

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
    accounts: WhatsAppAccount[];
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
        message_type: 'text',
        template_name: '',
        template_data: {
            placeholders: [] as string[],
            language: 'en',
        },
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
    const [templatePlaceholders, setTemplatePlaceholders] = useState<string[]>(
        [],
    );
    const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);

    // WhatsApp number validation (international format or local format)
    const whatsappRegex = /^(\+[1-9]\d{1,14}|0\d{9,10})$/;

    // Update templates when account changes
    useEffect(() => {
        if (selectedAccount) {
            const account = accounts.find((acc) => acc.id === selectedAccount);
            if (account && account.available_templates) {
                setAvailableTemplates(account.available_templates);
            } else {
                setAvailableTemplates([]);
            }

            // If current message type is text and account is Infobip, set up template
            if (
                data.message_type === 'text' &&
                account?.provider === 'infobip'
            ) {
                setData('template_name', 'test_whatsapp_template_en');
                setTemplatePlaceholders(['text']);
                setData('template_data', {
                    placeholders: [''] as string[],
                    language: 'en',
                });
            }
        }
    }, [selectedAccount, accounts, data.message_type]);

    // Handle template selection
    const handleTemplateChange = (templateName: string) => {
        setData('template_name', templateName);
        const template = availableTemplates.find(
            (t) => t.name === templateName,
        );

        if (template) {
            let placeholders: string[] = [];

            // Check if template has explicit placeholders array (for API templates)
            if (template.placeholders && Array.isArray(template.placeholders)) {
                placeholders = template.placeholders;
            }
            // Otherwise, extract placeholders from template text (for custom templates)
            else if (
                template.components &&
                template.components[0] &&
                template.components[0].text
            ) {
                const text = template.components[0].text;
                // Extract placeholders like {{1}}, {{2}}, {{3}}, etc.
                const placeholderMatches = text.match(/\{\{(\d+)\}\}/g);
                if (placeholderMatches) {
                    // Sort by number and create placeholder names
                    placeholders = placeholderMatches
                        .sort((a: string, b: string) => {
                            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
                            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
                            return numA - numB;
                        })
                        .map(
                            (match: string, index: number) =>
                                `Variable ${index + 1}`,
                        );
                }
            }

            setTemplatePlaceholders(placeholders);
            setData('template_data', {
                ...data.template_data,
                placeholders: new Array(placeholders.length).fill(
                    '',
                ) as string[],
            });
        } else {
            setTemplatePlaceholders([]);
            setData('template_data', {
                ...data.template_data,
                placeholders: [] as string[],
            });
        }
    };

    // Handle message type change - for Infobip accounts, both text and template use templates
    const handleMessageTypeChange = (value: string) => {
        setData('message_type', value);

        if (selectedAccount) {
            const account = accounts.find((acc) => acc.id === selectedAccount);
            const isInfobip = account?.provider === 'infobip';

            if (value === 'text') {
                if (isInfobip) {
                    // For Infobip, text messages use the default template
                    setData('template_name', 'test_whatsapp_template_en');
                    setTemplatePlaceholders(['text']); // One placeholder for the text message
                    setData('template_data', {
                        placeholders: [''] as string[],
                        language: 'en',
                    });
                } else {
                    // For Facebook, clear template data
                    setData('template_name', '');
                    setTemplatePlaceholders([]);
                }
            } else {
                // Template message - clear template selection to let user choose
                setData('template_name', '');
                setTemplatePlaceholders([]);
            }
        }
    };

    // Handle placeholder change
    const handlePlaceholderChange = (index: number, value: string) => {
        const newPlaceholders = [
            ...(data.template_data.placeholders as string[]),
        ];
        newPlaceholders[index] = value;
        setData('template_data', {
            ...data.template_data,
            placeholders: newPlaceholders as string[],
        });
    };

    const addRecipient = () => {
        if (!newRecipient.trim()) {
            toast.error('Please enter a WhatsApp number');
            return;
        }

        if (!whatsappRegex.test(newRecipient.trim())) {
            toast.error(
                'Please enter a valid WhatsApp number (e.g., +639260049848 or 09260049848)',
            );
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
            setContacts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to load contacts');
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

    const toggleContactSelection = (contact: Contact) => {
        if (selectedContacts.some((c) => c.id === contact.id)) {
            setSelectedContacts(
                selectedContacts.filter((c) => c.id !== contact.id),
            );
        } else {
            setSelectedContacts([...selectedContacts, contact]);
        }
    };

    const addSelectedContactsToRecipients = () => {
        const validContacts = selectedContacts.filter(
            (contact) =>
                contact.whatsapp && whatsappRegex.test(contact.whatsapp),
        );

        const newRecipients = validContacts.map((contact) => contact.whatsapp!);
        const uniqueRecipients = [
            ...new Set([...recipients, ...newRecipients]),
        ];

        setRecipients(uniqueRecipients);
        setSelectedContacts([]);
        setShowContactSelector(false);

        toast.success(
            `${validContacts.length} WhatsApp numbers added to recipients`,
        );
    };

    const addAllContactsToRecipients = () => {
        const validContacts = contacts.filter(
            (contact) =>
                contact.whatsapp && whatsappRegex.test(contact.whatsapp),
        );

        const newRecipients = validContacts.map((contact) => contact.whatsapp!);
        const uniqueRecipients = [
            ...new Set([...recipients, ...newRecipients]),
        ];

        setRecipients(uniqueRecipients);
        setShowContactSelector(false);

        toast.success(
            `${validContacts.length} WhatsApp numbers added to recipients`,
        );
    };

    const selectContactsByGroup = (group: string) => {
        const groupContacts = contacts.filter(
            (contact) =>
                contact.group &&
                contact.group.includes(group) &&
                contact.whatsapp &&
                whatsappRegex.test(contact.whatsapp),
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
            (contact.whatsapp || '').includes(searchQuery) ||
            (contact.group || []).some((g) =>
                g.toLowerCase().includes(searchQuery.toLowerCase()),
            );

        const matchesGroup =
            groupFilter === 'all' ||
            (contact.group && contact.group.includes(groupFilter));

        return matchesSearch && matchesGroup;
    });

    useEffect(() => {
        fetchContacts();
        fetchCredits();
    }, []);

    const totalCredits = recipients.length * 5; // 5 credits per WhatsApp message

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (recipients.length === 0) {
            toast.error('Please add at least one WhatsApp number');
            return;
        }

        if (data.message_type === 'text' && !data.message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (data.message_type === 'template' && !data.template_name) {
            toast.error('Please select a template');
            return;
        }

        if (data.message.length > 1000) {
            toast.error('Message is too long (max 1000 characters)');
            return;
        }

        // Spend credits
        try {
            await axios.post('/credits/spend', {
                amount: totalCredits,
                description: `WhatsApp message to ${recipients.length} recipient(s)`,
                purpose: 'whatsapp_message',
                reference_id: `whatsapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            });
        } catch (error: any) {
            toast.error('Insufficient credits or failed to deduct credits');
            return;
        }

        router.post(
            '/sms-whatsapp/send',
            {
                to: recipients,
                message: data.message,
                message_type: data.message_type,
                template_name: data.template_name,
                template_data: data.template_data,
                account_id: selectedAccount,
            },
            {
                onSuccess: () => {
                    toast.success('WhatsApp message sent successfully!');
                    setRecipients([]);
                    setData('message', '');
                },
                onError: (errors: any) => {
                    console.error('Send error:', errors);
                    toast.error('Failed to send WhatsApp message');
                },
            },
        );
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
                {/* Account Setup Status */}
                {!hasActiveAccount && (
                    <Card className="border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    <div>
                                        <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                                            WhatsApp Account Not Set Up
                                        </h3>
                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            You need to connect your WhatsApp
                                            Business account to send messages.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() =>
                                        (window.location.href =
                                            '/whatsapp-accounts?app=sms')
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
                                        Select WhatsApp Account
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Choose which WhatsApp account to use for
                                        sending messages
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
                                        {accounts.map((account) => (
                                            <option
                                                key={account.id}
                                                value={account.id}
                                            >
                                                {account.account_name} (
                                                {account.phone_number})
                                                {!account.is_verified &&
                                                    ' - Not Verified'}
                                            </option>
                                        ))}
                                    </select>
                                    <Button
                                        onClick={() =>
                                            (window.location.href =
                                                '/whatsapp-accounts?app=sms')
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
                                        WhatsApp messages sent
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
                                    Send WhatsApp Message
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                    Send WhatsApp messages to multiple
                                    recipients
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 bg-slate-50 p-6 dark:bg-slate-800/50">
                                <form onSubmit={submit} className="space-y-6">
                                    {/* Recipients Section */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="newRecipient"
                                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                            >
                                                Add WhatsApp Number
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
                                                    placeholder="Enter WhatsApp number (e.g., +639260049848 or 09260049848)"
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

                                        {/* Recipients List */}
                                        {recipients.length > 0 && (
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Recipients (
                                                    {recipients.length})
                                                </label>
                                                <div className="max-h-32 space-y-2 overflow-y-auto">
                                                    {recipients.map(
                                                        (recipient, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700"
                                                            >
                                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                                    {recipient}
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

                                    {/* Message Type Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="message_type">
                                            Message Type
                                        </Label>
                                        <Select
                                            value={data.message_type}
                                            onValueChange={
                                                handleMessageTypeChange
                                            }
                                        >
                                            <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                                                <SelectValue placeholder="Select message type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedAccount &&
                                                accounts.find(
                                                    (acc) =>
                                                        acc.id ===
                                                        selectedAccount,
                                                )?.provider === 'infobip' ? (
                                                    // Infobip-specific options
                                                    <>
                                                        <SelectItem value="text">
                                                            Quick Message
                                                        </SelectItem>
                                                        <SelectItem value="template">
                                                            Custom Template
                                                        </SelectItem>
                                                    </>
                                                ) : (
                                                    // Facebook-specific options
                                                    <>
                                                        <SelectItem value="text">
                                                            Text Message
                                                        </SelectItem>
                                                        <SelectItem value="template">
                                                            Template Message
                                                        </SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {/* Help text based on provider and message type */}
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {selectedAccount &&
                                            accounts.find(
                                                (acc) =>
                                                    acc.id === selectedAccount,
                                            )?.provider === 'infobip'
                                                ? data.message_type === 'text'
                                                    ? 'Quick messages use a default template for simple text communication.'
                                                    : 'Custom templates allow you to use pre-approved templates with multiple variables.'
                                                : data.message_type === 'text'
                                                  ? 'Send a direct text message to recipients.'
                                                  : 'Use approved WhatsApp Business templates for structured messages.'}
                                        </p>
                                    </div>

                                    {/* Template Selection */}
                                    {data.message_type === 'template' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="template_name">
                                                {selectedAccount &&
                                                accounts.find(
                                                    (acc) =>
                                                        acc.id ===
                                                        selectedAccount,
                                                )?.provider === 'infobip'
                                                    ? 'Select Custom Template'
                                                    : 'Select Template'}
                                            </Label>
                                            {availableTemplates.length > 0 ? (
                                                <Select
                                                    value={data.template_name}
                                                    onValueChange={
                                                        handleTemplateChange
                                                    }
                                                >
                                                    <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                                                        <SelectValue placeholder="Select a template" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableTemplates.map(
                                                            (template) => (
                                                                <SelectItem
                                                                    key={
                                                                        template.name
                                                                    }
                                                                    value={
                                                                        template.name
                                                                    }
                                                                >
                                                                    {
                                                                        template.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                        {selectedAccount &&
                                                        accounts.find(
                                                            (acc) =>
                                                                acc.id ===
                                                                selectedAccount,
                                                        )?.provider ===
                                                            'infobip'
                                                            ? 'No custom templates available. Use "Quick Message" for simple text communication.'
                                                            : 'No approved templates available. Please contact your administrator.'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Template Placeholders */}
                                    {data.message_type === 'template' &&
                                        templatePlaceholders.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>
                                                    Template Variables
                                                </Label>
                                                {templatePlaceholders.map(
                                                    (placeholder, index) => (
                                                        <div
                                                            key={index}
                                                            className="space-y-1"
                                                        >
                                                            <Label
                                                                htmlFor={`placeholder-${index}`}
                                                                className="text-sm"
                                                            >
                                                                {placeholder}
                                                            </Label>
                                                            <Input
                                                                id={`placeholder-${index}`}
                                                                value={
                                                                    (
                                                                        data
                                                                            .template_data
                                                                            .placeholders as string[]
                                                                    )[index] ||
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    handlePlaceholderChange(
                                                                        index,
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder={`Enter ${placeholder}`}
                                                                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}

                                    {/* Message Input */}
                                    {data.message_type === 'text' && (
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="message"
                                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                            >
                                                Message
                                            </label>
                                            <div className="space-y-2">
                                                {selectedAccount &&
                                                accounts.find(
                                                    (acc) =>
                                                        acc.id ===
                                                        selectedAccount,
                                                )?.provider === 'infobip' ? (
                                                    // For Infobip accounts, show placeholder input for template
                                                    <div className="space-y-2">
                                                        <Label htmlFor="text-placeholder">
                                                            Message Content
                                                        </Label>
                                                        <Input
                                                            id="text-placeholder"
                                                            value={
                                                                data
                                                                    .template_data
                                                                    .placeholders[0] ||
                                                                ''
                                                            }
                                                            onChange={(e) => {
                                                                const newPlaceholders =
                                                                    [
                                                                        ...(data
                                                                            .template_data
                                                                            .placeholders as string[]),
                                                                    ];
                                                                newPlaceholders[0] =
                                                                    e.target.value;
                                                                setData(
                                                                    'template_data',
                                                                    {
                                                                        ...data.template_data,
                                                                        placeholders:
                                                                            newPlaceholders,
                                                                    },
                                                                );
                                                                // Also update the message field for compatibility
                                                                setData(
                                                                    'message',
                                                                    e.target
                                                                        .value,
                                                                );
                                                            }}
                                                            placeholder="Type your WhatsApp message here..."
                                                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                                                            maxLength={1000}
                                                        />
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {data.template_data
                                                                .placeholders[0]
                                                                ?.length || 0}
                                                            /1000 characters
                                                        </p>
                                                    </div>
                                                ) : (
                                                    // For Facebook accounts, show regular textarea
                                                    <>
                                                        <Textarea
                                                            id="message"
                                                            value={data.message}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'message',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Enter your WhatsApp message..."
                                                            className="min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                            maxLength={1000}
                                                        />
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {
                                                                data.message
                                                                    .length
                                                            }
                                                            /1000 characters
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                            {errors.message && (
                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                    {errors.message}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Credit Cost Info and Send Button */}
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
                                                {recipients.length > 0 ? (
                                                    <>
                                                        Sending this message
                                                        will cost{' '}
                                                        {recipients.length * 5}{' '}
                                                        credits per recipient
                                                        from your balance
                                                    </>
                                                ) : (
                                                    <>
                                                        Sending this message
                                                        will cost 5 credits per
                                                        recipient from your
                                                        balance
                                                    </>
                                                )}
                                            </div>
                                            {recipients.length > 0 &&
                                                credits <
                                                    recipients.length * 5 && (
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
                                                        Insufficient credits.
                                                        You need{' '}
                                                        {recipients.length * 5}{' '}
                                                        credits but only have{' '}
                                                        {credits}.
                                                    </div>
                                                )}
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                recipients.length === 0 ||
                                                credits < recipients.length * 5
                                            }
                                            className="inline-flex items-center rounded-lg border border-transparent bg-green-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="-ml-1 mr-3 h-5 w-5 animate-spin text-white" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-5 w-5" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </div>
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
                                <p className="py-8 text-center text-gray-500 dark:text-gray-400">
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
                                    filteredContacts.filter(
                                        (contact) =>
                                            contact.whatsapp &&
                                            whatsappRegex.test(
                                                contact.whatsapp,
                                            ),
                                    ).length === 0
                                }
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                Add All (
                                {
                                    filteredContacts.filter(
                                        (contact) =>
                                            contact.whatsapp &&
                                            whatsappRegex.test(
                                                contact.whatsapp,
                                            ),
                                    ).length
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
                                            WhatsApp Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Group
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {filteredContacts.map((contact) => {
                                        const hasValidWhatsAppNumber =
                                            contact.whatsapp &&
                                            whatsappRegex.test(
                                                contact.whatsapp,
                                            );

                                        return (
                                            <tr
                                                key={contact.id}
                                                className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                                    !hasValidWhatsAppNumber
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
                                                            !hasValidWhatsAppNumber
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
                                                    {contact.whatsapp ? (
                                                        hasValidWhatsAppNumber ? (
                                                            <span className="text-green-600 dark:text-green-400">
                                                                {
                                                                    contact.whatsapp
                                                                }
                                                            </span>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-red-600 dark:text-red-400">
                                                                    {
                                                                        contact.whatsapp
                                                                    }
                                                                </span>
                                                                <span className="text-xs text-red-500 dark:text-red-400">
                                                                    (Not a valid
                                                                    WhatsApp
                                                                    number)
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
