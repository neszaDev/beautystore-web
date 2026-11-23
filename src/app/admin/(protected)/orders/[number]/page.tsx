import Link from "next/link";
import { OrderActions } from "@/features/admin/order-actions";
import { adm } from "@/features/admin/data";
import { Badge, PageHeader, baht, dt } from "@/features/admin/shared";
import { CARD, LINK, TABLE, TD, TH } from "@/features/admin/styles";
import type { AdminOrder } from "@/features/admin/types";

export default async function Page({ params }: PageProps<"/admin/orders/[number]">) {
  const { number } = await params;
  const o = await adm<AdminOrder>(`/orders/${encodeURIComponent(number)}`);
  const a = o.shippingAddress;
  return (
    <>
      <PageHeader title={`Order ${o.number}`}>
        <Badge>{o.status}</Badge><Link className={LINK} href="/admin/orders">All orders</Link>
      </PageHeader>
      <OrderActions order={{ number: o.number, status: o.status, needsAttention: o.needsAttention, carrier: o.carrier, trackingNumber: o.trackingNumber, trackingUrl: o.trackingUrl }} />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className={CARD} aria-labelledby="cust"><h2 id="cust" className="mb-2 text-lg">Customer and delivery</h2>
          <p>{o.email}</p>
          <address className="mt-2 text-sm not-italic">{a.recipient} · {a.phone}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.subdistrict}, {a.district}, {a.province} {a.postalCode}</address>
          <p className="mt-2 text-sm text-ink-soft">{o.shippingMethodName} · placed {dt(o.createdAt)} · payment {o.paymentMethod}</p>
          {o.trackingNumber && <p className="mt-2 text-sm">Tracking: {o.carrier ? `${o.carrier} ` : ""}{o.trackingUrl ? <a className={LINK} href={o.trackingUrl} rel="noopener noreferrer" target="_blank">{o.trackingNumber}</a> : o.trackingNumber}</p>}
        </section>
        <section className={CARD} aria-labelledby="tot"><h2 id="tot" className="mb-2 text-lg">Totals</h2>
          <dl className="grid grid-cols-[1fr_auto] gap-y-1 text-sm">
            <dt>Subtotal</dt><dd>{baht(o.subtotal)}</dd>
            <dt>Discount{o.promotionCode ? ` (${o.promotionCode})` : ""}</dt><dd>−{baht(o.discountTotal)}</dd>
            <dt>Shipping</dt><dd>{baht(o.shippingFee)}</dd>
            <dt className="font-semibold">Total</dt><dd className="font-semibold">{baht(o.total)}</dd>
          </dl>
        </section>
      </div>
      <h2 className="mt-6 mb-2 text-lg">Items</h2>
      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className={TABLE}><caption className="sr-only">Order items</caption>
          <thead><tr>{["Product", "SKU", "Unit price", "Qty", "Line total"].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
          <tbody>{o.items.map((i) => (
            <tr key={i.sku}><th scope="row" className={`${TD} font-normal`}>{i.productName}{i.variantLabel ? ` · ${i.variantLabel}` : ""}</th>
              <td className={TD}>{i.sku}</td><td className={TD}>{baht(i.unitPrice)}</td><td className={TD}>{i.quantity}</td><td className={TD}>{baht(i.lineTotal)}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="pay"><h2 id="pay" className="mb-2 text-lg">Payment attempts</h2>
          <div className="overflow-x-auto rounded-lg border border-line bg-white">
            <table className={TABLE}><caption className="sr-only">Payment attempts</caption>
              <thead><tr>{["When", "Method", "Status", "Amount", "Failure"].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
              <tbody>{o.payments.length === 0 && <tr><td className={TD} colSpan={5}>No attempts.</td></tr>}
                {o.payments.map((p) => (<tr key={p.id}><th scope="row" className={`${TD} font-normal`}>{dt(p.createdAt)}</th><td className={TD}>{p.method}</td><td className={TD}><Badge>{p.status}</Badge></td><td className={TD}>{baht(p.amount)}</td><td className={TD}>{p.failureReason ?? "—"}</td></tr>))}
              </tbody></table>
          </div></section>
        <section aria-labelledby="hist"><h2 id="hist" className="mb-2 text-lg">Status history</h2>
          <div className="overflow-x-auto rounded-lg border border-line bg-white">
            <table className={TABLE}><caption className="sr-only">Status history</caption>
              <thead><tr>{["When", "Status", "Actor", "Note"].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
              <tbody>{o.history.map((h, i) => (<tr key={i}><th scope="row" className={`${TD} font-normal`}>{dt(h.at)}</th><td className={TD}><Badge>{h.status}</Badge></td><td className={TD}>{h.actor ?? "—"}</td><td className={TD}>{h.note ?? "—"}</td></tr>))}</tbody></table>
          </div></section>
      </div>
    </>
  );
}
