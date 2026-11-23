"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { run, type ActionResult } from "@/lib/action";
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from "@/lib/locale";
import { clearCartToken, hasSession, setOrderToken } from "@/lib/session";
import type { AddressInput, PaymentMethod, PlaceOrderResponse, Quote } from "@/lib/types";
import { EMAIL_RE, validateAddress } from "@/lib/validation";

const loc = (l: string): Locale => (isLocale(l) ? l : DEFAULT_LOCALE);

export async function getQuote(shippingMethodCode: string, locale: string): Promise<ActionResult<Quote>> {
  return run(() => api<Quote>("/checkout/quote", { method: "POST", body: { shippingMethodCode }, locale: loc(locale), cart: true }));
}

export type PlaceOrderInput = {
  idempotencyKey: string;
  email: string;
  locale: string;
  shippingMethodCode: string;
  paymentMethod: PaymentMethod;
  address: AddressInput;
  expectedTotal: string;
};

/**
 * Place the order. Server-side validation mirrors the client (the API is the final authority).
 * On success: store the guest order token cookie, drop the guest cart cookie and redirect to the order page.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<ActionResult<never>> {
  const locale = loc(input.locale);
  const fieldErrors: Record<string, string> = {};
  if (!EMAIL_RE.test(input.email.trim())) fieldErrors.email = "email";
  for (const [k, v] of Object.entries(validateAddress(input.address))) fieldErrors[k] = v;
  if (Object.keys(fieldErrors).length) return { ok: false, code: "VALIDATION_FAILED", fieldErrors };
  if (input.idempotencyKey.length < 8 || input.idempotencyKey.length > 80) {
    return { ok: false, code: "IDEMPOTENCY_KEY_REQUIRED" };
  }
  if (input.paymentMethod !== "PROMPTPAY" && input.paymentMethod !== "CARD") return { ok: false, code: "VALIDATION_FAILED" };

  const result = await run(() =>
    api<PlaceOrderResponse>("/checkout/orders", {
      method: "POST",
      cart: true,
      headers: { "Idempotency-Key": input.idempotencyKey },
      body: {
        email: input.email.trim(),
        locale,
        shippingMethodCode: input.shippingMethodCode,
        paymentMethod: input.paymentMethod,
        address: { ...input.address, line2: input.address.line2?.trim() || null },
        expectedTotal: input.expectedTotal,
      },
    }),
  );
  if (!result.ok) return result;

  const { order, orderToken } = result.data;
  await setOrderToken(order.number, orderToken);
  if (!(await hasSession())) await clearCartToken();
  redirect(localePath(locale, `/order/${order.number}`)); // outside try/catch: redirect() throws by design
}
