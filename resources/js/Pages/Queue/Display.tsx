import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface QueueType {
    id: number;
    name: string;
    description?: string;
    prefix: string;
    current_number: number;
    is_active: boolean;
}

interface QueueNumber {
    id: number;
    queue_number: string;
    customer_name?: string;
    status: 'waiting' | 'called' | 'serving' | 'completed' | 'cancelled';
    created_at: string;
    called_at?: string;
    serving_at?: string;
    queue_type_id: number;
}

interface StatusData {
    counts: {
        waiting: number;
        called: number;
        serving: number;
        completed: number;
        cancelled: number;
    };
    current_serving: QueueNumber[];
    next_waiting: QueueNumber[];
    called_numbers?: QueueNumber[];
}

interface Props extends PageProps {
    queueTypes: QueueType[];
    statusData: StatusData;
    selectedQueueType?: string;
}

export default function QueueDisplay({
    auth,
    queueTypes,
    statusData,
    selectedQueueType,
}: Props) {
    const [selectedQueue, setSelectedQueue] = useState<string>(
        selectedQueueType || 'all',
    );
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Auto-refresh data every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            window.location.reload();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting':
                return 'bg-yellow-500';
            case 'called':
                return 'bg-blue-500';
            case 'serving':
                return 'bg-green-500';
            case 'completed':
                return 'bg-gray-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'waiting':
                return 'Waiting';
            case 'called':
                return 'Called';
            case 'serving':
                return 'Serving';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    const filteredQueueTypes =
        selectedQueue && selectedQueue !== 'all'
            ? queueTypes.filter((qt) => qt.id.toString() === selectedQueue)
            : queueTypes;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <Head title="Queue Display" />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
                        Queue Management System
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-lg text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            <span>{currentTime.toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>{currentTime.toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Queue Type Selector */}
                <div className="mx-auto mb-8 max-w-md">
                    <Select
                        value={selectedQueue}
                        onValueChange={setSelectedQueue}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select queue type to display" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Queue Types</SelectItem>
                            {queueTypes.map((queueType) => (
                                <SelectItem
                                    key={queueType.id}
                                    value={queueType.id.toString()}
                                >
                                    {queueType.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Queue Types Display */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredQueueTypes.map((queueType) => {
                        const currentServing =
                            statusData.current_serving.filter(
                                (qn) => qn.queue_type_id === queueType.id,
                            );
                        const calledNumbers = (
                            statusData.called_numbers || []
                        ).filter((qn) => qn.queue_type_id === queueType.id);
                        const nextWaiting = statusData.next_waiting
                            .filter((qn) => qn.queue_type_id === queueType.id)
                            .slice(0, 5);

                        return (
                            <Card
                                key={queueType.id}
                                className="bg-white shadow-lg dark:bg-gray-800"
                            >
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {queueType.name}
                                    </CardTitle>
                                    {queueType.description && (
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {queueType.description}
                                        </p>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Called Numbers - Show prominently */}
                                    {calledNumbers.length > 0 && (
                                        <div className="text-center">
                                            <h3 className="mb-2 text-lg font-semibold text-blue-700 dark:text-blue-300">
                                                🔔 Please Come Forward
                                            </h3>
                                            <div className="space-y-2">
                                                {calledNumbers.map(
                                                    (queueNumber) => (
                                                        <div
                                                            key={queueNumber.id}
                                                            className="animate-pulse rounded-lg border-2 border-blue-300 bg-blue-100 p-4 dark:border-blue-600 dark:bg-blue-900"
                                                        >
                                                            <div className="font-mono text-3xl font-bold text-blue-800 dark:text-blue-200">
                                                                {
                                                                    queueNumber.queue_number
                                                                }
                                                            </div>
                                                            {queueNumber.customer_name && (
                                                                <div className="text-sm text-blue-600 dark:text-blue-300">
                                                                    {
                                                                        queueNumber.customer_name
                                                                    }
                                                                </div>
                                                            )}
                                                            <div className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                                                                Called - Please
                                                                proceed to
                                                                counter
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Current Serving */}
                                    <div className="text-center">
                                        <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                                            Now Serving
                                        </h3>
                                        {currentServing.length > 0 ? (
                                            <div className="space-y-2">
                                                {currentServing.map(
                                                    (queueNumber) => (
                                                        <div
                                                            key={queueNumber.id}
                                                            className="rounded-lg bg-green-100 p-4 dark:bg-green-900"
                                                        >
                                                            <div className="font-mono text-3xl font-bold text-green-800 dark:text-green-200">
                                                                {
                                                                    queueNumber.queue_number
                                                                }
                                                            </div>
                                                            {queueNumber.customer_name && (
                                                                <div className="text-sm text-green-600 dark:text-green-300">
                                                                    {
                                                                        queueNumber.customer_name
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
                                                <div className="text-lg text-gray-500 dark:text-gray-400">
                                                    {calledNumbers.length > 0
                                                        ? 'Waiting for called customer to proceed'
                                                        : 'No one currently being served'}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Next in Line */}
                                    <div>
                                        <h3 className="mb-3 text-center text-lg font-semibold text-gray-700 dark:text-gray-300">
                                            Next in Line
                                        </h3>
                                        {nextWaiting.length > 0 ? (
                                            <div className="space-y-2">
                                                {nextWaiting.map(
                                                    (queueNumber, index) => (
                                                        <div
                                                            key={queueNumber.id}
                                                            className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className={`h-8 w-8 rounded-full ${getStatusColor(queueNumber.status)} flex items-center justify-center text-sm font-bold text-white`}
                                                                >
                                                                    {index + 1}
                                                                </div>
                                                                <div className="font-mono text-lg font-bold">
                                                                    {
                                                                        queueNumber.queue_number
                                                                    }
                                                                </div>
                                                            </div>
                                                            {queueNumber.customer_name && (
                                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                                    {
                                                                        queueNumber.customer_name
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                                                No one waiting
                                            </div>
                                        )}
                                    </div>

                                    {/* Statistics */}
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="rounded bg-yellow-100 p-2 dark:bg-yellow-900">
                                            <div className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                                                {statusData.counts.waiting}
                                            </div>
                                            <div className="text-xs text-yellow-600 dark:text-yellow-300">
                                                Waiting
                                            </div>
                                        </div>
                                        <div className="rounded bg-blue-100 p-2 dark:bg-blue-900">
                                            <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                                                {statusData.counts.called}
                                            </div>
                                            <div className="text-xs text-blue-600 dark:text-blue-300">
                                                Called
                                            </div>
                                        </div>
                                        <div className="rounded bg-green-100 p-2 dark:bg-green-900">
                                            <div className="text-lg font-bold text-green-800 dark:text-green-200">
                                                {statusData.counts.serving}
                                            </div>
                                            <div className="text-xs text-green-600 dark:text-green-300">
                                                Serving
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
                    <p>
                        Queue Management System - Auto-refresh every 10 seconds
                    </p>
                </div>
            </div>
        </div>
    );
}
