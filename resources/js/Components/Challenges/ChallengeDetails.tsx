import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChallengeCard from './ChallengeCard';
import ChallengeStats from './ChallengeStats';
import Leaderboard from './Leaderboard';

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
    goal_type: 'steps' | 'calories' | 'distance' | 'time' | 'weight' | 'other';
    goal_value: number;
    goal_unit: string;
    participants: number[];
    visibility: 'public' | 'private' | 'friends' | 'family' | 'coworkers';
    rewards: Reward[];
}

export default function ChallengeDetails() {
    const { id } = useParams<{ id: string }>();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchChallengeDetails();
        } else {
            setError('Challenge ID is required');
            setLoading(false);
        }
    }, [id]);

    const fetchChallengeDetails = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await axios.get<Challenge>(
                `/api/challenges/${id}`,
            );
            setChallenge(response.data);
        } catch (error) {
            setError('Failed to fetch challenge details');
            console.error('Error fetching challenge:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !id) {
        return (
            <div className="p-8 text-center text-red-600">
                {error || 'Challenge ID is required'}
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="p-8 text-center text-gray-600">
                Challenge not found
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <ChallengeCard
                    challenge={challenge}
                    onEdit={() => {}}
                    onDelete={() => {}}
                />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div>
                    <Leaderboard challengeId={id} />
                </div>
                <div>
                    <ChallengeStats challengeId={id} />
                </div>
            </div>

            <div className="mt-8">
                <div className="rounded-lg bg-white shadow">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Challenge Rewards
                        </h3>
                    </div>
                    <div className="border-t border-gray-200">
                        <ul className="divide-y divide-gray-200">
                            {challenge.rewards.map((reward, index) => (
                                <li key={index} className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                                                    {reward.type}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {reward.value}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
