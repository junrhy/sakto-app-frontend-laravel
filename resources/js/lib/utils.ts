import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

interface Currency {
    symbol: string;
    code: string;
    name: string;
}

export function formatAmount(amount: string | number, currency: Currency): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${currency.symbol}${numericAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}
