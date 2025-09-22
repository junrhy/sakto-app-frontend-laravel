export interface Appointment {
    id: number;
    client_identifier: string;
    patient_id: number;
    is_priority_patient: boolean;
    priority_level: number;
    vip_tier?: string;
    patient_name: string;
    patient_phone?: string;
    patient_email?: string;
    appointment_date: string;
    appointment_time: string;
    appointment_type: 'consultation' | 'follow_up' | 'emergency' | 'checkup' | 'procedure';
    notes?: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    doctor_name?: string;
    fee?: number;
    payment_status: 'pending' | 'paid' | 'partial';
    cancellation_reason?: string;
    cancelled_at?: string;
    created_at: string;
    updated_at: string;
    priority_display?: string;
    vip_tier_config?: {
        name: string;
        icon: string;
        color: string;
        class: string;
    };
    patient?: {
        id: number;
        name: string;
        phone?: string;
        email?: string;
    };
}

export interface NewAppointment {
    patient_id: number;
    appointment_date: string;
    appointment_time: string;
    appointment_type: 'consultation' | 'follow_up' | 'emergency' | 'checkup' | 'procedure';
    notes?: string;
    doctor_name?: string;
    fee?: number;
}

export interface AppointmentFilters {
    status?: string;
    date?: string;
    patient_id?: number;
}

export interface AppointmentStatusUpdate {
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    cancellation_reason?: string;
}
