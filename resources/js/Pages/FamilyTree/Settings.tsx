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
import axios from 'axios';

interface Settings {
    privacy: {
        tree_visibility: string;
        allow_member_suggestions: boolean;
        show_living_dates: boolean;
        show_sensitive_info: boolean;
    };
    display: {
        default_view: string;
        show_photos: boolean;
        show_maiden_names: boolean;
        date_format: string;
        name_display_format: string;
    };
    notifications: {
        email_notifications: boolean;
        notify_on_changes: boolean;
        notify_on_member_requests: boolean;
        digest_frequency: string;
    };
    sharing: {
        allow_exports: boolean;
        allow_imports: boolean;
        require_approval_for_edits: boolean;
        allowed_editors: string[];
    };
    customization: {
        theme: string;
        primary_color: string;
        font_size: string;
        language: string;
    };
    advanced: {
        max_generations_display: number;
        auto_arrange: boolean;
        show_relationship_labels: boolean;
        include_extended_family: boolean;
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
        await axios.post('/api/family-tree/settings', data);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-white leading-tight">
                    Family Tree Settings
                </h2>
            }
        >
            <Head title="Family Tree Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Family Tree Settings</CardTitle>
                            <CardDescription>
                                Configure your family tree settings, privacy options, and display preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SettingsForm settings={settings} onSubmit={handleSubmit}>
                                {({ data, setData }) => (
                                    <Tabs defaultValue="privacy" className="space-y-4">
                                        <TabsList>
                                            <TabsTrigger value="privacy">Privacy</TabsTrigger>
                                            <TabsTrigger value="display">Display</TabsTrigger>
                                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                                            <TabsTrigger value="sharing">Sharing</TabsTrigger>
                                            <TabsTrigger value="customization">Customization</TabsTrigger>
                                            <TabsTrigger value="advanced">Advanced</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="privacy">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Tree Visibility</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Choose who can view your family tree
                                                        </div>
                                                    </div>
                                                    <Select
                                                        value={data.privacy.tree_visibility}
                                                        onValueChange={(value) => setData('privacy.tree_visibility', value)}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="Select visibility" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="private">Private</SelectItem>
                                                            <SelectItem value="family">Family Only</SelectItem>
                                                            <SelectItem value="public">Public</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Allow Member Suggestions</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Let others suggest new family members
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.privacy.allow_member_suggestions}
                                                        onCheckedChange={(checked) => setData('privacy.allow_member_suggestions', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Show Living Dates</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Display birth dates for living members
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.privacy.show_living_dates}
                                                        onCheckedChange={(checked) => setData('privacy.show_living_dates', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Show Sensitive Information</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Display private notes and medical history
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.privacy.show_sensitive_info}
                                                        onCheckedChange={(checked) => setData('privacy.show_sensitive_info', checked)}
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="display">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Default View</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Choose the default tree layout
                                                        </div>
                                                    </div>
                                                    <Select
                                                        value={data.display.default_view}
                                                        onValueChange={(value) => setData('display.default_view', value)}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="Select view" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="tree">Tree View</SelectItem>
                                                            <SelectItem value="list">List View</SelectItem>
                                                            <SelectItem value="chart">Chart View</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Show Photos</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Display member photos in the tree
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.display.show_photos}
                                                        onCheckedChange={(checked) => setData('display.show_photos', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Date Format</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Choose how dates are displayed
                                                        </div>
                                                    </div>
                                                    <Select
                                                        value={data.display.date_format}
                                                        onValueChange={(value) => setData('display.date_format', value)}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="Select format" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="notifications">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Email Notifications</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Receive email notifications
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.notifications.email_notifications}
                                                        onCheckedChange={(checked) => setData('notifications.email_notifications', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Notify on Changes</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Get notified when changes are made
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.notifications.notify_on_changes}
                                                        onCheckedChange={(checked) => setData('notifications.notify_on_changes', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Digest Frequency</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            How often to receive updates
                                                        </div>
                                                    </div>
                                                    <Select
                                                        value={data.notifications.digest_frequency}
                                                        onValueChange={(value) => setData('notifications.digest_frequency', value)}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="Select frequency" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="daily">Daily</SelectItem>
                                                            <SelectItem value="weekly">Weekly</SelectItem>
                                                            <SelectItem value="monthly">Monthly</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="sharing">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Allow Exports</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Allow downloading tree data
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.sharing.allow_exports}
                                                        onCheckedChange={(checked) => setData('sharing.allow_exports', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Allow Imports</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Allow importing tree data
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.sharing.allow_imports}
                                                        onCheckedChange={(checked) => setData('sharing.allow_imports', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Require Edit Approval</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Approve changes before they're applied
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.sharing.require_approval_for_edits}
                                                        onCheckedChange={(checked) => setData('sharing.require_approval_for_edits', checked)}
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="customization">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Theme</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Choose light or dark mode
                                                        </div>
                                                    </div>
                                                    <Select
                                                        value={data.customization.theme}
                                                        onValueChange={(value) => setData('customization.theme', value)}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="Select theme" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="light">Light</SelectItem>
                                                            <SelectItem value="dark">Dark</SelectItem>
                                                            <SelectItem value="system">System</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Primary Color</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Choose your theme color
                                                        </div>
                                                    </div>
                                                    <Input
                                                        type="color"
                                                        value={data.customization.primary_color}
                                                        className="w-[180px]"
                                                        onChange={(e) => setData('customization.primary_color', e.target.value)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Font Size</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Adjust the text size
                                                        </div>
                                                    </div>
                                                    <Select
                                                        value={data.customization.font_size}
                                                        onValueChange={(value) => setData('customization.font_size', value)}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="Select size" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="small">Small</SelectItem>
                                                            <SelectItem value="medium">Medium</SelectItem>
                                                            <SelectItem value="large">Large</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="advanced">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Maximum Generations Display</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Number of generations to show at once
                                                        </div>
                                                    </div>
                                                    <Select
                                                        value={data.advanced.max_generations_display.toString()}
                                                        onValueChange={(value) => setData('advanced.max_generations_display', parseInt(value))}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="Select generations" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="3">3 Generations</SelectItem>
                                                            <SelectItem value="4">4 Generations</SelectItem>
                                                            <SelectItem value="5">5 Generations</SelectItem>
                                                            <SelectItem value="6">6 Generations</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Auto-arrange Tree</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Automatically organize the tree layout
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.advanced.auto_arrange}
                                                        onCheckedChange={(checked) => setData('advanced.auto_arrange', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Show Relationship Labels</Label>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Display how members are related
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data.advanced.show_relationship_labels}
                                                        onCheckedChange={(checked) => setData('advanced.show_relationship_labels', checked)}
                                                    />
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