import React, { useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SettingsForm from '@/Components/Settings/SettingsForm';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/Components/ui/tabs";
import { Switch } from "@/Components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import axios from 'axios';

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
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager') || auth.selectedTeamMember.roles.includes('user');
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const handleSubmit = async (data: Record<string, any>) => {
        await axios.post('/api/email/settings', data);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Notification Settings
                </h2>
            }
        >
            <Head title="Notification Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>
                                Configure your notification preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {canEdit ? (
                                <SettingsForm settings={settings} onSubmit={handleSubmit}>
                                    {({ data, setData }) => (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Email Notifications</Label>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Receive notifications via email
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={data.notifications.email_notifications}
                                                    onCheckedChange={(checked) => setData('notifications.email_notifications', checked)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </SettingsForm>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        You don't have permission to edit notification settings.
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