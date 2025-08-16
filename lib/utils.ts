import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'NZD'): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDiscount(discount: number | null): string {
  if (!discount) return '';
  return `${discount}% OFF`;
}

export function calculateSavings(originalPrice: number | null, price: number): number {
  if (!originalPrice) return 0;
  return originalPrice - price;
}
