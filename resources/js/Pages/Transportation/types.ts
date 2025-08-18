export type MaintenanceRecord = {
    id: string;
    truckId: string;
    date: string;
    type: 'Routine' | 'Repair';
    description: string;
    cost: number;
};

export type Truck = {
    id: string;
    plateNumber: string;
    model: string;
    capacity: number;
    status: 'Available' | 'In Transit' | 'Maintenance';
    lastMaintenance: string;
    fuelLevel: number;
    mileage: number;
    driver?: string;
    driverContact?: string;
};
  
export type Shipment = {
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

export interface TruckFormData {
    plateNumber: string;
    model: string;
    capacity: string;
    driver?: string;
    driverContact?: string;
}

export interface ShipmentFormData {
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

export type TrackingUpdate = {
    id: string;
    shipmentId: string;
    status: Shipment['status'];
    location: string;
    timestamp: string;
    notes?: string;
    updatedBy: string;
};

export interface StatusUpdateFormData {
    status: Shipment['status'];
    location: string;
    notes: string;
}

export type FuelUpdate = {
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

export interface FuelUpdateFormData {
    litersAdded: string;
    cost: string;
    location: string;
}

export type CargoItem = {
    id: string;
    shipmentId: string;
    name: string;
    quantity: number;
    unit: 'kg' | 'pieces' | 'pallets' | 'boxes';
    description?: string;
    specialHandling?: string;
    status: 'Loaded' | 'In Transit' | 'Delivered' | 'Damaged';
    temperature?: number;
    humidity?: number;
};

export interface CargoFormData {
    name: string;
    quantity: string;
    unit: CargoItem['unit'];
    description: string;
    specialHandling: string;
    temperature?: string;
    humidity?: string;
}

export interface DashboardStats {
    activeShipments: number;
    availableTrucks: number;
    delayedShipments: number;
    totalRevenue: number;
}
