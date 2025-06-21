import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Switch } from '@/Components/ui/switch';
import { format } from 'date-fns';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Tag, UserPlus, CreditCard, DollarSign, Plus, Minus, Users as UsersIcon } from 'lucide-react';
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

export default function PublicRegister({ event }: Props) {
    // Extract the actual event data from the response
    const eventData = event.data;
    
    const [isMultipleRegistration, setIsMultipleRegistration] = useState(false);
    const [numberOfRegistrants, setNumberOfRegistrants] = useState(2);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });

    // State for multiple registrants
    const [multipleRegistrants, setMultipleRegistrants] = useState([
        { name: '', email: '', phone: '' }
    ]);

    const isRegistrationOpen = new Date(eventData?.registration_deadline) > new Date();
    const isEventFull = eventData?.max_participants > 0 && eventData?.current_participants >= eventData?.max_participants;

    const formatPrice = (price: number | string | null | undefined, currency: string) => {
        if (price === null || price === undefined) return 'Free';
        const numericPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
        return `${currency} ${numericPrice.toFixed(2)}`;
    };

    const handleMultipleRegistrationChange = (checked: boolean) => {
        setIsMultipleRegistration(checked);
        if (checked) {
            setMultipleRegistrants([{ name: '', email: '', phone: '' }]);
        } else {
            setFormData({ name: '', email: '', phone: '', notes: '' });
        }
    };

    const addRegistrant = () => {
        const maxAvailable = eventData?.max_participants > 0 
            ? eventData.max_participants - eventData.current_participants 
            : 10; // Default limit for unlimited events
        
        if (multipleRegistrants.length < maxAvailable) {
            setMultipleRegistrants([...multipleRegistrants, { name: '', email: '', phone: '' }]);
        } else {
            toast.error(`Maximum ${maxAvailable} registrants allowed`);
        }
    };

    const removeRegistrant = (index: number) => {
        if (multipleRegistrants.length > 1) {
            const newRegistrants = multipleRegistrants.filter((_, i) => i !== index);
            setMultipleRegistrants(newRegistrants);
        }
    };

    const updateRegistrant = (index: number, field: string, value: string) => {
        const newRegistrants = [...multipleRegistrants];
        newRegistrants[index] = { ...newRegistrants[index], [field]: value };
        setMultipleRegistrants(newRegistrants);
    };

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

        if (isMultipleRegistration) {
            // Validate multiple registrants
            const validRegistrants = multipleRegistrants.filter(r => r.name.trim() && r.email.trim());
            if (validRegistrants.length === 0) {
                toast.error('Please add at least one registrant');
                return;
            }

            const submissionData = {
                registrants: validRegistrants,
                notes: formData.notes,
                is_multiple: true
            };

            router.post(`/events/${eventData?.id}/public-register`, submissionData, {
                onSuccess: () => {
                    toast.success(`Successfully registered ${validRegistrants.length} person(s) for this event`);
                    setMultipleRegistrants([{ name: '', email: '', phone: '' }]);
                    setFormData({ name: '', email: '', phone: '', notes: '' });
                },
                onError: (errors) => {
                    toast.error('Failed to register for the event');
                    console.error(errors);
                }
            });
        } else {
            // Single registration
            router.post(`/events/${eventData?.id}/public-register`, formData, {
                onSuccess: () => {
                    toast.success('You have successfully registered for this event');
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
        }
    };

    const getTotalPrice = () => {
        if (!eventData?.is_paid_event || !eventData?.event_price) return 0;
        const price = typeof eventData.event_price === 'number' ? eventData.event_price : parseFloat(eventData.event_price) || 0;
        const registrantCount = isMultipleRegistration ? multipleRegistrants.filter(r => r.name.trim() && r.email.trim()).length : 1;
        return price * registrantCount;
    };

    return (
        <>
            <Head title={`Register for ${eventData?.title}`} />
            <Toaster position="top-right" richColors />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                {/* Hero Section - Hidden on mobile */}
                <div className="relative h-[150px] w-full overflow-hidden hidden md:block">
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
                                {eventData?.is_paid_event && (
                                    <Badge variant="secondary" className="bg-amber-500/90 text-white hover:bg-amber-600/90 border-0">
                                        <DollarSign className="w-3 h-3 mr-1" />
                                        Paid Event
                                    </Badge>
                                )}
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
                                            <motion.div className="space-y-6">
                                                {/* Registration Mode Toggle */}
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <UsersIcon className="w-5 h-5 text-blue-600" />
                                                            <div>
                                                                <h3 className="font-semibold text-slate-900">Register Multiple People</h3>
                                                                <p className="text-sm text-slate-600">Register yourself and others for this event</p>
                                                            </div>
                                                        </div>
                                                        <Switch
                                                            checked={isMultipleRegistration}
                                                            onCheckedChange={handleMultipleRegistrationChange}
                                                            className="data-[state=checked]:bg-blue-600"
                                                        />
                                                    </div>
                                                </motion.div>

                                                {/* Payment Information Notice */}
                                                {eventData?.is_paid_event && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg"
                                                    >
                                                        <div className="flex items-start">
                                                            <CreditCard className="w-6 h-6 mr-3 mt-0.5 text-amber-600" />
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-slate-900 mb-2">Payment Required</h3>
                                                                <div className="text-2xl font-bold text-amber-700 mb-2">
                                                                    {isMultipleRegistration 
                                                                        ? `${formatPrice(getTotalPrice(), eventData?.currency)} (${multipleRegistrants.filter(r => r.name.trim() && r.email.trim()).length} × ${formatPrice(eventData?.event_price, eventData?.currency)})`
                                                                        : formatPrice(eventData?.event_price, eventData?.currency)
                                                                    }
                                                                </div>
                                                                {eventData?.payment_instructions && (
                                                                    <div className="mt-3 p-3 bg-white/60 rounded border border-amber-200">
                                                                        <p className="font-medium text-slate-900 mb-1">Payment Instructions:</p>
                                                                        <div className="text-slate-600 text-sm whitespace-pre-line">
                                                                            {eventData.payment_instructions}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                <motion.form 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    onSubmit={handleSubmit} 
                                                    className="space-y-6"
                                                >
                                                    {isMultipleRegistration ? (
                                                        // Multiple Registration Form
                                                        <div className="space-y-6">
                                                            {multipleRegistrants.map((registrant, index) => (
                                                                <motion.div
                                                                    key={index}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    className="p-4 border border-slate-200 rounded-lg bg-white/50 backdrop-blur-sm"
                                                                >
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <h4 className="font-semibold text-slate-900">
                                                                            Person {index + 1}
                                                                        </h4>
                                                                        {multipleRegistrants.length > 1 && (
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => removeRegistrant(index)}
                                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                            >
                                                                                <Minus className="w-4 h-4" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor={`name-${index}`} className="text-slate-700 font-medium">Full Name *</Label>
                                                                            <Input
                                                                                id={`name-${index}`}
                                                                                value={registrant.name}
                                                                                onChange={e => updateRegistrant(index, 'name', e.target.value)}
                                                                                required
                                                                                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white/50 backdrop-blur-sm"
                                                                                placeholder="Enter full name"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label htmlFor={`email-${index}`} className="text-slate-700 font-medium">Email Address *</Label>
                                                                            <Input
                                                                                id={`email-${index}`}
                                                                                type="email"
                                                                                value={registrant.email}
                                                                                onChange={e => updateRegistrant(index, 'email', e.target.value)}
                                                                                required
                                                                                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white/50 backdrop-blur-sm"
                                                                                placeholder="Enter email address"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2 md:col-span-2">
                                                                            <Label htmlFor={`phone-${index}`} className="text-slate-700 font-medium">Phone Number</Label>
                                                                            <Input
                                                                                id={`phone-${index}`}
                                                                                value={registrant.phone}
                                                                                onChange={e => updateRegistrant(index, 'phone', e.target.value)}
                                                                                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white/50 backdrop-blur-sm"
                                                                                placeholder="Enter phone number (optional)"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                            
                                                            <div className="flex justify-center">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={addRegistrant}
                                                                    className="border-dashed border-2 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700"
                                                                >
                                                                    <Plus className="w-4 h-4 mr-2" />
                                                                    Add Another Person
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // Single Registration Form
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
                                                    )}

                                                    {/* Additional Notes for Multiple Registration */}
                                                    {isMultipleRegistration && (
                                                        <div className="space-y-2">
                                                            <Label htmlFor="notes" className="text-slate-700 font-medium">Additional Notes</Label>
                                                            <Textarea
                                                                id="notes"
                                                                value={formData.notes}
                                                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                                placeholder="Any special requirements or information for the group"
                                                                className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white/50 backdrop-blur-sm min-h-[100px]"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex justify-end pt-4">
                                                        <Button 
                                                            type="submit"
                                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                                        >
                                                            <UserPlus className="w-4 h-4 mr-2" />
                                                            {isMultipleRegistration 
                                                                ? `Register ${multipleRegistrants.filter(r => r.name.trim() && r.email.trim()).length} Person(s)`
                                                                : 'Register for Event'
                                                            }
                                                        </Button>
                                                    </div>
                                                </motion.form>
                                            </motion.div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                            
                            {/* Event Details Section - Hidden on mobile */}
                            <div className="hidden md:block">
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

                                            {/* Payment Information in Sidebar */}
                                            {eventData?.is_paid_event && (
                                                <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                                                    <p className="font-semibold text-slate-900 mb-2 flex items-center">
                                                        <CreditCard className="w-4 h-4 mr-2 text-amber-600" />
                                                        Payment Required
                                                    </p>
                                                    <div className="text-slate-600">
                                                        <div className="text-lg font-bold text-amber-700 mb-1">
                                                            {isMultipleRegistration 
                                                                ? `${formatPrice(getTotalPrice(), eventData?.currency)} (${multipleRegistrants.filter(r => r.name.trim() && r.email.trim()).length} × ${formatPrice(eventData?.event_price, eventData?.currency)})`
                                                                : formatPrice(eventData?.event_price, eventData?.currency)
                                                            }
                                                        </div>
                                                        <p className="text-sm">Payment will be collected during registration</p>
                                                    </div>
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