import { expect, test } from "@playwright/test";
import { settle, uniqueEmail } from "./helpers";

test("register, logout, login", async ({ page }) => {
  const email = uniqueEmail("user");
  const password = "correct-horse-battery";

  await page.goto("/th/register");
  await settle(page);
  await page.getByLabel("ชื่อ-นามสกุล").fill("ผู้ทดสอบ");
  await page.getByLabel("อีเมล").fill(email);
  await page.getByLabel("รหัสผ่าน").fill(password);
  await page.getByRole("button", { name: "สมัครสมาชิก" }).click();
  await page.waitForURL("**/th/account");
  await expect(page.getByText(email)).toBeVisible();

  await page.getByTestId("logout").click();
  await page.waitForURL("**/th");
  await page.goto("/th/account");
  await page.waitForURL(/\/th\/login/); // protected: bounced to login

  await settle(page);
  await page.getByLabel("อีเมล").fill(email);
  await page.getByLabel("รหัสผ่าน").fill(password);
  await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  await page.waitForURL("**/th/account");
  await expect(page.getByText(email)).toBeVisible();
});
