"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Drawer } from "@/components/drawer";
import { useI18n } from "@/components/i18n-provider";
import { useShop } from "@/components/shop-provider";
import { localePath } from "@/lib/locale";
import { CartLineRow } from "./cart-lines";
import { CartSummary } from "./cart-summary";

export function CartDrawer() {
  const { locale, t } = useI18n();
  const { cart, cartOpen, closeCart } = useShop();
  const pathname = usePathname();
  const [prev, setPrev] = useState(pathname);
  if (prev !== pathname) {
    setPrev(pathname);
    if (cartOpen) closeCart();
  }
  return (
    <Drawer open={cartOpen} onClose={closeCart} title={t.cart.drawerTitle}>
      {cart.items.length === 0 ? (
        <div className="space-y-4 py-8 text-center">
          <p className="label-type text-xl">{t.cart.empty}</p>
          <p className="text-ink-soft">{t.cart.emptyHint}</p>
          <Link href={localePath(locale, "/products")} onClick={closeCart} className="btn btn-primary">
            {t.cart.continueShopping}
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex-1" aria-label={t.cart.drawerTitle}>
            {cart.items.map((l) => (
              <CartLineRow key={l.variantId} line={l} onNavigate={closeCart} />
            ))}
          </ul>
          <div className="sticky bottom-0 mt-3 space-y-3 bg-cream pt-3">
            <CartSummary cart={cart} onNavigate={closeCart} showPromo={false} />
            <Link href={localePath(locale, "/cart")} onClick={closeCart} className="btn btn-ghost w-full">
              {t.cart.viewCart}
            </Link>
          </div>
        </>
      )}
    </Drawer>
  );
}
