import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { StatePanel } from "@/components/state-panel";
import { buildOrderView } from "@/features/order/order-view";
import { OrderSummary, OrderTimeline } from "@/features/order/order-summary";
import { PaymentPanel } from "@/features/order/payment-panel";
import { getDictionary, fmt } from "@/i18n";
import { tryApi } from "@/lib/api";
import { localePath } from "@/lib/locale";
import { formatDateTime } from "@/lib/money";
import { getOrderForVisitor } from "@/lib/queries";
import { pageMetadata, resolveLocale } from "@/lib/route";

export async function generateMetadata({ params }: PageProps<"/[locale]/order/[number]">): Promise<Metadata> {
  const { number } = await params;
  const locale = await resolveLocale(params);
  return pageMetadata({ locale, path: `/order/${number}`, title: fmt(getDictionary(locale).order.title, { number }), noindex: true });
}

export default async function OrderPage({ params }: PageProps<"/[locale]/order/[number]">) {
  const { number } = await params;
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const res = await tryApi(() => getOrderForVisitor(number));
  if (!res.ok) {
    return (
      <Container>
        <StatePanel tone="error" title={t.errors.errorTitle}><p>{t.errors.apiDown}</p></StatePanel>
      </Container>
    );
  }
  if (!res.data) {
    return (
      <Container>
        <StatePanel title={t.order.notFound}>
          <p>{t.order.notFoundHint}</p>
          <Link href={localePath(locale, "/login")} className="btn btn-primary">{t.auth.signIn}</Link>
        </StatePanel>
      </Container>
    );
  }
  const order = res.data;
  const view = await buildOrderView(order);
  return (
    <Container className="max-w-3xl space-y-8">
      <header>
        <p className="label-type text-cherry-deep">{t.order.thanks}</p>
        <h1 className="text-3xl" data-testid="order-number">{fmt(t.order.title, { number: order.number })}</h1>
        <p className="mt-1 text-ink-soft">
          {t.order.status}: <strong data-testid="order-status">{t.order.statusLabel[order.status]}</strong> · {t.order.placedAt} {formatDateTime(order.createdAt, locale)}
        </p>
        <p className="text-sm text-ink-soft">{fmt(t.order.confirmationEmail, { email: order.email })}</p>
      </header>
      <PaymentPanel initial={view} />
      <OrderTimeline order={order} locale={locale} t={t} />
      <OrderSummary order={order} locale={locale} t={t} />
    </Container>
  );
}
