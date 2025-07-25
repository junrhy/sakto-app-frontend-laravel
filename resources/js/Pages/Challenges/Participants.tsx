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
import { format } from 'date-fns';
import { UserPlus, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";

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
    status: 'active' | 'completed' | 'archived';
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

export default function Participants({ auth, challenge, participants }: Props) {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
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

    const handleRemoveParticipant = (participantId: number) => {
        if (!confirm('Are you sure you want to remove this participant?')) return;

        router.delete(route('challenges.remove-participant', [challenge.id, participantId]), {
            onSuccess: () => {
                toast.success('Participant removed successfully');
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

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Progress</TableHead>
                                                <TableHead>Joined</TableHead>
                                                <TableHead className="w-24">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredParticipants.map((participant) => (
                                                <TableRow key={participant.id}>
                                                    <TableCell className="font-medium">{participant.first_name} {participant.last_name}</TableCell>
                                                    <TableCell>{participant.email}</TableCell>
                                                    <TableCell>
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                            <div
                                                                className="bg-blue-600 h-2.5 rounded-full"
                                                                style={{ width: `${parseInt(participant.progress) || 0}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500">{participant.progress}%</span>
                                                    </TableCell>
                                                    <TableCell>{format(new Date(participant.created_at), 'PPP')}</TableCell>
                                                    <TableCell>
                                                        {canDelete && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveParticipant(participant.id)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 