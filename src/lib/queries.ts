import "server-only";
import { api, ApiError } from "./api";
import { getOrderToken, hasSession } from "./session";
import type { Locale } from "./locale";
import type {
  Address,
  Cart,
  Category,
  OrderDetail,
  OrderSummary,
  PageResponse,
  ProductCard,
  ProductDetail,
  ShippingMethod,
  SitemapData,
} from "./types";

/** Typed server-side reads shared by pages. Each throws ApiError; wrap with tryApi() for an error state. */

export type ProductQuery = {
  category?: string;
  kind?: string;
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sort?: string;
  page?: number;
  size?: number;
};

export const getCategories = (locale: Locale) =>
  api<Category[]>("/catalog/categories", { locale, auth: false, revalidate: 60 });

export const getProducts = (locale: Locale, q: ProductQuery = {}) =>
  api<PageResponse<ProductCard>>("/catalog/products", { locale, auth: false, query: { size: 24, ...q } });

export const getProduct = (locale: Locale, slug: string) =>
  api<ProductDetail>(`/catalog/products/${encodeURIComponent(slug)}`, { locale, auth: false });

export const getSitemapData = () => api<SitemapData>("/catalog/sitemap", { auth: false, revalidate: 3600 });

export const getCart = (locale: Locale) => api<Cart>("/cart", { locale, cart: true });

export const getShippingMethods = (locale: Locale) =>
  api<ShippingMethod[]>("/shipping-methods", { locale, auth: false, revalidate: 60 });

export const getAddresses = () => api<Address[]>("/me/addresses");

export const getMyOrders = (page = 0, size = 20) => api<PageResponse<OrderSummary>>("/me/orders", { query: { page, size } });

/** Order for the current visitor: guest cookie token first, else signed-in owner. null when not found. */
export async function getOrderForVisitor(number: string): Promise<OrderDetail | null> {
  try {
    const token = await getOrderToken(number);
    if (token) return await api<OrderDetail>(`/orders/lookup/${encodeURIComponent(number)}`, { orderToken: token });
    if (await hasSession()) return await api<OrderDetail>(`/me/orders/${encodeURIComponent(number)}`);
    return null;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 401)) return null;
    throw e;
  }
}
