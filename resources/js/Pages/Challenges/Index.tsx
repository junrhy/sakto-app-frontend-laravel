import ChallengeForm from '@/Components/Challenges/ChallengeForm';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Calendar,
    Edit,
    ExternalLink,
    FileDown,
    Filter,
    MoreHorizontal,
    Plus,
    SearchIcon,
    Target,
    Trash2,
    Users,
    Users2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    identifier: string;
}

interface Reward {
    type:
        | 'badge'
        | 'points'
        | 'achievement'
        | 'cash'
        | 'item'
        | 'gift'
        | 'certificate'
        | 'trophy'
        | 'medal';
    value: string;
}

interface Challenge {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    goal_type:
        | 'steps'
        | 'calories'
        | 'distance'
        | 'time'
        | 'weight'
        | 'cooking'
        | 'photography'
        | 'art'
        | 'writing'
        | 'music'
        | 'dance'
        | 'sports'
        | 'quiz'
        | 'other';
    goal_value: number;
    goal_unit: string;
    participants: number[];
    participants_count?: number;
    visibility: 'public' | 'private' | 'friends' | 'family' | 'coworkers';
    rewards: Reward[];
    status: 'active' | 'inactive' | 'completed';
}

interface Props {
    auth: {
        user: User & {
            is_admin?: boolean;
        };
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
    challenges: Challenge[];
}

export default function Index({ auth, challenges: initialChallenges }: Props) {
    console.log('Auth data:', auth);
    const [challenges, setChallenges] =
        useState<Challenge[]>(initialChallenges);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [selectedChallenge, setSelectedChallenge] =
        useState<Challenge | null>(null);
    const [search, setSearch] = useState('');
    const [selectedChallenges, setSelectedChallenges] = useState<number[]>([]);
    const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
    const [goalTypeFilter, setGoalTypeFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - only admin or manager can delete
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

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

    const filteredChallenges = useMemo(() => {
        let filtered = challenges;

        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (challenge) =>
                    challenge.title.toLowerCase().includes(searchLower) ||
                    challenge.description.toLowerCase().includes(searchLower),
            );
        }

        if (visibilityFilter !== 'all') {
            filtered = filtered.filter(
                (challenge) => challenge.visibility === visibilityFilter,
            );
        }

        if (goalTypeFilter !== 'all') {
            filtered = filtered.filter(
                (challenge) => challenge.goal_type === goalTypeFilter,
            );
        }

        return filtered;
    }, [challenges, search, visibilityFilter, goalTypeFilter]);

    const toggleSelectAll = () => {
        if (selectedChallenges.length === filteredChallenges.length) {
            setSelectedChallenges([]);
        } else {
            setSelectedChallenges(
                filteredChallenges.map((challenge) => challenge.id),
            );
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedChallenges.includes(id)) {
            setSelectedChallenges(
                selectedChallenges.filter((challengeId) => challengeId !== id),
            );
        } else {
            setSelectedChallenges([...selectedChallenges, id]);
        }
    };

