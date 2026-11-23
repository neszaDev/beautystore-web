import Link from "next/link";
import { notFound } from "next/navigation";
import { adm } from "@/features/admin/data";
import { InventoryForms } from "@/features/admin/inventory-forms";
import { PageHeader, Pager, dt, pageNum } from "@/features/admin/shared";
import { CARD, LINK, TABLE, TD, TH } from "@/features/admin/styles";
import type { InventoryRow, Movement, PageResponse } from "@/features/admin/types";
import { flattenSearchParams } from "@/lib/url";

export default async function Page({ params, searchParams }: PageProps<"/admin/inventory/[variantId]">) {
  const { variantId } = await params;
  if (!/^\d+$/.test(variantId)) notFound();
  const sp = flattenSearchParams(await searchParams);
  const [moves, found] = await Promise.all([
    adm<PageResponse<Movement>>(`/inventory/${variantId}/movements`, { page: pageNum(sp), size: 20 }),
    // No single-row endpoint: find the row via the SKU search (sku is passed by the links that lead here).
    sp.sku ? adm<PageResponse<InventoryRow>>("/inventory", { q: sp.sku, size: 100 }) : Promise.resolve(null),
  ]);
  const row = found?.items.find((i) => String(i.variantId) === variantId) ?? null;
  return (
    <>
      <PageHeader title={row ? `${row.productName}${row.label ? ` · ${row.label}` : ""}` : `Variant ${variantId}`}><Link className={LINK} href="/admin/inventory">All inventory</Link></PageHeader>
      <section className={`${CARD} mb-4`}>
        {row ? <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
          <div><dt className="text-ink-soft">SKU</dt><dd>{row.sku}</dd></div><div><dt className="text-ink-soft">On hand</dt><dd>{row.onHand}</dd></div>
          <div><dt className="text-ink-soft">Reserved</dt><dd>{row.reserved}</dd></div><div><dt className="text-ink-soft">Available</dt><dd>{row.available}</dd></div>
          <div><dt className="text-ink-soft">Low-stock threshold</dt><dd>{row.lowStockThreshold}</dd></div></dl>
          : <p className="text-sm text-ink-soft">Current levels are shown on the <Link className={LINK} href="/admin/inventory">inventory list</Link>; the history below is live.</p>}
      </section>
      <InventoryForms variantId={Number(variantId)} threshold={row?.lowStockThreshold ?? null} />
      <h2 className="mt-6 mb-2 text-lg">Movement history</h2>
      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className={TABLE}><caption className="sr-only">Stock movements, newest first</caption>
          <thead><tr>{["When", "Change", "Reason", "On hand after", "Order", "By", "Note"].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
          <tbody>{moves.items.length === 0 && <tr><td className={TD} colSpan={7}>No movements yet.</td></tr>}
            {moves.items.map((m) => (<tr key={m.id}><th scope="row" className={`${TD} font-normal`}>{dt(m.createdAt)}</th><td className={TD}>{m.delta > 0 ? `+${m.delta}` : m.delta}</td><td className={TD}>{m.reason}</td>
              <td className={TD}>{m.onHandAfter}</td><td className={TD}>{m.orderNumber ? <Link className={LINK} href={`/admin/orders/${m.orderNumber}`}>{m.orderNumber}</Link> : "—"}</td><td className={TD}>{m.actorEmail ?? "system"}</td><td className={TD}>{m.note ?? "—"}</td></tr>))}
          </tbody></table>
      </div>
      <Pager base={`/admin/inventory/${variantId}`} params={sp} page={moves.page} totalPages={moves.totalPages} totalItems={moves.totalItems} />
    </>
  );
}
