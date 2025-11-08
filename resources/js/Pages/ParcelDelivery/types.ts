// Core entity types
export type ParcelDelivery = {
    id: number;
    client_identifier: string;
    delivery_reference: string;
    delivery_type: 'express' | 'standard' | 'economy';

    // Sender information
    sender_name: string;
    sender_phone: string;
    sender_email?: string;
    sender_address: string;
    sender_coordinates?: string;

    // Recipient information
    recipient_name: string;
    recipient_phone: string;
    recipient_email?: string;
    recipient_address: string;
    recipient_coordinates?: string;

    // Package details
    package_description: string;
    package_weight: number;
    package_length?: number;
    package_width?: number;
    package_height?: number;
    package_value?: number;

    // Pricing
    distance_km?: number;
    base_rate: number;
    distance_rate: number;
    weight_rate: number;
    size_rate: number;
    delivery_type_multiplier: number;
    estimated_cost?: number;
    final_cost?: number;

    // Delivery schedule
    pickup_date: string;
    pickup_time: string;
    estimated_delivery_date?: string;
    estimated_delivery_time?: string;
    actual_delivery_date?: string;
    actual_delivery_time?: string;

    // Courier assignment
    courier_id?: number;
    courier_name?: string;
    courier_phone?: string;
    courier?: ParcelDeliveryCourier;

    // Status
    status:
        | 'pending'
        | 'confirmed'
        | 'scheduled'
        | 'out_for_pickup'
        | 'picked_up'
        | 'at_warehouse'
        | 'in_transit'
        | 'out_for_delivery'
        | 'delivery_attempted'
        | 'delivered'
        | 'returned'
        | 'returned_to_sender'
        | 'on_hold'
        | 'failed'
        | 'cancelled';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    payment_method?: string;

    // External service integration
    external_service?: string;
    external_order_id?: string;
    external_tracking_url?: string;

    // Metadata
    special_instructions?: string;
    notes?: string;
    pricing_breakdown?: Record<string, any>;

    // Tracking
    trackings?: ParcelDeliveryTracking[];

    created_at: string;
    updated_at: string;
};

export type ParcelDeliveryTracking = {
    id: number;
    parcel_delivery_id: number;
    status:
        | 'pending'
        | 'confirmed'
        | 'scheduled'
        | 'out_for_pickup'
        | 'picked_up'
        | 'at_warehouse'
        | 'in_transit'
        | 'out_for_delivery'
        | 'delivery_attempted'
        | 'delivered'
        | 'returned'
        | 'returned_to_sender'
        | 'on_hold'
        | 'failed'
        | 'cancelled';
    location?: string;
    notes?: string;
    updated_by?: string;
    timestamp: string;
    created_at: string;
    updated_at: string;
};

export type ParcelDeliveryCourier = {
    id: number;
    client_identifier: string;
    name: string;
    phone: string;
    email?: string;
    vehicle_type?: string;
    status: 'available' | 'busy' | 'offline';
    current_location?: string;
    current_coordinates?: string;
    notes?: string;
    deliveries?: ParcelDelivery[];
    created_at: string;
    updated_at: string;
};

export type ParcelDeliveryPricingConfig = {
    id: number;
    client_identifier: string;
    config_name: string;
    base_rates?: {
        express: number;
        standard: number;
        economy: number;
    };
    distance_rate_per_km: number;
    weight_rates?: {
        '0-5': number;
        '5-10': number;
        '10-20': number;
        '20+': number;
    };
    size_rate_per_cubic_cm: number;
    delivery_type_multipliers?: {
        express: number;
        standard: number;
        economy: number;
    };
    surcharges?: {
        fuel: number;
        peak_hour: number;
        weekend: number;
        holiday: number;
        urgent: number;
    };
    peak_hours?: string[][];
    holidays?: string[];
    insurance_rate: number;
    minimum_charge: number;
    currency: string;
    currency_symbol: string;
    decimal_places: number;
    is_active: boolean;
    version: string;
    description?: string;
    created_at: string;
    updated_at: string;
};

export type ParcelDeliveryExternalIntegration = {
    id: number;
    client_identifier: string;
    service_name: string;
    api_key?: string;
    api_secret?: string;
    is_active: boolean;
    settings?: Record<string, any>;
    description?: string;
    created_at: string;
    updated_at: string;
};

// Form data types
export interface ParcelDeliveryFormData {
    delivery_type: 'express' | 'standard' | 'economy';
    sender_name: string;
    sender_phone: string;
    sender_email?: string;
    sender_address: string;
    sender_coordinates?: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_email?: string;
    recipient_address: string;
    recipient_coordinates?: string;
    package_description: string;
    package_weight: string;
    package_length?: string;
    package_width?: string;
    package_height?: string;
    package_value?: string;
    distance_km?: string;
    pickup_date: string;
    pickup_time: string;
    special_instructions?: string;
    is_urgent?: boolean;
}

export interface CourierFormData {
    name: string;
    phone: string;
    email?: string;
    vehicle_type?: string;
    status: 'available' | 'busy' | 'offline';
    current_location?: string;
    current_coordinates?: string;
    notes?: string;
}

export interface PricingConfigFormData {
    config_name: string;
    base_rates: {
        express: string;
        standard: string;
        economy: string;
    };
    distance_rate_per_km: string;
    weight_rates: {
        '0-5': string;
        '5-10': string;
        '10-20': string;
        '20+': string;
    };
    size_rate_per_cubic_cm: string;
    delivery_type_multipliers: {
        express: string;
        standard: string;
        economy: string;
    };
    surcharges: {
        fuel: string;
        peak_hour: string;
        weekend: string;
        holiday: string;
        urgent: string;
    };
    insurance_rate: string;
    minimum_charge: string;
}

export interface ExternalIntegrationFormData {
    service_name: string;
    api_key?: string;
    api_secret?: string;
    is_active: boolean;
    settings?: Record<string, any>;
    description?: string;
}

// Pricing calculation types
export type PricingCalculation = {
    base_rate: number;
    distance_rate: number;
    weight_rate: number;
    size_rate: number;
    delivery_type_multiplier: number;
    fuel_surcharge: number;
    peak_hour_surcharge: number;
    weekend_surcharge: number;
    holiday_surcharge: number;
    urgent_surcharge: number;
    insurance_cost: number;
    estimated_cost: number;
    minimum_charge: number;
    pricing_breakdown: {
        delivery_type: string;
        distance_km: number;
        package_weight_kg: number;
        package_volume_cm3: number;
        package_value: number;
        is_urgent: boolean;
        peak_hour: boolean;
        weekend_delivery: boolean;
        holiday_delivery: boolean;
        config_used: string;
        config_version: string;
    };
    pricing_version: string;
};

// Dashboard types
export interface DeliveryStats {
    total_deliveries: number;
    pending_deliveries: number;
    in_transit_deliveries: number;
    delivered_deliveries: number;
    total_revenue: number;
    // Trend data
    total_deliveries_trend?: number;
    pending_deliveries_trend?: number;
    in_transit_deliveries_trend?: number;
    delivered_deliveries_trend?: number;
    total_revenue_trend?: number;
}

// Status update form data
export interface StatusUpdateFormData {
    status:
        | 'pending'
        | 'confirmed'
        | 'scheduled'
        | 'out_for_pickup'
        | 'picked_up'
        | 'at_warehouse'
        | 'in_transit'
        | 'out_for_delivery'
        | 'delivery_attempted'
        | 'delivered'
        | 'returned'
        | 'returned_to_sender'
        | 'on_hold'
        | 'failed'
        | 'cancelled';
    location?: string;
    notes?: string;
}
