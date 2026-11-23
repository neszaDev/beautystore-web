import type { Metadata } from "next";
import { ProductListing, parseListingParams } from "@/features/catalog/product-listing";
import { getDictionary } from "@/i18n";
import { localePath } from "@/lib/locale";
import { pageMetadata, resolveLocale } from "@/lib/route";
import { flattenSearchParams } from "@/lib/url";

export async function generateMetadata({ params, searchParams }: PageProps<"/[locale]/products">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const q = parseListingParams(flattenSearchParams(await searchParams)).q;
  return pageMetadata({ locale, path: "/products", title: q ? `${q} | ${t.seo.productsTitle}` : t.seo.productsTitle, description: t.seo.siteDescription, noindex: Boolean(q) });
}

export default async function ProductsPage({ params, searchParams }: PageProps<"/[locale]/products">) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return (
    <ProductListing
      locale={locale}
      basePath={localePath(locale, "/products")}
      title={t.listing.allTitle}
      searchParams={flattenSearchParams(await searchParams)}
    />
  );
}
