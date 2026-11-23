import { describe, expect, it } from "vitest";
import { PROVINCES } from "../provinces";
import { validateAddress } from "../validation";

const ok = {
  recipient: "สมชาย ใจดี", phone: "081-234-5678", line1: "99/1 ถนนสุขุมวิท", line2: "",
  subdistrict: "คลองตัน", district: "คลองเตย", province: "กรุงเทพมหานคร", postalCode: "10110",
};

describe("validateAddress", () => {
  it("accepts a valid Thai address", () => expect(validateAddress(ok)).toEqual({}));
  it("has 77 provinces", () => expect(new Set(PROVINCES).size).toBe(77));
  it("requires mandatory fields", () => {
    const e = validateAddress({ ...ok, recipient: " ", line1: "", subdistrict: "", district: "" });
    expect(e).toEqual({ recipient: "required", line1: "required", subdistrict: "required", district: "required" });
  });
  it("rejects bad postal codes", () => {
    expect(validateAddress({ ...ok, postalCode: "1011" }).postalCode).toBe("postalCode");
    expect(validateAddress({ ...ok, postalCode: "1011a" }).postalCode).toBe("postalCode");
    expect(validateAddress({ ...ok, postalCode: "" }).postalCode).toBe("required");
  });
  it("rejects bad phones", () => {
    expect(validateAddress({ ...ok, phone: "12345" }).phone).toBe("phone");
    expect(validateAddress({ ...ok, phone: "abc-def-ghij" }).phone).toBe("phone");
    expect(validateAddress({ ...ok, phone: "+66 81 234 5678" }).phone).toBeUndefined();
  });
  it("rejects provinces outside the list", () => {
    expect(validateAddress({ ...ok, province: "Atlantis" }).province).toBe("province");
    expect(validateAddress({ ...ok, province: "" }).province).toBe("required");
  });
});
