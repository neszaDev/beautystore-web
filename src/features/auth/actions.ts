"use server";

import { api, ApiError } from "@/lib/api";
import { run, type ActionResult } from "@/lib/action";
import { DEFAULT_LOCALE, isLocale, localePath } from "@/lib/locale";
import { clearCartToken, clearSession, safeNext, setSession } from "@/lib/session";
import { COOKIE_CART } from "@/lib/cookie-names";
import { cookies } from "next/headers";
import type { AuthResponse } from "@/lib/types";

/** After sign-in: move the guest cart into the user's cart, then drop the guest cookie. */
async function adoptSession(auth: AuthResponse, locale: string): Promise<void> {
  const guest = (await cookies()).get(COOKIE_CART)?.value;
  await setSession(auth);
  if (guest) {
    try {
      await api("/cart/merge", { method: "POST", bearer: auth.accessToken, cartToken: guest, locale: isLocale(locale) ? locale : DEFAULT_LOCALE });
    } catch (e) {
      if (!(e instanceof ApiError)) throw e; // a failed merge must never block sign-in
    }
    await clearCartToken();
  }
}

const dest = (locale: string, next: string | undefined) =>
  safeNext(next, localePath(isLocale(locale) ? locale : DEFAULT_LOCALE, "/account"));

export async function login(input: { email: string; password: string; locale: string; next?: string }): Promise<ActionResult<{ next: string }>> {
  return run(async () => {
    const auth = await api<AuthResponse>("/auth/login", { method: "POST", auth: false, body: { email: input.email.trim(), password: input.password } });
    await adoptSession(auth, input.locale);
    return { next: dest(input.locale, input.next) };
  });
}

export async function register(input: { email: string; password: string; fullName: string; locale: string; next?: string }): Promise<ActionResult<{ next: string }>> {
  return run(async () => {
    const auth = await api<AuthResponse>("/auth/register", {
      method: "POST", auth: false,
      body: { email: input.email.trim(), password: input.password, fullName: input.fullName.trim() },
    });
    await adoptSession(auth, input.locale);
    return { next: dest(input.locale, input.next) };
  });
}

export async function logout(locale: string): Promise<ActionResult<{ next: string }>> {
  await clearSession();
  return { ok: true, data: { next: localePath(isLocale(locale) ? locale : DEFAULT_LOCALE) } };
}

export async function requestPasswordReset(email: string, locale: string): Promise<ActionResult> {
  return run(() => api("/auth/password-reset/request", { method: "POST", auth: false, body: { email: email.trim(), locale: isLocale(locale) ? locale : DEFAULT_LOCALE } }));
}

export async function confirmPasswordReset(token: string, password: string): Promise<ActionResult> {
  return run(() => api("/auth/password-reset/confirm", { method: "POST", auth: false, body: { token, password } }));
}
