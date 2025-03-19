import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Form from './Form';

export default function Create() {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Email Template</h2>}
        >
            <Head title="Create Email Template" />

            <div className="py-12">
                <Form mode="create" />
            </div>
        </AuthenticatedLayout>
    );
} 