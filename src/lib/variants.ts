import type { StockStatus, VariantView } from "./types";

export const isInStock = (s: StockStatus): boolean => s !== "OUT_OF_STOCK";

/** First in-stock variant (sort_order), else the first one, else undefined. */
export function defaultVariant(variants: VariantView[]): VariantView | undefined {
  return variants.find((v) => isInStock(v.stockStatus)) ?? variants[0];
}

export function findVariant(variants: VariantView[], id: number | null | undefined): VariantView | undefined {
  return variants.find((v) => v.id === id);
}

/** Keep quantity within 1..maxPerOrder (NaN -> 1). The API re-checks stock. */
export function clampQuantity(q: number, variant: Pick<VariantView, "maxPerOrder"> | undefined): number {
  const max = Math.max(1, variant?.maxPerOrder ?? 1);
  if (!Number.isFinite(q)) return 1;
  return Math.min(max, Math.max(1, Math.trunc(q)));
}

/** Variants differ by shade when at least one has a swatch. */
export const hasShades = (variants: VariantView[]): boolean => variants.some((v) => v.swatchHex);

/** Strikethrough price only when compare-at is genuinely higher. */
export const isOnSale = (price: string, compareAt: string | null): boolean =>
  compareAt !== null && Number(compareAt) > Number(price);

/** Only hex colours are ever put into a style attribute. */
export const safeHex = (hex: string | null | undefined): string | undefined =>
  hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : undefined;
