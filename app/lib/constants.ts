export const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT', 'SOLUSDT'] as const;

export const INTERVALS = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: '1 Day' },
] as const;

export const DEFAULT_SYMBOL = 'BTCUSDT';
export const DEFAULT_INTERVAL = '1h';

export type Symbol = typeof SYMBOLS[number];