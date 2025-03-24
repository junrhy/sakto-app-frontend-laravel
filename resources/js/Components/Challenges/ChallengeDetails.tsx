import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ChallengeCard from './ChallengeCard';
import Leaderboard from './Leaderboard';
import ChallengeStats from './ChallengeStats';

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
            const response = await axios.get<Challenge>(`/api/challenges/${id}`);
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
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !id) {
        return (
            <div className="text-center p-8 text-red-600">
                {error || 'Challenge ID is required'}
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="text-center p-8 text-gray-600">
                Challenge not found
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <ChallengeCard challenge={challenge} onEdit={() => {}} onDelete={() => {}} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <Leaderboard challengeId={id} />
                </div>
                <div>
                    <ChallengeStats challengeId={id} />
                </div>
            </div>

            <div className="mt-8">
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
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
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
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