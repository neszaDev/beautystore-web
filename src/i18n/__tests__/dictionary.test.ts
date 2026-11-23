import { describe, expect, it } from "vitest";
import { en } from "../en";
import { errorMessage, flattenKeys, fmt, getDictionary } from "../index";
import { th } from "../th";

describe("dictionaries", () => {
  it("th and en have identical keys", () => {
    expect(flattenKeys(en).sort()).toEqual(flattenKeys(th).sort());
  });
  it("no empty strings and matching placeholders", () => {
    const flat = (o: object, p = ""): [string, string][] =>
      Object.entries(o).flatMap(([k, v]) => (typeof v === "string" ? [[p + k, v] as [string, string]] : flat(v as object, `${p}${k}.`)));
    const e = new Map(flat(en));
    for (const [k, v] of flat(th)) {
      expect(v.trim(), k).not.toBe("");
      expect(e.get(k)?.trim(), k).not.toBe("");
      const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
      expect(ph(e.get(k) ?? ""), k).toBe(ph(v));
    }
  });
  it("maps every documented API error code to a message in both locales", () => {
    const codes = "VALIDATION_FAILED MALFORMED_REQUEST NOT_FOUND UNAUTHENTICATED FORBIDDEN CONFLICT STALE RATE_LIMITED INVALID_CREDENTIALS EMAIL_TAKEN INVALID_TOKEN WRONG_PASSWORD NOT_PURCHASABLE OUT_OF_STOCK QUANTITY_LIMIT CART_EMPTY CART_HAS_PROBLEMS PROMOTION_INVALID SHIPPING_METHOD_INVALID TOTAL_CHANGED IDEMPOTENCY_KEY_REQUIRED PAYMENT_NOT_ALLOWED INVALID_TRANSITION TRACKING_REQUIRED INSUFFICIENT_STOCK MISSING_TRANSLATION NO_ACTIVE_VARIANT SLUG_TAKEN SKU_TAKEN FILE_REJECTED FILE_TOO_LARGE INVALID_SIGNATURE".split(" ");
    for (const l of ["th", "en"] as const) {
      const d = getDictionary(l);
      for (const c of codes) expect(Object.keys(d.errors.code), `${l}:${c}`).toContain(c);
      expect(errorMessage(d, "SOMETHING_NEW")).toBe(d.errors.code.UNKNOWN);
    }
  });
  it("fmt fills placeholders", () => {
    expect(fmt("Page {n} of {total}", { n: 2, total: 5 })).toBe("Page 2 of 5");
  });
});
