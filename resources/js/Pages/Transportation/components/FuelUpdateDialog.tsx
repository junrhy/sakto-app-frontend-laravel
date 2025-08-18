import { useState, useEffect } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { FuelUpdateFormData } from "../types";
import { useFleetManagement } from "../hooks";

interface FuelUpdateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    truckId: string;
}

export default function FuelUpdateDialog({
    isOpen,
    onClose,
    truckId
}: FuelUpdateDialogProps) {
    const { updateFuelLevel } = useFleetManagement();
    const [formData, setFormData] = useState<FuelUpdateFormData>({
        litersAdded: '',
        cost: '',
        location: ''
    });

    // Reset form when dialog opens with new truck
    useEffect(() => {
        if (isOpen) {
            setFormData({
                litersAdded: '',
                cost: '',
                location: ''
            });
        }
    }, [isOpen, truckId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateFuelLevel(truckId, formData);
            onClose();
        } catch (error) {
            console.error('Failed to update fuel level:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Fuel Level</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Liters Added</label>
                        <Input
                            type="number"
                            value={formData.litersAdded}
                            onChange={(e) => setFormData({
                                ...formData,
                                litersAdded: e.target.value
                            })}
                            placeholder="Enter liters added"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Cost</label>
                        <Input
                            type="number"
                            value={formData.cost}
                            onChange={(e) => setFormData({
                                ...formData,
                                cost: e.target.value
                            })}
                            placeholder="Enter fuel cost"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input
                            value={formData.location}
                            onChange={(e) => setFormData({
                                ...formData,
                                location: e.target.value
                            })}
                            placeholder="Enter fueling location"
                            required
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
                            Update Fuel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
