"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { promoReasonMessage } from "@/i18n";
import type { Cart } from "@/lib/types";
import { useCartActions } from "./use-cart-actions";

export function PromoForm({ cart }: { cart: Cart }) {
  const { t, f } = useI18n();
  const { applyCode, removeCode, pending, error } = useCartActions();
  const [code, setCode] = useState("");
  const promo = cart.promotion;

  return (
    <div className="space-y-2">
      {promo ? (
        <div className="flex items-center justify-between gap-3 border-2 border-ink bg-mint px-3 py-2">
          <span className="font-semibold" data-testid="promo-applied">
            {promo.valid ? f(t.cart.promoApplied, { code: promo.code }) : f(t.cart.promoInvalid, { code: promo.code })}
          </span>
          <button type="button" className="min-h-11 text-sm underline underline-offset-4" onClick={removeCode} disabled={pending}>
            {t.cart.promoRemove}
          </button>
        </div>
      ) : (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) applyCode(code, (ok) => ok && setCode(""));
          }}
        >
          <label htmlFor="promo-code" className="sr-only">
            {t.cart.promoLabel}
          </label>
          <input
            id="promo-code"
            className="field min-w-0 flex-1 uppercase"
            placeholder={t.cart.promoLabel}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
            aria-describedby={error ? "promo-error" : undefined}
          />
          <button type="submit" className="btn btn-ink" disabled={pending || !code.trim()}>
            {t.cart.promoApply}
          </button>
        </form>
      )}
      {promo && !promo.valid && promo.reason && (
        <p role="alert" className="err">
          {promoReasonMessage(t, promo.reason)}
        </p>
      )}
      {error && (
        <p id="promo-error" role="alert" className="err">
          {error}
        </p>
      )}
    </div>
  );
}
