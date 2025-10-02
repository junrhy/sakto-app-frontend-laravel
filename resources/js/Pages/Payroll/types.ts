export interface Payroll {
    id: number;
    employee_id?: number;
    name: string;
    email: string;
    position: string;
    salary: number;
    startDate: string;
    status: 'active' | 'inactive';
}

export interface SalaryHistory {
    id: number;
    employee_id: string;
    previous_salary: number;
    new_salary: number;
    salary_change: number;
    percentage_change: number;
    change_reason: string;
    approved_by: string;
    effective_date: string;
    notes?: string;
}

export interface PayrollPeriod {
    id: number;
    period_name: string;
    start_date: string;
    end_date: string;
    status: 'draft' | 'processing' | 'completed' | 'cancelled';
    total_amount: number;
    employee_count: number;
    created_by: string;
    approved_by?: string;
    processed_at?: string;
    notes?: string;
}

export interface TimeTracking {
    id: number;
    employee_id: string;
    work_date: string;
    clock_in?: string;
    clock_out?: string;
    hours_worked: number;
    overtime_hours: number;
    regular_hours: number;
    status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
    notes?: string;
    location?: string;
}

export interface PayrollProps {
    currency_symbol?: string;
    auth: {
        user: any;
        project?: any;
        modules?: string[];
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
}
