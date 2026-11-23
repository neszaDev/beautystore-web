import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/features/catalog/product-listing";
import { getDictionary } from "@/i18n";
import { tryApi } from "@/lib/api";
import { localePath } from "@/lib/locale";
import { getCategories } from "@/lib/queries";
import { pageMetadata, resolveLocale } from "@/lib/route";
import { flattenSearchParams } from "@/lib/url";

async function findCategory(locale: "th" | "en", slug: string) {
  const res = await tryApi(() => getCategories(locale));
  if (!res.ok) return null; // API down: render the listing's own error state
  const category = res.data.find((c) => c.slug === slug);
  if (!category) notFound();
  return category;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/c/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const found = await findCategory(locale, slug);
  const t = getDictionary(locale);
  const title = found?.name ?? t.listing.allTitle;
  return pageMetadata({ locale, path: `/c/${slug}`, title, description: found?.description ?? t.seo.siteDescription });
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[locale]/c/[slug]">) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const found = await findCategory(locale, slug);
  const t = getDictionary(locale);
  return (
    <ProductListing
      locale={locale}
      basePath={localePath(locale, `/c/${slug}`)}
      title={found?.name ?? t.listing.allTitle}
      category={slug}
      searchParams={flattenSearchParams(await searchParams)}
    />
  );
}
