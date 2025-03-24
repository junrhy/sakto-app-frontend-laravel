export type WidgetType = 
    | 'retail_sales'
    | 'retail_inventory'
    | 'retail_orders'
    | 'fnb_tables'
    | 'fnb_kitchen'
    | 'fnb_reservations';

export interface Widget {
    id: number;
    type: WidgetType;
    column: number;
    order: number;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface PageProps {
    auth: {
        user: User;
    };
} 