import { Badge } from '@/Components/ui/badge';
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
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import React from 'react';

interface QueueType {
    id: number;
    name: string;
    description?: string;
    prefix: string;
    current_number: number;
    is_active: boolean;
}

interface Props extends PageProps {
    queueType: QueueType;
}

export default function QueueEdit({ auth, queueType }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: queueType.name || '',
        description: queueType.description || '',
        prefix: queueType.prefix || '',
        is_active: queueType.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('queue.update', queueType.id));
    };

    const handleDelete = () => {
        if (
            confirm(
                'Are you sure you want to delete this queue type? This action cannot be undone.',
            )
        ) {
            // Using router.delete for DELETE request
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = route('queue.destroy', queueType.id);

            // Add CSRF token
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');
            if (csrfToken) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_token';
                csrfInput.value = csrfToken;
                form.appendChild(csrfInput);
            }

            // Add method override for DELETE
            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'DELETE';
            form.appendChild(methodInput);

            document.body.appendChild(form);
            form.submit();
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('queue.show', queueType.id)}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Queue
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                                Edit Queue Type
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Modify settings for: {queueType.name}
                            </p>
                        </div>
                    </div>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Queue Type
                    </Button>
                </div>
            }
        >
            <Head title={`Edit: ${queueType.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    {/* Current Status Card */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Current Status
                                <Badge
                                    variant={
                                        queueType.is_active
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {queueType.is_active
                                        ? 'Active'
                                        : 'Inactive'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">
                                    Current Number
                                </Label>
                                <div className="font-mono text-2xl font-bold">
                                    {queueType.prefix}
                                    {queueType.current_number
                                        .toString()
                                        .padStart(3, '0')}
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">
                                    Queue Prefix
                                </Label>
                                <div className="font-mono text-2xl font-bold">
                                    {queueType.prefix}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Edit Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Queue Type Settings</CardTitle>
                            <CardDescription>
                                Update the configuration for this queue type.
                                Changes will take effect immediately.
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
                                        placeholder="e.g., Q, A, P"
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

                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="is_active">
                                            Queue Status
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {data.is_active
                                                ? 'Queue is currently active and accepting new customers'
                                                : 'Queue is inactive - no new customers can join'}
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) =>
                                            setData('is_active', checked)
                                        }
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1"
                                    >
                                        {processing
                                            ? 'Updating...'
                                            : 'Update Queue Type'}
                                    </Button>
                                    <Link
                                        href={route('queue.show', queueType.id)}
                                    >
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Warning Card */}
                    <Card className="mt-6 border-orange-200 dark:border-orange-800">
                        <CardHeader>
                            <CardTitle className="text-orange-800 dark:text-orange-200">
                                Important Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-orange-700 dark:text-orange-300">
                            <p>
                                <strong>Changing the prefix:</strong> Will
                                affect how new queue numbers are generated, but
                                existing numbers will keep their original
                                prefix.
                            </p>
                            <p>
                                <strong>Deactivating the queue:</strong> Will
                                prevent new customers from joining, but existing
                                customers can still be served.
                            </p>
                            <p>
                                <strong>Deleting the queue type:</strong> This
                                action cannot be undone and will remove all
                                associated queue numbers and history.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
