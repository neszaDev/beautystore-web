import { expect, test } from "@playwright/test";
import { SEED, placeOrder, settle } from "./helpers";

test("browse -> product -> bag -> cart -> checkout (PromptPay) -> mock pay -> order shows Paid", async ({ page }) => {
  await page.goto("/th/products");
  await settle(page);
  // The visible, accessible product-name link (the image link is aria-hidden under the stretched link).
  await page.locator(`a[href="/th/p/${SEED.lipTint}"]:not([aria-hidden])`).first().click();
  await page.waitForURL(`**/th/p/${SEED.lipTint}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await placeOrder(page, "PROMPTPAY");
  await expect(page.getByTestId("promptpay-qr")).toBeVisible();
  await expect(page.getByTestId("payment-success")).toHaveCount(0); // never "paid" before the API says so

  await page.getByTestId("dev-mock-link").click();
  await expect(page.getByTestId("test-mode-banner")).toBeVisible();
  await page.getByTestId("mock-succeeded").click();

  await page.waitForURL(/\/th\/order\/[^/]+$/);
  await expect(page.getByTestId("payment-success")).toBeVisible();
  await expect(page.getByTestId("order-status")).toHaveText("ชำระเงินแล้ว");
});
