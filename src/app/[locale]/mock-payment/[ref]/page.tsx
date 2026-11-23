import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { StatePanel } from "@/components/state-panel";
import { MockPaymentPanel } from "@/features/order/mock-payment-panel";
import { getDictionary } from "@/i18n";
import { api, tryApi } from "@/lib/api";
import { isMockPaymentAllowed } from "@/lib/env";
import { resolveLocale } from "@/lib/route";

type MockPayment = { providerRef: string; method: string; status: string; amount: string; currency: string; orderNumber: string; locale: string };

export const metadata: Metadata = { title: "Mock payment", robots: { index: false, follow: false } };

export default async function MockPaymentPage({ params }: PageProps<"/[locale]/mock-payment/[ref]">) {
  if (!isMockPaymentAllowed()) notFound(); // local/test only; 404 everywhere else
  const { ref } = await params;
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const res = await tryApi(() => api<MockPayment>(`/dev/mock-payments/${encodeURIComponent(ref)}`, { auth: false }));
  return (
    <>
      <div role="note" className="bg-butter px-4 py-3 text-center font-[family-name:var(--font-display)] text-lg uppercase tracking-wide border-b-2 border-ink" data-testid="test-mode-banner">
        {t.mock.banner}
      </div>
      <Container className="max-w-xl">
        <h1 className="mb-2 text-3xl">{t.mock.title}</h1>
        <p className="mb-6 text-ink-soft">{t.mock.text}</p>
        {res.ok ? (
          <div className="border-2 border-ink bg-white p-5">
            <MockPaymentPanel providerRef={res.data.providerRef} orderNumber={res.data.orderNumber} amount={res.data.amount} status={res.data.status} />
          </div>
        ) : (
          <StatePanel tone="error" title={t.errors.errorTitle}><p>{t.errors.apiDown}</p></StatePanel>
        )}
      </Container>
    </>
  );
}
