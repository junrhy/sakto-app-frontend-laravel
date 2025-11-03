export interface Payment {
    id: number;
    loan_id: number;
    payment_date: string;
    amount: number;
}

export interface Loan {
    id: number;
    borrower_name: string;
    amount: string;
    interest_rate: string;
    start_date: string;
    end_date: string;
    status: 'active' | 'paid' | 'defaulted';
    frequency: 'daily' | 'monthly' | 'quarterly' | 'annually';
    interest_type: 'fixed' | 'compounding';
    total_interest: string;
    total_balance: string;
    paid_amount: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
    payments?: Payment[];
    installment_frequency?:
        | 'weekly'
        | 'bi-weekly'
        | 'monthly'
        | 'quarterly'
        | 'annually'
        | null;
    installment_amount?: string | null;
}

export interface DeleteWarningInfo {
    activeLoans: number;
    totalAmount: number;
}

export interface Bill {
    id: number;
    loan_id: number;
    bill_number: number;
    due_date: string;
    principal: string;
    interest: string;
    total_amount: string;
    total_amount_due: string;
    penalty_amount: string;
    note: string | null;
    status: 'pending' | 'paid' | 'overdue';
    client_identifier: string;
    created_at: string;
    updated_at: string;
    installment_amount?: string | null;
}

export interface LoanDuration {
    label: string;
    days: number | null;
}

export interface CreditScore {
    score: number;
    label: string;
    color: string;
}

export interface InstallmentOption {
    label: string;
    value: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually';
    daysInterval: number;
}

export interface BillStatusUpdate {
    status: 'pending' | 'paid' | 'overdue';
    note?: string;
}

export interface DeletePaymentInfo {
    id: number;
    amount: string;
}

