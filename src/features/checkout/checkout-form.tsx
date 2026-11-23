"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AddressFields, EMPTY_ADDRESS, useAddressMessages } from "@/components/address-fields";
import { FormField } from "@/components/form-field";
import { useI18n } from "@/components/i18n-provider";
import { ProductImage } from "@/components/product-image";
import { StatePanel } from "@/components/state-panel";
import { localePath } from "@/lib/locale";
import { formatMoney, isPositive } from "@/lib/money";
import type { Address, AddressInput, PaymentMethod, Quote, ShippingMethod, UserView } from "@/lib/types";
import { EMAIL_RE, validateAddress, type AddressErrors } from "@/lib/validation";
import { getQuote, placeOrder } from "./actions";

type Props = {
  methods: ShippingMethod[];
  initialQuote: Quote | null;
  addresses: Address[];
  user: UserView | null;
  /** Generated on the server per page render so the hidden field is hydration-stable. */
  idempotencyKey: string;
};

const toInput = (a: Address): AddressInput => ({
  recipient: a.recipient, phone: a.phone, line1: a.line1, line2: a.line2 ?? "",
  subdistrict: a.subdistrict, district: a.district, province: a.province, postalCode: a.postalCode,
});

export function CheckoutForm({ methods, initialQuote, addresses, user, idempotencyKey: initialKey }: Props) {
  const { locale, t, f, err } = useI18n();
  const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [email, setEmailRaw] = useState(user?.email ?? "");
  // Same key across double-submits; a new key whenever the email changes (API answers 409 CONFLICT
  // when a key is reused with a different email).
  const [idempotencyKey, setKey] = useState(initialKey);
  const setEmail = (v: string) => {
    setEmailRaw(v);
    setKey(crypto.randomUUID());
  };
  const [savedId, setSavedId] = useState<string>(defaultAddr ? String(defaultAddr.id) : "new");
  const [address, setAddress] = useState<AddressInput>(
    defaultAddr ? toInput(defaultAddr) : { ...EMPTY_ADDRESS, recipient: user?.fullName ?? "", phone: user?.phone ?? "" },
  );
  const [shipping, setShipping] = useState(initialQuote?.shippingMethod.code ?? methods[0]?.code ?? "");
  const [payment, setPayment] = useState<PaymentMethod>("PROMPTPAY");
  const [quote, setQuote] = useState<Quote | null>(initialQuote);
  const [quoteBusy, startQuote] = useTransition();
  const [submitting, startSubmit] = useTransition();
  const [issues, setIssues] = useState<AddressErrors>({});
  const [emailIssue, setEmailIssue] = useState(false);
  const [serverFields, setServerFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const messages = useAddressMessages(issues, serverFields);

  if (!quote || quote.items.length === 0) {
    return (
      <StatePanel title={t.checkout.emptyCart}>
        <Link href={localePath(locale, "/products")} className="btn btn-primary">{t.cart.continueShopping}</Link>
      </StatePanel>
    );
  }
  const blocked = quote.hasProblems;

  function refreshQuote(code: string) {
    startQuote(async () => {
      const res = await getQuote(code, locale);
      if (res.ok) setQuote(res.data);
      else setMessage(err(res.code));
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!quote) return;
    setMessage(null);
    setServerFields({});
    const v = validateAddress(address);
    const emailBad = !EMAIL_RE.test(email.trim());
    setIssues(v);
    setEmailIssue(emailBad);
    if (emailBad || Object.keys(v).length) {
      setMessage(t.checkout.fixErrors);
      document.getElementById("checkout-error")?.focus();
      return;
    }
    startSubmit(async () => {
      const res = await placeOrder({
        idempotencyKey, email, locale, shippingMethodCode: shipping, paymentMethod: payment,
        address, expectedTotal: quote.total,
      });
      if (res && !res.ok) {
        // Success redirects server-side; reaching here means failure.
        if (res.fieldErrors) {
          const { email: em, ...rest } = res.fieldErrors;
          if (em) setEmailIssue(true);
          setServerFields(rest);
        }
        if (res.code === "TOTAL_CHANGED") {
          const total = typeof res.details?.total === "string" ? formatMoney(res.details.total, locale) : "";
          setMessage(f(t.checkout.totalChanged, { total }));
          refreshQuote(shipping);
        } else setMessage(res.code === "VALIDATION_FAILED" && res.fieldErrors ? t.checkout.fixErrors : err(res.code));
        document.getElementById("checkout-error")?.focus();
      }
    });
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <div className="space-y-8">
        <p id="checkout-error" tabIndex={-1} role="alert" className={message ? "border-2 border-cherry-deep bg-white p-3 font-semibold text-cherry-deep" : "sr-only"}>
          {message}
        </p>

        <section aria-labelledby="co-contact" className="space-y-3">
          <h2 id="co-contact" className="text-2xl">{t.checkout.contact}</h2>
          <FormField id="co-email" name="email" type="email" autoComplete="email" required label={t.checkout.email} value={email} onChange={setEmail}
            hint={t.checkout.emailHint} error={emailIssue ? t.checkout.issue.email : undefined} />
          {!user && (
            <p className="text-sm text-ink-soft">
              {t.checkout.guestNote} ·{" "}
              <Link className="underline underline-offset-4" href={`${localePath(locale, "/login")}?next=${encodeURIComponent(localePath(locale, "/checkout"))}`}>
                {t.checkout.signInPrompt}
              </Link>
            </p>
          )}
        </section>

        <section aria-labelledby="co-address" className="space-y-3">
          <h2 id="co-address" className="text-2xl">{t.checkout.address}</h2>
          {addresses.length > 0 && (
            <div>
              <label htmlFor="co-saved" className="label">{t.checkout.savedAddresses}</label>
              <select id="co-saved" className="field" value={savedId} onChange={(e) => {
                setSavedId(e.target.value);
                const a = addresses.find((x) => String(x.id) === e.target.value);
                setAddress(a ? toInput(a) : { ...EMPTY_ADDRESS });
                setIssues({}); setServerFields({});
              }}>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>{a.recipient} — {a.line1}, {a.province}</option>
                ))}
                <option value="new">{t.checkout.newAddress}</option>
              </select>
            </div>
          )}
          <AddressFields idp="co" value={address} onChange={setAddress} errors={messages} />
        </section>

        <fieldset className="space-y-2">
          <legend className="mb-1 text-2xl font-[family-name:var(--font-display)]">{t.checkout.shipping}</legend>
          {methods.length === 0 && <p className="err">{t.checkout.noShipping}</p>}
          {methods.map((m) => (
            <label key={m.code} className="flex min-h-11 cursor-pointer items-center gap-3 border-2 border-ink bg-white p-3 has-[:checked]:bg-butter">
              <input type="radio" name="shipping" value={m.code} className="h-5 w-5 accent-cherry" checked={shipping === m.code}
                onChange={() => { setShipping(m.code); refreshQuote(m.code); }} />
              <span className="flex-1">
                <span className="font-semibold">{m.name}</span>
                {m.freeOver && <span className="block text-sm text-ink-soft">{f(t.checkout.freeOver, { amount: formatMoney(m.freeOver, locale) })}</span>}
              </span>
              <span className="font-semibold">{isPositive(m.fee) ? formatMoney(m.fee, locale) : t.checkout.free}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="mb-1 text-2xl font-[family-name:var(--font-display)]">{t.checkout.payment}</legend>
          {([["PROMPTPAY", t.checkout.promptpay], ["CARD", t.checkout.card]] as const).map(([v, label]) => (
            <label key={v} className="flex min-h-11 cursor-pointer items-center gap-3 border-2 border-ink bg-white p-3 has-[:checked]:bg-butter">
              <input type="radio" name="payment" value={v} className="h-5 w-5 accent-cherry" checked={payment === v} onChange={() => setPayment(v)} />
              <span className="flex-1">
                <span className="font-semibold">{label}</span>
                {v === "CARD" && <span className="block text-sm text-ink-soft">{t.checkout.cardNote}</span>}
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      <aside aria-labelledby="co-summary" className="h-fit space-y-3 border-2 border-ink bg-white p-4 lg:sticky lg:top-24">
        <h2 id="co-summary" className="text-2xl">{t.checkout.summary}</h2>
        <ul className="divide-y divide-line">
          {quote.items.map((l) => (
            <li key={l.variantId} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 py-2">
              <ProductImage src={l.imageUrl} alt="" sizes="56px" />
              <span className="min-w-0 text-sm">
                <span className="label-type block leading-tight">{l.productName}</span>
                {l.variantLabel && <span className="text-ink-soft">{l.variantLabel} · </span>}
                <span className="text-ink-soft">×{l.quantity}</span>
                {l.problem && <span role="alert" className="block font-semibold text-cherry-deep">{t.cart.problem[l.problem]}</span>}
              </span>
              <span className="text-sm font-semibold">{formatMoney(l.lineTotal, locale)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1" aria-busy={quoteBusy}>
          <div className="flex justify-between"><dt>{t.cart.subtotal}</dt><dd>{formatMoney(quote.subtotal, locale)}</dd></div>
          {isPositive(quote.discountTotal) && (
            <div className="flex justify-between text-cherry-deep"><dt>{t.cart.discount}</dt><dd>−{formatMoney(quote.discountTotal, locale)}</dd></div>
          )}
          <div className="flex justify-between"><dt>{t.checkout.shippingFee}</dt><dd>{isPositive(quote.shippingFee) ? formatMoney(quote.shippingFee, locale) : t.checkout.free}</dd></div>
          <div className="flex justify-between border-t-2 border-ink pt-2 text-lg font-semibold">
            <dt>{t.checkout.total}</dt><dd data-testid="quote-total">{quoteBusy ? t.checkout.updatingQuote : formatMoney(quote.total, locale)}</dd>
          </div>
        </dl>
        {blocked && (
          <p role="alert" className="err">{t.checkout.problems} <Link className="underline" href={localePath(locale, "/cart")}>{t.checkout.backToCart}</Link></p>
        )}
        <button type="submit" className="btn btn-primary w-full" disabled={submitting || quoteBusy || blocked || methods.length === 0} data-testid="place-order">
          {submitting ? t.checkout.placing : t.checkout.placeOrder}
        </button>
      </aside>
    </form>
  );
}
