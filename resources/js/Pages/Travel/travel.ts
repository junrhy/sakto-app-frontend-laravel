export type TravelPackageStatus = 'draft' | 'published' | 'archived';
export type TravelPackageType = 'standard' | 'premium' | 'luxury' | string;

export interface TravelPackage {
    id: number;
    client_identifier: string;
    title: string;
    slug: string;
    tagline?: string | null;
    description?: string | null;
    duration_days?: number | null;
    duration_label?: string | null;
    price: number;
    inclusions?: string[];
    package_type: TravelPackageType;
    status: TravelPackageStatus;
    is_featured: boolean;
    media?: string[] | null;
    created_at: string;
    updated_at: string;
    bookings_count?: number;
}

export type TravelBookingStatus =
    | 'pending'
    | 'confirmed'
    | 'cancelled'
    | 'completed'
    | 'rescheduled'
    | string;

export type TravelPaymentStatus =
    | 'unpaid'
    | 'partial'
    | 'paid'
    | 'refunded'
    | string;

export interface TravelBooking {
    id: number;
    client_identifier: string;
    travel_package_id: number;
    booking_reference: string;
    customer_name: string;
    customer_email?: string | null;
    customer_contact_number?: string | null;
    travel_date: string;
    travelers_count: number;
    total_price: number;
    status: TravelBookingStatus;
    payment_status: TravelPaymentStatus;
    notes?: string | null;
    metadata?: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    package?: Pick<TravelPackage, 'id' | 'title' | 'slug'>;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
    first_page_url?: string;
    last_page_url?: string;
    next_page_url?: string | null;
    prev_page_url?: string | null;
    path?: string;
}

export interface AppCurrencySettings {
    symbol: string;
    decimal_separator?: string;
    thousands_separator?: string;
}

