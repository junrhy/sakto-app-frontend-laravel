export interface CbuFund {
    id: number;
    name: string;
    description: string | null;
    target_amount: string;
    start_date: string;
    end_date: string | null;
    total_amount: string;
    value_per_share: string;
    number_of_shares: number;
    created_at: string;
    updated_at: string;
}

export interface CbuContribution {
    id: number;
    cbu_fund_id: number;
    amount: string;
    contribution_date: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface CbuWithdrawal {
    id: number;
    cbu_fund_id: number;
    action: string;
    amount: string;
    notes: string | null;
    date: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
}

export interface CbuDividend {
    id: number;
    cbu_fund_id: number;
    amount: string;
    dividend_date: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface CbuHistory {
    id: number;
    type: 'contribution' | 'withdrawal' | 'dividend';
    amount: string;
    date: string;
    notes: string | null;
    created_at: string;
}

export interface CbuReport {
    total_funds: number;
    total_contributions: string;
    total_withdrawals: string;
    total_dividends: string;
    active_funds: number;
    recent_activities: Array<{
        id: number;
        cbu_fund_id: number;
        action: 'contribution' | 'withdrawal' | 'dividend';
        amount: string;
        notes: string | null;
        date: string;
        client_identifier: string;
        created_at: string;
        updated_at: string;
        fund: {
            id: number;
            name: string;
            description: string;
            target_amount: string;
            total_amount: string;
            frequency: string;
            start_date: string;
            end_date: string | null;
            status: string;
            client_identifier: string;
            created_at: string;
            updated_at: string;
        };
    }>;
}

export interface Props {
    auth: {
        user: any;
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
    cbuFunds: CbuFund[];
    appCurrency: {
        symbol: string;
        code: string;
        name: string;
    };
}

export interface NewFundData {
    name: string;
    description: string;
    target_amount: string;
    start_date: string;
    end_date: string;
    value_per_share: string;
    total_amount: string;
    number_of_shares: number;
}

export interface ContributionData {
    cbu_fund_id: string;
    amount: string;
    contribution_date: string;
    notes: string;
}

export interface WithdrawalData {
    cbu_fund_id: string;
    amount: string;
    withdrawal_date: string;
    notes: string;
}

export interface DividendData {
    cbu_fund_id: string;
    amount: string;
    dividend_date: string;
    notes: string;
}

export interface ReportDateRange {
    start_date: string;
    end_date: string;
}

export interface ReportEmailData {
    email: string;
    message: string;
}
