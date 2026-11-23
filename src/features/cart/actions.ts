"use server";

import { api } from "@/lib/api";
import { run, type ActionResult } from "@/lib/action";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/locale";
import { hasSession, setCartToken } from "@/lib/session";
import type { Cart } from "@/lib/types";

const loc = (l: string): Locale => (isLocale(l) ? l : DEFAULT_LOCALE);

async function remember(cart: Cart): Promise<Cart> {
  if (cart.token && !(await hasSession())) await setCartToken(cart.token);
  return cart;
}

export async function addToCart(variantId: number, quantity: number, locale: string): Promise<ActionResult<Cart>> {
  return run(async () =>
    remember(await api<Cart>("/cart/items", { method: "POST", body: { variantId, quantity }, locale: loc(locale), cart: true })),
  );
}

export async function updateCartItem(variantId: number, quantity: number, locale: string): Promise<ActionResult<Cart>> {
  return run(async () =>
    remember(await api<Cart>(`/cart/items/${variantId}`, { method: "PUT", body: { quantity }, locale: loc(locale), cart: true })),
  );
}

export async function removeCartItem(variantId: number, locale: string): Promise<ActionResult<Cart>> {
  return run(async () =>
    remember(await api<Cart>(`/cart/items/${variantId}`, { method: "DELETE", locale: loc(locale), cart: true })),
  );
}

export async function applyPromotion(code: string, locale: string): Promise<ActionResult<Cart>> {
  return run(async () =>
    remember(await api<Cart>("/cart/promotion", { method: "PUT", body: { code: code.trim() }, locale: loc(locale), cart: true })),
  );
}

export async function removePromotion(locale: string): Promise<ActionResult<Cart>> {
  return run(async () =>
    remember(await api<Cart>("/cart/promotion", { method: "DELETE", locale: loc(locale), cart: true })),
  );
}
