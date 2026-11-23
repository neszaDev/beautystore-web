"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { formatMoney, isPositive } from "@/lib/money";
import { localePath } from "@/lib/locale";
import type { Cart } from "@/lib/types";
import { PromoForm } from "./promo-form";

/** Totals + promo + checkout CTA. The CTA is disabled while the server reports hasProblems. */
export function CartSummary({ cart, onNavigate, showPromo = true }: { cart: Cart; onNavigate?: () => void; showPromo?: boolean }) {
  const { locale, t } = useI18n();
  const blocked = cart.hasProblems || cart.items.length === 0;
  return (
    <div className="space-y-3">
      {showPromo && <PromoForm cart={cart} />}
      <dl className="space-y-1">
        <div className="flex justify-between">
          <dt>{t.cart.subtotal}</dt>
          <dd data-testid="cart-subtotal">{formatMoney(cart.subtotal, locale)}</dd>
        </div>
        {isPositive(cart.discountTotal) && (
          <div className="flex justify-between text-cherry-deep">
            <dt>{t.cart.discount}</dt>
            <dd>−{formatMoney(cart.discountTotal, locale)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t-2 border-ink pt-2 text-lg font-semibold">
          <dt>{t.cart.estimatedTotal}</dt>
          <dd data-testid="cart-total">{formatMoney(cart.estimatedTotal, locale)}</dd>
        </div>
      </dl>
      <p className="text-sm text-ink-soft">{t.cart.shippingAtCheckout}</p>
      {cart.hasProblems && (
        <p role="alert" className="err">
          {t.cart.fixProblems}
        </p>
      )}
      {blocked ? (
        <span className="btn btn-primary w-full" role="link" aria-disabled="true" data-testid="checkout-cta">
          {t.cart.checkout}
        </span>
      ) : (
        <Link href={localePath(locale, "/checkout")} onClick={onNavigate} className="btn btn-primary w-full" data-testid="checkout-cta">
          {t.cart.checkout}
        </Link>
      )}
    </div>
  );
}
