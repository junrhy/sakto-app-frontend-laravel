import type { Loan, Payment, CreditScore, InstallmentOption } from './types';
import { INSTALLMENT_OPTIONS } from './constants';

export const formatAmount = (amount: string | number, currency: any): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const parts = numAmount.toFixed(2).split('.');
    parts[0] = parts[0].replace(
        /\B(?=(\d{3})+(?!\d))/g,
        currency.thousands_separator,
    );
    return `${currency.symbol}${parts.join('.')}`;
};

export const calculateCreditScore = (loan: Loan, payments: Payment[]): CreditScore => {
    // Base score starts at 650
    let score = 650;

    // Get loan payments for this specific loan
    const loanPayments = payments.filter(
        (payment) => payment.loan_id === loan.id,
    );

    // Payment history impact (max +200 points)
    const paymentRatio =
        parseFloat(loan.paid_amount) / parseFloat(loan.total_balance);
    score += Math.round(paymentRatio * 200);

    // Loan status impact
    switch (loan.status) {
        case 'paid':
            score += 150; // Fully paid loans boost score significantly
            break;
        case 'active':
            // No impact for active loans
            break;
        case 'defaulted':
            score -= 300; // Major penalty for defaulted loans
            break;
    }

    // Final score adjustments
    score = Math.max(300, Math.min(850, score)); // Keep score between 300-850

    // Determine credit rating label and color
    let label: string;
    let color: string;

    if (score >= 800) {
        label = 'Excellent';
        color = 'text-green-600 dark:text-green-400';
    } else if (score >= 740) {
        label = 'Very Good';
        color = 'text-emerald-600 dark:text-emerald-400';
    } else if (score >= 670) {
        label = 'Good';
        color = 'text-blue-600 dark:text-blue-400';
    } else if (score >= 580) {
        label = 'Fair';
        color = 'text-yellow-600 dark:text-yellow-400';
    } else {
        label = 'Poor';
        color = 'text-red-600 dark:text-red-400';
    }

    return { score, label, color };
};

export const calculateInstallmentAmount = (
    totalAmount: number,
    startDate: string,
    endDate: string,
    frequency: InstallmentOption['value'],
): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysInterval =
        INSTALLMENT_OPTIONS.find((opt) => opt.value === frequency)
            ?.daysInterval || 30;
    const totalDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const numberOfInstallments = Math.ceil(totalDays / daysInterval);
    return totalAmount / numberOfInstallments;
};

export const calculateLoanDetails = (loan: Loan) => {
    const principal = parseFloat(loan.amount);
    const interestRate = parseFloat(loan.interest_rate);
    const startDate = new Date(loan.start_date);
    const endDate = new Date(loan.end_date);
    const days = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    let interestCalculation = '';
    let calculationExplanation = '';

    if (loan.interest_type === 'fixed') {
        const dailyRate = interestRate / 100 / 365;
        const monthlyRate = interestRate / 100 / 12;
        const quarterlyRate = interestRate / 100 / 4;
        const annualRate = interestRate / 100;

        switch (loan.frequency) {
            case 'daily':
                interestCalculation = `${principal} × ${dailyRate.toFixed(6)} × ${days} = ${loan.total_interest}`;
                calculationExplanation = `Where:\n- ${principal} is the principal amount\n- ${dailyRate.toFixed(6)} is the daily interest rate (${interestRate}% ÷ 365)\n- ${days} is the total number of days\n- ${loan.total_interest} is the total interest amount`;
                break;
            case 'monthly':
                const months = days / 30.44;
                interestCalculation = `${principal} × ${monthlyRate.toFixed(4)} × ${months.toFixed(2)} = ${loan.total_interest}`;
                calculationExplanation = `Where:\n- ${principal} is the principal amount\n- ${monthlyRate.toFixed(4)} is the monthly interest rate (${interestRate}% ÷ 12)\n- ${months.toFixed(2)} is the number of months (${days} days ÷ 30.44 days/month)\n- ${loan.total_interest} is the total interest amount`;
                break;
            case 'quarterly':
                const quarters = days / 91.32;
                interestCalculation = `${principal} × ${quarterlyRate.toFixed(4)} × ${quarters.toFixed(2)} = ${loan.total_interest}`;
                calculationExplanation = `Where:\n- ${principal} is the principal amount\n- ${quarterlyRate.toFixed(4)} is the quarterly interest rate (${interestRate}% ÷ 4)\n- ${quarters.toFixed(2)} is the number of quarters (${days} days ÷ 91.32 days/quarter)\n- ${loan.total_interest} is the total interest amount`;
                break;
            case 'annually':
                const years = days / 365;
                interestCalculation = `${principal} × ${annualRate.toFixed(4)} × ${years.toFixed(2)} = ${loan.total_interest}`;
                calculationExplanation = `Where:\n- ${principal} is the principal amount\n- ${annualRate.toFixed(4)} is the annual interest rate (${interestRate}%)\n- ${years.toFixed(2)} is the number of years (${days} days ÷ 365)\n- ${loan.total_interest} is the total interest amount`;
                break;
        }
    } else {
        const periodsPerYear = {
            daily: 365,
            monthly: 12,
            quarterly: 4,
            annually: 1,
        };
        const n = periodsPerYear[loan.frequency];
        const r = interestRate / 100 / n;
        const t = days / 365;
        interestCalculation = `${principal} × (1 + ${r.toFixed(4)})^(${n} × ${t.toFixed(2)}) - ${principal} = ${loan.total_interest}`;
        calculationExplanation = `Where:\n- ${principal} is the principal amount\n- ${r.toFixed(4)} is the interest rate per period (${interestRate}% ÷ ${n})\n- ${n} is the number of compounding periods per year\n- ${t.toFixed(2)} is the time in years (${days} days ÷ 365)\n- ${loan.total_interest} is the total interest amount`;
    }

    return {
        principal,
        interestRate,
        days,
        interestCalculation,
        calculationExplanation,
        totalBalance: parseFloat(loan.total_balance),
        paidAmount: parseFloat(loan.paid_amount),
        remainingBalance:
            parseFloat(loan.total_balance) - parseFloat(loan.paid_amount),
    };
};

