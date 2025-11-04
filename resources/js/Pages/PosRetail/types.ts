import { PageProps } from '@/types';

export interface Variant {
    id: number;
    sku?: string;
    barcode?: string;
    price?: number;
    quantity: number;
    attributes: Record<string, string>;
    image?: string;
    is_active: boolean;
}

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
    variants?: Variant[];
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
    variant_id?: number;
    variant_attributes?: Record<string, string>;
    product_id?: number; // Original product ID if variant is used
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

export interface Discount {
    id: number;
    name: string;
    description?: string;
    type: 'percentage' | 'fixed' | 'buy_x_get_y';
    value: number;
    min_quantity?: number;
    buy_quantity?: number;
    get_quantity?: number;
    min_purchase_amount?: number;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
    applicable_items?: number[];
    applicable_categories?: number[];
    usage_limit?: number;
    usage_count?: number;
}

export interface Props extends PageProps {
    products: Product[];
    categories: Category[];
    appCurrency: any;
    activeDiscounts?: Discount[];
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
