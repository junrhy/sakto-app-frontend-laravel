import SettingsForm from '@/Components/Settings/SettingsForm';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useMemo } from 'react';

interface Settings {
    notifications: {
        email_notifications: boolean;
    };
}

const defaultSettings: Settings = {
    notifications: {
        email_notifications: true,
    },
};

interface Props {
    settings?: Settings;
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

export default function Settings({ settings = defaultSettings, auth }: Props) {
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

    const handleSubmit = async (data: Record<string, any>) => {
        await axios.post('/api/email/settings', data);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Notification Settings
                </h2>
            }
        >
            <Head title="Notification Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>
                                Configure your notification preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {canEdit ? (
                                <SettingsForm
                                    settings={settings}
                                    onSubmit={handleSubmit}
                                >
                                    {({ data, setData }) => (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>
                                                        Email Notifications
                                                    </Label>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Receive notifications
                                                        via email
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={
                                                        data.notifications
                                                            .email_notifications
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData(
                                                            'notifications.email_notifications',
                                                            checked,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                </SettingsForm>
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        You don't have permission to edit
                                        notification settings.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
