import { Head, Link } from '@inertiajs/react';
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
    Zap
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
    status: 'active' | 'completed' | 'archived';
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
}

interface Props {
    auth: {
        user: User;
    };
    challenge: Challenge;
    leaderboard: LeaderboardEntry[];
}

export default function Leaderboard({ auth, challenge, leaderboard }: Props) {
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
                            <CardHeader className="text-center pb-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
                                    <span className="text-3xl">{getGoalTypeIcon(challenge.goal_type)}</span>
                                </div>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                                    {challenge.title}
                                </CardTitle>
                                <CardDescription className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                                    {challenge.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Challenge Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 bg-gradient-to-br ${getGoalTypeColor(challenge.goal_type)} rounded-lg flex items-center justify-center`}>
                                                <Target className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Goal</p>
                                                <p className="font-bold text-lg text-gray-900 dark:text-white">
                                                    {challenge.goal_value} {challenge.goal_unit}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                                <Calendar className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                                                <p className="font-bold text-sm text-gray-900 dark:text-white">
                                                    {formatDate(challenge.start_date, 'MMM dd')} - {formatDate(challenge.end_date, 'MMM dd')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                                <Users className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Participants</p>
                                                <p className="font-bold text-lg text-gray-900 dark:text-white">
                                                    {leaderboard.length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Challenge Status */}
                                <div className="flex justify-center">
                                    {challenge.is_active && (
                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-green-800 dark:text-green-200">Challenge Active</p>
                                                <p className="text-sm text-green-700 dark:text-green-300">Currently running</p>
                                            </div>
                                        </div>
                                    )}
                                    {challenge.is_upcoming && (
                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-blue-800 dark:text-blue-200">Starting Soon</p>
                                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                                    {formatDate(challenge.start_date, 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {challenge.is_ended && (
                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-gray-600">
                                            <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-slate-600 rounded-full flex items-center justify-center">
                                                <Star className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">Challenge Ended</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
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
                                    Current rankings and progress of all participants
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {leaderboard.length > 0 ? (
                                    <div className="space-y-4">
                                        {leaderboard.map((entry, index) => (
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
                                            Be the first to join this challenge and start climbing the leaderboard!
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