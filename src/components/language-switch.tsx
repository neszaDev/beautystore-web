"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useI18n } from "./i18n-provider";
import { switchLocalePath } from "@/lib/locale";

/**
 * Persistent language switch: same page in the other locale, query preserved. It is a plain
 * <a> (full navigation) so <html lang> in the root layout is re-rendered; proxy.ts stores bs_locale.
 */
export function LanguageSwitch({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const target = locale === "th" ? "en" : "th";
  return (
    <a
      href={switchLocalePath(pathname, target, search)}
      hrefLang={target}
      lang={target}
      data-testid="language-switch"
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-ink px-3 text-sm font-semibold hover:bg-ink hover:text-cream ${className}`}
    >
      {t.common.switchTo}
    </a>
  );
}
