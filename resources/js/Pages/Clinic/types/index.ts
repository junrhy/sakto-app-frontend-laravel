export type ClinicPaymentAccount = {
    id: number;
    client_identifier: string;
    account_type: 'group' | 'company';
    account_name: string;
    account_code: string;
    description?: string;
    contact_person?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    credit_limit: number;
    status: 'active' | 'inactive' | 'suspended';
    billing_settings?: any;
    created_at: string;
    updated_at: string;
    patients?: Patient[];
    patients_count?: number;
    total_outstanding?: number;
    total_bills?: number;
    total_payments?: number;
    bills?: BillItem[];
    payments?: PaymentItem[];
};

export type BillItem = {
    id: number;
    patient_id: number;
    bill_number: string;
    bill_date: string;
    bill_amount: string;
    bill_status: string | null;
    bill_details: string;
    billing_type?: 'individual' | 'account';
    clinic_payment_account_id?: number;
    account_bill_reference?: string;
    clinic_payment_account?: ClinicPaymentAccount;
    patient?: Patient;
    billing_info?: {
        type: 'individual' | 'account';
        account_name?: string;
        patient_name: string;
        reference: string;
    };
    created_at: string;
    updated_at: string;
};

export type PaymentItem = {
    id: number;
    patient_id: number;
    payment_date: string;
    payment_amount: string;
    payment_method: string;
    payment_notes: string;
    payment_type?: 'individual' | 'account';
    clinic_payment_account_id?: number;
    account_payment_reference?: string;
    covered_patients?: number[];
    clinic_payment_account?: ClinicPaymentAccount;
    patient?: Patient;
    payment_info?: {
        type: 'individual' | 'account';
        account_name?: string;
        patient_name?: string;
        reference?: string;
        covered_patients_count: number;
    };
    created_at: string;
    updated_at: string;
};

export type CheckupResult = {
    id: number;
    checkup_date: string;
    diagnosis: string;
    treatment: string;
    notes: string;
};

export type ToothData = {
    id: number;
    status: 'healthy' | 'decayed' | 'filled' | 'missing';
};

export type Patient = {
    id: string;
    arn: string;
    name: string;
    email: string;
    phone: string;
    birthdate: string;
    next_visit_date: string;
    next_visit_time: string;
    billing_type?: 'individual' | 'account';
    clinic_payment_account_id?: number;
    clinic_payment_account?: ClinicPaymentAccount;
    billing_display_name?: string;
    total_bills: number;
    total_payments: number;
    balance: number;
    bills: BillItem[];
    payments: PaymentItem[];
    checkups: CheckupResult[];
    dental_chart: ToothData[];
};

export type AppCurrency = {
    symbol: string;
    code: string;
};

export type CheckupDate = {
    date: Date | undefined;
};

export type TimePickerProps = {
    value: string;
    onChange: (value: string) => void;
};

export type NewPatient = {
    arn?: string;
    name: string;
    dateOfBirth: string;
    contactNumber: string;
    email: string;
};

export type NewCheckupResult = Omit<CheckupResult, 'id'> & { date: string };

export type EditingNextVisit = {
    patientId: string;
    date: string;
};

export type HistoryType = 'bill' | 'checkup' | 'payment' | null;

export interface ClinicProps {
    auth: {
        user: any & {
            is_admin?: boolean;
        };
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
    initialPatients: Patient[];
    appCurrency: AppCurrency | null;
    error: any;
}

// Re-export appointment types
export * from './appointment';
