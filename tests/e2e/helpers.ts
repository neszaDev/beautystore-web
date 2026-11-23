import { expect, type Page } from "@playwright/test";

export const SEED = {
  lipTint: "jelly-lip-tint",
  cleanser: "gentle-gel-cleanser",
} as const;

/** Unique per run so registration never collides with earlier runs. */
export const uniqueEmail = (prefix = "e2e") => `${prefix}+${Date.now()}${Math.floor(Math.random() * 1e4)}@example.test`;

export async function settle(page: Page) {
  await page.waitForLoadState("networkidle"); // wait for hydration before interacting
}

export async function addProductToBag(page: Page, slug: string = SEED.lipTint) {
  await page.goto(`/th/p/${slug}`);
  await settle(page);
  await page.getByTestId("add-to-bag").click();
  // cart drawer opens as a modal dialog
  await expect(page.getByRole("dialog")).toBeVisible();
}

export async function goToCheckout(page: Page) {
  await page.goto("/th/cart");
  await settle(page);
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await page.getByTestId("checkout-cta").click();
  await page.waitForURL("**/th/checkout");
  await settle(page);
}

export async function fillCheckout(page: Page, opts: { email?: string; payment: "PROMPTPAY" | "CARD" }) {
  await page.getByLabel("อีเมล").fill(opts.email ?? uniqueEmail("buyer"));
  await page.locator("#co-recipient").fill("ทดสอบ ระบบ");
  await page.locator("#co-phone").fill("0812345678");
  await page.locator("#co-line1").fill("99/1 ถนนสุขุมวิท");
  await page.locator("#co-subdistrict").fill("คลองตัน");
  await page.locator("#co-district").fill("คลองเตย");
  await page.locator("#co-province").selectOption("กรุงเทพมหานคร");
  await page.locator("#co-postalCode").fill("10110");
  await page.locator(`input[name="payment"][value="${opts.payment}"]`).check();
}

/** Complete checkout with the given method and land on /order/[number]. */
export async function placeOrder(page: Page, payment: "PROMPTPAY" | "CARD") {
  await addProductToBag(page);
  await goToCheckout(page);
  await fillCheckout(page, { payment });
  await page.getByTestId("place-order").click();
  await page.waitForURL(/\/th\/order\/[^/]+$/);
  await expect(page.getByTestId("payment-panel")).toBeVisible();
}
