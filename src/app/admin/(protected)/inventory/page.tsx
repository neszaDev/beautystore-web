import Link from "next/link";
import { adm } from "@/features/admin/data";
import { Badge, Empty, Filters, PageHeader, Pager, pageNum } from "@/features/admin/shared";
import { LINK, TABLE, TD, TH } from "@/features/admin/styles";
import type { InventoryRow, PageResponse } from "@/features/admin/types";
import { flattenSearchParams } from "@/lib/url";

export default async function Page({ searchParams }: PageProps<"/admin/inventory">) {
  const sp = flattenSearchParams(await searchParams);
  const r = await adm<PageResponse<InventoryRow>>("/inventory", { q: sp.q, lowOnly: sp.lowOnly === "true" ? true : undefined, page: pageNum(sp), size: 25 });
  return (
    <>
      <PageHeader title="Inventory" />
      <Filters action="/admin/inventory" params={sp}>
        <label className="flex min-h-9 items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="lowOnly" value="true" defaultChecked={sp.lowOnly === "true"} className="size-4 accent-cherry" /> Low stock only
        </label>
      </Filters>
      {r.items.length === 0 ? <Empty>No inventory rows match.</Empty> : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className={TABLE}><caption className="sr-only">Inventory by variant</caption>
            <thead><tr>{["SKU", "Product", "On hand", "Reserved", "Available", "Threshold", ""].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
            <tbody>{r.items.map((i) => (
              <tr key={i.variantId}><th scope="row" className={`${TD} font-normal`}>{i.sku}</th><td className={TD}>{i.productName}{i.label ? ` · ${i.label}` : ""}</td>
                <td className={TD}>{i.onHand}</td><td className={TD}>{i.reserved}</td>
                <td className={TD}>{i.available}{i.available <= i.lowStockThreshold && <> <Badge tone="FAILED">Low</Badge></>}</td><td className={TD}>{i.lowStockThreshold}</td>
                <td className={TD}><Link className={LINK} href={`/admin/inventory/${i.variantId}?sku=${encodeURIComponent(i.sku)}`}>Adjust</Link></td></tr>))}
            </tbody></table>
        </div>)}
      <Pager base="/admin/inventory" params={sp} page={r.page} totalPages={r.totalPages} totalItems={r.totalItems} />
    </>
  );
}
