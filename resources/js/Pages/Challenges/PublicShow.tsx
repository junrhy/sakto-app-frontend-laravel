import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    CheckCircle,
    Clock,
    Star,
    Target,
    TrendingUp,
    Trophy,
    UserPlus,
    Users,
} from 'lucide-react';

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

interface Participant {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    progress?: number;
    joined_at: string;
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

interface Props {
    challenge: Challenge;
    participants: Participant[];
    flash?: {
        message?: string;
        error?: string;
    };
}

export default function PublicShow({
    challenge,
    participants,
    flash = {},
}: Props) {
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
                return 'from-blue-500 to-cyan-600';
            case 'calories':
                return 'from-red-500 to-pink-600';
            case 'distance':
                return 'from-green-500 to-emerald-600';
            case 'time':
                return 'from-purple-500 to-violet-600';
            case 'weight':
                return 'from-orange-500 to-red-600';
            default:
                return 'from-gray-500 to-slate-600';
        }
    };

    const isChallengeActive = () => {
        if (!challenge.start_date || !challenge.end_date) return false;
        try {
            const now = new Date();
            const startDate = new Date(challenge.start_date);
            const endDate = new Date(challenge.end_date);
            return now >= startDate && now <= endDate;
        } catch (error) {
            return false;
        }
    };

    const isChallengeUpcoming = () => {
        if (!challenge.start_date) return false;
        try {
            const now = new Date();
            const startDate = new Date(challenge.start_date);
            return now < startDate;
        } catch (error) {
            return false;
        }
    };

    const getRewardIcon = (type: string) => {
        switch (type) {
            case 'badge':
                return '🏅';
            case 'points':
                return '⭐';
            case 'achievement':
                return '🎯';
            case 'cash':
                return '💰';
            case 'item':
                return '📦';
            case 'gift':
                return '🎁';
            case 'certificate':
                return '📜';
            case 'trophy':
                return '🏆';
            case 'medal':
                return '🥇';
            default:
                return '🎁';
        }
    };

    const getRewardColor = (type: string) => {
        switch (type) {
            case 'badge':
                return 'from-blue-500 to-cyan-600';
            case 'points':
                return 'from-yellow-500 to-orange-600';
            case 'achievement':
                return 'from-purple-500 to-pink-600';
            case 'cash':
                return 'from-green-500 to-emerald-600';
            case 'item':
                return 'from-indigo-500 to-blue-600';
            case 'gift':
                return 'from-pink-500 to-rose-600';
            case 'certificate':
                return 'from-amber-500 to-yellow-600';
            case 'trophy':
                return 'from-yellow-400 to-orange-500';
            case 'medal':
                return 'from-yellow-300 to-amber-400';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    const formatRewardValue = (type: string, value: string) => {
        switch (type) {
            case 'cash':
                return `$${value}`;
            case 'points':
                return `${value} points`;
            case 'badge':
                return value;
            case 'achievement':
                return value;
            case 'item':
                return value;
            case 'gift':
                return value;
            case 'certificate':
                return value;
            case 'trophy':
                return value;
            case 'medal':
                return value;
            default:
                return value;
        }
    };

    return (
        <>
            <Head title={`${challenge.title} - Public Challenge`} />

            {/* Animated Background */}
            <div className="animate-gradient-xy fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900"></div>

            <div className="relative min-h-screen">
                {/* Header */}
                <div className="relative z-10 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg sm:h-10 sm:w-10">
                                    <Target className="h-4 w-4 text-white sm:h-6 sm:w-6" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-lg font-bold text-transparent dark:from-white dark:to-gray-300 sm:text-xl">
                                        Public Challenge
                                    </h1>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                                        Join the community challenge
                                    </p>
                                </div>
                                <div className="sm:hidden">
                                    <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-sm font-bold text-transparent dark:from-white dark:to-gray-300">
                                        Challenge
                                    </h1>
                                </div>
                            </div>

                            <Button
                                asChild
                                className="transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl sm:px-6 sm:text-base"
                            >
                                <Link
                                    href={route(
                                        'challenges.public-register',
                                        challenge.id,
                                    )}
                                >
                                    <UserPlus className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                                    <span className="hidden sm:inline">
                                        Join Challenge
                                    </span>
                                    <span className="sm:hidden">Join</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash.message && (
                    <div className="relative z-10 mt-4 w-full px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className="animate-fade-in rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-3 shadow-lg dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20 sm:p-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600 sm:h-5 sm:w-5" />
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200 sm:text-base">
                                        {flash.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {flash.error && (
                    <div className="relative z-10 mt-4 w-full px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className="animate-fade-in rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-3 shadow-lg dark:border-red-800 dark:from-red-900/20 dark:to-pink-900/20 sm:p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-500 sm:h-5 sm:w-5">
                                        <span className="text-xs font-bold text-white">
                                            !
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200 sm:text-base">
                                        {flash.error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="relative z-10 w-full px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 xl:grid-cols-3">
                            {/* Main Content */}
                            <div className="space-y-4 sm:space-y-6 lg:space-y-8 xl:col-span-2">
                                {/* Challenge Details */}
                                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                                    <CardHeader className="pb-4 text-center sm:pb-6">
                                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg sm:mb-6 sm:h-20 sm:w-20">
                                            {getGoalTypeIcon(
                                                challenge.goal_type,
                                            )}
                                        </div>
                                        <CardTitle className="mb-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-300 sm:mb-4 sm:text-3xl">
                                            {challenge.title}
                                        </CardTitle>
                                        <CardDescription className="mx-auto max-w-2xl px-2 text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
                                            {challenge.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 sm:space-y-6">
                                        {/* Goal Information */}
                                        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 sm:p-6">
                                            <div className="mb-3 flex items-center gap-3 sm:mb-4 sm:gap-4">
                                                <div
                                                    className={`h-10 w-10 bg-gradient-to-br sm:h-12 sm:w-12 ${getGoalTypeColor(challenge.goal_type)} flex items-center justify-center rounded-lg`}
                                                >
                                                    {getGoalTypeIcon(
                                                        challenge.goal_type,
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                                                        Challenge Goal
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                                                        What you need to achieve
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                                <div className="rounded-lg border border-gray-200 bg-white/50 p-3 dark:border-gray-600 dark:bg-gray-800/50 sm:p-4">
                                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                                                        Target
                                                    </p>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white sm:text-2xl">
                                                        {challenge.goal_value}{' '}
                                                        {challenge.goal_unit}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg border border-gray-200 bg-white/50 p-3 dark:border-gray-600 dark:bg-gray-800/50 sm:p-4">
                                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                                                        Duration
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white sm:text-lg">
                                                        {formatDate(
                                                            challenge.start_date,
                                                            'MMM dd',
                                                        )}{' '}
                                                        -{' '}
                                                        {formatDate(
                                                            challenge.end_date,
                                                            'MMM dd, yyyy',
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {challenge.rewards &&
                                            challenge.rewards.length > 0 && (
                                                <div className="rounded-xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-orange-50 p-4 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20 sm:p-6">
                                                    <div className="mb-3 flex items-center gap-3 sm:mb-4 sm:gap-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 sm:h-12 sm:w-12">
                                                            <Trophy className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                                                                Rewards
                                                            </p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                                                                Complete the
                                                                challenge to
                                                                earn these
                                                                rewards
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                                        {challenge.rewards.map(
                                                            (reward, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="transform rounded-xl border border-yellow-200 bg-white/70 p-3 transition-all duration-200 hover:scale-105 hover:shadow-lg dark:border-yellow-700 dark:bg-gray-800/70 sm:p-4"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            className={`h-10 w-10 bg-gradient-to-br sm:h-12 sm:w-12 ${getRewardColor(reward.type)} flex flex-shrink-0 items-center justify-center rounded-lg`}
                                                                        >
                                                                            <span className="text-lg sm:text-xl">
                                                                                {getRewardIcon(
                                                                                    reward.type,
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="text-sm font-semibold capitalize text-gray-900 dark:text-white sm:text-base">
                                                                                {reward.type.replace(
                                                                                    '_',
                                                                                    ' ',
                                                                                )}
                                                                            </p>
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                                                                                {formatRewardValue(
                                                                                    reward.type,
                                                                                    reward.value,
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </CardContent>
                                </Card>

                                {/* Participants */}
                                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                                    <CardHeader className="pb-4 text-center sm:pb-6">
                                        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg sm:mb-4 sm:h-16 sm:w-16">
                                            <Users className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                                        </div>
                                        <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:to-gray-300 sm:text-2xl">
                                            Participants ({participants.length})
                                        </CardTitle>
                                        <CardDescription className="text-base text-gray-600 dark:text-gray-400 sm:text-lg">
                                            People who have joined this
                                            challenge
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {participants.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                                                {participants.map(
                                                    (participant) => (
                                                        <div
                                                            key={participant.id}
                                                            className="transform rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-3 transition-all duration-200 hover:scale-105 hover:shadow-lg dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 sm:p-4"
                                                        >
                                                            <div className="flex items-center gap-2 sm:gap-3">
                                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg sm:h-12 sm:w-12">
                                                                    <span className="text-xs font-semibold text-white sm:text-sm">
                                                                        {participant.first_name.charAt(
                                                                            0,
                                                                        )}
                                                                        {participant.last_name.charAt(
                                                                            0,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                                                                        {
                                                                            participant.first_name
                                                                        }{' '}
                                                                        {
                                                                            participant.last_name
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        Joined{' '}
                                                                        {formatDate(
                                                                            participant.joined_at,
                                                                            'MMM dd',
                                                                        )}
                                                                    </p>
                                                                    {participant.progress !==
                                                                        undefined && (
                                                                        <div className="mt-2">
                                                                            <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                                                                <span>
                                                                                    Progress
                                                                                </span>
                                                                                <span>
                                                                                    {
                                                                                        participant.progress
                                                                                    }

                                                                                    %
                                                                                </span>
                                                                            </div>
                                                                            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                                                                <div
                                                                                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                                                                                    style={{
                                                                                        width: `${participant.progress}%`,
                                                                                    }}
                                                                                ></div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center sm:py-12">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 sm:mb-6 sm:h-24 sm:w-24">
                                                    <Users className="h-8 w-8 text-gray-400 sm:h-12 sm:w-12" />
                                                </div>
                                                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                                                    No Participants Yet
                                                </h3>
                                                <p className="mx-auto mb-4 max-w-sm px-2 text-sm text-gray-500 dark:text-gray-400 sm:mb-6 sm:text-base">
                                                    Be the first to join this
                                                    exciting challenge!
                                                </p>
                                                <Button
                                                    asChild
                                                    className="transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl sm:px-6 sm:py-3 sm:text-base"
                                                >
                                                    <Link
                                                        href={route(
                                                            'challenges.public-register',
                                                            challenge.id,
                                                        )}
                                                    >
                                                        <UserPlus className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                                                        Join Now
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-4 sm:space-y-6">
                                {/* Challenge Status */}
                                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                                    <CardHeader>
                                        <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-lg font-bold text-transparent dark:from-white dark:to-gray-300 sm:text-xl">
                                            Challenge Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 sm:space-y-4">
                                        {isChallengeActive() && (
                                            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-3 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20 sm:p-4">
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 sm:h-10 sm:w-10">
                                                    <CheckCircle className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-green-800 dark:text-green-200 sm:text-base">
                                                        Active Now
                                                    </p>
                                                    <p className="text-xs text-green-700 dark:text-green-300 sm:text-sm">
                                                        Challenge is currently
                                                        running
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {isChallengeUpcoming() && (
                                            <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-3 dark:border-blue-800 dark:from-blue-900/20 dark:to-cyan-900/20 sm:p-4">
                                                <div className="mb-2 flex items-center gap-3">
                                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 sm:h-10 sm:w-10">
                                                        <Clock className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 sm:text-base">
                                                            Starting Soon
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="sm:ml-13 ml-11 text-xs text-blue-700 dark:text-blue-300 sm:text-sm">
                                                    {formatDate(
                                                        challenge.start_date,
                                                        'MMM dd, yyyy',
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                        {!isChallengeActive() &&
                                            !isChallengeUpcoming() && (
                                                <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 p-3 dark:border-gray-600 dark:from-gray-700 dark:to-slate-800 sm:p-4">
                                                    <div className="mb-2 flex items-center gap-3">
                                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-slate-600 sm:h-10 sm:w-10">
                                                            <Star className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 sm:text-base">
                                                                Challenge Ended
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="sm:ml-13 ml-11 text-xs text-gray-700 dark:text-gray-300 sm:text-sm">
                                                        {formatDate(
                                                            challenge.end_date,
                                                            'MMM dd, yyyy',
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                    </CardContent>
                                </Card>

                                {/* Quick Stats */}
                                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                                    <CardHeader>
                                        <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-lg font-bold text-transparent dark:from-white dark:to-gray-300 sm:text-xl">
                                            Quick Stats
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 sm:space-y-4">
                                        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-3 dark:from-blue-900/20 dark:to-indigo-900/20">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 flex-shrink-0 text-blue-600" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                                    Participants
                                                </span>
                                            </div>
                                            <span className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                                                {participants.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3 dark:from-green-900/20 dark:to-emerald-900/20">
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 flex-shrink-0 text-green-600" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                                    Goal Type
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold capitalize text-gray-900 dark:text-white sm:text-base">
                                                {challenge.goal_type}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-3 dark:from-purple-900/20 dark:to-pink-900/20">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 flex-shrink-0 text-purple-600" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                                    Rewards
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                                                {challenge.rewards?.length || 0}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
