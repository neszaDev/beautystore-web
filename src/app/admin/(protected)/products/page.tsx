import Link from "next/link";
import { adm } from "@/features/admin/data";
import { Badge, Empty, Filters, PageHeader, Pager, dt, pageNum } from "@/features/admin/shared";
import { BTN_PRIMARY, INPUT, LINK, TABLE, TD, TH } from "@/features/admin/styles";
import type { PageResponse, ProductRow } from "@/features/admin/types";
import { flattenSearchParams } from "@/lib/url";

export default async function Page({ searchParams }: PageProps<"/admin/products">) {
  const sp = flattenSearchParams(await searchParams);
  const r = await adm<PageResponse<ProductRow>>("/products", { q: sp.q, status: sp.status, page: pageNum(sp), size: 20 });
  return (
    <>
      <PageHeader title="Products"><Link href="/admin/products/new" className={BTN_PRIMARY}>New product</Link></PageHeader>
      <Filters action="/admin/products" params={sp}>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-semibold">Status</label>
          <select id="status" name="status" defaultValue={sp.status ?? ""} className={INPUT}>
            <option value="">All</option><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option>
          </select>
        </div>
      </Filters>
      {r.items.length === 0 ? <Empty>No products match.</Empty> : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className={TABLE}><caption className="sr-only">Products</caption>
            <thead><tr>{["Product", "Brand", "Category", "Status", "Variants", "Available", "Updated"].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
            <tbody>{r.items.map((p) => (
              <tr key={p.id}>
                <th scope="row" className={`${TD} font-normal`}>
                  <Link className={`${LINK} font-semibold`} href={`/admin/products/${p.id}`}>{p.nameEn ?? p.nameTh ?? p.slug}</Link>
                  <span lang="th" className="block text-ink-soft">{p.nameTh ?? ""}</span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    {p.isDemo && <Badge>Demo</Badge>}
                    {p.missingLocales.map((l) => <Badge key={l} tone="FAILED">Missing {l.toUpperCase()}</Badge>)}
                  </span>
                </th>
                <td className={TD}>{p.brand ?? "—"}</td><td className={TD}>{p.categorySlug}</td><td className={TD}><Badge>{p.status}</Badge></td>
                <td className={TD}>{p.variantCount}</td><td className={TD}>{p.totalAvailable}</td><td className={TD}>{dt(p.updatedAt)}</td>
              </tr>))}
            </tbody></table>
        </div>
      )}
      <Pager base="/admin/products" params={sp} page={r.page} totalPages={r.totalPages} totalItems={r.totalItems} />
    </>
  );
}
