"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { useShop } from "@/components/shop-provider";
import { StatePanel } from "@/components/state-panel";
import { localePath } from "@/lib/locale";
import { CartLineRow } from "./cart-lines";
import { CartSummary } from "./cart-summary";

export function CartPageView() {
  const { locale, t, f } = useI18n();
  const { cart } = useShop();
  if (cart.items.length === 0) {
    return (
      <StatePanel title={t.cart.empty}>
        <p>{t.cart.emptyHint}</p>
        <Link href={localePath(locale, "/products")} className="btn btn-primary">
          {t.cart.continueShopping}
        </Link>
      </StatePanel>
    );
  }
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <section aria-labelledby="cart-h">
        <h1 id="cart-h" className="mb-2 text-3xl">
          {t.cart.title} <span className="text-lg text-ink-soft">({f(t.cart.items, { n: cart.itemCount })})</span>
        </h1>
        <ul>
          {cart.items.map((l) => (
            <CartLineRow key={l.variantId} line={l} />
          ))}
        </ul>
      </section>
      <aside className="h-fit space-y-3 border-2 border-ink bg-white p-4 lg:sticky lg:top-24">
        <CartSummary cart={cart} />
      </aside>
    </div>
  );
}
