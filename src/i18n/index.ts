import type { Locale } from "@/lib/locale";
import { en } from "./en";
import { th } from "./th";

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
/** Dictionary shape: derived from th.ts, so en.ts must have exactly the same keys. */
export type Dict = Widen<typeof th>;

const dictionaries: Record<Locale, Dict> = { th, en };

export const getDictionary = (locale: Locale): Dict => dictionaries[locale];

/** "Page {n} of {total}" -> fill placeholders. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Localized message for an API/action error `code` (falls back to UNKNOWN). */
export function errorMessage(dict: Dict, code: string): string {
  const map: Record<string, string> = dict.errors.code;
  return map[code] ?? dict.errors.code.UNKNOWN;
}

/** Flatten a dictionary to "a.b.c" -> string (used by the key-parity test). */
export function flattenKeys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "string" ? [prefix + k] : flattenKeys(v as object, `${prefix}${k}.`),
  );
}

/** Localized reason for a rejected promotion (cart.promotion.reason or error details.reason). */
export function promoReasonMessage(dict: Dict, reason: string | null | undefined, minFormatted = ""): string {
  const map: Record<string, string> = dict.cart.promoReason;
  const text = reason ? map[reason] : undefined;
  return (text ?? dict.errors.code.PROMOTION_INVALID).replace("{min}", minFormatted);
}
