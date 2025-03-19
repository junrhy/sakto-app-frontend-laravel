import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { toast } from 'sonner';
import axios from 'axios';

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    category: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    templates: EmailTemplate[];
}

export default function Index({ templates: initialTemplates }: Props) {
    const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this template?')) {
            return;
        }

        setIsDeleting(id);
        try {
            await axios.delete(`/email/templates/${id}`);
            setTemplates(templates.filter(template => template.id !== id));
            toast.success('Template deleted successfully');
        } catch (error) {
            toast.error('Failed to delete template');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const response = await axios.patch(`/email/templates/${id}/toggle-status`);
            if (response.data.success) {
                setTemplates(templates.map(template => 
                    template.id === id 
                        ? { ...template, is_active: !currentStatus }
                        : template
                ));
                toast.success(`Template ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            }
        } catch (error) {
            toast.error('Failed to update template status');
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Email Templates</h2>}
        >
            <Head title="Email Templates" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
                                <Link
                                    href={route('email.templates.create')}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Create Template
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Last Updated
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {templates.map((template) => (
                                            <tr key={template.id}>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(template.updated_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-3">
                                                        <Link
                                                            href={route('email.templates.show', template.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={route('email.templates.edit', template.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleToggleStatus(template.id, template.is_active)}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                        >
                                                            {template.is_active ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(template.id)}
                                                            disabled={isDeleting === template.id}
                                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                        >
                                                            {isDeleting === template.id ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 