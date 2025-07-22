import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getHost(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    // Remove common domain extensions
    const cleanHostname = hostname.replace(/\.(app|com|org|net|co|io|dev|test|local)$/, '')
    // Capitalize first letter
    return cleanHostname.charAt(0).toUpperCase() + cleanHostname.slice(1)
  }
  return 'Sakto' // fallback for SSR
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
