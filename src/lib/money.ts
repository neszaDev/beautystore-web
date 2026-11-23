import type { Locale } from "./locale";
import type { Money } from "./types";

const BCP47: Record<Locale, string> = { th: "th-TH", en: "en-TH" };

/**
 * Format a server money string ("1290.00") for display. Display only: never do arithmetic
 * on money in the browser (the API is authoritative). Whole-baht amounts drop the decimals.
 */
export function formatMoney(amount: Money | number, locale: Locale, currency = "THB"): string {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n)) return "";
  const whole = Number.isInteger(n);
  return new Intl.NumberFormat(BCP47[locale], {
    style: "currency",
    currency,
    currencyDisplay: locale === "th" ? "symbol" : "narrowSymbol",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** True when the money string is greater than zero (string compare via Number; display logic only). */
export function isPositive(amount: Money): boolean {
  return Number(amount) > 0;
}

/** Format an ISO instant in Asia/Bangkok. */
export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(BCP47[locale], {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(iso));
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(BCP47[locale], { dateStyle: "medium", timeZone: "Asia/Bangkok" }).format(
    new Date(iso),
  );
}
