import { Config } from 'ziggy-js';

export interface ProjectModule {
    id: number;
    name: string;
    identifier: string;
}

export interface Project {
    id: number;
    name: string;
    modules: ProjectModule[];
}

export interface User {
    name: string;
    email: string;
    project?: {
        modules?: Array<{
            identifier: string;
        }>;
    };
}

export interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
            // Add other user properties as needed
        };
    };
}

export enum WidgetType {
    Chart = 'chart',
    Table = 'table',
    // Add other widget types as needed
}

export interface Widget {
    id: number;
    type: WidgetType;
    column: number;
    order: number;
    dashboard_id: number;
    user_id: number;
}

export interface Product {
    id: number;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    images: string[];
    category_id?: number;
    description?: string;
    status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}
