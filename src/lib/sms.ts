import type { PricingTier } from '@/types';

const GSM_7BIT_CHARS = '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\x1bÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
const GSM_7BIT_EXT_CHARS = '^{}\\\\[~]|€';

export function isGsm7Bit(message: string): boolean {
  for (const char of message) {
    if (!GSM_7BIT_CHARS.includes(char) && !GSM_7BIT_EXT_CHARS.includes(char)) {
      return false;
    }
  }
  return true;
}

export function calculateSmsParts(message: string): { parts: number; isUnicode: boolean; charsPerPart: number } {
  const isUnicode = !isGsm7Bit(message);
  const charsPerPart = isUnicode ? 70 : 160;
  if (message.length === 0) return { parts: 0, isUnicode, charsPerPart };
  if (message.length <= charsPerPart) return { parts: 1, isUnicode, charsPerPart };
  const maxChars = isUnicode ? 67 : 153;
  return { parts: Math.ceil(message.length / maxChars), isUnicode, charsPerPart };
}

export function calculateTotalSms(message: string, recipients: number): number {
  const { parts } = calculateSmsParts(message);
  return parts * recipients;
}

export function getPriceForQuantity(quantity: number, tiers: PricingTier[], defaultPrice: number): number {
  const sortedTiers = [...tiers].filter(t => t.active).sort((a, b) => a.min_quantity - b.min_quantity);
  for (const tier of sortedTiers) {
    if (quantity >= tier.min_quantity && (tier.max_quantity === null || quantity <= tier.max_quantity)) {
      return tier.price_per_sms;
    }
  }
  return defaultPrice;
}

export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+254')) {
    cleaned = '254' + cleaned.slice(4);
  } else if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('254')) {
    // already correct
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  }
  return cleaned;
}

export function isValidKenyanPhone(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  return /^254[17]\d{8}$/.test(normalized);
}

export function formatCurrency(amount: number, symbol: string = 'KSh'): string {
  return `${symbol} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function generateReceiptNumber(): string {
  return `RCP${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function generateApiKey(): string {
  const prefix = 'abancool_';
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = prefix;
  for (let i = 0; i < 48; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}
