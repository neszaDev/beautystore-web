import Link from "next/link";
import { adm } from "@/features/admin/data";
import { Empty, Filters, PageHeader, Pager, dt, pageNum } from "@/features/admin/shared";
import { LINK, TABLE, TD, TH } from "@/features/admin/styles";
import type { CustomerRow, PageResponse } from "@/features/admin/types";
import { flattenSearchParams } from "@/lib/url";

export default async function Page({ searchParams }: PageProps<"/admin/customers">) {
  const sp = flattenSearchParams(await searchParams);
  const r = await adm<PageResponse<CustomerRow>>("/customers", { q: sp.q, page: pageNum(sp), size: 20 });
  return (
    <>
      <PageHeader title="Customers" />
      <Filters action="/admin/customers" params={sp} />
      {r.items.length === 0 ? <Empty>No customers match.</Empty> : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className={TABLE}><caption className="sr-only">Customers</caption>
            <thead><tr>{["Email", "Name", "Phone", "Joined", "Orders"].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
            <tbody>{r.items.map((c) => (<tr key={c.id}><th scope="row" className={`${TD} font-normal`}><Link className={LINK} href={`/admin/customers/${c.id}`}>{c.email}</Link></th>
              <td className={TD}>{c.fullName ?? "—"}</td><td className={TD}>{c.phone ?? "—"}</td><td className={TD}>{dt(c.createdAt)}</td><td className={TD}>{c.orderCount}</td></tr>))}</tbody></table>
        </div>)}
      <Pager base="/admin/customers" params={sp} page={r.page} totalPages={r.totalPages} totalItems={r.totalItems} />
    </>
  );
}
