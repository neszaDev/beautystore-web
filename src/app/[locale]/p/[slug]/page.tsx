import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { Starburst } from "@/components/starburst";
import { StatePanel } from "@/components/state-panel";
import { ProductCard } from "@/features/catalog/product-card";
import { ProductGallery } from "@/features/catalog/product-gallery";
import { ProductPurchase } from "@/features/catalog/product-purchase";
import { WishlistButton } from "@/features/catalog/wishlist-button";
import { getDictionary } from "@/i18n";
import { ApiError, tryApi } from "@/lib/api";
import { getEnv } from "@/lib/env";
import { localePath } from "@/lib/locale";
import { getProduct } from "@/lib/queries";
import { pageMetadata, resolveLocale } from "@/lib/route";
import type { ProductDetail } from "@/lib/types";

async function load(locale: "th" | "en", slug: string) {
  const res = await tryApi(() => getProduct(locale, slug));
  if (!res.ok && res.error instanceof ApiError && res.error.status === 404) notFound();
  return res;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const res = await load(locale, slug);
  const t = getDictionary(locale);
  if (!res.ok) return pageMetadata({ locale, path: `/p/${slug}`, title: t.errors.errorTitle, noindex: true });
  const p = res.data;
  return pageMetadata({
    locale,
    path: `/p/${slug}`,
    title: p.name,
    description: p.description?.slice(0, 160) ?? t.seo.siteDescription,
    image: p.media[0]?.url,
  });
}

function jsonLd(p: ProductDetail, locale: "th" | "en") {
  const site = getEnv().siteUrl;
  const abs = (u: string) => (u.startsWith("http") ? u : `${site}${u}`);
  const url = `${site}${localePath(locale, `/p/${p.slug}`)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? undefined,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    image: p.media.map((m) => abs(m.url)),
    sku: p.variants[0]?.sku,
    url,
    offers: p.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      price: v.price,
      priceCurrency: v.currency,
      availability: v.stockStatus === "OUT_OF_STOCK" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url,
    })),
  };
}

export default async function ProductPage({ params }: PageProps<"/[locale]/p/[slug]">) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const res = await load(locale, slug);
  if (!res.ok) {
    return (
      <Container>
        <StatePanel tone="error" title={t.errors.errorTitle}>
          <p>{t.errors.apiDown}</p>
        </StatePanel>
      </Container>
    );
  }
  const p = res.data;
  const lang = p.localeFallback ? (locale === "th" ? "en" : "th") : undefined;
  const sections: [string, string | null][] = [
    [t.product.description, p.description],
    [t.product.howToUse, p.howToUse],
    [t.product.ingredients, p.ingredients],
    [t.product.warnings, p.warnings],
  ];

  return (
    <Container>
      <script
        type="application/ld+json"
        // "<" escaped so product text can never close the script element
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(p, locale)).replace(/</g, "\\u003c") }}
      />
      <nav aria-label={t.product.breadcrumb} className="mb-4 text-sm text-ink-soft">
        <Link href={localePath(locale, "/products")} className="underline-offset-4 hover:underline">{t.listing.allTitle}</Link>
        {" / "}
        <Link href={localePath(locale, `/c/${p.category.slug}`)} className="underline-offset-4 hover:underline">{p.category.name}</Link>
      </nav>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative">
          <ProductGallery media={p.media} name={p.name} />
          {p.isDemo && (
            <Starburst className="pointer-events-none absolute left-2 top-2 h-20 w-20 text-xs" fill="var(--color-butter)">
              {t.common.demoBadge}
            </Starburst>
          )}
        </div>
        <div className="space-y-5" lang={lang}>
          <div>
            {p.brand && <p className="text-sm uppercase tracking-wide text-ink-soft">{p.brand}</p>}
            <div className="flex items-start justify-between gap-3">
              <h1 className="label-type text-3xl sm:text-4xl">{p.name}</h1>
              <WishlistButton productId={p.id} className="shrink-0" />
            </div>
            {p.localeFallback && <p className="mt-1 text-sm text-ink-soft">{t.common.fallbackNote}</p>}
          </div>
          <ProductPurchase product={{ name: p.name, variants: p.variants }} />
          <div className="divide-y-2 divide-ink border-y-2 border-ink">
            {sections.map(([title, body], i) => (
              <details key={title} open={i === 0} className="group py-3">
                <summary className="flex min-h-11 cursor-pointer items-center justify-between font-semibold">
                  {title}
                  <span aria-hidden="true" className="text-xl group-open:rotate-45">+</span>
                </summary>
                <p className={`mt-2 whitespace-pre-line ${body ? "" : "italic text-ink-soft"}`}>{body ?? t.common.toBeSupplied}</p>
              </details>
            ))}
            <details className="group py-3">
              <summary className="flex min-h-11 cursor-pointer items-center justify-between font-semibold">
                {t.product.delivery}
                <span aria-hidden="true" className="text-xl group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 italic text-ink-soft">{t.product.deliveryText}</p>
            </details>
          </div>
        </div>
      </div>
      {p.related.length > 0 && (
        <section className="mt-14" aria-labelledby="rel-h">
          <h2 id="rel-h" className="mb-5 text-2xl">{t.product.related}</h2>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
            {p.related.map((r) => (
              <li key={r.id}><ProductCard product={r} locale={locale} t={t} /></li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
