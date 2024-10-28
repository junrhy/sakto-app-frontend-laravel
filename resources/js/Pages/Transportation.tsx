import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";

type Truck = {
    id: string;
    plateNumber: string;
    model: string;
    capacity: number;
    status: 'Available' | 'In Transit' | 'Maintenance';
};
  
type Shipment = {
    id: string;
    truckId: string;
    destination: string;
    departureDate: string;
    arrivalDate: string;
    status: 'Scheduled' | 'In Transit' | 'Delivered';
};

export default function Transportation() {
    const currency = '$';
    const [trucks, setTrucks] = useState<Truck[]>([
        { id: '1', plateNumber: 'ABC123', model: 'Volvo FH16', capacity: 40, status: 'Available' },
        { id: '2', plateNumber: 'XYZ789', model: 'Mercedes-Benz Actros', capacity: 35, status: 'In Transit' },
    ]);
    const [shipments, setShipments] = useState<Shipment[]>([
        { id: '1', truckId: '2', destination: 'New York', departureDate: '2023-06-01', arrivalDate: '2023-06-03', status: 'In Transit' },
    ]);
    const [newTruck, setNewTruck] = useState({ plateNumber: '', model: '', capacity: '' });
    const [newShipment, setNewShipment] = useState({ truckId: '', destination: '', departureDate: '', arrivalDate: '' });

    const addTruck = (e: React.FormEvent) => {
        e.preventDefault();
        const capacity = parseInt(newTruck.capacity);
        if (isNaN(capacity)) return;
        setTrucks([...trucks, { 
        id: Date.now().toString(), 
        plateNumber: newTruck.plateNumber, 
        model: newTruck.model, 
        capacity, 
        status: 'Available' 
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
        status: 'Scheduled' 
        }]);
        setNewShipment({ truckId: '', destination: '', departureDate: '', arrivalDate: '' });
    };
    
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Transportation
                </h2>
            }
        >
            <Head title="Transportation" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                <h2 className="text-xl font-semibold mb-4">Trucks</h2>
                                <form onSubmit={addTruck} className="mb-6 space-y-4">
                                    <Input
                                    placeholder="Plate Number"
                                    value={newTruck.plateNumber}
                                    onChange={(e) => setNewTruck({ ...newTruck, plateNumber: e.target.value })}
                                    required
                                    />
                                    <Input
                                    placeholder="Model"
                                    value={newTruck.model}
                                    onChange={(e) => setNewTruck({ ...newTruck, model: e.target.value })}
                                    required
                                    />
                                    <Input
                                    type="number"
                                    placeholder="Capacity (tons)"
                                    value={newTruck.capacity}
                                    onChange={(e) => setNewTruck({ ...newTruck, capacity: e.target.value })}
                                    required
                                    />
                                    <Button type="submit">Add Truck</Button>
                                </form>

                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead>Plate Number</TableHead>
                                        <TableHead>Model</TableHead>
                                        <TableHead>Capacity (tons)</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {trucks.map((truck) => (
                                        <TableRow key={truck.id}>
                                        <TableCell>{truck.plateNumber}</TableCell>
                                        <TableCell>{truck.model}</TableCell>
                                        <TableCell>{truck.capacity}</TableCell>
                                        <TableCell>{truck.status}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                                </div>

                                <div>
                                <h2 className="text-xl font-semibold mb-4">Shipments</h2>
                                <form onSubmit={addShipment} className="mb-6 space-y-4">
                                    <Input
                                    placeholder="Truck ID"
                                    value={newShipment.truckId}
                                    onChange={(e) => setNewShipment({ ...newShipment, truckId: e.target.value })}
                                    required
                                    />
                                    <Input
                                    placeholder="Destination"
                                    value={newShipment.destination}
                                    onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                                    required
                                    />
                                    <Input
                                    type="date"
                                    placeholder="Departure Date"
                                    value={newShipment.departureDate}
                                    onChange={(e) => setNewShipment({ ...newShipment, departureDate: e.target.value })}
                                    required
                                    />
                                    <Input
                                    type="date"
                                    placeholder="Arrival Date"
                                    value={newShipment.arrivalDate}
                                    onChange={(e) => setNewShipment({ ...newShipment, arrivalDate: e.target.value })}
                                    required
                                    />
                                    <Button type="submit">Add Shipment</Button>
                                </form>

                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead>Truck ID</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Departure Date</TableHead>
                                        <TableHead>Arrival Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {shipments.map((shipment) => (
                                        <TableRow key={shipment.id}>
                                        <TableCell>{shipment.truckId}</TableCell>
                                        <TableCell>{shipment.destination}</TableCell>
                                        <TableCell>{shipment.departureDate}</TableCell>
                                        <TableCell>{shipment.arrivalDate}</TableCell>
                                        <TableCell>{shipment.status}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
