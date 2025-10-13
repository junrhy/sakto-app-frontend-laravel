import { useTheme } from '@/Components/ThemeProvider';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface User {
    name: string;
    email: string;
    is_admin?: boolean;
}

interface Contact {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    group?: string[];
}

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    category: string | null;
    is_active: boolean;
}

interface Props {
    auth: {
        user: User;
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
}

export default function Index({ auth }: Props) {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCcBcc, setShowCcBcc] = useState(false);
    const [showContactSelector, setShowContactSelector] = useState(false);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [templateSearchQuery, setTemplateSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState<string>('all');
    const { data, setData, reset, errors } = useForm({
        to: [] as string[],
        subject: '',
        message: '',
        cc: [] as string[],
        bcc: [] as string[],
        attachments: [] as File[],
        _errors: {} as Record<string, string>,
    });

    const [toInput, setToInput] = useState('');
    const [ccInput, setCcInput] = useState('');
    const [bccInput, setBccInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    useEffect(() => {
        // Fetch contacts and templates when the component mounts
        const fetchData = async () => {
            try {
                // Fetch contacts
                const contactsResponse = await axios.get('/contacts/list');
                if (contactsResponse.data.success) {
                    setContacts(contactsResponse.data.data || []);
                } else {
                    toast.error('Failed to fetch contacts');
                }

                // Fetch templates
                const templatesResponse = await axios.get(
                    '/email/templates/list',
                );
                if (templatesResponse.data.success) {
                    setTemplates(templatesResponse.data.data || []);
                } else {
                    toast.error('Failed to fetch templates');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to fetch data');
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        const validationErrors: Record<string, string> = {};
        if (data.to.length === 0) {
            validationErrors.to = 'At least one recipient is required';
        }
        if (!data.subject.trim()) {
            validationErrors.subject = 'Subject is required';
        }
        if (!data.message.trim()) {
            validationErrors.message = 'Message is required';
        }

        // If there are validation errors, show them and return
        if (Object.keys(validationErrors).length > 0) {
            toast.error('Please fill in all required fields', {
                duration: 5000,
                position: 'top-right',
            });
            setData((prevData) => ({
                ...prevData,
                _errors: validationErrors,
            }));
            return;
        }

        setIsSubmitting(true);

        try {
            // Calculate total number of recipients
            const totalRecipients =
                data.to.length + data.cc.length + data.bcc.length;

            // First, try to spend credits based on number of recipients
            const creditResponse = await axios.post('/credits/spend', {
                amount: totalRecipients,
                purpose: 'Email Sending',
                reference_id: `email_${Date.now()}`,
            });

            if (!creditResponse.data.success) {
                toast.error(
                    'Insufficient credits to send email. Please purchase more credits.',
                    {
                        duration: 5000,
                        position: 'top-right',
                    },
                );
                return;
            }

            const formData = new FormData();
            data.to.forEach((email) => formData.append('to[]', email));
            formData.append('subject', data.subject);
            formData.append('message', data.message);
            data.cc.forEach((email) => formData.append('cc[]', email));
            data.bcc.forEach((email) => formData.append('bcc[]', email));
            data.attachments.forEach((file) =>
                formData.append('attachments[]', file),
            );

            const response = await axios.post('/email/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                toast.success('Email sent successfully!', {
                    duration: 5000,
                    position: 'top-right',
                });
                reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    'Failed to send email. Please try again.',
                {
                    duration: 5000,
                    position: 'top-right',
                },
            );
            console.error('Error sending email:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addRecipient = (type: 'to' | 'cc' | 'bcc', value: string) => {
        if (value && /\S+@\S+\.\S+/.test(value)) {
            setData(type, [...data[type], value]);
            if (type === 'to') setToInput('');
            else if (type === 'cc') setCcInput('');
            else setBccInput('');
        }
    };

    const removeRecipient = (type: 'to' | 'cc' | 'bcc', index: number) => {
        setData(
            type,
            data[type].filter((_, i) => i !== index),
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const maxSize = 20 * 1024 * 1024; // 20MB in bytes

        // Check file sizes
        const oversizedFiles = files.filter((file) => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            toast.error(
                `Some files exceed the 20MB limit: ${oversizedFiles.map((f) => f.name).join(', ')}`,
                {
                    duration: 5000,
                    position: 'top-right',
                },
            );
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setData('attachments', files);
    };

    const removeAttachment = (index: number) => {
        setData(
            'attachments',
            data.attachments.filter((_, i) => i !== index),
        );
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

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
        const emails = selectedContacts.map((contact) => contact.email);
        setData('to', [...new Set([...data.to, ...emails])]);
        setSelectedContacts([]);
        setShowContactSelector(false);
        toast.success('Selected contacts added to recipients');
    };

    const addAllContactsToRecipients = () => {
        const emails = contacts.map((contact) => contact.email);
        setData('to', [...new Set([...data.to, ...emails])]);
        setShowContactSelector(false);
        toast.success('All contacts added to recipients');
    };

    const selectContactsByGroup = (group: string) => {
        if (group === 'all') {
            setSelectedContacts(contacts);
            toast.success('All contacts selected');
        } else {
            const groupContacts = contacts.filter((contact) =>
                contact.group?.includes(group),
            );
            setSelectedContacts(groupContacts);
            toast.success(
                `${groupContacts.length} contacts from group "${group}" selected`,
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
            (contact.group || []).some((g) =>
                g.toLowerCase().includes(searchQuery.toLowerCase()),
            );

        const matchesGroup =
            groupFilter === 'all' ||
            (contact.group && contact.group.includes(groupFilter));

        return matchesSearch && matchesGroup;
    });

    const loadTemplate = (template: EmailTemplate) => {
        setData({
            ...data,
            subject: template.subject,
            message: template.body,
        });
        setShowTemplateSelector(false);
        toast.success('Template loaded successfully');
    };

    const filteredTemplates = templates.filter(
        (template) =>
            template.name
                .toLowerCase()
                .includes(templateSearchQuery.toLowerCase()) ||
            template.subject
                .toLowerCase()
                .includes(templateSearchQuery.toLowerCase()) ||
            (template.category?.toLowerCase() || '').includes(
                templateSearchQuery.toLowerCase(),
            ),
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Email Sender
                </h2>
            }
        >
            <Head title="Email Sender" />

            <div className="bg-white dark:bg-gray-800">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Compose Email
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    Send emails to your contacts with templates
                                    and attachments
                                </p>
                            </div>
                            {canEdit && (
                                <div className="flex gap-3">
                                    <Link
                                        href={route('email.templates.create')}
                                        className="inline-flex items-center rounded-lg border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    >
                                        <svg
                                            className="mr-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                            />
                                        </svg>
                                        Create Template
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowTemplateSelector(true)
                                        }
                                        className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        <svg
                                            className="mr-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        Load Template
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {canEdit ? (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                {/* Left Column - Recipients and Content */}
                                <div className="space-y-8 lg:col-span-2">
                                    {/* Recipients Section */}
                                    <div className="overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                                        <div className="border-b border-gray-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-800">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                Recipients
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Add email addresses for To, CC,
                                                and BCC fields
                                            </p>
                                        </div>
                                        <div className="space-y-6 bg-slate-50 p-6 dark:bg-slate-800/50">
                                            {/* To Field */}
                                            <div>
                                                <div className="mb-3 flex items-center justify-between">
                                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        To{' '}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowContactSelector(
                                                                true,
                                                            )
                                                        }
                                                        className="inline-flex items-center px-3 py-1.5 text-sm text-indigo-600 transition-colors hover:text-indigo-800 focus:outline-none dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        <svg
                                                            className="mr-1 h-4 w-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                            />
                                                        </svg>
                                                        Select from Contacts
                                                    </button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="email"
                                                        value={toInput}
                                                        onChange={(e) =>
                                                            setToInput(
                                                                e.target.value,
                                                            )
                                                        }
                                                        onKeyPress={(e) =>
                                                            e.key === 'Enter' &&
                                                            (e.preventDefault(),
                                                            addRecipient(
                                                                'to',
                                                                toInput,
                                                            ))
                                                        }
                                                        className="block w-full rounded-lg border-gray-300 shadow-sm transition-colors focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                        placeholder="recipient@example.com"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            addRecipient(
                                                                'to',
                                                                toInput,
                                                            )
                                                        }
                                                        className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {data.to.map(
                                                        (email, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 transition-colors hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                                                            >
                                                                {email}
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeRecipient(
                                                                            'to',
                                                                            index,
                                                                        )
                                                                    }
                                                                    className="ml-2 inline-flex text-indigo-600 hover:text-indigo-800 focus:outline-none dark:text-indigo-400 dark:hover:text-indigo-300"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                                {data._errors?.to && (
                                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                        {data._errors.to}
                                                    </p>
                                                )}
                                            </div>

                                            {/* CC/BCC Toggle */}
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowCcBcc(!showCcBcc)
                                                    }
                                                    className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 transition-colors hover:text-gray-800 focus:outline-none dark:text-gray-400 dark:hover:text-gray-300"
                                                >
                                                    <svg
                                                        className={`mr-1 h-4 w-4 transition-transform ${showCcBcc ? 'rotate-180' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 9l-7 7-7-7"
                                                        />
                                                    </svg>
                                                    {showCcBcc
                                                        ? 'Hide CC/BCC'
                                                        : 'Add CC/BCC'}
                                                </button>
                                            </div>

                                            {/* CC/BCC Fields */}
                                            {showCcBcc && (
                                                <div className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-600">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                            CC
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="email"
                                                                value={ccInput}
                                                                onChange={(e) =>
                                                                    setCcInput(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                onKeyPress={(
                                                                    e,
                                                                ) =>
                                                                    e.key ===
                                                                        'Enter' &&
                                                                    (e.preventDefault(),
                                                                    addRecipient(
                                                                        'cc',
                                                                        ccInput,
                                                                    ))
                                                                }
                                                                className="block w-full rounded-lg border-gray-300 shadow-sm transition-colors focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                                placeholder="cc@example.com"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    addRecipient(
                                                                        'cc',
                                                                        ccInput,
                                                                    )
                                                                }
                                                                className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {data.cc.map(
                                                                (
                                                                    email,
                                                                    index,
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 transition-colors hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                                                                    >
                                                                        {email}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                removeRecipient(
                                                                                    'cc',
                                                                                    index,
                                                                                )
                                                                            }
                                                                            className="ml-2 inline-flex text-indigo-600 hover:text-indigo-800 focus:outline-none dark:text-indigo-400 dark:hover:text-indigo-300"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                            BCC
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="email"
                                                                value={bccInput}
                                                                onChange={(e) =>
                                                                    setBccInput(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                onKeyPress={(
                                                                    e,
                                                                ) =>
                                                                    e.key ===
                                                                        'Enter' &&
                                                                    (e.preventDefault(),
                                                                    addRecipient(
                                                                        'bcc',
                                                                        bccInput,
                                                                    ))
                                                                }
                                                                className="block w-full rounded-lg border-gray-300 shadow-sm transition-colors focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                                placeholder="bcc@example.com"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    addRecipient(
                                                                        'bcc',
                                                                        bccInput,
                                                                    )
                                                                }
                                                                className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {data.bcc.map(
                                                                (
                                                                    email,
                                                                    index,
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 transition-colors hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                                                                    >
                                                                        {email}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                removeRecipient(
                                                                                    'bcc',
                                                                                    index,
                                                                                )
                                                                            }
                                                                            className="ml-2 inline-flex text-indigo-600 hover:text-indigo-800 focus:outline-none dark:text-indigo-400 dark:hover:text-indigo-300"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subject and Message Section */}
                                    <div className="overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                                        <div className="border-b border-gray-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-800">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                Email Content
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Compose your email subject and
                                                message
                                            </p>
                                        </div>
                                        <div className="space-y-6 bg-slate-50 p-6 dark:bg-slate-800/50">
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Subject{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.subject}
                                                    onChange={(e) =>
                                                        setData(
                                                            'subject',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={`block w-full rounded-lg shadow-sm transition-colors focus:border-indigo-500 focus:ring-indigo-500 ${
                                                        data._errors?.subject
                                                            ? 'border-red-300 dark:border-red-600'
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    } dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400`}
                                                    placeholder="Enter email subject"
                                                />
                                                {data._errors?.subject && (
                                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                        {data._errors.subject}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Message{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <textarea
                                                    value={data.message}
                                                    onChange={(e) =>
                                                        setData(
                                                            'message',
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={10}
                                                    className={`block w-full rounded-lg shadow-sm transition-colors focus:border-indigo-500 focus:ring-indigo-500 ${
                                                        data._errors?.message
                                                            ? 'border-red-300 dark:border-red-600'
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    } dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400`}
                                                    placeholder="Enter your message here..."
                                                />
                                                {data._errors?.message && (
                                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                        {data._errors.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Attachments Section */}
                                    <div className="overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                                        <div className="border-b border-gray-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-800">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                Attachments
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Add files to your email
                                                (optional)
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-6 dark:bg-slate-800/50">
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Files
                                                </label>
                                                <input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    multiple
                                                    className="block w-full cursor-pointer text-sm text-gray-500 transition-colors file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 dark:text-gray-400 dark:file:bg-indigo-900 dark:file:text-indigo-300 dark:hover:file:bg-indigo-800"
                                                />
                                            </div>
                                            {data.attachments &&
                                                data.attachments.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Selected Files:
                                                        </p>
                                                        <div className="space-y-2">
                                                            {Array.from(
                                                                data.attachments,
                                                            ).map(
                                                                (
                                                                    file,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700"
                                                                    >
                                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                            {
                                                                                file.name
                                                                            }
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                removeAttachment(
                                                                                    index,
                                                                                )
                                                                            }
                                                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                                        >
                                                                            <svg
                                                                                className="h-4 w-4"
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
                                                                                    d="M6 18L18 6M6 6l12 12"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            {errors.attachments && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                    {errors.attachments}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Templates and Quick Actions */}
                                <div className="space-y-6">
                                    {/* Quick Stats */}
                                    <div className="overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                                        <div className="border-b border-gray-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-800">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                Quick Stats
                                            </h4>
                                        </div>
                                        <div className="bg-slate-50 p-6 dark:bg-slate-800/50">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Recipients
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {data.to.length}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        CC
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {data.cc.length}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        BCC
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {data.bcc.length}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Attachments
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {data.attachments
                                                            ?.length || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Templates */}
                                    {templates.length > 0 && (
                                        <div className="overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                                            <div className="border-b border-gray-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-800">
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    Recent Templates
                                                </h4>
                                            </div>
                                            <div className="bg-slate-50 p-6 dark:bg-slate-800/50">
                                                <div className="space-y-3">
                                                    {templates
                                                        .slice(0, 3)
                                                        .map((template) => (
                                                            <button
                                                                key={
                                                                    template.id
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    loadTemplate(
                                                                        template,
                                                                    )
                                                                }
                                                                className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                                            >
                                                                <div className="font-medium text-gray-900 dark:text-white">
                                                                    {
                                                                        template.name
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {
                                                                        template.subject
                                                                    }
                                                                </div>
                                                            </button>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Section */}
                            <div className="overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                                <div className="bg-slate-50 p-6 dark:bg-slate-800/50">
                                    <div className="flex items-center justify-between">
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
                                            Sending this email will cost{' '}
                                            {data.to.length +
                                                data.cc.length +
                                                data.bcc.length}
                                            {data.to.length +
                                                data.cc.length +
                                                data.bcc.length ===
                                            1
                                                ? ' credit'
                                                : ' credits'}{' '}
                                            from your balance
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg
                                                        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
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
                                                            strokeWidth={2}
                                                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                        />
                                                    </svg>
                                                    Send Email
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                            <div className="p-6 text-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    You do not have permission to send emails.
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Please contact your administrator to request
                                    access.
                                </p>
                            </div>
                        </div>
                    )}
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
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
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

                        <div className="mb-4 flex gap-4">
                            <div className="flex-1">
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
                            <div className="flex gap-2">
                                <div className="w-48">
                                    <select
                                        value={groupFilter}
                                        onChange={(e) =>
                                            setGroupFilter(e.target.value)
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
                                disabled={contacts.length === 0}
                                className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Add All ({contacts.length})
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
                                            Email
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {filteredContacts.map((contact) => (
                                        <tr
                                            key={contact.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedContacts.some(
                                                        (c) =>
                                                            c.id === contact.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleContactSelection(
                                                            contact,
                                                        )
                                                    }
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
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
                                                                        className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                                                                    >
                                                                        {group}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {contact.email}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Selector Modal */}
            {showTemplateSelector && (
                <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
                    <div className="relative top-20 mx-auto w-3/4 rounded-md border bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Select Template
                            </h3>
                            <button
                                onClick={() => setShowTemplateSelector(false)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
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
                            <input
                                type="text"
                                value={templateSearchQuery}
                                onChange={(e) =>
                                    setTemplateSearchQuery(e.target.value)
                                }
                                placeholder="Search templates..."
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                            />
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {filteredTemplates.map((template) => (
                                        <tr
                                            key={template.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {template.name}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {template.subject}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {template.category ||
                                                        'Uncategorized'}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                        template.is_active
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }`}
                                                >
                                                    {template.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <button
                                                    onClick={() =>
                                                        loadTemplate(template)
                                                    }
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                >
                                                    Load
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
