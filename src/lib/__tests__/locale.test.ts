import { describe, expect, it } from "vitest";
import { bypassesLocale, localePath, localeRedirectTarget, splitLocale, switchLocalePath } from "../locale";

describe("locale paths", () => {
  it("splits locale prefixes", () => {
    expect(splitLocale("/th/p/jelly-lip-tint")).toEqual({ locale: "th", rest: "/p/jelly-lip-tint" });
    expect(splitLocale("/en")).toEqual({ locale: "en", rest: "" });
    expect(splitLocale("/cart").locale).toBeNull();
  });
  it("switches locale keeping path and query", () => {
    expect(switchLocalePath("/th/p/jelly-lip-tint", "en")).toBe("/en/p/jelly-lip-tint");
    expect(switchLocalePath("/en/products", "th", "q=lip&page=2")).toBe("/th/products?q=lip&page=2");
    expect(switchLocalePath("/th", "en")).toBe("/en");
  });
  it("builds locale paths", () => {
    expect(localePath("th")).toBe("/th");
    expect(localePath("en", "/cart")).toBe("/en/cart");
  });
  it("redirects locale-less paths using the cookie, default th", () => {
    expect(localeRedirectTarget("/", undefined)).toBe("/th");
    expect(localeRedirectTarget("/products", "en", "?q=a")).toBe("/en/products?q=a");
    expect(localeRedirectTarget("/products", "fr")).toBe("/th/products");
    expect(localeRedirectTarget("/en/products", "th")).toBeNull();
  });
  it("leaves admin, api, media, demo, _next and static files alone", () => {
    for (const p of ["/admin", "/admin/orders", "/api/webhooks/payments/mock", "/media/a.png", "/demo/products/x.jpg", "/_next/static/a.js", "/favicon.ico", "/robots.txt"]) {
      expect(bypassesLocale(p)).toBe(true);
      expect(localeRedirectTarget(p, "en")).toBeNull();
    }
  });
});
