import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, localePath, type Locale } from "./locale";

/** Resolve the [locale] route param or 404. */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

/**
 * Canonical + hreflang alternates for a locale-less path ("/p/jelly-lip-tint", "" for home).
 * Each locale's canonical is its own URL (never the other locale's); x-default -> th.
 */
export function pageAlternates(locale: Locale, path: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localePath(locale, path || "/"),
    languages: {
      th: localePath("th", path || "/"),
      en: localePath("en", path || "/"),
      "x-default": localePath("th", path || "/"),
    },
  };
}

export function pageMetadata(opts: {
  locale: Locale;
  path: string;
  title: string;
  description?: string;
  noindex?: boolean;
  image?: string | null;
}): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: pageAlternates(opts.locale, opts.path),
    robots: opts.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: opts.title,
      description: opts.description,
      locale: opts.locale === "th" ? "th_TH" : "en_US",
      type: "website",
      url: localePath(opts.locale, opts.path || "/"),
      images: opts.image ? [opts.image] : undefined,
    },
  };
}
