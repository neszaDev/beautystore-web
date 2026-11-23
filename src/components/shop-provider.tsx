"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Cart, UserView } from "@/lib/types";

type Shop = {
  cart: Cart;
  setCart: (c: Cart) => void;
  user: UserView | null;
  wishlistIds: number[];
  setWishlistIds: (ids: number[]) => void;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** Announce a short message to screen readers and show a brief visual toast. */
  announce: (message: string) => void;
};
const Ctx = createContext<Shop | null>(null);

export function ShopProvider({
  cart: initialCart,
  user,
  wishlistIds: initialWishlist,
  children,
}: {
  cart: Cart;
  user: UserView | null;
  wishlistIds: number[];
  children: ReactNode;
}) {
  // Server renders are the source of truth; adopt a new server value when the layout re-renders.
  const [cart, setCart] = useState(initialCart);
  const [seenCart, setSeenCart] = useState(initialCart);
  if (initialCart !== seenCart) {
    setSeenCart(initialCart);
    setCart(initialCart);
  }
  const [wishlistIds, setWishlistIds] = useState(initialWishlist);
  const [seenWl, setSeenWl] = useState(initialWishlist);
  if (initialWishlist !== seenWl) {
    setSeenWl(initialWishlist);
    setWishlistIds(initialWishlist);
  }
  const [cartOpen, setCartOpen] = useState(false);
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const announce = useCallback((m: string) => {
    setMessage("");
    // clear first so repeating the same message is announced again
    requestAnimationFrame(() => setMessage(m));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 4000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo<Shop>(
    () => ({
      cart,
      setCart,
      user,
      wishlistIds,
      setWishlistIds,
      cartOpen,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      announce,
    }),
    [cart, user, wishlistIds, cartOpen, announce],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" className="sr-only">
        {message}
      </div>
      {message && (
        <div
          aria-hidden="true"
          className="fixed bottom-4 left-1/2 z-[60] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream"
        >
          {message}
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useShop(): Shop {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop must be used inside <ShopProvider>");
  return v;
}
