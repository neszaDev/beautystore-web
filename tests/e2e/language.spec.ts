import { expect, test } from "@playwright/test";
import { SEED, settle } from "./helpers";

test("language switch keeps the current path and persists", async ({ page }) => {
  await page.goto(`/th/p/${SEED.lipTint}`);
  await settle(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "th");
  await page.getByTestId("language-switch").first().click();
  await page.waitForURL(`**/en/p/${SEED.lipTint}`);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  // locale-less URL now redirects using the remembered locale
  await page.goto("/products");
  await page.waitForURL("**/en/products");
});

test("locale-less root redirects to th by default", async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/");
  await page.waitForURL("**/th");
  await ctx.close();
});

test("each locale's canonical points at itself, with hreflang alternates for both", async ({ page }) => {
  for (const locale of ["th", "en"] as const) {
    await page.goto(`/${locale}/p/jelly-lip-tint`);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(new RegExp(`/${locale}/p/jelly-lip-tint$`));
    for (const alt of ["th", "en"]) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${alt}"]`)).toHaveAttribute("href", new RegExp(`/${alt}/p/jelly-lip-tint$`));
    }
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
  }
});
