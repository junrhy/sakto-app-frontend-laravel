import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { StatusUpdateFormData, Shipment } from "../types";

interface StatusUpdateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: StatusUpdateFormData) => void;
    formData: StatusUpdateFormData;
    onFormChange: (data: StatusUpdateFormData) => void;
}

export default function StatusUpdateDialog({
    isOpen,
    onClose,
    onSubmit,
    formData,
    onFormChange
}: StatusUpdateDialogProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Shipment Status</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => onFormChange({
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
                            onChange={(e) => onFormChange({
                                ...formData,
                                location: e.target.value
                            })}
                            placeholder="Enter current location"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes</label>
                        <Input
                            value={formData.notes}
                            onChange={(e) => onFormChange({
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
