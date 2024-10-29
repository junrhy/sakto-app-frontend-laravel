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
    // existing properties...
    contact_number: string | null;
}

export interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
    [key: string]: any;
} 