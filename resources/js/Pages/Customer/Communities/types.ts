import { PageProps } from '@/types';

export interface CommunityCurrency {
    symbol?: string;
    code?: string;
    decimal_separator?: string;
    thousands_separator?: string;
}

export interface Community {
    id: number;
    name: string;
    email: string;
    contact_number: string;
    created_at: string;
    slug: string;
    identifier: string;
    app_currency?: CommunityCurrency | null;
    project_identifier?: string;
}

export interface CommunityCollectionItem {
    id?: number | string;
    name?: string;
    title?: string;
    description?: string;
    status?: string;
    [key: string]: unknown;
}

export interface HealthcareRecord {
    id: number | string;
    name?: string;
    status?: string;
    contact_number?: string;
    membership_start_date?: string;
    contribution_amount?: number | string;
    contribution_frequency?: string;
    gender?: string;
    group?: string | null;
    claims?: Array<Record<string, unknown>>;
    contributions?: Array<Record<string, unknown>>;
}

export interface MortuaryRecord {
    id: number | string;
    name?: string;
    status?: string;
    contact_number?: string;
    membership_start_date?: string;
    contribution_amount?: number | string;
    contribution_frequency?: string;
    gender?: string;
    group?: string | null;
    claims?: Array<Record<string, unknown>>;
    contributions?: Array<Record<string, unknown>>;
}

export interface LendingRecord {
    id: number | string;
    borrower_name?: string;
    status?: string;
    amount?: number | string;
    total_balance?: number | string;
    paid_amount?: number | string;
    interest_rate?: number | string;
    interest_type?: string;
    frequency?: string;
    start_date?: string;
    end_date?: string;
    installment_frequency?: string;
    installment_amount?: number | string;
    total_interest?: number | string;
    contact_number?: string;
    payments?: Array<{
        id?: number | string;
        amount?: number | string;
        payment_date?: string | null;
        reference_number?: string | null;
        method?: string | null;
    }>;
    bills?: Array<{
        id?: number | string;
        amount?: number | string;
        due_date?: string | null;
        status?: string | null;
    }>;
}

export interface CommunitiesProps extends PageProps {
    communities: Community[];
    joinedCommunityIds: number[];
    pendingRequestIds: number[];
}

export interface CommunityDetailProps extends PageProps {
    community: Community;
    isJoined: boolean;
    isPending: boolean;
    joinedAt?: string | null;
    challenges: CommunityCollectionItem[];
    events: CommunityCollectionItem[];
    pages: CommunityCollectionItem[];
    updates: CommunityCollectionItem[];
    products: CommunityCollectionItem[];
    courses: CommunityCollectionItem[];
    orderHistory: CommunityCollectionItem[];
    lendingRecords: LendingRecord[];
    healthcareRecords: HealthcareRecord[];
    mortuaryRecords: MortuaryRecord[];
    appUrl?: string;
}

export type CommunityFilter = 'my' | 'all';

