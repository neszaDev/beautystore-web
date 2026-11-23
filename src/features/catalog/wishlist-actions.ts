"use server";

import { api } from "@/lib/api";
import { run, type ActionResult } from "@/lib/action";
import { hasSession } from "@/lib/session";

/** Add/remove a product from the signed-in user's wishlist. UNAUTHENTICATED when signed out. */
export async function setWishlist(productId: number, wanted: boolean): Promise<ActionResult<boolean>> {
  if (!(await hasSession())) return { ok: false, code: "UNAUTHENTICATED" };
  return run(async () => {
    await api(`/me/wishlist/${productId}`, { method: wanted ? "PUT" : "DELETE" });
    return wanted;
  });
}
