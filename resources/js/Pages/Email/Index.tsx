import React, { useState, ReactNode, useRef, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import axios from 'axios';

interface User {
    name: string;
    email: string;
}

interface Contact {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
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
    };
}

export default function Index({ auth }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCcBcc, setShowCcBcc] = useState(false);
    const [showContactSelector, setShowContactSelector] = useState(false);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [templateSearchQuery, setTemplateSearchQuery] = useState('');
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
                const templatesResponse = await axios.get('/email/templates/list');
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
            setData(prevData => ({
                ...prevData,
                _errors: validationErrors,
            }));
            return;
        }

        setIsSubmitting(true);

        try {
            // First, try to spend 1 credit
            const creditResponse = await axios.post('/credits/spend', {
                amount: 1,
                purpose: 'Email Sending',
                reference_id: `email_${Date.now()}`
            });

            if (!creditResponse.data.success) {
                toast.error('Insufficient credits to send email. Please purchase more credits.', {
                    duration: 5000,
                    position: 'top-right',
                });
                return;
            }

            const formData = new FormData();
            data.to.forEach(email => formData.append('to[]', email));
            formData.append('subject', data.subject);
            formData.append('message', data.message);
            data.cc.forEach(email => formData.append('cc[]', email));
            data.bcc.forEach(email => formData.append('bcc[]', email));
            data.attachments.forEach(file => formData.append('attachments[]', file));

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
            toast.error(error.response?.data?.message || 'Failed to send email. Please try again.', {
                duration: 5000,
                position: 'top-right',
            });
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
        setData(type, data[type].filter((_, i) => i !== index));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const maxSize = 20 * 1024 * 1024; // 20MB in bytes
        
        // Check file sizes
        const oversizedFiles = files.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            toast.error(`Some files exceed the 20MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`, {
                duration: 5000,
                position: 'top-right',
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }
        
        setData('attachments', files);
    };

    const removeAttachment = (index: number) => {
        setData('attachments', data.attachments.filter((_, i) => i !== index));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const toggleContactSelection = (contact: Contact) => {
        setSelectedContacts(prev => {
            const isSelected = prev.some(c => c.id === contact.id);
            if (isSelected) {
                return prev.filter(c => c.id !== contact.id);
            } else {
                return [...prev, contact];
            }
        });
    };

    const addSelectedContactsToRecipients = () => {
        const emails = selectedContacts.map(contact => contact.email);
        setData('to', [...new Set([...data.to, ...emails])]);
        setSelectedContacts([]);
        setShowContactSelector(false);
        toast.success('Selected contacts added to recipients');
    };

    const addAllContactsToRecipients = () => {
        const emails = contacts.map(contact => contact.email);
        setData('to', [...new Set([...data.to, ...emails])]);
        setShowContactSelector(false);
        toast.success('All contacts added to recipients');
    };

    const filteredContacts = contacts.filter(contact => 
        contact.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const loadTemplate = (template: EmailTemplate) => {
        setData({
            ...data,
            subject: template.subject,
            message: template.body
        });
        setShowTemplateSelector(false);
        toast.success('Template loaded successfully');
    };

    const filteredTemplates = templates.filter(template => 
        template.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        template.subject.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        (template.category?.toLowerCase() || '').includes(templateSearchQuery.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Email Sender</h2>}
        >
            <Head title="Email Sender" />

            <div className="py-12 bg-gray-50">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-lg sm:rounded-lg border border-gray-100">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Compose Email</h3>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Recipients Section */}
                                <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                To <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowContactSelector(true)}
                                                    className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none transition-colors"
                                                >
                                                    Select from Contacts
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTemplateSelector(true)}
                                                    className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none transition-colors"
                                                >
                                                    Load Template
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCcBcc(!showCcBcc)}
                                                    className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none transition-colors"
                                                >
                                                    {showCcBcc ? 'Hide CC/BCC' : 'Show CC/BCC'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="email"
                                                value={toInput}
                                                onChange={e => setToInput(e.target.value)}
                                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addRecipient('to', toInput))}
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                                placeholder="recipient@example.com"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => addRecipient('to', toInput)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {data.to.map((email, index) => (
                                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 transition-colors hover:bg-indigo-200">
                                                    {email}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRecipient('to', index)}
                                                        className="ml-2 inline-flex text-indigo-600 hover:text-indigo-800 focus:outline-none"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        {data._errors?.to && (
                                            <p className="mt-2 text-sm text-red-600">{data._errors.to}</p>
                                        )}
                                    </div>

                                    {showCcBcc && (
                                        <div className="space-y-6 border-t border-gray-200 pt-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">CC</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="email"
                                                        value={ccInput}
                                                        onChange={e => setCcInput(e.target.value)}
                                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addRecipient('cc', ccInput))}
                                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                                        placeholder="cc@example.com"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => addRecipient('cc', ccInput)}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {data.cc.map((email, index) => (
                                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 transition-colors hover:bg-indigo-200">
                                                            {email}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRecipient('cc', index)}
                                                                className="ml-2 inline-flex text-indigo-600 hover:text-indigo-800 focus:outline-none"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">BCC</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="email"
                                                        value={bccInput}
                                                        onChange={e => setBccInput(e.target.value)}
                                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addRecipient('bcc', bccInput))}
                                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                                        placeholder="bcc@example.com"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => addRecipient('bcc', bccInput)}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {data.bcc.map((email, index) => (
                                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 transition-colors hover:bg-indigo-200">
                                                            {email}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRecipient('bcc', index)}
                                                                className="ml-2 inline-flex text-indigo-600 hover:text-indigo-800 focus:outline-none"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Email Content Section */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Subject <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.subject}
                                            onChange={e => setData('subject', e.target.value)}
                                            className={`block w-full rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors ${
                                                data._errors?.subject ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Email subject"
                                        />
                                        {data._errors?.subject && (
                                            <p className="mt-2 text-sm text-red-600">{data._errors.subject}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Message <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={data.message}
                                            onChange={e => setData('message', e.target.value)}
                                            rows={8}
                                            className={`block w-full rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors ${
                                                data._errors?.message ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Type your message here..."
                                        />
                                        <p className="mt-2 text-sm text-gray-500">HTML formatting is supported (e.g. &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;a&gt;links&lt;/a&gt;)</p>
                                        {data._errors?.message && (
                                            <p className="mt-2 text-sm text-red-600">{data._errors.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Attachments</label>
                                        <div className="mt-1">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                multiple
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors cursor-pointer"
                                            />
                                        </div>
                                        {data.attachments.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                {data.attachments.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <span className="text-sm text-gray-600">{file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAttachment(index)}
                                                            className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
                                                        >
                                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {errors.attachments && <p className="mt-2 text-sm text-red-600">{errors.attachments}</p>}
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <p className="text-sm text-gray-600 mb-4 text-center">
                                        Sending this email will cost 1 credit from your balance
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Email'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Selector Modal */}
            {showContactSelector && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Select Contacts</h3>
                            <button
                                onClick={() => setShowContactSelector(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search contacts..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex justify-between mb-4">
                            <button
                                onClick={addSelectedContactsToRecipients}
                                disabled={selectedContacts.length === 0}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Selected ({selectedContacts.length})
                            </button>
                            <button
                                onClick={addAllContactsToRecipients}
                                disabled={contacts.length === 0}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add All ({contacts.length})
                            </button>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Select
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredContacts.map((contact) => (
                                        <tr key={contact.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedContacts.some(c => c.id === contact.id)}
                                                    onChange={() => toggleContactSelection(contact)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {contact.first_name} {contact.last_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{contact.email}</div>
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
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Select Template</h3>
                            <button
                                onClick={() => setShowTemplateSelector(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                value={templateSearchQuery}
                                onChange={(e) => setTemplateSearchQuery(e.target.value)}
                                placeholder="Search templates..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredTemplates.map((template) => (
                                        <tr key={template.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {template.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {template.subject}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {template.category || 'Uncategorized'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    template.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {template.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => loadTemplate(template)}
                                                    className="text-indigo-600 hover:text-indigo-900"
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
