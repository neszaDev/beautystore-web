import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StatePanel } from "@/components/state-panel";
import { OrderSummary, OrderTimeline } from "@/features/order/order-summary";
import { getDictionary, fmt } from "@/i18n";
import { api, ApiError, tryApi } from "@/lib/api";
import { localePath } from "@/lib/locale";
import { pageMetadata, resolveLocale } from "@/lib/route";
import { requireUser } from "@/lib/session";
import type { OrderDetail } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/orders/[number]">): Promise<Metadata> {
  const { number } = await params;
  const locale = await resolveLocale(params);
  return pageMetadata({ locale, path: `/account/orders/${number}`, title: fmt(getDictionary(locale).order.title, { number }), noindex: true });
}

export default async function AccountOrderPage({ params }: PageProps<"/[locale]/account/orders/[number]">) {
  const { number } = await params;
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  await requireUser(locale, localePath(locale, `/account/orders/${number}`));
  const res = await tryApi(() => api<OrderDetail>(`/me/orders/${encodeURIComponent(number)}`));
  if (!res.ok) {
    if (res.error instanceof ApiError && res.error.status === 404) notFound();
    return <StatePanel tone="error" title={t.errors.errorTitle}><p>{t.errors.apiDown}</p></StatePanel>;
  }
  return (
    <div className="max-w-3xl space-y-8">
      <h2 className="text-2xl">{fmt(t.order.title, { number })} · {t.order.statusLabel[res.data.status]}</h2>
      <OrderTimeline order={res.data} locale={locale} t={t} />
      <OrderSummary order={res.data} locale={locale} t={t} />
    </div>
  );
}
