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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{template.name}</h3>
                                <div className="flex space-x-4">
                                    <Link
                                        href={route('email.templates.edit', template.id)}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Edit Template
                                    </Link>
                                    <Link
                                        href={route('email.templates.index')}
                                        className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Back to List
                                    </Link>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</h4>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{template.subject}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h4>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{template.category || 'Uncategorized'}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        template.is_active
                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                    }`}>
                                        {template.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Variables</h4>
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

                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Body</h4>
                                    <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: template.body }} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div>
                                        <h4 className="font-medium">Created At</h4>
                                        <p>{new Date(template.created_at).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Last Updated</h4>
                                        <p>{new Date(template.updated_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 