import type { Metadata } from "next";
import Link from "next/link";
import { StatePanel } from "@/components/state-panel";
import { Pagination } from "@/features/catalog/listing-controls";
import { getDictionary, fmt } from "@/i18n";
import { tryApi } from "@/lib/api";
import { localePath } from "@/lib/locale";
import { formatDate, formatMoney } from "@/lib/money";
import { getMyOrders } from "@/lib/queries";
import { pageMetadata, resolveLocale } from "@/lib/route";
import { requireUser } from "@/lib/session";
import { flattenSearchParams } from "@/lib/url";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/orders">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({ locale, path: "/account/orders", title: getDictionary(locale).account.orders, noindex: true });
}

export default async function OrdersPage({ params, searchParams }: PageProps<"/[locale]/account/orders">) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  await requireUser(locale, localePath(locale, "/account/orders"));
  const page = Math.max(1, Math.trunc(Number(flattenSearchParams(await searchParams).page)) || 1);
  const res = await tryApi(() => getMyOrders(page - 1));
  if (!res.ok) return <StatePanel tone="error" title={t.errors.errorTitle}><p>{t.errors.apiDown}</p></StatePanel>;
  if (res.data.items.length === 0) {
    return (
      <StatePanel title={t.account.noOrders}>
        <Link href={localePath(locale, "/products")} className="btn btn-primary">{t.cart.continueShopping}</Link>
      </StatePanel>
    );
  }
  return (
    <>
      <h2 className="mb-4 text-2xl">{t.account.orders}</h2>
      <ul className="divide-y-2 divide-ink border-y-2 border-ink">
        {res.data.items.map((o) => (
          <li key={o.number}>
            <Link href={localePath(locale, `/account/orders/${o.number}`)} className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-x-4 py-3 hover:bg-butter">
              <span>
                <span className="label-type block">{o.number}</span>
                <span className="text-sm text-ink-soft">{formatDate(o.createdAt, locale)} · {fmt(t.account.itemsCount, { n: o.itemCount })}</span>
              </span>
              <span className="text-right">
                <span className="block font-semibold">{formatMoney(o.total, locale)}</span>
                <span className="text-sm">{t.order.statusLabel[o.status]}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Pagination basePath={localePath(locale, "/account/orders")} params={{}} page={page} totalPages={res.data.totalPages} />
    </>
  );
}
