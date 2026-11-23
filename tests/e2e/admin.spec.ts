import { expect, test, type Page } from "@playwright/test";
import { placeOrder, settle, uniqueEmail } from "./helpers";

const ADMIN = { email: "admin@example.test", password: "local-admin-password" };

async function adminLogin(page: Page) {
  await page.goto("/admin/login");
  await settle(page);
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Password").fill(ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

test("anonymous visitors and customers are sent to the admin login", async ({ page }) => {
  await page.goto("/admin/orders");
  await page.waitForURL("**/admin/login");

  const email = uniqueEmail("cust");
  await page.goto("/th/register");
  await settle(page);
  await page.getByLabel("ชื่อ-นามสกุล").fill("ลูกค้า ทดสอบ");
  await page.getByLabel("อีเมล").fill(email);
  await page.getByLabel("รหัสผ่าน").fill("correct-horse-battery");
  await page.getByRole("button", { name: "สมัครสมาชิก" }).click();
  await page.waitForURL("**/th/account");

  await page.goto("/admin");
  await page.waitForURL("**/admin/login");
  // a customer's credentials must be rejected by the admin form
  await settle(page);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  // (Next.js also renders an empty role=alert route announcer)
  await expect(page.getByRole("alert").filter({ hasText: "admin access" })).toBeVisible();
});

test("admin: dashboard, restock velvet-lip-cream, ship a paid order", async ({ page, browser }) => {
  await adminLogin(page);

  // restock the first variant of velvet-lip-cream
  await page.goto("/admin/products?q=velvet");
  await page.getByRole("link", { name: /velvet/i }).first().click();
  await page.waitForURL(/\/admin\/products\/\d+$/);
  await page.getByRole("link", { name: /^Inventory for / }).first().click();
  await page.waitForURL(/\/admin\/inventory\/\d+/);
  await settle(page);
  await page.getByLabel(/^Change/).fill("5");
  await page.getByLabel("Note").fill("e2e restock");
  await page.getByRole("button", { name: "Apply adjustment" }).click();
  await expect(page.getByText("Stock adjusted.")).toBeVisible();
  await expect(page.getByRole("cell", { name: "e2e restock" }).first()).toBeVisible();

  // a customer places and pays an order in a separate browser context
  const shopper = await (await browser.newContext({ locale: "th-TH" })).newPage();
  await placeOrder(shopper, "PROMPTPAY");
  const orderNumber = shopper.url().split("/").pop()!;
  await shopper.getByTestId("dev-mock-link").click();
  await shopper.getByTestId("mock-succeeded").click();
  await shopper.waitForURL(/\/th\/order\/[^/]+$/);
  await expect(shopper.getByTestId("payment-success")).toBeVisible();
  await shopper.context().close();

  await page.goto(`/admin/orders?q=${orderNumber}`);
  await page.getByRole("link", { name: orderNumber }).click();
  await settle(page);
  await expect(page.getByRole("heading", { name: `Order ${orderNumber}` })).toBeVisible();

  await page.getByRole("button", { name: "Mark SHIPPED" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Confirm" }).click();
  // Tracking number is required for SHIPPED: the browser blocks the submit (the API also enforces it).
  const tracking = dialog.getByLabel("Tracking number");
  expect(await tracking.evaluate((e) => (e as HTMLInputElement).validity.valueMissing)).toBe(true);
  await tracking.fill("TH123456789");
  await dialog.getByLabel(/Tracking URL/).fill("https://track.example.test/TH123456789");
  await dialog.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText("TH123456789").first()).toBeVisible();
  await expect(page.getByText("no further status changes").or(page.getByRole("button", { name: "Mark DELIVERED" }))).toBeVisible();
});
