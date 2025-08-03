import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { format } from 'date-fns';
import { Calendar, Target, Users, Trophy, UserPlus, CheckCircle, Award, TrendingUp, Clock, Star } from 'lucide-react';

interface Reward {
    type: 'badge' | 'points' | 'achievement' | 'cash' | 'item' | 'gift' | 'certificate' | 'trophy' | 'medal';
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

interface Props {
    challenge: Challenge;
    participants: Participant[];
    flash?: {
        message?: string;
        error?: string;
    };
}

export default function PublicShow({ challenge, participants, flash = {} }: Props) {
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
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 animate-gradient-xy"></div>
            
            <div className="relative min-h-screen">
                {/* Header */}
                <div className="relative z-10 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <Target className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                        Public Challenge
                                    </h1>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Join the community challenge</p>
                                </div>
                                <div className="sm:hidden">
                                    <h1 className="text-sm font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                        Challenge
                                    </h1>
                                </div>
                            </div>
                            
                            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-3 sm:px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm sm:text-base">
                                <Link href={route('challenges.public-register', challenge.id)}>
                                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Join Challenge</span>
                                    <span className="sm:hidden">Join</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash.message && (
                    <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mt-4">
                        <div className="max-w-7xl mx-auto">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 sm:p-4 shadow-lg animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                                    <p className="text-green-800 dark:text-green-200 font-medium text-sm sm:text-base">{flash.message}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {flash.error && (
                    <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mt-4">
                        <div className="max-w-7xl mx-auto">
                            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4 shadow-lg animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-bold">!</span>
                                    </div>
                                    <p className="text-red-800 dark:text-red-200 font-medium text-sm sm:text-base">{flash.error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {/* Main Content */}
                            <div className="xl:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
                                {/* Challenge Details */}
                                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                    <CardHeader className="text-center pb-4 sm:pb-6">
                                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 sm:mb-6 shadow-lg">
                                            {getGoalTypeIcon(challenge.goal_type)}
                                        </div>
                                        <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 sm:mb-4">
                                            {challenge.title}
                                        </CardTitle>
                                        <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-2">
                                            {challenge.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 sm:space-y-6">
                                        {/* Goal Information */}
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600">
                                            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getGoalTypeColor(challenge.goal_type)} rounded-lg flex items-center justify-center`}>
                                                    {getGoalTypeIcon(challenge.goal_type)}
                                                </div>
                                                <div>
                                                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Challenge Goal</p>
                                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">What you need to achieve</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Target</p>
                                                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                                                        {challenge.goal_value} {challenge.goal_unit}
                                                    </p>
                                                </div>
                                                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Duration</p>
                                                    <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                                                        {formatDate(challenge.start_date, 'MMM dd')} - {formatDate(challenge.end_date, 'MMM dd, yyyy')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {challenge.rewards && challenge.rewards.length > 0 && (
                                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 sm:p-6 border border-yellow-100 dark:border-yellow-800">
                                                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                                                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Rewards</p>
                                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Complete the challenge to earn these rewards</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                    {challenge.rewards.map((reward, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-3 sm:p-4 border border-yellow-200 dark:border-yellow-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getRewardColor(reward.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                                    <span className="text-lg sm:text-xl">{getRewardIcon(reward.type)}</span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base capitalize">
                                                                        {reward.type.replace('_', ' ')}
                                                                    </p>
                                                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                                        {formatRewardValue(reward.type, reward.value)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Participants */}
                                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                    <CardHeader className="text-center pb-4 sm:pb-6">
                                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-3 sm:mb-4 shadow-lg">
                                            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                        <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                            Participants ({participants.length})
                                        </CardTitle>
                                        <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                                            People who have joined this challenge
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {participants.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                {participants.map((participant) => (
                                                    <div
                                                        key={participant.id}
                                                        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                                                    >
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                                                                <span className="text-white font-semibold text-xs sm:text-sm">
                                                                    {participant.first_name.charAt(0)}{participant.last_name.charAt(0)}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                                                                    {participant.first_name} {participant.last_name}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Joined {formatDate(participant.joined_at, 'MMM dd')}
                                                                </p>
                                                                {participant.progress !== undefined && (
                                                                    <div className="mt-2">
                                                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                                            <span>Progress</span>
                                                                            <span>{participant.progress}%</span>
                                                                        </div>
                                                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                            <div
                                                                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                                                                style={{ width: `${participant.progress}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 sm:py-12">
                                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                                    <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                    No Participants Yet
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 max-w-sm mx-auto text-sm sm:text-base px-2">
                                                    Be the first to join this exciting challenge!
                                                </p>
                                                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm sm:text-base">
                                                    <Link href={route('challenges.public-register', challenge.id)}>
                                                        <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
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
                                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                            Challenge Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 sm:space-y-4">
                                        {isChallengeActive() && (
                                            <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-green-800 dark:text-green-200 text-sm sm:text-base">Active Now</p>
                                                    <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">Challenge is currently running</p>
                                                </div>
                                            </div>
                                        )}
                                        {isChallengeUpcoming() && (
                                            <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base">Starting Soon</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 ml-11 sm:ml-13">
                                                    {formatDate(challenge.start_date, 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        )}
                                        {!isChallengeActive() && !isChallengeUpcoming() && (
                                            <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-gray-600">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-500 to-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Challenge Ended</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 ml-11 sm:ml-13">
                                                    {formatDate(challenge.end_date, 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Quick Stats */}
                                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                            Quick Stats
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 sm:space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Participants</span>
                                            </div>
                                            <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">{participants.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Target className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Goal Type</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white capitalize text-sm sm:text-base">{challenge.goal_type}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Rewards</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{challenge.rewards?.length || 0}</span>
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