// Core entity types
export type FoodDeliveryRestaurant = {
    id: number;
    client_identifier: string;
    name: string;
    description?: string;
    logo?: string;
    cover_image?: string;
    address: string;
    coordinates?: string;
    phone: string;
    email?: string;
    operating_hours?: Record<string, { open: string; close: string }>;
    delivery_zones?: Array<{ name: string; coordinates: any }>;
    status: 'active' | 'inactive' | 'closed';
    rating?: number;
    delivery_fee: number;
    minimum_order_amount: number;
    estimated_prep_time: number;
    menu_items?: FoodDeliveryMenuItem[];
    created_at: string;
    updated_at: string;
};

export type FoodDeliveryMenuCategory = {
    id: number;
    client_identifier: string;
    name: string;
    description?: string;
    display_order: number;
    created_at: string;
    updated_at: string;
};

export type FoodDeliveryMenuItem = {
    id: number;
    client_identifier: string;
    restaurant_id: number;
    category_id?: number;
    name: string;
    description?: string;
    image?: string;
    price: number;
    discount_price?: number;
    effective_price?: number; // Calculated as discount_price || price
    is_available: boolean;
    is_featured: boolean;
    preparation_time: number;
    dietary_info?: {
        vegetarian?: boolean;
        vegan?: boolean;
        gluten_free?: boolean;
        halal?: boolean;
        spicy?: boolean;
    };
    restaurant?: FoodDeliveryRestaurant;
    category?: FoodDeliveryMenuCategory;
    created_at: string;
    updated_at: string;
};

export type FoodDeliveryOrder = {
    id: number;
    client_identifier: string;
    order_reference: string;
    customer_id?: number;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    customer_address: string;
    customer_coordinates?: string;
    restaurant_id: number;
    driver_id?: number;
    subtotal: number;
    delivery_fee: number;
    service_charge: number;
    discount: number;
    total_amount: number;
    payment_method: 'online' | 'cash_on_delivery';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    order_status:
        | 'pending'
        | 'accepted'
        | 'preparing'
        | 'ready'
        | 'assigned'
        | 'out_for_delivery'
        | 'delivered'
        | 'cancelled';
    special_instructions?: string;
    estimated_delivery_time?: string;
    restaurant?: FoodDeliveryRestaurant;
    driver?: FoodDeliveryDriver;
    order_items?: FoodDeliveryOrderItem[];
    trackings?: FoodDeliveryOrderTracking[];
    payments?: FoodDeliveryPayment[];
    created_at: string;
    updated_at: string;
};

export type FoodDeliveryOrderItem = {
    id: number;
    order_id: number;
    menu_item_id?: number;
    item_name: string;
    item_price: number;
    quantity: number;
    subtotal: number;
    special_instructions?: string;
    menu_item?: FoodDeliveryMenuItem;
    created_at: string;
    updated_at: string;
};

export type FoodDeliveryOrderTracking = {
    id: number;
    order_id: number;
    status:
        | 'pending'
        | 'accepted'
        | 'preparing'
        | 'ready'
        | 'assigned'
        | 'out_for_delivery'
        | 'delivered'
        | 'cancelled';
    location?: string;
    notes?: string;
    updated_by?: string;
    timestamp: string;
    created_at: string;
    updated_at: string;
};

export type FoodDeliveryDriver = {
    id: number;
    client_identifier: string;
    name: string;
    phone: string;
    email?: string;
    vehicle_type?: string;
    license_number?: string;
    status: 'available' | 'busy' | 'offline';
    current_location?: string;
    current_coordinates?: string;
    rating?: number;
    total_deliveries: number;
    orders?: FoodDeliveryOrder[];
    created_at: string;
    updated_at: string;
};

export type FoodDeliveryPayment = {
    id: number;
    order_id: number;
    payment_method: 'online' | 'cash_on_delivery';
    amount: number;
    payment_reference?: string;
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    payment_data?: Record<string, any>;
    created_at: string;
    updated_at: string;
};

// Form data types
export interface RestaurantFormData {
    name: string;
    description?: string;
    logo?: string;
    cover_image?: string;
    address: string;
    coordinates?: string;
    phone: string;
    email?: string;
    operating_hours?: Record<string, { open: string; close: string }>;
    delivery_zones?: Array<{ name: string; coordinates: any }>;
    status: 'active' | 'inactive' | 'closed';
    delivery_fee: string;
    minimum_order_amount: string;
    estimated_prep_time: string;
}

export interface MenuCategoryFormData {
    name: string;
    description?: string;
    display_order: string;
}

export interface MenuItemFormData {
    restaurant_id: string;
    category_id?: string;
    name: string;
    description?: string;
    image?: string;
    price: string;
    discount_price?: string;
    is_available: boolean;
    is_featured: boolean;
    preparation_time: string;
    dietary_info?: {
        vegetarian?: boolean;
        vegan?: boolean;
        gluten_free?: boolean;
        halal?: boolean;
        spicy?: boolean;
    };
}

export interface OrderFormData {
    customer_id?: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    customer_address: string;
    customer_coordinates?: string;
    restaurant_id: string;
    items: Array<{
        menu_item_id?: string;
        item_name: string;
        item_price: string;
        quantity: string;
        special_instructions?: string;
    }>;
    payment_method: 'online' | 'cash_on_delivery';
    special_instructions?: string;
}

export interface DriverFormData {
    name: string;
    phone: string;
    email?: string;
    vehicle_type?: string;
    license_number?: string;
    status: 'available' | 'busy' | 'offline';
    current_location?: string;
    current_coordinates?: string;
}

export interface CartItem {
    menu_item: FoodDeliveryMenuItem;
    quantity: number;
    special_instructions?: string;
    subtotal: number;
}

// Dashboard types
export interface RestaurantStats {
    total_orders: number;
    pending_orders: number;
    preparing_orders: number;
    ready_orders: number;
    delivered_orders: number;
    total_revenue: number;
    total_orders_trend?: number;
    total_revenue_trend?: number;
}

export interface OrderStats {
    total_orders: number;
    pending_orders: number;
    accepted_orders: number;
    preparing_orders: number;
    ready_orders: number;
    out_for_delivery_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    total_revenue: number;
}

// Status update form data
export interface StatusUpdateFormData {
    order_status:
        | 'pending'
        | 'accepted'
        | 'preparing'
        | 'ready'
        | 'assigned'
        | 'out_for_delivery'
        | 'delivered'
        | 'cancelled';
    location?: string;
    notes?: string;
}
