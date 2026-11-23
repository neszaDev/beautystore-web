"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { ok, run, type ActionResult } from "@/lib/action";
import { clearSession, setSession } from "@/lib/session";
import type { AuthResponse } from "@/lib/types";
import type { AdminCategory, AdminProduct, AdminProductInput, Promotion, ShippingRow } from "./types";

const A = (p: string) => `/admin${p}`;

export async function adminLogin(input: { email: string; password: string }): Promise<ActionResult> {
  const r = await run(async () => {
    const auth = await api<AuthResponse>("/auth/login", { method: "POST", auth: false, body: { email: input.email.trim(), password: input.password } });
    if (auth.user.role !== "ADMIN") return false; // never store a customer's token from the admin form
    await setSession(auth);
    return true;
  });
  if (!r.ok) return r;
  if (!r.data) return { ok: false, code: "NOT_ADMIN" };
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await clearSession();
  redirect("/admin/login");
}

/* ---------- products ---------- */
export async function saveProduct(id: number | null, input: AdminProductInput, version?: number): Promise<ActionResult<{ version: number }>> {
  const r = await run(() =>
    id === null
      ? api<AdminProduct>("/admin/products", { method: "POST", body: input })
      : api<AdminProduct>(`/admin/products/${id}`, { method: "PUT", body: { ...input, version } }),
  );
  if (!r.ok) return r;
  revalidatePath(A("/products"));
  if (id === null) redirect(A(`/products/${r.data.id}`));
  revalidatePath(A(`/products/${id}`));
  return ok({ version: r.data.version });
}

export async function setProductStatus(id: number, status: "DRAFT" | "PUBLISHED" | "ARCHIVED"): Promise<ActionResult> {
  const r = await run(() => api(`/admin/products/${id}/status`, { method: "POST", body: { status } }));
  if (r.ok) { revalidatePath(A("/products")); revalidatePath(A(`/products/${id}`)); }
  return r;
}

export async function uploadMedia(id: number, form: FormData): Promise<ActionResult> {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, code: "FILE_REJECTED" };
  const r = await run(() => api(`/admin/products/${id}/media`, { method: "POST", body: form }));
  if (r.ok) revalidatePath(A(`/products/${id}`));
  return r;
}

export async function deleteMedia(id: number, mediaId: number): Promise<ActionResult> {
  const r = await run(() => api(`/admin/products/${id}/media/${mediaId}`, { method: "DELETE" }));
  if (r.ok) revalidatePath(A(`/products/${id}`));
  return r;
}

/* ---------- categories / promotions / shipping (same create-or-update shape) ---------- */
async function upsert<T>(base: string, id: number | null, body: unknown, page: string): Promise<ActionResult<T>> {
  const r = await run(() => api<T>(id === null ? base : `${base}/${id}`, { method: id === null ? "POST" : "PUT", body }));
  if (r.ok) revalidatePath(A(page));
  return r;
}
export const saveCategory = async (id: number | null, body: Omit<AdminCategory, "id">) => upsert<AdminCategory>("/admin/categories", id, body, "/categories");
export const savePromotion = async (id: number | null, body: Omit<Promotion, "id" | "usedCount">) => upsert<Promotion>("/admin/promotions", id, body, "/promotions");
export const saveShipping = async (id: number | null, body: Omit<ShippingRow, "id">) => upsert<ShippingRow>("/admin/shipping-methods", id, body, "/shipping");

/* ---------- inventory ---------- */
export async function adjustStock(variantId: number, body: { delta: number; reason: string; note: string }): Promise<ActionResult> {
  const r = await run(() => api(`/admin/inventory/${variantId}/adjustments`, { method: "POST", body }));
  if (r.ok) { revalidatePath(A("/inventory")); revalidatePath(A(`/inventory/${variantId}`)); revalidatePath(A("/")); }
  return r;
}
export async function setThreshold(variantId: number, lowStockThreshold: number): Promise<ActionResult> {
  const r = await run(() => api(`/admin/inventory/${variantId}/threshold`, { method: "PUT", body: { lowStockThreshold } }));
  if (r.ok) { revalidatePath(A("/inventory")); revalidatePath(A(`/inventory/${variantId}`)); }
  return r;
}

/* ---------- orders ---------- */
async function orderCall(number: string, path: string, method: "POST" | "PUT", body: unknown): Promise<ActionResult> {
  const r = await run(() => api(`/admin/orders/${encodeURIComponent(number)}${path}`, { method, body }));
  if (r.ok) { revalidatePath(A(`/orders/${number}`)); revalidatePath(A("/orders")); revalidatePath(A("/")); }
  return r;
}
export const transitionOrder = async (number: string, body: { to: string; note?: string; carrier?: string; trackingNumber?: string; trackingUrl?: string }) =>
  orderCall(number, "/transition", "POST", body);
export const saveTracking = async (number: string, body: { carrier?: string; trackingNumber: string; trackingUrl?: string }) => orderCall(number, "/tracking", "PUT", body);
export const resolveAttention = async (number: string, note: string) => orderCall(number, "/resolve-attention", "POST", { note });
