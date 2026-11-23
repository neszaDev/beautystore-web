import type { Address, Money, OrderDetail, OrderStatus, PageResponse, PaymentView } from "@/lib/types";

export type { PageResponse };
export type Tr = { name: string; description: string | null; howToUse: string | null; ingredients: string | null; warnings: string | null };
export type AdminVariant = {
  id?: number; sku: string; labelTh: string | null; labelEn: string | null; swatchHex: string | null;
  price: Money; compareAtPrice: Money | null; maxPerOrder: number; active: boolean; sortOrder: number;
};
export type AdminProductInput = {
  slug: string; categoryId: number; brand: string | null; translations: { th: Tr | null; en: Tr | null }; variants: AdminVariant[];
};
export type AdminProduct = Omit<AdminProductInput, "variants"> & {
  id: number; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; isDemo: boolean; version: number;
  variants: (AdminVariant & { id: number; onHand: number; reserved: number })[];
  media: { id: number; url: string; altTh: string | null; altEn: string | null; sortOrder: number }[];
  missingLocales: string[];
};
export type ProductRow = {
  id: number; slug: string; nameTh: string | null; nameEn: string | null; brand: string | null; status: string;
  categorySlug: string; variantCount: number; totalAvailable: number; isDemo: boolean; missingLocales: string[]; updatedAt: string;
};
export type CatTr = { name: string; description: string | null };
export type AdminCategory = {
  id: number; slug: string; kind: "COSMETICS" | "SKINCARE"; sortOrder: number; active: boolean;
  translations: { th: CatTr | null; en: CatTr | null };
};
export type InventoryRow = {
  variantId: number; sku: string; productId: number; productName: string; label: string | null;
  onHand: number; reserved: number; available: number; lowStockThreshold: number;
};
export type Movement = {
  id: number; delta: number; reason: string; note: string | null; orderNumber: string | null;
  actorEmail: string | null; onHandAfter: number; createdAt: string;
};
export type Dashboard = {
  ordersToday: number; revenueToday: Money; revenueLast30Days: Money; pendingPayment: number;
  awaitingFulfilment: number; needsAttention: number; currency: string;
  lowStock: { variantId: number; sku: string; productName: string; label: string | null; available: number; threshold: number }[];
};
export type OrderRow = {
  number: string; status: OrderStatus; email: string; total: Money; currency: string; itemCount: number;
  paymentStatus: string | null; needsAttention: boolean; createdAt: string;
};
export type AdminOrder = Omit<OrderDetail, "history"> & {
  payments: PaymentView[]; history: { status: OrderStatus; at: string; actor: string | null; note: string | null }[];
  needsAttention: boolean; userId: number | null;
};
export type Promotion = {
  id: number; code: string; type: "PERCENT" | "FIXED"; value: Money; minSubtotal: Money; maxDiscount: Money | null;
  startsAt: string | null; endsAt: string | null; usageLimit: number | null; perCustomerLimit: number | null;
  active: boolean; usedCount: number;
};
export type ShippingRow = { id: number; code: string; nameTh: string; nameEn: string; fee: Money; freeOver: Money | null; active: boolean; sortOrder: number };
export type CustomerRow = { id: number; email: string; fullName: string | null; phone: string | null; createdAt: string; orderCount: number };
export type CustomerDetail = CustomerRow & { enabled: boolean; addresses: Address[] };
