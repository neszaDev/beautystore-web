import { expect, test } from "@playwright/test";
import { placeOrder } from "./helpers";

test("card flow: 3DS cancelled, then retry succeeds", async ({ page }) => {
  await placeOrder(page, "CARD");
  await page.getByTestId("continue-card").click();
  await expect(page.getByTestId("test-mode-banner")).toBeVisible();
  await page.getByTestId("mock-cancelled").click();

  await page.waitForURL(/\/th\/order\/[^/]+$/);
  await expect(page.getByTestId("payment-success")).toHaveCount(0);
  await page.getByTestId("payment-retry").click(); // new attempt
  await page.getByTestId("continue-card").click();
  await page.getByTestId("mock-succeeded").click();

  await page.waitForURL(/\/th\/order\/[^/]+$/);
  await expect(page.getByTestId("payment-success")).toBeVisible();
});
