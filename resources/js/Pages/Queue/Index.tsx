import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Plus, Users, Clock, CheckCircle, XCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface QueueType {
    id: number;
    name: string;
    description?: string;
    prefix: string;
    current_number: number;
    is_active: boolean;
    queue_numbers: QueueNumber[];
}

interface QueueNumber {
    id: number;
    queue_number: string;
    customer_name?: string;
    customer_contact?: string;
    status: 'waiting' | 'called' | 'serving' | 'completed' | 'cancelled';
    created_at: string;
    called_at?: string;
    serving_at?: string;
    completed_at?: string;
}

interface Props extends PageProps {
    queueTypes: QueueType[];
}

export default function QueueIndex({ auth, queueTypes }: Props) {
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(false);

    const getStatusCount = (status: string) => {
        return queueTypes.reduce((total, queueType) => {
            return total + queueType.queue_numbers.reduce((count, qn) => 
                count + (qn.status === status ? 1 : 0), 0
            );
        }, 0);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'called': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'serving': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const callNext = async (queueTypeId: number) => {
        setLoading(true);
        try {
            const response = await fetch(route('queue.call-next'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ queue_type_id: queueTypeId })
            });

            const data = await response.json();
            if (data.status === 'success') {
                toast.success('Next queue number called successfully');
                router.reload();
            } else {
                // Handle "no waiting queue numbers" as an info message, not error
                if (data.message && data.message.includes('No waiting queue numbers found')) {
                    toast.info('No customers waiting in queue');
                } else {
                    toast.error(data.message || 'Failed to call next number');
                }
            }
        } catch (error) {
            toast.error('An error occurred while calling next number');
        } finally {
            setLoading(false);
        }
    };

    const updateQueueStatus = async (queueNumberId: number, action: string) => {
        setLoading(true);
        try {
            const response = await fetch(route(`queue.${action}`, queueNumberId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            const data = await response.json();
            if (data.status === 'success') {
                toast.success(`Queue number ${action} successfully`);
                router.reload();
            } else {
                toast.error(data.message || `Failed to ${action} queue number`);
            }
        } catch (error) {
            toast.error(`An error occurred while ${action} queue number`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Queue Management
                    </h2>
                    <Link href={route('queue.create')}>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Queue Type
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Queue Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Queues</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{queueTypes.length}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Waiting</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{getStatusCount('waiting')}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Called</CardTitle>
                                <Bell className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{getStatusCount('called')}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Serving</CardTitle>
                                <Users className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{getStatusCount('serving')}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                                <CheckCircle className="h-4 w-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{getStatusCount('completed')}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Queue Types */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {queueTypes.map((queueType) => (
                            <Card key={queueType.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {queueType.name}
                                                <Badge variant={queueType.is_active ? 'default' : 'secondary'}>
                                                    {queueType.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </CardTitle>
                                            <CardDescription>{queueType.description}</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={route('queue.show', queueType.id)}>
                                                <Button variant="outline" size="sm">View</Button>
                                            </Link>
                                            <Link href={route('queue.edit', queueType.id)}>
                                                <Button variant="outline" size="sm">Edit</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Current Queue Info */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Current Number:</span>
                                            <span className="font-mono text-lg font-bold">
                                                {queueType.prefix}{queueType.current_number.toString().padStart(3, '0')}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Waiting:</span>
                                            <Badge className={getStatusColor('waiting')}>
                                                {queueType.queue_numbers.filter(qn => qn.status === 'waiting').length}
                                            </Badge>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <Button 
                                                onClick={() => callNext(queueType.id)}
                                                disabled={
                                                    loading || 
                                                    !queueType.is_active || 
                                                    queueType.queue_numbers.filter(qn => qn.status === 'waiting').length === 0
                                                }
                                                className="flex-1"
                                                title={
                                                    queueType.queue_numbers.filter(qn => qn.status === 'waiting').length === 0 
                                                        ? 'No customers waiting in queue' 
                                                        : 'Call next customer'
                                                }
                                            >
                                                <Bell className="w-4 h-4 mr-2" />
                                                Call Next
                                            </Button>
                                            <Link href={route('queue.display')} className="flex-1">
                                                <Button variant="outline" className="w-full">
                                                    Display
                                                </Button>
                                            </Link>
                                        </div>

                                        {/* Recent Queue Numbers */}
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">Recent Numbers</h4>
                                            {queueType.queue_numbers.slice(0, 5).map((queueNumber) => (
                                                <div key={queueNumber.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm">{queueNumber.queue_number}</span>
                                                        {queueNumber.customer_name && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {queueNumber.customer_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getStatusColor(queueNumber.status)}>
                                                            {queueNumber.status}
                                                        </Badge>
                                                        {queueNumber.status === 'called' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => updateQueueStatus(queueNumber.id, 'start-serving')}
                                                            >
                                                                Start Serving
                                                            </Button>
                                                        )}
                                                        {queueNumber.status === 'serving' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => updateQueueStatus(queueNumber.id, 'complete')}
                                                            >
                                                                Complete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {queueTypes.length === 0 && (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No queue types found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Get started by creating your first queue type.
                                </p>
                                <Link href={route('queue.create')}>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Queue Type
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
