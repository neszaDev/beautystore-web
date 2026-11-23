import { describe, expect, it } from "vitest";
import type { VariantView } from "../types";
import { clampQuantity, defaultVariant, findVariant, hasShades, isOnSale, safeHex } from "../variants";

const v = (id: number, stock: VariantView["stockStatus"], extra: Partial<VariantView> = {}): VariantView => ({
  id, sku: `S${id}`, label: `V${id}`, swatchHex: null, price: "100.00", compareAtPrice: null, currency: "THB",
  stockStatus: stock, maxPerOrder: 5, ...extra,
});

describe("variant selection", () => {
  it("defaults to the first in-stock variant", () => {
    expect(defaultVariant([v(1, "OUT_OF_STOCK"), v(2, "LOW_STOCK"), v(3, "IN_STOCK")])?.id).toBe(2);
  });
  it("falls back to the first when everything is sold out", () => {
    expect(defaultVariant([v(1, "OUT_OF_STOCK"), v(2, "OUT_OF_STOCK")])?.id).toBe(1);
  });
  it("handles no variants", () => expect(defaultVariant([])).toBeUndefined());
  it("finds by id", () => expect(findVariant([v(1, "IN_STOCK"), v(2, "IN_STOCK")], 2)?.sku).toBe("S2"));
  it("clamps quantity to 1..maxPerOrder", () => {
    const x = v(1, "IN_STOCK", { maxPerOrder: 3 });
    expect(clampQuantity(0, x)).toBe(1);
    expect(clampQuantity(2.9, x)).toBe(2);
    expect(clampQuantity(99, x)).toBe(3);
    expect(clampQuantity(Number.NaN, x)).toBe(1);
  });
  it("detects shades and sale prices", () => {
    expect(hasShades([v(1, "IN_STOCK", { swatchHex: "#F45B83" })])).toBe(true);
    expect(hasShades([v(1, "IN_STOCK")])).toBe(false);
    expect(isOnSale("100.00", "150.00")).toBe(true);
    expect(isOnSale("100.00", "100.00")).toBe(false);
    expect(isOnSale("100.00", null)).toBe(false);
  });
  it("only allows hex colours into styles", () => {
    expect(safeHex("#F45B83")).toBe("#F45B83");
    expect(safeHex("red; background:url(x)")).toBeUndefined();
  });
});
