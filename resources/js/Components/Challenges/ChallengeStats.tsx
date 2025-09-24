import {
    ChartBarIcon,
    ClockIcon,
    TrophyIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface ProgressDistribution {
    range: string;
    count: number;
}

interface ChallengeStats {
    total_participants: number;
    average_progress: number;
    time_remaining: string;
    completed_count: number;
    progress_distribution: ProgressDistribution[];
}

interface Props {
    challengeId: string;
}

export default function ChallengeStats({ challengeId }: Props) {
    const [stats, setStats] = useState<ChallengeStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, [challengeId]);

    const fetchStats = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await axios.get<ChallengeStats>(
                `/api/challenges/${challengeId}/stats`,
            );
            setStats(response.data);
        } catch (error) {
            setError('Failed to fetch challenge statistics');
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-center text-red-600">{error}</div>;
    }

    if (!stats) {
        return (
            <div className="p-4 text-center text-gray-600">
                No statistics available
            </div>
        );
    }

    const statCards = [
        {
            name: 'Total Participants',
            value: stats.total_participants,
            icon: UserGroupIcon,
            color: 'bg-blue-500',
        },
        {
            name: 'Average Progress',
            value: `${stats.average_progress}%`,
            icon: ChartBarIcon,
            color: 'bg-green-500',
        },
        {
            name: 'Time Remaining',
            value: stats.time_remaining,
            icon: ClockIcon,
            color: 'bg-yellow-500',
        },
        {
            name: 'Completed',
            value: stats.completed_count,
            icon: TrophyIcon,
            color: 'bg-purple-500',
        },
    ];

    return (
        <div className="rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Challenge Statistics
                </h3>
            </div>
            <div className="border-t border-gray-200">
                <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <div
                            key={stat.name}
                            className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
                        >
                            <dt>
                                <div
                                    className={`absolute rounded-md p-3 ${stat.color}`}
                                >
                                    <stat.icon
                                        className="h-6 w-6 text-white"
                                        aria-hidden="true"
                                    />
                                </div>
                                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                                    {stat.name}
                                </p>
                            </dt>
                            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stat.value}
                                </p>
                            </dd>
                        </div>
                    ))}
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <h4 className="text-sm font-medium text-gray-500">
                        Progress Distribution
                    </h4>
                    <div className="mt-4 space-y-4">
                        {stats.progress_distribution.map((range) => (
                            <div key={range.range}>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        {range.range}
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {range.count} participants
                                    </div>
                                </div>
                                <div className="mt-2 h-2.5 w-full rounded-full bg-gray-200">
                                    <div
                                        className="h-2.5 rounded-full bg-indigo-600"
                                        style={{
                                            width: `${(range.count / stats.total_participants) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
