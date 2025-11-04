import type { OrderItem, Product } from './types';

export const formatAmount = (amount: number, appCurrency: any): string => {
    if (!appCurrency) return amount.toFixed(2);
    return (
        appCurrency.symbol +
        number_format(
            amount,
            2,
            appCurrency.decimal_separator,
            appCurrency.thousands_separator,
        )
    );
};

export const calculateTotal = (items: OrderItem[]): number => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const calculateChange = (
    cashReceived: number,
    totalAmount: number,
): number => {
    return Math.max(0, cashReceived - totalAmount);
};

export const searchProducts = (
    products: Product[],
    searchTerm: string,
): Product[] => {
    if (!searchTerm.trim()) return products;
    const regex = new RegExp(searchTerm.split('').join('.*'), 'i');
    return products.filter((product) => regex.test(product.name));
};

export const filterProductsByCategory = (
    products: Product[],
    categoryId: number | 'all',
): Product[] => {
    if (categoryId === 'all') return products;
    return products.filter((product) => product.category_id === categoryId);
};

export const getProductStatus = (quantity: number): string => {
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= 10) return 'low_stock';
    return 'in_stock';
};

// Helper function to format numbers (similar to PHP's number_format)
function number_format(
    number: number,
    decimals: number,
    decimalSep: string,
    thousandsSep: string,
): string {
    const parts = number.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    return parts.join(decimalSep);
}
