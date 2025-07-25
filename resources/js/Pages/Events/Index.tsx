import { User, Project } from '@/types/index';
import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Calendar, Plus, Search, Trash2, Users, UserPlus, Eye, MapPin, Clock, Tag, DollarSign, CreditCard } from 'lucide-react';
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
    events: {
        data: Event[];
    };
}

export default function Index({ auth, events }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvents, setSelectedEvents] = useState<number[]>([]);

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager') || auth.selectedTeamMember.roles.includes('user');
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager');
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

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
            return { status: 'upcoming', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 border-blue-200 dark:border-blue-800' };
        } else if (endDate < now) {
            return { status: 'past', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700' };
        } else {
            return { status: 'ongoing', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 border-green-200 dark:border-green-800' };
        }
    };

    return (
        <AuthenticatedLayout
            auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100 leading-tight">Events</h2>}
        >
            <Head title="Events" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="bg-white dark:bg-gray-900 overflow-hidden shadow-sm sm:rounded-lg mb-8 border border-gray-200 dark:border-gray-800">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                                        <Input
                                            placeholder="Search events..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 w-80 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                                        />
                                    </div>
                                    {selectedEvents.length > 0 && canDelete && (
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
                                        <Button variant="outline" className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <Calendar className="w-4 h-4" />
                                            <span>Calendar View</span>
                                        </Button>
                                    </Link>
                                    {canEdit && (
                                        <Link href="/events/create">
                                            <Button className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                                                <div className="absolute inset-0 bg-white/20 rounded-md blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <Plus className="w-4 h-4 mr-2 relative z-10" />
                                                <span className="relative z-10 font-semibold">New Event</span>
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Events Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => {
                            const eventStatus = getEventStatus(event);
                            return (
                                <Card key={event.id} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-gray-200 dark:hover:shadow-gray-950">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2">
                                                    {event.title}
                                                </CardTitle>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                    <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">
                                                        {event.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
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
                                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                                                {event.description}
                                            </p>

                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{format(new Date(event.start_date), 'MMM d, yyyy h:mm a')}</span>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="line-clamp-1">{event.location}</span>
                                                </div>

                                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <Users className="w-4 h-4" />
                                                    <span>
                                                        {event.current_participants}
                                                        {event.max_participants && ` / ${event.max_participants}`} participants
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Registration until {format(new Date(event.registration_deadline), 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>

                                            {/* Status and Payment Badges */}
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={`${eventStatus.color} border`}>
                                                        {eventStatus.status.charAt(0).toUpperCase() + eventStatus.status.slice(1)}
                                                    </Badge>
                                                    {event.is_paid_event ? (
                                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 border-green-200 dark:border-green-800 flex items-center space-x-1 border">
                                                            <CreditCard className="w-3 h-3" />
                                                            <span>{formatEventPrice(event.event_price, event.currency)}</span>
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 border">
                                                            Free
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center space-x-2">
                                                    <Link href={`/events/${event.id}/public-register`}>
                                                        <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                                                            <UserPlus className="w-4 h-4" />
                                                            <span>Register</span>
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/events/${event.id}/participants`}>
                                                        <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                                                            <Users className="w-4 h-4" />
                                                            <span>View</span>
                                                        </Button>
                                                    </Link>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {canEdit && (
                                                        <Link href={`/events/${event.id}/edit`}>
                                                            <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {canDelete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(event.id)}
                                                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
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
                                <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No events found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating your first event.'}
                                </p>
                                {!searchQuery && canEdit && (
                                    <Link href="/events/create">
                                        <Button className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                                            <div className="absolute inset-0 bg-white/20 rounded-md blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <Plus className="w-4 h-4 mr-2 relative z-10" />
                                            <span className="relative z-10 font-semibold">Create Event</span>
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