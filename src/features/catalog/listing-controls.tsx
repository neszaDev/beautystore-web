"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Drawer } from "@/components/drawer";
import { useI18n } from "@/components/i18n-provider";
import { buildQuery, type Params } from "@/lib/url";

/** Mobile "Filters" button + accessible drawer (children = the server-rendered filter form). */
export function FilterDrawer({ activeCount, children }: { activeCount: number; children: ReactNode }) {
  const { t, f } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn btn-ghost lg:hidden" onClick={() => setOpen(true)} aria-haspopup="dialog">
        {activeCount ? f(t.listing.filtersWithCount, { n: activeCount }) : t.listing.filters}
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title={t.listing.filters} side="bottom">
        {children}
      </Drawer>
    </>
  );
}

export function SortSelect({ basePath, params, value }: { basePath: string; params: Params; value: string }) {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-semibold">
        {t.listing.sort}
      </label>
      <select
        id="sort"
        className="field !w-auto"
        value={value}
        onChange={(e) => router.push(basePath + buildQuery(params, { sort: e.target.value === "newest" ? undefined : e.target.value, page: undefined }))}
      >
        <option value="newest">{t.listing.sortNewest}</option>
        <option value="price_asc">{t.listing.sortPriceAsc}</option>
        <option value="price_desc">{t.listing.sortPriceDesc}</option>
        <option value="name">{t.listing.sortName}</option>
      </select>
    </div>
  );
}

export function Pagination({
  basePath,
  params,
  page,
  totalPages,
}: {
  basePath: string;
  params: Params;
  page: number; // 1-based
  totalPages: number;
}) {
  const { t, f } = useI18n();
  if (totalPages <= 1) return null;
  const href = (p: number) => basePath + buildQuery(params, { page: p > 1 ? String(p) : undefined });
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );
  const link = "inline-flex h-11 min-w-11 items-center justify-center border-2 border-ink px-3 font-semibold";
  return (
    <nav aria-label={t.listing.pagination} className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} className={link} rel="prev">
          {t.common.previous}
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="contents">
          {i > 0 && pages[i - 1] !== p - 1 && <span aria-hidden="true">…</span>}
          <Link
            href={href(p)}
            className={`${link} ${p === page ? "bg-ink text-cream" : "hover:bg-butter"}`}
            aria-current={p === page ? "page" : undefined}
            aria-label={f(t.common.page, { n: p, total: totalPages })}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages && (
        <Link href={href(page + 1)} className={link} rel="next">
          {t.common.next}
        </Link>
      )}
    </nav>
  );
}
