import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { format } from 'date-fns';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Tag, UserPlus } from 'lucide-react';
import { Link } from '@inertiajs/react';
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

export default function PublicRegister({ event }: Props) {
    // Extract the actual event data from the response
    const eventData = event.data;
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });

    const isRegistrationOpen = new Date(eventData?.registration_deadline) > new Date();
    const isEventFull = eventData?.max_participants > 0 && eventData?.current_participants >= eventData?.max_participants;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isRegistrationOpen) {
            toast.error('Registration for this event is closed');
            return;
        }
        
        if (isEventFull) {
            toast.error('This event is already full');
            return;
        }
        
        router.post(`/events/${eventData?.id}/public-register`, formData, {
            onSuccess: () => {
                toast.success('You have successfully registered for this event');
                // Reset form data after successful registration
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    notes: ''
                });
            },
            onError: (errors) => {
                toast.error('Failed to register for the event');
                console.error(errors);
            }
        });
    };

    return (
        <>
            <Head title={`Register for ${eventData?.title}`} />
            <Toaster position="top-right" richColors />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                {/* Hero Section */}
                <div className="relative h-[150px] w-full overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ 
                            backgroundImage: `url(${eventData?.image || '/images/event-placeholder.jpg'})`,
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
                                Register for {eventData?.title}
                            </motion.h1>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="bg-emerald-500/90 text-white hover:bg-emerald-600/90 border-0">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {eventData?.category}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                                    <CardHeader className="border-b bg-blue-600 text-white">
                                        <CardTitle className="text-2xl font-bold">Registration Form</CardTitle>
                                        <CardDescription className="mt-2 text-blue-100">
                                            Please fill out the form below to register for this event.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        {!isRegistrationOpen ? (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-6 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 rounded-lg border border-red-200"
                                            >
                                                <h3 className="font-semibold text-lg mb-2">Registration Closed</h3>
                                                <p className="mb-2">Registration for this event is closed.</p>
                                                <p>The registration deadline was {format(new Date(eventData?.registration_deadline), 'MMMM d, yyyy')}.</p>
                                            </motion.div>
                                        ) : isEventFull ? (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-6 bg-gradient-to-r from-orange-50 to-red-50 text-red-700 rounded-lg border border-red-200"
                                            >
                                                <h3 className="font-semibold text-lg mb-2">Event Full</h3>
                                                <p className="mb-2">This event is already full.</p>
                                                <p>Please check back later or contact the event organizer.</p>
                                            </motion.div>
                                        ) : (
                                            <motion.form 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onSubmit={handleSubmit} 
                                                className="space-y-6"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
                                                        <Input
                                                            id="name"
                                                            value={formData.name}
                                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                            required
                                                            className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white/50 backdrop-blur-sm"
                                                            placeholder="Enter your full name"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={formData.email}
                                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                            required
                                                            className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white/50 backdrop-blur-sm"
                                                            placeholder="Enter your email address"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
                                                        <Input
                                                            id="phone"
                                                            value={formData.phone}
                                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                            className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white/50 backdrop-blur-sm"
                                                            placeholder="Enter your phone number (optional)"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="notes" className="text-slate-700 font-medium">Additional Notes</Label>
                                                        <Textarea
                                                            id="notes"
                                                            value={formData.notes}
                                                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                            placeholder="Any special requirements or information"
                                                            className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white/50 backdrop-blur-sm min-h-[100px]"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-4">
                                                    <Button 
                                                        type="submit"
                                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                                    >
                                                        <UserPlus className="w-4 h-4 mr-2" />
                                                        Register for Event
                                                    </Button>
                                                </div>
                                            </motion.form>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                            
                            <div>
                                <Card className="sticky top-6 hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                                    <CardHeader className="border-b bg-blue-600 text-white">
                                        <CardTitle className="text-xl">Event Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-6">
                                            <div className="flex items-start p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-100">
                                                <Calendar className="w-5 h-5 mr-3 mt-0.5 text-blue-600" />
                                                <div>
                                                    <p className="font-semibold text-slate-900">Event Date</p>
                                                    <div className="text-slate-600">
                                                        {eventData?.start_date ? format(new Date(eventData?.start_date), 'MMMM d, yyyy') : 'Not specified'}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-all duration-200 border border-emerald-100">
                                                <MapPin className="w-5 h-5 mr-3 mt-0.5 text-emerald-600" />
                                                <div>
                                                    <p className="font-semibold text-slate-900">Location</p>
                                                    <div className="text-slate-600">{eventData?.location}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-100">
                                                <Clock className="w-5 h-5 mr-3 mt-0.5 text-purple-600" />
                                                <div>
                                                    <p className="font-semibold text-slate-900">Registration Deadline</p>
                                                    <div className="text-slate-600">
                                                        {eventData?.registration_deadline ? format(new Date(eventData?.registration_deadline), 'MMMM d, yyyy') : 'Not specified'}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-all duration-200 border border-orange-100">
                                                <Users className="w-5 h-5 mr-3 mt-0.5 text-orange-600" />
                                                <div>
                                                    <p className="font-semibold text-slate-900">Available Spots</p>
                                                    <div className="text-slate-600">
                                                        {(() => {
                                                            const maxParticipants = Number(eventData?.max_participants);
                                                            const currentParticipants = Number(eventData?.current_participants);
                                                            
                                                            if (isNaN(maxParticipants) || maxParticipants <= 0) {
                                                                return 'Unlimited spots available';
                                                            }
                                                            
                                                            if (isNaN(currentParticipants)) {
                                                                return `${maxParticipants} spots available`;
                                                            }
                                                            
                                                            return `${maxParticipants - currentParticipants} of ${maxParticipants} spots available`;
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
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