import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Calendar } from "@/Components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, MapIcon, TruckIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { PlusIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";

type MaintenanceRecord = {
    id: string;
    truckId: string;
    date: string;
    type: 'Routine' | 'Repair';
    description: string;
    cost: number;
};

type Truck = {
    id: string;
    plateNumber: string;
    model: string;
    capacity: number;
    status: 'Available' | 'In Transit' | 'Maintenance';
    lastMaintenance: string;
    fuelLevel: number;
    mileage: number;
    driver?: string;
};
  
type Shipment = {
    id: string;
    truckId: string;
    driver: string;
    destination: string;
    origin: string;
    departureDate: string;
    arrivalDate: string;
    status: 'Scheduled' | 'In Transit' | 'Delivered' | 'Delayed';
    cargo: string;
    weight: number;
    currentLocation?: string;
    estimatedDelay?: number;
    customerContact: string;
    priority: 'Low' | 'Medium' | 'High';
    trackingHistory?: TrackingUpdate[];
};

// Add this interface for the edit form
interface TruckFormData {
  plateNumber: string;
  model: string;
  capacity: string;
  driver?: string;
}

// Add these new interfaces after the existing type definitions
interface ShipmentFormData {
    truckId: string;
    destination: string;
    origin: string;
    departureDate: string;
    arrivalDate: string;
    cargo: string;
    weight: string;
    customerContact: string;
    priority: 'Low' | 'Medium' | 'High';
    driver: string;
}

// Add this new type after the existing type definitions
type TrackingUpdate = {
    id: string;
    shipmentId: string;
    status: Shipment['status'];
    location: string;
    timestamp: string;
    notes?: string;
    updatedBy: string;
};

// Add this new interface after the existing interfaces
interface StatusUpdateFormData {
    status: Shipment['status'];
    location: string;
    notes: string;
}

// Add this new type after the existing type definitions
type FuelUpdate = {
    id: string;
    truckId: string;
    timestamp: string;
    previousLevel: number;
    newLevel: number;
    litersAdded: number;
    cost: number;
    location: string;
    updatedBy: string;
};

// Add this new interface
interface FuelUpdateFormData {
    litersAdded: string;
    cost: string;
    location: string;
}

// First, add this new component after your type definitions but before the main Transportation component
const FuelUpdateDialogComponent = ({
    isOpen,
    onClose,
    onUpdate,
    truckId,
}: {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (truckId: string, data: FuelUpdateFormData) => void;
    truckId: string;
}) => {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(truckId, formData);
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
};