    const exportToCSV = () => {
        const selectedData = challenges.filter((challenge) =>
            selectedChallenges.includes(challenge.id),
        );
        const headers = [
            'Title',
            'Goal Type',
            'Goal Value',
            'Visibility',
            'Start Date',
            'End Date',
        ];
        const csvData = selectedData.map((challenge) => [
            challenge.title,
            challenge.goal_type,
            `${challenge.goal_value} ${challenge.goal_unit}`,
            challenge.visibility,
            format(new Date(challenge.start_date), 'PPP'),
            format(new Date(challenge.end_date), 'PPP'),
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'challenges.csv';
        link.click();
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this challenge?')) {
            router.delete(route('challenges.destroy', id));
        }
    };

    const handleCreateChallenge = async (
        formData: Record<string, any>,
    ): Promise<void> => {
        try {
            await router.post(route('challenges.store'), formData);
            setIsFormOpen(false);
        } catch (error) {
            console.error('Failed to create challenge:', error);
        }
    };

    const handleUpdateChallenge = async (
        id: number,
        formData: Record<string, any>,
    ): Promise<void> => {
        try {
            await router.put(route('challenges.update', id), formData);
            setSelectedChallenge(null);
        } catch (error) {
            console.error('Failed to update challenge:', error);
        }
    };

    const getVisibilityBadgeColor = (visibility: string) => {
        switch (visibility) {
            case 'public':
                return 'default';
            case 'private':
                return 'secondary';
            case 'friends':
                return 'outline';
            case 'family':
                return 'outline';
            case 'coworkers':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const getGoalTypeIcon = (goalType: string) => {
        switch (goalType) {
            case 'steps':
                return '👟';
            case 'calories':
                return '🔥';
            case 'distance':
                return '🏃';
            case 'time':
                return '⏱️';
            case 'weight':
                return '⚖️';
            case 'cooking':
                return '👨‍🍳';
            case 'photography':
                return '📸';
            case 'art':
                return '🎨';
            case 'writing':
                return '✍️';
            case 'music':
                return '🎵';
            case 'dance':
                return '💃';
            case 'sports':
                return '⚽';
            case 'quiz':
                return '🧠';
            default:
                return '🎯';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'completed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col space-y-6">
                    <div className="flex flex-col space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Challenges
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Create and manage fitness, wellness, and personal
                            development challenges
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1 sm:max-w-sm">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500 dark:text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search challenges..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="border-gray-300 bg-white pl-9 dark:border-gray-700 dark:bg-gray-900"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select
                                    value={visibilityFilter}
                                    onValueChange={setVisibilityFilter}
                                >
                                    <SelectTrigger className="w-full border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900 sm:w-[180px]">
                                        <Filter className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Visibilities
                                        </SelectItem>
                                        <SelectItem value="public">
                                            Public
                                        </SelectItem>
                                        <SelectItem value="private">
                                            Private
                                        </SelectItem>
                                        <SelectItem value="friends">
                                            Friends
                                        </SelectItem>
                                        <SelectItem value="family">
                                            Family
                                        </SelectItem>
                                        <SelectItem value="coworkers">
                                            Coworkers
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={goalTypeFilter}
                                    onValueChange={setGoalTypeFilter}
                                >
                                    <SelectTrigger className="w-full border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900 sm:w-[180px]">
                                        <Target className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Goal Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Goal Types
                                        </SelectItem>
                                        <SelectItem value="steps">
                                            Steps
                                        </SelectItem>
                                        <SelectItem value="calories">
                                            Calories
                                        </SelectItem>
                                        <SelectItem value="distance">
                                            Distance
                                        </SelectItem>
                                        <SelectItem value="time">
                                            Time
                                        </SelectItem>
                                        <SelectItem value="weight">
                                            Weight
                                        </SelectItem>
                                        <SelectItem value="cooking">
                                            Cooking
                                        </SelectItem>
                                        <SelectItem value="photography">
                                            Photography
                                        </SelectItem>
                                        <SelectItem value="art">Art</SelectItem>
                                        <SelectItem value="writing">
                                            Writing
                                        </SelectItem>
                                        <SelectItem value="music">
                                            Music
                                        </SelectItem>
                                        <SelectItem value="dance">
                                            Dance
                                        </SelectItem>
                                        <SelectItem value="sports">
                                            Sports
                                        </SelectItem>
                                        <SelectItem value="quiz">
                                            Quiz
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {selectedChallenges.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={exportToCSV}
                                    className="flex items-center"
                                >
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Export ({selectedChallenges.length})
                                </Button>
                            )}
                            <Button
                                onClick={() => setIsFormOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Challenge
                            </Button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Challenges" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                            Total Challenges
                                        </p>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                            {challenges.length}
                                        </p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500">
                                        <Target className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                            Active
                                        </p>
                                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                            {
                                                challenges.filter(
                                                    (c) =>
                                                        c.status === 'active',
                                                ).length
                                            }
                                        </p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500">
                                        <div className="h-3 w-3 animate-pulse rounded-full bg-white"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:border-purple-800 dark:from-purple-900/20 dark:to-purple-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                            Completed
                                        </p>
                                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                            {
                                                challenges.filter(
                                                    (c) =>
                                                        c.status ===
                                                        'completed',
                                                ).length
                                            }
                                        </p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500">
                                        <div className="h-6 w-6 text-white">
                                            ✓
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:border-orange-800 dark:from-orange-900/20 dark:to-orange-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                            Total Participants
                                        </p>
                                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                            {challenges.reduce(
                                                (sum, c) =>
                                                    sum +
                                                    (c.participants_count ||
                                                        c.participants
                                                            ?.length ||
                                                        0),
                                                0,
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500">
                                        <Users2 className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Challenges Grid */}
                    {filteredChallenges.length === 0 ? (
                        <Card className="py-12 text-center">
                            <CardContent>
                                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                    <Target className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                                    No challenges found
                                </h3>
                                <p className="mb-4 text-gray-600 dark:text-gray-400">
                                    {search ||
                                    visibilityFilter !== 'all' ||
                                    goalTypeFilter !== 'all'
                                        ? 'Try adjusting your filters or search terms.'
                                        : 'Get started by creating your first challenge!'}
                                </p>
                                {!search &&
                                    visibilityFilter === 'all' &&
                                    goalTypeFilter === 'all' && (
                                        <Button
                                            onClick={() => setIsFormOpen(true)}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Challenge
                                        </Button>
                                    )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredChallenges.map((challenge) => (
                                <Card
                                    key={challenge.id}
                                    className="group border-gray-200 transition-all duration-200 hover:shadow-lg dark:border-gray-700"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="text-2xl">
                                                    {getGoalTypeIcon(
                                                        challenge.goal_type,
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <CardTitle className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                                                        {challenge.title}
                                                    </CardTitle>
                                                    <CardDescription className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                                        {challenge.description}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    checked={selectedChallenges.includes(
                                                        challenge.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleSelect(
                                                            challenge.id,
                                                        )
                                                    }
                                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                                />
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'challenges.participants',
                                                                    challenge.id,
                                                                )}
                                                            >
                                                                <Users className="mr-2 h-4 w-4" />
                                                                Participants
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'challenges.leaderboard',
                                                                    challenge.id,
                                                                )}
                                                            >
                                                                <Users className="mr-2 h-4 w-4" />
                                                                Leaderboard
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {challenge.visibility ===
                                                            'public' && (
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'challenges.public-show',
                                                                        challenge.id,
                                                                    )}
                                                                >
                                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                                    Public View
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canEdit && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    setSelectedChallenge(
                                                                        challenge,
                                                                    )
                                                                }
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canDelete && (
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        challenge.id,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Target className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {challenge.goal_value}{' '}
                                                    {challenge.goal_unit}
                                                </span>
                                            </div>
                                            <Badge
                                                variant={getVisibilityBadgeColor(
                                                    challenge.visibility,
                                                )}
                                                className="capitalize"
                                            >
                                                {challenge.visibility}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {format(
                                                        new Date(
                                                            challenge.start_date,
                                                        ),
                                                        'MMM dd',
                                                    )}
                                                </span>
                                                <span>-</span>
                                                <span>
                                                    {format(
                                                        new Date(
                                                            challenge.end_date,
                                                        ),
                                                        'MMM dd, yyyy',
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Users2 className="h-4 w-4" />
                                                <span>
                                                    {challenge.participants_count ||
                                                        challenge.participants
                                                            ?.length ||
                                                        0}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(challenge.status)}`}
                                            >
                                                {challenge.status}
                                            </span>
                                            {challenge.visibility ===
                                                'public' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="text-xs"
                                                >
                                                    <Link
                                                        href={route(
                                                            'challenges.public-register',
                                                            challenge.id,
                                                        )}
                                                    >
                                                        <ExternalLink className="mr-1 h-3 w-3" />
                                                        Join
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isFormOpen && (
                <ChallengeForm
                    challenge={null}
                    onSubmit={handleCreateChallenge}
                    onClose={() => setIsFormOpen(false)}
                />
            )}

            {selectedChallenge && (
                <ChallengeForm
                    challenge={selectedChallenge}
                    onSubmit={(formData: Partial<Challenge>) =>
                        handleUpdateChallenge(selectedChallenge.id, formData)
                    }
                    onClose={() => setSelectedChallenge(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}
