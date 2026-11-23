import Link from "next/link";
import { headers } from "next/headers";
import { getDictionary } from "@/i18n";
import { DEFAULT_LOCALE, isLocale, localePath } from "@/lib/locale";

/** Global 404 (unmatched URLs, also outside /[locale]); minimal chrome. */
export default async function NotFound() {
  const l = (await headers()).get("x-locale");
  const locale = isLocale(l) ? l : DEFAULT_LOCALE;
  const t = getDictionary(locale);
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="mb-3 text-4xl">{t.errors.notFoundTitle}</h1>
      <p className="mb-6 text-ink-soft">{t.errors.notFoundText}</p>
      <Link href={localePath(locale)} className="btn btn-primary">{t.nav.home}</Link>
    </main>
  );
}
