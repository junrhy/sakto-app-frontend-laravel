import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { useEffect, useState } from 'react';

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

interface ChallengeFormData {
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
}

interface Props {
    challenge: Challenge | null;
    onSubmit: (data: ChallengeFormData) => void;
    onClose: () => void;
}

export default function ChallengeForm({ challenge, onSubmit, onClose }: Props) {
    const [formData, setFormData] = useState<ChallengeFormData>({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        goal_type: 'steps',
        goal_value: 0,
        goal_unit: '',
        visibility: 'public',
        rewards: [],
        status: 'active',
    });

    const [newReward, setNewReward] = useState<Reward>({
        type: 'badge',
        value: '',
    });

    // Function to format date for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (dateString: string): string => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    useEffect(() => {
        if (challenge) {
            setFormData({
                title: challenge.title,
                description: challenge.description,
                start_date: formatDateForInput(challenge.start_date),
                end_date: formatDateForInput(challenge.end_date),
                goal_type: challenge.goal_type,
                goal_value: challenge.goal_value,
                goal_unit: challenge.goal_unit,
                visibility: challenge.visibility,
                rewards: challenge.rewards || [],
                status: challenge.status,
            });
        }
    }, [challenge]);

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleAddReward = (): void => {
        if (newReward.value) {
            setFormData({
                ...formData,
                rewards: [...formData.rewards, newReward],
            });
            setNewReward({ type: 'badge', value: '' });
        }
    };

    const handleRemoveReward = (index: number): void => {
        setFormData({
            ...formData,
            rewards: formData.rewards.filter((_, i) => i !== index),
        });
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {challenge ? 'Edit Challenge' : 'Create New Challenge'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    title: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        start_date: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        end_date: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Goal Type
                            </label>
                            <select
                                value={formData.goal_type}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        goal_type: e.target
                                            .value as ChallengeFormData['goal_type'],
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="steps">Steps</option>
                                <option value="calories">Calories</option>
                                <option value="distance">Distance</option>
                                <option value="time">Time</option>
                                <option value="weight">Weight</option>
                                <option value="cooking">Cooking</option>
                                <option value="photography">Photography</option>
                                <option value="art">Art</option>
                                <option value="writing">Writing</option>
                                <option value="music">Music</option>
                                <option value="dance">Dance</option>
                                <option value="sports">Sports</option>
                                <option value="quiz">Quiz</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Goal Value
                            </label>
                            <input
                                type="number"
                                value={formData.goal_value}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        goal_value: Number(e.target.value),
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Goal Unit
                            </label>
                            <input
                                type="text"
                                value={formData.goal_unit}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        goal_unit: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Visibility
                        </label>
                        <select
                            value={formData.visibility}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    visibility: e.target
                                        .value as ChallengeFormData['visibility'],
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="friends">Friends</option>
                            <option value="family">Family</option>
                            <option value="coworkers">Coworkers</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    status: e.target
                                        .value as ChallengeFormData['status'],
                                })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Rewards
                        </label>
                        <div className="mt-1 flex space-x-2">
                            <select
                                value={newReward.type}
                                onChange={(e) =>
                                    setNewReward({
                                        ...newReward,
                                        type: e.target.value as Reward['type'],
                                    })
                                }
                                className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="badge">Badge</option>
                                <option value="points">Points</option>
                                <option value="achievement">Achievement</option>
                                <option value="cash">Cash Prize</option>
                                <option value="item">Item</option>
                                <option value="gift">Gift</option>
                                <option value="certificate">Certificate</option>
                                <option value="trophy">Trophy</option>
                                <option value="medal">Medal</option>
                            </select>
                            <input
                                type="text"
                                value={newReward.value}
                                onChange={(e) =>
                                    setNewReward({
                                        ...newReward,
                                        value: e.target.value,
                                    })
                                }
                                placeholder="Reward value"
                                className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <button
                                type="button"
                                onClick={handleAddReward}
                                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Add
                            </button>
                        </div>
                        <div className="mt-2 space-y-2">
                            {formData.rewards.map((reward, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between"
                                >
                                    <span className="text-sm">
                                        {reward.type}: {reward.value}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveReward(index)
                                        }
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {challenge
                                ? 'Update Challenge'
                                : 'Create Challenge'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
