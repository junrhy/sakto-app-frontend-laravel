import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { PackageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ParcelDelivery } from './types';

interface Props extends PageProps {
    reference?: string;
}

export default function ParcelDeliveryTrack({
    reference: initialReference,
}: Props) {
    const [reference, setReference] = useState(initialReference || '');
    const [delivery, setDelivery] = useState<ParcelDelivery | null>(null);
    const [loading, setLoading] = useState(false);

    const trackDelivery = async () => {
        if (!reference.trim()) {
            toast.error('Please enter a delivery reference');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(
                `/parcel-delivery/track-by-reference/${reference}`,
            );
            if (response.data.success) {
                setDelivery(response.data.data);
            } else {
                toast.error('Delivery not found');
                setDelivery(null);
            }
        } catch (error: any) {
            toast.error('Failed to track delivery');
            setDelivery(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialReference) {
            trackDelivery();
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
            <Head title="Track Delivery" />

            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <PackageIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                        Track Your Delivery
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Enter your delivery reference number to track your
                        parcel
                    </p>
                </div>

                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <Input
                                placeholder="Enter delivery reference (e.g., PD20241106ABC123)"
                                value={reference}
                                onChange={(e) =>
                                    setReference(e.target.value.toUpperCase())
                                }
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && trackDelivery()
                                }
                                className="flex-1"
                            />
                            <Button onClick={trackDelivery} disabled={loading}>
                                {loading ? 'Tracking...' : 'Track'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {delivery && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <span className="font-medium">
                                        Reference:
                                    </span>{' '}
                                    {delivery.delivery_reference}
                                </div>
                                <div>
                                    <span className="font-medium">Status:</span>{' '}
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                            delivery.status === 'delivered'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : delivery.status ===
                                                    'in_transit'
                                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                  : delivery.status ===
                                                      'picked_up'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}
                                    >
                                        {delivery.status
                                            .replace(/_/g, ' ')
                                            .replace(/\b\w/g, (l) =>
                                                l.toUpperCase(),
                                            )}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium">From:</span>{' '}
                                    {delivery.sender_address}
                                </div>
                                <div>
                                    <span className="font-medium">To:</span>{' '}
                                    {delivery.recipient_address}
                                </div>
                            </CardContent>
                        </Card>

                        {delivery.trackings &&
                            delivery.trackings.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tracking History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {delivery.trackings.map(
                                                (tracking) => (
                                                    <div
                                                        key={tracking.id}
                                                        className="flex items-start space-x-4 border-l-2 pl-4"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="font-medium">
                                                                {tracking.status
                                                                    .replace(
                                                                        /_/g,
                                                                        ' ',
                                                                    )
                                                                    .replace(
                                                                        /\b\w/g,
                                                                        (l) =>
                                                                            l.toUpperCase(),
                                                                    )}
                                                            </div>
                                                            {tracking.location && (
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    Location:{' '}
                                                                    {
                                                                        tracking.location
                                                                    }
                                                                </div>
                                                            )}
                                                            {tracking.notes && (
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {
                                                                        tracking.notes
                                                                    }
                                                                </div>
                                                            )}
                                                            <div className="mt-1 text-xs text-gray-400">
                                                                {new Date(
                                                                    tracking.timestamp,
                                                                ).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                    </div>
                )}
            </div>
        </div>
    );
}
