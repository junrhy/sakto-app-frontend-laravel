import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import TeamsLayout from '@/Layouts/TeamsLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Mail,
    Settings as SettingsIcon,
    Shield,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react';

interface Props {
    auth: {
        user: any;
    };
    teamStats: {
        total_members: number;
        active_members: number;
        verified_members: number;
    };
    availableRoles: Record<string, string>;
    availableApps: Record<string, string>;
}

export default function Settings({
    auth,
    teamStats,
    availableRoles,
    availableApps,
}: Props) {
    return (
        <TeamsLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Team Settings
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
            <Head title="Team Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    {/* Stats Overview */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Members
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {teamStats.total_members}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    All team members
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Members
                                </CardTitle>
                                <UserCheck className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {teamStats.active_members}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Currently active
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Inactive Members
                                </CardTitle>
                                <UserX className="h-4 w-4 text-gray-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-600">
                                    {teamStats.total_members -
                                        teamStats.active_members}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Currently inactive
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Verified Members
                                </CardTitle>
                                <Mail className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {teamStats.verified_members}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Email verified
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Available Roles */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Available Roles
                                </CardTitle>
                                <CardDescription>
                                    Roles that can be assigned to team members
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(availableRoles).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div>
                                                    <h4 className="font-medium">
                                                        {value}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        Role: {key}
                                                    </p>
                                                </div>
                                                <Badge variant="outline">
                                                    {key}
                                                </Badge>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Available Applications */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Available Applications
                                </CardTitle>
                                <CardDescription>
                                    Applications that can be accessed by team
                                    members
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid max-h-96 grid-cols-1 gap-2 overflow-y-auto">
                                    {Object.entries(availableApps).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between rounded border p-2"
                                            >
                                                <span className="text-sm font-medium">
                                                    {value}
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {key}
                                                </Badge>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Team Management Guidelines */}
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SettingsIcon className="h-5 w-5" />
                                Team Management Guidelines
                            </CardTitle>
                            <CardDescription>
                                Best practices for managing your team
                                effectively
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="mb-2 text-lg font-medium">
                                            Role Management
                                        </h4>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li>
                                                • Assign roles based on
                                                responsibilities and access
                                                needs
                                            </li>
                                            <li>
                                                • Use the principle of least
                                                privilege
                                            </li>
                                            <li>
                                                • Regularly review and update
                                                role assignments
                                            </li>
                                            <li>
                                                • Remove access when team
                                                members leave
                                            </li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 text-lg font-medium">
                                            Application Access
                                        </h4>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li>
                                                • Only grant access to
                                                applications team members need
                                            </li>
                                            <li>
                                                • Monitor application usage
                                                regularly
                                            </li>
                                            <li>
                                                • Set up proper access controls
                                                for sensitive data
                                            </li>
                                            <li>
                                                • Document access permissions
                                                and changes
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="mb-2 text-lg font-medium">
                                            Security Best Practices
                                        </h4>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li>
                                                • Enforce strong password
                                                policies
                                            </li>
                                            <li>
                                                • Enable two-factor
                                                authentication when possible
                                            </li>
                                            <li>
                                                • Regularly audit team member
                                                access
                                            </li>
                                            <li>
                                                • Keep team member information
                                                up to date
                                            </li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 text-lg font-medium">
                                            Communication
                                        </h4>
                                        <ul className="space-y-2 text-sm text-gray-600">
                                            <li>
                                                • Communicate role changes to
                                                team members
                                            </li>
                                            <li>
                                                • Provide training for new
                                                applications
                                            </li>
                                            <li>
                                                • Establish clear escalation
                                                procedures
                                            </li>
                                            <li>
                                                • Document team member
                                                onboarding/offboarding
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common team management tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Link href={route('teams.create')}>
                                    <Button className="w-full">
                                        <Users className="mr-2 h-4 w-4" />
                                        Add New Member
                                    </Button>
                                </Link>
                                <Link href={route('teams.index')}>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Activity className="mr-2 h-4 w-4" />
                                        View All Members
                                    </Button>
                                </Link>
                                <Link href={route('teams.index')}>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <SettingsIcon className="mr-2 h-4 w-4" />
                                        Manage Access
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TeamsLayout>
    );
}
