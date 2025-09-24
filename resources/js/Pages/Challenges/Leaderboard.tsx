import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    ArrowUpDown,
    Award,
    Calendar,
    CheckCircle,
    Clock,
    Medal,
    Star,
    Target,
    TrendingUp,
    Trophy,
    Users,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    identifier: string;
}

interface Reward {
    type: 'badge' | 'points' | 'achievement';
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
    visibility: 'public' | 'private' | 'friends' | 'family' | 'coworkers';
    rewards: Reward[];
    status: 'active' | 'inactive' | 'completed';
    is_active?: boolean;
    is_upcoming?: boolean;
    is_ended?: boolean;
}

interface LeaderboardEntry {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    progress_value: number;
    progress_percentage: number;
    rank: number;
    joined_at: string;
    last_updated: string;
    timer_started_at?: string | null;
    timer_ended_at?: string | null;
    timer_is_active?: boolean;
    elapsed_time_seconds?: number;
    time_difference?: string | null;
    time_difference_seconds?: number | null;
}

interface Props {
    auth: {
        user: User;
    };
    challenge: Challenge;
    leaderboard: LeaderboardEntry[];
}

export default function Leaderboard({ auth, challenge, leaderboard }: Props) {
    const [sortBy, setSortBy] = useState<'progress' | 'time'>('progress');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Safe date formatting function
    const formatDate = (
        dateString: string | null | undefined,
        formatString: string = 'MMM dd, yyyy',
    ) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return format(date, formatString);
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Sort and rank the leaderboard
    const sortedLeaderboard = useMemo(() => {
        const sorted = [...leaderboard];

        if (sortBy === 'progress') {
            sorted.sort((a, b) => {
                const diff = b.progress_value - a.progress_value;
                return sortOrder === 'desc' ? diff : -diff;
            });
        } else if (sortBy === 'time') {
            sorted.sort((a, b) => {
                const timeA = a.time_difference_seconds ?? Infinity;
                const timeB = b.time_difference_seconds ?? Infinity;
                const diff = timeA - timeB;
                return sortOrder === 'desc' ? -diff : diff;
            });
        }

        // Add ranks
        return sorted.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
    }, [leaderboard, sortBy, sortOrder]);

    const handleSort = (newSortBy: 'progress' | 'time') => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
    };

    const getSortIcon = (column: 'progress' | 'time') => {
        if (sortBy !== column) {
            return <ArrowUpDown className="h-4 w-4" />;
        }
        return sortOrder === 'desc' ? (
            <ArrowDown className="h-4 w-4" />
        ) : (
            <ArrowUp className="h-4 w-4" />
        );
    };

    const getGoalTypeIcon = (type: string) => {
        switch (type) {
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

    const getGoalTypeColor = (type: string) => {
        switch (type) {
            case 'steps':
                return 'from-blue-500 to-cyan-500';
            case 'calories':
                return 'from-orange-500 to-red-500';
            case 'distance':
                return 'from-green-500 to-emerald-500';
            case 'time':
                return 'from-purple-500 to-pink-500';
            case 'weight':
                return 'from-indigo-500 to-blue-500';
            default:
                return 'from-gray-500 to-slate-500';
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Award className="h-5 w-5 text-amber-600" />;
            default:
                return (
                    <span className="text-sm font-bold text-gray-500">
                        #{rank}
                    </span>
                );
        }
    };

    const getRankBadgeColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
            case 2:
                return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
            case 3:
                return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" asChild className="h-8">
                            <Link href={route('challenges')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Challenges
                            </Link>
                        </Button>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Challenge Leaderboard
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={`Leaderboard - ${challenge.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Challenge Header */}
                        <Card className="border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
                            <CardHeader className="px-3 pb-3 text-center sm:px-4 sm:pb-4">
                                <div className="mb-3 flex justify-center sm:mb-4">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg sm:h-16 sm:w-16">
                                        <span className="text-xl sm:text-2xl">
                                            {getGoalTypeIcon(
                                                challenge.goal_type,
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <CardTitle className="mb-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text px-2 text-center text-lg font-bold text-transparent dark:from-white dark:to-gray-300 sm:mb-3 sm:text-xl lg:text-2xl">
                                    {challenge.title}
                                </CardTitle>
                                <CardDescription className="mx-auto max-w-2xl px-2 text-center text-xs text-gray-600 dark:text-gray-400 sm:text-sm lg:text-base">
                                    {challenge.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 px-3 sm:space-y-4 sm:px-4">
                                {/* Challenge Stats */}
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
                                    <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-2 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20 sm:p-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-8 w-8 bg-gradient-to-br sm:h-10 sm:w-10 ${getGoalTypeColor(challenge.goal_type)} flex flex-shrink-0 items-center justify-center rounded-lg`}
                                            >
                                                <Target className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    Goal
                                                </p>
                                                <p className="truncate text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                                                    {challenge.goal_value}{' '}
                                                    {challenge.goal_unit}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-2 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20 sm:p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 sm:h-10 sm:w-10">
                                                <Calendar className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    Duration
                                                </p>
                                                <p className="text-xs font-bold text-gray-900 dark:text-white sm:text-sm">
                                                    {formatDate(
                                                        challenge.start_date,
                                                        'MMM dd',
                                                    )}{' '}
                                                    -{' '}
                                                    {formatDate(
                                                        challenge.end_date,
                                                        'MMM dd',
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-2 dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20 sm:col-span-2 sm:p-3 lg:col-span-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 sm:h-10 sm:w-10">
                                                <Users className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    Participants
                                                </p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                                                    {leaderboard.length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Challenge Status */}
                                <div className="flex justify-center">
                                    {challenge.is_active && (
                                        <div className="flex w-full items-center gap-2 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-2 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20 sm:w-auto sm:p-3">
                                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 sm:h-8 sm:w-8">
                                                <CheckCircle className="h-3 w-3 text-white sm:h-4 sm:w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-green-800 dark:text-green-200 sm:text-sm">
                                                    Challenge Active
                                                </p>
                                                <p className="text-xs text-green-700 dark:text-green-300">
                                                    Currently running
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {challenge.is_upcoming && (
                                        <div className="flex w-full items-center gap-2 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-2 dark:border-blue-800 dark:from-blue-900/20 dark:to-cyan-900/20 sm:w-auto sm:p-3">
                                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 sm:h-8 sm:w-8">
                                                <Clock className="h-3 w-3 text-white sm:h-4 sm:w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 sm:text-sm">
                                                    Starting Soon
                                                </p>
                                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                                    {formatDate(
                                                        challenge.start_date,
                                                        'MMM dd, yyyy',
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {challenge.is_ended && (
                                        <div className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 p-2 dark:border-gray-600 dark:from-gray-700 dark:to-slate-800 sm:w-auto sm:p-3">
                                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-slate-600 sm:h-8 sm:w-8">
                                                <Star className="h-3 w-3 text-white sm:h-4 sm:w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 sm:text-sm">
                                                    Challenge Ended
                                                </p>
                                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                                    {formatDate(
                                                        challenge.end_date,
                                                        'MMM dd, yyyy',
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Leaderboard */}
                        <Card className="border-0 bg-white shadow-xl dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-300">
                                    <Trophy className="h-6 w-6 text-yellow-500" />
                                    Leaderboard
                                </CardTitle>
                                <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                                    Current rankings, progress, and completion
                                    times of all participants
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {sortedLeaderboard.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* Sorting Controls */}
                                        <div className="mb-6 flex gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Sort by:
                                                </span>
                                                <Button
                                                    variant={
                                                        sortBy === 'progress'
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        handleSort('progress')
                                                    }
                                                    className="flex items-center gap-2"
                                                >
                                                    <TrendingUp className="h-4 w-4" />
                                                    Progress
                                                    {getSortIcon('progress')}
                                                </Button>
                                                <Button
                                                    variant={
                                                        sortBy === 'time'
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        handleSort('time')
                                                    }
                                                    className="flex items-center gap-2"
                                                >
                                                    <Clock className="h-4 w-4" />
                                                    Time
                                                    {getSortIcon('time')}
                                                </Button>
                                            </div>
                                        </div>

                                        {sortedLeaderboard.map(
                                            (entry, index) => (
                                                <div
                                                    key={entry.id}
                                                    className={`flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:shadow-lg ${
                                                        index === 0
                                                            ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-amber-900/20'
                                                            : index === 1
                                                              ? 'border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 dark:border-gray-600 dark:from-gray-700 dark:to-slate-800'
                                                              : index === 2
                                                                ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-900/20 dark:to-orange-900/20'
                                                                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                                    }`}
                                                >
                                                    {/* Rank */}
                                                    <div className="flex-shrink-0">
                                                        <div
                                                            className={`flex h-12 w-12 items-center justify-center rounded-full ${getRankBadgeColor(entry.rank)}`}
                                                        >
                                                            {getRankIcon(
                                                                entry.rank,
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Participant Info */}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                                                                <span className="text-sm font-semibold text-white">
                                                                    {entry.first_name.charAt(
                                                                        0,
                                                                    )}
                                                                    {entry.last_name.charAt(
                                                                        0,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate font-semibold text-gray-900 dark:text-white">
                                                                    {
                                                                        entry.first_name
                                                                    }{' '}
                                                                    {
                                                                        entry.last_name
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    Joined{' '}
                                                                    {formatDate(
                                                                        entry.joined_at,
                                                                        'MMM dd',
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Progress */}
                                                    <div className="flex-shrink-0 text-right">
                                                        <div className="mb-2">
                                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                                {
                                                                    entry.progress_value
                                                                }{' '}
                                                                {
                                                                    challenge.goal_unit
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {
                                                                    entry.progress_percentage
                                                                }
                                                                % complete
                                                            </p>
                                                        </div>
                                                        <div className="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700">
                                                            <div
                                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                                    index === 0
                                                                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                                                        : index ===
                                                                            1
                                                                          ? 'bg-gradient-to-r from-gray-400 to-gray-600'
                                                                          : index ===
                                                                              2
                                                                            ? 'bg-gradient-to-r from-amber-500 to-amber-700'
                                                                            : 'bg-gradient-to-r from-blue-500 to-purple-600'
                                                                }`}
                                                                style={{
                                                                    width: `${Math.min(entry.progress_percentage, 100)}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {/* Time Difference */}
                                                    <div className="ml-6 flex-shrink-0 text-right">
                                                        <div className="mb-2">
                                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                                {entry.time_difference ||
                                                                    'N/A'}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {entry.timer_is_active
                                                                    ? 'Active'
                                                                    : entry.time_difference
                                                                      ? 'Completed'
                                                                      : 'Not started'}
                                                            </p>
                                                        </div>
                                                        {entry.time_difference && (
                                                            <div className="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                                        index ===
                                                                        0
                                                                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                                                            : index ===
                                                                                1
                                                                              ? 'bg-gradient-to-r from-gray-400 to-gray-600'
                                                                              : index ===
                                                                                  2
                                                                                ? 'bg-gradient-to-r from-amber-500 to-amber-700'
                                                                                : 'bg-gradient-to-r from-blue-500 to-purple-600'
                                                                    }`}
                                                                    style={{
                                                                        width: '100%',
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                                            <Trophy className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                            No Participants Yet
                                        </h3>
                                        <p className="mx-auto mb-6 max-w-sm text-gray-500 dark:text-gray-400">
                                            Be the first to join this challenge
                                            and start climbing the leaderboard!
                                            Track your progress and completion
                                            time.
                                        </p>
                                        <Button
                                            asChild
                                            className="transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                                        >
                                            <Link
                                                href={route(
                                                    'challenges.participants',
                                                    challenge.id,
                                                )}
                                            >
                                                <Zap className="mr-2 h-4 w-4" />
                                                Join Challenge
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
