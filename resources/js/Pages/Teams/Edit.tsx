import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import TeamsLayout from '@/Layouts/TeamsLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, User } from 'lucide-react';
import React from 'react';

interface Props {
    auth: {
        user: any;
    };
    teamMember: {
        id: number;
        identifier: string;
        first_name: string;
        last_name: string;
        email: string;
        contact_number?: string;
        roles: string[];
        allowed_apps: string[];
        notes?: string;
        timezone: string;
        language: string;
    };
    availableRoles: Record<string, string>;
    availableApps: Record<string, string>;
}

export default function Edit({
    auth,
    teamMember,
    availableRoles,
    availableApps,
}: Props) {
    const { data, setData, put, processing, errors } = useForm({
        first_name: teamMember.first_name,
        last_name: teamMember.last_name,
        email: teamMember.email,
        contact_number: teamMember.contact_number || '',
        roles: teamMember.roles,
        allowed_apps: teamMember.allowed_apps,
        notes: teamMember.notes || '',
        timezone: teamMember.timezone,
        language: teamMember.language,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('teams.update', teamMember.identifier));
    };

    const handleRoleChange = (role: string, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, role]);
        } else {
            setData(
                'roles',
                data.roles.filter((r) => r !== role),
            );
        }
    };

    const handleAppChange = (app: string, checked: boolean) => {
        if (checked) {
            setData('allowed_apps', [...data.allowed_apps, app]);
        } else {
            setData(
                'allowed_apps',
                data.allowed_apps.filter((a) => a !== app),
            );
        }
    };

    const timezones = [
        { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'Europe/London', label: 'London (GMT)' },
        { value: 'Europe/Paris', label: 'Paris (CET)' },
        { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
        { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
        { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
    ];

    const languages = [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
        { value: 'it', label: 'Italian' },
        { value: 'pt', label: 'Portuguese' },
        { value: 'ru', label: 'Russian' },
        { value: 'ja', label: 'Japanese' },
        { value: 'ko', label: 'Korean' },
        { value: 'zh', label: 'Chinese' },
    ];

    return (
        <TeamsLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Edit Team Member
                    </h2>
                    <Link href={route('teams.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Team
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Edit Team Member" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {/* Main Form */}
                            <div className="space-y-6 lg:col-span-2">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Basic Information
                                        </CardTitle>
                                        <CardDescription>
                                            Update the team member's personal
                                            details
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="first_name">
                                                    First Name *
                                                </Label>
                                                <Input
                                                    id="first_name"
                                                    type="text"
                                                    value={data.first_name}
                                                    onChange={(e) =>
                                                        setData(
                                                            'first_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={
                                                        errors.first_name
                                                            ? 'border-red-500'
                                                            : ''
                                                    }
                                                />
                                                {errors.first_name && (
                                                    <p className="mt-1 text-sm text-red-500">
                                                        {errors.first_name}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="last_name">
                                                    Last Name *
                                                </Label>
                                                <Input
                                                    id="last_name"
                                                    type="text"
                                                    value={data.last_name}
                                                    onChange={(e) =>
                                                        setData(
                                                            'last_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={
                                                        errors.last_name
                                                            ? 'border-red-500'
                                                            : ''
                                                    }
                                                />
                                                {errors.last_name && (
                                                    <p className="mt-1 text-sm text-red-500">
                                                        {errors.last_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="email">
                                                Email Address *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                className={
                                                    errors.email
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="contact_number">
                                                Contact Number
                                            </Label>
                                            <Input
                                                id="contact_number"
                                                type="tel"
                                                value={data.contact_number}
                                                onChange={(e) =>
                                                    setData(
                                                        'contact_number',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Roles and Permissions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Roles & Permissions
                                        </CardTitle>
                                        <CardDescription>
                                            Update roles and permissions for the
                                            team member
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <Label className="text-base font-medium">
                                                Roles
                                            </Label>
                                            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                                                {Object.entries(
                                                    availableRoles,
                                                ).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <Checkbox
                                                            id={`role-${key}`}
                                                            checked={data.roles.includes(
                                                                key,
                                                            )}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                handleRoleChange(
                                                                    key,
                                                                    checked as boolean,
                                                                )
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={`role-${key}`}
                                                            className="text-sm font-normal"
                                                        >
                                                            {value}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-base font-medium">
                                                Allowed Applications
                                            </Label>
                                            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                                                {Object.entries(
                                                    availableApps,
                                                ).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <Checkbox
                                                            id={`app-${key}`}
                                                            checked={data.allowed_apps.includes(
                                                                key,
                                                            )}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                handleAppChange(
                                                                    key,
                                                                    checked as boolean,
                                                                )
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={`app-${key}`}
                                                            className="text-sm font-normal"
                                                        >
                                                            {value}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Additional Settings */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Additional Settings
                                        </CardTitle>
                                        <CardDescription>
                                            Configure timezone, language, and
                                            other preferences
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="timezone">
                                                    Timezone
                                                </Label>
                                                <Select
                                                    value={data.timezone}
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'timezone',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {timezones.map((tz) => (
                                                            <SelectItem
                                                                key={tz.value}
                                                                value={tz.value}
                                                            >
                                                                {tz.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="language">
                                                    Language
                                                </Label>
                                                <Select
                                                    value={data.language}
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'language',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {languages.map(
                                                            (lang) => (
                                                                <SelectItem
                                                                    key={
                                                                        lang.value
                                                                    }
                                                                    value={
                                                                        lang.value
                                                                    }
                                                                >
                                                                    {lang.label}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) =>
                                                    setData(
                                                        'notes',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Any additional notes about this team member..."
                                                rows={3}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Name:
                                            </span>
                                            <span className="text-sm font-medium">
                                                {data.first_name &&
                                                data.last_name
                                                    ? `${data.first_name} ${data.last_name}`
                                                    : 'Not specified'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Email:
                                            </span>
                                            <span className="text-sm font-medium">
                                                {data.email || 'Not specified'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Roles:
                                            </span>
                                            <span className="text-sm font-medium">
                                                {data.roles.length} selected
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">
                                                Apps:
                                            </span>
                                            <span className="text-sm font-medium">
                                                {data.allowed_apps.length}{' '}
                                                selected
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Actions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={processing}
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing
                                                ? 'Updating...'
                                                : 'Update Team Member'}
                                        </Button>
                                        <Link href={route('teams.index')}>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                            >
                                                Cancel
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </TeamsLayout>
    );
}
