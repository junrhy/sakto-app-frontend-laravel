import { useState, useEffect } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { StatusUpdateFormData, Shipment } from "../types";
import { useShipmentTracking } from "../hooks";

interface StatusUpdateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    shipmentId: string;
}

export default function StatusUpdateDialog({
    isOpen,
    onClose,
    shipmentId
}: StatusUpdateDialogProps) {
    const { updateShipmentStatus } = useShipmentTracking();
    const [formData, setFormData] = useState<StatusUpdateFormData>({
        status: 'In Transit',
        location: '',
        notes: ''
    });

    // Reset form when dialog opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                status: 'In Transit',
                location: '',
                notes: ''
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateShipmentStatus(shipmentId, formData);
            onClose();
        } catch (error) {
            console.error('Failed to update shipment status:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Shipment Status</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({
                                ...formData,
                                status: value as Shipment['status']
                            })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Scheduled">Scheduled</SelectItem>
                                <SelectItem value="In Transit">In Transit</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Delayed">Delayed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Current Location</label>
                        <Input
                            value={formData.location}
                            onChange={(e) => setFormData({
                                ...formData,
                                location: e.target.value
                            })}
                            placeholder="Enter current location"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes</label>
                        <Input
                            value={formData.notes}
                            onChange={(e) => setFormData({
                                ...formData,
                                notes: e.target.value
                            })}
                            placeholder="Add any additional notes"
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Update Status
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
