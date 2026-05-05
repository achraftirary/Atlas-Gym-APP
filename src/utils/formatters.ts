/**
 * Formatting utilities for display and calculations
 */

export const formatCurrency = (
  value: number | string,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

export const formatPercentage = (value: number, decimalPlaces: number = 1): string => {
  return `${(value * 100).toFixed(decimalPlaces)}%`;
};

export const formatDate = (date: string | Date, locale: string = 'en-US'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

export const formatTime = (date: string | Date, locale: string = 'en-US'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatDateTime = (date: string | Date, locale: string = 'en-US'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const truncateText = (text: string, length: number = 50): string => {
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

export const toTitleCase = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const calculateDaysRemaining = (endDate: string | Date): number => {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
};

export const getStatusColor = (
  status: string
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const normalized = status.toLowerCase();
  
  if (normalized === 'active' || normalized === 'paid' || normalized === 'completed' || normalized === 'success') {
    return 'success';
  } else if (normalized === 'pending' || normalized === 'processing') {
    return 'info';
  } else if (normalized === 'expired' || normalized === 'unpaid' || normalized === 'failed' || normalized === 'error') {
    return 'error';
  } else if (normalized === 'paused' || normalized === 'warning') {
    return 'warning';
  }
  
  return 'default';
};

export const getStatusBackgroundColor = (status: string): string => {
  const color = getStatusColor(status);
  const colorMap: { [key: string]: string } = {
    success: 'rgba(16, 185, 129, 0.1)',
    error: 'rgba(239, 68, 68, 0.1)',
    warning: 'rgba(251, 146, 60, 0.1)',
    info: 'rgba(59, 130, 246, 0.1)',
    primary: 'rgba(255, 107, 74, 0.1)',
    default: 'rgba(75, 85, 99, 0.1)',
  };
  return colorMap[color] || 'rgba(75, 85, 99, 0.1)';
};

export const calculateProgress = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

export const formatNumber = (value: number, decimalPlaces: number = 0): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
};
