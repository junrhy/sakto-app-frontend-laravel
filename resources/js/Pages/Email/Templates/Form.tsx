import { useTheme } from '@/Components/ThemeProvider';
import { useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface EmailTemplate {
    id?: number;
    name: string;
    subject: string;
    body: string;
    category: string | null;
    variables: string[];
    is_active: boolean;
}

interface Props {
    template?: EmailTemplate;
    mode: 'create' | 'edit';
}

export default function Form({ template, mode }: Props) {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    const [previewData, setPreviewData] = useState<Record<string, string>>({});
    const [preview, setPreview] = useState<{
        subject: string;
        body: string;
    } | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: template?.name || '',
        subject: template?.subject || '',
        body: template?.body || '',
        category: template?.category || '',
        variables: template?.variables || [],
        is_active: template?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            post(route('email.templates.store'), {
                onSuccess: () => {
                    toast.success('Template created successfully');
                    reset();
                },
                onError: () => {
                    toast.error('Failed to create template');
                },
            });
        } else {
            put(route('email.templates.update', template?.id), {
                onSuccess: () => {
                    toast.success('Template updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update template');
                },
            });
        }
    };

    const addVariable = () => {
        const newVariable = prompt('Enter variable name (without {{}}):');
        if (newVariable) {
            setData('variables', [...data.variables, newVariable]);
        }
    };

    return (
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {mode === 'create'
                                ? 'Create New Template'
                                : 'Edit Template'}
                        </h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {mode === 'create'
                                ? 'Create a new email template for consistent messaging'
                                : 'Update your email template'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Basic Information
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Template name, subject, and category
                        </p>
                    </div>
                    <div className="space-y-6 p-6">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Template Name{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 sm:text-sm"
                                placeholder="Enter template name"
                                required
                            />
                            {errors.name && (
                                <div className="mt-1 text-sm text-red-500 dark:text-red-400">
                                    {errors.name}
                                </div>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="subject"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="subject"
                                value={data.subject}
                                onChange={(e) =>
                                    setData('subject', e.target.value)
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 sm:text-sm"
                                placeholder="Enter email subject"
                                required
                            />
                            {errors.subject && (
                                <div className="mt-1 text-sm text-red-500 dark:text-red-400">
                                    {errors.subject}
                                </div>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="category"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Category
                            </label>
                            <input
                                type="text"
                                id="category"
                                value={data.category}
                                onChange={(e) =>
                                    setData('category', e.target.value)
                                }
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 sm:text-sm"
                                placeholder="e.g., Marketing, Newsletter, Welcome"
                            />
                            {errors.category && (
                                <div className="mt-1 text-sm text-red-500 dark:text-red-400">
                                    {errors.category}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Template Content */}
                <div className="overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Template Content
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Write your email body with HTML formatting support
                        </p>
                    </div>
                    <div className="p-6">
                        <div>
                            <label
                                htmlFor="body"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Body <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="body"
                                value={data.body}
                                onChange={(e) =>
                                    setData('body', e.target.value)
                                }
                                rows={12}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 sm:text-sm"
                                placeholder="Write your email content here... HTML formatting is supported"
                                required
                            />
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                HTML formatting is supported (e.g.
                                &lt;b&gt;bold&lt;/b&gt;,
                                &lt;i&gt;italic&lt;/i&gt;,
                                &lt;a&gt;links&lt;/a&gt;)
                            </p>
                            {errors.body && (
                                <div className="mt-1 text-sm text-red-500 dark:text-red-400">
                                    {errors.body}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Variables */}
                <div className="overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Template Variables
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Add dynamic variables to your template
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addVariable}
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
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Add Variable
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3">
                            {data.variables.map((variable, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                                >
                                    <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{`{{${variable}}}`}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData(
                                                'variables',
                                                data.variables.filter(
                                                    (_, i) => i !== index,
                                                ),
                                            );
                                        }}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {data.variables.length === 0 && (
                                <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No variables added yet. Click "Add Variable"
                                    to create dynamic placeholders.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Template Settings */}
                <div className="overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                    <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Template Settings
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Configure template status and options
                        </p>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) =>
                                    setData('is_active', e.target.checked)
                                }
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <label
                                htmlFor="is_active"
                                className="ml-3 text-sm text-gray-700 dark:text-gray-300"
                            >
                                Active - This template can be used for sending
                                emails
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                    <div className="p-6">
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <svg
                                            className="-ml-1 mr-3 h-4 w-4 animate-spin text-white"
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
                                        Saving...
                                    </>
                                ) : (
                                    <>
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
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        {mode === 'create'
                                            ? 'Create Template'
                                            : 'Update Template'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
