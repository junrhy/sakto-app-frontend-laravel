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
    category: string;
    image: string;
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
    category: string;
    image: string | File;
}

export default function Form({ auth, event }: Props) {
    const { data, setData, post, put, processing, errors, reset } = useForm<FormData>({
        title: event?.title || '',
        description: event?.description || '',
        start_date: event?.start_date ? (event.start_date.includes('T') ? event.start_date : `${event.start_date}T00:00`) : '',
        end_date: event?.end_date ? (event.end_date.includes('T') ? event.end_date : `${event.end_date}T00:00`) : '',
        location: event?.location || '',
        max_participants: event?.max_participants || 0,
        registration_deadline: event?.registration_deadline ? (event.registration_deadline.includes('T') ? event.registration_deadline : `${event.registration_deadline}T00:00`) : '',
        is_public: event?.is_public || false,
        category: event?.category || '',
        image: event?.image || '',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(event?.image || null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (event?.id) {
            put(`/${event.id}`, {
                onSuccess: () => {
                    toast.success('Event updated successfully');
                    window.location.href = '/events';
                },
                onError: () => {
                    toast.error('Failed to update event');
                },
            });
        } else {
            post('/events', {
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
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {event ? 'Edit Event' : 'Create New Event'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Title</Label>
                                                <Input
                                                    id="title"
                                                    value={data.title}
                                                    onChange={e => setData('title', e.target.value)}
                                                    required
                                                />
                                                {errors.title && (
                                                    <div className="text-sm text-red-600">{errors.title}</div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="category">Category</Label>
                                                <Input
                                                    id="category"
                                                    value={data.category}
                                                    onChange={e => setData('category', e.target.value)}
                                                    required
                                                />
                                                {errors.category && (
                                                    <div className="text-sm text-red-600">{errors.category}</div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="start_date">Start Date</Label>
                                                <Input
                                                    id="start_date"
                                                    type="datetime-local"
                                                    value={data.start_date}
                                                    onChange={e => setData('start_date', e.target.value)}
                                                    required
                                                />
                                                {errors.start_date && (
                                                    <div className="text-sm text-red-600">{errors.start_date}</div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="end_date">End Date</Label>
                                                <Input
                                                    id="end_date"
                                                    type="datetime-local"
                                                    value={data.end_date}
                                                    onChange={e => setData('end_date', e.target.value)}
                                                    required
                                                />
                                                {errors.end_date && (
                                                    <div className="text-sm text-red-600">{errors.end_date}</div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="location">Location</Label>
                                                <Input
                                                    id="location"
                                                    value={data.location}
                                                    onChange={e => setData('location', e.target.value)}
                                                    required
                                                />
                                                {errors.location && (
                                                    <div className="text-sm text-red-600">{errors.location}</div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="max_participants">Max Participants</Label>
                                                <Input
                                                    id="max_participants"
                                                    type="number"
                                                    value={data.max_participants}
                                                    onChange={e => setData('max_participants', parseInt(e.target.value))}
                                                    min="0"
                                                />
                                                {errors.max_participants && (
                                                    <div className="text-sm text-red-600">{errors.max_participants}</div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="registration_deadline">Registration Deadline</Label>
                                                <Input
                                                    id="registration_deadline"
                                                    type="datetime-local"
                                                    value={data.registration_deadline}
                                                    onChange={e => setData('registration_deadline', e.target.value)}
                                                    required
                                                />
                                                {errors.registration_deadline && (
                                                    <div className="text-sm text-red-600">{errors.registration_deadline}</div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="image">Event Image</Label>
                                                <Input
                                                    id="image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                                {errors.image && (
                                                    <div className="text-sm text-red-600">{errors.image}</div>
                                                )}
                                                {imagePreview && (
                                                    <div className="mt-2">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Event preview"
                                                            className="w-32 h-32 object-cover rounded"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id="is_public"
                                                        checked={data.is_public}
                                                        onCheckedChange={(checked) => setData('is_public', checked)}
                                                    />
                                                    <Label htmlFor="is_public">Public Event</Label>
                                                </div>
                                                {errors.is_public && (
                                                    <div className="text-sm text-red-600">{errors.is_public}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                required
                                            />
                                            {errors.description && (
                                                <div className="text-sm text-red-600">{errors.description}</div>
                                            )}
                                        </div>

                                        <div className="flex justify-end space-x-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => window.location.href = '/events'}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                {event ? 'Update Event' : 'Create Event'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 