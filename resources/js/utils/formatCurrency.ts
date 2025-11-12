export const formatCurrency = (amount: number, currency = 'USD') => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toLocaleString()}`;
    }
};
