import { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { PlusIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { TruckIcon } from "lucide-react";
import { Truck, TruckFormData, FuelUpdateFormData } from "../types";
import { useFleetManagement } from "../hooks";
import { FuelUpdateDialog, FuelHistory } from "./index";

export default function FleetManagement() {
    const {
        trucks,
        fuelHistory,
        maintenanceRecords,
        loading,
        error,
        addTruck,
        editTruck,
        deleteTruck,
        scheduleMaintenance,
        updateFuelLevel,
        getFuelHistory,
        getMaintenanceHistory
    } = useFleetManagement();

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
            (truck.plate_number && truck.plate_number.toLowerCase().includes(searchTerm)) ||
            (truck.model && truck.model.toLowerCase().includes(searchTerm)) ||
            (truck.driver && truck.driver.toLowerCase().includes(searchTerm))
        );
    });

    const handleAddTruck = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addTruck(newTruck);
            setNewTruck({ plateNumber: '', model: '', capacity: '' });
        } catch (error) {
            console.error('Failed to add truck:', error);
        }
    };

    const handleEditTruck = (truck: Truck) => {
        setEditingTruckId(truck.id);
        setEditingTruck({
            plateNumber: truck.plate_number,
            model: truck.model,
            capacity: truck.capacity.toString(),
            driver: truck.driver || '',
            driverContact: truck.driver_contact || ''
        });
        setIsEditDialogOpen(true);
    };

    const saveEditedTruck = async (truckId: string) => {
        try {
            const currentTruck = trucks.find(t => t.id === truckId);
            if (currentTruck) {
                await editTruck({
                    ...currentTruck,
                    plate_number: editingTruck.plateNumber,
                    model: editingTruck.model,
                    capacity: parseInt(editingTruck.capacity),
                    driver: editingTruck.driver,
                    driver_contact: editingTruck.driverContact,
                    status: 'Available',
                    last_maintenance: '',
                    fuel_level: '0',
                    mileage: 0
                });
            }
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error('Failed to edit truck:', error);
        }
    };

    const openFuelUpdateDialog = (truckId: string) => {
        setUpdatingTruckFuelId(truckId);
        setIsFuelUpdateDialogOpen(true);
    };



    const handleScheduleMaintenance = async (truckId: string) => {
        try {
            await scheduleMaintenance(truckId);
        } catch (error) {
            console.error('Failed to schedule maintenance:', error);
        }
    };

    const handleDeleteTruck = async (truckId: string) => {
        if (confirm('Are you sure you want to delete this truck?')) {
            try {
                await deleteTruck(truckId);
            } catch (error) {
                console.error('Failed to delete truck:', error);
            }
        }
    };

    const handleViewFuelHistory = async (truckId: string) => {
        try {
            await getFuelHistory(truckId);
        } catch (error) {
            console.error('Failed to fetch fuel history:', error);
        }
    };

    const handleViewMaintenanceHistory = async (truckId: string) => {
        try {
            await getMaintenanceHistory(truckId);
        } catch (error) {
            console.error('Failed to fetch maintenance history:', error);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Fleet Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4 text-gray-600 dark:text-gray-400">Loading fleet data...</div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Fleet Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4 text-red-500 dark:text-red-400">Error: {error}</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <TruckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fleet Management</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your vehicle fleet and maintenance</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredTrucks.length} trucks
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex-1 max-w-md">
                            <Input
                                placeholder="Search trucks..."
                                value={truckSearch}
                                onChange={(e) => setTruckSearch(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Add New Truck
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="text-gray-900 dark:text-gray-100">Add New Truck</DialogTitle>
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
                                <DialogTitle className="text-gray-900 dark:text-gray-100">Edit Truck</DialogTitle>
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

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                                <TableRow className="border-gray-200 dark:border-gray-700">
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Plate Number</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Model</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Driver</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Fuel Level</TableHead>
                                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTrucks.map((truck) => (
                                    <TableRow key={truck.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{truck.plate_number}</TableCell>
                                        <TableCell className="text-gray-900 dark:text-gray-100">{truck.model}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {truck.driver || 'Unassigned'}
                                            </span>
                                            {truck.driver_contact && (
                                                <span className="text-xs text-muted-foreground dark:text-gray-400">
                                                    📞 {truck.driver_contact}
                                                </span>
                                            )}
                                            {truck.status === 'In Transit' && (
                                                <span className="text-xs text-muted-foreground dark:text-gray-400">
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
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div 
                                                className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
                                                style={{ width: `${parseFloat(truck.fuel_level || '0')}%` }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditTruck(truck)}
                                                    className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                >
                                                    <Pencil2Icon className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteTruck(truck.id)}
                                                    className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <TrashIcon className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleScheduleMaintenance(truck.id)}
                                                    disabled={truck.status !== 'Available'}
                                                    className="h-8 px-2 text-xs hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                                >
                                                    Maintenance
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openFuelUpdateDialog(truck.id)}
                                                    className="h-8 px-2 text-xs hover:bg-green-50 dark:hover:bg-green-900/20"
                                                >
                                                    Fuel
                                                </Button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                                            History
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-gray-900 dark:text-gray-100">Fuel History - {truck.plate_number}</DialogTitle>
                                                        </DialogHeader>
                                                        <FuelHistory truckId={truck.id} />
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
            
            <FuelUpdateDialog
                isOpen={isFuelUpdateDialogOpen}
                onClose={() => setIsFuelUpdateDialogOpen(false)}
                truckId={updatingTruckFuelId}
            />
        </div>
    );
}
