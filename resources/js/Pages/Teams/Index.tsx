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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import TeamsLayout from '@/Layouts/TeamsLayout';
import { TeamMember } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import {
    Edit,
    Eye,
    Key,
    MoreHorizontal,
    Plus,
    Search,
    Settings,
    Trash2,
    UserCheck,
    UserX,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    auth: {
        user: any;
    };
    teamMembers: TeamMember[];
    availableRoles: Record<string, string>;
    availableApps: Record<string, string>;
}

export default function Index({
    auth,
    teamMembers,
    availableRoles,
    availableApps,
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [filteredMembers, setFilteredMembers] =
        useState<TeamMember[]>(teamMembers);

    useEffect(() => {
        let filtered = teamMembers;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (member) =>
                    member.full_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    member.email
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    member.contact_number
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()),
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((member) =>
                statusFilter === 'active'
                    ? member.is_active
                    : !member.is_active,
            );
        }

        // Role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter((member) =>
                member.roles.includes(roleFilter),
            );
        }

        setFilteredMembers(filtered);
    }, [teamMembers, searchTerm, statusFilter, roleFilter]);

    const handleToggleStatus = async (identifier: string) => {
        try {
            const response = await fetch(`/teams/${identifier}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const result = await response.json();
                toast.success(result.message);
                router.reload();
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const handleResetPassword = async (identifier: string) => {
        try {
            const response = await fetch(
                `/teams/${identifier}/reset-password`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            if (response.ok) {
                const result = await response.json();
                toast.success(result.message);
            } else {
                toast.error('Failed to reset password');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const handleDelete = (identifier: string) => {
        if (confirm('Are you sure you want to remove this team member?')) {
            router.delete(`/teams/${identifier}`);
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                <UserCheck className="mr-1 h-3 w-3" />
                Active
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                <UserX className="mr-1 h-3 w-3" />
                Inactive
            </Badge>
        );
    };

    return (
        <TeamsLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Team Management
                    </h2>
                    <div className="flex items-center gap-2">
                        <Link href={route('teams.settings')}>
                            <Button variant="outline" size="sm">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Button>
                        </Link>
                        <Link href={route('teams.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Member
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Team Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Members
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {teamMembers.length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Members
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {
                                        teamMembers.filter((m) => m.is_active)
                                            .length
                                    }
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Verified Members
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {
                                        teamMembers.filter(
                                            (m) => m.email_verified,
                                        ).length
                                    }
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    {
                                        teamMembers.filter(
                                            (m) =>
                                                m.last_logged_in &&
                                                new Date(m.last_logged_in) >
                                                    new Date(
                                                        Date.now() -
                                                            7 *
                                                                24 *
                                                                60 *
                                                                60 *
                                                                1000,
                                                    ),
                                        ).length
                                    }
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search members..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            Inactive
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={roleFilter}
                                    onValueChange={setRoleFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Roles
                                        </SelectItem>
                                        {Object.entries(availableRoles).map(
                                            ([key, value]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {value}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Members Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                Manage your team members and their access
                                permissions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredMembers.length === 0 ? (
                                <div className="py-8 text-center">
                                    <div className="mb-4 text-gray-500">
                                        No team members found
                                    </div>
                                    <Link href={route('teams.create')}>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Your First Member
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Member</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Roles</TableHead>
                                            <TableHead>Apps</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Last Login</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredMembers.map((member) => (
                                            <TableRow key={member.identifier}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar>
                                                            <AvatarImage
                                                                src={
                                                                    member.profile_picture
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {getInitials(
                                                                    member.first_name,
                                                                    member.last_name,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">
                                                                {
                                                                    member.full_name
                                                                }
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {member.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {member.contact_number && (
                                                        <div className="text-sm">
                                                            {
                                                                member.contact_number
                                                            }
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {member.roles.map(
                                                            (role) => (
                                                                <Badge
                                                                    key={role}
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {availableRoles[
                                                                        role
                                                                    ] || role}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {member.allowed_apps
                                                            .slice(0, 3)
                                                            .map((app) => (
                                                                <Badge
                                                                    key={app}
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    {availableApps[
                                                                        app
                                                                    ] || app}
                                                                </Badge>
                                                            ))}
                                                        {member.allowed_apps
                                                            .length > 3 && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                +
                                                                {member
                                                                    .allowed_apps
                                                                    .length -
                                                                    3}{' '}
                                                                more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(
                                                        member.is_active,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {member.last_logged_in ? (
                                                        <div className="text-sm text-gray-500">
                                                            {formatDate(
                                                                member.last_logged_in,
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-400">
                                                            Never
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>
                                                                Actions
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'teams.show',
                                                                        member.identifier,
                                                                    )}
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'teams.edit',
                                                                        member.identifier,
                                                                    )}
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleToggleStatus(
                                                                        member.identifier,
                                                                    )
                                                                }
                                                            >
                                                                {member.is_active ? (
                                                                    <>
                                                                        <UserX className="mr-2 h-4 w-4" />
                                                                        Deactivate
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                                        Activate
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleResetPassword(
                                                                        member.identifier,
                                                                    )
                                                                }
                                                            >
                                                                <Key className="mr-2 h-4 w-4" />
                                                                Reset Password
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        member.identifier,
                                                                    )
                                                                }
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Remove
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TeamsLayout>
    );
}
