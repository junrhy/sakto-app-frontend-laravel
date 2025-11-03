import { formatAmount } from '@/lib/utils';
import type {
    CbuContribution,
    CbuDividend,
    CbuHistory,
    CbuWithdrawal,
} from './types';

export const formatCbuAmount = (
    amount: string | number,
    currency: any,
): string => {
    return formatAmount(amount, currency);
};

export const calculateNumberOfShares = (
    totalAmount: string,
    valuePerShare: string,
): number => {
    if (!totalAmount || !valuePerShare) return 0;
    const total = parseFloat(totalAmount);
    const value = parseFloat(valuePerShare);
    if (value === 0) return 0;
    return Math.ceil(total / value);
};

export const combineFundHistory = (
    contributions: CbuContribution[],
    withdrawals: CbuWithdrawal[],
    dividends: CbuDividend[],
): CbuHistory[] => {
    const history: CbuHistory[] = [];

    contributions.forEach((contribution) => {
        history.push({
            id: contribution.id,
            type: 'contribution',
            amount: contribution.amount,
            date: contribution.contribution_date,
            notes: contribution.notes,
            created_at: contribution.created_at,
        });
    });

    withdrawals.forEach((withdrawal) => {
        history.push({
            id: withdrawal.id,
            type: 'withdrawal',
            amount: withdrawal.amount,
            date: withdrawal.date,
            notes: withdrawal.notes,
            created_at: withdrawal.created_at,
        });
    });

    dividends.forEach((dividend) => {
        history.push({
            id: dividend.id,
            type: 'dividend',
            amount: dividend.amount,
            date: dividend.dividend_date,
            notes: dividend.notes,
            created_at: dividend.created_at,
        });
    });

    // Sort by date (most recent first)
    return history.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
    });
};
