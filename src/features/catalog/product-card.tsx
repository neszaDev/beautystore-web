import Link from "next/link";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { Starburst } from "@/components/starburst";
import { SwatchDots } from "@/components/swatches";
import type { Dict } from "@/i18n";
import { localePath, type Locale } from "@/lib/locale";
import type { ProductCard as Card } from "@/lib/types";
import { isOnSale } from "@/lib/variants";
import { WishlistButton } from "./wishlist-button";

/** Name, price, shades and stock are always visible; hover changes colour only (nothing moves). */
export function ProductCard({ product: p, locale, t, priority = false }: { product: Card; locale: Locale; t: Dict; priority?: boolean }) {
  const sale = isOnSale(p.priceFrom, p.compareAtPrice);
  const lang = p.localeFallback ? (locale === "th" ? "en" : "th") : undefined;
  return (
    <article className="group relative flex flex-col" data-testid="product-card">
      <div className="relative">
        <Link href={localePath(locale, `/p/${p.slug}`)} tabIndex={-1} aria-hidden="true">
          <ProductImage src={p.imageUrl} alt={p.imageAlt} priority={priority} />
        </Link>
        <div className="absolute right-2 top-2 z-10">
          <WishlistButton productId={p.id} />
        </div>
        {(sale || p.isDemo) && (
          <div className="pointer-events-none absolute bottom-2 left-2 flex gap-1">
            {sale && (
              <Starburst className="h-14 w-14 text-xs" fill="var(--color-strawberry)">
                SALE
              </Starburst>
            )}
            {p.isDemo && (
              <Starburst className="h-14 w-14 text-[10px]" fill="var(--color-butter)">
                {t.common.sample}
              </Starburst>
            )}
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-1 flex-col gap-1">
        {p.brand && <p className="text-xs uppercase tracking-wide text-ink-soft">{p.brand}</p>}
        <h3 className="label-type text-base leading-snug sm:text-lg" lang={lang}>
          <Link href={localePath(locale, `/p/${p.slug}`)} className="after:absolute after:inset-0 after:content-[''] group-hover:underline">
            {p.name}
          </Link>
        </h3>
        <SwatchDots colors={p.swatches} />
        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-2 pt-1">
          <Price amount={p.priceFrom} compareAt={p.compareAtPrice} locale={locale} />
          <span className={`text-sm ${p.stockStatus === "IN_STOCK" ? "text-ink-soft" : "font-semibold text-cherry-deep"}`}>
            {t.stock[p.stockStatus]}
          </span>
        </div>
      </div>
    </article>
  );
}
