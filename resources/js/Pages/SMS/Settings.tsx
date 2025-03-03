import React from 'react';
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

interface Props {
    settings: Settings;
    auth: {
        user: any;
    };
}

export default function Settings({ settings, auth }: Props) {
    const handleSubmit = async (data: Record<string, any>) => {
        await axios.post('/api/sms/settings', data);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-white leading-tight">
                    SMS Settings
                </h2>
            }
        >
            <Head title="SMS Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>SMS Settings</CardTitle>
                            <CardDescription>
                                Configure your SMS provider settings, templates, and messaging preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SettingsForm settings={settings} onSubmit={handleSubmit}>
                                {({ data, setData }) => (
                                    <Tabs defaultValue="twilio" className="space-y-4">
                                        <TabsList>
                                            <TabsTrigger value="twilio">Twilio</TabsTrigger>
                                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                                            <TabsTrigger value="templates">Templates</TabsTrigger>
                                            <TabsTrigger value="limits">Limits</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="twilio">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Account SID</Label>
                                                    <Input
                                                        value={data.twilio.account_sid}
                                                        onChange={(e) => setData('twilio.account_sid', e.target.value)}
                                                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Auth Token</Label>
                                                    <Input
                                                        type="password"
                                                        value={data.twilio.auth_token}
                                                        onChange={(e) => setData('twilio.auth_token', e.target.value)}
                                                        placeholder="••••••••"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Phone Number</Label>
                                                    <Input
                                                        value={data.twilio.phone_number}
                                                        onChange={(e) => setData('twilio.phone_number', e.target.value)}
                                                        placeholder="+1234567890"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Default Country Code</Label>
                                                    <Input
                                                        value={data.twilio.default_country_code}
                                                        onChange={(e) => setData('twilio.default_country_code', e.target.value)}
                                                        placeholder="+1"
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="notifications">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Enable Reminders</Label>
                                                        <div className="text-sm text-gray-500">
                                                            Send automated reminder messages
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.notifications.enable_reminders}
                                                        onCheckedChange={(checked) => setData('notifications.enable_reminders', checked)}
                                                    />
                                                </div>

                                                {data.notifications.enable_reminders && (
                                                    <div className="space-y-2">
                                                        <Label>Reminder Time</Label>
                                                        <Select
                                                            value={data.notifications.reminder_time}
                                                            onValueChange={(value) => setData('notifications.reminder_time', value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select time" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="1h">1 hour before</SelectItem>
                                                                <SelectItem value="2h">2 hours before</SelectItem>
                                                                <SelectItem value="24h">24 hours before</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Delivery Reports</Label>
                                                        <div className="text-sm text-gray-500">
                                                            Track message delivery status
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.notifications.enable_delivery_reports}
                                                        onCheckedChange={(checked) => setData('notifications.enable_delivery_reports', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Auto Reply</Label>
                                                        <div className="text-sm text-gray-500">
                                                            Send automatic responses
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.notifications.enable_auto_reply}
                                                        onCheckedChange={(checked) => setData('notifications.enable_auto_reply', checked)}
                                                    />
                                                </div>

                                                {data.notifications.enable_auto_reply && (
                                                    <div className="space-y-2">
                                                        <Label>Auto Reply Message</Label>
                                                        <Textarea
                                                            value={data.notifications.auto_reply_message}
                                                            onChange={(e) => setData('notifications.auto_reply_message', e.target.value)}
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
                                                        <Label>Enable Templates</Label>
                                                        <div className="text-sm text-gray-500">
                                                            Use predefined message templates
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.templates.enabled}
                                                        onCheckedChange={(checked) => setData('templates.enabled', checked)}
                                                    />
                                                </div>

                                                {data.templates.enabled && (
                                                    <div className="space-y-4">
                                                        {data.templates.message_templates.map((template: { name: string; content: string; variables: string[] }, index: number) => (
                                                            <div key={index} className="space-y-2 p-4 border rounded-lg">
                                                                <div className="space-y-2">
                                                                    <Label>Template Name</Label>
                                                                    <Input
                                                                        value={template.name}
                                                                        onChange={(e) => {
                                                                            const newTemplates = [...data.templates.message_templates];
                                                                            newTemplates[index].name = e.target.value;
                                                                            setData('templates.message_templates', newTemplates);
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label>Message Content</Label>
                                                                    <Textarea
                                                                        value={template.content}
                                                                        onChange={(e) => {
                                                                            const newTemplates = [...data.templates.message_templates];
                                                                            newTemplates[index].content = e.target.value;
                                                                            setData('templates.message_templates', newTemplates);
                                                                        }}
                                                                        rows={3}
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label>Variables</Label>
                                                                    <Textarea
                                                                        value={template.variables.join('\n')}
                                                                        onChange={(e) => {
                                                                            const newTemplates = [...data.templates.message_templates];
                                                                            newTemplates[index].variables = e.target.value.split('\n');
                                                                            setData('templates.message_templates', newTemplates);
                                                                        }}
                                                                        placeholder="{{name}}&#10;{{date}}&#10;{{time}}"
                                                                        rows={3}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="limits">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Maximum Messages per Day</Label>
                                                    <Input
                                                        type="number"
                                                        value={data.limits.max_messages_per_day}
                                                        onChange={(e) => setData('limits.max_messages_per_day', parseInt(e.target.value))}
                                                        min={1}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Maximum Recipients per Message</Label>
                                                    <Input
                                                        type="number"
                                                        value={data.limits.max_recipients_per_message}
                                                        onChange={(e) => setData('limits.max_recipients_per_message', parseInt(e.target.value))}
                                                        min={1}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Blocked Keywords</Label>
                                                    <Textarea
                                                        value={data.limits.blocked_keywords.join('\n')}
                                                        onChange={(e) => setData('limits.blocked_keywords', e.target.value.split('\n'))}
                                                        placeholder="spam&#10;scam&#10;adult"
                                                        rows={4}
                                                    />
                                                    <p className="text-sm text-gray-500">
                                                        Enter one keyword per line
                                                    </p>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                )}
                            </SettingsForm>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 