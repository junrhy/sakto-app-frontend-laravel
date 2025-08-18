import { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { PlusIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { CargoItem, CargoFormData, Shipment, Truck } from "../types";
import CargoFormDialog from "./CargoFormDialog";

interface CargoMonitoringProps {
    cargoItems: CargoItem[];
    shipments: Shipment[];
    trucks: Truck[];
    onAddCargoItem: (shipmentId: string, data: CargoFormData) => void;
    onUpdateCargoStatus: (cargoId: string, status: CargoItem['status']) => void;
    onUpdateCargoItem: (cargoName: string, data: CargoFormData) => void;
    onDeleteCargoItem: (cargoId: string) => void;
}

export default function CargoMonitoring({
    cargoItems,
    shipments,
    trucks,
    onAddCargoItem,
    onUpdateCargoStatus,
    onUpdateCargoItem,
    onDeleteCargoItem
}: CargoMonitoringProps) {
    const [isCargoFormOpen, setIsCargoFormOpen] = useState(false);
    const [editingCargo, setEditingCargo] = useState<CargoFormData | null>(null);
    const [cargoSearch, setCargoSearch] = useState('');

    const handleAddCargo = (data: CargoFormData) => {
        onAddCargoItem('1', data); // You might want to select a shipment ID here
        setIsCargoFormOpen(false);
    };

    const handleEditCargo = (cargo: CargoItem) => {
        setEditingCargo({
            name: cargo.name,
            quantity: cargo.quantity.toString(),
            unit: cargo.unit,
            description: cargo.description || '',
            specialHandling: cargo.specialHandling || '',
            temperature: cargo.temperature?.toString() || '',
            humidity: cargo.humidity?.toString() || ''
        });
    };

    const handleUpdateCargo = (data: CargoFormData) => {
        if (!editingCargo) return;
        onUpdateCargoItem(editingCargo.name, data);
        setEditingCargo(null);
    };

    const handleDeleteCargo = (cargoId: string) => {
        if (confirm('Are you sure you want to delete this cargo item?')) {
            onDeleteCargoItem(cargoId);
        }
    };

    const filteredCargoItems = cargoItems.filter(item => {
        const searchTerm = cargoSearch.toLowerCase();
        return (
            item.name.toLowerCase().includes(searchTerm) ||
            item.description?.toLowerCase().includes(searchTerm) ||
            item.specialHandling?.toLowerCase().includes(searchTerm)
        );
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Cargo Monitoring</CardTitle>
                    <Button onClick={() => setIsCargoFormOpen(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Cargo
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex-1 max-w-sm">
                        <Input
                            placeholder="Search cargo..."
                            value={cargoSearch}
                            onChange={(e) => setCargoSearch(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shipment</TableHead>
                                <TableHead>Truck Details</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Conditions</TableHead>
                                <TableHead>Special Handling</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCargoItems.map((item) => {
                                const shipment = shipments.find(s => s.id === item.shipmentId);
                                const truck = shipment ? trucks.find(t => t.id === shipment.truckId) : null;
                                
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {shipment ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {shipment.origin} → {shipment.destination}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        ID: {shipment.id}
                                                    </span>
                                                </div>
                                            ) : 'Unknown Shipment'}
                                        </TableCell>
                                        <TableCell>
                                            {truck ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {truck.plateNumber}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {truck.model}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Driver: {truck.driver || 'Unassigned'}
                                                    </span>
                                                    {truck.driverContact && (
                                                        <span className="text-xs text-muted-foreground">
                                                            📞 {truck.driverContact}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : 'No Truck Assigned'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.name}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {item.description}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.quantity} {item.unit}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                item.status === 'Delivered' ? 'default' :
                                                item.status === 'In Transit' ? 'secondary' :
                                                item.status === 'Damaged' ? 'destructive' :
                                                'outline'
                                            }>
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                {item.temperature && (
                                                    <span className="text-sm">
                                                        🌡️ {item.temperature}°C
                                                    </span>
                                                )}
                                                {item.humidity && (
                                                    <span className="text-sm">
                                                        💧 {item.humidity}%
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.specialHandling && (
                                                <Badge variant="outline">
                                                    {item.specialHandling}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Select
                                                    value={item.status}
                                                    onValueChange={(value) => 
                                                        onUpdateCargoStatus(item.id, value as CargoItem['status'])
                                                    }
                                                >
                                                    <SelectTrigger className="w-[130px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Loaded">Loaded</SelectItem>
                                                        <SelectItem value="In Transit">In Transit</SelectItem>
                                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                                        <SelectItem value="Damaged">Damaged</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditCargo(item)}
                                                >
                                                    <Pencil2Icon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteCargo(item.id)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CargoFormDialog
                isOpen={isCargoFormOpen}
                onClose={() => setIsCargoFormOpen(false)}
                onSubmit={handleAddCargo}
            />
            {editingCargo && (
                <CargoFormDialog
                    isOpen={!!editingCargo}
                    onClose={() => setEditingCargo(null)}
                    onSubmit={handleUpdateCargo}
                    initialData={editingCargo}
                />
            )}
        </Card>
    );
}
