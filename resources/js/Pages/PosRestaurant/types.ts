export interface MenuItem {
    id: number;
    name: string;
    price: number;
    category: string;
    image?: string;
    public_image_url?: string;
    created_at?: string;
    updated_at?: string;
    is_available_personal?: boolean;
    is_available_online?: boolean;
    delivery_fee?: number;
}

export interface OrderItem extends MenuItem {
    quantity: number;
    uniqueId?: string;
    selected?: boolean;
    notes?: string;
}

export interface Table {
    id: number | string;
    numericId?: number;
    name: string;
    seats: number;
    location?: string;
    status: 'available' | 'occupied' | 'reserved' | 'joined';
    joined_with?: string;
    isJoinedTable?: boolean;
    originalTableIds?: number[];
}

export interface Reservation {
    id: number;
    name: string;
    date: string;
    time: string;
    guests: number;
    tableId: number;
    tableIds?: number[]; // For multiple table reservations
    status: 'pending' | 'confirmed' | 'cancelled';
    notes?: string;
    contact?: string;
    confirmation_token?: string | null;
    confirmed_at?: string | null;
}

export interface MenuItemFormData {
    name: string;
    price: number;
    category: string;
    image?: string;
    delivery_fee?: number;
}

export interface JoinedTable {
    id: number;
    tableIds: number[];
    name: string;
    seats: number;
    status: 'available' | 'occupied' | 'reserved' | 'joined';
}

export interface PageProps {
    menuItems: MenuItem[];
    tables: Table[];
    tab?: string;
    joinedTables?: JoinedTable[];
    sales?: Sale[];
    currency_symbol?: string;
}

export interface EditTableData {
    id: number;
    name: string;
    seats: number;
    location?: string;
}

export interface TableResponse {
    props: {
        table: {
            id: number;
            name: string;
            seats: number;
            status: 'available' | 'occupied' | 'reserved' | 'joined';
        };
    };
}

export interface Order {
    id: number;
    table_number: string;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    discount_type: 'percentage' | 'fixed';
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
}

export interface SplitBillData {
    method: 'equal' | 'item';
    amount: number;
    selectedItems: number[];
}

export interface QRCodeData {
    table: Table;
    customerName?: string;
    url: string;
}

export interface BlockedDate {
    id: number;
    blocked_date: string;
    timeslots: string[];
    reason?: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
}

export interface OpenedDate {
    id: number;
    opened_date: string;
    timeslots: string[];
    reason?: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
}

export interface Sale {
    id: number;
    table_number: string;
    items: string;
    subtotal: number;
    discount: number | null;
    discount_type: string | null;
    total: number;
    payment_amount: number | null;
    payment_method: string | null;
    change_amount: number;
    client_identifier: string;
    created_at: string;
    updated_at: string;
}
