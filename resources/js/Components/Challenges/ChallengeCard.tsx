import {
    PencilIcon,
    TrashIcon,
    TrophyIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useState } from 'react';

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
        const totalProgress = challenge.progress.reduce(
            (sum, p) => sum + p.progress_value,
            0,
        );
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
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {challenge.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {getVisibilityIcon()} {challenge.visibility}
                        </p>
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

                <p className="mb-4 text-gray-600">{challenge.description}</p>

                <div className="mb-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                        <TrophyIcon className="mr-1 h-4 w-4" />
                        <span>
                            Goal: {challenge.goal_value} {challenge.goal_unit}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <UserGroupIcon className="mr-1 h-4 w-4" />
                        <span>
                            {challenge.participants?.length || 0} participants
                        </span>
                    </div>
                    <div className="text-sm text-gray-500">
                        {format(new Date(challenge.start_date), 'MMM d, yyyy')}{' '}
                        - {format(new Date(challenge.end_date), 'MMM d, yyyy')}
                    </div>
                </div>

                <div className="mb-4">
                    <div className="mb-1 flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(getProgressPercentage())}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                            className="h-2 rounded-full bg-indigo-600"
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
                    <div className="mt-4 border-t pt-4">
                        <h4 className="mb-2 text-sm font-medium text-gray-900">
                            Rewards
                        </h4>
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
