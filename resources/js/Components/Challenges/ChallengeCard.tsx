import { useState } from 'react';
import { PencilIcon, TrashIcon, UserGroupIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Reward {
    type: 'badge' | 'points' | 'achievement';
    value: string;
}

interface Progress {
    progress_value: number;
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
    progress?: Progress[];
}

interface Props {
    challenge: Challenge;
    onEdit: () => void;
    onDelete: () => void;
}

export default function ChallengeCard({ challenge, onEdit, onDelete }: Props) {
    const [showDetails, setShowDetails] = useState<boolean>(false);

    const getProgressPercentage = (): number => {
        if (!challenge.progress || challenge.progress.length === 0) return 0;
        const totalProgress = challenge.progress.reduce((sum, p) => sum + p.progress_value, 0);
        return Math.min((totalProgress / challenge.goal_value) * 100, 100);
    };

    const getVisibilityIcon = (): string => {
        switch (challenge.visibility) {
            case 'public':
                return '🌐';
            case 'private':
                return '🔒';
            case 'friends':
                return '👥';
            case 'family':
                return '👨‍👩‍👧‍👦';
            case 'coworkers':
                return '💼';
            default:
                return '👤';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                        <p className="text-sm text-gray-500">{getVisibilityIcon()} {challenge.visibility}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={onEdit}
                            className="p-1 text-gray-400 hover:text-gray-500"
                        >
                            <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-1 text-gray-400 hover:text-red-500"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <p className="text-gray-600 mb-4">{challenge.description}</p>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <TrophyIcon className="h-4 w-4 mr-1" />
                        <span>Goal: {challenge.goal_value} {challenge.goal_unit}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        <span>{challenge.participants?.length || 0} participants</span>
                    </div>
                    <div className="text-sm text-gray-500">
                        {format(new Date(challenge.start_date), 'MMM d, yyyy')} - {format(new Date(challenge.end_date), 'MMM d, yyyy')}
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(getProgressPercentage())}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${getProgressPercentage()}%` }}
                        ></div>
                    </div>
                </div>

                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                </button>

                {showDetails && (
                    <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Rewards</h4>
                        {challenge.rewards?.map((reward, index) => (
                            <div key={index} className="text-sm text-gray-600">
                                {reward.type}: {reward.value}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 