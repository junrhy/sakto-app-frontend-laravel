import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTheme } from "@/Components/ThemeProvider";

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    category: string | null;
    variables: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    template: EmailTemplate;
}

export default function Show({ template }: Props) {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Email Template Details</h2>}
        >
            <Head title="Email Template Details" />

            <div className="py-12 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{template.name}</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">View and manage template details</p>
                            </div>
                            <div className="flex space-x-3">
                                <Link
                                    href={route('email.templates.edit', template.id)}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg font-medium text-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Template
                                </Link>
                                <Link
                                    href={route('email.templates.index')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-lg font-medium text-sm text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to List
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Template Information */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg sm:rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Template Information</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Basic details about this template</p>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</h5>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{template.subject}</p>
                                </div>

                                <div>
                                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h5>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{template.category || 'Uncategorized'}</p>
                                </div>

                                <div>
                                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h5>
                                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        template.is_active
                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                    }`}>
                                        {template.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div>
                                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Variables</h5>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {template.variables.map((variable, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                                            >
                                                {`{{${variable}}}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Template Content */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg sm:rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Template Content</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">The email body content with HTML formatting</p>
                            </div>
                            <div className="p-6">
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: template.body }} />
                                </div>
                            </div>
                        </div>

                        {/* Template Metadata */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg sm:rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Template Metadata</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Creation and modification dates</p>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</h5>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{new Date(template.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h5>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{new Date(template.updated_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 