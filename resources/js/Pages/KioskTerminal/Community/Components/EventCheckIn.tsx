import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import {
    Calendar,
    CheckCircle,
} from 'lucide-react';

interface Event {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    max_participants: number;
    current_participants?: number;
    status: string;
}

interface Participant {
    id: string;
    name: string;
    email: string;
    phone: string;
    checked_in: boolean;
    checked_in_at?: string;
    payment_status?: string;
}

interface EventCheckInProps {
    events: Event[];
}

export default function EventCheckIn({ events }: EventCheckInProps) {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [eventSearchQuery, setEventSearchQuery] = useState('');
    const [participantSearchQuery, setParticipantSearchQuery] = useState('');

    // Filtered data
    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(eventSearchQuery.toLowerCase())
    );

    const filteredParticipants = participants.filter(participant =>
        participant.name.toLowerCase().includes(participantSearchQuery.toLowerCase()) ||
        participant.email.toLowerCase().includes(participantSearchQuery.toLowerCase()) ||
        participant.phone.includes(participantSearchQuery)
    );

    // Load event participants
    const loadEventParticipants = async (eventId: string) => {
        try {
            const response = await fetch(route('kiosk.events.participants', { eventId }));
            if (response.ok) {
                const data = await response.json();
                setParticipants(data);
            } else {
                toast.error('Failed to load participants');
            }
        } catch (error) {
            console.error('Error loading participants:', error);
            toast.error('Failed to load participants');
        }
    };

    // Check-in participant
    const checkInParticipant = async (eventId: string, participantId: string) => {
        try {
            const response = await fetch(route('kiosk.events.check-in', { eventId, participantId }), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                toast.success('Participant checked in successfully');
                // Update participant status locally
                setParticipants(prev => prev.map(p => 
                    p.id === participantId 
                        ? { ...p, checked_in: true, checked_in_at: new Date().toISOString() }
                        : p
                ));
            } else {
                toast.error('Failed to check in participant');
            }
        } catch (error) {
            console.error('Error checking in participant:', error);
            toast.error('Failed to check in participant');
        }
    };

    return (
        <Card className="border-2">
            <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <Calendar className="w-8 h-8" />
                    Event Check-in
                </CardTitle>
                <CardDescription className="text-lg">
                    Select an event and check-in participants
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Event Selection */}
                <div className="space-y-3">
                    <Label className="text-lg font-semibold">Select Event</Label>
                    <div className="flex gap-3">
                        <Input
                            placeholder="Search events..."
                            value={eventSearchQuery}
                            onChange={(e) => setEventSearchQuery(e.target.value)}
                            className="flex-1 h-12 text-lg px-4"
                        />
                    </div>
                </div>

                {/* Events List */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredEvents.map((event) => (
                        <Card 
                            key={event.id} 
                            className={`cursor-pointer transition-colors min-h-[200px] ${
                                selectedEvent?.id === event.id 
                                    ? 'ring-4 ring-blue-500 bg-blue-50 border-blue-300' 
                                    : 'hover:bg-gray-50 hover:shadow-lg'
                            }`}
                            onClick={() => {
                                setSelectedEvent(event);
                                loadEventParticipants(event.id);
                            }}
                        >
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-xl mb-3">{event.title}</h3>
                                <p className="text-base text-gray-600 mb-4">{event.location}</p>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                                        {event.status}
                                    </Badge>
                                    <span className="text-base text-gray-500">
                                        {format(new Date(event.start_date), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                                {event.current_participants !== undefined && (
                                    <p className="text-base text-gray-600">
                                        {event.current_participants}/{event.max_participants} participants
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Participants List */}
                {selectedEvent && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-semibold">
                                Participants - {selectedEvent.title}
                            </h3>
                            <Input
                                placeholder="Search participants..."
                                value={participantSearchQuery}
                                onChange={(e) => setParticipantSearchQuery(e.target.value)}
                                className="w-80 h-12 text-lg px-4"
                            />
                        </div>

                        <div className="border-2 rounded-lg">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Name</th>
                                            <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Email</th>
                                            <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Phone</th>
                                            <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Status</th>
                                            <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredParticipants.map((participant) => (
                                            <tr key={participant.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-lg">{participant.name}</td>
                                                <td className="px-6 py-4 text-lg">{participant.email}</td>
                                                <td className="px-6 py-4 text-lg">{participant.phone}</td>
                                                <td className="px-6 py-4">
                                                    {participant.checked_in ? (
                                                        <Badge variant="default" className="flex items-center gap-2 text-base px-4 py-2">
                                                            <CheckCircle className="w-5 h-5" />
                                                            Checked In
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-base px-4 py-2">Not Checked In</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {!participant.checked_in && (
                                                        <Button
                                                            size="lg"
                                                            className="px-6 py-3 text-lg"
                                                            onClick={() => checkInParticipant(selectedEvent.id, participant.id)}
                                                        >
                                                            Check In
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 