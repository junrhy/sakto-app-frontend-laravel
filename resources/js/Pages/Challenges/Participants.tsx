import React, { useState, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { toast } from 'sonner';
import { format, differenceInSeconds, differenceInHours, differenceInMinutes } from 'date-fns';
import { UserPlus, Trash2, Clock, MoreHorizontal } from 'lucide-react';
import ParticipantTimer from '@/Components/Challenges/ParticipantTimer';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

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
const formatDuration = (startedAt: string | null, endedAt: string | null): string => {
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
    const [selectedParticipantForTimer, setSelectedParticipantForTimer] = useState<Participant | null>(null);
    const [selectedParticipantForRemoval, setSelectedParticipantForRemoval] = useState<Participant | null>(null);
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
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager');
        }
        // If no team member is selected, check if the main user is admin
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    // Check if current team member has admin, manager, or user role
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager') || auth.selectedTeamMember.roles.includes('user');
        }
        // If no team member is selected, check if the main user is admin
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const filteredParticipants = participants.filter(participant => 
        (participant.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (participant.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (participant.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddParticipant = () => {
        // Validate required fields
        if (!formData.first_name || !formData.last_name || !formData.email) {
            toast.error('Please fill in the required fields (First Name, Last Name, Email)');
            return;
        }

        router.post(route('challenges.add-participant', challenge.id), formData, {
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
            }
        });
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

        router.delete(route('challenges.remove-participant', [challenge.id, selectedParticipantForRemoval.id]), {
            data: { reason: removalReason },
            onSuccess: () => {
                toast.success('Participant removed successfully');
                setSelectedParticipantForRemoval(null);
                setRemovalReason('');
            },
            onError: () => {
                toast.error('Failed to remove participant');
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Challenge Participants</h2>}
        >
            <Head title="Challenge Participants" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>{challenge.title} - Participants</CardTitle>
                                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="flex items-center">
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Add Participant
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[600px]">
                                            <DialogHeader>
                                                <DialogTitle>Add New Participant</DialogTitle>
                                                <DialogDescription>
                                                    Fill in the participant details below.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid grid-cols-2 gap-4 py-4">
                                                <div className="col-span-1">
                                                    <Label htmlFor="first_name">First Name *</Label>
                                                    <Input
                                                        id="first_name"
                                                        name="first_name"
                                                        value={formData.first_name}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Label htmlFor="last_name">Last Name *</Label>
                                                    <Input
                                                        id="last_name"
                                                        name="last_name"
                                                        value={formData.last_name}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Label htmlFor="email">Email *</Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Label htmlFor="phone">Phone</Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Label htmlFor="address">Address</Label>
                                                    <Input
                                                        id="address"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Label htmlFor="city">City</Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Label htmlFor="state">State</Label>
                                                    <Input
                                                        id="state"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Label htmlFor="country">Country</Label>
                                                    <Input
                                                        id="country"
                                                        name="country"
                                                        value={formData.country}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Label htmlFor="zip_code">Zip Code</Label>
                                                    <Input
                                                        id="zip_code"
                                                        name="zip_code"
                                                        value={formData.zip_code}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleAddParticipant}>
                                                    Add Participant
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-6">
                                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                                            <div className="flex-1">
                                                <Label htmlFor="search">Search Participants</Label>
                                                <Input
                                                    id="search"
                                                    placeholder="Search by name or email..."
                                                    value={searchTerm}
                                                    onChange={e => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        {filteredParticipants.map((participant) => (
                                            <div key={participant.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-blue-200">
                                                <div className="flex items-center justify-between">
                                                    {/* Participant Info */}
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                                {participant.first_name.charAt(0)}{participant.last_name.charAt(0)}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                                {participant.first_name} {participant.last_name}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 truncate">{participant.email}</p>
                                                            <div className="flex items-center mt-1 space-x-4 text-xs text-gray-400">
                                                                <span>Joined {format(new Date(participant.created_at), 'MMM d, yyyy')}</span>
                                                                <span>•</span>
                                                                <span className="font-mono">
                                                                    {formatDuration(participant.timer_started_at || null, participant.timer_ended_at || null)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Progress and Actions */}
                                                    <div className="flex items-center space-x-6">
                                                        {/* Progress */}
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                                                {participant.progress}%
                                                            </div>
                                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${parseInt(participant.progress) || 0}%` }}
                                                                />
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">Progress</div>
                                                        </div>

                                                        {/* Timer Status */}
                                                        <div className="flex items-center space-x-2">
                                                            {participant.timer_is_active && (
                                                                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                    <span>Active</span>
                                                                </div>
                                                            )}
                                                            {participant.timer_started_at && !participant.timer_is_active && (
                                                                <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                                    <span>Paused</span>
                                                                </div>
                                                            )}
                                                            {!participant.timer_started_at && (
                                                                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                                    <span>Not Started</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => setSelectedParticipantForTimer(participant)}>
                                                                    <Clock className="w-4 h-4 mr-2" />
                                                                    Timer
                                                                    {participant.timer_is_active && (
                                                                        <div className="ml-2 flex items-center gap-1">
                                                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                            <span className="text-xs text-green-600">Running</span>
                                                                        </div>
                                                                    )}
                                                                    {participant.timer_started_at && !participant.timer_is_active && (
                                                                        <div className="ml-2 flex items-center gap-1">
                                                                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                                            <span className="text-xs text-yellow-600">Paused</span>
                                                                        </div>
                                                                    )}
                                                                </DropdownMenuItem>
                                                                {canDelete && (
                                                                    <>
                                                                        <div className="h-px bg-gray-200 my-1"></div>
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleRemoveParticipant(participant)}
                                                                            className="text-red-600 focus:text-red-600"
                                                                        >
                                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                                            Remove
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {filteredParticipants.length === 0 && (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <UserPlus className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
                                                <p className="text-gray-500 mb-4">
                                                    {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first participant.'}
                                                </p>
                                                {!searchTerm && (
                                                    <Button onClick={() => setIsAddDialogOpen(true)}>
                                                        <UserPlus className="w-4 h-4 mr-2" />
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
                <Dialog open={!!selectedParticipantForTimer} onOpenChange={() => setSelectedParticipantForTimer(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Participant Timer</DialogTitle>
                            <DialogDescription>
                                Manage timer for {selectedParticipantForTimer?.first_name} {selectedParticipantForTimer?.last_name}
                            </DialogDescription>
                        </DialogHeader>
                        {selectedParticipantForTimer && (
                            <ParticipantTimer
                                challengeId={challenge.id}
                                participantId={selectedParticipantForTimer.id}
                                participantName={`${selectedParticipantForTimer.first_name} ${selectedParticipantForTimer.last_name}`}
                                onTimerUpdate={(status) => {
                                    // Update the participant data with new timer status
                                    const updatedParticipants = participants.map(p => 
                                        p.id === selectedParticipantForTimer.id 
                                            ? { ...p, ...status }
                                            : p
                                    );
                                    // You might want to update the state here or refresh the data
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                {/* Remove Participant Dialog */}
                <Dialog open={!!selectedParticipantForRemoval} onOpenChange={() => setSelectedParticipantForRemoval(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Remove Participant</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to remove {selectedParticipantForRemoval?.first_name} {selectedParticipantForRemoval?.last_name} from this challenge?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="removal-reason">Reason for removal *</Label>
                            <Input
                                id="removal-reason"
                                placeholder="Please provide a reason for removing this participant..."
                                value={removalReason}
                                onChange={(e) => setRemovalReason(e.target.value)}
                                className="mt-2"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedParticipantForRemoval(null)}>
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