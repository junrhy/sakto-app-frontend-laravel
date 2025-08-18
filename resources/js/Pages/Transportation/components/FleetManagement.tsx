import { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { PlusIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { Truck, TruckFormData, FuelUpdate, FuelUpdateFormData } from "../types";
import FuelUpdateDialog from "./FuelUpdateDialog";
import FuelHistory from "./FuelHistory";

interface FleetManagementProps {
    trucks: Truck[];
    fuelHistory: FuelUpdate[];
    onAddTruck: (truck: { plateNumber: string; model: string; capacity: string }) => void;
    onEditTruck: (truck: Truck) => void;
    onDeleteTruck: (truckId: string) => void;
    onScheduleMaintenance: (truckId: string) => void;
    onUpdateFuelLevel: (truckId: string, updateData: FuelUpdateFormData) => void;
    onAddFuelUpdate: (fuelUpdate: FuelUpdate) => void;
}

export default function FleetManagement({
    trucks,
    fuelHistory,
    onAddTruck,
    onEditTruck,
    onDeleteTruck,
    onScheduleMaintenance,
    onUpdateFuelLevel,
    onAddFuelUpdate
}: FleetManagementProps) {
    const [truckSearch, setTruckSearch] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isFuelUpdateDialogOpen, setIsFuelUpdateDialogOpen] = useState(false);
    const [editingTruck, setEditingTruck] = useState<TruckFormData>({
        plateNumber: '',
        model: '',
        capacity: '',
        driver: ''
    });
    const [editingTruckId, setEditingTruckId] = useState<string>('');
    const [updatingTruckFuelId, setUpdatingTruckFuelId] = useState<string>('');
    const [newTruck, setNewTruck] = useState({ plateNumber: '', model: '', capacity: '' });

    const filteredTrucks = trucks.filter(truck => {
        const searchTerm = truckSearch.toLowerCase();
        return (
            truck.plateNumber.toLowerCase().includes(searchTerm) ||
            truck.model.toLowerCase().includes(searchTerm) ||
            (truck.driver && truck.driver.toLowerCase().includes(searchTerm))
        );
    });

    const handleAddTruck = (e: React.FormEvent) => {
        e.preventDefault();
        onAddTruck(newTruck);
        setNewTruck({ plateNumber: '', model: '', capacity: '' });
    };

    const handleEditTruck = (truck: Truck) => {
        setEditingTruckId(truck.id);
        setEditingTruck({
            plateNumber: truck.plateNumber,
            model: truck.model,
            capacity: truck.capacity.toString(),
            driver: truck.driver,
            driverContact: truck.driverContact
        });
        setIsEditDialogOpen(true);
    };

    const saveEditedTruck = (truckId: string) => {
        onEditTruck({
            id: truckId,
            plateNumber: editingTruck.plateNumber,
            model: editingTruck.model,
            capacity: parseInt(editingTruck.capacity),
            driver: editingTruck.driver,
            driverContact: editingTruck.driverContact,
            status: 'Available',
            lastMaintenance: '',
            fuelLevel: 0,
            mileage: 0
        });
        setIsEditDialogOpen(false);
    };

    const openFuelUpdateDialog = (truckId: string) => {
        setUpdatingTruckFuelId(truckId);
        setIsFuelUpdateDialogOpen(true);
    };

    const handleFuelUpdate = (truckId: string, updateData: FuelUpdateFormData) => {
        onUpdateFuelLevel(truckId, updateData);
        
        const truck = trucks.find(t => t.id === truckId);
        if (truck) {
            const litersAdded = parseFloat(updateData.litersAdded);
            const previousLevel = truck.fuelLevel;
            const newLevel = Math.min(100, previousLevel + (litersAdded / truck.capacity) * 100);

            const fuelUpdate: FuelUpdate = {
                id: Date.now().toString(),
                truckId,
                timestamp: new Date().toISOString(),
                previousLevel,
                newLevel,
                litersAdded,
                cost: parseFloat(updateData.cost),
                location: updateData.location,
                updatedBy: 'User'
            };
            onAddFuelUpdate(fuelUpdate);
        }
        
        setIsFuelUpdateDialogOpen(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Fleet Management</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex-1 max-w-sm">
                            <Input
                                placeholder="Search trucks..."
                                value={truckSearch}
                                onChange={(e) => setTruckSearch(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Add New Truck
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Truck</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddTruck} className="space-y-4">
                                    <Input
                                        placeholder="Plate Number"
                                        value={newTruck.plateNumber}
                                        onChange={(e) => setNewTruck({ ...newTruck, plateNumber: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Model"
                                        value={newTruck.model}
                                        onChange={(e) => setNewTruck({ ...newTruck, model: e.target.value })}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Capacity (tons)"
                                        value={newTruck.capacity}
                                        onChange={(e) => setNewTruck({ ...newTruck, capacity: e.target.value })}
                                    />
                                    <Button type="submit">Add Truck</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Truck</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                saveEditedTruck(editingTruckId);
                            }} className="space-y-4">
                                <Input
                                    placeholder="Plate Number"
                                    value={editingTruck.plateNumber}
                                    onChange={(e) => setEditingTruck({ ...editingTruck, plateNumber: e.target.value })}
                                />
                                <Input
                                    placeholder="Model"
                                    value={editingTruck.model}
                                    onChange={(e) => setEditingTruck({ ...editingTruck, model: e.target.value })}
                                />
                                <Input
                                    type="number"
                                    placeholder="Capacity (tons)"
                                    value={editingTruck.capacity}
                                    onChange={(e) => setEditingTruck({ ...editingTruck, capacity: e.target.value })}
                                />
                                <Input
                                    placeholder="Driver"
                                    value={editingTruck.driver || ''}
                                    onChange={(e) => setEditingTruck({ ...editingTruck, driver: e.target.value })}
                                />
                                <Input
                                    placeholder="Driver Contact Number"
                                    value={editingTruck.driverContact || ''}
                                    onChange={(e) => setEditingTruck({ ...editingTruck, driverContact: e.target.value })}
                                />
                                <Button type="submit">Save Changes</Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plate Number</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Driver</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Fuel Level</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTrucks.map((truck) => (
                                <TableRow key={truck.id}>
                                    <TableCell>{truck.plateNumber}</TableCell>
                                    <TableCell>{truck.model}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {truck.driver || 'Unassigned'}
                                            </span>
                                            {truck.driverContact && (
                                                <span className="text-xs text-muted-foreground">
                                                    📞 {truck.driverContact}
                                                </span>
                                            )}
                                            {truck.status === 'In Transit' && (
                                                <span className="text-xs text-muted-foreground">
                                                    On delivery
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            truck.status === 'Available' ? 'default' :
                                            truck.status === 'In Transit' ? 'secondary' : 'destructive'
                                        }>
                                            {truck.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{ width: `${truck.fuelLevel}%` }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditTruck(truck)}
                                            >
                                                <Pencil2Icon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onDeleteTruck(truck.id)}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onScheduleMaintenance(truck.id)}
                                                disabled={truck.status !== 'Available'}
                                            >
                                                Schedule Maintenance
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openFuelUpdateDialog(truck.id)}
                                            >
                                                Update Fuel
                                            </Button>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        Fuel History
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Fuel History - {truck.plateNumber}</DialogTitle>
                                                    </DialogHeader>
                                                    <FuelHistory truckId={truck.id} fuelHistory={fuelHistory} />
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            
            <FuelUpdateDialog
                isOpen={isFuelUpdateDialogOpen}
                onClose={() => setIsFuelUpdateDialogOpen(false)}
                onUpdate={handleFuelUpdate}
                truckId={updatingTruckFuelId}
            />
        </Card>
    );
}
