import { format } from 'date-fns';
import { CURRENCY_SYMBOLS, DATE_FORMATS } from '../constants';

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  decimals: number = 2
): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const absAmount = Math.abs(amount);
  const formattedNumber = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${amount < 0 ? '-' : ''}${symbol}${formattedNumber}`;
}

/**
 * Format a number as percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Format a number with compact notation (K, M, B)
 */
export function formatCompactNumber(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(2)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(2)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(2)}K`;
  } else {
    return `${sign}${absValue.toFixed(2)}`;
  }
}

/**
 * Format date
 */
export function formatDate(
  date: Date | string,
  formatString: string = DATE_FORMATS.FULL
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatDate(dateObj, DATE_FORMATS.DATE_ONLY);
  }
}

/**
 * Format quantity with appropriate decimals
 */
export function formatQuantity(quantity: number, maxDecimals: number = 8): string {
  // Remove trailing zeros
  const formatted = quantity.toFixed(maxDecimals);
  return parseFloat(formatted).toString();
}

/**
 * Format price change with color indication
 */
export function getPriceChangeColor(change: number): string {
  if (change > 0) return '#10B981'; // green
  if (change < 0) return '#EF4444'; // red
  return '#6B7280'; // gray
}

/**
 * Parse number from formatted string
 */
export function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}
