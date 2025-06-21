import { User, Project } from '@/types/index';
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Calendar, Plus, Search, Trash2, Users, UserPlus, Eye, MapPin, Clock, Tag, DollarSign } from 'lucide-react';
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
    is_paid_event: boolean;
    event_price: number | string;
    currency: string;
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

    const formatEventPrice = (price: number | string, currency: string) => {
        const numericPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
        return `${currency} ${numericPrice.toFixed(2)}`;
    };

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

    const getEventStatus = (event: Event) => {
        const now = new Date();
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        
        if (startDate > now) {
            return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
        } else if (endDate < now) {
            return { status: 'past', color: 'bg-gray-100 text-gray-800' };
        } else {
            return { status: 'ongoing', color: 'bg-green-100 text-green-800' };
        }
    };

    return (
        <AuthenticatedLayout
            auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Events</h2>}
        >
            <Head title="Events" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            placeholder="Search events..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 w-80"
                                        />
                                    </div>
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
                                    <Link href="/events/calendar">
                                        <Button variant="outline" className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Calendar View</span>
                                        </Button>
                                    </Link>
                                    <Link href="/events/create">
                                        <Button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                            <Plus className="w-4 h-4" />
                                            <span>New Event</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Events Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => {
                            const eventStatus = getEventStatus(event);
                            return (
                                <Card key={event.id} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                                                    {event.title}
                                                </CardTitle>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Tag className="w-4 h-4 text-gray-500" />
                                                    <Badge variant="outline" className="text-xs">
                                                        {event.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
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
                                            </div>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="pt-0">
                                        {/* Event Image */}
                                        {event.image && (
                                            <div className="mb-4">
                                                <img
                                                    src={event.image}
                                                    alt={event.title}
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                            </div>
                                        )}

                                        {/* Event Details */}
                                        <div className="space-y-3">
                                            <p className="text-gray-600 text-sm line-clamp-2">
                                                {event.description}
                                            </p>

                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{format(new Date(event.start_date), 'MMM d, yyyy h:mm a')}</span>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="line-clamp-1">{event.location}</span>
                                                </div>

                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Users className="w-4 h-4" />
                                                    <span>
                                                        {event.current_participants}
                                                        {event.max_participants && ` / ${event.max_participants}`} participants
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Registration until {format(new Date(event.registration_deadline), 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>

                                            {/* Status and Payment Badges */}
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={eventStatus.color}>
                                                        {eventStatus.status.charAt(0).toUpperCase() + eventStatus.status.slice(1)}
                                                    </Badge>
                                                    {event.is_paid_event ? (
                                                        <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
                                                            <DollarSign className="w-3 h-3" />
                                                            <span>{formatEventPrice(event.event_price, event.currency)}</span>
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                                            Free
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div className="flex items-center space-x-2">
                                                    <Link href={`/events/${event.id}/public-register`}>
                                                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                                                            <UserPlus className="w-4 h-4" />
                                                            <span>Register</span>
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/events/${event.id}/participants`}>
                                                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                                                            <Users className="w-4 h-4" />
                                                            <span>View</span>
                                                        </Button>
                                                    </Link>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Link href={`/events/${event.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(event.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {filteredEvents.length === 0 && (
                        <div className="text-center py-12">
                            <div className="max-w-md mx-auto">
                                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating your first event.'}
                                </p>
                                {!searchQuery && (
                                    <Link href="/events/create">
                                        <Button className="flex items-center space-x-2 mx-auto">
                                            <Plus className="w-4 h-4" />
                                            <span>Create Event</span>
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 