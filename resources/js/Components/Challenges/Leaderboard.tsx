import { useState, useEffect } from 'react';
import { TrophyIcon, UserIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface LeaderboardEntry {
    user_id: number;
    user_name: string;
    progress: number;
    current_value: number;
    goal_unit: string;
}

interface Props {
    challengeId: string;
}

export default function Leaderboard({ challengeId }: Props) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLeaderboard();
    }, [challengeId]);

    const fetchLeaderboard = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await axios.get<LeaderboardEntry[]>(`/api/challenges/${challengeId}/leaderboard`);
            setLeaderboard(response.data);
        } catch (error) {
            setError('Failed to fetch leaderboard data');
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4 text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Challenge Leaderboard
                </h3>
            </div>
            <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {leaderboard.map((entry, index) => (
                        <li key={entry.user_id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        {index < 3 ? (
                                            <TrophyIcon className={`h-8 w-8 ${
                                                index === 0 ? 'text-yellow-400' :
                                                index === 1 ? 'text-gray-400' :
                                                'text-amber-600'
                                            }`} />
                                        ) : (
                                            <UserIcon className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900">
                                            {entry.user_name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Progress: {entry.progress}%
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                        {entry.current_value} {entry.goal_unit}
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
} 