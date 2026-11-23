import Link from "next/link";
import { adm } from "@/features/admin/data";
import { PageHeader, baht, Empty } from "@/features/admin/shared";
import { CARD, LINK, TABLE, TD, TH } from "@/features/admin/styles";
import type { Dashboard } from "@/features/admin/types";

export default async function Page() {
  const d = await adm<Dashboard>("/dashboard");
  const tiles: [string, string, string][] = [
    ["Orders today", String(d.ordersToday), "/admin/orders"],
    ["Revenue today", baht(d.revenueToday), "/admin/orders"],
    ["Revenue, 30 days", baht(d.revenueLast30Days), "/admin/orders"],
    ["Pending payment", String(d.pendingPayment), "/admin/orders?status=PENDING_PAYMENT"],
    ["Awaiting fulfilment", String(d.awaitingFulfilment), "/admin/orders?status=PAID"],
    ["Needs attention", String(d.needsAttention), "/admin/orders?needsAttention=true"],
  ];
  return (
    <>
      <PageHeader title="Dashboard" />
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map(([label, value, href]) => (
          <li key={label}>
            <Link href={href} className={`${CARD} block hover:border-ink`}>
              <span className="text-sm text-ink-soft">{label}</span>
              <span className="block text-2xl font-semibold">{value}</span>
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-8 mb-2 text-lg">Low stock</h2>
      {d.lowStock.length === 0 ? <Empty>No variants are at or below their threshold.</Empty> : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className={TABLE}>
            <caption className="sr-only">Variants at or below their low-stock threshold</caption>
            <thead><tr>{["Product", "SKU", "Available", "Threshold", ""].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {d.lowStock.map((r) => (
                <tr key={r.variantId}>
                  <th scope="row" className={`${TD} font-normal`}>{r.productName}{r.label ? ` · ${r.label}` : ""}</th>
                  <td className={TD}>{r.sku}</td><td className={TD}>{r.available}</td><td className={TD}>{r.threshold}</td>
                  <td className={TD}><Link className={LINK} href={`/admin/inventory/${r.variantId}?sku=${encodeURIComponent(r.sku)}`}>Restock</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
