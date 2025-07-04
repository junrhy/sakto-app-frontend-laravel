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

// Helper function to format date in Manila timezone
const formatManilaTime = (dateString: string) => {
    const date = new Date(dateString);
    const manilaTime = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
    return format(manilaTime, 'MMM dd, yyyy h:mm a');
};

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
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    // Filtered data
    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(eventSearchQuery.toLowerCase())
    );

    const filteredParticipants = participants.filter(participant =>
        participant.name.toLowerCase().includes(participantSearchQuery.toLowerCase())
    );

    // Load event participants
    const loadEventParticipants = async (eventId: string) => {
        setLoadingParticipants(true);
        try {
            const response = await fetch(route('kiosk.community.events.participants', { eventId }));
            
            if (response.ok) {
                const data = await response.json();
                setParticipants(data.data || data);
            } else {
                const errorData = await response.text();
                toast.error('Failed to load participants');
            }
        } catch (error) {
            toast.error('Failed to load participants');
        } finally {
            setLoadingParticipants(false);
        }
    };

    // Check-in participant
    const checkInParticipant = async (eventId: string, participantId: string) => {
        try {
            const response = await fetch(route('kiosk.community.events.check-in', { eventId, participantId }), {
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
                <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredEvents.map((event) => (
                        <Card 
                            key={event.id} 
                            className={`cursor-pointer transition-colors min-h-[180px] lg:min-h-[200px] ${
                                selectedEvent?.id === event.id 
                                    ? 'ring-4 ring-blue-500 bg-blue-50 border-blue-300' 
                                    : 'hover:bg-gray-50 hover:shadow-lg'
                            }`}
                            onClick={() => {
                                setSelectedEvent(event);
                                setParticipants([]);
                                setParticipantSearchQuery('');
                                loadEventParticipants(event.id);
                            }}
                        >
                            <CardContent className="p-4 lg:p-6">
                                <h3 className="font-semibold text-lg lg:text-xl mb-2 lg:mb-3">{event.title}</h3>
                                <p className="text-sm lg:text-base text-gray-600 mb-3 lg:mb-4">{event.location}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                                    <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className="text-xs lg:text-sm px-2 lg:px-3 py-1 w-fit">
                                        {event.status}
                                    </Badge>
                                    <span className="text-sm lg:text-base text-gray-500">
                                        {format(new Date(event.start_date), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                                {event.current_participants !== undefined && (
                                    <p className="text-sm lg:text-base text-gray-600">
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
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <h3 className="text-xl lg:text-2xl font-semibold">
                                Participants - {selectedEvent.title}
                            </h3>
                            <Input
                                placeholder="Search participants..."
                                value={participantSearchQuery}
                                onChange={(e) => setParticipantSearchQuery(e.target.value)}
                                className="w-full lg:w-80 h-12 text-lg px-4"
                            />
                        </div>

                        <div className="border-2 rounded-lg">
                            {loadingParticipants ? (
                                <div className="p-8 text-center">
                                    <p className="text-lg text-gray-500">Loading participants...</p>
                                </div>
                            ) : filteredParticipants.length > 0 ? (
                                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead className="bg-gray-50 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-3 lg:px-6 py-4 text-left text-base lg:text-lg font-semibold text-gray-700">Name</th>
                                                <th className="px-3 lg:px-6 py-4 text-left text-base lg:text-lg font-semibold text-gray-700">Payment Status</th>
                                                <th className="px-3 lg:px-6 py-4 text-left text-base lg:text-lg font-semibold text-gray-700">Check-in Time</th>
                                                <th className="px-3 lg:px-6 py-4 text-left text-base lg:text-lg font-semibold text-gray-700">Status</th>
                                                <th className="px-3 lg:px-6 py-4 text-left text-base lg:text-lg font-semibold text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredParticipants.map((participant) => (
                                                <tr key={participant.id} className="hover:bg-gray-50">
                                                    <td className="px-3 lg:px-6 py-4 text-base lg:text-lg">{participant.name}</td>
                                                    <td className="px-3 lg:px-6 py-4">
                                                        <Badge 
                                                            variant={participant.payment_status === 'paid' ? 'default' : 'secondary'} 
                                                            className="text-sm lg:text-base px-3 lg:px-4 py-1 lg:py-2"
                                                        >
                                                            {participant.payment_status ? participant.payment_status.toUpperCase() : 'N/A'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-3 lg:px-6 py-4 text-sm lg:text-lg">
                                                        {participant.checked_in_at 
                                                            ? formatManilaTime(participant.checked_in_at)
                                                            : '-'
                                                        }
                                                    </td>
                                                    <td className="px-3 lg:px-6 py-4">
                                                        {participant.checked_in ? (
                                                            <Badge variant="default" className="flex items-center gap-1 lg:gap-2 text-sm lg:text-base px-3 lg:px-4 py-1 lg:py-2">
                                                                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                                                                Checked In
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="text-sm lg:text-base px-3 lg:px-4 py-1 lg:py-2">Not Checked In</Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-3 lg:px-6 py-4">
                                                        {!participant.checked_in && (
                                                            <Button
                                                                size="lg"
                                                                className="px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-lg"
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
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-lg text-gray-500 mb-4">
                                        {participants.length === 0 
                                            ? 'No participants found for this event.' 
                                            : 'No participants match your search criteria.'}
                                    </p>
                                    {participants.length === 0 && (
                                        <p className="text-sm text-gray-400">
                                            Participants will appear here once they register for the event.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 