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