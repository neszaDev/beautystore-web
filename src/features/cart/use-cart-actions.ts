"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/components/i18n-provider";
import { useShop } from "@/components/shop-provider";
import { promoReasonMessage } from "@/i18n";
import { formatMoney } from "@/lib/money";
import type { ActionResult } from "@/lib/action";
import type { Cart } from "@/lib/types";
import { applyPromotion, removeCartItem, removePromotion, updateCartItem } from "./actions";

/** Cart mutations for drawer + page: updates shared cart state, announces, exposes a localized error. */
export function useCartActions() {
  const { locale, t, f, err } = useI18n();
  const { setCart, announce } = useShop();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function apply(result: ActionResult<Cart>, message: string): boolean {
    if (result.ok) {
      setCart(result.data);
      setError(null);
      announce(message);
      return true;
    }
    let msg = err(result.code);
    if (result.code === "PROMOTION_INVALID") {
      const d = result.details ?? {};
      const min = typeof d.minSubtotal === "string" ? formatMoney(d.minSubtotal, locale) : "";
      msg = promoReasonMessage(t, typeof d.reason === "string" ? d.reason : null, min);
    }
    setError(msg);
    announce(msg);
    return false;
  }

  return {
    pending,
    error,
    setQuantity: (variantId: number, quantity: number) =>
      start(async () => void apply(await updateCartItem(variantId, quantity, locale), t.cart.updated)),
    remove: (variantId: number) =>
      start(async () => void apply(await removeCartItem(variantId, locale), t.cart.removed)),
    applyCode: (code: string, onDone?: (ok: boolean) => void) =>
      start(async () => {
        const res = await applyPromotion(code, locale);
        const ok = apply(res, f(t.cart.promoApplied, { code: code.trim().toUpperCase() }));
        onDone?.(ok);
      }),
    removeCode: () => start(async () => void apply(await removePromotion(locale), t.cart.updated)),
  };
}
