import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Clock, CreditCard, FileImage, Info, Users } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
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
    lemon_squeezy_product_id?: string;
    lemon_squeezy_variant_id?: string;
}

interface Props extends PageProps {
    event?: Event;
    auth: {
        user: User;
        project?: any;
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
    lemon_squeezy_product_id: string;
    lemon_squeezy_variant_id: string;
}

export default function Form({ auth, event }: Props) {
    // Helper function to format datetime for input field
    const formatDateTimeForInput = (
        dateTimeString: string | null | undefined,
    ) => {
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
            const month = String(dateTimeObj.getUTCMonth() + 1).padStart(
                2,
                '0',
            );
            const day = String(dateTimeObj.getUTCDate()).padStart(2, '0');
            const hours = String(dateTimeObj.getUTCHours()).padStart(2, '0');
            const minutes = String(dateTimeObj.getUTCMinutes()).padStart(
                2,
                '0',
            );

            const result = `${year}-${month}-${day}T${hours}:${minutes}`;
            console.log('formatDateTimeForInput result:', result);

            return result;
        } catch (error) {
            console.warn('Error formatting datetime:', dateTimeString, error);
            return '';
        }
    };

    const { data, setData, post, put, processing, errors, reset } =
        useForm<FormData>({
            title: event?.title || '',
            description: event?.description || '',
            start_date: formatDateTimeForInput(event?.start_date),
            end_date: formatDateTimeForInput(event?.end_date),
            location: event?.location || '',
            max_participants: event?.max_participants || 0,
            registration_deadline: formatDateTimeForInput(
                event?.registration_deadline,
            ),
            is_public: event?.is_public ?? true,
            is_paid_event: event?.is_paid_event ?? false,
            event_price: event?.event_price || 0,
            currency: event?.currency || 'USD',
            payment_instructions: event?.payment_instructions || '',
            category: event?.category || '',
            image: event?.image || '',
            status: event?.status || 'draft',
            lemon_squeezy_product_id: event?.lemon_squeezy_product_id || '',
            lemon_squeezy_variant_id: event?.lemon_squeezy_variant_id || '',
        });

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - check their roles
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    const [imagePreview, setImagePreview] = useState<string | null>(
        event?.image || null,
    );

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
                    registration_deadline: formatDateTimeForInput(
                        event.registration_deadline,
                    ),
                    is_public: event.is_public || false,
                    is_paid_event: event.is_paid_event || false,
                    event_price: event.event_price || 0,
                    currency: event.currency || '',
                    payment_instructions: event.payment_instructions || '',
                    category: event.category || '',
                    image: event.image || '',
                    status: event.status || 'draft',
                    lemon_squeezy_product_id:
                        event.lemon_squeezy_product_id || '',
                    lemon_squeezy_variant_id:
                        event.lemon_squeezy_variant_id || '',
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
                    lemon_squeezy_product_id: '',
                    lemon_squeezy_variant_id: '',
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
            auth={auth}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-100">
                    {event ? 'Edit Event' : 'Create New Event'}
                </h2>
            }
        >
            <Head title={event ? 'Edit Event' : 'Create Event'} />

            <div>
                <div className="mx-auto">
                    {canEdit ? (
                        <form onSubmit={handleSubmit}>
                            <Tabs defaultValue="details" className="w-full">
                                <TabsList className="grid w-full grid-cols-5 border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
                                    <TabsTrigger
                                        value="details"
                                        className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                                    >
                                        <Info className="h-4 w-4" />
                                        <span>Details</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="schedule"
                                        className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                                    >
                                        <Clock className="h-4 w-4" />
                                        <span>Schedule</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="registration"
                                        className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                                    >
                                        <Users className="h-4 w-4" />
                                        <span>Registration</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="payment"
                                        className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        <span>Payment</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="media"
                                        className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-100"
                                    >
                                        <FileImage className="h-4 w-4" />
                                        <span>Media</span>
                                    </TabsTrigger>
                                </TabsList>

                                {/* Tab 1: Event Details */}
                                <TabsContent value="details" className="mt-6">
                                    <Card className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                                        <CardHeader>
                                            <CardTitle className="text-gray-900 dark:text-gray-100">
                                                Event Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="title"
                                                        className="text-gray-700 dark:text-gray-300"
                                                    >
                                                        Event Title *
                                                    </Label>
                                                    <Input
                                                        id="title"
                                                        value={data.title}
                                                        onChange={(e) =>
                                                            setData(
                                                                'title',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                        className="border-gray-300 bg-white text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                                        placeholder="Enter event title"
                                                    />
                                                    {errors.title && (
                                                        <p className="text-sm text-red-600 dark:text-red-400">
                                                            {errors.title}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="category"
                                                        className="text-gray-700 dark:text-gray-300"
                                                    >
                                                        Category *
                                                    </Label>
                                                    <Select
                                                        value={data.category}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            setData(
                                                                'category',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                                                            <SelectItem value="conference">
                                                                Conference
                                                            </SelectItem>
                                                            <SelectItem value="workshop">
                                                                Workshop
                                                            </SelectItem>
                                                            <SelectItem value="seminar">
                                                                Seminar
                                                            </SelectItem>
                                                            <SelectItem value="meetup">
                                                                Meetup
                                                            </SelectItem>
                                                            <SelectItem value="webinar">
                                                                Webinar
                                                            </SelectItem>
                                                            <SelectItem value="training">
                                                                Training
                                                            </SelectItem>
                                                            <SelectItem value="networking">
                                                                Networking
                                                            </SelectItem>
                                                            <SelectItem value="other">
                                                                Other
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.category && (
                                                        <p className="text-sm text-red-600 dark:text-red-400">
                                                            {errors.category}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="description"
                                                    className="text-gray-700 dark:text-gray-300"
                                                >
                                                    Description *
                                                </Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) =>
                                                        setData(
                                                            'description',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    rows={4}
                                                    className="border-gray-300 bg-white text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                                    placeholder="Describe your event..."
                                                />
                                                {errors.description && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">
                                                        {errors.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="location"
                                                    className="text-gray-700 dark:text-gray-300"
                                                >
                                                    Location *
                                                </Label>
                                                <Input
                                                    id="location"
                                                    value={data.location}
                                                    onChange={(e) =>
                                                        setData(
                                                            'location',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    className="border-gray-300 bg-white text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                                    placeholder="Enter event location"
                                                />
                                                {errors.location && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">
                                                        {errors.location}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Tab 2: Schedule */}
                                <TabsContent value="schedule" className="mt-6">
                                    <Card className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                                        <CardHeader>
                                            <CardTitle className="text-gray-900 dark:text-gray-100">
                                                Event Schedule
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="start_date"
                                                        className="text-gray-700 dark:text-gray-300"
                                                    >
                                                        Start Date & Time *
                                                    </Label>
                                                    <Input
                                                        id="start_date"
                                                        type="datetime-local"
                                                        value={data.start_date}
                                                        onChange={(e) =>
                                                            setData(
                                                                'start_date',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                        className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    />
                                                    {errors.start_date && (
                                                        <p className="text-sm text-red-600 dark:text-red-400">
                                                            {errors.start_date}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="end_date"
                                                        className="text-gray-700 dark:text-gray-300"
                                                    >
                                                        End Date & Time *
                                                    </Label>
                                                    <Input
                                                        id="end_date"
                                                        type="datetime-local"
                                                        value={data.end_date}
                                                        onChange={(e) =>
                                                            setData(
                                                                'end_date',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                        className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    />
                                                    {errors.end_date && (
                                                        <p className="text-sm text-red-600 dark:text-red-400">
                                                            {errors.end_date}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="registration_deadline"
                                                        className="text-gray-700 dark:text-gray-300"
                                                    >
                                                        Registration Deadline *
                                                    </Label>
                                                    <Input
                                                        id="registration_deadline"
                                                        type="datetime-local"
                                                        value={
                                                            data.registration_deadline
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'registration_deadline',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                        className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    />
                                                    {errors.registration_deadline && (
                                                        <p className="text-sm text-red-600 dark:text-red-400">
                                                            {
                                                                errors.registration_deadline
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Tab 3: Registration Settings */}
                                <TabsContent
                                    value="registration"
                                    className="mt-6"
                                >
                                    <Card className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                                        <CardHeader>
                                            <CardTitle className="text-gray-900 dark:text-gray-100">
                                                Registration Settings
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="max_participants"
                                                    className="text-gray-700 dark:text-gray-300"
                                                >
                                                    Maximum Participants
                                                </Label>
                                                <Input
                                                    id="max_participants"
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        data.max_participants
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'max_participants',
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                    placeholder="0 for unlimited"
                                                />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Set to 0 for unlimited
                                                    participants
                                                </p>
                                                {errors.max_participants && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">
                                                        {
                                                            errors.max_participants
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <Label className="text-gray-700 dark:text-gray-300">
                                                        Public Event
                                                    </Label>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Allow public
                                                        registration for this
                                                        event
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={data.is_public}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData(
                                                            'is_public',
                                                            checked,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="status"
                                                    className="text-gray-700 dark:text-gray-300"
                                                >
                                                    Event Status
                                                </Label>
                                                <Select
                                                    value={data.status}
                                                    onValueChange={(value) =>
                                                        setData('status', value)
                                                    }
                                                >
                                                    <SelectTrigger className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                                                        <SelectItem value="draft">
                                                            Draft
                                                        </SelectItem>
                                                        <SelectItem value="published">
                                                            Published
                                                        </SelectItem>
                                                        <SelectItem value="cancelled">
                                                            Cancelled
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.status && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">
                                                        {errors.status}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Tab 4: Payment Settings */}
                                <TabsContent value="payment" className="mt-6">
                                    <Card className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                                        <CardHeader>
                                            <CardTitle className="text-gray-900 dark:text-gray-100">
                                                Payment Settings
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <Label className="text-gray-700 dark:text-gray-300">
                                                        Paid Event
                                                    </Label>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Enable if this event
                                                        requires payment
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={data.is_paid_event}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData(
                                                            'is_paid_event',
                                                            checked,
                                                        )
                                                    }
                                                />
                                            </div>

                                            {data.is_paid_event && (
                                                <div className="space-y-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor="event_price"
                                                                className="text-gray-700 dark:text-gray-300"
                                                            >
                                                                Event Price
                                                            </Label>
                                                            <Input
                                                                id="event_price"
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={
                                                                    data.event_price
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'event_price',
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ) || 0,
                                                                    )
                                                                }
                                                                className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                                placeholder="0.00"
                                                            />
                                                            {errors.event_price && (
                                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                                    {
                                                                        errors.event_price
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor="currency"
                                                                className="text-gray-700 dark:text-gray-300"
                                                            >
                                                                Currency
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    data.currency
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    setData(
                                                                        'currency',
                                                                        value,
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                                                                    <SelectValue placeholder="Select currency" />
                                                                </SelectTrigger>
                                                                <SelectContent className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                                                                    <SelectItem value="USD">
                                                                        USD ($)
                                                                    </SelectItem>
                                                                    <SelectItem value="EUR">
                                                                        EUR (€)
                                                                    </SelectItem>
                                                                    <SelectItem value="GBP">
                                                                        GBP (£)
                                                                    </SelectItem>
                                                                    <SelectItem value="PHP">
                                                                        PHP (₱)
                                                                    </SelectItem>
                                                                    <SelectItem value="JPY">
                                                                        JPY (¥)
                                                                    </SelectItem>
                                                                    <SelectItem value="CAD">
                                                                        CAD (C$)
                                                                    </SelectItem>
                                                                    <SelectItem value="AUD">
                                                                        AUD (A$)
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            {errors.currency && (
                                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                                    {
                                                                        errors.currency
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="payment_instructions"
                                                            className="text-gray-700 dark:text-gray-300"
                                                        >
                                                            Payment Instructions
                                                        </Label>
                                                        <Textarea
                                                            id="payment_instructions"
                                                            value={
                                                                data.payment_instructions
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'payment_instructions',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            rows={3}
                                                            className="border-gray-300 bg-white text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                                                            placeholder="Provide payment instructions for participants..."
                                                        />
                                                        {errors.payment_instructions && (
                                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                                {
                                                                    errors.payment_instructions
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor="lemon_squeezy_product_id"
                                                                className="text-gray-700 dark:text-gray-300"
                                                            >
                                                                Lemon Squeezy
                                                                Product ID
                                                            </Label>
                                                            <Input
                                                                id="lemon_squeezy_product_id"
                                                                type="text"
                                                                value={
                                                                    data.lemon_squeezy_product_id
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'lemon_squeezy_product_id',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                                placeholder="e.g., 123456"
                                                            />
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Create product
                                                                in Lemon Squeezy
                                                                dashboard and
                                                                paste ID here
                                                            </p>
                                                            {errors.lemon_squeezy_product_id && (
                                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                                    {
                                                                        errors.lemon_squeezy_product_id
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor="lemon_squeezy_variant_id"
                                                                className="text-gray-700 dark:text-gray-300"
                                                            >
                                                                Lemon Squeezy
                                                                Variant ID
                                                            </Label>
                                                            <Input
                                                                id="lemon_squeezy_variant_id"
                                                                type="text"
                                                                value={
                                                                    data.lemon_squeezy_variant_id
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        'lemon_squeezy_variant_id',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                                                placeholder="e.g., 789012"
                                                            />
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Create variant
                                                                with event price
                                                                and paste ID
                                                                here
                                                            </p>
                                                            {errors.lemon_squeezy_variant_id && (
                                                                <p className="text-sm text-red-600 dark:text-red-400">
                                                                    {
                                                                        errors.lemon_squeezy_variant_id
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Tab 5: Media */}
                                <TabsContent value="media" className="mt-6">
                                    <Card className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                                        <CardHeader>
                                            <CardTitle className="text-gray-900 dark:text-gray-100">
                                                Event Image
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="image"
                                                    className="text-gray-700 dark:text-gray-300"
                                                >
                                                    Upload Image
                                                </Label>
                                                <Input
                                                    id="image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="border-gray-300 bg-white text-gray-900 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:file:bg-blue-900/20 dark:file:text-blue-300 dark:hover:file:bg-blue-900/30"
                                                />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Recommended size: 1200x630
                                                    pixels
                                                </p>
                                                {errors.image && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">
                                                        {errors.image}
                                                    </p>
                                                )}
                                            </div>

                                            {imagePreview && (
                                                <div className="relative">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Event preview"
                                                        className="h-48 w-full max-w-md rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setImagePreview(
                                                                null,
                                                            )
                                                        }
                                                        className="absolute right-2 top-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>

                            {/* Action Buttons */}
                            <div className="mt-6 flex justify-end space-x-4 rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        (window.location.href = '/events')
                                    }
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="group relative transform bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600"
                                >
                                    <div className="absolute inset-0 rounded-md bg-white/20 opacity-0 blur transition-opacity group-hover:opacity-100"></div>
                                    <span className="relative z-10 font-semibold">
                                        {processing
                                            ? 'Saving...'
                                            : event
                                              ? 'Update Event'
                                              : 'Create Event'}
                                    </span>
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="py-12 text-center">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                You do not have permission to edit this event.
                            </h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Only administrators, managers, and users with
                                appropriate roles can modify event details.
                            </p>
                            <div className="mt-6">
                                <Button
                                    onClick={() =>
                                        (window.location.href = '/events')
                                    }
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                                >
                                    Back to Events
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
