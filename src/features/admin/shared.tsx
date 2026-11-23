import Link from "next/link";
import type { ReactNode } from "react";
import { formatMoney } from "@/lib/money";
import { buildQuery, type Params } from "@/lib/url";
import { BTN_GHOST, BTN_PRIMARY, CARD, INPUT, LINK } from "./styles";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl">{title}</h1>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className={`${CARD} text-center text-ink-soft`}>{children}</p>;
}

const TONE: Record<string, string> = {
  PUBLISHED: "bg-[#dff5e8]", PAID: "bg-[#dff5e8]", DELIVERED: "bg-[#dff5e8]", SUCCEEDED: "bg-[#dff5e8]",
  DRAFT: "bg-butter/60", PENDING_PAYMENT: "bg-butter/60", PROCESSING: "bg-lilac/60", SHIPPED: "bg-lilac/60",
  ARCHIVED: "bg-line", CANCELLED: "bg-line", FAILED: "bg-[#ffe0e6]", EXPIRED: "bg-line",
};
export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  const k = tone ?? (typeof children === "string" ? children : "");
  return <span className={`inline-block rounded border border-line px-1.5 py-0.5 text-xs font-semibold ${TONE[k] ?? "bg-cream"}`}>{children}</span>;
}

/** GET form so search/filter work without JS; `children` are extra controls. */
export function Filters({ action, params, children }: { action: string; params: Params; children?: ReactNode }) {
  return (
    <form action={action} method="get" className="mb-4 flex flex-wrap items-end gap-2" role="search">
      <div>
        <label htmlFor="q" className="mb-1 block text-sm font-semibold">Search</label>
        <input id="q" name="q" defaultValue={params.q ?? ""} className={INPUT} />
      </div>
      {children}
      <button className={BTN_PRIMARY}>Apply</button>
      <Link href={action} className={BTN_GHOST}>Reset</Link>
    </form>
  );
}

export function Pager({ base, params, page, totalPages, totalItems }: { base: string; params: Params; page: number; totalPages: number; totalItems: number }) {
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
      <span>{totalItems} total · page {page + 1} of {Math.max(totalPages, 1)}</span>
      <span className="flex gap-3">
        {page > 0 && <Link className={LINK} href={`${base}${buildQuery(params, { page: String(page - 1) })}`}>Previous</Link>}
        {page + 1 < totalPages && <Link className={LINK} href={`${base}${buildQuery(params, { page: String(page + 1) })}`}>Next</Link>}
      </span>
    </nav>
  );
}

export const pageNum = (p: Params) => Math.max(0, Number.parseInt(p.page ?? "0", 10) || 0);
export const dt = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date(iso)) : "—";
export const baht = (m: string) => formatMoney(m, "en");
