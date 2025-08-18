import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    DashboardStats, 
    ShipmentTracking, 
    FleetManagement, 
    CargoMonitoring 
} from './components';
import { 
    Truck, 
    Shipment, 
    MaintenanceRecord, 
    TrackingUpdate, 
    FuelUpdate, 
    CargoItem,
    ShipmentFormData,
    StatusUpdateFormData,
    FuelUpdateFormData,
    CargoFormData,
    DashboardStats as DashboardStatsType
} from './types';

export default function Transportation() {
    const [trucks, setTrucks] = useState<Truck[]>([
        { id: '1', plateNumber: 'ABC123', model: 'Volvo FH16', capacity: 40, status: 'Available', lastMaintenance: '2023-01-01', fuelLevel: 50, mileage: 100000, driver: 'John Doe' },
        { id: '2', plateNumber: 'XYZ789', model: 'Mercedes-Benz Actros', capacity: 35, status: 'In Transit', lastMaintenance: '2023-01-01', fuelLevel: 50, mileage: 100000, driver: 'Jane Doe' },
    ]);
    const [shipments, setShipments] = useState<Shipment[]>([
        { id: '1', truckId: '2', driver: 'Jane Doe', destination: 'New York', origin: 'Los Angeles', departureDate: '2023-06-01', arrivalDate: '2023-06-03', status: 'In Transit', cargo: 'Electronics', weight: 1000, currentLocation: 'New York', estimatedDelay: 0, customerContact: '123-456-7890', priority: 'Medium' },
    ]);
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
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
    ]);
    const [fuelHistory, setFuelHistory] = useState<FuelUpdate[]>([]);
    const [cargoItems, setCargoItems] = useState<CargoItem[]>([
        {
            id: '1',
            shipmentId: '1',
            name: 'Electronics',
            quantity: 100,
            unit: 'boxes',
            description: 'Consumer electronics',
            specialHandling: 'Fragile',
            status: 'In Transit',
            temperature: 20,
            humidity: 45
        }
    ]);
    const [stats, setStats] = useState<DashboardStatsType>({
        activeShipments: 0,
        availableTrucks: 0,
        delayedShipments: 0,
        totalRevenue: 0,
    });

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

    // Truck management functions
    const addTruck = (truckData: { plateNumber: string; model: string; capacity: string }) => {
        const capacity = parseInt(truckData.capacity);
        if (isNaN(capacity)) return;
        setTrucks([...trucks, {
            id: Date.now().toString(),
            plateNumber: truckData.plateNumber,
            model: truckData.model,
            capacity,
            status: 'Available',
            lastMaintenance: '',
            fuelLevel: 0,
            mileage: 0
        }]);
    };

    const editTruck = (updatedTruck: Truck) => {
        setTrucks(trucks.map(truck => 
            truck.id === updatedTruck.id ? updatedTruck : truck
        ));
    };

    const deleteTruck = (truckId: string) => {
        if (confirm('Are you sure you want to delete this truck?')) {
            setTrucks(trucks.filter(truck => truck.id !== truckId));
        }
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
    };

    const addFuelUpdate = (fuelUpdate: FuelUpdate) => {
        setFuelHistory(prev => [...prev, fuelUpdate]);
    };

    // Shipment management functions
    const addShipment = (shipmentData: ShipmentFormData) => {
        setShipments([...shipments, {
            id: Date.now().toString(),
            truckId: shipmentData.truckId,
            destination: shipmentData.destination,
            departureDate: shipmentData.departureDate,
            arrivalDate: shipmentData.arrivalDate,
            status: 'Scheduled',
            driver: shipmentData.driver,
            origin: shipmentData.origin,
            cargo: shipmentData.cargo,
            weight: parseFloat(shipmentData.weight) || 0,
            customerContact: shipmentData.customerContact,
            priority: shipmentData.priority
        }]);
    };

    const editShipment = (shipment: Shipment) => {
        setShipments(shipments.map(s => 
            s.id === shipment.id ? shipment : s
        ));
    };

    const deleteShipment = (shipmentId: string) => {
        if (confirm('Are you sure you want to delete this shipment?')) {
            setShipments(shipments.filter(s => s.id !== shipmentId));
        }
    };

    const updateShipmentStatus = (shipmentId: string, updateData: StatusUpdateFormData) => {
        // Update shipment status
        setShipments(shipments.map(s =>
            s.id === shipmentId ? { ...s, status: updateData.status } : s
        ));

        // Update truck status if shipment is delivered
        if (updateData.status === 'Delivered') {
            const shipment = shipments.find(s => s.id === shipmentId);
            if (shipment) {
                setTrucks(trucks.map(t =>
                    t.id === shipment.truckId ? { ...t, status: 'Available' } : t
                ));
            }
        }
    };

    const addTrackingUpdate = (shipmentId: string, update: Omit<TrackingUpdate, 'id'>) => {
        const newUpdate = {
            ...update,
            id: Date.now().toString(),
        };
        setTrackingHistory(prev => [...prev, newUpdate]);
    };

    // Cargo management functions
    const addCargoItem = (shipmentId: string, data: CargoFormData) => {
        const newItem: CargoItem = {
            id: Date.now().toString(),
            shipmentId,
            name: data.name,
            quantity: parseInt(data.quantity),
            unit: data.unit,
            description: data.description,
            specialHandling: data.specialHandling,
            status: 'Loaded',
            temperature: data.temperature ? parseFloat(data.temperature) : undefined,
            humidity: data.humidity ? parseFloat(data.humidity) : undefined
        };
        setCargoItems(prev => [...prev, newItem]);
    };

    const updateCargoStatus = (cargoId: string, status: CargoItem['status']) => {
        setCargoItems(items => 
            items.map(item => 
                item.id === cargoId ? { ...item, status } : item
            )
        );
    };

    const updateCargoItem = (cargoName: string, data: CargoFormData) => {
        setCargoItems(items =>
            items.map(item =>
                item.name === cargoName
                    ? {
                        ...item,
                        name: data.name,
                        quantity: parseInt(data.quantity),
                        unit: data.unit,
                        description: data.description,
                        specialHandling: data.specialHandling,
                        temperature: data.temperature ? parseFloat(data.temperature) : undefined,
                        humidity: data.humidity ? parseFloat(data.humidity) : undefined
                    }
                    : item
            )
        );
    };

    const deleteCargoItem = (cargoId: string) => {
        setCargoItems(items => items.filter(item => item.id !== cargoId));
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

            <div className="p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Dashboard Stats */}
                <DashboardStats stats={stats} />

                <div className="grid grid-cols-1 gap-6">
                    {/* Shipment Tracking Section */}
                    <div className="space-y-6">
                        <ShipmentTracking
                            shipments={shipments}
                            trucks={trucks}
                            trackingHistory={trackingHistory}
                            onAddShipment={addShipment}
                            onEditShipment={editShipment}
                            onDeleteShipment={deleteShipment}
                            onUpdateShipmentStatus={updateShipmentStatus}
                            onAddTrackingUpdate={addTrackingUpdate}
                        />
                    </div>

                    {/* Fleet Management Section */}
                    <div className="space-y-6">
                        <FleetManagement
                            trucks={trucks}
                            fuelHistory={fuelHistory}
                            onAddTruck={addTruck}
                            onEditTruck={editTruck}
                            onDeleteTruck={deleteTruck}
                            onScheduleMaintenance={scheduleMaintenance}
                            onUpdateFuelLevel={updateFuelLevel}
                            onAddFuelUpdate={addFuelUpdate}
                        />
                    </div>

                    {/* Cargo Monitoring Section */}
                    <div className="space-y-6">
                        <CargoMonitoring
                            cargoItems={cargoItems}
                            shipments={shipments}
                            trucks={trucks}
                            onAddCargoItem={addCargoItem}
                            onUpdateCargoStatus={updateCargoStatus}
                            onUpdateCargoItem={updateCargoItem}
                            onDeleteCargoItem={deleteCargoItem}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
