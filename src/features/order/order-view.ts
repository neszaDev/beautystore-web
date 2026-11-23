import "server-only";
import { isMockPaymentAllowed } from "@/lib/env";
import { qrDataUrl } from "@/lib/qr";
import type { OrderDetail } from "@/lib/types";
import type { OrderView } from "./types";

export async function buildOrderView(order: OrderDetail): Promise<OrderView> {
  const p = order.payment;
  const qr =
    order.status === "PENDING_PAYMENT" && p?.method === "PROMPTPAY" && p.status === "PENDING" && p.qrPayload
      ? await qrDataUrl(p.qrPayload)
      : null;
  const m = /^MOCK-PROMPTPAY\|([^|]+)\|/.exec(p?.qrPayload ?? "");
  return { order, qr, devMockRef: qr && m && isMockPaymentAllowed() ? m[1] : null };
}
