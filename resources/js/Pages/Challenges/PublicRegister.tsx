import { useState } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { format } from 'date-fns';
import { Calendar, Target, Trophy, Zap, Users, Clock, Award, CheckCircle, Star, UserPlus } from 'lucide-react';

interface Reward {
    type: 'badge' | 'points' | 'achievement' | 'cash' | 'item' | 'gift' | 'certificate' | 'trophy' | 'medal';
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

interface Props {
    challenge: Challenge;
    flash?: {
        message?: string;
        error?: string;
    };
}

export default function PublicRegister({ challenge, flash = {} }: Props) {
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

    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zip_code: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('challenges.public-register.store', challenge.id));
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

    const isChallengeActive = () => {
        return challenge.is_active;
    };

    const isChallengeUpcoming = () => {
        return challenge.is_upcoming;
    };

    return (
        <>
            <Head title={`Register for ${challenge.title}`} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                {/* Header */}
                <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-8 sm:mb-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 sm:mb-6 shadow-lg">
                                <span className="text-2xl sm:text-3xl">{getGoalTypeIcon(challenge.goal_type)}</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3 sm:mb-4">
                                Join the Challenge!
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
                                Ready to push your limits? Register now and be part of this exciting journey!
                            </p>
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
                            {/* Registration Form */}
                            <div className="xl:col-span-2">
                                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                    <CardHeader className="text-center pb-4 sm:pb-6">
                                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 sm:mb-6 shadow-lg">
                                            {getGoalTypeIcon(challenge.goal_type)}
                                        </div>
                                        <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 sm:mb-4">
                                            Join Challenge
                                        </CardTitle>
                                        <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-2">
                                            Register to participate in this exciting challenge and track your progress!
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="first_name" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                                        First Name *
                                                    </Label>
                                                    <Input
                                                        id="first_name"
                                                        name="first_name"
                                                        type="text"
                                                        value={data.first_name}
                                                        onChange={(e) => setData('first_name', e.target.value)}
                                                        className="h-10 sm:h-12 bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm sm:text-base"
                                                        placeholder="Enter your first name"
                                                        required
                                                    />
                                                    {errors.first_name && (
                                                        <p className="text-red-500 text-xs sm:text-sm">{errors.first_name}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="last_name" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                                        Last Name *
                                                    </Label>
                                                    <Input
                                                        id="last_name"
                                                        name="last_name"
                                                        type="text"
                                                        value={data.last_name}
                                                        onChange={(e) => setData('last_name', e.target.value)}
                                                        className="h-10 sm:h-12 bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm sm:text-base"
                                                        placeholder="Enter your last name"
                                                        required
                                                    />
                                                    {errors.last_name && (
                                                        <p className="text-red-500 text-xs sm:text-sm">{errors.last_name}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                                    Email Address *
                                                </Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className="h-10 sm:h-12 bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm sm:text-base"
                                                    placeholder="Enter your email address"
                                                    required
                                                />
                                                {errors.email && (
                                                    <p className="text-red-500 text-xs sm:text-sm">{errors.email}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                                    Phone Number
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    className="h-10 sm:h-12 bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm sm:text-base"
                                                    placeholder="Enter your phone number"
                                                />
                                                {errors.phone && (
                                                    <p className="text-red-500 text-xs sm:text-sm">{errors.phone}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="address" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                                    Address
                                                </Label>
                                                <Input
                                                    id="address"
                                                    name="address"
                                                    type="text"
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    className="h-10 sm:h-12 bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm sm:text-base"
                                                    placeholder="Enter your address"
                                                />
                                                {errors.address && (
                                                    <p className="text-red-500 text-xs sm:text-sm">{errors.address}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="city" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                                        City
                                                    </Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        type="text"
                                                        value={data.city}
                                                        onChange={(e) => setData('city', e.target.value)}
                                                        className="h-10 sm:h-12 bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm sm:text-base"
                                                        placeholder="Enter your city"
                                                    />
                                                    {errors.city && (
                                                        <p className="text-red-500 text-xs sm:text-sm">{errors.city}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="state" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                                        State/Province
                                                    </Label>
                                                    <Input
                                                        id="state"
                                                        name="state"
                                                        type="text"
                                                        value={data.state}
                                                        onChange={(e) => setData('state', e.target.value)}
                                                        className="h-10 sm:h-12 bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm sm:text-base"
                                                        placeholder="Enter your state"
                                                    />
                                                    {errors.state && (
                                                        <p className="text-red-500 text-xs sm:text-sm">{errors.state}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="country" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                                        Country
                                                    </Label>
                                                    <Input
                                                        id="country"
                                                        name="country"
                                                        type="text"
                                                        value={data.country}
                                                        onChange={(e) => setData('country', e.target.value)}
                                                        className="h-10 sm:h-12 bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm sm:text-base"
                                                        placeholder="Enter your country"
                                                    />
                                                    {errors.country && (
                                                        <p className="text-red-500 text-xs sm:text-sm">{errors.country}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="zip_code" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                                        ZIP/Postal Code
                                                    </Label>
                                                    <Input
                                                        id="zip_code"
                                                        name="zip_code"
                                                        type="text"
                                                        value={data.zip_code}
                                                        onChange={(e) => setData('zip_code', e.target.value)}
                                                        className="h-10 sm:h-12 bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm sm:text-base"
                                                        placeholder="Enter your ZIP code"
                                                    />
                                                    {errors.zip_code && (
                                                        <p className="text-red-500 text-xs sm:text-sm">{errors.zip_code}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-4 sm:pt-6">
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                                >
                                                    {processing ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            <span>Registering...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                                                            <span>Join Challenge</span>
                                                        </div>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Challenge Info Sidebar */}
                            <div className="space-y-4 sm:space-y-6">
                                {/* Challenge Details */}
                                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                            Challenge Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 sm:space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Target className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Goal</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                                                {challenge.goal_value} {challenge.goal_unit}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Duration</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                                                {formatDate(challenge.start_date, 'MMM dd')} - {formatDate(challenge.end_date, 'MMM dd')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Trophy className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Rewards</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{challenge.rewards?.length || 0}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Rewards Section */}
                                {challenge.rewards && challenge.rewards.length > 0 && (
                                    <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                                Rewards
                                            </CardTitle>
                                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                                Complete the challenge to earn these rewards
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3 sm:space-y-4">
                                            {challenge.rewards.map((reward, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-3 sm:p-4 border border-yellow-200 dark:border-yellow-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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
                                        </CardContent>
                                    </Card>
                                )}

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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 