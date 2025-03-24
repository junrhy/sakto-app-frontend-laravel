import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Participant {
    id: number;
    name: string;
    email: string;
    phone: string;
    registration_date: string;
    check_in_date: string | null;
    status: 'registered' | 'checked_in' | 'cancelled';
}

interface Event {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    max_participants: number;
    current_participants: number;
}

interface Props extends PageProps {
    event: Event;
}

export default function Participants({ auth, event }: Props) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);

    useEffect(() => {
        fetchParticipants();
    }, []);

    const fetchParticipants = async () => {
        try {
            const response = await fetch(`/events/${event.id}/participants`);
            if (!response.ok) throw new Error('Failed to fetch participants');
            const data = await response.json();
            setParticipants(data);
        } catch (error) {
            toast.error('Failed to load participants');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (participantId: number) => {
        try {
            const response = await fetch(`/events/${event.id}/check-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ participant_id: participantId }),
            });

            if (!response.ok) throw new Error('Failed to check in participant');

            setParticipants(participants.map(p => 
                p.id === participantId 
                    ? { ...p, check_in_date: new Date().toISOString(), status: 'checked_in' }
                    : p
            ));
            toast.success('Participant checked in successfully');
        } catch (error) {
            toast.error('Failed to check in participant');
        }
    };

    const handleCancelRegistration = async (participantId: number) => {
        if (!confirm('Are you sure you want to cancel this registration?')) return;

        try {
            const response = await fetch(`/events/${event.id}/unregister`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ participant_id: participantId }),
            });

            if (!response.ok) throw new Error('Failed to cancel registration');

            setParticipants(participants.map(p => 
                p.id === participantId 
                    ? { ...p, status: 'cancelled' }
                    : p
            ));
            toast.success('Registration cancelled successfully');
        } catch (error) {
            toast.error('Failed to cancel registration');
        }
    };

    const filteredParticipants = participants.filter(participant =>
        participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">
                Participants - {event.title}
            </h2>}
        >
            <Head title={`Participants - ${event.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Event Participants</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <Input
                                                    placeholder="Search participants..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-10 w-64"
                                                />
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {event.current_participants} / {event.max_participants} participants
                                            </div>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="flex justify-center items-center h-64">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Phone</TableHead>
                                                    <TableHead>Registration Date</TableHead>
                                                    <TableHead>Check-in Date</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="w-24">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredParticipants.map((participant) => (
                                                    <TableRow key={participant.id}>
                                                        <TableCell className="font-medium">
                                                            {participant.name}
                                                        </TableCell>
                                                        <TableCell>{participant.email}</TableCell>
                                                        <TableCell>{participant.phone}</TableCell>
                                                        <TableCell>
                                                            {format(new Date(participant.registration_date), 'MMM d, yyyy h:mm a')}
                                                        </TableCell>
                                                        <TableCell>
                                                            {participant.check_in_date
                                                                ? format(new Date(participant.check_in_date), 'MMM d, yyyy h:mm a')
                                                                : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {participant.status === 'checked_in' ? (
                                                                <Badge variant="default">Checked In</Badge>
                                                            ) : participant.status === 'cancelled' ? (
                                                                <Badge variant="destructive">Cancelled</Badge>
                                                            ) : (
                                                                <Badge variant="secondary">Registered</Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                {participant.status === 'registered' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleCheckIn(participant.id)}
                                                                        className="text-green-600 hover:text-green-700"
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                                {participant.status !== 'cancelled' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleCancelRegistration(participant.id)}
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        <XCircle className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 