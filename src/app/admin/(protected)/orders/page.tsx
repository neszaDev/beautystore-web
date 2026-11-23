import Link from "next/link";
import { adm } from "@/features/admin/data";
import { Badge, Empty, Filters, PageHeader, Pager, baht, dt, pageNum } from "@/features/admin/shared";
import { INPUT, LINK, TABLE, TD, TH } from "@/features/admin/styles";
import type { OrderRow, PageResponse } from "@/features/admin/types";
import { flattenSearchParams } from "@/lib/url";

const STATUSES = ["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default async function Page({ searchParams }: PageProps<"/admin/orders">) {
  const sp = flattenSearchParams(await searchParams);
  const page = pageNum(sp);
  const r = await adm<PageResponse<OrderRow>>("/orders", { q: sp.q, status: sp.status, needsAttention: sp.needsAttention === "true" ? true : undefined, page, size: 20 });
  return (
    <>
      <PageHeader title="Orders" />
      <Filters action="/admin/orders" params={sp}>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-semibold">Status</label>
          <select id="status" name="status" defaultValue={sp.status ?? ""} className={INPUT}>
            <option value="">All</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <label className="flex min-h-9 items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="needsAttention" value="true" defaultChecked={sp.needsAttention === "true"} className="size-4 accent-cherry" /> Needs attention
        </label>
      </Filters>
      {r.items.length === 0 ? <Empty>No orders match.</Empty> : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className={TABLE}>
            <caption className="sr-only">Orders</caption>
            <thead><tr>{["Order", "Placed", "Customer", "Status", "Payment", "Items", "Total"].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {r.items.map((o) => (
                <tr key={o.number}>
                  <th scope="row" className={`${TD} font-semibold`}><Link className={LINK} href={`/admin/orders/${o.number}`}>{o.number}</Link>
                    {o.needsAttention && <> <Badge tone="FAILED">Needs attention</Badge></>}</th>
                  <td className={TD}>{dt(o.createdAt)}</td><td className={TD}>{o.email}</td>
                  <td className={TD}><Badge>{o.status}</Badge></td><td className={TD}>{o.paymentStatus ?? "—"}</td>
                  <td className={TD}>{o.itemCount}</td><td className={TD}>{baht(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager base="/admin/orders" params={sp} page={r.page} totalPages={r.totalPages} totalItems={r.totalItems} />
    </>
  );
}
