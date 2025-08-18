import { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { PlusIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { MapIcon } from "lucide-react";
import { format } from "date-fns";
import { Shipment, ShipmentFormData, StatusUpdateFormData, TrackingUpdate, Truck } from "../types";
import ShipmentTrackingHistory from "./ShipmentTrackingHistory";
import StatusUpdateDialog from "./StatusUpdateDialog";

interface ShipmentTrackingProps {
    shipments: Shipment[];
    trucks: Truck[];
    trackingHistory: TrackingUpdate[];
    onAddShipment: (shipment: ShipmentFormData) => void;
    onEditShipment: (shipment: Shipment) => void;
    onDeleteShipment: (shipmentId: string) => void;
    onUpdateShipmentStatus: (shipmentId: string, updateData: StatusUpdateFormData) => void;
    onAddTrackingUpdate: (shipmentId: string, update: Omit<TrackingUpdate, 'id'>) => void;
}

export default function ShipmentTracking({
    shipments,
    trucks,
    trackingHistory,
    onAddShipment,
    onEditShipment,
    onDeleteShipment,
    onUpdateShipmentStatus,
    onAddTrackingUpdate
}: ShipmentTrackingProps) {
    const [shipmentSearch, setShipmentSearch] = useState('');
    const [isNewShipmentDialogOpen, setIsNewShipmentDialogOpen] = useState(false);
    const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
    const [updatingShipmentId, setUpdatingShipmentId] = useState<string>('');
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
    const [statusUpdateForm, setStatusUpdateForm] = useState<StatusUpdateFormData>({
        status: 'In Transit',
        location: '',
        notes: ''
    });

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

    const handleAddShipment = (e: React.FormEvent) => {
        e.preventDefault();
        onAddShipment(newShipment);
        setNewShipment({
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
        setIsNewShipmentDialogOpen(false);
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

    const handleStatusUpdate = (updateData: StatusUpdateFormData) => {
        onUpdateShipmentStatus(updatingShipmentId, updateData);
        onAddTrackingUpdate(updatingShipmentId, {
            shipmentId: updatingShipmentId,
            status: updateData.status,
            location: updateData.location,
            timestamp: new Date().toISOString(),
            updatedBy: 'User',
            notes: updateData.notes
        });
        setIsStatusUpdateDialogOpen(false);
    };

    return (
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
                                <form onSubmit={handleAddShipment} className="space-y-4">
                                    <Select
                                        value={newShipment.truckId}
                                        onValueChange={(value) => setNewShipment({ ...newShipment, truckId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Truck" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {trucks.map((truck) => (
                                                <SelectItem key={truck.id} value={truck.id}>
                                                    {truck.plateNumber} - {truck.model}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="Origin"
                                        value={newShipment.origin}
                                        onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Destination"
                                        value={newShipment.destination}
                                        onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                                    />
                                    <Input
                                        type="date"
                                        placeholder="Departure Date"
                                        value={newShipment.departureDate}
                                        onChange={(e) => setNewShipment({ ...newShipment, departureDate: e.target.value })}
                                    />
                                    <Input
                                        type="date"
                                        placeholder="Arrival Date"
                                        value={newShipment.arrivalDate}
                                        onChange={(e) => setNewShipment({ ...newShipment, arrivalDate: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Cargo"
                                        value={newShipment.cargo}
                                        onChange={(e) => setNewShipment({ ...newShipment, cargo: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Weight (tons)" 
                                        value={newShipment.weight}
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
                                        <SelectTrigger>
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
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Driver" />
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
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {shipment.driver || 'Unassigned'}
                                            </span>
                                            {(() => {
                                                const truck = trucks.find(t => t.id === shipment.truckId);
                                                return truck?.driverContact && (
                                                    <span className="text-xs text-muted-foreground">
                                                        📞 {truck.driverContact}
                                                    </span>
                                                );
                                            })()}
                                        </div>
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
                                                onClick={() => onEditShipment(shipment)}
                                            >
                                                <Pencil2Icon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onDeleteShipment(shipment.id)}
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
                                                        <ShipmentTrackingHistory shipmentId={shipment.id} trackingHistory={trackingHistory} />
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
            
            <StatusUpdateDialog
                isOpen={isStatusUpdateDialogOpen}
                onClose={() => setIsStatusUpdateDialogOpen(false)}
                onSubmit={handleStatusUpdate}
                formData={statusUpdateForm}
                onFormChange={setStatusUpdateForm}
            />
        </Card>
    );
}
