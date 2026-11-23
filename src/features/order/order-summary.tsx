import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import type { Dict } from "@/i18n";
import { localePath, type Locale } from "@/lib/locale";
import { formatDateTime, formatMoney, isPositive } from "@/lib/money";
import type { OrderDetail, OrderStatus } from "@/lib/types";

const FLOW: OrderStatus[] = ["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

/** Status timeline from order.history (server data), plus tracking info. Server component. */
export function OrderTimeline({ order, locale, t }: { order: OrderDetail; locale: Locale; t: Dict }) {
  const at = new Map(order.history.map((h) => [h.status, h.at]));
  const steps = order.status === "CANCELLED" ? (["PENDING_PAYMENT", "CANCELLED"] as OrderStatus[]) : FLOW;
  return (
    <section aria-labelledby="tl-h" className="space-y-3">
      <h2 id="tl-h" className="text-2xl">{t.order.timeline}</h2>
      <ol className="space-y-2 border-l-4 border-ink pl-4">
        {steps.map((s) => {
          const when = at.get(s);
          return (
            <li key={s} className={when ? "font-semibold" : "text-ink-soft"} aria-current={s === order.status ? "step" : undefined}>
              {t.order.statusLabel[s]}
              {when && <span className="ml-2 text-sm font-normal text-ink-soft">{formatDateTime(when, locale)}</span>}
            </li>
          );
        })}
      </ol>
      {(order.trackingNumber || order.carrier) && (
        <div className="border-2 border-ink bg-mint p-3">
          <h3 className="label-type">{t.order.tracking}</h3>
          {order.carrier && <p>{t.order.carrier}: {order.carrier}</p>}
          {order.trackingNumber && <p>{t.order.trackingNumber}: <span className="font-semibold">{order.trackingNumber}</span></p>}
          {order.trackingUrl && /^https:\/\//.test(order.trackingUrl) && (
            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-block min-h-11 py-2 font-semibold underline underline-offset-4">
              {t.order.trackLink}
            </a>
          )}
        </div>
      )}
    </section>
  );
}

export function OrderSummary({ order, locale, t }: { order: OrderDetail; locale: Locale; t: Dict }) {
  const a = order.shippingAddress;
  return (
    <section aria-labelledby="os-h" className="space-y-4">
      <h2 id="os-h" className="text-2xl">{t.order.items}</h2>
      <ul className="divide-y divide-line">
        {order.items.map((i, idx) => (
          <li key={`${i.sku}-${idx}`} className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 py-2">
            <ProductImage src={i.imageUrl} alt="" sizes="64px" />
            <span className="min-w-0">
              {i.productSlug ? (
                <Link href={localePath(locale, `/p/${i.productSlug}`)} className="label-type block hover:underline">{i.productName}</Link>
              ) : (
                <span className="label-type block">{i.productName}</span>
              )}
              <span className="text-sm text-ink-soft">{i.variantLabel ? `${i.variantLabel} · ` : ""}×{i.quantity}</span>
            </span>
            <span className="font-semibold">{formatMoney(i.lineTotal, locale)}</span>
          </li>
        ))}
      </ul>
      <dl className="space-y-1">
        <div className="flex justify-between"><dt>{t.cart.subtotal}</dt><dd>{formatMoney(order.subtotal, locale)}</dd></div>
        {isPositive(order.discountTotal) && (
          <div className="flex justify-between text-cherry-deep"><dt>{t.cart.discount}{order.promotionCode ? ` (${order.promotionCode})` : ""}</dt><dd>−{formatMoney(order.discountTotal, locale)}</dd></div>
        )}
        <div className="flex justify-between"><dt>{t.checkout.shippingFee} · {order.shippingMethodName}</dt><dd>{isPositive(order.shippingFee) ? formatMoney(order.shippingFee, locale) : t.checkout.free}</dd></div>
        <div className="flex justify-between border-t-2 border-ink pt-2 text-lg font-semibold"><dt>{t.checkout.total}</dt><dd>{formatMoney(order.total, locale)}</dd></div>
      </dl>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="label-type">{t.order.shipTo}</h3>
          <address className="not-italic text-ink-soft">
            {a.recipient} · {a.phone}<br />
            {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
            {a.subdistrict}, {a.district}, {a.province} {a.postalCode}
          </address>
        </div>
        <div>
          <h3 className="label-type">{t.order.paymentMethod}</h3>
          <p className="text-ink-soft">{order.paymentMethod === "PROMPTPAY" ? t.checkout.promptpay : t.checkout.card}</p>
        </div>
      </div>
    </section>
  );
}
