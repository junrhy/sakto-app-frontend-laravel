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
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { ParcelDeliveryCourier } from '../types';

interface CourierAssignmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    deliveryId: number;
    currentCourierId?: number;
    onSuccess?: () => void;
}

export default function CourierAssignmentDialog({
    isOpen,
    onClose,
    deliveryId,
    currentCourierId,
    onSuccess,
}: CourierAssignmentDialogProps) {
    const [couriers, setCouriers] = useState<ParcelDeliveryCourier[]>([]);
    const [selectedCourierId, setSelectedCourierId] = useState<string>(currentCourierId?.toString() || '');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchCouriers();
            setSelectedCourierId(currentCourierId?.toString() || '');
        }
    }, [isOpen, currentCourierId]);

    const fetchCouriers = async () => {
        setFetching(true);
        try {
            const response = await axios.get('/parcel-delivery/couriers/list');
            if (response.data.success) {
                setCouriers(response.data.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load couriers');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourierId) {
            toast.error('Please select a courier');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`/parcel-delivery/${deliveryId}/assign-courier`, {
                courier_id: parseInt(selectedCourierId),
            });

            if (response.data.success) {
                toast.success('Courier assigned successfully');
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(response.data.message || 'Failed to assign courier');
            }
        } catch (error: any) {
            toast.error('Failed to assign courier');
            console.error('Error assigning courier:', error);
        } finally {
            setLoading(false);
        }
    };

    const availableCouriers = couriers.filter(c => c.status === 'available' || c.id === currentCourierId);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-100">
                        Assign Courier
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="courier">Select Courier</Label>
                        <Select
                            value={selectedCourierId}
                            onValueChange={setSelectedCourierId}
                            disabled={fetching}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={fetching ? 'Loading couriers...' : 'Select a courier'} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCouriers.length === 0 ? (
                                    <SelectItem value="none" disabled>No available couriers</SelectItem>
                                ) : (
                                    availableCouriers.map((courier) => (
                                        <SelectItem key={courier.id} value={courier.id.toString()}>
                                            {courier.name} ({courier.phone}) {courier.status === 'busy' ? '(Busy)' : ''}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {availableCouriers.length === 0 && !fetching && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No available couriers. Please add couriers first.
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading || !selectedCourierId || fetching}
                        >
                            {loading ? 'Assigning...' : 'Assign Courier'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

