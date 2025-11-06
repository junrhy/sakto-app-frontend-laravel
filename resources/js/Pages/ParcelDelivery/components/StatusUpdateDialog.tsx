import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface StatusUpdateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    deliveryId: number;
    currentStatus: string;
    onSuccess?: () => void;
}

export default function StatusUpdateDialog({
    isOpen,
    onClose,
    deliveryId,
    currentStatus,
    onSuccess,
}: StatusUpdateDialogProps) {
    const [status, setStatus] = useState<string>(currentStatus);
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStatus(currentStatus);
            setLocation('');
            setNotes('');
        }
    }, [isOpen, currentStatus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/parcel-delivery/${deliveryId}/update-status`, {
                status,
                location: location || null,
                notes: notes || null,
            });

            if (response.data.success) {
                toast.success('Status updated successfully');
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(response.data.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error('Failed to update status');
            console.error('Error updating status:', error);
        } finally {
            setLoading(false);
        }
    };

    const getNextStatuses = (current: string): string[] => {
        const statusFlow: Record<string, string[]> = {
            pending: ['confirmed', 'scheduled', 'cancelled'],
            confirmed: ['scheduled', 'out_for_pickup', 'cancelled'],
            scheduled: ['out_for_pickup', 'cancelled'],
            out_for_pickup: ['picked_up', 'failed', 'cancelled'],
            picked_up: ['at_warehouse', 'in_transit', 'on_hold', 'cancelled'],
            at_warehouse: ['in_transit', 'out_for_delivery', 'on_hold', 'cancelled'],
            in_transit: ['out_for_delivery', 'at_warehouse', 'on_hold', 'cancelled'],
            out_for_delivery: ['delivered', 'delivery_attempted', 'failed', 'cancelled'],
            delivery_attempted: ['out_for_delivery', 'returned', 'failed', 'cancelled'],
            returned: ['returned_to_sender', 'out_for_delivery'],
            returned_to_sender: [],
            on_hold: ['out_for_pickup', 'picked_up', 'at_warehouse', 'in_transit', 'out_for_delivery', 'cancelled'],
            failed: ['out_for_pickup', 'picked_up', 'in_transit', 'out_for_delivery', 'returned', 'cancelled'],
            delivered: [],
            cancelled: [],
        };
        return statusFlow[current] || [];
    };

    const availableStatuses = getNextStatuses(currentStatus);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-100">
                        Update Delivery Status
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={status}
                            onValueChange={setStatus}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {availableStatuses.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location (Optional)</Label>
                        <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Enter current location"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional notes"
                            rows={3}
                        />
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
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Status'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

