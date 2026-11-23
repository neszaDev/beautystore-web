import { describe, expect, it } from "vitest";
import { formatMoney, isPositive } from "../money";

describe("formatMoney", () => {
  it("formats whole baht without decimals in Thai", () => {
    expect(formatMoney("1290.00", "th")).toBe("฿1,290");
  });
  it("keeps satang when present, in English", () => {
    expect(formatMoney("259.50", "en")).toBe("฿259.50");
  });
  it("uses thousands separators", () => {
    expect(formatMoney("12345.00", "en")).toBe("฿12,345");
  });
  it("returns empty for non-numeric input", () => {
    expect(formatMoney("abc", "th")).toBe("");
  });
  it("isPositive", () => {
    expect(isPositive("0.00")).toBe(false);
    expect(isPositive("50.00")).toBe(true);
  });
});
