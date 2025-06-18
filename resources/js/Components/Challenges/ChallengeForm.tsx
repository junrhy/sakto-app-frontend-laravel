import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";

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

interface ChallengeFormData {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    goal_type: 'steps' | 'calories' | 'distance' | 'time' | 'weight' | 'other';
    goal_value: number;
    goal_unit: string;
    visibility: 'public' | 'private' | 'friends' | 'family' | 'coworkers';
    rewards: Reward[];
    status: 'active' | 'completed' | 'archived';
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
    visibility: 'public' | 'private' | 'friends' | 'family' | 'coworkers';
    rewards: Reward[];
    status: 'active' | 'completed' | 'archived';
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
        status: 'active'
    });

    const [newReward, setNewReward] = useState<Reward>({ type: 'badge', value: '' });

    useEffect(() => {
        if (challenge) {
            setFormData({
                title: challenge.title,
                description: challenge.description,
                start_date: challenge.start_date,
                end_date: challenge.end_date,
                goal_type: challenge.goal_type,
                goal_value: challenge.goal_value,
                goal_unit: challenge.goal_unit,
                visibility: challenge.visibility,
                rewards: challenge.rewards || [],
                status: challenge.status
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
                rewards: [...formData.rewards, newReward]
            });
            setNewReward({ type: 'badge', value: '' });
        }
    };

    const handleRemoveReward = (index: number): void => {
        setFormData({
            ...formData,
            rewards: formData.rewards.filter((_, i) => i !== index)
        });
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {challenge ? 'Edit Challenge' : 'Create New Challenge'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Goal Type</label>
                            <select
                                value={formData.goal_type}
                                onChange={(e) => setFormData({ ...formData, goal_type: e.target.value as ChallengeFormData['goal_type'] })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="steps">Steps</option>
                                <option value="calories">Calories</option>
                                <option value="distance">Distance</option>
                                <option value="time">Time</option>
                                <option value="weight">Weight</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Goal Value</label>
                            <input
                                type="number"
                                value={formData.goal_value}
                                onChange={(e) => setFormData({ ...formData, goal_value: Number(e.target.value) })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Goal Unit</label>
                            <input
                                type="text"
                                value={formData.goal_unit}
                                onChange={(e) => setFormData({ ...formData, goal_unit: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Visibility</label>
                        <select
                            value={formData.visibility}
                            onChange={(e) => setFormData({ ...formData, visibility: e.target.value as ChallengeFormData['visibility'] })}
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
                        <label className="block text-sm font-medium text-gray-700">Rewards</label>
                        <div className="mt-1 flex space-x-2">
                            <select
                                value={newReward.type}
                                onChange={(e) => setNewReward({ ...newReward, type: e.target.value as Reward['type'] })}
                                className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="badge">Badge</option>
                                <option value="points">Points</option>
                                <option value="achievement">Achievement</option>
                            </select>
                            <input
                                type="text"
                                value={newReward.value}
                                onChange={(e) => setNewReward({ ...newReward, value: e.target.value })}
                                placeholder="Reward value"
                                className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <button
                                type="button"
                                onClick={handleAddReward}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add
                            </button>
                        </div>
                        <div className="mt-2 space-y-2">
                            {formData.rewards.map((reward, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm">
                                        {reward.type}: {reward.value}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveReward(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose} type="button">
                            Cancel
                        </Button>
                        <Button type="submit">
                            {challenge ? 'Update Challenge' : 'Create Challenge'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 