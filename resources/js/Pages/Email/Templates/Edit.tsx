import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
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
    auth: {
        user: {
            name: string;
            is_admin?: boolean;
        };
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

export default function Edit({ template, auth }: Props) {
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

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Edit Email Template
                </h2>
            }
        >
            <Head title="Edit Email Template" />

            <div className="py-12">
                {canEdit ? (
                    <Form template={template} mode="edit" />
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            You don't have permission to edit email templates.
                        </p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
