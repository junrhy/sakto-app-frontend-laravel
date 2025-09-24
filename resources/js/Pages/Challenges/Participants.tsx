import ParticipantTimer from '@/Components/Challenges/ParticipantTimer';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { differenceInSeconds, format } from 'date-fns';
import { Clock, MoreHorizontal, Trash2, UserPlus } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

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
    status: 'active' | 'inactive' | 'completed';
}

interface Reward {
    type: 'badge' | 'points' | 'achievement';
    value: string;
}

interface Participant {
    id: number;
    challenge_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    zip_code: string | null;
    status: string;
    progress: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
    timer_started_at?: string | null;
    timer_ended_at?: string | null;
    timer_duration_seconds?: number | null;
    timer_is_active?: boolean;
    elapsed_time_seconds?: number;
}

interface Props extends PageProps {
    auth: {
        user: any & {
            is_admin?: boolean;
        };
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
    challenge: Challenge;
    participants: Participant[];
}

// Helper function to format duration
const formatDuration = (
    startedAt: string | null,
    endedAt: string | null,
): string => {
    if (!startedAt) return 'Not started';

    const startDate = new Date(startedAt);
    const endDate = endedAt ? new Date(endedAt) : new Date();

    const totalSeconds = differenceInSeconds(endDate, startDate);

    if (totalSeconds < 0) return 'Invalid time';

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
};

export default function Participants({ auth, challenge, participants }: Props) {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
    const [selectedParticipantForTimer, setSelectedParticipantForTimer] =
        useState<Participant | null>(null);
    const [selectedParticipantForRemoval, setSelectedParticipantForRemoval] =
        useState<Participant | null>(null);
    const [removalReason, setRemovalReason] = useState<string>('');
    const [formData, setFormData] = useState({
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

    // Check if current team member has admin or manager role
    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        // If no team member is selected, check if the main user is admin
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    // Check if current team member has admin, manager, or user role
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // If no team member is selected, check if the main user is admin
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const filteredParticipants = participants.filter(
        (participant) =>
            (participant.first_name?.toLowerCase() || '').includes(
                searchTerm.toLowerCase(),
            ) ||
            (participant.last_name?.toLowerCase() || '').includes(
                searchTerm.toLowerCase(),
            ) ||
            (participant.email?.toLowerCase() || '').includes(
                searchTerm.toLowerCase(),
            ),
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddParticipant = () => {
        // Validate required fields
        if (!formData.first_name || !formData.last_name || !formData.email) {
            toast.error(
                'Please fill in the required fields (First Name, Last Name, Email)',
            );
            return;
        }

        router.post(
            route('challenges.add-participant', challenge.id),
            formData,
            {
                onSuccess: () => {
                    toast.success('Participant added successfully');
                    setIsAddDialogOpen(false);
                    // Reset form
                    setFormData({
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
                },
                onError: () => {
                    toast.error('Failed to add participant');
                },
            },
        );
    };

    const handleRemoveParticipant = (participant: Participant) => {
        setSelectedParticipantForRemoval(participant);
        setRemovalReason('');
    };

    const confirmRemoveParticipant = () => {
        if (!selectedParticipantForRemoval) return;

        if (!removalReason.trim()) {
            toast.error('Please provide a reason for removal');
            return;
        }

        router.delete(
            route('challenges.remove-participant', [
                challenge.id,
                selectedParticipantForRemoval.id,
            ]),
            {
                data: { reason: removalReason },
                onSuccess: () => {
                    toast.success('Participant removed successfully');
                    setSelectedParticipantForRemoval(null);
                    setRemovalReason('');
                },
                onError: () => {
                    toast.error('Failed to remove participant');
                },
            },
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Challenge Participants
                </h2>
            }
        >
            <Head title="Challenge Participants" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>
                                        {challenge.title} - Participants
                                    </CardTitle>
                                    <Dialog
                                        open={isAddDialogOpen}
                                        onOpenChange={setIsAddDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button className="flex items-center">
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Add Participant
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[600px]">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Add New Participant
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Fill in the participant
                                                    details below.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid grid-cols-2 gap-4 py-4">
                                                <div className="col-span-1">
                                                    <Label htmlFor="first_name">
                                                        First Name *
                                                    </Label>
                                                    <Input
                                                        id="first_name"
                                                        name="first_name"
                                                        value={
                                                            formData.first_name
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Label htmlFor="last_name">
                                                        Last Name *
                                                    </Label>
                                                    <Input
                                                        id="last_name"
                                                        name="last_name"
                                                        value={
                                                            formData.last_name
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Label htmlFor="email">
                                                        Email *
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Label htmlFor="phone">
                                                        Phone
                                                    </Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Label htmlFor="address">
                                                        Address
                                                    </Label>
                                                    <Input
                                                        id="address"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Label htmlFor="city">
                                                        City
                                                    </Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Label htmlFor="state">
                                                        State
                                                    </Label>
                                                    <Input
                                                        id="state"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Label htmlFor="country">
                                                        Country
                                                    </Label>
                                                    <Input
                                                        id="country"
                                                        name="country"
                                                        value={formData.country}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Label htmlFor="zip_code">
                                                        Zip Code
                                                    </Label>
                                                    <Input
                                                        id="zip_code"
                                                        name="zip_code"
                                                        value={
                                                            formData.zip_code
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setIsAddDialogOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={
                                                        handleAddParticipant
                                                    }
                                                >
                                                    Add Participant
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-6">
                                        <div className="mb-4 flex flex-col gap-4 md:flex-row">
                                            <div className="flex-1">
                                                <Label htmlFor="search">
                                                    Search Participants
                                                </Label>
                                                <Input
                                                    id="search"
                                                    placeholder="Search by name or email..."
                                                    value={searchTerm}
                                                    onChange={(e) =>
                                                        setSearchTerm(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        {filteredParticipants.map(
                                            (participant) => (
                                                <div
                                                    key={participant.id}
                                                    className="rounded-lg border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-blue-200 hover:shadow-md"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        {/* Participant Info */}
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex-shrink-0">
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-semibold text-white">
                                                                    {participant.first_name.charAt(
                                                                        0,
                                                                    )}
                                                                    {participant.last_name.charAt(
                                                                        0,
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="truncate text-lg font-semibold text-gray-900">
                                                                    {
                                                                        participant.first_name
                                                                    }{' '}
                                                                    {
                                                                        participant.last_name
                                                                    }
                                                                </h3>
                                                                <p className="truncate text-sm text-gray-500">
                                                                    {
                                                                        participant.email
                                                                    }
                                                                </p>
                                                                <div className="mt-1 flex items-center space-x-4 text-xs text-gray-400">
                                                                    <span>
                                                                        Joined{' '}
                                                                        {format(
                                                                            new Date(
                                                                                participant.created_at,
                                                                            ),
                                                                            'MMM d, yyyy',
                                                                        )}
                                                                    </span>
                                                                    <span>
                                                                        •
                                                                    </span>
                                                                    <span className="font-mono">
                                                                        {formatDuration(
                                                                            participant.timer_started_at ||
                                                                                null,
                                                                            participant.timer_ended_at ||
                                                                                null,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Progress and Actions */}
                                                        <div className="flex items-center space-x-6">
                                                            {/* Progress */}
                                                            <div className="text-center">
                                                                <div className="mb-1 text-2xl font-bold text-gray-900">
                                                                    {
                                                                        participant.progress
                                                                    }
                                                                    %
                                                                </div>
                                                                <div className="h-2 w-24 rounded-full bg-gray-200">
                                                                    <div
                                                                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                                                                        style={{
                                                                            width: `${parseInt(participant.progress) || 0}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="mt-1 text-xs text-gray-500">
                                                                    Progress
                                                                </div>
                                                            </div>

                                                            {/* Timer Status */}
                                                            <div className="flex items-center space-x-2">
                                                                {participant.timer_is_active && (
                                                                    <div className="flex items-center space-x-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                                                                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                                                                        <span>
                                                                            Active
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {participant.timer_started_at &&
                                                                    !participant.timer_is_active && (
                                                                        <div className="flex items-center space-x-2 rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800">
                                                                            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                                                            <span>
                                                                                Paused
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                {!participant.timer_started_at && (
                                                                    <div className="flex items-center space-x-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                                                                        <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                                                        <span>
                                                                            Not
                                                                            Started
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Actions */}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            setSelectedParticipantForTimer(
                                                                                participant,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Clock className="mr-2 h-4 w-4" />
                                                                        Timer
                                                                        {participant.timer_is_active && (
                                                                            <div className="ml-2 flex items-center gap-1">
                                                                                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                                                                                <span className="text-xs text-green-600">
                                                                                    Running
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        {participant.timer_started_at &&
                                                                            !participant.timer_is_active && (
                                                                                <div className="ml-2 flex items-center gap-1">
                                                                                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                                                                    <span className="text-xs text-yellow-600">
                                                                                        Paused
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                    </DropdownMenuItem>
                                                                    {canDelete && (
                                                                        <>
                                                                            <div className="my-1 h-px bg-gray-200"></div>
                                                                            <DropdownMenuItem
                                                                                onClick={() =>
                                                                                    handleRemoveParticipant(
                                                                                        participant,
                                                                                    )
                                                                                }
                                                                                className="text-red-600 focus:text-red-600"
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                Remove
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}

                                        {filteredParticipants.length === 0 && (
                                            <div className="py-12 text-center">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                                    <UserPlus className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="mb-2 text-lg font-medium text-gray-900">
                                                    No participants found
                                                </h3>
                                                <p className="mb-4 text-gray-500">
                                                    {searchTerm
                                                        ? 'Try adjusting your search terms.'
                                                        : 'Get started by adding your first participant.'}
                                                </p>
                                                {!searchTerm && (
                                                    <Button
                                                        onClick={() =>
                                                            setIsAddDialogOpen(
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        <UserPlus className="mr-2 h-4 w-4" />
                                                        Add First Participant
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Timer Dialog */}
                <Dialog
                    open={!!selectedParticipantForTimer}
                    onOpenChange={() => setSelectedParticipantForTimer(null)}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Participant Timer</DialogTitle>
                            <DialogDescription>
                                Manage timer for{' '}
                                {selectedParticipantForTimer?.first_name}{' '}
                                {selectedParticipantForTimer?.last_name}
                            </DialogDescription>
                        </DialogHeader>
                        {selectedParticipantForTimer && (
                            <ParticipantTimer
                                challengeId={challenge.id}
                                participantId={selectedParticipantForTimer.id}
                                participantName={`${selectedParticipantForTimer.first_name} ${selectedParticipantForTimer.last_name}`}
                                onTimerUpdate={(status) => {
                                    // Update the participant data with new timer status
                                    const updatedParticipants =
                                        participants.map((p) =>
                                            p.id ===
                                            selectedParticipantForTimer.id
                                                ? { ...p, ...status }
                                                : p,
                                        );
                                    // You might want to update the state here or refresh the data
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                {/* Remove Participant Dialog */}
                <Dialog
                    open={!!selectedParticipantForRemoval}
                    onOpenChange={() => setSelectedParticipantForRemoval(null)}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Remove Participant</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to remove{' '}
                                {selectedParticipantForRemoval?.first_name}{' '}
                                {selectedParticipantForRemoval?.last_name} from
                                this challenge?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="removal-reason">
                                Reason for removal *
                            </Label>
                            <Input
                                id="removal-reason"
                                placeholder="Please provide a reason for removing this participant..."
                                value={removalReason}
                                onChange={(e) =>
                                    setRemovalReason(e.target.value)
                                }
                                className="mt-2"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setSelectedParticipantForRemoval(null)
                                }
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmRemoveParticipant}
                                disabled={!removalReason.trim()}
                            >
                                Remove Participant
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