export default function Transportation() {
    const currency = '$';
    const [trucks, setTrucks] = useState<Truck[]>([
        { id: '1', plateNumber: 'ABC123', model: 'Volvo FH16', capacity: 40, status: 'Available', lastMaintenance: '2023-01-01', fuelLevel: 50, mileage: 100000, driver: 'John Doe' },
        { id: '2', plateNumber: 'XYZ789', model: 'Mercedes-Benz Actros', capacity: 35, status: 'In Transit', lastMaintenance: '2023-01-01', fuelLevel: 50, mileage: 100000, driver: 'Jane Doe' },
    ]);
    const [shipments, setShipments] = useState<Shipment[]>([
        { id: '1', truckId: '2', driver: 'Jane Doe', destination: 'New York', origin: 'Los Angeles', departureDate: '2023-06-01', arrivalDate: '2023-06-03', status: 'In Transit', cargo: 'Electronics', weight: 1000, currentLocation: 'New York', estimatedDelay: 0, customerContact: '123-456-7890', priority: 'Medium' },
    ]);
    const [newTruck, setNewTruck] = useState({ plateNumber: '', model: '', capacity: '' });
    const [newShipment, setNewShipment] = useState<ShipmentFormData>({
        truckId: '',
        destination: '',
        origin: '',
        departureDate: '',
        arrivalDate: '',
        cargo: '',
        weight: '',
        customerContact: '',
        priority: 'Medium',
        driver: ''
    });
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
    const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
    const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
    const [stats, setStats] = useState({
        activeShipments: 0,
        availableTrucks: 0,
        delayedShipments: 0,
        totalRevenue: 0,
    });
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTruck, setEditingTruck] = useState<TruckFormData>({
        plateNumber: '',
        model: '',
        capacity: '',
        driver: ''
    });
    const [isNewShipmentDialogOpen, setIsNewShipmentDialogOpen] = useState(false);
    const [editingShipment, setEditingShipment] = useState<ShipmentFormData>({
        truckId: '',
        destination: '',
        origin: '',
        departureDate: '',
        arrivalDate: '',
        cargo: '',
        weight: '',
        customerContact: '',
        priority: 'Medium',
        driver: ''
    });
    const [editingTruckId, setEditingTruckId] = useState<string>(''); // Add this state
    const [shipmentSearch, setShipmentSearch] = useState('');
    const [truckSearch, setTruckSearch] = useState('');
    const [trackingHistory, setTrackingHistory] = useState<TrackingUpdate[]>([
        {
            id: '1',
            shipmentId: '1',
            status: 'In Transit',
            location: 'Chicago',
            timestamp: '2024-03-15T10:30:00',
            notes: 'Shipment passed through Chicago hub',
            updatedBy: 'System'
        },
        // Add more sample tracking updates as needed
    ]);
    const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
    const [updatingShipmentId, setUpdatingShipmentId] = useState<string>('');
    const [statusUpdateForm, setStatusUpdateForm] = useState<StatusUpdateFormData>({
        status: 'In Transit',
        location: '',
        notes: ''
    });
    const [isFuelUpdateDialogOpen, setIsFuelUpdateDialogOpen] = useState(false);
    const [updatingTruckFuelId, setUpdatingTruckFuelId] = useState<string>('');
    const [fuelHistory, setFuelHistory] = useState<FuelUpdate[]>([]);

    useEffect(() => {
        // Calculate dashboard stats
        const activeShipments = shipments.filter(s => s.status === 'In Transit').length;
        const availableTrucks = trucks.filter(t => t.status === 'Available').length;
        const delayedShipments = shipments.filter(s => s.status === 'Delayed').length;
        
        setStats({
            activeShipments,
            availableTrucks,
            delayedShipments,
            totalRevenue: 125000, // Example fixed value, would be calculated from actual shipment data
        });
    }, [shipments, trucks]);

    const addTruck = (e: React.FormEvent) => {
        e.preventDefault();
        const capacity = parseInt(newTruck.capacity);
        if (isNaN(capacity)) return;
        setTrucks([...trucks, {
            id: Date.now().toString(),
            plateNumber: newTruck.plateNumber,
            model: newTruck.model,
            capacity,
            status: 'Available',
            lastMaintenance: '',
            fuelLevel: 0,
            mileage: 0
        }]);
        setNewTruck({ plateNumber: '', model: '', capacity: '' });
    };

    const addShipment = (e: React.FormEvent) => {
        e.preventDefault();
        setShipments([...shipments, {
            id: Date.now().toString(),
            truckId: newShipment.truckId,
            destination: newShipment.destination,
            departureDate: newShipment.departureDate,
            arrivalDate: newShipment.arrivalDate,
            status: 'Scheduled',
            driver: '',
            origin: '',
            cargo: '',
            weight: 0,
            customerContact: '',
            priority: 'Medium'
        }]);
        setNewShipment({ 
            truckId: '', 
            destination: '', 
            origin: '',           // Add this line
            departureDate: '', 
            arrivalDate: '', 
            cargo: '', 
            weight: '', 
            customerContact: '', 
            priority: 'Medium', 
            driver: '' 
        });
    };
    
    const scheduleMaintenance = (truckId: string) => {
        const truck = trucks.find(t => t.id === truckId);
        if (!truck) return;

        setTrucks(trucks.map(t => 
            t.id === truckId ? { ...t, status: 'Maintenance' } : t
        ));

        setMaintenanceRecords([...maintenanceRecords, {
            id: Date.now().toString(),
            truckId,
            date: new Date().toISOString().split('T')[0],
            type: 'Routine',
            description: 'Scheduled maintenance check',
            cost: 500,
        }]);
    };

    const openStatusUpdateDialog = (shipmentId: string, currentStatus: Shipment['status']) => {
        setUpdatingShipmentId(shipmentId);
        setStatusUpdateForm({
            status: currentStatus,
            location: '',
            notes: ''
        });
        setIsStatusUpdateDialogOpen(true);
    };

    const updateShipmentStatus = (shipmentId: string, updateData: StatusUpdateFormData) => {
        // Update shipment status
        setShipments(shipments.map(s =>
            s.id === shipmentId ? { ...s, status: updateData.status } : s
        ));

        // Add tracking update
        addTrackingUpdate(shipmentId, {
            shipmentId,
            status: updateData.status,
            location: updateData.location,
            timestamp: new Date().toISOString(),
            updatedBy: 'User', // You might want to get this from auth context
            notes: updateData.notes
        });

        // Update truck status if shipment is delivered
        if (updateData.status === 'Delivered') {
            const shipment = shipments.find(s => s.id === shipmentId);
            if (shipment) {
                setTrucks(trucks.map(t =>
                    t.id === shipment.truckId ? { ...t, status: 'Available' } : t
                ));
            }
        }

        setIsStatusUpdateDialogOpen(false);
    };

    // Add these new functions for CRUD operations
    const handleEditTruck = (truck: Truck) => {
        setEditingTruckId(truck.id);
        setEditingTruck({
            plateNumber: truck.plateNumber,
            model: truck.model,
            capacity: truck.capacity.toString(),
            driver: truck.driver
        });
        setIsEditDialogOpen(true);
    };

    const saveEditedTruck = (truckId: string) => {
        setTrucks(trucks.map(truck => {
            if (truck.id === truckId) {
                return {
                    ...truck,
                    plateNumber: editingTruck.plateNumber,
                    model: editingTruck.model,
                    capacity: parseInt(editingTruck.capacity),
                    driver: editingTruck.driver
                };
            }
            return truck;
        }));
        setIsEditDialogOpen(false);
    };

    const deleteTruck = (truckId: string) => {
        if (confirm('Are you sure you want to delete this truck?')) {
            setTrucks(trucks.filter(truck => truck.id !== truckId));
        }
    };

    const handleEditShipment = (shipment: Shipment) => {
        setEditingShipment({
            truckId: shipment.truckId,
            destination: shipment.destination,
            origin: shipment.origin,
            departureDate: shipment.departureDate,
            arrivalDate: shipment.arrivalDate,
            cargo: shipment.cargo,
            weight: shipment.weight.toString(),
            customerContact: shipment.customerContact,
            priority: shipment.priority,
            driver: shipment.driver
        });
        setIsNewShipmentDialogOpen(true);
    };

    const deleteShipment = (shipmentId: string) => {
        if (confirm('Are you sure you want to delete this shipment?')) {
            setShipments(shipments.filter(s => s.id !== shipmentId));
        }
    };

    const filteredShipments = shipments.filter(shipment => {
        const searchTerm = shipmentSearch.toLowerCase();
        const truck = trucks.find(t => t.id === shipment.truckId);
        return (
            shipment.id.toLowerCase().includes(searchTerm) ||
            shipment.destination.toLowerCase().includes(searchTerm) ||
            shipment.origin.toLowerCase().includes(searchTerm) ||
            shipment.driver.toLowerCase().includes(searchTerm) ||
            (truck && truck.plateNumber.toLowerCase().includes(searchTerm))
        );
    });

    const filteredTrucks = trucks.filter(truck => {
        const searchTerm = truckSearch.toLowerCase();
        return (
            truck.plateNumber.toLowerCase().includes(searchTerm) ||
            truck.model.toLowerCase().includes(searchTerm) ||
            (truck.driver && truck.driver.toLowerCase().includes(searchTerm))
        );
    });

    const addTrackingUpdate = (shipmentId: string, update: Omit<TrackingUpdate, 'id'>) => {
        const newUpdate = {
            ...update,
            id: Date.now().toString(),
        };
        setTrackingHistory(prev => [...prev, newUpdate]);
    };

    const ShipmentTrackingHistory = ({ shipmentId }: { shipmentId: string }) => {
        const shipmentUpdates = trackingHistory
            .filter(update => update.shipmentId === shipmentId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return (
            <div className="space-y-4">
                <h3 className="font-medium">Tracking History</h3>
                <div className="space-y-3">
                    {shipmentUpdates.map((update) => (
                        <div key={update.id} className="flex items-start space-x-4 border-l-2 border-blue-500 pl-4">
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <Badge variant={
                                        update.status === 'Delivered' ? 'default' :
                                        update.status === 'In Transit' ? 'secondary' :
                                        update.status === 'Delayed' ? 'destructive' :
                                        'outline'
                                    }>
                                        {update.status}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {format(new Date(update.timestamp), 'MMM dd, yyyy HH:mm')}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm">{update.location}</p>
                                {update.notes && (
                                    <p className="mt-1 text-sm text-muted-foreground">{update.notes}</p>
                                )}
                                <p className="mt-1 text-xs text-muted-foreground">Updated by: {update.updatedBy}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const StatusUpdateDialog = () => {
        return (
            <Dialog open={isStatusUpdateDialogOpen} onOpenChange={setIsStatusUpdateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Shipment Status</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        updateShipmentStatus(updatingShipmentId, statusUpdateForm);
                    }} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={statusUpdateForm.status}
                                onValueChange={(value) => setStatusUpdateForm({
                                    ...statusUpdateForm,
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
                                value={statusUpdateForm.location}
                                onChange={(e) => setStatusUpdateForm({
                                    ...statusUpdateForm,
                                    location: e.target.value
                                })}
                                placeholder="Enter current location"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Input
                                value={statusUpdateForm.notes}
                                onChange={(e) => setStatusUpdateForm({
                                    ...statusUpdateForm,
                                    notes: e.target.value
                                })}
                                placeholder="Add any additional notes"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsStatusUpdateDialogOpen(false)}
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
    };

    const openFuelUpdateDialog = (truckId: string) => {
        setUpdatingTruckFuelId(truckId);
        setIsFuelUpdateDialogOpen(true);
    };

    const updateFuelLevel = (truckId: string, updateData: FuelUpdateFormData) => {
        const truck = trucks.find(t => t.id === truckId);
        if (!truck) return;

        const litersAdded = parseFloat(updateData.litersAdded);
        if (isNaN(litersAdded)) return;

        const previousLevel = truck.fuelLevel;
        const newLevel = Math.min(100, previousLevel + (litersAdded / truck.capacity) * 100);

        // Update truck fuel level
        setTrucks(trucks.map(t =>
            t.id === truckId ? { ...t, fuelLevel: newLevel } : t
        ));

        // Add fuel history record
        const fuelUpdate: FuelUpdate = {
            id: Date.now().toString(),
            truckId,
            timestamp: new Date().toISOString(),
            previousLevel,
            newLevel,
            litersAdded,
            cost: parseFloat(updateData.cost),
            location: updateData.location,
            updatedBy: 'User' // You might want to get this from auth context
        };
        setFuelHistory(prev => [...prev, fuelUpdate]);

        setIsFuelUpdateDialogOpen(false);
    };

    const FuelHistory = ({ truckId }: { truckId: string }) => {
        const truckFuelHistory = fuelHistory
            .filter(update => update.truckId === truckId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return (
            <div className="space-y-4">
                <h3 className="font-medium">Fuel History</h3>
                <div className="space-y-3">
                    {truckFuelHistory.map((update) => (
                        <div key={update.id} className="flex items-start space-x-4 border-l-2 border-green-500 pl-4">
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                        {update.litersAdded.toFixed(2)} L added
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {format(new Date(update.timestamp), 'MMM dd, yyyy HH:mm')}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm">
                                    Level: {update.previousLevel.toFixed(1)}% → {update.newLevel.toFixed(1)}%
                                </p>
                                <p className="mt-1 text-sm">
                                    Cost: ${update.cost.toFixed(2)} | Location: {update.location}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Updated by: {update.updatedBy}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Transportation Management
                </h2>
            }
        >
            <Head title="Transportation" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Dashboard Stats */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
                                <TruckIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.activeShipments}</div>
                            </CardContent>
                        </Card>
                        {/* Add similar cards for other stats */}
                    </div>

                    <div className="grid grid-cols-1 gap-6"> {/* Remove md:grid-cols-2 to make sections full width */}
                        {/* Shipment Tracking Section */}
                        <div className="space-y-6"> {/* This div now takes full width */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Shipment Tracking</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1 max-w-sm">
                                                <Input
                                                    placeholder="Search shipments..."
                                                    value={shipmentSearch}
                                                    onChange={(e) => setShipmentSearch(e.target.value)}
                                                    className="max-w-sm"
                                                />
                                            </div>
                                            <Dialog open={isNewShipmentDialogOpen} onOpenChange={setIsNewShipmentDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button>
                                                        <PlusIcon className="mr-2 h-4 w-4" />
                                                        New Shipment
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Add New Shipment</DialogTitle>
                                                    </DialogHeader>
                                                    <form onSubmit={addShipment} className="space-y-4">
                                                        <Input
                                                            placeholder="Truck ID"
                                                            value={newShipment.truckId}
                                                            onChange={(e) => setNewShipment({ ...newShipment, truckId: e.target.value })}
                                                        />
                                                        <Input
                                                            placeholder="Destination"
                                                            value={newShipment.destination}
                                                            onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                                                        />
                                                        <Input
                                                            placeholder="Departure Date"
                                                            value={newShipment.departureDate}
                                                            onChange={(e) => setNewShipment({ ...newShipment, departureDate: e.target.value })}
                                                        />
                                                        <Input
                                                            placeholder="Arrival Date"
                                                            value={newShipment.arrivalDate}
                                                            onChange={(e) => setNewShipment({ ...newShipment, arrivalDate: e.target.value })}
                                                        />
                                                        <Input
                                                            placeholder="Cargo"
                                                            value={newShipment.cargo || ''}
                                                            onChange={(e) => setNewShipment({ ...newShipment, cargo: e.target.value })}
                                                        />
                                                        <Input
                                                            placeholder="Weight (tons)" 
                                                            value={newShipment.weight || ''}
                                                            onChange={(e) => setNewShipment({ ...newShipment, weight: e.target.value })}
                                                        />
                                                        <Input
                                                            placeholder="Customer Contact"
                                                            value={newShipment.customerContact}
                                                            onChange={(e) => setNewShipment({ ...newShipment, customerContact: e.target.value })}
                                                        />
                                                        <Select
                                                            value={newShipment.priority}
                                                            onValueChange={(value) => setNewShipment({ ...newShipment, priority: value as Shipment['priority'] })}
                                                        >
                                                            <SelectTrigger className="h-8">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Low">Low</SelectItem>
                                                                <SelectItem value="Medium">Medium</SelectItem>
                                                                <SelectItem value="High">High</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Select
                                                            value={newShipment.driver}
                                                            onValueChange={(value) => setNewShipment({ ...newShipment, driver: value })}
                                                        >
                                                            <SelectTrigger className="h-8">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Jane Doe">Jane Doe</SelectItem>
                                                                <SelectItem value="John Doe">John Doe</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button type="submit">Add Shipment</Button>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>ID</TableHead>
                                                    <TableHead>Truck Details</TableHead>
                                                    <TableHead>Driver</TableHead>
                                                    <TableHead>Route</TableHead>
                                                    <TableHead>Dates</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Priority</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredShipments.map((shipment) => (
                                                    <TableRow key={shipment.id}>
                                                        <TableCell>{shipment.id}</TableCell>
                                                        <TableCell>
                                                            {/* Add truck details */}
                                                            {(() => {
                                                                const truck = trucks.find(t => t.id === shipment.truckId);
                                                                return truck ? (
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{truck.plateNumber}</span>
                                                                        <span className="text-sm text-muted-foreground">{truck.model}</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground">No truck assigned</span>
                                                                );
                                                            })()}
                                                        </TableCell>
                                                        <TableCell>
                                                            {/* Add driver name */}
                                                            <span className="font-medium">{shipment.driver || 'Unassigned'}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <MapIcon className="h-4 w-4" />
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium">
                                                                        {shipment.origin} → {shipment.destination}
                                                                    </span>
                                                                    {shipment.currentLocation && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Current: {shipment.currentLocation}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm">
                                                                    {format(new Date(shipment.departureDate), 'MMM dd')} - 
                                                                    {format(new Date(shipment.arrivalDate), 'MMM dd')}
                                                                </span>
                                                                {shipment.estimatedDelay && shipment.estimatedDelay > 0 && (
                                                                    <span className="text-xs text-red-500">
                                                                        Delayed: {shipment.estimatedDelay}h
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={
                                                                shipment.status === 'Delivered' ? 'default' :
                                                                shipment.status === 'In Transit' ? 'secondary' :
                                                                shipment.status === 'Delayed' ? 'destructive' :
                                                                'outline'
                                                            }>
                                                                {shipment.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={
                                                                shipment.priority === 'High' ? 'destructive' :
                                                                shipment.priority === 'Medium' ? 'secondary' :
                                                                'default'
                                                            }>
                                                                {shipment.priority}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex space-x-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleEditShipment(shipment)}
                                                                >
                                                                    <Pencil2Icon className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => deleteShipment(shipment.id)}
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => openStatusUpdateDialog(shipment.id, shipment.status)}
                                                                >
                                                                    Update Status
                                                                </Button>
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button variant="outline" size="sm">
                                                                            Details
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-w-2xl">
                                                                        <DialogHeader>
                                                                            <DialogTitle>Shipment Details</DialogTitle>
                                                                        </DialogHeader>
                                                                        <div className="grid gap-4">
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div>
                                                                                    <h3 className="font-medium">Cargo Information</h3>
                                                                                    <p className="text-sm">Type: {shipment.cargo}</p>
                                                                                    <p className="text-sm">Weight: {shipment.weight} tons</p>
                                                                                </div>
                                                                                <div>
                                                                                    <h3 className="font-medium">Contact Information</h3>
                                                                                    <p className="text-sm">Customer: {shipment.customerContact}</p>
                                                                                </div>
                                                                            </div>
                                                                            <ShipmentTrackingHistory shipmentId={shipment.id} />
                                                                        </div>
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
                            </Card>
                        </div>

                        {/* Fleet Management Section */}
                        <div className="space-y-6"> {/* This div now takes full width */}
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
                                                    <form onSubmit={addTruck} className="space-y-4">
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
                                                                    onClick={() => deleteTruck(truck.id)}
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => scheduleMaintenance(truck.id)}
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
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <StatusUpdateDialog />
            <FuelUpdateDialogComponent
                isOpen={isFuelUpdateDialogOpen}
                onClose={() => setIsFuelUpdateDialogOpen(false)}
                onUpdate={updateFuelLevel}
                truckId={updatingTruckFuelId}
            />
        </AuthenticatedLayout>
    );
}