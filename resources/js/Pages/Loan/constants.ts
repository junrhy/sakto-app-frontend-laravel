import type { LoanDuration, InstallmentOption } from './types';

export const LOAN_DURATIONS: LoanDuration[] = [
    { label: 'Custom', days: null },
    { label: '1 Week', days: 7 },
    { label: '2 Weeks', days: 14 },
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 },
    { label: '2 Years', days: 730 },
    { label: '3 Years', days: 1095 },
    { label: '5 Years', days: 1825 },
    { label: '10 Years', days: 3650 },
    { label: '15 Years', days: 5475 },
    { label: '20 Years', days: 7300 },
    { label: '25 Years', days: 9125 },
    { label: '30 Years', days: 10950 },
];

export const INSTALLMENT_OPTIONS: InstallmentOption[] = [
    { label: 'Weekly', value: 'weekly', daysInterval: 7 },
    { label: 'Bi-weekly', value: 'bi-weekly', daysInterval: 14 },
    { label: 'Monthly', value: 'monthly', daysInterval: 30 },
    { label: 'Quarterly', value: 'quarterly', daysInterval: 90 },
    { label: 'Annually', value: 'annually', daysInterval: 365 },
];

