"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/components/i18n-provider";
import { formatMoney } from "@/lib/money";
import { simulateMockPayment, type MockOutcome } from "./mock-actions";

export function MockPaymentPanel({ providerRef, orderNumber, amount, status }: { providerRef: string; orderNumber: string; amount: string; status: string }) {
  const { locale, t, err } = useI18n();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const go = (o: MockOutcome) =>
    start(async () => {
      const res = await simulateMockPayment(providerRef, o, orderNumber, locale);
      if (res && !res.ok) setError(err(res.code));
    });
  const btn = (o: MockOutcome, label: string, cls: string) => (
    <button type="button" className={`btn ${cls}`} disabled={pending} onClick={() => go(o)} data-testid={`mock-${o.toLowerCase()}`}>
      {pending ? t.mock.working : label}
    </button>
  );
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4">
        <dt className="font-semibold">{t.mock.amount}</dt><dd data-testid="mock-amount">{formatMoney(amount, locale)}</dd>
        <dt className="font-semibold">{t.mock.reference}</dt><dd className="break-all">{providerRef} · {status}</dd>
        <dt className="font-semibold">{t.order.number}</dt><dd>{orderNumber}</dd>
      </dl>
      <div className="flex flex-wrap gap-3">
        {btn("SUCCEEDED", t.mock.succeed, "btn-primary")}
        {btn("FAILED", t.mock.fail, "btn-ink")}
        {btn("CANCELLED", t.mock.cancel, "btn-ghost")}
        {btn("EXPIRED", t.mock.expire, "btn-ghost")}
      </div>
      {error && <p role="alert" className="err">{error}</p>}
    </div>
  );
}
