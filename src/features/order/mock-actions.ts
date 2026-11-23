"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { run, type ActionResult } from "@/lib/action";
import { isMockPaymentAllowed } from "@/lib/env";
import { DEFAULT_LOCALE, isLocale, localePath } from "@/lib/locale";

export type MockOutcome = "SUCCEEDED" | "FAILED" | "CANCELLED" | "EXPIRED";
const OUTCOMES: readonly MockOutcome[] = ["SUCCEEDED", "FAILED", "CANCELLED", "EXPIRED"];

/** LOCAL/TEST ONLY. Feeds a signed webhook through the API's dev endpoint, then returns to the order page. */
export async function simulateMockPayment(ref: string, outcome: MockOutcome, orderNumber: string, locale: string): Promise<ActionResult<never>> {
  if (!isMockPaymentAllowed()) return { ok: false, code: "NOT_FOUND" };
  if (!OUTCOMES.includes(outcome) || !/^[A-Za-z0-9_-]{3,100}$/.test(ref) || !/^[A-Za-z0-9-]{3,40}$/.test(orderNumber)) {
    return { ok: false, code: "MALFORMED_REQUEST" };
  }
  const res = await run(() => api(`/dev/mock-payments/${encodeURIComponent(ref)}/simulate`, { method: "POST", body: { outcome }, auth: false }));
  if (!res.ok) return res;
  redirect(localePath(isLocale(locale) ? locale : DEFAULT_LOCALE, `/order/${orderNumber}`));
}
