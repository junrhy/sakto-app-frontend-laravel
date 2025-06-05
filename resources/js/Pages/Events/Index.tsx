import { User, Project } from '@/types/index';
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Calendar, Plus, Search, Trash2, Users, UserPlus, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    max_participants: number;
    current_participants: number;
    registration_deadline: string;
    is_public: boolean;
    category: string;
    image: string;
}

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
    };
    events: {
        data: Event[];
    };
}

export default function Index({ auth, events }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvents, setSelectedEvents] = useState<number[]>([]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        router.delete(`/events/${id}`, {
            onSuccess: () => {
                toast.success('Event deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete event');
            }
        });
    };

    const handleBulkDelete = async () => {
        if (selectedEvents.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedEvents.length} events?`)) return;

        router.post('/events/bulk-delete', {
            ids: selectedEvents
        }, {
            onSuccess: () => {
                setSelectedEvents([]);
                toast.success('Events deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete events');
            }
        });
    };

    const filteredEvents = events.data.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Events</h2>}
        >
            <Head title="Events" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center space-x-4">
                                    <Input
                                        placeholder="Search events..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-64"
                                    />
                                    {selectedEvents.length > 0 && (
                                        <Button
                                            variant="destructive"
                                            onClick={handleBulkDelete}
                                            className="flex items-center space-x-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete Selected ({selectedEvents.length})</span>
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href="/events/calendar"
                                        className="inline-flex items-center space-x-2"
                                    >
                                        <Button
                                            variant="outline"
                                            className="flex items-center space-x-2"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            <span>Calendar View</span>
                                        </Button>
                                    </Link>
                                    <Link
                                        href="/events/create"
                                        className="inline-flex items-center space-x-2"
                                    >
                                        <Button
                                            className="flex items-center space-x-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>New Event</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>All Events</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300"
                                                        checked={selectedEvents.length === events.data.length}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedEvents(events.data.map(e => e.id));
                                                            } else {
                                                                setSelectedEvents([]);
                                                            }
                                                        }}
                                                    />
                                                </TableHead>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Location</TableHead>
                                                <TableHead>Participants</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-24">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredEvents.map((event) => (
                                                <TableRow key={event.id}>
                                                    <TableCell>
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300"
                                                            checked={selectedEvents.includes(event.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedEvents([...selectedEvents, event.id]);
                                                                } else {
                                                                    setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">{event.title}</TableCell>
                                                    <TableCell>{event.category}</TableCell>
                                                    <TableCell>
                                                        {format(new Date(event.start_date), 'MMM d, yyyy')}
                                                    </TableCell>
                                                    <TableCell>{event.location}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Users className="w-4 h-4" />
                                                            <span>
                                                                {event.current_participants}
                                                                {event.max_participants && ` / ${event.max_participants}`}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(event.start_date) > new Date() ? (
                                                            <Badge variant="default">Upcoming</Badge>
                                                        ) : new Date(event.end_date) < new Date() ? (
                                                            <Badge variant="secondary">Past</Badge>
                                                        ) : (
                                                            <Badge variant="default">Ongoing</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Link
                                                                href={`/events/${event.id}/public-register`}
                                                                className="inline-flex items-center"
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                >
                                                                    <UserPlus className="w-4 h-4 mr-1" />
                                                                    Self Register
                                                                </Button>
                                                            </Link>
                                                            <Link
                                                                href={`/events/${event.id}/participants`}
                                                                className="inline-flex items-center"
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                >
                                                                    <Users className="w-4 h-4 mr-1" />
                                                                    Participants
                                                                </Button>
                                                            </Link>
                                                            <Link
                                                                href={`/events/${event.id}/edit`}
                                                                className="inline-flex items-center"
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(event.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
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