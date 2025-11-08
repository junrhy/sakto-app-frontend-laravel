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
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';
import { FoodDeliveryOrder, StatusUpdateFormData } from '../types';

interface OrderStatusDialogProps {
    order: FoodDeliveryOrder;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    clientIdentifier: string;
}

export default function OrderStatusDialog({
    order,
    open,
    onOpenChange,
    onSuccess,
    clientIdentifier,
}: OrderStatusDialogProps) {
    const [formData, setFormData] = useState<StatusUpdateFormData>({
        order_status: order.order_status,
        location: '',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const getNextStatuses = (current: string): string[] => {
        const statusFlow: Record<string, string[]> = {
            pending: ['accepted', 'cancelled'],
            accepted: ['preparing', 'cancelled'],
            preparing: ['ready', 'cancelled'],
            ready: ['assigned', 'cancelled'],
            assigned: ['out_for_delivery', 'cancelled'],
            out_for_delivery: ['delivered', 'cancelled'],
            delivered: [],
            cancelled: [],
        };
        return statusFlow[current] || [];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await axios.put(
                `/food-delivery/orders/${order.id}/update-status`,
                {
                    ...formData,
                    client_identifier: clientIdentifier,
                },
            );

            if (response.data.success) {
                toast.success('Order status updated successfully');
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(
                    response.data.message || 'Failed to update order status',
                );
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    'Failed to update order status',
            );
        } finally {
            setSubmitting(false);
        }
    };

    const formatStatus = (status: string) => {
        return status
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const nextStatuses = getNextStatuses(order.order_status);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Order Status</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="order_status">New Status</Label>
                        <Select
                            value={formData.order_status}
                            onValueChange={(value: any) =>
                                setFormData({
                                    ...formData,
                                    order_status: value,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {nextStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {formatStatus(status)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="location">Location (optional)</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    location: e.target.value,
                                })
                            }
                            placeholder="Current location"
                        />
                    </div>

                    <div>
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Input
                            id="notes"
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    notes: e.target.value,
                                })
                            }
                            placeholder="Additional notes"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Updating...' : 'Update Status'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
