import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ParcelDelivery } from './types';
import { ArrowLeftIcon, PackageIcon, EditIcon, TrashIcon, UserPlusIcon, RefreshCwIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { useState } from 'react';
import StatusUpdateDialog from './components/StatusUpdateDialog';
import CourierAssignmentDialog from './components/CourierAssignmentDialog';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {
    delivery: ParcelDelivery;
}

export default function ParcelDeliveryShow({ auth, delivery: initialDelivery }: Props) {
    const [delivery, setDelivery] = useState<ParcelDelivery>(initialDelivery);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [courierDialogOpen, setCourierDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const formatCurrency = (amount: number) => {
        let currency: { symbol: string; thousands_separator?: string; decimal_separator?: string };
        const appCurrency = (auth.user as any)?.app_currency;
        if (appCurrency) {
            if (typeof appCurrency === 'string') {
                currency = JSON.parse(appCurrency);
            } else {
                currency = appCurrency;
            }
        } else {
            currency = { symbol: '₱', thousands_separator: ',', decimal_separator: '.' };
        }
        return `${currency.symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const refreshDelivery = async () => {
        setLoading(true);
        try {
            router.reload({ only: ['delivery'] });
        } catch (error: any) {
            toast.error('Failed to refresh delivery');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = () => {
        refreshDelivery();
    };

    const handleCourierAssign = () => {
        refreshDelivery();
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this delivery? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.delete(`/parcel-delivery/${delivery.id}`);
            if (response.data.success) {
                toast.success('Delivery deleted successfully');
                router.visit('/parcel-delivery');
            } else {
                toast.error(response.data.message || 'Failed to delete delivery');
            }
        } catch (error: any) {
            toast.error('Failed to delete delivery');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'scheduled':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'out_for_pickup':
                return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
            case 'picked_up':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'at_warehouse':
                return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
            case 'in_transit':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'out_for_delivery':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'delivery_attempted':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            case 'delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'returned':
                return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
            case 'returned_to_sender':
                return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
            case 'on_hold':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="sm" onClick={() => router.visit('/parcel-delivery')}>
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                        <PackageIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                            Delivery Details
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {delivery.delivery_reference}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshDelivery}
                            disabled={loading}
                        >
                            <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setStatusDialogOpen(true)}
                                >
                                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                                    Update Status
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCourierDialogOpen(true)}
                                >
                                    <UserPlusIcon className="h-4 w-4 mr-2" />
                                    {delivery.courier_id ? 'Change Courier' : 'Assign Courier'}
                                </Button>
                            </>
                        )}
                        {delivery.status === 'pending' && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Delivery ${delivery.delivery_reference}`} />

            <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sender Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <span className="font-medium">Name:</span> {delivery.sender_name}
                            </div>
                            <div>
                                <span className="font-medium">Phone:</span> {delivery.sender_phone}
                            </div>
                            {delivery.sender_email && (
                                <div>
                                    <span className="font-medium">Email:</span> {delivery.sender_email}
                                </div>
                            )}
                            <div>
                                <span className="font-medium">Address:</span> {delivery.sender_address}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recipient Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <span className="font-medium">Name:</span> {delivery.recipient_name}
                            </div>
                            <div>
                                <span className="font-medium">Phone:</span> {delivery.recipient_phone}
                            </div>
                            {delivery.recipient_email && (
                                <div>
                                    <span className="font-medium">Email:</span> {delivery.recipient_email}
                                </div>
                            )}
                            <div>
                                <span className="font-medium">Address:</span> {delivery.recipient_address}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Package Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <span className="font-medium">Description:</span> {delivery.package_description}
                            </div>
                            <div>
                                <span className="font-medium">Weight:</span> {delivery.package_weight} kg
                            </div>
                            {(delivery.package_length || delivery.package_width || delivery.package_height) && (
                                <div>
                                    <span className="font-medium">Dimensions:</span>{' '}
                                    {delivery.package_length} x {delivery.package_width} x {delivery.package_height} cm
                                </div>
                            )}
                            {delivery.package_value && (
                                <div>
                                    <span className="font-medium">Declared Value:</span> {formatCurrency(delivery.package_value)}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <span className="font-medium">Type:</span> {delivery.delivery_type}
                            </div>
                            <div>
                                <span className="font-medium">Status:</span>{' '}
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(delivery.status)}`}>
                                    {delivery.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium">Pickup:</span> {delivery.pickup_date} at {delivery.pickup_time}
                            </div>
                            {delivery.courier_name && (
                                <div>
                                    <span className="font-medium">Courier:</span> {delivery.courier_name} ({delivery.courier_phone})
                                </div>
                            )}
                            {delivery.estimated_cost && (
                                <div>
                                    <span className="font-medium">Estimated Cost:</span> {formatCurrency(delivery.estimated_cost)}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {delivery.trackings && delivery.trackings.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tracking History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {delivery.trackings.map((tracking) => (
                                    <div key={tracking.id} className="flex items-start space-x-4 border-l-2 pl-4">
                                        <div className="flex-1">
                                            <div className="font-medium">{tracking.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                                            {tracking.location && (
                                                <div className="text-sm text-gray-500">Location: {tracking.location}</div>
                                            )}
                                            {tracking.notes && (
                                                <div className="text-sm text-gray-500">{tracking.notes}</div>
                                            )}
                                            <div className="text-xs text-gray-400 mt-1">
                                                {new Date(tracking.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Action Dialogs */}
                <StatusUpdateDialog
                    isOpen={statusDialogOpen}
                    onClose={() => setStatusDialogOpen(false)}
                    deliveryId={delivery.id}
                    currentStatus={delivery.status}
                    onSuccess={handleStatusUpdate}
                />

                <CourierAssignmentDialog
                    isOpen={courierDialogOpen}
                    onClose={() => setCourierDialogOpen(false)}
                    deliveryId={delivery.id}
                    currentCourierId={delivery.courier_id}
                    onSuccess={handleCourierAssign}
                />
            </div>
        </AuthenticatedLayout>
    );
}

