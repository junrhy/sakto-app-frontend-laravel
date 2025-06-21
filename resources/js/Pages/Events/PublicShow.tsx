import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, MapPin, Users, UserPlus, Clock, Tag, CreditCard, DollarSign } from 'lucide-react';
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
        is_paid_event: boolean;
        event_price: number;
        currency: string;
        payment_instructions: string;
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

    const formatPrice = (price: number | string | null | undefined, currency: string) => {
        if (price === null || price === undefined) return 'Free';
        const numericPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
        return `${currency} ${numericPrice.toFixed(2)}`;
    };

    return (
        <>
            <Head title={event.data.title} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                {/* Hero Section */}
                <div className="relative h-[150px] w-full overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ 
                            backgroundImage: `url(${event.data.image || '/images/event-placeholder.jpg'})`,
                            filter: 'brightness(0.6) saturate(1.2)'
                        }}
                    />
                    <div className="absolute inset-0 bg-blue-700/80" />
                    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-8">
                        <div className="text-white">
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl font-bold mb-2 text-white"
                            >
                                {event.data.title}
                            </motion.h1>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="bg-emerald-500/90 text-white hover:bg-emerald-600/90 border-0">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {event.data.category}
                                </Badge>
                                {event.data.is_paid_event && (
                                    <Badge variant="secondary" className="bg-amber-500/90 text-white hover:bg-amber-600/90 border-0">
                                        <DollarSign className="w-3 h-3 mr-1" />
                                        Paid Event
                                    </Badge>
                                )}
                                {isEventPast ? (
                                    <Badge variant="secondary" className="bg-red-500/90 text-white hover:bg-red-600/90 border-0">Past</Badge>
                                ) : isEventUpcoming ? (
                                    <Badge variant="secondary" className="bg-green-500/90 text-white hover:bg-green-600/90 border-0">Upcoming</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-blue-500/90 text-white hover:bg-blue-600/90 border-0">Ongoing</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                                    <CardHeader className="border-b bg-blue-600 text-white">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-2xl font-bold">{event.data.title}</CardTitle>
                                                <CardDescription className="mt-2 text-blue-100">
                                                    Join us for an exciting event that you won't want to miss!
                                                </CardDescription>
                                            </div>
                                            {isRegistrationOpen && !isEventFull && !isEventPast && (
                                                <Link href={`/events/${event.data.id}/public-register`}>
                                                    <Button className="flex items-center bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
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
                                                <div className="flex items-start p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-100">
                                                    <Calendar className="w-5 h-5 mr-3 mt-0.5 text-blue-600" />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">Event Date</p>
                                                        <div className="text-slate-600">
                                                            {format(new Date(event.data.start_date), 'MMMM d, yyyy')} - {format(new Date(event.data.end_date), 'MMMM d, yyyy')}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-start p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-all duration-200 border border-emerald-100">
                                                    <MapPin className="w-5 h-5 mr-3 mt-0.5 text-emerald-600" />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">Location</p>
                                                        <div className="text-slate-600">{event.data.location}</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-start p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-100">
                                                    <Users className="w-5 h-5 mr-3 mt-0.5 text-purple-600" />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">Participants</p>
                                                        <div className="text-slate-600">
                                                            {event.data.current_participants || 0} registered
                                                            {event.data.max_participants > 0 && (
                                                                <span className="text-blue-600 font-medium">
                                                                    {` (${Math.max(0, (event.data.max_participants || 0) - (event.data.current_participants || 0))} spots remaining)`}
                                                                </span>
                                                            )}
                                                            {event.data.max_participants === 0 && ' (Unlimited spots)'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-all duration-200 border border-orange-100">
                                                    <Clock className="w-5 h-5 mr-3 mt-0.5 text-orange-600" />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">Registration Deadline</p>
                                                        <div className="text-slate-600">
                                                            {format(new Date(event.data.registration_deadline), 'MMMM d, yyyy')}
                                                            {!isRegistrationOpen && (
                                                                <div className="text-sm text-red-600 mt-1 font-medium">Registration is closed</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Payment Information Section */}
                                            {event.data.is_paid_event && (
                                                <div className="mt-8">
                                                    <h3 className="text-xl font-semibold mb-4 text-slate-900 flex items-center">
                                                        <CreditCard className="w-5 h-5 mr-2 text-amber-600" />
                                                        Payment Information
                                                    </h3>
                                                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="flex items-center p-4 rounded-lg bg-white/60 border border-amber-200">
                                                                <DollarSign className="w-6 h-6 mr-3 text-amber-600" />
                                                                <div>
                                                                    <p className="font-semibold text-slate-900">Event Price</p>
                                                                    <div className="text-2xl font-bold text-amber-700">
                                                                        {formatPrice(event.data.event_price, event.data.currency)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {event.data.payment_instructions && (
                                                                <div className="md:col-span-2">
                                                                    <div className="p-4 rounded-lg bg-white/60 border border-amber-200">
                                                                        <p className="font-semibold text-slate-900 mb-2">Payment Instructions</p>
                                                                        <div className="text-slate-600 whitespace-pre-line leading-relaxed">
                                                                            {event.data.payment_instructions}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="mt-8">
                                                <h3 className="text-xl font-semibold mb-4 text-slate-900">About This Event</h3>
                                                <div className="prose prose-gray max-w-none">
                                                    <div className="whitespace-pre-line text-slate-600 leading-relaxed">{event.data.description}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            
                            <div className="space-y-6">
                                <Card className="sticky top-6 hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                                    <CardHeader className="border-b bg-blue-600 text-white">
                                        <CardTitle className="text-xl">Registration Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-6">
                                            <div className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200">
                                                <p className="font-semibold text-slate-900 mb-2">Event Status</p>
                                                {isEventFull ? (
                                                    <div className="flex items-center text-red-600">
                                                        <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                                                        This event is full
                                                    </div>
                                                ) : isRegistrationOpen ? (
                                                    <div className="flex items-center text-emerald-600">
                                                        <div className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></div>
                                                        Registration is open
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-red-600">
                                                        <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                                                        Registration is closed
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {event.data.is_paid_event && (
                                                <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                                                    <p className="font-semibold text-slate-900 mb-2 flex items-center">
                                                        <CreditCard className="w-4 h-4 mr-2 text-amber-600" />
                                                        Payment Required
                                                    </p>
                                                    <div className="text-slate-600">
                                                        <div className="text-lg font-bold text-amber-700 mb-1">
                                                            {formatPrice(event.data.event_price, event.data.currency)}
                                                        </div>
                                                        <p className="text-sm">Payment will be collected during registration</p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {isRegistrationOpen && !isEventFull && !isEventPast && (
                                                <div className="pt-4">
                                                    <Link href={`/events/${event.data.id}/public-register`} className="w-full">
                                                        <Button className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
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