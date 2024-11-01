export type WidgetType = "sales" | "inventory" | "orders" | "tables" | "kitchen" | "reservations";

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