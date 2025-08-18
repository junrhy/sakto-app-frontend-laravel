import { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { PlusIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { CargoItem, CargoFormData } from "../types";
import { useCargoMonitoring, useShipmentTracking } from "../hooks";

export default function CargoMonitoring() {
    const {
        cargoItems,
        loading,
        error,
        addCargoItem,
        updateCargoStatus,
        updateCargoItem,
        deleteCargoItem,
        getCargoByShipment
    } = useCargoMonitoring();

    const { shipments } = useShipmentTracking();

    const [cargoSearch, setCargoSearch] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedShipmentId, setSelectedShipmentId] = useState('');
    const [editingCargo, setEditingCargo] = useState<CargoFormData>({
        name: '',
        quantity: '',
        unit: 'pieces',
        description: '',
        specialHandling: '',
        temperature: '',
        humidity: ''
    });
    const [editingCargoId, setEditingCargoId] = useState<string>('');
    const [newCargo, setNewCargo] = useState<CargoFormData>({
        name: '',
        quantity: '',
        unit: 'pieces',
        description: '',
        specialHandling: '',
        temperature: '',
        humidity: ''
    });

    const filteredCargoItems = cargoItems.filter(cargo => {
        const searchTerm = cargoSearch.toLowerCase();
        return (
            (cargo.name && cargo.name.toLowerCase().includes(searchTerm)) ||
            (cargo.description && cargo.description.toLowerCase().includes(searchTerm)) ||
            (cargo.special_handling && cargo.special_handling.toLowerCase().includes(searchTerm))
        );
    });

    const handleAddCargoItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShipmentId) {
            alert('Please select a shipment ID');
            return;
        }
        try {
            await addCargoItem(selectedShipmentId, newCargo);
            setNewCargo({
                name: '',
                quantity: '',
                unit: 'pieces',
                description: '',
                specialHandling: '',
                temperature: '',
                humidity: ''
            });
            setSelectedShipmentId('');
        } catch (error) {
            console.error('Failed to add cargo item:', error);
        }
    };

    const handleEditCargoItem = (cargo: CargoItem) => {
        setEditingCargoId(cargo.id);
        setEditingCargo({
            name: cargo.name,
            quantity: cargo.quantity.toString(),
            unit: cargo.unit,
            description: cargo.description || '',
            specialHandling: cargo.special_handling || '',
            temperature: cargo.temperature?.toString() || '',
            humidity: cargo.humidity?.toString() || ''
        });
        setIsEditDialogOpen(true);
    };

    const saveEditedCargoItem = async (cargoId: string) => {
        try {
            const cargo = cargoItems.find(c => c.id === cargoId);
            if (cargo) {
                await updateCargoItem(cargoId, {
                    shipmentId: cargo.shipment_id,
                    name: editingCargo.name,
                    quantity: editingCargo.quantity,
                    unit: editingCargo.unit,
                    description: editingCargo.description,
                    specialHandling: editingCargo.specialHandling,
                    status: cargo.status,
                    temperature: editingCargo.temperature,
                    humidity: editingCargo.humidity
                });
            }
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error('Failed to edit cargo item:', error);
        }
    };

    const handleDeleteCargoItem = async (cargoId: string) => {
        if (confirm('Are you sure you want to delete this cargo item?')) {
            try {
                await deleteCargoItem(cargoId);
            } catch (error) {
                console.error('Failed to delete cargo item:', error);
            }
        }
    };

    const handleUpdateCargoStatus = async (cargoId: string, status: CargoItem['status']) => {
        try {
            await updateCargoStatus(cargoId, status);
        } catch (error) {
            console.error('Failed to update cargo status:', error);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Cargo Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4 text-gray-600 dark:text-gray-400">Loading cargo data...</div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Cargo Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4 text-red-500 dark:text-red-400">Error: {error}</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-gray-900 dark:text-gray-100">Cargo Monitoring</CardTitle>
                    <Button onClick={() => setIsEditDialogOpen(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Cargo
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Input
                        placeholder="Search cargo items..."
                        value={cargoSearch}
                        onChange={(e) => setCargoSearch(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCargoItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        {item.description && (
                                            <div className="text-sm text-muted-foreground dark:text-gray-400">{item.description}</div>
                                        )}
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
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditCargoItem(item)}
                                        >
                                            <Pencil2Icon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteCargoItem(item.id)}
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">
                            {editingCargoId ? 'Edit Cargo Item' : 'Add New Cargo Item'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (editingCargoId) {
                            saveEditedCargoItem(editingCargoId);
                        } else {
                            handleAddCargoItem(e);
                        }
                    }}>
                        <div className="grid gap-4 py-4">
                            {!editingCargoId && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shipment</label>
                                    <Select
                                        value={selectedShipmentId || ""}
                                        onValueChange={(value) => setSelectedShipmentId(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a shipment">
                                                {selectedShipmentId && shipments.find(shipment => shipment.id === selectedShipmentId) && 
                                                    `#${shipments.find(shipment => shipment.id === selectedShipmentId)?.id} - ${shipments.find(shipment => shipment.id === selectedShipmentId)?.origin} → ${shipments.find(shipment => shipment.id === selectedShipmentId)?.destination}`
                                                }
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {shipments.map((shipment) => (
                                                <SelectItem key={shipment.id} value={shipment.id.toString()}>
                                                    #{shipment.id} - {shipment.origin} → {shipment.destination} ({shipment.status})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {shipments.length === 0 && (
                                        <p className="text-sm text-muted-foreground dark:text-gray-400">No shipments available</p>
                                    )}
                                </div>
                            )}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Input 
                                    placeholder="Name" 
                                    value={editingCargoId ? editingCargo.name : newCargo.name} 
                                    onChange={(e) => editingCargoId ? 
                                        setEditingCargo({ ...editingCargo, name: e.target.value }) :
                                        setNewCargo({ ...newCargo, name: e.target.value })
                                    } 
                                />
                                <Input 
                                    placeholder="Quantity" 
                                    type="number" 
                                    value={editingCargoId ? editingCargo.quantity : newCargo.quantity} 
                                    onChange={(e) => editingCargoId ? 
                                        setEditingCargo({ ...editingCargo, quantity: e.target.value }) :
                                        setNewCargo({ ...newCargo, quantity: e.target.value })
                                    } 
                                />
                                <Select
                                    value={(editingCargoId ? editingCargo.unit : newCargo.unit) || ""}
                                    onValueChange={(value) => editingCargoId ? 
                                        setEditingCargo({ ...editingCargo, unit: value as CargoItem['unit'] }) :
                                        setNewCargo({ ...newCargo, unit: value as CargoItem['unit'] })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kg">kg</SelectItem>
                                        <SelectItem value="pieces">pieces</SelectItem>
                                        <SelectItem value="pallets">pallets</SelectItem>
                                        <SelectItem value="boxes">boxes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Input 
                                placeholder="Description" 
                                value={editingCargoId ? editingCargo.description : newCargo.description} 
                                onChange={(e) => editingCargoId ? 
                                    setEditingCargo({ ...editingCargo, description: e.target.value }) :
                                    setNewCargo({ ...newCargo, description: e.target.value })
                                } 
                            />
                            <Input 
                                placeholder="Special Handling" 
                                value={editingCargoId ? editingCargo.specialHandling : newCargo.specialHandling} 
                                onChange={(e) => editingCargoId ? 
                                    setEditingCargo({ ...editingCargo, specialHandling: e.target.value }) :
                                    setNewCargo({ ...newCargo, specialHandling: e.target.value })
                                } 
                            />
                            <div className="grid grid-cols-2 items-center gap-4">
                                <Input 
                                    placeholder="Temperature" 
                                    type="number" 
                                    value={editingCargoId ? editingCargo.temperature : newCargo.temperature} 
                                    onChange={(e) => editingCargoId ? 
                                        setEditingCargo({ ...editingCargo, temperature: e.target.value }) :
                                        setNewCargo({ ...newCargo, temperature: e.target.value })
                                    } 
                                />
                                <Input 
                                    placeholder="Humidity" 
                                    type="number" 
                                    value={editingCargoId ? editingCargo.humidity : newCargo.humidity} 
                                    onChange={(e) => editingCargoId ? 
                                        setEditingCargo({ ...editingCargo, humidity: e.target.value }) :
                                        setNewCargo({ ...newCargo, humidity: e.target.value })
                                    } 
                                />
                            </div>
                            <Button type="submit">
                                {editingCargoId ? 'Save Changes' : 'Add Cargo'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
