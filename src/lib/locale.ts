import { COOKIE_LOCALE } from "./cookie-names";

export const LOCALES = ["th", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "th";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "th" || value === "en";
}

/** "/th/p/x" -> { locale: "th", rest: "/p/x" }; no locale prefix -> locale null. */
export function splitLocale(pathname: string): { locale: Locale | null; rest: string } {
  const [, first = "", ...more] = pathname.split("/");
  if (isLocale(first)) return { locale: first, rest: more.length ? "/" + more.join("/") : "" };
  return { locale: null, rest: pathname };
}

/** Prefix an app-relative path ("/cart", "/") with a locale. Always returns a path starting with "/". */
export function localePath(locale: Locale, path = "/"): string {
  const p = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${p}`;
}

/** Same page in another locale; keeps query string. Used by the language switch. */
export function switchLocalePath(pathname: string, target: Locale, search = ""): string {
  const { rest } = splitLocale(pathname);
  return localePath(target, rest || "/") + (search ? (search.startsWith("?") ? search : `?${search}`) : "");
}

const BYPASS_PREFIXES = ["/admin", "/api", "/media", "/demo", "/_next"];

/** Paths the locale redirect must leave alone. */
export function bypassesLocale(pathname: string): boolean {
  if (BYPASS_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return true;
  const last = pathname.split("/").pop() ?? "";
  return last.includes("."); // static files (favicon.ico, robots.txt, sitemap.xml ...)
}

/** Where a locale-less request should go, or null when no redirect is needed. */
export function localeRedirectTarget(pathname: string, cookieLocale: string | undefined, search = ""): string | null {
  if (bypassesLocale(pathname) || splitLocale(pathname).locale) return null;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  return localePath(locale, pathname) + search;
}

export { COOKIE_LOCALE };
