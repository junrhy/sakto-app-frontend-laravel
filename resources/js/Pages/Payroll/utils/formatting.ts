import { Payroll } from '../types';

export const formatCurrency = (
    amount: number,
    currency_symbol: string = '$',
) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
        .format(amount)
        .replace('$', currency_symbol);
};

export const calculateTotalPayroll = (payrolls: Payroll[]) => {
    if (!Array.isArray(payrolls) || payrolls.length === 0) return 0;
    return payrolls.reduce((total, payroll) => {
        const salary = Number(payroll.salary) || 0;
        return total + salary;
    }, 0);
};

export const getStatusBadgeClass = (
    status: string,
    type: 'period' | 'tracking' = 'period',
) => {
    if (type === 'period') {
        return status === 'completed'
            ? 'bg-green-100 text-green-800'
            : status === 'processing'
              ? 'bg-blue-100 text-blue-800'
              : status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800';
    } else {
        return status === 'present'
            ? 'bg-green-100 text-green-800'
            : status === 'absent'
              ? 'bg-red-100 text-red-800'
              : status === 'late'
                ? 'bg-yellow-100 text-yellow-800'
                : status === 'half_day'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800';
    }
};
