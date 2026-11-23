"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Price } from "@/components/price";
import { useShop } from "@/components/shop-provider";
import { addToCart } from "@/features/cart/actions";
import type { ProductDetail } from "@/lib/types";
import { clampQuantity, defaultVariant, findVariant, hasShades, isInStock, safeHex } from "@/lib/variants";

export function ProductPurchase({ product }: { product: Pick<ProductDetail, "name" | "variants"> }) {
  const { locale, t, f, err } = useI18n();
  const { setCart, openCart, announce } = useShop();
  const [variantId, setVariantId] = useState<number | undefined>(() => defaultVariant(product.variants)?.id);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const variant = findVariant(product.variants, variantId);
  if (!variant) return <p className="font-semibold text-cherry-deep">{t.product.soldOut}</p>;
  const shades = hasShades(product.variants);
  const soldOut = !isInStock(variant.stockStatus);
  const setQ = (n: number) => setQty(clampQuantity(n, variant));

  function submit() {
    if (!variant) return;
    setError(null);
    start(async () => {
      const res = await addToCart(variant.id, qty, locale);
      if (res.ok) {
        setCart(res.data);
        announce(f(t.product.added, { name: product.name }));
        openCart();
      } else {
        const msg = err(res.code);
        setError(msg);
        announce(msg);
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline gap-3">
        <Price amount={variant.price} compareAt={variant.compareAtPrice} locale={locale} className="text-2xl" />
        <span
          className={`text-sm font-semibold ${variant.stockStatus === "IN_STOCK" ? "text-ink-soft" : "text-cherry-deep"}`}
          data-testid="stock-status"
        >
          {t.stock[variant.stockStatus]}
        </span>
      </div>

      {product.variants.length > 1 && (
        <fieldset>
          <legend className="label">
            {shades ? t.product.shade : t.product.size}
            {variant.label && <span className="ml-2 font-normal text-ink-soft">{variant.label}</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const hex = safeHex(v.swatchHex);
              const off = !isInStock(v.stockStatus);
              return (
                <label key={v.id} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="variant"
                    className="peer sr-only"
                    checked={v.id === variantId}
                    onChange={() => {
                      setVariantId(v.id);
                      setQty(1);
                      setError(null);
                    }}
                    aria-label={`${v.label ?? v.sku}${off ? ` — ${t.stock.OUT_OF_STOCK}` : ""}`}
                  />
                  <span
                    className={`flex min-h-11 min-w-11 items-center gap-2 border-2 border-ink px-3 py-1 text-sm font-semibold peer-checked:bg-ink peer-checked:text-cream peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 ${off ? "opacity-60 line-through" : ""}`}
                  >
                    {hex && <span className="inline-block h-5 w-5 rounded-full border-2 border-cream outline outline-1 outline-ink" style={{ backgroundColor: hex }} />}
                    {v.label ?? v.sku}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center border-2 border-ink" role="group" aria-label={t.product.quantity}>
          <button type="button" className="h-11 w-11 text-lg" aria-label={t.product.decrease} disabled={qty <= 1 || soldOut} onClick={() => setQ(qty - 1)}>
            −
          </button>
          <output className="min-w-10 text-center font-semibold" aria-label={t.product.quantity} data-testid="qty">
            {qty}
          </output>
          <button type="button" className="h-11 w-11 text-lg" aria-label={t.product.increase} disabled={qty >= variant.maxPerOrder || soldOut} onClick={() => setQ(qty + 1)}>
            +
          </button>
        </div>
        <button type="button" className="btn btn-primary min-w-48 flex-1" disabled={soldOut || pending} onClick={submit} data-testid="add-to-bag">
          {soldOut ? t.product.soldOut : pending ? t.product.adding : t.product.addToBag}
        </button>
      </div>
      <p className="text-sm text-ink-soft">{f(t.product.maxPerOrder, { n: variant.maxPerOrder })}</p>
      {error && (
        <p role="alert" className="err">
          {error}
        </p>
      )}
    </div>
  );
}
