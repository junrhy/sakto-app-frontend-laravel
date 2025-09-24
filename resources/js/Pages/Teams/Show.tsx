import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Separator } from '@/Components/ui/separator';
import TeamsLayout from '@/Layouts/TeamsLayout';
import { TeamMember } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Edit,
    FileText,
    Globe,
    Languages,
    Mail,
    Monitor,
    Phone,
    Shield,
} from 'lucide-react';

interface Props {
    auth: {
        user: any;
    };
    teamMember: TeamMember;
    availableRoles: Record<string, string>;
    availableApps: Record<string, string>;
}

export default function Show({
    auth,
    teamMember,
    availableRoles,
    availableApps,
}: Props) {
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                Active
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                Inactive
            </Badge>
        );
    };

    const getVerificationBadge = (isVerified: boolean) => {
        return isVerified ? (
            <Badge variant="default" className="bg-blue-100 text-blue-800">
                Verified
            </Badge>
        ) : (
            <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
            >
                Pending
            </Badge>
        );
    };

    return (
        <TeamsLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Team Member Details
                    </h2>
                    <div className="flex items-center gap-2">
                        <Link href={route('teams.edit', teamMember.identifier)}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        <Link href={route('teams.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Team
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`${teamMember.full_name} - Team Member`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Profile Header */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start space-x-6">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage
                                                src={teamMember.profile_picture}
                                            />
                                            <AvatarFallback className="text-lg">
                                                {getInitials(
                                                    teamMember.first_name,
                                                    teamMember.last_name,
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-3">
                                                <h1 className="text-2xl font-bold">
                                                    {teamMember.full_name}
                                                </h1>
                                                {getStatusBadge(
                                                    teamMember.is_active,
                                                )}
                                                {getVerificationBadge(
                                                    teamMember.email_verified,
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-4 w-4" />
                                                    <span>
                                                        {teamMember.email}
                                                    </span>
                                                </div>
                                                {teamMember.contact_number && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-4 w-4" />
                                                        <span>
                                                            {
                                                                teamMember.contact_number
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Roles and Permissions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Roles & Permissions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="mb-3 font-medium">
                                            Assigned Roles
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {teamMember.roles.length > 0 ? (
                                                teamMember.roles.map((role) => (
                                                    <Badge
                                                        key={role}
                                                        variant="outline"
                                                    >
                                                        {availableRoles[role] ||
                                                            role}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500">
                                                    No roles assigned
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="mb-3 font-medium">
                                            Allowed Applications
                                        </h4>
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                            {teamMember.allowed_apps.length >
                                            0 ? (
                                                teamMember.allowed_apps.map(
                                                    (app) => (
                                                        <div
                                                            key={app}
                                                            className="flex items-center gap-2 rounded bg-gray-50 p-2"
                                                        >
                                                            <Monitor className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm">
                                                                {availableApps[
                                                                    app
                                                                ] || app}
                                                            </span>
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <p className="text-sm text-gray-500">
                                                    No applications assigned
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Activity Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Activity Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">
                                                Last Login
                                            </Label>
                                            <p className="text-sm">
                                                {teamMember.last_logged_in
                                                    ? formatDate(
                                                          teamMember.last_logged_in,
                                                      )
                                                    : 'Never'}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">
                                                Last Activity
                                            </Label>
                                            <p className="text-sm">
                                                {teamMember.last_activity_at
                                                    ? formatDate(
                                                          teamMember.last_activity_at,
                                                      )
                                                    : 'Never'}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">
                                                Password Changed
                                            </Label>
                                            <p className="text-sm">
                                                {teamMember.password_changed_at
                                                    ? formatDate(
                                                          teamMember.password_changed_at,
                                                      )
                                                    : 'Never'}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">
                                                Email Verified
                                            </Label>
                                            <p className="text-sm">
                                                {teamMember.email_verified_at
                                                    ? formatDate(
                                                          teamMember.email_verified_at,
                                                      )
                                                    : 'Not verified'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            {teamMember.notes && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Notes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-wrap text-gray-700">
                                            {teamMember.notes}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Member Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Member Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">
                                            Member ID
                                        </Label>
                                        <p className="font-mono text-sm">
                                            {teamMember.identifier}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">
                                            Created
                                        </Label>
                                        <p className="text-sm">
                                            {formatDate(teamMember.created_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">
                                            Last Updated
                                        </Label>
                                        <p className="text-sm">
                                            {formatDate(teamMember.updated_at)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Preferences */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Preferences</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">
                                                Timezone
                                            </Label>
                                            <p className="text-sm">
                                                {teamMember.timezone}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Languages className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">
                                                Language
                                            </Label>
                                            <p className="text-sm">
                                                {teamMember.language.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Link
                                        href={route(
                                            'teams.edit',
                                            teamMember.identifier,
                                        )}
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Member
                                        </Button>
                                    </Link>
                                    <Link href={route('teams.index')}>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back to Team
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </TeamsLayout>
    );
}
