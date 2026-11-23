import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { ProductImage } from "@/components/product-image";
import { Starburst } from "@/components/starburst";
import { StatePanel } from "@/components/state-panel";
import { SwatchDots } from "@/components/swatches";
import { ProductCard } from "@/features/catalog/product-card";
import { getDictionary } from "@/i18n";
import { tryApi } from "@/lib/api";
import { BRAND } from "@/lib/brand";
import { localePath } from "@/lib/locale";
import { getCategories, getProducts } from "@/lib/queries";
import { pageMetadata, resolveLocale } from "@/lib/route";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return pageMetadata({ locale, path: "", title: `${BRAND.name} — ${BRAND.tagline[locale]}`, description: t.seo.siteDescription });
}

const TILE_BG = ["bg-mint", "bg-lilac", "bg-butter", "bg-strawberry", "bg-mint"];

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const [products, categories] = await Promise.all([tryApi(() => getProducts(locale, { size: 24 })), tryApi(() => getCategories(locale))]);
  const items = products.ok ? products.data.items : [];
  const bestsellers = items.slice(0, 8);
  const recommended = items.slice(8, 12).length ? items.slice(8, 12) : [...items].reverse().slice(0, 4);
  const hero = items[0];
  const shop = localePath(locale, "/products");

  return (
    <>
      {/* 1. Editorial hero: Shop CTA is inside the first mobile screen */}
      <section className="border-b-2 border-ink bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 md:grid-cols-[1.1fr_1fr] md:py-14">
          <div>
            <p className="label-type mb-3 inline-block bg-butter px-3 py-1 text-sm">{t.home.heroEyebrow}</p>
            <h1 className="whitespace-pre-line text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">{t.home.heroTitle}</h1>
            <p className="mt-4 max-w-md text-lg text-ink-soft">{t.home.heroText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={shop} className="btn btn-primary" data-testid="hero-shop">{t.home.heroCta}</Link>
              <Link href="#discover" className="btn btn-ghost">{t.home.heroCta2}</Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div className="border-2 border-ink bg-strawberry p-3 sm:p-5">
              <ProductImage src={hero?.imageUrl ?? null} alt={hero?.imageAlt ?? null} priority sizes="(min-width:768px) 40vw, 90vw" />
            </div>
            <Starburst className="absolute -left-2 -top-3 h-20 w-20 text-sm sm:-left-5 sm:h-24 sm:w-24" fill="var(--color-butter)">
              {t.common.sample}
            </Starburst>
          </div>
        </div>
      </section>

      {/* 2. Dense bestseller line-up */}
      <Container>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl">{t.home.bestsellers}</h2>
            <p className="text-ink-soft">{t.home.bestsellersSub}</p>
          </div>
          <Link href={shop} className="font-semibold underline underline-offset-4">{t.common.viewAll}</Link>
        </div>
        {!products.ok ? (
          <StatePanel tone="error" title={t.errors.errorTitle}><p>{t.errors.apiDown}</p></StatePanel>
        ) : bestsellers.length === 0 ? (
          <StatePanel title={t.home.emptyCatalog} />
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
            {bestsellers.map((p, i) => (
              <li key={p.id}><ProductCard product={p} locale={locale} t={t} priority={i < 4} /></li>
            ))}
          </ul>
        )}
      </Container>

      {/* 3. Colour / category discovery: swatch strips come from real variant swatches */}
      <section id="discover" className="border-y-2 border-ink bg-white">
        <Container>
          <h2 className="text-3xl">{t.home.discover}</h2>
          <p className="mb-5 text-ink-soft">{t.home.discoverSub}</p>
          {categories.ok && categories.data.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {categories.data.map((c, i) => {
                const swatches = [...new Set(items.filter((p) => p.categorySlug === c.slug).flatMap((p) => p.swatches))].slice(0, 8);
                return (
                  <li key={c.id}>
                    <Link href={localePath(locale, `/c/${c.slug}`)} className={`${TILE_BG[i % TILE_BG.length]} flex h-full min-h-32 flex-col justify-between border-2 border-ink p-4 hover:bg-butter`}>
                      <span className="label-type text-2xl">{c.name}</span>
                      <span className="mt-4 flex items-center justify-between">
                        <SwatchDots colors={swatches} size={18} />
                        <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </section>

      {/* 4. Quiet product story */}
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="mb-4 text-2xl">{t.home.story}</h2>
        <p className="text-lg leading-relaxed text-ink-soft">{t.home.storyText}</p>
      </section>

      {/* 5. Campaign colour field */}
      <section className="bg-strawberry text-ink">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-14 md:grid-cols-[auto_1fr]">
          <Starburst className="mx-auto h-36 w-36 text-base md:h-48 md:w-48 md:text-xl" fill="var(--color-butter)">
            {t.home.campaign}
          </Starburst>
          <div>
            <h2 className="text-4xl sm:text-5xl">{t.home.campaignTitle}</h2>
            <p className="mt-2 max-w-lg text-lg">{t.home.campaignText}</p>
            <Link href={shop} className="btn btn-ink mt-5">{t.common.shop}</Link>
          </div>
        </div>
      </section>

      {/* 6. Recommendations */}
      {recommended.length > 0 && (
        <Container>
          <h2 className="mb-5 text-3xl">{t.home.recommended}</h2>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4">
            {recommended.map((p) => (
              <li key={p.id}><ProductCard product={p} locale={locale} t={t} /></li>
            ))}
          </ul>
        </Container>
      )}

      {/* 7. Trust strip (delivery/returns copy is placeholder) */}
      <section className="border-y-2 border-ink bg-mint">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-6 md:grid-cols-3">
          <div>
            <h2 className="label-type text-lg">{t.home.trustTitle}</h2>
            <p>{t.home.trustPayments}</p>
          </div>
          <p className="italic">{t.home.trustDelivery}</p>
          <p className="italic">{t.home.trustReturns}</p>
        </div>
      </section>
    </>
  );
}
