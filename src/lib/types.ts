/** Shapes from beautystore-api docs/api-contract.md "Shared shapes" (v1). Keep in sync with the contract. */
export type Money = string; // "259.00"; format only, never do float maths
export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
export type UserView = {
  id: number;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN";
};
export type AuthResponse = { accessToken: string; expiresIn: number; user: UserView };
export type Address = {
  id: number;
  recipient: string;
  phone: string;
  line1: string;
  line2: string | null;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: "TH";
  isDefault: boolean;
};
export type AddressInput = Omit<Address, "id" | "country" | "isDefault"> & { isDefault?: boolean };

export type PageResponse<T> = { items: T[]; page: number; size: number; totalItems: number; totalPages: number };

export type ProductCard = {
  id: number;
  slug: string;
  name: string;
  brand: string | null;
  categorySlug: string;
  priceFrom: Money;
  compareAtPrice: Money | null;
  currency: "THB";
  imageUrl: string | null;
  imageAlt: string | null;
  swatches: string[];
  stockStatus: StockStatus;
  isDemo: boolean;
  localeFallback: boolean;
};
export type CategoryKind = "COSMETICS" | "SKINCARE";
export type Category = {
  id: number;
  slug: string;
  kind: CategoryKind;
  name: string;
  description: string | null;
  localeFallback: boolean;
};
export type VariantView = {
  id: number;
  sku: string;
  label: string | null;
  swatchHex: string | null;
  price: Money;
  compareAtPrice: Money | null;
  currency: "THB";
  stockStatus: StockStatus;
  maxPerOrder: number;
};
export type ProductDetail = {
  id: number;
  slug: string;
  name: string;
  brand: string | null;
  description: string | null;
  howToUse: string | null;
  ingredients: string | null;
  warnings: string | null;
  category: { slug: string; name: string };
  isDemo: boolean;
  localeFallback: boolean;
  availableLocales: ("th" | "en")[];
  media: { url: string; alt: string | null }[];
  variants: VariantView[];
  related: ProductCard[];
};

export type CartProblem = null | "UNAVAILABLE" | "OUT_OF_STOCK" | "INSUFFICIENT_STOCK";
export type CartLine = {
  variantId: number;
  productId: number;
  productSlug: string;
  productName: string;
  variantLabel: string | null;
  swatchHex: string | null;
  sku: string;
  imageUrl: string | null;
  unitPrice: Money;
  compareAtPrice: Money | null;
  quantity: number;
  lineTotal: Money;
  maxPerOrder: number;
  problem: CartProblem;
};
export type CartPromotion = null | { code: string; valid: boolean; discount: Money; reason: string | null };
export type Cart = {
  token: string | null;
  currency: "THB";
  items: CartLine[];
  itemCount: number;
  subtotal: Money;
  promotion: CartPromotion;
  discountTotal: Money;
  estimatedTotal: Money;
  hasProblems: boolean;
};
export type ShippingMethod = { code: string; name: string; fee: Money; freeOver: Money | null; currency: "THB" };
export type Quote = {
  items: CartLine[];
  subtotal: Money;
  discountTotal: Money;
  shippingFee: Money;
  total: Money;
  currency: "THB";
  promotion: CartPromotion;
  shippingMethod: ShippingMethod;
  hasProblems: boolean;
};

export type PaymentMethod = "PROMPTPAY" | "CARD";
export type PaymentStatus = "PENDING" | "REQUIRES_ACTION" | "SUCCEEDED" | "FAILED" | "EXPIRED" | "CANCELLED";
export type PaymentView = {
  id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: Money;
  currency: "THB";
  qrPayload: string | null;
  redirectUrl: string | null;
  expiresAt: string | null;
  failureReason: string | null;
  createdAt: string;
};
export type OrderStatus = "PENDING_PAYMENT" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type OrderItem = {
  productSlug: string | null;
  productName: string;
  variantLabel: string | null;
  sku: string;
  imageUrl: string | null;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
};
export type OrderDetail = {
  number: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  currency: "THB";
  subtotal: Money;
  discountTotal: Money;
  shippingFee: Money;
  total: Money;
  promotionCode: string | null;
  email: string;
  locale: "th" | "en";
  shippingMethodName: string;
  shippingAddress: Omit<Address, "id" | "isDefault">;
  items: OrderItem[];
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  reservationExpiresAt: string;
  payment: PaymentView | null;
  history: { status: OrderStatus; at: string }[];
};
export type OrderSummary = {
  number: string;
  status: OrderStatus;
  total: Money;
  currency: "THB";
  itemCount: number;
  createdAt: string;
};
export type PlaceOrder = {
  email: string;
  locale: "th" | "en";
  shippingMethodCode: string;
  paymentMethod: PaymentMethod;
  address: AddressInput;
  expectedTotal?: Money;
};
export type PlaceOrderResponse = { order: OrderDetail; orderToken: string; payment: PaymentView | null };

export type SitemapData = {
  products: { slug: string; updatedAt: string }[];
  categories: { slug: string; updatedAt: string }[];
};

/** Statuses at which money has been received (never show "paid" for anything else). */
export const PAID_STATUSES: readonly OrderStatus[] = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
export const isPaidStatus = (s: OrderStatus): boolean => PAID_STATUSES.includes(s);
