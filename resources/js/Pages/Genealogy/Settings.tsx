import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface ElectedOfficial {
    name: string;
    position: string;
    profile_url: string;
}

interface OfficialGroup {
    name: string;
    officials: ElectedOfficial[];
}

interface Settings {
    organization_info: {
        family_name: string;
        email: string;
        contact_number: string;
        website: string;
        address: string;
        banner: string;
        logo: string;
    };
    auth: {
        username: string;
        password: string;
    };
    elected_officials: OfficialGroup[];
}

interface Props {
    settings: Settings;
    auth: {
        user: any;
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
    const [formData, setFormData] = useState<Settings>({
        organization_info: {
            family_name: settings.organization_info?.family_name || '',
            email: settings.organization_info?.email || '',
            contact_number: settings.organization_info?.contact_number || '',
            website: settings.organization_info?.website || '',
            address: settings.organization_info?.address || '',
            banner: settings.organization_info?.banner || '',
            logo: settings.organization_info?.logo || '',
        },
        auth: {
            username: settings.auth?.username || '',
            password: settings.auth?.password || '',
        },
        elected_officials: settings.elected_officials || [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            console.log(
                'Submitting form data:',
                JSON.stringify(formData, null, 2),
            );
            const response = await axios.post('/genealogy/settings', formData);
            console.log('Response data:', response.data);
            toast.success(
                response.data.message || 'Settings updated successfully',
            );

            // Update the form data with the returned data if available
            if (response.data.data) {
                setFormData(response.data.data);
            }
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error || 'Failed to update settings';
            toast.error(errorMessage);
            console.error('Settings update error:', error);
            console.error('Error response:', error.response?.data);
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateFormData = (path: string, value: any) => {
        const keys = path.split('.');
        setFormData((prev) => {
            const newData = { ...prev };
            let current: any = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight">
                    Organization Settings
                </h2>
            }
        >
            <Head title="Organization Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization Settings</CardTitle>
                            <CardDescription>
                                Configure your organization information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Tabs
                                    defaultValue="organization"
                                    className="space-y-4"
                                >
                                    <TabsList>
                                        <TabsTrigger value="organization">
                                            Organization Info
                                        </TabsTrigger>
                                        <TabsTrigger value="auth">
                                            Authentication
                                        </TabsTrigger>
                                        <TabsTrigger value="officials">
                                            Elected Officials
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="organization">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Family Name</Label>
                                                <Input
                                                    value={
                                                        formData
                                                            .organization_info
                                                            .family_name
                                                    }
                                                    onChange={(e) =>
                                                        updateFormData(
                                                            'organization_info.family_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter family name"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <Input
                                                    type="email"
                                                    value={
                                                        formData
                                                            .organization_info
                                                            .email
                                                    }
                                                    onChange={(e) =>
                                                        updateFormData(
                                                            'organization_info.email',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter email address"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Contact Number</Label>
                                                <Input
                                                    value={
                                                        formData
                                                            .organization_info
                                                            .contact_number
                                                    }
                                                    onChange={(e) =>
                                                        updateFormData(
                                                            'organization_info.contact_number',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter contact number"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Website</Label>
                                                <Input
                                                    value={
                                                        formData
                                                            .organization_info
                                                            .website
                                                    }
                                                    onChange={(e) =>
                                                        updateFormData(
                                                            'organization_info.website',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter website URL"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Address</Label>
                                                <Input
                                                    value={
                                                        formData
                                                            .organization_info
                                                            .address
                                                    }
                                                    onChange={(e) =>
                                                        updateFormData(
                                                            'organization_info.address',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter organization address"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Banner Image URL</Label>
                                                <Input
                                                    type="url"
                                                    value={
                                                        formData
                                                            .organization_info
                                                            .banner
                                                    }
                                                    onChange={(e) =>
                                                        updateFormData(
                                                            'organization_info.banner',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter banner image URL"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Logo URL</Label>
                                                <Input
                                                    type="url"
                                                    value={
                                                        formData
                                                            .organization_info
                                                            .logo
                                                    }
                                                    onChange={(e) =>
                                                        updateFormData(
                                                            'organization_info.logo',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter logo image URL"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="auth">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Username</Label>
                                                <Input
                                                    value={
                                                        formData.auth.username
                                                    }
                                                    onChange={(e) =>
                                                        updateFormData(
                                                            'auth.username',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter username"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Password</Label>
                                                <Input
                                                    type="password"
                                                    onChange={(e) =>
                                                        updateFormData(
                                                            'auth.password',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter new password"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="officials">
                                        <div className="space-y-6">
                                            {formData.elected_officials.map(
                                                (group, groupIndex) => (
                                                    <div
                                                        key={groupIndex}
                                                        className="space-y-4 rounded-lg border p-4"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 space-y-2">
                                                                <Label>
                                                                    Group Name
                                                                </Label>
                                                                <Input
                                                                    value={
                                                                        group.name
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const newGroups =
                                                                            [
                                                                                ...formData.elected_officials,
                                                                            ];
                                                                        newGroups[
                                                                            groupIndex
                                                                        ].name =
                                                                            e.target.value;
                                                                        updateFormData(
                                                                            'elected_officials',
                                                                            newGroups,
                                                                        );
                                                                    }}
                                                                    placeholder="Enter group name"
                                                                />
                                                            </div>
                                                            {canEdit && (
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    className="ml-4"
                                                                    onClick={() => {
                                                                        const newGroups =
                                                                            formData.elected_officials.filter(
                                                                                (
                                                                                    _,
                                                                                    index,
                                                                                ) =>
                                                                                    index !==
                                                                                    groupIndex,
                                                                            );
                                                                        updateFormData(
                                                                            'elected_officials',
                                                                            newGroups,
                                                                        );
                                                                    }}
                                                                >
                                                                    Remove Group
                                                                </Button>
                                                            )}
                                                        </div>

                                                        <div className="space-y-4">
                                                            {group.officials.map(
                                                                (
                                                                    official,
                                                                    officialIndex,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            officialIndex
                                                                        }
                                                                        className="flex items-end gap-4"
                                                                    >
                                                                        <div className="flex-1 space-y-2">
                                                                            <Label>
                                                                                Name
                                                                            </Label>
                                                                            <Input
                                                                                value={
                                                                                    official.name
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) => {
                                                                                    const newGroups =
                                                                                        [
                                                                                            ...formData.elected_officials,
                                                                                        ];
                                                                                    newGroups[
                                                                                        groupIndex
                                                                                    ].officials[
                                                                                        officialIndex
                                                                                    ].name =
                                                                                        e.target.value;
                                                                                    updateFormData(
                                                                                        'elected_officials',
                                                                                        newGroups,
                                                                                    );
                                                                                }}
                                                                                placeholder="Official's name"
                                                                            />
                                                                        </div>
                                                                        <div className="flex-1 space-y-2">
                                                                            <Label>
                                                                                Position
                                                                            </Label>
                                                                            <Input
                                                                                value={
                                                                                    official.position
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) => {
                                                                                    const newGroups =
                                                                                        [
                                                                                            ...formData.elected_officials,
                                                                                        ];
                                                                                    newGroups[
                                                                                        groupIndex
                                                                                    ].officials[
                                                                                        officialIndex
                                                                                    ].position =
                                                                                        e.target.value;
                                                                                    updateFormData(
                                                                                        'elected_officials',
                                                                                        newGroups,
                                                                                    );
                                                                                }}
                                                                                placeholder="Official's position"
                                                                            />
                                                                        </div>
                                                                        <div className="flex-1 space-y-2">
                                                                            <Label>
                                                                                Profile
                                                                                URL
                                                                            </Label>
                                                                            <Input
                                                                                type="url"
                                                                                value={
                                                                                    official.profile_url
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) => {
                                                                                    const newGroups =
                                                                                        [
                                                                                            ...formData.elected_officials,
                                                                                        ];
                                                                                    newGroups[
                                                                                        groupIndex
                                                                                    ].officials[
                                                                                        officialIndex
                                                                                    ].profile_url =
                                                                                        e.target.value;
                                                                                    updateFormData(
                                                                                        'elected_officials',
                                                                                        newGroups,
                                                                                    );
                                                                                }}
                                                                                placeholder="Member's profile URL"
                                                                            />
                                                                        </div>
                                                                        {canEdit && (
                                                                            <Button
                                                                                type="button"
                                                                                variant="destructive"
                                                                                onClick={() => {
                                                                                    const newGroups =
                                                                                        [
                                                                                            ...formData.elected_officials,
                                                                                        ];
                                                                                    newGroups[
                                                                                        groupIndex
                                                                                    ].officials =
                                                                                        group.officials.filter(
                                                                                            (
                                                                                                _,
                                                                                                index,
                                                                                            ) =>
                                                                                                index !==
                                                                                                officialIndex,
                                                                                        );
                                                                                    updateFormData(
                                                                                        'elected_officials',
                                                                                        newGroups,
                                                                                    );
                                                                                }}
                                                                            >
                                                                                Remove
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}

                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    const newGroups =
                                                                        [
                                                                            ...formData.elected_officials,
                                                                        ];
                                                                    newGroups[
                                                                        groupIndex
                                                                    ].officials.push(
                                                                        {
                                                                            name: '',
                                                                            position:
                                                                                '',
                                                                            profile_url:
                                                                                '',
                                                                        },
                                                                    );
                                                                    updateFormData(
                                                                        'elected_officials',
                                                                        newGroups,
                                                                    );
                                                                }}
                                                            >
                                                                Add Official
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ),
                                            )}

                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    const newGroups = [
                                                        ...formData.elected_officials,
                                                    ];
                                                    newGroups.push({
                                                        name: '',
                                                        officials: [],
                                                    });
                                                    updateFormData(
                                                        'elected_officials',
                                                        newGroups,
                                                    );
                                                }}
                                            >
                                                Add New Group
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex items-center justify-end gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setFormData(settings)}
                                        disabled={isSubmitting}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
