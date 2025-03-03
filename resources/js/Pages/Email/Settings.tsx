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
    smtp: {
        host: string;
        port: number;
        encryption: string;
        username: string;
        password: string;
    };
    sender: {
        from_name: string;
        from_email: string;
        reply_to: string;
        signature: string;
    };
    attachments: {
        max_size: number;
        max_files: number;
        allowed_types: string[];
    };
    templates: {
        enabled: boolean;
        default_language: string;
        custom_variables: string[];
    };
}

const defaultSettings: Settings = {
    smtp: {
        host: '',
        port: 587,
        encryption: 'tls',
        username: '',
        password: '',
    },
    sender: {
        from_name: '',
        from_email: '',
        reply_to: '',
        signature: '',
    },
    attachments: {
        max_size: 10,
        max_files: 5,
        allowed_types: ['pdf', 'doc', 'docx', 'jpg', 'png', 'gif'],
    },
    templates: {
        enabled: false,
        default_language: 'en',
        custom_variables: [],
    },
};

interface Props {
    settings?: Settings;
    auth: {
        user: any;
    };
}

export default function Settings({ settings = defaultSettings, auth }: Props) {
    const handleSubmit = async (data: Record<string, any>) => {
        await axios.post('/api/email/settings', data);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-white leading-tight">
                    Email Settings
                </h2>
            }
        >
            <Head title="Email Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Settings</CardTitle>
                            <CardDescription>
                                Configure your email server settings, templates, and preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SettingsForm settings={settings} onSubmit={handleSubmit}>
                                {({ data, setData }) => (
                                    <Tabs defaultValue="smtp" className="space-y-4">
                                        <TabsList>
                                            <TabsTrigger value="smtp">SMTP Server</TabsTrigger>
                                            <TabsTrigger value="sender">Sender</TabsTrigger>
                                            <TabsTrigger value="attachments">Attachments</TabsTrigger>
                                            <TabsTrigger value="templates">Templates</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="smtp">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>SMTP Host</Label>
                                                        <Input
                                                            value={data.smtp.host}
                                                            onChange={(e) => setData('smtp.host', e.target.value)}
                                                            placeholder="smtp.example.com"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>SMTP Port</Label>
                                                        <Input
                                                            type="number"
                                                            value={data.smtp.port}
                                                            onChange={(e) => setData('smtp.port', parseInt(e.target.value))}
                                                            placeholder="587"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Encryption</Label>
                                                    <Select
                                                        value={data.smtp.encryption}
                                                        onValueChange={(value) => setData('smtp.encryption', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select encryption" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="tls">TLS</SelectItem>
                                                            <SelectItem value="ssl">SSL</SelectItem>
                                                            <SelectItem value="none">None</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Username</Label>
                                                    <Input
                                                        value={data.smtp.username}
                                                        onChange={(e) => setData('smtp.username', e.target.value)}
                                                        placeholder="username@example.com"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Password</Label>
                                                    <Input
                                                        type="password"
                                                        value={data.smtp.password}
                                                        onChange={(e) => setData('smtp.password', e.target.value)}
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="sender">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>From Name</Label>
                                                    <Input
                                                        value={data.sender.from_name}
                                                        onChange={(e) => setData('sender.from_name', e.target.value)}
                                                        placeholder="Your Name"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>From Email</Label>
                                                    <Input
                                                        type="email"
                                                        value={data.sender.from_email}
                                                        onChange={(e) => setData('sender.from_email', e.target.value)}
                                                        placeholder="you@example.com"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Reply-To Email</Label>
                                                    <Input
                                                        type="email"
                                                        value={data.sender.reply_to}
                                                        onChange={(e) => setData('sender.reply_to', e.target.value)}
                                                        placeholder="replies@example.com"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Email Signature</Label>
                                                    <Textarea
                                                        value={data.sender.signature}
                                                        onChange={(e) => setData('sender.signature', e.target.value)}
                                                        placeholder="Best regards,&#10;Your Name"
                                                        rows={4}
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="attachments">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Maximum File Size (MB)</Label>
                                                    <Input
                                                        type="number"
                                                        value={data.attachments.max_size}
                                                        onChange={(e) => setData('attachments.max_size', parseInt(e.target.value))}
                                                        min={1}
                                                        max={25}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Maximum Number of Files</Label>
                                                    <Input
                                                        type="number"
                                                        value={data.attachments.max_files}
                                                        onChange={(e) => setData('attachments.max_files', parseInt(e.target.value))}
                                                        min={1}
                                                        max={10}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Allowed File Types</Label>
                                                    <Select
                                                        value={data.attachments.allowed_types.join(',')}
                                                        onValueChange={(value) => setData('attachments.allowed_types', value.split(','))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select file types" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pdf,doc,docx">Documents Only</SelectItem>
                                                            <SelectItem value="jpg,png,gif">Images Only</SelectItem>
                                                            <SelectItem value="pdf,doc,docx,jpg,png,gif">Documents & Images</SelectItem>
                                                            <SelectItem value="*">All Files</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="templates">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Enable Email Templates</Label>
                                                        <div className="text-sm text-gray-500">
                                                            Use predefined email templates
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.templates.enabled}
                                                        onCheckedChange={(checked) => setData('templates.enabled', checked)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Default Template Language</Label>
                                                    <Select
                                                        value={data.templates.default_language}
                                                        onValueChange={(value) => setData('templates.default_language', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select language" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="en">English</SelectItem>
                                                            <SelectItem value="es">Spanish</SelectItem>
                                                            <SelectItem value="fr">French</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Custom Variables</Label>
                                                    <Textarea
                                                        value={data.templates.custom_variables.join('\n')}
                                                        onChange={(e) => setData('templates.custom_variables', e.target.value.split('\n'))}
                                                        placeholder="{{user_name}}&#10;{{company_name}}&#10;{{website_url}}"
                                                        rows={4}
                                                    />
                                                    <p className="text-sm text-gray-500">
                                                        Enter one variable per line, using variable_name format
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