import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, MapPin, Users, UserPlus, Clock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface Event {
    message: string;
    data: {
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
    };
}

interface Props extends PageProps {
    event: Event;
}

export default function PublicShow({ event }: Props) {
    const isRegistrationOpen = new Date(event.data.registration_deadline) > new Date();
    const isEventFull = event.data.max_participants > 0 && event.data.current_participants >= event.data.max_participants;
    const isEventPast = new Date(event.data.end_date) < new Date();
    const isEventUpcoming = new Date(event.data.start_date) > new Date();
    const isEventOngoing = !isEventPast && !isEventUpcoming;

    return (
        <>
            <Head title={event.data.title} />

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
                {/* Hero Section */}
                <div className="relative h-[300px] w-full overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ 
                            backgroundImage: `url(${event.data.image || '/images/event-placeholder.jpg'})`,
                            filter: 'brightness(0.7)'
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-8">
                        <div className="text-white">
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-bold mb-2"
                            >
                                {event.data.title}
                            </motion.h1>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="bg-black/50 text-white hover:bg-black/60">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {event.data.category}
                                </Badge>
                                {isEventPast ? (
                                    <Badge variant="secondary" className="bg-red-500/80 text-white hover:bg-red-500/90">Past</Badge>
                                ) : isEventUpcoming ? (
                                    <Badge variant="secondary" className="bg-green-500/80 text-white hover:bg-green-500/90">Upcoming</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-blue-500/80 text-white hover:bg-blue-500/90">Ongoing</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    <CardHeader className="border-b bg-gray-50/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-2xl font-bold">{event.data.title}</CardTitle>
                                                <CardDescription className="mt-2">
                                                    Join us for an exciting event that you won't want to miss!
                                                </CardDescription>
                                            </div>
                                            {isRegistrationOpen && !isEventFull && !isEventPast && (
                                                <Link href={`/events/${event.data.id}/public-register`}>
                                                    <Button className="flex items-center bg-primary hover:bg-primary/90">
                                                        <UserPlus className="w-4 h-4 mr-2" />
                                                        Register Now
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                                    <Calendar className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Event Date</p>
                                                        <div className="text-gray-600">
                                                            {format(new Date(event.data.start_date), 'MMMM d, yyyy')} - {format(new Date(event.data.end_date), 'MMMM d, yyyy')}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                                    <MapPin className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Location</p>
                                                        <div className="text-gray-600">{event.data.location}</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                                    <Users className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Participants</p>
                                                        <div className="text-gray-600">
                                                            {event.data.current_participants || 0} registered
                                                            {event.data.max_participants > 0 && (
                                                                <span className="text-primary">
                                                                    {` (${Math.max(0, (event.data.max_participants || 0) - (event.data.current_participants || 0))} spots remaining)`}
                                                                </span>
                                                            )}
                                                            {event.data.max_participants === 0 && ' (Unlimited spots)'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                                    <Clock className="w-5 h-5 mr-3 mt-0.5 text-primary" />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Registration Deadline</p>
                                                        <div className="text-gray-600">
                                                            {format(new Date(event.data.registration_deadline), 'MMMM d, yyyy')}
                                                            {!isRegistrationOpen && (
                                                                <div className="text-sm text-red-600 mt-1">Registration is closed</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-8">
                                                <h3 className="text-xl font-semibold mb-4">About This Event</h3>
                                                <div className="prose prose-gray max-w-none">
                                                    <div className="whitespace-pre-line text-gray-600">{event.data.description}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            
                            <div className="space-y-6">
                                <Card className="sticky top-6 hover:shadow-lg transition-shadow duration-300">
                                    <CardHeader className="border-b bg-primary/5">
                                        <CardTitle className="text-xl">Registration Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-6">
                                            <div className="p-4 rounded-lg bg-gray-50">
                                                <p className="font-semibold text-gray-900 mb-2">Event Status</p>
                                                {isEventFull ? (
                                                    <div className="flex items-center text-red-600">
                                                        <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                                                        This event is full
                                                    </div>
                                                ) : isRegistrationOpen ? (
                                                    <div className="flex items-center text-green-600">
                                                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                                                        Registration is open
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-red-600">
                                                        <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                                                        Registration is closed
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {isRegistrationOpen && !isEventFull && !isEventPast && (
                                                <div className="pt-4">
                                                    <Link href={`/events/${event.data.id}/public-register`} className="w-full">
                                                        <Button className="w-full flex items-center justify-center bg-primary hover:bg-primary/90">
                                                            <UserPlus className="w-4 h-4 mr-2" />
                                                            Register for this Event
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 