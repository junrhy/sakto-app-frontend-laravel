import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { Calendar, Clock, MapPin, Users, FileImage, Tag, Globe, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface Event {
    id?: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    max_participants: number;
    registration_deadline: string;
    is_public: boolean;
    is_paid_event: boolean;
    event_price: number;
    currency: string;
    payment_instructions: string;
    category: string;
    image: string;
    status: string;
}

interface Props extends PageProps {
    event?: Event;
}

interface FormData {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    max_participants: number;
    registration_deadline: string;
    is_public: boolean;
    is_paid_event: boolean;
    event_price: number;
    currency: string;
    payment_instructions: string;
    category: string;
    image: string | File;
    status: string;
}

export default function Form({ auth, event }: Props) {
    // Helper function to format datetime for input field
    const formatDateTimeForInput = (dateTimeString: string | null | undefined) => {
        if (!dateTimeString) return '';
        
        console.log('formatDateTimeForInput called with:', dateTimeString);
        
        try {
            let dateTime = dateTimeString;
            if (!dateTime.includes('T')) {
                dateTime = `${dateTime}T00:00`;
            }
            
            const dateTimeObj = new Date(dateTime);
            
            // Check if the date is valid
            if (isNaN(dateTimeObj.getTime())) {
                console.warn('Invalid date:', dateTimeString);
                return '';
            }
            
            // Format as YYYY-MM-DDTHH:MM for datetime-local input
            // Use UTC methods to avoid timezone conversion
            const year = dateTimeObj.getUTCFullYear();
            const month = String(dateTimeObj.getUTCMonth() + 1).padStart(2, '0');
            const day = String(dateTimeObj.getUTCDate()).padStart(2, '0');
            const hours = String(dateTimeObj.getUTCHours()).padStart(2, '0');
            const minutes = String(dateTimeObj.getUTCMinutes()).padStart(2, '0');
            
            const result = `${year}-${month}-${day}T${hours}:${minutes}`;
            console.log('formatDateTimeForInput result:', result);
            
            return result;
        } catch (error) {
            console.warn('Error formatting datetime:', dateTimeString, error);
            return '';
        }
    };

    const { data, setData, post, put, processing, errors, reset } = useForm<FormData>({
        title: event?.title || '',
        description: event?.description || '',
        start_date: formatDateTimeForInput(event?.start_date),
        end_date: formatDateTimeForInput(event?.end_date),
        location: event?.location || '',
        max_participants: event?.max_participants || 0,
        registration_deadline: formatDateTimeForInput(event?.registration_deadline),
        is_public: event?.is_public || false,
        is_paid_event: event?.is_paid_event || false,
        event_price: event?.event_price || 0,
        currency: event?.currency || '',
        payment_instructions: event?.payment_instructions || '',
        category: event?.category || '',
        image: event?.image || '',
        status: event?.status || 'draft',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(event?.image || null);
    
    // Clear errors when the form is loaded with existing data
    useEffect(() => {
        if (event) {
            try {
                // Reset the form with the event data
                setData({
                    title: event.title || '',
                    description: event.description || '',
                    start_date: formatDateTimeForInput(event.start_date),
                    end_date: formatDateTimeForInput(event.end_date),
                    location: event.location || '',
                    max_participants: event.max_participants || 0,
                    registration_deadline: formatDateTimeForInput(event.registration_deadline),
                    is_public: event.is_public || false,
                    is_paid_event: event.is_paid_event || false,
                    event_price: event.event_price || 0,
                    currency: event.currency || '',
                    payment_instructions: event.payment_instructions || '',
                    category: event.category || '',
                    image: event.image || '',
                    status: event.status || 'draft',
                });
                setImagePreview(event.image || null);
            } catch (error) {
                console.error('Error setting form data:', error);
                // If there's an error, reset to default values
                setData({
                    title: '',
                    description: '',
                    start_date: '',
                    end_date: '',
                    location: '',
                    max_participants: 0,
                    registration_deadline: '',
                    is_public: false,
                    is_paid_event: false,
                    event_price: 0,
                    currency: '',
                    payment_instructions: '',
                    category: '',
                    image: '',
                    status: 'draft',
                });
                setImagePreview(null);
            }
        }
    }, [event]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate required fields
        if (!data.start_date) {
            toast.error('Please set the start date and time');
            return;
        }
        
        if (!data.end_date) {
            toast.error('Please set the end date and time');
            return;
        }
        
        if (!data.registration_deadline) {
            toast.error('Please set the registration deadline date and time');
            return;
        }
        
        // Create FormData object to handle file uploads
        const formData = new FormData();
        
        // Prepare the data object
        const submitData = {
            title: data.title,
            description: data.description,
            start_date: data.start_date + ':00', // Add seconds to make it full datetime
            end_date: data.end_date + ':00',
            location: data.location,
            max_participants: data.max_participants,
            registration_deadline: data.registration_deadline + ':00',
            is_public: data.is_public,
            is_paid_event: data.is_paid_event,
            event_price: data.event_price,
            currency: data.currency,
            payment_instructions: data.payment_instructions,
            category: data.category,
            status: data.status,
        };
        
        // Append all form fields to FormData
        Object.entries(submitData).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                formData.append(key, value.toString());
            }
        });
        
        // Handle image separately
        if (data.image instanceof File) {
            formData.append('image', data.image);
        } else if (data.image) {
            formData.append('image', data.image);
        }

        if (event?.id) {
            // Use PUT method directly for updates
            put(`/events/${event.id}`, {
                ...Object.fromEntries(formData),
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success('Event updated successfully');
                    window.location.href = '/events';
                },
                onError: () => {
                    toast.error('Failed to update event');
                },
            });
        } else {
            // Use POST method for new events
            post('/events', {
                ...Object.fromEntries(formData),
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success('Event created successfully');
                    window.location.href = '/events';
                },
                onError: () => {
                    toast.error('Failed to create event');
                },
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">
                {event ? 'Edit Event' : 'Create Event'}
            </h2>}
        >
            <Head title={event ? 'Edit Event' : 'Create Event'} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information Section */}
                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Tag className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-semibold text-gray-800">
                                            Basic Information
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Provide the essential details about your event
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                                            Event Title *
                                        </Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            placeholder="Enter event title"
                                            className="h-11"
                                            required
                                        />
                                        {errors.title && (
                                            <div className="text-sm text-red-600">{errors.title}</div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                                            Category *
                                        </Label>
                                        <Input
                                            id="category"
                                            value={data.category}
                                            onChange={e => setData('category', e.target.value)}
                                            placeholder="e.g., Conference, Workshop, Meetup"
                                            className="h-11"
                                            required
                                        />
                                        {errors.category && (
                                            <div className="text-sm text-red-600">{errors.category}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                        Description *
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Describe your event in detail..."
                                        className="min-h-[120px] resize-none"
                                        required
                                    />
                                    {errors.description && (
                                        <div className="text-sm text-red-600">{errors.description}</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Date & Time Section */}
                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Calendar className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-semibold text-gray-800">
                                            Date & Time
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Set when your event will take place
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Start Date & Time *
                                        </Label>
                                        <Input
                                            id="start_date"
                                            type="datetime-local"
                                            value={data.start_date}
                                            onChange={e => setData('start_date', e.target.value)}
                                            className="h-11"
                                            required
                                        />
                                        {errors.start_date && (
                                            <div className="text-sm text-red-600">{errors.start_date}</div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 flex items-center">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            End Date & Time *
                                        </Label>
                                        <Input
                                            id="end_date"
                                            type="datetime-local"
                                            value={data.end_date}
                                            onChange={e => setData('end_date', e.target.value)}
                                            className="h-11"
                                            required
                                        />
                                        {errors.end_date && (
                                            <div className="text-sm text-red-600">{errors.end_date}</div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label htmlFor="registration_deadline" className="text-sm font-medium text-gray-700 flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Registration Deadline Date & Time *
                                    </Label>
                                    <Input
                                        id="registration_deadline"
                                        type="datetime-local"
                                        value={data.registration_deadline}
                                        onChange={e => setData('registration_deadline', e.target.value)}
                                        className="h-11"
                                        required
                                    />
                                    {errors.registration_deadline && (
                                        <div className="text-sm text-red-600">{errors.registration_deadline}</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location & Participants Section */}
                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <MapPin className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-semibold text-gray-800">
                                            Location & Participants
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Where will your event take place and how many can attend
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            Location *
                                        </Label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={e => setData('location', e.target.value)}
                                            placeholder="Enter event location"
                                            className="h-11"
                                            required
                                        />
                                        {errors.location && (
                                            <div className="text-sm text-red-600">{errors.location}</div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="max_participants" className="text-sm font-medium text-gray-700 flex items-center">
                                            <Users className="h-4 w-4 mr-2" />
                                            Maximum Participants
                                        </Label>
                                        <Input
                                            id="max_participants"
                                            type="number"
                                            value={data.max_participants}
                                            onChange={e => setData('max_participants', parseInt(e.target.value))}
                                            placeholder="0 for unlimited"
                                            min="0"
                                            className="h-11"
                                        />
                                        {errors.max_participants && (
                                            <div className="text-sm text-red-600">{errors.max_participants}</div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Information Section */}
                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <div className="h-5 w-5 text-emerald-600">₱</div>
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-semibold text-gray-800">
                                            Payment Information
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Configure payment settings for your event
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Switch
                                            id="is_paid_event"
                                            checked={data.is_paid_event}
                                            onCheckedChange={(checked) => setData('is_paid_event', checked)}
                                        />
                                        <div className="flex items-center space-x-2">
                                            <div className="h-4 w-4 text-gray-600">₱</div>
                                            <Label htmlFor="is_paid_event" className="text-sm font-medium text-gray-700">
                                                Paid Event
                                            </Label>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 ml-6">
                                        Enable this if participants need to pay to attend
                                    </p>
                                    {errors.is_paid_event && (
                                        <div className="text-sm text-red-600">{errors.is_paid_event}</div>
                                    )}
                                </div>

                                {data.is_paid_event && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="event_price" className="text-sm font-medium text-gray-700">
                                                    Event Price *
                                                </Label>
                                                <Input
                                                    id="event_price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.event_price}
                                                    onChange={e => setData('event_price', parseFloat(e.target.value) || 0)}
                                                    placeholder="0.00"
                                                    className="h-11"
                                                    required
                                                />
                                                {errors.event_price && (
                                                    <div className="text-sm text-red-600">{errors.event_price}</div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                                                    Currency
                                                </Label>
                                                <Select
                                                    value={data.currency}
                                                    onValueChange={(value) => setData('currency', value)}
                                                >
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Select currency" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PHP">PHP (Philippine Peso)</SelectItem>
                                                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                                                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                                                        <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.currency && (
                                                    <div className="text-sm text-red-600">{errors.currency}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="payment_instructions" className="text-sm font-medium text-gray-700">
                                                Payment Instructions
                                            </Label>
                                            <Textarea
                                                id="payment_instructions"
                                                value={data.payment_instructions}
                                                onChange={e => setData('payment_instructions', e.target.value)}
                                                placeholder="Provide instructions on how participants should pay (e.g., bank transfer details, payment links, etc.)"
                                                className="min-h-[100px] resize-none"
                                            />
                                            {errors.payment_instructions && (
                                                <div className="text-sm text-red-600">{errors.payment_instructions}</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Media & Settings Section */}
                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Settings className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-semibold text-gray-800">
                                            Media & Settings
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Add an image and configure event settings
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="image" className="text-sm font-medium text-gray-700 flex items-center">
                                            <FileImage className="h-4 w-4 mr-2" />
                                            Event Image
                                        </Label>
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {errors.image && (
                                            <div className="text-sm text-red-600">{errors.image}</div>
                                        )}
                                        {imagePreview && (
                                            <div className="mt-3">
                                                <img
                                                    src={imagePreview}
                                                    alt="Event preview"
                                                    className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                                                Event Status
                                            </Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(value) => setData('status', value)}
                                            >
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="published">Published</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && (
                                                <div className="text-sm text-red-600">{errors.status}</div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-3">
                                                <Switch
                                                    id="is_public"
                                                    checked={data.is_public}
                                                    onCheckedChange={(checked) => setData('is_public', checked)}
                                                />
                                                <div className="flex items-center space-x-2">
                                                    <Globe className="h-4 w-4 text-gray-600" />
                                                    <Label htmlFor="is_public" className="text-sm font-medium text-gray-700">
                                                        Public Event
                                                    </Label>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 ml-6">
                                                Make this event visible to the public
                                            </p>
                                            {errors.is_public && (
                                                <div className="text-sm text-red-600">{errors.is_public}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6 bg-white p-6 rounded-lg shadow-lg border">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.location.href = '/events'}
                                className="px-8 py-3 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                {processing ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving...</span>
                                    </div>
                                ) : (
                                    event ? 'Update Event' : 'Create Event'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 