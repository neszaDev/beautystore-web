import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { localePath, type Locale } from "@/lib/locale";
import type { Dict } from "@/i18n";
import { Wordmark } from "./wordmark";
import { LanguageSwitch } from "./language-switch";

const HELP = ["faq", "contact", "delivery", "returns", "privacy", "terms"] as const;

export function SiteFooter({ locale, t }: { locale: Locale; t: Dict }) {
  return (
    <footer className="on-dark mt-16 bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Wordmark className="text-cream" />
          <p className="max-w-xs text-sm opacity-90">{t.footer.about}</p>
          <LanguageSwitch className="!border-cream text-cream hover:!bg-cream hover:!text-ink" />
        </div>
        <nav aria-label={t.footer.shop}>
          <h2 className="mb-3 text-lg">{t.footer.shop}</h2>
          <ul className="space-y-1">
            <li><Link className="inline-block py-2 underline-offset-4 hover:underline" href={localePath(locale, "/products")}>{t.nav.all}</Link></li>
            <li><Link className="inline-block py-2 underline-offset-4 hover:underline" href={localePath(locale, "/c/lips")}>{t.nav.lips}</Link></li>
            <li><Link className="inline-block py-2 underline-offset-4 hover:underline" href={localePath(locale, "/c/cheeks")}>{t.nav.cheeks}</Link></li>
          </ul>
        </nav>
        <nav aria-label={t.footer.help} className="lg:col-span-2">
          <h2 className="mb-3 text-lg">{t.footer.help}</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            {HELP.map((slug) => (
              <li key={slug}>
                <Link className="inline-block py-2 underline-offset-4 hover:underline" href={localePath(locale, `/help/${slug}`)}>
                  {t.help[slug].title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-cream/30 px-4 py-4 text-center text-xs">
        © {new Date().getFullYear()} {BRAND.name} · {t.footer.rights} · {t.footer.provisional}
      </div>
    </footer>
  );
}
