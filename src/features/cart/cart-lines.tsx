"use client";

import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { useI18n } from "@/components/i18n-provider";
import { Price } from "@/components/price";
import { SwatchDots } from "@/components/swatches";
import { localePath } from "@/lib/locale";
import { formatMoney } from "@/lib/money";
import type { CartLine } from "@/lib/types";
import { useCartActions } from "./use-cart-actions";

export function CartLineRow({ line, onNavigate }: { line: CartLine; onNavigate?: () => void }) {
  const { locale, t, f } = useI18n();
  const { setQuantity, remove, pending } = useCartActions();
  const href = localePath(locale, `/p/${line.productSlug}`);
  return (
    <li className="grid grid-cols-[5rem_1fr] gap-3 border-b border-line py-4" data-testid="cart-line">
      <Link href={href} onClick={onNavigate} tabIndex={-1} aria-hidden="true">
        <ProductImage src={line.imageUrl} alt="" sizes="80px" />
      </Link>
      <div className="min-w-0">
        <Link href={href} onClick={onNavigate} className="label-type block text-base leading-tight hover:underline">
          {line.productName}
        </Link>
        {line.variantLabel && (
          <p className="mt-0.5 flex items-center gap-2 text-sm text-ink-soft">
            {line.swatchHex && <SwatchDots colors={[line.swatchHex]} />}
            {line.variantLabel}
          </p>
        )}
        <Price amount={line.unitPrice} compareAt={line.compareAtPrice} locale={locale} className="mt-1 text-sm" />
        {line.problem && (
          <p role="alert" className="mt-1 text-sm font-semibold text-cherry-deep">
            {t.cart.problem[line.problem]}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center border-2 border-ink" role="group" aria-label={t.cart.qty}>
            <button
              type="button"
              className="h-11 w-11 text-lg"
              aria-label={t.product.decrease}
              disabled={pending || line.quantity <= 1}
              onClick={() => setQuantity(line.variantId, line.quantity - 1)}
            >
              −
            </button>
            <output className="min-w-8 text-center font-semibold" aria-label={t.cart.qty}>
              {line.quantity}
            </output>
            <button
              type="button"
              className="h-11 w-11 text-lg"
              aria-label={t.product.increase}
              disabled={pending || line.quantity >= line.maxPerOrder}
              onClick={() => setQuantity(line.variantId, line.quantity + 1)}
            >
              +
            </button>
          </div>
          <span className="font-semibold">{formatMoney(line.lineTotal, locale)}</span>
          <button
            type="button"
            className="min-h-11 px-2 text-sm underline underline-offset-4"
            disabled={pending}
            onClick={() => remove(line.variantId)}
            aria-label={f(t.cart.removeItem, { name: line.productName })}
          >
            {t.common.remove}
          </button>
        </div>
      </div>
    </li>
  );
}
