import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { UserIcon, UserPlus, Users, Settings, Shield, Globe } from 'lucide-react';

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
    teamMembers 
}: TeamManagementProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                Inactive
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {isAdministrator 
                            ? "Manage your team members and their access permissions"
                            : "View your current team member information"
                        }
                    </p>
                </div>
                {isAdministrator && (
                    <Button
                        onClick={() => window.location.href = route('teams.create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Team Member
                    </Button>
                )}
            </div>

            {/* Current Team Member */}
            {hasTeamMembers && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="w-5 h-5" />
                            Current Team Member
                        </CardTitle>
                        <CardDescription>
                            You are currently logged in as this team member
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Profile Header */}
                            <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <Avatar className="h-20 w-20 ring-4 ring-white dark:ring-gray-800 shadow-lg">
                                    <AvatarImage src={selectedTeamMember?.profile_picture} />
                                    <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xl font-bold">
                                        {getInitials(selectedTeamMember?.full_name?.split(' ')[0] || '', selectedTeamMember?.full_name?.split(' ')[1] || '')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                        {selectedTeamMember?.full_name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                                        {selectedTeamMember?.email}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-3 py-1">
                                            Active
                                        </Badge>
                                        {selectedTeamMember?.roles?.map((role) => (
                                            <Badge key={role} variant="outline" className="px-3 py-1">
                                                {role}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Information Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Contact Information Card */}
                                <Card className="bg-gray-50/50 dark:bg-gray-800/50 border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <UserIcon className="w-5 h-5 text-gray-600" />
                                            Contact Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">Email</span>
                                            <span className="text-gray-900 dark:text-white font-semibold">
                                                {selectedTeamMember?.email || 'Not provided'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">Contact Number</span>
                                            <span className="text-gray-900 dark:text-white font-semibold">
                                                {selectedTeamMember?.contact_number || 'Not provided'}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Account Status Card */}
                                <Card className="bg-gray-50/50 dark:bg-gray-800/50 border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Settings className="w-5 h-5 text-gray-600" />
                                            Account Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">Status</span>
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                Active
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">Email Verified</span>
                                            <span className={`font-semibold ${selectedTeamMember?.email_verified ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {selectedTeamMember?.email_verified ? '✓ Verified' : '✗ Not Verified'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">Last Login</span>
                                            <span className="text-gray-900 dark:text-white font-semibold">
                                                {selectedTeamMember?.last_logged_in ? formatDate(selectedTeamMember.last_logged_in) : 'Never'}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Roles & Permissions Card */}
                                <Card className="bg-gray-50/50 dark:bg-gray-800/50 border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Shield className="w-5 h-5 text-gray-600" />
                                            Roles & Permissions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Roles</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTeamMember?.roles?.length ? (
                                                    selectedTeamMember.roles.map((role) => (
                                                        <Badge key={role} variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                            {role}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">No roles assigned</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allowed Applications</h5>
                                            {selectedTeamMember?.allowed_apps?.length ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedTeamMember.allowed_apps.slice(0, 4).map((app) => (
                                                        <Badge key={app} variant="outline" className="text-xs">
                                                            {app}
                                                        </Badge>
                                                    ))}
                                                    {selectedTeamMember.allowed_apps.length > 4 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{selectedTeamMember.allowed_apps.length - 4} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500 dark:text-gray-400">No apps assigned</span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Preferences Card */}
                                <Card className="bg-gray-50/50 dark:bg-gray-800/50 border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Globe className="w-5 h-5 text-gray-600" />
                                            Preferences
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">Timezone</span>
                                            <span className="text-gray-900 dark:text-white font-semibold">
                                                {selectedTeamMember?.timezone || 'Default'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">Language</span>
                                            <span className="text-gray-900 dark:text-white font-semibold">
                                                {selectedTeamMember?.language || 'Default'}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Notes Section */}
                            {selectedTeamMember?.notes && (
                                <Card className="bg-gray-50/50 dark:bg-gray-800/50 border-0 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <span className="text-xl">📝</span>
                                            Notes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="p-4 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/30">
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {selectedTeamMember.notes}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Password Update Section */}
                            <Card className="bg-gray-50/50 dark:bg-gray-800/50 border-0 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Shield className="w-5 h-5 text-gray-600" />
                                        Security Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 bg-gray-100/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/30 rounded-lg">
                                        <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium">
                                            Update your team member password to maintain account security.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.location.href = route('team-member.password')}
                                            className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50"
                                        >
                                            <Shield className="w-4 h-4 mr-2" />
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
                <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="w-5 h-5 text-gray-600" />
                            All Team Members ({teamMembers?.length || 0})
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            View and manage all team members in your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {teamMembers?.map((member) => (
                                <div key={member.identifier} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 ring-2 ring-gray-200 dark:ring-gray-700">
                                            <AvatarImage src={member.profile_picture} />
                                            <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
                                                {getInitials(member.first_name, member.last_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                {member.full_name}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {member.email}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                {member.roles?.map((role) => (
                                                    <Badge key={role} variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-1">
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
                                            onClick={() => window.location.href = route('teams.show', { identifier: member.identifier })}
                                            className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50"
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {(!teamMembers || teamMembers.length === 0) && (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 opacity-50" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Team Members</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by adding your first team member to collaborate together.</p>
                                    <Button
                                        variant="default"
                                        className="bg-gray-600 hover:bg-gray-700 text-white"
                                        onClick={() => window.location.href = route('teams.create')}
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
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
                        onClick={() => window.location.href = route('teams.index')}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Team Settings
                    </Button>
                </div>
            )}
        </div>
    );
}
