import type { MetadataRoute } from "next";
import { tryApi } from "@/lib/api";
import { getEnv } from "@/lib/env";
import { LOCALES, localePath } from "@/lib/locale";
import { getSitemapData } from "@/lib/queries";

export const dynamic = "force-dynamic"; // reads the API at request time, never baked in at build

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getEnv().siteUrl;
  const entry = (path: string, lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: `${site}${localePath("th", path)}`,
    lastModified,
    alternates: { languages: { th: `${site}${localePath("th", path)}`, en: `${site}${localePath("en", path)}` } },
  });
  // one entry per locale URL (each its own canonical), both carrying hreflang alternates
  const both = (path: string, lastModified?: string) =>
    LOCALES.map((l) => ({ ...entry(path, lastModified), url: `${site}${localePath(l, path)}` }));

  const data = await tryApi(() => getSitemapData());
  return [
    ...both("/"),
    ...both("/products"),
    ...(data.ok ? data.data.categories.flatMap((c) => both(`/c/${c.slug}`, c.updatedAt)) : []),
    ...(data.ok ? data.data.products.flatMap((p) => both(`/p/${p.slug}`, p.updatedAt)) : []),
  ];
}
