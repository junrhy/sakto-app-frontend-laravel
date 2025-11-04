import { PageProps } from '@/types';

export interface Product {
    id: number;
    name: string;
    price: number;
    price_formatted: string;
    images: string[] | null;
    quantity: number;
    sku?: string;
    category_id?: number;
    description?: string;
    status?: 'in_stock' | 'low_stock' | 'out_of_stock';
    barcode?: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    price_formatted: string;
}

export interface Sale {
    id: number;
    created_at: string;
    items: SaleItem[];
    total_amount: string;
    cash_received: string;
    change: string;
    payment_method: string;
}

export interface SaleItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

export interface SalesOverview {
    todaySales: number;
    weeklySales: number;
    currency_symbol: string;
}

export interface ProductFormData {
    name: string;
    sku: string;
    price: number;
    quantity: number;
    category_id: number;
    description?: string;
    images?: File[];
}

export interface Props extends PageProps {
    products: Product[];
    categories: Category[];
    appCurrency: any;
}

export interface InventoryProps extends PageProps {
    inventory: Product[];
    categories: Category[];
    appCurrency: any;
}

export interface SalesProps extends PageProps {
    sales: Sale[];
    appCurrency: any;
}
