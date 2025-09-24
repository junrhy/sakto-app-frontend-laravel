import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Calendar,
    CheckCircle,
    Clock,
    Star,
    Target,
    Trophy,
    UserPlus,
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
    flash?: {
        message?: string;
        error?: string;
    };
}

export default function PublicRegister({ challenge, flash = {} }: Props) {
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
                    <div className="absolute -right-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-indigo-400/20 to-pink-400/20 blur-3xl delay-1000"></div>
                </div>

                {/* Header */}
                <div className="relative z-10 w-full px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 text-center sm:mb-12">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg sm:mb-6 sm:h-20 sm:w-20">
                                <span className="text-2xl sm:text-3xl">
                                    {getGoalTypeIcon(challenge.goal_type)}
                                </span>
                            </div>
                            <h1 className="mb-3 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-gray-300 sm:mb-4 sm:text-4xl lg:text-5xl">
                                Join the Challenge!
                            </h1>
                            <p className="mx-auto max-w-2xl px-2 text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
                                Ready to push your limits? Register now and be
                                part of this exciting journey!
                            </p>
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
                            {/* Registration Form */}
                            <div className="xl:col-span-2">
                                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                                    <CardHeader className="pb-4 text-center sm:pb-6">
                                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg sm:mb-6 sm:h-20 sm:w-20">
                                            {getGoalTypeIcon(
                                                challenge.goal_type,
                                            )}
                                        </div>
                                        <CardTitle className="mb-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-300 sm:mb-4 sm:text-3xl">
                                            Join Challenge
                                        </CardTitle>
                                        <CardDescription className="mx-auto max-w-2xl px-2 text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
                                            Register to participate in this
                                            exciting challenge and track your
                                            progress!
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form
                                            onSubmit={handleSubmit}
                                            className="space-y-4 sm:space-y-6"
                                        >
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="first_name"
                                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base"
                                                    >
                                                        First Name *
                                                    </Label>
                                                    <Input
                                                        id="first_name"
                                                        name="first_name"
                                                        type="text"
                                                        value={data.first_name}
                                                        onChange={(e) =>
                                                            setData(
                                                                'first_name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-10 border-gray-300 bg-white/50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700/50 dark:focus:border-blue-400 dark:focus:ring-blue-400 sm:h-12 sm:text-base"
                                                        placeholder="Enter your first name"
                                                        required
                                                    />
                                                    {errors.first_name && (
                                                        <p className="text-xs text-red-500 sm:text-sm">
                                                            {errors.first_name}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="last_name"
                                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base"
                                                    >
                                                        Last Name *
                                                    </Label>
                                                    <Input
                                                        id="last_name"
                                                        name="last_name"
                                                        type="text"
                                                        value={data.last_name}
                                                        onChange={(e) =>
                                                            setData(
                                                                'last_name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-10 border-gray-300 bg-white/50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700/50 dark:focus:border-blue-400 dark:focus:ring-blue-400 sm:h-12 sm:text-base"
                                                        placeholder="Enter your last name"
                                                        required
                                                    />
                                                    {errors.last_name && (
                                                        <p className="text-xs text-red-500 sm:text-sm">
                                                            {errors.last_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="email"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base"
                                                >
                                                    Email Address *
                                                </Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) =>
                                                        setData(
                                                            'email',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-10 border-gray-300 bg-white/50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700/50 dark:focus:border-blue-400 dark:focus:ring-blue-400 sm:h-12 sm:text-base"
                                                    placeholder="Enter your email address"
                                                    required
                                                />
                                                {errors.email && (
                                                    <p className="text-xs text-red-500 sm:text-sm">
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="phone"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base"
                                                >
                                                    Phone Number
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) =>
                                                        setData(
                                                            'phone',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-10 border-gray-300 bg-white/50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700/50 dark:focus:border-blue-400 dark:focus:ring-blue-400 sm:h-12 sm:text-base"
                                                    placeholder="Enter your phone number"
                                                />
                                                {errors.phone && (
                                                    <p className="text-xs text-red-500 sm:text-sm">
                                                        {errors.phone}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="address"
                                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base"
                                                >
                                                    Address
                                                </Label>
                                                <Input
                                                    id="address"
                                                    name="address"
                                                    type="text"
                                                    value={data.address}
                                                    onChange={(e) =>
                                                        setData(
                                                            'address',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-10 border-gray-300 bg-white/50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700/50 dark:focus:border-blue-400 dark:focus:ring-blue-400 sm:h-12 sm:text-base"
                                                    placeholder="Enter your address"
                                                />
                                                {errors.address && (
                                                    <p className="text-xs text-red-500 sm:text-sm">
                                                        {errors.address}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="city"
                                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base"
                                                    >
                                                        City
                                                    </Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        type="text"
                                                        value={data.city}
                                                        onChange={(e) =>
                                                            setData(
                                                                'city',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-10 border-gray-300 bg-white/50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700/50 dark:focus:border-blue-400 dark:focus:ring-blue-400 sm:h-12 sm:text-base"
                                                        placeholder="Enter your city"
                                                    />
                                                    {errors.city && (
                                                        <p className="text-xs text-red-500 sm:text-sm">
                                                            {errors.city}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="state"
                                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base"
                                                    >
                                                        State/Province
                                                    </Label>
                                                    <Input
                                                        id="state"
                                                        name="state"
                                                        type="text"
                                                        value={data.state}
                                                        onChange={(e) =>
                                                            setData(
                                                                'state',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-10 border-gray-300 bg-white/50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700/50 dark:focus:border-blue-400 dark:focus:ring-blue-400 sm:h-12 sm:text-base"
                                                        placeholder="Enter your state"
                                                    />
                                                    {errors.state && (
                                                        <p className="text-xs text-red-500 sm:text-sm">
                                                            {errors.state}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="country"
                                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base"
                                                    >
                                                        Country
                                                    </Label>
                                                    <Input
                                                        id="country"
                                                        name="country"
                                                        type="text"
                                                        value={data.country}
                                                        onChange={(e) =>
                                                            setData(
                                                                'country',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-10 border-gray-300 bg-white/50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700/50 dark:focus:border-blue-400 dark:focus:ring-blue-400 sm:h-12 sm:text-base"
                                                        placeholder="Enter your country"
                                                    />
                                                    {errors.country && (
                                                        <p className="text-xs text-red-500 sm:text-sm">
                                                            {errors.country}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="zip_code"
                                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base"
                                                    >
                                                        ZIP/Postal Code
                                                    </Label>
                                                    <Input
                                                        id="zip_code"
                                                        name="zip_code"
                                                        type="text"
                                                        value={data.zip_code}
                                                        onChange={(e) =>
                                                            setData(
                                                                'zip_code',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-10 border-gray-300 bg-white/50 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700/50 dark:focus:border-blue-400 dark:focus:ring-blue-400 sm:h-12 sm:text-base"
                                                        placeholder="Enter your ZIP code"
                                                    />
                                                    {errors.zip_code && (
                                                        <p className="text-xs text-red-500 sm:text-sm">
                                                            {errors.zip_code}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-4 sm:pt-6">
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="h-12 w-full transform rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:text-lg"
                                                >
                                                    {processing ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-5 sm:w-5"></div>
                                                            <span>
                                                                Registering...
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                                                            <span>
                                                                Join Challenge
                                                            </span>
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
                                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                                    <CardHeader>
                                        <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-lg font-bold text-transparent dark:from-white dark:to-gray-300 sm:text-xl">
                                            Challenge Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 sm:space-y-4">
                                        <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-3 dark:from-blue-900/20 dark:to-indigo-900/20">
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 flex-shrink-0 text-blue-600" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                                    Goal
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                                                {challenge.goal_value}{' '}
                                                {challenge.goal_unit}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3 dark:from-green-900/20 dark:to-emerald-900/20">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 flex-shrink-0 text-green-600" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                                    Duration
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                                                {formatDate(
                                                    challenge.start_date,
                                                    'MMM dd',
                                                )}{' '}
                                                -{' '}
                                                {formatDate(
                                                    challenge.end_date,
                                                    'MMM dd',
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-3 dark:from-purple-900/20 dark:to-pink-900/20">
                                            <div className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4 flex-shrink-0 text-purple-600" />
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

                                {/* Rewards Section */}
                                {challenge.rewards &&
                                    challenge.rewards.length > 0 && (
                                        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                                            <CardHeader>
                                                <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-lg font-bold text-transparent dark:from-white dark:to-gray-300 sm:text-xl">
                                                    Rewards
                                                </CardTitle>
                                                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                                    Complete the challenge to
                                                    earn these rewards
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3 sm:space-y-4">
                                                {challenge.rewards.map(
                                                    (reward, index) => (
                                                        <div
                                                            key={index}
                                                            className="transform rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-3 transition-all duration-200 hover:scale-105 hover:shadow-lg dark:border-yellow-700 dark:from-yellow-900/20 dark:to-orange-900/20 sm:p-4"
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
                                            </CardContent>
                                        </Card>
                                    )}

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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
