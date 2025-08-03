import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { 
    ArrowLeft, 
    Trophy, 
    Medal, 
    Award, 
    Target, 
    Calendar, 
    Users, 
    TrendingUp, 
    Clock,
    CheckCircle,
    Star,
    Zap,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

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
    goal_type: 'steps' | 'calories' | 'distance' | 'time' | 'weight' | 'cooking' | 'photography' | 'art' | 'writing' | 'music' | 'dance' | 'sports' | 'quiz' | 'other';
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
    const formatDate = (dateString: string | null | undefined, formatString: string = 'MMM dd, yyyy') => {
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
        let sorted = [...leaderboard];
        
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
            rank: index + 1
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
            return <ArrowUpDown className="w-4 h-4" />;
        }
        return sortOrder === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />;
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
                return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 2:
                return <Medal className="w-5 h-5 text-gray-400" />;
            case 3:
                return <Award className="w-5 h-5 text-amber-600" />;
            default:
                return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
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
                <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" asChild className="h-8">
                            <Link href={route('challenges')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Challenges
                            </Link>
                        </Button>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            Challenge Leaderboard
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={`Leaderboard - ${challenge.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Challenge Header */}
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                            <CardHeader className="text-center pb-3 sm:pb-4 px-3 sm:px-4">
                                <div className="flex justify-center mb-3 sm:mb-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
                                        <span className="text-xl sm:text-2xl">{getGoalTypeIcon(challenge.goal_type)}</span>
                                    </div>
                                </div>
                                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 sm:mb-3 px-2 text-center">
                                    {challenge.title}
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2 text-center">
                                    {challenge.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4">
                                {/* Challenge Stats */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-2 sm:p-3 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${getGoalTypeColor(challenge.goal_type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Goal</p>
                                                <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                                    {challenge.goal_value} {challenge.goal_unit}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-2 sm:p-3 border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Duration</p>
                                                <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                                                    {formatDate(challenge.start_date, 'MMM dd')} - {formatDate(challenge.end_date, 'MMM dd')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-2 sm:p-3 border border-purple-200 dark:border-purple-800 sm:col-span-2 lg:col-span-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Participants</p>
                                                <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                                                    {leaderboard.length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Challenge Status */}
                                <div className="flex justify-center">
                                    {challenge.is_active && (
                                        <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 w-full sm:w-auto">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-xs sm:text-sm text-green-800 dark:text-green-200">Challenge Active</p>
                                                <p className="text-xs text-green-700 dark:text-green-300">Currently running</p>
                                            </div>
                                        </div>
                                    )}
                                    {challenge.is_upcoming && (
                                        <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800 w-full sm:w-auto">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-xs sm:text-sm text-blue-800 dark:text-blue-200">Starting Soon</p>
                                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                                    {formatDate(challenge.start_date, 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {challenge.is_ended && (
                                        <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-800 rounded-lg border border-gray-200 dark:border-gray-600 w-full sm:w-auto">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-500 to-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-gray-200">Challenge Ended</p>
                                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                                    {formatDate(challenge.end_date, 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Leaderboard */}
                        <Card className="border-0 shadow-xl bg-white dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                    Leaderboard
                                </CardTitle>
                                <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                                    Current rankings, progress, and completion times of all participants
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {sortedLeaderboard.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* Sorting Controls */}
                                        <div className="flex gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
                                                <Button
                                                    variant={sortBy === 'progress' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handleSort('progress')}
                                                    className="flex items-center gap-2"
                                                >
                                                    <TrendingUp className="w-4 h-4" />
                                                    Progress
                                                    {getSortIcon('progress')}
                                                </Button>
                                                <Button
                                                    variant={sortBy === 'time' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handleSort('time')}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Clock className="w-4 h-4" />
                                                    Time
                                                    {getSortIcon('time')}
                                                </Button>
                                            </div>
                                        </div>

                                        {sortedLeaderboard.map((entry, index) => (
                                            <div
                                                key={entry.id}
                                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                                                    index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800' :
                                                    index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-800 border-gray-200 dark:border-gray-600' :
                                                    index === 2 ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800' :
                                                    'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                }`}
                                            >
                                                {/* Rank */}
                                                <div className="flex-shrink-0">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(entry.rank)}`}>
                                                        {getRankIcon(entry.rank)}
                                                    </div>
                                                </div>

                                                {/* Participant Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                                            <span className="text-white font-semibold text-sm">
                                                                {entry.first_name.charAt(0)}{entry.last_name.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                                {entry.first_name} {entry.last_name}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Joined {formatDate(entry.joined_at, 'MMM dd')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress */}
                                                <div className="flex-shrink-0 text-right">
                                                    <div className="mb-2">
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {entry.progress_value} {challenge.goal_unit}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {entry.progress_percentage}% complete
                                                        </p>
                                                    </div>
                                                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                                index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                                                                index === 2 ? 'bg-gradient-to-r from-amber-500 to-amber-700' :
                                                                'bg-gradient-to-r from-blue-500 to-purple-600'
                                                            }`}
                                                            style={{ width: `${Math.min(entry.progress_percentage, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Time Difference */}
                                                <div className="flex-shrink-0 text-right ml-6">
                                                    <div className="mb-2">
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {entry.time_difference || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {entry.timer_is_active ? 'Active' : 
                                                             entry.time_difference ? 'Completed' : 'Not started'}
                                                        </p>
                                                    </div>
                                                    {entry.time_difference && (
                                                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                                                                    index === 2 ? 'bg-gradient-to-r from-amber-500 to-amber-700' :
                                                                    'bg-gradient-to-r from-blue-500 to-purple-600'
                                                                }`}
                                                                style={{ width: '100%' }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Trophy className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            No Participants Yet
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                                            Be the first to join this challenge and start climbing the leaderboard! Track your progress and completion time.
                                        </p>
                                        <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                                            <Link href={route('challenges.participants', challenge.id)}>
                                                <Zap className="w-4 h-4 mr-2" />
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