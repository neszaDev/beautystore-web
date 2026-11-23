import type { AddressInput } from "./types";
import { PROVINCES } from "./provinces";

export type AddressField = "recipient" | "phone" | "line1" | "line2" | "subdistrict" | "district" | "province" | "postalCode";
export type AddressIssue = "required" | "tooLong" | "phone" | "postalCode" | "province";
export type AddressErrors = Partial<Record<AddressField, AddressIssue>>;

const PHONE = /^[0-9+\- ]{9,15}$/; // mirrors the API (AddressInput)
const POSTAL = /^\d{5}$/;

/**
 * Client-side mirror of the API's address rules (contract: postalCode ^\d{5}$, phone ^[0-9+\- ]{9,15}$).
 * Convenience only: the server stays authoritative and its fieldErrors win.
 */
export function validateAddress(a: AddressInput): AddressErrors {
  const e: AddressErrors = {};
  for (const f of ["recipient", "line1", "subdistrict", "district"] as const) {
    const v = a[f].trim();
    if (!v) e[f] = "required";
    else if (v.length > 200) e[f] = "tooLong";
  }
  if ((a.line2 ?? "").length > 200) e.line2 = "tooLong";
  if (!a.phone.trim()) e.phone = "required";
  else if (!PHONE.test(a.phone.trim())) e.phone = "phone";
  if (!a.province) e.province = "required";
  else if (!PROVINCES.includes(a.province)) e.province = "province";
  if (!a.postalCode.trim()) e.postalCode = "required";
  else if (!POSTAL.test(a.postalCode.trim())) e.postalCode = "postalCode";
  return e;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
