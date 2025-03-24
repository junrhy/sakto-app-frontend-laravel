import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChallengeCard from '@/Components/Challenges/ChallengeCard';
import ChallengeForm from '@/Components/Challenges/ChallengeForm';
import { PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

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
    goal_type: 'steps' | 'calories' | 'distance' | 'time' | 'weight' | 'other';
    goal_value: number;
    goal_unit: string;
    participants: number[];
    visibility: 'public' | 'private' | 'friends' | 'family' | 'coworkers';
    rewards: Reward[];
}

interface Props {
    auth: {
        user: User;
    };
    challenges: Challenge[];
}

export default function Index({ auth, challenges: initialChallenges }: Props) {
    const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

    const handleCreateChallenge = async (formData: Omit<Challenge, 'id'>): Promise<void> => {
        try {
            const response = await axios.post<{ challenge: Challenge }>('/challenges', formData);
            setChallenges([...challenges, response.data.challenge]);
            setIsFormOpen(false);
        } catch (error) {
            console.error('Failed to create challenge:', error);
        }
    };

    const handleUpdateChallenge = async (id: number, formData: Partial<Challenge>): Promise<void> => {
        try {
            const response = await axios.put<{ challenge: Challenge }>(`/challenges/${id}`, formData);
            setChallenges(challenges.map(challenge => 
                challenge.id === id ? response.data.challenge : challenge
            ));
            setSelectedChallenge(null);
        } catch (error) {
            console.error('Failed to update challenge:', error);
        }
    };

    const handleDeleteChallenge = async (id: number): Promise<void> => {
        if (confirm('Are you sure you want to delete this challenge?')) {
            try {
                await axios.delete(`/challenges/${id}`);
                setChallenges(challenges.filter(challenge => challenge.id !== id));
            } catch (error) {
                console.error('Failed to delete challenge:', error);
            }
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Challenges</h2>}
        >
            <Head title="Challenges" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium">Your Challenges</h3>
                                <button
                                    onClick={() => setIsFormOpen(true)}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    New Challenge
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {challenges.map((challenge) => (
                                    <ChallengeCard
                                        key={challenge.id}
                                        challenge={challenge}
                                        onEdit={() => setSelectedChallenge(challenge)}
                                        onDelete={() => handleDeleteChallenge(challenge.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isFormOpen && (
                <ChallengeForm
                    challenge={null}
                    onSubmit={handleCreateChallenge}
                    onClose={() => setIsFormOpen(false)}
                />
            )}

            {selectedChallenge && (
                <ChallengeForm
                    challenge={selectedChallenge}
                    onSubmit={(formData: Partial<Challenge>) => handleUpdateChallenge(selectedChallenge.id, formData)}
                    onClose={() => setSelectedChallenge(null)}
                />
            )}
        </AuthenticatedLayout>
    );
} 