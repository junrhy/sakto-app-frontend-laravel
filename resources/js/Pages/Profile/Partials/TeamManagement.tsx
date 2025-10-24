import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Globe,
    Settings,
    Shield,
    UserIcon,
    UserPlus,
    Users,
} from 'lucide-react';

interface TeamMember {
    identifier: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    roles: string[];
    allowed_apps: string[];
    is_active: boolean;
    last_logged_in: string;
    profile_picture?: string;
}

interface TeamManagementProps {
    isAdministrator: boolean;
    hasTeamMembers: boolean;
    selectedTeamMember: {
        full_name: string;
        profile_picture?: string;
        roles?: string[];
        email?: string;
        contact_number?: string;
        allowed_apps?: string[];
        email_verified?: boolean;
        last_logged_in?: string;
        timezone?: string;
        language?: string;
        notes?: string;
    };
    teamMembers: TeamMember[];
}

export default function TeamManagement({
    isAdministrator,
    hasTeamMembers,
    selectedTeamMember,
    teamMembers,
}: TeamManagementProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge
                variant="default"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
                Active
            </Badge>
        ) : (
            <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
                Inactive
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Team Management
                    </h2>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        {isAdministrator
                            ? 'Manage your team members and their access permissions'
                            : 'View your current team member information'}
                    </p>
                </div>
                {isAdministrator && (
                    <Button
                        onClick={() =>
                            (window.location.href = route('teams.create'))
                        }
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Team Member
                    </Button>
                )}
            </div>

            {/* Current Team Member */}
            {hasTeamMembers && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            Current Team Member
                        </CardTitle>
                        <CardDescription>
                            You are currently logged in as this team member
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Profile Header */}
                            <div className="flex items-center gap-6 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                                <Avatar className="h-20 w-20 shadow-lg ring-4 ring-white dark:ring-gray-800">
                                    <AvatarImage
                                        src={
                                            selectedTeamMember?.profile_picture
                                        }
                                    />
                                    <AvatarFallback className="bg-gray-100 text-xl font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                        {getInitials(
                                            selectedTeamMember?.full_name?.split(
                                                ' ',
                                            )[0] || '',
                                            selectedTeamMember?.full_name?.split(
                                                ' ',
                                            )[1] || '',
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedTeamMember?.full_name}
                                    </h3>
                                    <p className="mb-3 text-gray-600 dark:text-gray-400">
                                        {selectedTeamMember?.email}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge
                                            variant="secondary"
                                            className="bg-gray-100 px-3 py-1 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                        >
                                            Active
                                        </Badge>
                                        {selectedTeamMember?.roles?.map(
                                            (role) => (
                                                <Badge
                                                    key={role}
                                                    variant="outline"
                                                    className="px-3 py-1"
                                                >
                                                    {role}
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Information Grid */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Contact Information Card */}
                                <Card className="border-0 bg-gray-50/50 shadow-sm dark:bg-gray-800/50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <UserIcon className="h-5 w-5 text-gray-600" />
                                            Contact Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-700">
                                            <span className="font-medium text-gray-600 dark:text-gray-400">
                                                Email
                                            </span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {selectedTeamMember?.email ||
                                                    'Not provided'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="font-medium text-gray-600 dark:text-gray-400">
                                                Contact Number
                                            </span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {selectedTeamMember?.contact_number ||
                                                    'Not provided'}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Account Status Card */}
                                <Card className="border-0 bg-gray-50/50 shadow-sm dark:bg-gray-800/50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Settings className="h-5 w-5 text-gray-600" />
                                            Account Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-700">
                                            <span className="font-medium text-gray-600 dark:text-gray-400">
                                                Status
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                            >
                                                Active
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-700">
                                            <span className="font-medium text-gray-600 dark:text-gray-400">
                                                Email Verified
                                            </span>
                                            <span
                                                className={`font-semibold ${selectedTeamMember?.email_verified ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}
                                            >
                                                {selectedTeamMember?.email_verified
                                                    ? '✓ Verified'
                                                    : '✗ Not Verified'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="font-medium text-gray-600 dark:text-gray-400">
                                                Last Login
                                            </span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {selectedTeamMember?.last_logged_in
                                                    ? formatDate(
                                                          selectedTeamMember.last_logged_in,
                                                      )
                                                    : 'Never'}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Roles & Permissions Card */}
                                <Card className="border-0 bg-gray-50/50 shadow-sm dark:bg-gray-800/50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Shield className="h-5 w-5 text-gray-600" />
                                            Roles & Permissions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Assigned Roles
                                            </h5>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTeamMember?.roles
                                                    ?.length ? (
                                                    selectedTeamMember.roles.map(
                                                        (role) => (
                                                            <Badge
                                                                key={role}
                                                                variant="secondary"
                                                                className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                                            >
                                                                {role}
                                                            </Badge>
                                                        ),
                                                    )
                                                ) : (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        No roles assigned
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Allowed Applications
                                            </h5>
                                            {selectedTeamMember?.allowed_apps
                                                ?.length ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedTeamMember.allowed_apps
                                                        .slice(0, 4)
                                                        .map((app) => (
                                                            <Badge
                                                                key={app}
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {app}
                                                            </Badge>
                                                        ))}
                                                    {selectedTeamMember
                                                        .allowed_apps.length >
                                                        4 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            +
                                                            {selectedTeamMember
                                                                .allowed_apps
                                                                .length -
                                                                4}{' '}
                                                            more
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    No apps assigned
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Preferences Card */}
                                <Card className="border-0 bg-gray-50/50 shadow-sm dark:bg-gray-800/50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Globe className="h-5 w-5 text-gray-600" />
                                            Preferences
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-700">
                                            <span className="font-medium text-gray-600 dark:text-gray-400">
                                                Timezone
                                            </span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {selectedTeamMember?.timezone ||
                                                    'Default'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="font-medium text-gray-600 dark:text-gray-400">
                                                Language
                                            </span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {selectedTeamMember?.language ||
                                                    'Default'}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Notes Section */}
                            {selectedTeamMember?.notes && (
                                <Card className="border-0 bg-gray-50/50 shadow-sm dark:bg-gray-800/50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <span className="text-xl">📝</span>
                                            Notes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-lg border border-gray-200/50 bg-gray-100/50 p-4 dark:border-gray-600/30 dark:bg-gray-700/50">
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {selectedTeamMember.notes}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Password Update Section */}
                            <Card className="border-0 bg-gray-50/50 shadow-sm dark:bg-gray-800/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Shield className="h-5 w-5 text-gray-600" />
                                        Security Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border border-gray-200/50 bg-gray-100/50 p-4 dark:border-gray-600/30 dark:bg-gray-700/50">
                                        <p className="mb-3 font-medium text-gray-700 dark:text-gray-300">
                                            Update your team member password to
                                            maintain account security.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                (window.location.href = route(
                                                    'team-member.password',
                                                ))
                                            }
                                            className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50"
                                        >
                                            <Shield className="mr-2 h-4 w-4" />
                                            Update Team Member Password
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* All Team Members */}
            {(isAdministrator || !hasTeamMembers) && (
                <Card className="border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="h-5 w-5 text-gray-600" />
                            All Team Members ({teamMembers?.length || 0})
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            View and manage all team members in your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {teamMembers?.map((member) => (
                                <div
                                    key={member.identifier}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 ring-2 ring-gray-200 dark:ring-gray-700">
                                            <AvatarImage
                                                src={member.profile_picture}
                                            />
                                            <AvatarFallback className="bg-gray-100 font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                {getInitials(
                                                    member.first_name,
                                                    member.last_name,
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {member.full_name}
                                            </h4>
                                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                                                {member.email}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {member.roles?.map((role) => (
                                                    <Badge
                                                        key={role}
                                                        variant="secondary"
                                                        className="bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                                    >
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(member.is_active)}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                (window.location.href = route(
                                                    'teams.show',
                                                    {
                                                        identifier:
                                                            member.identifier,
                                                    },
                                                ))
                                            }
                                            className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50"
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {(!teamMembers || teamMembers.length === 0) && (
                                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                        <Users className="h-8 w-8 opacity-50" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                                        No Team Members
                                    </h3>
                                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                                        Get started by adding your first team
                                        member to collaborate together.
                                    </p>
                                    <Button
                                        variant="default"
                                        className="bg-gray-600 text-white hover:bg-gray-700"
                                        onClick={() =>
                                            (window.location.href =
                                                route('teams.create'))
                                        }
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Add First Team Member
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {isAdministrator && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="outline"
                        onClick={() =>
                            (window.location.href = route('teams.index'))
                        }
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50"
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Team Settings
                    </Button>
                </div>
            )}
        </div>
    );
}
