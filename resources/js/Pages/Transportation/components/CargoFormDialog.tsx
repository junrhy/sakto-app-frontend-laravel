import { useState, useEffect } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { CargoFormData, CargoItem } from "../types";

interface CargoFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CargoFormData) => void;
    initialData?: CargoFormData;
}

export default function CargoFormDialog({
    isOpen,
    onClose,
    onSubmit,
    initialData = {
        name: '',
        quantity: '',
        unit: 'pieces' as CargoItem['unit'],
        description: '',
        specialHandling: '',
        temperature: '',
        humidity: ''
    }
}: CargoFormDialogProps) {
    const [formData, setFormData] = useState<CargoFormData>(initialData);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData);
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData.name ? 'Edit Cargo' : 'Add New Cargo'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter cargo name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Quantity</label>
                        <Input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            placeholder="Enter quantity"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Unit</label>
                        <Select
                            value={formData.unit}
                            onValueChange={(value) => setFormData({ ...formData, unit: value as CargoItem['unit'] })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="kg">Kilograms</SelectItem>
                                <SelectItem value="pieces">Pieces</SelectItem>
                                <SelectItem value="pallets">Pallets</SelectItem>
                                <SelectItem value="boxes">Boxes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter description"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Special Handling</label>
                        <Input
                            value={formData.specialHandling}
                            onChange={(e) => setFormData({ ...formData, specialHandling: e.target.value })}
                            placeholder="Enter special handling requirements"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Temperature (°C)</label>
                        <Input
                            type="number"
                            value={formData.temperature}
                            onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                            placeholder="Enter required temperature"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Humidity (%)</label>
                        <Input
                            type="number"
                            value={formData.humidity}
                            onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                            placeholder="Enter required humidity"
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {initialData.name ? 'Save Changes' : 'Add Cargo'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
