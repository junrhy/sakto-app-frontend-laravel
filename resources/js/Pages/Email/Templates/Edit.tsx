import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Form from './Form';

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    category: string | null;
    variables: string[];
    is_active: boolean;
}

interface Props {
    template: EmailTemplate;
}

export default function Edit({ template }: Props) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Email Template</h2>}
        >
            <Head title="Edit Email Template" />

            <div className="py-12">
                <Form template={template} mode="edit" />
            </div>
        </AuthenticatedLayout>
    );
} 