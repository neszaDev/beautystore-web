"use server";

import { api } from "@/lib/api";
import { run, type ActionResult } from "@/lib/action";
import { setSession } from "@/lib/session";
import type { Address, AddressInput, AuthResponse, UserView } from "@/lib/types";
import { validateAddress } from "@/lib/validation";

export async function updateProfile(fullName: string, phone: string): Promise<ActionResult<UserView>> {
  return run(() => api<UserView>("/me", { method: "PUT", body: { fullName: fullName.trim(), phone: phone.trim() || null } }));
}

/** The API revokes old tokens and returns a fresh one; swap the session cookie. */
export async function changePassword(currentPassword: string, newPassword: string): Promise<ActionResult> {
  return run(async () => {
    const auth = await api<AuthResponse>("/me/password", { method: "POST", body: { currentPassword, newPassword } });
    await setSession(auth);
  });
}

export async function saveAddress(id: number | null, input: AddressInput): Promise<ActionResult<Address>> {
  const issues = validateAddress(input);
  if (Object.keys(issues).length) return { ok: false, code: "VALIDATION_FAILED", fieldErrors: issues };
  const body = { ...input, line2: input.line2?.trim() || null };
  return run(() =>
    id === null
      ? api<Address>("/me/addresses", { method: "POST", body })
      : api<Address>(`/me/addresses/${id}`, { method: "PUT", body }),
  );
}

export async function deleteAddress(id: number): Promise<ActionResult> {
  return run(() => api(`/me/addresses/${id}`, { method: "DELETE" }));
}
