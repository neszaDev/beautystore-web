"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useI18n } from "@/components/i18n-provider";
import { useShop } from "@/components/shop-provider";
import { localePath } from "@/lib/locale";
import { formatDateTime, formatMoney } from "@/lib/money";
import { isPaidStatus } from "@/lib/types";
import { pollOrder, startPayment } from "./actions";
import type { OrderView } from "./types";

const POLL_MS = 3000;

function mmss(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
const isHttp = (u: string) => /^https?:\/\//.test(u);

/**
 * Payment status for /order/[number]. Success is shown ONLY when the API order status is PAID or
 * later (a browser redirect or a payment attempt's own status never counts).
 */
export function PaymentPanel({ initial }: { initial: OrderView }) {
  const { locale, t, f, err } = useI18n();
  const { announce } = useShop();
  const router = useRouter();
  const [view, setView] = useState(initial);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();
  const { order } = view;
  const payment = order.payment;
  const pending = order.status === "PENDING_PAYMENT";
  const wasPaid = useRef(isPaidStatus(order.status));

  // Poll every 3 s while the order is awaiting payment.
  useEffect(() => {
    if (!pending) return;
    let stop = false;
    const id = setInterval(async () => {
      const res = await pollOrder(order.number);
      if (stop || !res.ok) return;
      setView(res.data);
    }, POLL_MS);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [pending, order.number]);

  // Countdown tick while a QR is on screen.
  const expiresAt = payment?.status === "PENDING" && payment.expiresAt ? Date.parse(payment.expiresAt) : null;
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  // Refresh server-rendered parts (summary, status chip) once, when payment is first confirmed.
  useEffect(() => {
    if (isPaidStatus(order.status) && !wasPaid.current) {
      wasPaid.current = true;
      announce(t.payment.paidTitle);
      router.refresh();
    }
  }, [order.status, announce, router, t.payment.paidTitle]);

  function retry() {
    setError(null);
    start(async () => {
      const res = await startPayment(order.number, order.paymentMethod);
      if (res.ok) setView(res.data);
      else setError(err(res.code));
    });
  }

  const box = "space-y-4 border-2 border-ink p-5";
  const retryBtn = (label: string) => (
    <button type="button" className="btn btn-primary" onClick={retry} disabled={busy} data-testid="payment-retry">
      {busy ? t.common.loading : label}
    </button>
  );

  if (isPaidStatus(order.status)) {
    return (
      <section className={`${box} bg-mint`} aria-labelledby="pay-h" data-testid="payment-success">
        <h2 id="pay-h" className="text-2xl">{t.payment.paidTitle}</h2>
        <p>{t.payment.paidText}</p>
        {order.paidAt && <p className="text-sm">{formatDateTime(order.paidAt, locale)}</p>}
      </section>
    );
  }
  if (order.status === "CANCELLED") {
    return (
      <section className={`${box} bg-butter`} aria-labelledby="pay-h">
        <h2 id="pay-h" className="text-2xl">{t.payment.cancelledTitle}</h2>
        <p>{t.payment.cancelledText}</p>
      </section>
    );
  }

  const status = payment?.status;
  const qrExpired = expiresAt !== null && expiresAt <= now;
  return (
    <section className={`${box} bg-white`} aria-labelledby="pay-h" data-testid="payment-panel">
      <h2 id="pay-h" className="text-2xl">{t.payment.title}</h2>
      <p className="sr-only" role="status">{f(t.payment.statusLive, { status: t.order.statusLabel[order.status] })}</p>
      <p>{t.payment.amount}: <strong>{formatMoney(payment?.amount ?? order.total, locale)}</strong></p>

      {!payment && (
        <>
          <p>{t.payment.noAttempt}</p>
          {retryBtn(t.payment.startPayment)}
        </>
      )}

      {payment?.method === "PROMPTPAY" && status === "PENDING" && (
        <div className="space-y-3 text-center sm:text-left">
          <p className="font-semibold">{t.payment.scanTitle}</p>
          {view.qr && !qrExpired ? (
            <Image src={view.qr} alt={t.payment.qrAlt} width={256} height={256} unoptimized className="mx-auto border-2 border-ink bg-white sm:mx-0" data-testid="promptpay-qr" />
          ) : null}
          {expiresAt && !qrExpired && (
            <p aria-live="off" data-testid="qr-countdown">{f(t.payment.expiresIn, { time: mmss(expiresAt - now) })}</p>
          )}
          {view.devMockRef && (
            <a href={`${localePath(locale, "/mock-payment/")}${encodeURIComponent(view.devMockRef)}`} className="btn btn-ghost" data-testid="dev-mock-link">
              {t.mock.devLink}
            </a>
          )}
          {qrExpired ? (
            <>
              <p role="alert" className="err">{t.payment.qrExpired}</p>
              {retryBtn(t.payment.newQr)}
            </>
          ) : (
            <p className="text-ink-soft">{t.payment.waiting}</p>
          )}
        </div>
      )}

      {payment?.method === "CARD" && status === "REQUIRES_ACTION" && (
        <div className="space-y-3">
          <p>{t.payment.cardPending}</p>
          {payment.redirectUrl && isHttp(payment.redirectUrl) && (
            <a href={payment.redirectUrl} className="btn btn-primary" data-testid="continue-card">{t.payment.continueCard}</a>
          )}
        </div>
      )}

      {status === "SUCCEEDED" && <p role="status">{t.payment.confirming}</p>}

      {(status === "FAILED" || status === "EXPIRED" || status === "CANCELLED") && (
        <div className="space-y-3">
          <p role="alert" className="font-semibold text-cherry-deep">
            {status === "FAILED" ? t.payment.failed : status === "CANCELLED" ? t.payment.cancelled : t.payment.expired}
          </p>
          {retryBtn(payment?.method === "PROMPTPAY" ? t.payment.newQr : t.payment.tryAgain)}
        </div>
      )}

      {error && <p role="alert" className="err">{error}</p>}
      <p className="text-sm text-ink-soft">{f(t.payment.reservationNote, { time: formatDateTime(order.reservationExpiresAt, locale) })}</p>
    </section>
  );
}
