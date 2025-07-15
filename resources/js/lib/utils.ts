import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getHost(): string {
  if (typeof window !== 'undefined') {
    return window.location.hostname
  }
  return 'Sakto.app' // fallback for SSR
}

export function formatCurrency(amount: number, currencySymbol: string = '$'): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${currencySymbol}${numericAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
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
