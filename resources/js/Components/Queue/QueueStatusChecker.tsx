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
import { CheckCircle, Clock, Search, Ticket, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface QueueNumber {
    id: number;
    queue_number: string;
    customer_name?: string;
    status: 'waiting' | 'called' | 'serving' | 'completed' | 'cancelled';
    created_at: string;
    called_at?: string;
    serving_at?: string;
    queue_type: {
        id: number;
        name: string;
        prefix: string;
    };
}

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onQueueFound?: (queueNumber: QueueNumber) => void;
}

export default function QueueStatusChecker() {
    const [queueNumber, setQueueNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [foundQueue, setFoundQueue] = useState<QueueNumber | null>(null);
    const [error, setError] = useState('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'called':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'serving':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'completed':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'waiting':
                return <Clock className="h-4 w-4" />;
            case 'called':
                return <Ticket className="h-4 w-4" />;
            case 'serving':
                return <CheckCircle className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const getStatusMessage = (status: string) => {
        switch (status) {
            case 'waiting':
                return 'Please wait for your turn';
            case 'called':
                return 'Your number has been called! Please proceed to the counter.';
            case 'serving':
                return 'You are currently being served';
            case 'completed':
                return 'Your service has been completed';
            case 'cancelled':
                return 'Your queue number has been cancelled';
            default:
                return 'Unknown status';
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!queueNumber.trim()) {
            toast.error('Please enter a queue number');
            return;
        }

        setLoading(true);
        setError('');
        setFoundQueue(null);

        try {
            // This would need to be implemented as a public API endpoint
            // For now, we'll simulate the search
            toast.error('Queue status checking feature coming soon');
        } catch (error) {
            setError('Failed to find queue number');
            toast.error('Failed to find queue number');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Check Queue Status
                </CardTitle>
                <CardDescription>
                    Enter your queue number to check your current status
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="queue_number">Queue Number</Label>
                        <Input
                            id="queue_number"
                            type="text"
                            value={queueNumber}
                            onChange={(e) =>
                                setQueueNumber(e.target.value.toUpperCase())
                            }
                            placeholder="e.g., Q001, A002, P003"
                            className="font-mono"
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Checking...' : 'Check Status'}
                    </Button>
                </form>

                {foundQueue && (
                    <div className="mt-6 rounded-lg bg-muted p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Ticket className="h-5 w-5" />
                                <span className="font-mono text-lg font-bold">
                                    {foundQueue.queue_number}
                                </span>
                            </div>
                            <Badge
                                className={getStatusColor(foundQueue.status)}
                            >
                                <div className="flex items-center gap-1">
                                    {getStatusIcon(foundQueue.status)}
                                    {foundQueue.status.charAt(0).toUpperCase() +
                                        foundQueue.status.slice(1)}
                                </div>
                            </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-medium">Service:</span>{' '}
                                {foundQueue.queue_type.name}
                            </div>
                            {foundQueue.customer_name && (
                                <div>
                                    <span className="font-medium">Name:</span>{' '}
                                    {foundQueue.customer_name}
                                </div>
                            )}
                            <div>
                                <span className="font-medium">Status:</span>{' '}
                                {getStatusMessage(foundQueue.status)}
                            </div>
                            {foundQueue.called_at && (
                                <div>
                                    <span className="font-medium">
                                        Called at:
                                    </span>{' '}
                                    {new Date(
                                        foundQueue.called_at,
                                    ).toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
