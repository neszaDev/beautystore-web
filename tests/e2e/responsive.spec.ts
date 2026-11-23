import { expect, test } from "@playwright/test";
import { SEED, settle } from "./helpers";

const WIDTHS = [320, 390, 768, 1024, 1440];
const PAGES = ["/th", "/th/products", `/th/p/${SEED.lipTint}`, "/th/cart", "/th/checkout"];

for (const width of WIDTHS) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of PAGES) {
      await page.goto(path);
      await settle(page);
      const { scroll, inner } = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        inner: window.innerWidth,
      }));
      expect(scroll, `${path} @ ${width}px`).toBeLessThanOrEqual(inner);
    }
  });
}
