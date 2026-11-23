import type { OrderStatus } from "@/lib/types";
import type { AdminVariant, Tr } from "./types";

export const DECIMAL = /^\d+(\.\d{1,2})?$/;
export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const isDecimal = (s: string) => DECIMAL.test(s.trim());
/** "" -> null, otherwise the trimmed string (validity is checked separately with isDecimal). */
export const orNull = (s: string): string | null => (s.trim() === "" ? null : s.trim());

/** Mirrors the contract's order state machine (the API stays authoritative). */
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["CANCELLED"],
  PAID: ["PROCESSING", "SHIPPED", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
export const allowedNextStatuses = (s: OrderStatus): OrderStatus[] => NEXT[s] ?? [];
export const cancelReturnsStock = (s: OrderStatus) => s === "PAID" || s === "PROCESSING";

/** Bangkok is UTC+7 with no DST, so a fixed offset is exact. "2026-03-01T09:30" -> ISO instant. */
export function bangkokLocalToIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(`${local.length === 16 ? `${local}:00` : local}+07:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
export function isoToBangkokLocal(iso: string | null): string {
  if (!iso) return "";
  const ms = new Date(iso).getTime();
  return Number.isNaN(ms) ? "" : new Date(ms + 7 * 3600_000).toISOString().slice(0, 16);
}

export type VariantRow = {
  id?: number; sku: string; labelTh: string; labelEn: string; swatchHex: string; price: string; compareAtPrice: string;
  maxPerOrder: string; active: boolean; sortOrder: string;
};
export const emptyVariant = (sortOrder = 0): VariantRow => ({
  sku: "", labelTh: "", labelEn: "", swatchHex: "", price: "", compareAtPrice: "", maxPerOrder: "10", active: true, sortOrder: String(sortOrder),
});
export const variantToRow = (v: AdminVariant): VariantRow => ({
  id: v.id, sku: v.sku, labelTh: v.labelTh ?? "", labelEn: v.labelEn ?? "", swatchHex: v.swatchHex ?? "", price: v.price,
  compareAtPrice: v.compareAtPrice ?? "", maxPerOrder: String(v.maxPerOrder), active: v.active, sortOrder: String(v.sortOrder),
});

/** Form rows -> API payload. Returns per-row error messages instead of throwing. */
export function variantsToPayload(rows: VariantRow[]): { payload: AdminVariant[]; errors: string[] } {
  const errors: string[] = [];
  const payload = rows.map((r, i): AdminVariant => {
    const n = `Variant ${i + 1}`;
    if (!r.sku.trim()) errors.push(`${n}: SKU is required`);
    if (!isDecimal(r.price)) errors.push(`${n}: price must be a decimal like 259 or 259.50`);
    if (r.compareAtPrice.trim() && !isDecimal(r.compareAtPrice)) errors.push(`${n}: compare-at price must be a decimal`);
    if (r.swatchHex.trim() && !/^#[0-9a-fA-F]{6}$/.test(r.swatchHex.trim())) errors.push(`${n}: swatch must be #RRGGBB`);
    if (!/^[1-9]\d*$/.test(r.maxPerOrder.trim())) errors.push(`${n}: max per order must be a whole number >= 1`);
    if (!/^-?\d+$/.test(r.sortOrder.trim())) errors.push(`${n}: sort order must be a whole number`);
    return {
      ...(r.id ? { id: r.id } : {}),
      sku: r.sku.trim(), labelTh: orNull(r.labelTh), labelEn: orNull(r.labelEn), swatchHex: orNull(r.swatchHex),
      price: r.price.trim(), compareAtPrice: orNull(r.compareAtPrice), maxPerOrder: Number(r.maxPerOrder), active: r.active, sortOrder: Number(r.sortOrder),
    };
  });
  if (payload.length === 0) errors.push("At least one variant is required");
  return { payload, errors };
}

export type TrForm = { name: string; description: string; howToUse: string; ingredients: string; warnings: string };
export const emptyTr = (): TrForm => ({ name: "", description: "", howToUse: "", ingredients: "", warnings: "" });
export const trToForm = (t: Tr | null): TrForm => ({
  name: t?.name ?? "", description: t?.description ?? "", howToUse: t?.howToUse ?? "", ingredients: t?.ingredients ?? "", warnings: t?.warnings ?? "",
});
/** A locale with no content at all is sent as null (flagged missing); it is never copied from the other locale. */
export function formToTr(f: TrForm): Tr | null {
  if (Object.values(f).every((v) => v.trim() === "")) return null;
  return { name: f.name.trim(), description: orNull(f.description), howToUse: orNull(f.howToUse), ingredients: orNull(f.ingredients), warnings: orNull(f.warnings) };
}

const MESSAGES: Record<string, string> = {
  STALE: "Someone else changed this while you were editing. Reload the page to get the latest version, then re-apply your edits.",
  MISSING_TRANSLATION: "Cannot publish: both the Thai and English names are required.",
  NO_ACTIVE_VARIANT: "Cannot publish: at least one variant must be active.",
  SLUG_TAKEN: "That slug is already used by another record.",
  SKU_TAKEN: "That SKU is already used by another variant.",
  FILE_REJECTED: "File rejected: only PNG, JPEG or WebP images are accepted.",
  FILE_TOO_LARGE: "File too large: the limit is 5 MB.",
  INSUFFICIENT_STOCK: "Not enough stock: on-hand cannot drop below the reserved quantity.",
  INVALID_TRANSITION: "That status change is not allowed from the order's current state. Reload to see its latest status.",
  TRACKING_REQUIRED: "A tracking number is required to mark an order as shipped.",
  VALIDATION_FAILED: "Some fields are invalid.",
  NOT_FOUND: "Not found.",
  FORBIDDEN: "You do not have permission to do that.",
  UNAUTHENTICATED: "Your session has expired. Sign in again.",
  INVALID_CREDENTIALS: "Email or password is incorrect.",
  NOT_ADMIN: "This account does not have admin access.",
  RATE_LIMITED: "Too many attempts. Wait a moment and try again.",
  UNREACHABLE: "The API is unreachable. Try again shortly.",
  CONFLICT: "Conflict with existing data.",
};
export function adminError(code: string, fieldErrors?: Record<string, string>): string {
  const base = MESSAGES[code] ?? `Something went wrong (${code}).`;
  const f = fieldErrors && Object.entries(fieldErrors).map(([k, v]) => `${k}: ${v}`).join("; ");
  return f ? `${base} ${f}` : base;
}

/** Accept both a bare array and a PageResponse (list endpoints are not pinned down in the contract). */
export const asList = <T,>(x: T[] | { items: T[] }): T[] => (Array.isArray(x) ? x : x.items);
