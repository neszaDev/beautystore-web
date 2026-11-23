import "server-only";
import { notFound, redirect } from "next/navigation";
import { api, ApiError, type QueryValue } from "@/lib/api";

/** Admin read: 404 -> notFound, 401/403 -> sign-in, anything else bubbles to the route's error.tsx. */
export async function adm<T>(path: string, query?: Record<string, QueryValue>): Promise<T> {
  try {
    return await api<T>(`/admin${path}`, { query });
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 404) notFound();
      if (e.status === 401 || e.status === 403) redirect("/admin/login");
    }
    throw e;
  }
}
