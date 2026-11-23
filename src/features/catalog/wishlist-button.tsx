"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { HeartIcon } from "@/components/icons";
import { useI18n } from "@/components/i18n-provider";
import { useShop } from "@/components/shop-provider";
import { localePath } from "@/lib/locale";
import { setWishlist } from "./wishlist-actions";

/** Heart toggle for signed-in users; signed-out users get a link to sign in (never a silent no-op). */
export function WishlistButton({ productId, className = "" }: { productId: number; className?: string }) {
  const { locale, t, err } = useI18n();
  const { user, wishlistIds, setWishlistIds, announce } = useShop();
  const [pending, start] = useTransition();
  const [, setTick] = useState(0);
  const base = `inline-grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-cream text-ink hover:bg-butter ${className}`;

  if (!user) {
    return (
      <Link href={`${localePath(locale, "/login")}`} className={base} aria-label={t.product.signInForWishlist} title={t.product.signInForWishlist}>
        <HeartIcon />
      </Link>
    );
  }
  const on = wishlistIds.includes(productId);
  return (
    <button
      type="button"
      className={base}
      aria-pressed={on}
      aria-label={on ? t.product.removeFromWishlist : t.product.addToWishlist}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await setWishlist(productId, !on);
          if (res.ok) {
            setWishlistIds(res.data ? [...wishlistIds, productId] : wishlistIds.filter((i) => i !== productId));
            announce(res.data ? t.product.wishlistAdded : t.product.wishlistRemoved);
          } else announce(err(res.code));
          setTick((n) => n + 1);
        })
      }
    >
      <HeartIcon filled={on} />
    </button>
  );
}
