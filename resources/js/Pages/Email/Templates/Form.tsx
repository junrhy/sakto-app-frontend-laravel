import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import axios from 'axios';

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
    const [previewData, setPreviewData] = useState<Record<string, string>>({});
    const [preview, setPreview] = useState<{ subject: string; body: string } | null>(null);

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

    const handlePreview = async () => {
        try {
            const response = await axios.post(
                route('email.templates.preview', template?.id),
                { variables: previewData }
            );
            setPreview(response.data.data);
        } catch (error) {
            toast.error('Failed to generate preview');
        }
    };

    const addVariable = () => {
        const newVariable = prompt('Enter variable name (without {{}}):');
        if (newVariable) {
            setData('variables', [...data.variables, newVariable]);
        }
    };

    return (
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Template Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                Subject
                            </label>
                            <input
                                type="text"
                                id="subject"
                                value={data.subject}
                                onChange={e => setData('subject', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.subject && <div className="text-red-500 text-sm mt-1">{errors.subject}</div>}
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <input
                                type="text"
                                id="category"
                                value={data.category}
                                onChange={e => setData('category', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            {errors.category && <div className="text-red-500 text-sm mt-1">{errors.category}</div>}
                        </div>

                        <div>
                            <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                                Body
                            </label>
                            <textarea
                                id="body"
                                value={data.body}
                                onChange={e => setData('body', e.target.value)}
                                rows={10}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                            {errors.body && <div className="text-red-500 text-sm mt-1">{errors.body}</div>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">
                                    Variables
                                </label>
                                <button
                                    type="button"
                                    onClick={addVariable}
                                    className="text-sm text-indigo-600 hover:text-indigo-900"
                                >
                                    Add Variable
                                </button>
                            </div>
                            <div className="mt-2 space-y-2">
                                {data.variables.map((variable, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-500">{`{{${variable}}}`}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData('variables', data.variables.filter((_, i) => i !== index));
                                            }}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Active</span>
                            </label>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={handlePreview}
                                className="inline-flex items-center px-4 py-2 bg-gray-100 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                Preview
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Update Template'}
                            </button>
                        </div>
                    </form>

                    {preview && (
                        <div className="mt-8 border-t pt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700">Subject:</h4>
                                    <p className="mt-1 text-sm text-gray-900">{preview.subject}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700">Body:</h4>
                                    <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{preview.body}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 