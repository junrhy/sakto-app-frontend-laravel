import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { ArrowLeft, Edit, Users, Clock, CheckCircle, XCircle, Bell, Plus } from 'lucide-react';
import { toast } from 'sonner';

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

interface QueueType {
    id: number;
    name: string;
    description?: string;
    prefix: string;
    current_number: number;
    is_active: boolean;
    queue_numbers: QueueNumber[];
}

interface Props extends PageProps {
    queueType: QueueType;
}

export default function QueueShow({ auth, queueType }: Props) {
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(false);
    const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
    const [customerForm, setCustomerForm] = useState({
        customer_name: '',
        customer_contact: ''
    });

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

    const getStatusCount = (status: string) => {
        return queueType.queue_numbers.filter(qn => qn.status === status).length;
    };

    const getFilteredQueueNumbers = () => {
        if (activeTab === 'all') return queueType.queue_numbers;
        return queueType.queue_numbers.filter(qn => qn.status === activeTab);
    };

    const callNext = async () => {
        setLoading(true);
        try {
            const response = await fetch(route('queue.call-next'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ queue_type_id: queueType.id })
            });

            const data = await response.json();
            if (data.status === 'success') {
                toast.success('Next queue number called successfully');
                router.reload();
            } else {
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

    const addCustomer = async () => {
        setLoading(true);
        try {
            const response = await fetch(route('queue.create-number'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    queue_type_id: queueType.id,
                    customer_name: customerForm.customer_name || null,
                    customer_contact: customerForm.customer_contact || null
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                toast.success('Customer added to queue successfully');
                setShowAddCustomerDialog(false);
                setCustomerForm({ customer_name: '', customer_contact: '' });
                router.reload();
            } else {
                toast.error(data.message || 'Failed to add customer to queue');
            }
        } catch (error) {
            toast.error('An error occurred while adding customer to queue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('queue.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                                {queueType.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">{queueType.description}</p>
                        </div>
                    </div>
                    <Link href={route('queue.edit', queueType.id)}>
                        <Button>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Queue Type
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title={`Queue: ${queueType.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Queue Type Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Status</CardTitle>
                                <Badge variant={queueType.is_active ? 'default' : 'secondary'}>
                                    {queueType.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {queueType.prefix}{queueType.current_number.toString().padStart(3, '0')}
                                </div>
                                <p className="text-xs text-muted-foreground">Current Number</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Waiting</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{getStatusCount('waiting')}</div>
                                <p className="text-xs text-muted-foreground">Customers in queue</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Serving</CardTitle>
                                <Users className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{getStatusCount('serving')}</div>
                                <p className="text-xs text-muted-foreground">Currently serving</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                                <CheckCircle className="h-4 w-4 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{getStatusCount('completed')}</div>
                                <p className="text-xs text-muted-foreground">Total served</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mb-8">
                        <Button 
                            onClick={callNext}
                            disabled={
                                loading || 
                                !queueType.is_active || 
                                getStatusCount('waiting') === 0
                            }
                            size="lg"
                            title={
                                getStatusCount('waiting') === 0 
                                    ? 'No customers waiting in queue' 
                                    : 'Call next customer'
                            }
                        >
                            <Bell className="w-4 h-4 mr-2" />
                            Call Next Customer
                        </Button>
                        <Link href={route('queue.display')}>
                            <Button variant="outline" size="lg">
                                Display Screen
                            </Button>
                        </Link>
                        <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
                            <DialogTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="lg"
                                    disabled={!queueType.is_active}
                                    title={!queueType.is_active ? 'Queue is inactive' : 'Add customer to queue'}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Customer
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add Customer to Queue</DialogTitle>
                                    <DialogDescription>
                                        Add a new customer to the {queueType.name} queue. Customer information is optional.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={(e) => { e.preventDefault(); addCustomer(); }}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="customer_name" className="text-right">
                                                Name
                                            </Label>
                                            <Input
                                                id="customer_name"
                                                value={customerForm.customer_name}
                                                onChange={(e) => setCustomerForm(prev => ({
                                                    ...prev,
                                                    customer_name: e.target.value
                                                }))}
                                                placeholder="Customer name (optional)"
                                                className="col-span-3"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="customer_contact" className="text-right">
                                                Contact
                                            </Label>
                                            <Input
                                                id="customer_contact"
                                                value={customerForm.customer_contact}
                                                onChange={(e) => setCustomerForm(prev => ({
                                                    ...prev,
                                                    customer_contact: e.target.value
                                                }))}
                                                placeholder="Phone/Email (optional)"
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="bg-muted p-3 rounded-lg">
                                            <p className="text-sm text-muted-foreground">
                                                <strong>Next Number:</strong> {queueType.prefix}{(queueType.current_number + 1).toString().padStart(3, '0')}
                                            </p>
                                        </div>
                                    </div>
                                </form>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAddCustomerDialog(false)}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={addCustomer} disabled={loading}>
                                        {loading ? 'Adding...' : 'Add to Queue'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Queue Numbers */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Queue Numbers</CardTitle>
                            <CardDescription>
                                Manage and track all queue numbers for this queue type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-6">
                                    <TabsTrigger value="all">
                                        All ({queueType.queue_numbers.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="waiting">
                                        Waiting ({getStatusCount('waiting')})
                                    </TabsTrigger>
                                    <TabsTrigger value="called">
                                        Called ({getStatusCount('called')})
                                    </TabsTrigger>
                                    <TabsTrigger value="serving">
                                        Serving ({getStatusCount('serving')})
                                    </TabsTrigger>
                                    <TabsTrigger value="completed">
                                        Completed ({getStatusCount('completed')})
                                    </TabsTrigger>
                                    <TabsTrigger value="cancelled">
                                        Cancelled ({getStatusCount('cancelled')})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value={activeTab} className="mt-6">
                                    <div className="space-y-4">
                                        {getFilteredQueueNumbers().map((queueNumber) => (
                                            <div key={queueNumber.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="font-mono text-lg font-bold">
                                                        {queueNumber.queue_number}
                                                    </div>
                                                    <div>
                                                        {queueNumber.customer_name && (
                                                            <div className="font-medium">{queueNumber.customer_name}</div>
                                                        )}
                                                        {queueNumber.customer_contact && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {queueNumber.customer_contact}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-muted-foreground">
                                                            Created: {new Date(queueNumber.created_at).toLocaleString()}
                                                        </div>
                                                    </div>
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
                                                            disabled={loading}
                                                        >
                                                            Start Serving
                                                        </Button>
                                                    )}
                                                    {queueNumber.status === 'serving' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => updateQueueStatus(queueNumber.id, 'complete')}
                                                            disabled={loading}
                                                        >
                                                            Complete
                                                        </Button>
                                                    )}
                                                    {(queueNumber.status === 'waiting' || queueNumber.status === 'called') && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => updateQueueStatus(queueNumber.id, 'cancel')}
                                                            disabled={loading}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {getFilteredQueueNumbers().length === 0 && (
                                            <div className="text-center py-12">
                                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                <h3 className="text-lg font-medium mb-2">
                                                    No queue numbers found
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    {activeTab === 'all' 
                                                        ? 'No customers have joined this queue yet.'
                                                        : `No customers with status "${activeTab}" found.`
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
