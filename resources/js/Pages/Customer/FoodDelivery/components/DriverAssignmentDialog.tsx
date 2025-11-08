import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FoodDeliveryDriver, FoodDeliveryOrder } from '../types';

interface DriverAssignmentDialogProps {
    order: FoodDeliveryOrder;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    clientIdentifier: string;
}

export default function DriverAssignmentDialog({
    order,
    open,
    onOpenChange,
    onSuccess,
    clientIdentifier,
}: DriverAssignmentDialogProps) {
    const [drivers, setDrivers] = useState<FoodDeliveryDriver[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            fetchAvailableDrivers();
        }
    }, [open]);

    const fetchAvailableDrivers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/food-delivery/drivers/list', {
                params: {
                    client_identifier: clientIdentifier,
                    status: 'available',
                },
            });

            if (response.data.success) {
                setDrivers(response.data.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load available drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleFindNearest = async () => {
        if (!order.customer_coordinates) {
            toast.error('Customer coordinates not available');
            return;
        }

        const [lat, lng] = order.customer_coordinates.split(',').map(Number);
        if (isNaN(lat) || isNaN(lng)) {
            toast.error('Invalid customer coordinates');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(
                '/food-delivery/drivers/find-nearest',
                {
                    params: {
                        client_identifier: clientIdentifier,
                        latitude: lat,
                        longitude: lng,
                    },
                },
            );

            if (response.data.success && response.data.data.driver) {
                setSelectedDriverId(response.data.data.driver.id.toString());
                toast.success(
                    `Nearest driver found: ${response.data.data.driver.name}`,
                );
            } else {
                toast.error('No available drivers found nearby');
            }
        } catch (error: any) {
            toast.error('Failed to find nearest driver');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDriverId) {
            toast.error('Please select a driver');
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post(
                `/food-delivery/orders/${order.id}/assign-driver`,
                {
                    driver_id: parseInt(selectedDriverId),
                    client_identifier: clientIdentifier,
                },
            );

            if (response.data.success) {
                toast.success('Driver assigned successfully');
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(response.data.message || 'Failed to assign driver');
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Failed to assign driver',
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Driver</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <Label htmlFor="driver">Select Driver</Label>
                            {order.customer_coordinates && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleFindNearest}
                                    disabled={loading}
                                >
                                    Find Nearest
                                </Button>
                            )}
                        </div>
                        <Select
                            value={selectedDriverId}
                            onValueChange={setSelectedDriverId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a driver" />
                            </SelectTrigger>
                            <SelectContent>
                                {drivers.map((driver) => (
                                    <SelectItem
                                        key={driver.id}
                                        value={driver.id.toString()}
                                    >
                                        {driver.name} - {driver.phone}{' '}
                                        {driver.vehicle_type
                                            ? `(${driver.vehicle_type})`
                                            : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {drivers.length === 0 && !loading && (
                            <p className="mt-2 text-sm text-gray-500">
                                No available drivers found
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting || !selectedDriverId}
                        >
                            {submitting ? 'Assigning...' : 'Assign Driver'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
