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
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    identifier?: string;
    app_currency?: {
        symbol: string;
    };
    credits?: number;
    is_admin?: boolean;
    project_identifier?: string;
    theme?: 'light' | 'dark' | 'system';
    theme_color?: string;
}

export interface PageProps {
    auth: {
        user: User;
    };
    app?: {
        name: string;
    };
    [key: string]: any;
}

export type WidgetType = "retail_sales" 
    | "retail_inventory" 
    | "retail_orders" 
    | "fnb_tables" 
    | "fnb_kitchen" 
    | "fnb_reservations" 
    | "family_tree_stats"
    | "contacts"
    | "emails_sent"
    | "loan_stats"
    | "payroll_stats"
    | "rental_item_stats"
    | "sms_stats";

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