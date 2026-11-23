"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { errorMessage, fmt, type Dict } from "@/i18n";
import type { Locale } from "@/lib/locale";

type I18n = {
  locale: Locale;
  t: Dict;
  /** Fill {placeholders} in a dictionary string. */
  f: typeof fmt;
  /** Localized message for an API error code. */
  err: (code: string) => string;
};
const Ctx = createContext<I18n | null>(null);

/** Receives only the current locale's dictionary from the server layout. */
export function I18nProvider({ locale, dict, children }: { locale: Locale; dict: Dict; children: ReactNode }) {
  const value = useMemo<I18n>(() => ({ locale, t: dict, f: fmt, err: (c) => errorMessage(dict, c) }), [locale, dict]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n must be used inside <I18nProvider>");
  return v;
}
