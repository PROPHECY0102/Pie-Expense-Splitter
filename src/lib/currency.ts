import type { Preferences } from '@/types'

/** Cache Intl.NumberFormat instances since constructing them is expensive. */
const formatterCache = new Map<string, Intl.NumberFormat>()

function getFormatter(prefs: Preferences): Intl.NumberFormat {
  const key = `${prefs.locale}::${prefs.currency}`
  let f = formatterCache.get(key)
  if (!f) {
    f = new Intl.NumberFormat(prefs.locale, {
      style: 'currency',
      currency: prefs.currency,
    })
    formatterCache.set(key, f)
  }
  return f
}

export function formatCents(cents: number, prefs: Preferences): string {
  return getFormatter(prefs).format(cents / 100)
}

export function formatSignedCents(cents: number, prefs: Preferences): string {
  const sign = cents >= 0 ? '+' : '−'
  return `${sign}${formatCents(Math.abs(cents), prefs)}`
}

/**
 * Parse a free-form currency string into integer cents.
 * Accepts: "12", "12.5", "12.50", "$12.50", "1,234.56".
 * Returns NaN for invalid input.
 */
export function parseCurrencyToCents(input: string): number {
  if (!input) return NaN
  const cleaned = input.replace(/[^0-9.,\-]/g, '').replace(/,/g, '')
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return NaN
  const value = Number(cleaned)
  if (!Number.isFinite(value)) return NaN
  return Math.round(value * 100)
}

/** Get the symbol for a currency code (best-effort using Intl). */
export function currencySymbol(currency: string, locale?: string): string {
  try {
    const parts = new Intl.NumberFormat(locale ?? 'en-US', {
      style: 'currency',
      currency,
    }).formatToParts(0)
    return parts.find((p) => p.type === 'currency')?.value ?? currency
  } catch {
    return currency
  }
}

export const CURRENCIES: Array<{ code: string; name: string }> = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'KRW', name: 'South Korean Won' },
]
