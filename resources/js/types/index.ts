export interface Address {
    id?: number;
    address_type: string;
    street: string;
    unit_number?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_primary?: boolean;
    delivery_instructions?: string;
    phone?: string;
}

export interface User {
    id?: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    contact_number?: string | null;
}

export interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            identifier?: string;
            credits?: number;
        };
    };
    [key: string]: any;
}

export type WidgetType = "retail_sales" 
    | "retail_inventory" 
    | "retail_orders" 
    | "fnb_tables" 
    | "fnb_kitchen" 
    | "fnb_reservations" 
    | "family_tree_stats";

export interface Widget {
    id: number;
    type: WidgetType;
    column: number;
    dashboard_id: number;
    // Add any other properties that your widgets use
}

export interface Dashboard {
    id: number;
    name: string;
    favorite: boolean;
    column_count: 1 | 2 | 3;
    widgets: Widget[];
}

export interface WidgetProps {
    className?: string;
} 