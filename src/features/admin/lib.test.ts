import { describe, expect, it } from "vitest";
import { allowedNextStatuses, bangkokLocalToIso, formToTr, emptyTr, isDecimal, isoToBangkokLocal, variantsToPayload, emptyVariant } from "./lib";

describe("admin helpers", () => {
  it("allowed next statuses mirror the contract", () => {
    expect(allowedNextStatuses("PAID")).toEqual(["PROCESSING", "SHIPPED", "CANCELLED"]);
    expect(allowedNextStatuses("PROCESSING")).toEqual(["SHIPPED", "CANCELLED"]);
    expect(allowedNextStatuses("SHIPPED")).toEqual(["DELIVERED"]);
    expect(allowedNextStatuses("PENDING_PAYMENT")).toEqual(["CANCELLED"]);
    expect(allowedNextStatuses("DELIVERED")).toEqual([]);
    expect(allowedNextStatuses("CANCELLED")).toEqual([]);
  });
  it("converts Bangkok local time to ISO and back", () => {
    expect(bangkokLocalToIso("2026-03-01T09:30")).toBe("2026-03-01T02:30:00.000Z");
    expect(bangkokLocalToIso("2026-03-01T03:00")).toBe("2026-02-28T20:00:00.000Z");
    expect(isoToBangkokLocal("2026-02-28T20:00:00Z")).toBe("2026-03-01T03:00");
    expect(bangkokLocalToIso("")).toBeNull();
    expect(isoToBangkokLocal(null)).toBe("");
  });
  it("validates decimals", () => {
    for (const ok of ["0", "259", "259.5", "259.50"]) expect(isDecimal(ok)).toBe(true);
    for (const bad of ["", "-1", "1.234", "1,5", "abc", ".5"]) expect(isDecimal(bad)).toBe(false);
  });
  it("maps variant rows to payload and reports errors", () => {
    const bad = variantsToPayload([emptyVariant()]);
    expect(bad.errors.length).toBeGreaterThan(0);
    const good = variantsToPayload([{ ...emptyVariant(2), id: 7, sku: " A-1 ", price: "259.00", swatchHex: "#ff0000", labelEn: "Red" }]);
    expect(good.errors).toEqual([]);
    expect(good.payload[0]).toMatchObject({ id: 7, sku: "A-1", price: "259.00", compareAtPrice: null, labelTh: null, labelEn: "Red", maxPerOrder: 10, sortOrder: 2, active: true });
    expect(variantsToPayload([]).errors).toHaveLength(1);
  });
  it("sends an untouched locale as null, never copied", () => {
    expect(formToTr(emptyTr())).toBeNull();
    expect(formToTr({ ...emptyTr(), name: "ลิป" })).toMatchObject({ name: "ลิป", description: null });
  });
});
