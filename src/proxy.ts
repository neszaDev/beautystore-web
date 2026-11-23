import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_LOCALE } from "@/lib/cookie-names";
import { DEFAULT_LOCALE, isLocale, localeRedirectTarget, splitLocale } from "@/lib/locale";

/**
 * Locale routing. Locale-less storefront paths redirect to /{bs_locale|th}/...; /admin, /api,
 * /media, /demo, /_next and static files pass through. The resolved locale is exposed to the
 * root layout via the x-locale request header (for <html lang>) and remembered in bs_locale.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const cookieLocale = request.cookies.get(COOKIE_LOCALE)?.value;

  const target = localeRedirectTarget(pathname, cookieLocale, search);
  if (target) return NextResponse.redirect(new URL(target, request.url));

  const fromPath = splitLocale(pathname).locale;
  const locale = fromPath ?? (isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE);
  const headers = new Headers(request.headers);
  headers.set("x-locale", locale);
  const response = NextResponse.next({ request: { headers } });
  if (fromPath && fromPath !== cookieLocale) {
    response.cookies.set(COOKIE_LOCALE, fromPath, {
      path: "/",
      sameSite: "lax",
      secure: process.env.SESSION_COOKIE_SECURE?.trim() !== "false",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/|api/|media/|demo/|.*\\..*).*)"],
};
