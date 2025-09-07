// Core entity types
export type Truck = {
    id: string;
    plate_number: string;
    model: string;
    capacity: number;
    status: string;
    driver?: string;
    driver_contact?: string;
    last_maintenance?: string | null;
    fuel_level?: string;
    mileage?: number;
    created_at?: string;
    updated_at?: string;
};

export type Helper = {
    name: string;
    role: string;
};

export type Booking = {
    id: number;
    booking_reference: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_company: string;
    pickup_location: string;
    delivery_location: string;
    pickup_date: string;
    pickup_time: string;
    delivery_date: string;
    delivery_time: string;
    cargo_description: string;
    cargo_weight: number;
    cargo_unit: string;
    special_requirements: string;
    estimated_cost: number;
    status: string;
    notes: string;
    payment_status: string;
    payment_method?: string;
    payment_reference?: string;
    paid_amount?: number;
    payment_date?: string;
    payment_notes?: string;
    created_at: string;
    updated_at: string;
    truck: Truck;
};

export type Shipment = {
    id: string;
    truck_id: string;
    driver: string;
    helpers?: Helper[];
    destination: string;
    origin: string;
    departure_date: string;
    arrival_date: string;
    status: 'Scheduled' | 'In Transit' | 'Delivered' | 'Delayed';
    cargo: string;
    weight: number;
    current_location?: string;
    estimated_delay?: number;
    customer_contact: string;
    priority: 'Low' | 'Medium' | 'High';
    tracking_updates?: TrackingUpdate[];
    truck?: Truck;
};

export type CargoItem = {
    id: string;
    shipment_id: string;
    name: string;
    quantity: number;
    unit: 'kg' | 'pieces' | 'pallets' | 'boxes';
    description?: string;
    special_handling?: string;
    status: 'Loaded' | 'In Transit' | 'Delivered' | 'Damaged';
    temperature?: number;
    humidity?: number;
};

// History and update types
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

export type MaintenanceRecord = {
    id: string;
    truckId: string;
    date: string;
    type: 'Routine' | 'Repair';
    description: string;
    cost: number;
};

export type TrackingUpdate = {
    id: string;
    shipment_id: string;
    status: Shipment['status'];
    location: string;
    timestamp: string;
    notes?: string;
    updated_by: string;
};

// Form data types
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
    helpers?: Helper[];
}

export interface CargoFormData {
    name: string;
    quantity: string;
    unit: CargoItem['unit'];
    description: string;
    specialHandling: string;
    temperature?: string;
    humidity?: string;
}

export interface FuelUpdateFormData {
    litersAdded: string;
    cost: string;
    location: string;
}

export interface StatusUpdateFormData {
    status: Shipment['status'];
    location: string;
    notes: string;
}

// Dashboard types
export interface DashboardStats {
    activeShipments: number;
    availableTrucks: number;
    delayedShipments: number;
    totalRevenue: number;
}
