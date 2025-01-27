import React, { useState, ReactNode, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface User {
    name: string;
    email: string;
}

interface Props {
    auth: {
        user: User;
    };
}

export default function Index({ auth }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data, setData, reset, errors } = useForm({
        to: [] as string[],
        subject: '',
        message: '',
        cc: [] as string[],
        bcc: [] as string[],
        attachments: [] as File[],
    });

    const [toInput, setToInput] = useState('');
    const [ccInput, setCcInput] = useState('');
    const [bccInput, setBccInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            data.to.forEach(email => formData.append('to[]', email));
            formData.append('subject', data.subject);
            formData.append('message', data.message);
            data.cc.forEach(email => formData.append('cc[]', email));
            data.bcc.forEach(email => formData.append('bcc[]', email));
            data.attachments.forEach(file => formData.append('attachments[]', file));

            await axios.post('/email/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Email sent successfully');
            reset();
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            toast.error('Failed to send email');
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
        setData('attachments', files);
    };

    const removeAttachment = (index: number) => {
        setData('attachments', data.attachments.filter((_, i) => i !== index));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Email Sender</h2>}
        >
            <Head title="Email Sender" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">To</label>
                                    <div className="mt-1 flex gap-2">
                                        <input
                                            type="email"
                                            value={toInput}
                                            onChange={e => setToInput(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addRecipient('to', toInput))}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="recipient@example.com"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addRecipient('to', toInput)}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {data.to.map((email, index) => (
                                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {email}
                                                <button
                                                    type="button"
                                                    onClick={() => removeRecipient('to', index)}
                                                    className="ml-1 inline-flex text-indigo-400 hover:text-indigo-600"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    {errors.to && <p className="mt-1 text-sm text-red-600">{errors.to}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">CC</label>
                                    <div className="mt-1 flex gap-2">
                                        <input
                                            type="email"
                                            value={ccInput}
                                            onChange={e => setCcInput(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addRecipient('cc', ccInput))}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="cc@example.com"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addRecipient('cc', ccInput)}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {data.cc.map((email, index) => (
                                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {email}
                                                <button
                                                    type="button"
                                                    onClick={() => removeRecipient('cc', index)}
                                                    className="ml-1 inline-flex text-indigo-400 hover:text-indigo-600"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">BCC</label>
                                    <div className="mt-1 flex gap-2">
                                        <input
                                            type="email"
                                            value={bccInput}
                                            onChange={e => setBccInput(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addRecipient('bcc', bccInput))}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="bcc@example.com"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addRecipient('bcc', bccInput)}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {data.bcc.map((email, index) => (
                                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {email}
                                                <button
                                                    type="button"
                                                    onClick={() => removeRecipient('bcc', index)}
                                                    className="ml-1 inline-flex text-indigo-400 hover:text-indigo-600"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                                    <input
                                        type="text"
                                        value={data.subject}
                                        onChange={e => setData('subject', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Email subject"
                                    />
                                    {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Message</label>
                                    <textarea
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                        rows={6}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Type your message here..."
                                    />
                                    {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Attachments</label>
                                    <div className="mt-1">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            multiple
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                        {errors.attachments && <p className="mt-1 text-sm text-red-600">{errors.attachments}</p>}
                                    </div>
                                    {data.attachments.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {data.attachments.map((file, index) => (
                                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    {file.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(index)}
                                                        className="ml-1 inline-flex text-indigo-400 hover:text-indigo-600"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Email'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
