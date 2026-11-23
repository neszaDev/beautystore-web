import type { OrderDetail } from "@/lib/types";

/** Order plus the server-rendered PromptPay QR (data URL) when a live PromptPay attempt exists. */
export type OrderView = {
  order: OrderDetail;
  qr: string | null;
  /** LOCAL/TEST only: provider ref of the mock PromptPay attempt, for the "simulate payment" link. */
  devMockRef: string | null;
};
