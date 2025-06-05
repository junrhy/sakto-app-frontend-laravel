import { User, Project } from '@/types/index';
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { toast } from 'sonner';

interface Event {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    max_participants: number;
    current_participants: number;
}

interface Participant {
    id: number;
    name: string;
    email: string;
    phone: string;
    notes: string;
    checked_in: boolean;
    created_at: string;
}

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
    };
    event: Event;
    participants: Participant[];
}

export default function Participants({ auth, event, participants }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/events/${event.id}/participants`, formData, {
            onSuccess: () => {
                toast.success('Participant registered successfully');
                setFormData({ name: '', email: '', phone: '', notes: '' });
            },
            onError: () => {
                toast.error('Failed to register participant');
            }
        });
    };

    const handleUnregister = (participantId: number) => {
        if (!confirm('Are you sure you want to unregister this participant?')) return;

        router.delete(`/events/${event.id}/participants/${participantId}`, {
            onSuccess: () => {
                toast.success('Participant unregistered successfully');
            },
            onError: () => {
                toast.error('Failed to unregister participant');
            }
        });
    };

    const handleCheckIn = (participantId: number) => {
        router.post(`/events/${event.id}/participants/${participantId}/check-in`, {}, {
            onSuccess: () => {
                toast.success('Participant checked in successfully');
            },
            onError: () => {
                toast.error('Failed to check in participant');
            }
        });
    };

    return (
        <AuthenticatedLayout
            auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Event Participants</h2>}
        >
            <Head title="Event Participants" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{event.title} - Participants</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-6">
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Name</Label>
                                                    <Input
                                                        id="name"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone</Label>
                                                    <Input
                                                        id="phone"
                                                        value={formData.phone}
                                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="notes">Notes</Label>
                                                    <Textarea
                                                        id="notes"
                                                        value={formData.notes}
                                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <Button type="submit">
                                                    Register Participant
                                                </Button>
                                            </div>
                                        </form>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Phone</TableHead>
                                                <TableHead>Notes</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-24">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {participants.map((participant) => (
                                                <TableRow key={participant.id}>
                                                    <TableCell className="font-medium">{participant.name}</TableCell>
                                                    <TableCell>{participant.email}</TableCell>
                                                    <TableCell>{participant.phone}</TableCell>
                                                    <TableCell>{participant.notes}</TableCell>
                                                    <TableCell>
                                                        {participant.checked_in ? (
                                                            <Badge variant="default">Checked In</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Not Checked In</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            {!participant.checked_in && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleCheckIn(participant.id)}
                                                                >
                                                                    Check In
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleUnregister(participant.id)}
                                                            >
                                                                Unregister
                                                            </Button>
                                                        </div>
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