import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

export default function QueueCreate({ auth }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        prefix: 'Q',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('queue.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('queue.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Create Queue Type
                    </h2>
                </div>
            }
        >
            <Head title="Create Queue Type" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Queue Type</CardTitle>
                            <CardDescription>
                                Set up a new queue type for your business. This
                                will create a separate queue line with its own
                                numbering system.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Queue Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="e.g., General Consultation, Emergency, Pharmacy"
                                        className={
                                            errors.name ? 'border-red-500' : ''
                                        }
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Description
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
                                        placeholder="Optional description for this queue type..."
                                        rows={3}
                                        className={
                                            errors.description
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="prefix">
                                        Queue Prefix *
                                    </Label>
                                    <Input
                                        id="prefix"
                                        type="text"
                                        value={data.prefix}
                                        onChange={(e) =>
                                            setData(
                                                'prefix',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="e.g., Q, A, P (for General, Appointment, Priority)"
                                        maxLength={10}
                                        className={
                                            errors.prefix
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        This will be used as the prefix for
                                        queue numbers (e.g., {data.prefix}001,{' '}
                                        {data.prefix}002)
                                    </p>
                                    {errors.prefix && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.prefix}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1"
                                    >
                                        {processing
                                            ? 'Creating...'
                                            : 'Create Queue Type'}
                                    </Button>
                                    <Link href={route('queue.index')}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Help Section */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Tips for Setting Up Queue Types
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="mb-2 font-medium">
                                    Common Queue Types:
                                </h4>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    <li>
                                        • <strong>General:</strong> For regular
                                        consultations or services
                                    </li>
                                    <li>
                                        • <strong>Priority:</strong> For urgent
                                        cases or VIP customers
                                    </li>
                                    <li>
                                        • <strong>Pharmacy:</strong> For
                                        medication pickup
                                    </li>
                                    <li>
                                        • <strong>Lab Results:</strong> For test
                                        result inquiries
                                    </li>
                                    <li>
                                        • <strong>Emergency:</strong> For urgent
                                        medical cases
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="mb-2 font-medium">
                                    Queue Prefix Suggestions:
                                </h4>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    <li>
                                        • <strong>Q:</strong> General queue
                                    </li>
                                    <li>
                                        • <strong>P:</strong> Priority queue
                                    </li>
                                    <li>
                                        • <strong>E:</strong> Emergency queue
                                    </li>
                                    <li>
                                        • <strong>A:</strong> Appointment queue
                                    </li>
                                    <li>
                                        • <strong>L:</strong> Lab results queue
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
