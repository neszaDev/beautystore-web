import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { getDictionary } from "@/i18n";
import { pageMetadata, resolveLocale } from "@/lib/route";

const SLUGS = ["faq", "contact", "delivery", "returns", "privacy", "terms"] as const;
type Slug = (typeof SLUGS)[number];
const isSlug = (s: string): s is Slug => (SLUGS as readonly string[]).includes(s);

export async function generateMetadata({ params }: PageProps<"/[locale]/help/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  if (!isSlug(slug)) notFound();
  return pageMetadata({ locale, path: `/help/${slug}`, title: getDictionary(locale).help[slug].title, noindex: true });
}

/** Policy / legal pages are PLACEHOLDERS until the merchant supplies real content. */
export default async function HelpPage({ params }: PageProps<"/[locale]/help/[slug]">) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  if (!isSlug(slug)) notFound();
  const t = getDictionary(locale);
  return (
    <Container className="max-w-2xl">
      <h1 className="mb-4 text-3xl">{t.help[slug].title}</h1>
      <p className="border-2 border-ink bg-butter p-4 font-semibold" data-testid="placeholder-note">{t.common.placeholder}</p>
    </Container>
  );
}
