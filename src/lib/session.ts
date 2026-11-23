import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiError } from "./api";
import { COOKIE_CART, COOKIE_SESSION, orderTokenCookie } from "./cookie-names";
import { getEnv } from "./env";
import { localePath, type Locale } from "./locale";
import type { AuthResponse, UserView } from "./types";

/** Cookie options: HttpOnly, SameSite=Lax, Secure unless SESSION_COOKIE_SECURE=false. */
export function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: getEnv().cookieSecure,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
export const ORDER_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

/** Server Actions / route handlers only. */
export async function setSession(auth: AuthResponse): Promise<void> {
  (await cookies()).set(COOKIE_SESSION, auth.accessToken, cookieOptions(auth.expiresIn));
}
export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE_SESSION);
}
export async function setCartToken(token: string): Promise<void> {
  (await cookies()).set(COOKIE_CART, token, cookieOptions(CART_COOKIE_MAX_AGE));
}
export async function clearCartToken(): Promise<void> {
  (await cookies()).delete(COOKIE_CART);
}
export async function setOrderToken(orderNumber: string, token: string): Promise<void> {
  (await cookies()).set(orderTokenCookie(orderNumber), token, cookieOptions(ORDER_COOKIE_MAX_AGE));
}
export async function getOrderToken(orderNumber: string): Promise<string | undefined> {
  return (await cookies()).get(orderTokenCookie(orderNumber))?.value;
}
export async function hasSession(): Promise<boolean> {
  return Boolean((await cookies()).get(COOKIE_SESSION)?.value);
}

/** Signed-in user or null (also null when the API is down or the token expired). Memoised per request. */
export const getCurrentUser = cache(async (): Promise<UserView | null> => {
  if (!(await hasSession())) return null;
  try {
    return await api<UserView>("/me");
  } catch (e) {
    if (e instanceof ApiError) return null;
    throw e;
  }
});

/** Redirect to /login?next=... unless signed in. */
export async function requireUser(locale: Locale, nextPath: string): Promise<UserView> {
  const user = await getCurrentUser();
  if (!user) redirect(`${localePath(locale, "/login")}?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/** Only allow same-site relative redirect targets ("/th/account"), never "//evil" or absolute URLs. */
export function safeNext(next: string | null | undefined, fallback: string): string {
  return next && /^\/(?!\/)[^\\]*$/.test(next) ? next : fallback;
}
