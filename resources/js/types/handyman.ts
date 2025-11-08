export interface HandymanTechnician {
    id: number;
    client_identifier: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    specialty?: string | null;
    skills?: string[];
    status: 'available' | 'assigned' | 'off-duty' | 'on-leave';
    location?: string | null;
    current_load: number;
    active_assignments_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface HandymanTaskAssignment {
    id: number;
    technician_id: number;
    assigned_start_at?: string | null;
    assigned_end_at?: string | null;
    is_primary: boolean;
    conflict_status?: 'none' | 'overlap' | 'double_booked';
    technician?: HandymanTechnician;
}

export interface HandymanTask {
    id: number;
    client_identifier: string;
    reference_number: string;
    title: string;
    description?: string | null;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    scheduled_start_at?: string | null;
    scheduled_end_at?: string | null;
    location?: string | null;
    coordinates?: Record<string, unknown> | null;
    tags?: string[] | null;
    required_resources?: string[] | null;
    assignments?: HandymanTaskAssignment[];
}

export interface HandymanWorkOrderTimeLog {
    id: number;
    technician_id?: number | null;
    started_at: string;
    ended_at?: string | null;
    duration_minutes?: number | null;
    notes?: string | null;
    technician?: HandymanTechnician;
}

export interface HandymanWorkOrderAttachment {
    id: number;
    file_path: string;
    file_type?: string | null;
    thumbnail_path?: string | null;
    uploaded_by?: number | null;
    description?: string | null;
}

export interface HandymanWorkOrder {
    id: number;
    client_identifier: string;
    reference_number: string;
    status:
        | 'draft'
        | 'assigned'
        | 'in_progress'
        | 'awaiting_approval'
        | 'completed'
        | 'cancelled';
    task_id?: number | null;
    technician_id?: number | null;
    customer_name?: string | null;
    customer_contact?: string | null;
    customer_address?: string | null;
    scope_of_work?: string | null;
    materials?: string[] | null;
    checklist?: Array<{ label: string; completed: boolean }> | null;
    approval?: Record<string, unknown> | null;
    scheduled_at?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    notes?: string | null;
    task?: HandymanTask | null;
    technician?: HandymanTechnician | null;
    time_logs?: HandymanWorkOrderTimeLog[];
    attachments?: HandymanWorkOrderAttachment[];
}

export interface HandymanInventoryItem {
    id: number;
    client_identifier: string;
    sku?: string | null;
    name: string;
    type: 'tool' | 'consumable';
    category?: string | null;
    unit?: string | null;
    quantity_on_hand: number;
    quantity_available: number;
    reorder_level: number;
    minimum_stock: number;
    requires_check_in: boolean;
    metadata?: Record<string, unknown> | null;
}

export interface HandymanInventoryTransaction {
    id: number;
    client_identifier: string;
    inventory_item_id: number;
    technician_id?: number | null;
    work_order_id?: number | null;
    transaction_type: 'check_out' | 'check_in' | 'consume' | 'adjust';
    quantity: number;
    details?: Record<string, unknown> | null;
    transaction_at?: string | null;
    recorded_by?: number | null;
    item?: HandymanInventoryItem;
    technician?: HandymanTechnician | null;
}

export interface HandymanTaskOverview {
    status: string;
    total: number;
}
