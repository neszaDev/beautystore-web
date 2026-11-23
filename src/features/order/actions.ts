"use server";

import { api, ApiError } from "@/lib/api";
import { run, type ActionResult } from "@/lib/action";
import { getOrderForVisitor } from "@/lib/queries";
import { getOrderToken } from "@/lib/session";
import type { PaymentView } from "@/lib/types";
import { buildOrderView } from "./order-view";
import type { OrderView } from "./types";

const NUMBER_RE = /^[A-Za-z0-9-]{3,40}$/;

/** Poll used while PENDING_PAYMENT (every 3 s from the order page). The API order status is the only truth. */
export async function pollOrder(number: string): Promise<ActionResult<OrderView>> {
  if (!NUMBER_RE.test(number)) return { ok: false, code: "NOT_FOUND" };
  return run(async () => {
    const order = await getOrderForVisitor(number);
    if (!order) throw new ApiError(404, "NOT_FOUND", "Not found");
    return buildOrderView(order);
  });
}

/** New payment attempt (new QR / retry card). The API decides if it is allowed (PAYMENT_NOT_ALLOWED). */
export async function startPayment(number: string, method?: "PROMPTPAY" | "CARD"): Promise<ActionResult<OrderView>> {
  if (!NUMBER_RE.test(number)) return { ok: false, code: "NOT_FOUND" };
  return run(async () => {
    const token = await getOrderToken(number);
    await api<PaymentView>(`/checkout/orders/${encodeURIComponent(number)}/payments`, {
      method: "POST",
      body: method ? { method } : {},
      orderToken: token,
    });
    const order = await getOrderForVisitor(number);
    if (!order) throw new ApiError(404, "NOT_FOUND", "Not found");
    return buildOrderView(order);
  });
}
