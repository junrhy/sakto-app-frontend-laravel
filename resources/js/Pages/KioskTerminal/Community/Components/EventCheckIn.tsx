import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { format } from 'date-fns';
import { Calendar, CheckCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

// Helper function to format date in Manila timezone
const formatManilaTime = (dateString: string) => {
    const date = new Date(dateString);
    const manilaTime = new Date(
        date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }),
    );
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
    auth: {
        user: any;
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
    events: Event[];
}

export default function EventCheckIn({ auth, events }: EventCheckInProps) {
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        return auth.user.is_admin || false;
    }, [auth.selectedTeamMember, auth.user?.is_admin]);

    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [eventSearchQuery, setEventSearchQuery] = useState('');
    const [participantSearchQuery, setParticipantSearchQuery] = useState('');
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    // Filtered data
    const filteredEvents = events.filter(
        (event) =>
            event.title
                .toLowerCase()
                .includes(eventSearchQuery.toLowerCase()) ||
            event.location
                .toLowerCase()
                .includes(eventSearchQuery.toLowerCase()),
    );

    const filteredParticipants = participants.filter((participant) =>
        participant.name
            .toLowerCase()
            .includes(participantSearchQuery.toLowerCase()),
    );

    // Load event participants
    const loadEventParticipants = async (eventId: string) => {
        setLoadingParticipants(true);
        try {
            const response = await fetch(
                route('kiosk.community.events.participants', { eventId }),
            );

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
    const checkInParticipant = async (
        eventId: string,
        participantId: string,
    ) => {
        if (!canEdit) {
            toast.error('You do not have permission to check in participants.');
            return;
        }

        try {
            const response = await fetch(
                route('kiosk.community.events.check-in', {
                    eventId,
                    participantId,
                }),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            if (response.ok) {
                toast.success('Participant checked in successfully');
                // Update participant status locally
                setParticipants((prev) =>
                    prev.map((p) =>
                        p.id === participantId
                            ? {
                                  ...p,
                                  checked_in: true,
                                  checked_in_at: new Date().toISOString(),
                              }
                            : p,
                    ),
                );
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
                    <Calendar className="h-8 w-8" />
                    Event Check-in
                </CardTitle>
                <CardDescription className="text-lg">
                    Select an event and check-in participants
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Event Selection */}
                <div className="space-y-3">
                    <Label className="text-lg font-semibold">
                        Select Event
                    </Label>
                    <div className="flex gap-3">
                        <Input
                            placeholder="Search events..."
                            value={eventSearchQuery}
                            onChange={(e) =>
                                setEventSearchQuery(e.target.value)
                            }
                            className="h-12 flex-1 px-4 text-lg"
                        />
                    </div>
                </div>

                {/* Events List */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                    {filteredEvents.map((event) => (
                        <Card
                            key={event.id}
                            className={`min-h-[180px] cursor-pointer transition-colors lg:min-h-[200px] ${
                                selectedEvent?.id === event.id
                                    ? 'border-blue-300 bg-blue-50 ring-4 ring-blue-500'
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
                                <h3 className="mb-2 text-lg font-semibold lg:mb-3 lg:text-xl">
                                    {event.title}
                                </h3>
                                <p className="mb-3 text-sm text-gray-600 lg:mb-4 lg:text-base">
                                    {event.location}
                                </p>
                                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center lg:mb-3 lg:gap-3">
                                    <Badge
                                        variant={
                                            event.status === 'published'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className="w-fit px-2 py-1 text-xs lg:px-3 lg:text-sm"
                                    >
                                        {event.status}
                                    </Badge>
                                    <span className="text-sm text-gray-500 lg:text-base">
                                        {format(
                                            new Date(event.start_date),
                                            'MMM dd, yyyy',
                                        )}
                                    </span>
                                </div>
                                {event.current_participants !== undefined && (
                                    <p className="text-sm text-gray-600 lg:text-base">
                                        {event.current_participants}/
                                        {event.max_participants} participants
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Participants List */}
                {selectedEvent && (
                    <div className="space-y-6">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                            <h3 className="text-xl font-semibold lg:text-2xl">
                                Participants - {selectedEvent.title}
                            </h3>
                            <Input
                                placeholder="Search participants..."
                                value={participantSearchQuery}
                                onChange={(e) =>
                                    setParticipantSearchQuery(e.target.value)
                                }
                                className="h-12 w-full px-4 text-lg lg:w-80"
                            />
                        </div>

                        <div className="rounded-lg border-2">
                            {loadingParticipants ? (
                                <div className="p-8 text-center">
                                    <p className="text-lg text-gray-500">
                                        Loading participants...
                                    </p>
                                </div>
                            ) : filteredParticipants.length > 0 ? (
                                <div className="max-h-[500px] overflow-x-auto overflow-y-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead className="sticky top-0 z-10 bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-4 text-left text-base font-semibold text-gray-700 lg:px-6 lg:text-lg">
                                                    Name
                                                </th>
                                                <th className="px-3 py-4 text-left text-base font-semibold text-gray-700 lg:px-6 lg:text-lg">
                                                    Payment Status
                                                </th>
                                                <th className="px-3 py-4 text-left text-base font-semibold text-gray-700 lg:px-6 lg:text-lg">
                                                    Check-in Time
                                                </th>
                                                <th className="px-3 py-4 text-left text-base font-semibold text-gray-700 lg:px-6 lg:text-lg">
                                                    Status
                                                </th>
                                                <th className="px-3 py-4 text-left text-base font-semibold text-gray-700 lg:px-6 lg:text-lg">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredParticipants.map(
                                                (participant) => (
                                                    <tr
                                                        key={participant.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-3 py-4 text-base lg:px-6 lg:text-lg">
                                                            {participant.name}
                                                        </td>
                                                        <td className="px-3 py-4 lg:px-6">
                                                            <Badge
                                                                variant={
                                                                    participant.payment_status ===
                                                                    'paid'
                                                                        ? 'default'
                                                                        : 'secondary'
                                                                }
                                                                className="px-3 py-1 text-sm lg:px-4 lg:py-2 lg:text-base"
                                                            >
                                                                {participant.payment_status
                                                                    ? participant.payment_status.toUpperCase()
                                                                    : 'N/A'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-3 py-4 text-sm lg:px-6 lg:text-lg">
                                                            {participant.checked_in_at
                                                                ? formatManilaTime(
                                                                      participant.checked_in_at,
                                                                  )
                                                                : '-'}
                                                        </td>
                                                        <td className="px-3 py-4 lg:px-6">
                                                            {participant.checked_in ? (
                                                                <Badge
                                                                    variant="default"
                                                                    className="flex items-center gap-1 px-3 py-1 text-sm lg:gap-2 lg:px-4 lg:py-2 lg:text-base"
                                                                >
                                                                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                                                                    Checked In
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="px-3 py-1 text-sm lg:px-4 lg:py-2 lg:text-base"
                                                                >
                                                                    Not Checked
                                                                    In
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-4 lg:px-6">
                                                            {!participant.checked_in &&
                                                                canEdit && (
                                                                    <Button
                                                                        size="lg"
                                                                        className="px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-lg"
                                                                        onClick={() =>
                                                                            checkInParticipant(
                                                                                selectedEvent.id,
                                                                                participant.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Check In
                                                                    </Button>
                                                                )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="mb-4 text-lg text-gray-500">
                                        {participants.length === 0
                                            ? 'No participants found for this event.'
                                            : 'No participants match your search criteria.'}
                                    </p>
                                    {participants.length === 0 && (
                                        <p className="text-sm text-gray-400">
                                            Participants will appear here once
                                            they register for the event.
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
