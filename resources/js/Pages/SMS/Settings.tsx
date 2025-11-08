import SettingsForm from '@/Components/Settings/SettingsForm';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Project, User } from '@/types/index';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useMemo } from 'react';

interface Settings {
    twilio: {
        account_sid: string;
        auth_token: string;
        phone_number: string;
        default_country_code: string;
    };
    notifications: {
        enable_reminders: boolean;
        reminder_time: string;
        enable_delivery_reports: boolean;
        enable_auto_reply: boolean;
        auto_reply_message: string;
    };
    templates: {
        enabled: boolean;
        message_templates: {
            name: string;
            content: string;
            variables: string[];
        }[];
    };
    limits: {
        max_messages_per_day: number;
        max_recipients_per_message: number;
        blocked_keywords: string[];
    };
}

interface Props extends PageProps {
    settings: Settings;
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
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

export default function Settings({ settings, auth }: Props) {
    const handleSubmit = async (data: Record<string, any>) => {
        await axios.post('/api/sms/settings', data);
    };

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
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            header={
                <h2 className="text-xl font-semibold leading-tight text-white">
                    SMS Settings
                </h2>
            }
        >
            <Head title="SMS Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>SMS Settings</CardTitle>
                            <CardDescription>
                                Configure your SMS provider settings, templates,
                                and messaging preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {canEdit ? (
                                <SettingsForm
                                    settings={
                                        settings as unknown as Record<
                                            string,
                                            unknown
                                        >
                                    }
                                    onSubmit={handleSubmit}
                                >
                                    {({ data, setData }) => {
                                        const twilio =
                                            (data.twilio as {
                                                account_sid?: string;
                                                auth_token?: string;
                                                phone_number?: string;
                                                default_country_code?: string;
                                            }) || {};
                                        const notifications =
                                            (data.notifications as {
                                                enable_reminders?: boolean;
                                                reminder_time?: string;
                                                enable_delivery_reports?: boolean;
                                                enable_auto_reply?: boolean;
                                                auto_reply_message?: string;
                                            }) || {};
                                        interface MessageTemplate {
                                            name: string;
                                            content: string;
                                            variables: string[];
                                        }
                                        const templates =
                                            (data.templates as {
                                                enabled?: boolean;
                                                message_templates?: MessageTemplate[];
                                            }) || {};
                                        const limits =
                                            (data.limits as {
                                                max_messages_per_day?: number;
                                                max_recipients_per_message?: number;
                                                blocked_keywords?: string[];
                                            }) || {};
                                        return (
                                            <Tabs
                                                defaultValue="twilio"
                                                className="space-y-4"
                                            >
                                                <TabsList>
                                                    <TabsTrigger value="twilio">
                                                        Twilio
                                                    </TabsTrigger>
                                                    <TabsTrigger value="notifications">
                                                        Notifications
                                                    </TabsTrigger>
                                                    <TabsTrigger value="templates">
                                                        Templates
                                                    </TabsTrigger>
                                                    <TabsTrigger value="limits">
                                                        Limits
                                                    </TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="twilio">
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label>
                                                                Account SID
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    twilio.account_sid ??
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'twilio.account_sid',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>
                                                                Auth Token
                                                            </Label>
                                                            <Input
                                                                type="password"
                                                                value={
                                                                    twilio.auth_token ??
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'twilio.auth_token',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="••••••••"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>
                                                                Phone Number
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    twilio.phone_number ??
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'twilio.phone_number',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="+1234567890"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>
                                                                Default Country
                                                                Code
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    twilio.default_country_code ??
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'twilio.default_country_code',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="+1"
                                                            />
                                                        </div>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="notifications">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-0.5">
                                                                <Label>
                                                                    Enable
                                                                    Reminders
                                                                </Label>
                                                                <div className="text-sm text-gray-500">
                                                                    Send
                                                                    automated
                                                                    reminder
                                                                    messages
                                                                </div>
                                                            </div>
                                                            <Switch
                                                                checked={
                                                                    notifications.enable_reminders ??
                                                                    false
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    setData(
                                                                        'notifications.enable_reminders',
                                                                        checked,
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        {notifications.enable_reminders && (
                                                            <div className="space-y-2">
                                                                <Label>
                                                                    Reminder
                                                                    Time
                                                                </Label>
                                                                <Select
                                                                    value={
                                                                        notifications.reminder_time ??
                                                                        ''
                                                                    }
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        setData(
                                                                            'notifications.reminder_time',
                                                                            value,
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select time" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="1h">
                                                                            1
                                                                            hour
                                                                            before
                                                                        </SelectItem>
                                                                        <SelectItem value="2h">
                                                                            2
                                                                            hours
                                                                            before
                                                                        </SelectItem>
                                                                        <SelectItem value="24h">
                                                                            24
                                                                            hours
                                                                            before
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-0.5">
                                                                <Label>
                                                                    Delivery
                                                                    Reports
                                                                </Label>
                                                                <div className="text-sm text-gray-500">
                                                                    Track
                                                                    message
                                                                    delivery
                                                                    status
                                                                </div>
                                                            </div>
                                                            <Switch
                                                                checked={
                                                                    notifications.enable_delivery_reports ??
                                                                    false
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    setData(
                                                                        'notifications.enable_delivery_reports',
                                                                        checked,
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-0.5">
                                                                <Label>
                                                                    Auto Reply
                                                                </Label>
                                                                <div className="text-sm text-gray-500">
                                                                    Send
                                                                    automatic
                                                                    responses
                                                                </div>
                                                            </div>
                                                            <Switch
                                                                checked={
                                                                    notifications.enable_auto_reply ??
                                                                    false
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    setData(
                                                                        'notifications.enable_auto_reply',
                                                                        checked,
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        {notifications.enable_auto_reply && (
                                                            <div className="space-y-2">
                                                                <Label>
                                                                    Auto Reply
                                                                    Message
                                                                </Label>
                                                                <Textarea
                                                                    value={
                                                                        notifications.auto_reply_message ??
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            'notifications.auto_reply_message',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="Thank you for your message. We'll get back to you soon."
                                                                    rows={3}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="templates">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="space-y-0.5">
                                                                <Label>
                                                                    Enable
                                                                    Templates
                                                                </Label>
                                                                <div className="text-sm text-gray-500">
                                                                    Use
                                                                    predefined
                                                                    message
                                                                    templates
                                                                </div>
                                                            </div>
                                                            <Switch
                                                                checked={
                                                                    templates.enabled ??
                                                                    false
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    setData(
                                                                        'templates.enabled',
                                                                        checked,
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        {templates.enabled && (
                                                            <div className="space-y-4">
                                                                {(
                                                                    (templates.message_templates ||
                                                                        []) as MessageTemplate[]
                                                                ).map(
                                                                    (
                                                                        template,
                                                                        index: number,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="space-y-2 rounded-lg border p-4"
                                                                        >
                                                                            <div className="space-y-2">
                                                                                <Label>
                                                                                    Template
                                                                                    Name
                                                                                </Label>
                                                                                <Input
                                                                                    value={
                                                                                        template.name
                                                                                    }
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) => {
                                                                                        const newTemplates =
                                                                                            [
                                                                                                ...((templates.message_templates ||
                                                                                                    []) as MessageTemplate[]),
                                                                                            ];
                                                                                        (
                                                                                            newTemplates[
                                                                                                index
                                                                                            ] as MessageTemplate
                                                                                        ).name =
                                                                                            e.target.value;
                                                                                        setData(
                                                                                            'templates.message_templates',
                                                                                            newTemplates,
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </div>

                                                                            <div className="space-y-2">
                                                                                <Label>
                                                                                    Message
                                                                                    Content
                                                                                </Label>
                                                                                <Textarea
                                                                                    value={
                                                                                        template.content
                                                                                    }
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) => {
                                                                                        const newTemplates =
                                                                                            [
                                                                                                ...((templates.message_templates ||
                                                                                                    []) as MessageTemplate[]),
                                                                                            ];
                                                                                        (
                                                                                            newTemplates[
                                                                                                index
                                                                                            ] as MessageTemplate
                                                                                        ).content =
                                                                                            e.target.value;
                                                                                        setData(
                                                                                            'templates.message_templates',
                                                                                            newTemplates,
                                                                                        );
                                                                                    }}
                                                                                    rows={
                                                                                        3
                                                                                    }
                                                                                />
                                                                            </div>

                                                                            <div className="space-y-2">
                                                                                <Label>
                                                                                    Variables
                                                                                </Label>
                                                                                <Textarea
                                                                                    value={template.variables.join(
                                                                                        '\n',
                                                                                    )}
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) => {
                                                                                        const newTemplates =
                                                                                            [
                                                                                                ...((templates.message_templates ||
                                                                                                    []) as MessageTemplate[]),
                                                                                            ];
                                                                                        (
                                                                                            newTemplates[
                                                                                                index
                                                                                            ] as MessageTemplate
                                                                                        ).variables =
                                                                                            e.target.value.split(
                                                                                                '\n',
                                                                                            );
                                                                                        setData(
                                                                                            'templates.message_templates',
                                                                                            newTemplates,
                                                                                        );
                                                                                    }}
                                                                                    placeholder="{{name}}&#10;{{date}}&#10;{{time}}"
                                                                                    rows={
                                                                                        3
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="limits">
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label>
                                                                Maximum Messages
                                                                per Day
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                value={
                                                                    limits.max_messages_per_day ??
                                                                    0
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'limits.max_messages_per_day',
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                                min={1}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>
                                                                Maximum
                                                                Recipients per
                                                                Message
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                value={
                                                                    limits.max_recipients_per_message ??
                                                                    0
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'limits.max_recipients_per_message',
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                                min={1}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>
                                                                Blocked Keywords
                                                            </Label>
                                                            <Textarea
                                                                value={(
                                                                    limits.blocked_keywords ||
                                                                    []
                                                                ).join('\n')}
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'limits.blocked_keywords',
                                                                        e.target.value.split(
                                                                            '\n',
                                                                        ),
                                                                    )
                                                                }
                                                                placeholder="spam&#10;scam&#10;adult"
                                                                rows={4}
                                                            />
                                                            <p className="text-sm text-gray-500">
                                                                Enter one
                                                                keyword per line
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        );
                                    }}
                                </SettingsForm>
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-gray-500">
                                        You don't have permission to edit SMS
                                        settings.
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
