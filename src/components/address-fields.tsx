"use client";

import { FormField } from "./form-field";
import { useI18n } from "./i18n-provider";
import { PROVINCES } from "@/lib/provinces";
import type { AddressInput } from "@/lib/types";
import type { AddressErrors } from "@/lib/validation";

export const EMPTY_ADDRESS: AddressInput = {
  recipient: "",
  phone: "",
  line1: "",
  line2: "",
  subdistrict: "",
  district: "",
  province: "",
  postalCode: "",
};

/** Map validation issue codes (and server fieldErrors, which win) to localized messages. */
export function useAddressMessages(issues: AddressErrors, server: Record<string, string> = {}): Record<string, string> {
  const { t } = useI18n();
  const out: Record<string, string> = {};
  for (const [k, issue] of Object.entries(issues)) out[k] = t.checkout.issue[issue];
  const known: Record<string, string> = t.checkout.issue;
  // Server values are either our own issue codes ("required") or the API's message text.
  for (const [k, msg] of Object.entries(server)) out[k.split(".").pop() ?? k] = known[msg] ?? msg;
  return out;
}

export function AddressFields({
  idp,
  value,
  onChange,
  errors,
}: {
  idp: string;
  value: AddressInput;
  onChange: (v: AddressInput) => void;
  errors: Record<string, string>;
}) {
  const { t } = useI18n();
  const set = (k: keyof AddressInput) => (v: string) => onChange({ ...value, [k]: v });
  const text = (k: "recipient" | "phone" | "line1" | "line2" | "subdistrict" | "district", label: string, extra: object = {}) => (
    <FormField id={`${idp}-${k}`} name={k} label={label} value={value[k] ?? ""} onChange={set(k)} error={errors[k]} {...extra} />
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-1">{text("recipient", t.checkout.recipient, { required: true, autoComplete: "name" })}</div>
      <div className="sm:col-span-1">{text("phone", t.checkout.phone, { required: true, type: "tel", autoComplete: "tel", inputMode: "tel" })}</div>
      <div className="sm:col-span-2">{text("line1", t.checkout.line1, { required: true, autoComplete: "address-line1" })}</div>
      <div className="sm:col-span-2">{text("line2", t.checkout.line2, { autoComplete: "address-line2" })}</div>
      {text("subdistrict", t.checkout.subdistrict, { required: true })}
      {text("district", t.checkout.district, { required: true })}
      <div>
        <label htmlFor={`${idp}-province`} className="label">
          {t.checkout.province}
          <span aria-hidden="true"> *</span>
        </label>
        <select
          id={`${idp}-province`}
          name="province"
          className="field"
          value={value.province}
          onChange={(e) => set("province")(e.target.value)}
          aria-invalid={errors.province ? true : undefined}
          aria-describedby={errors.province ? `${idp}-province-err` : undefined}
          autoComplete="address-level1"
        >
          <option value="">{t.checkout.selectProvince}</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {errors.province && (
          <p id={`${idp}-province-err`} className="err">
            {errors.province}
          </p>
        )}
      </div>
      <FormField
        id={`${idp}-postalCode`}
        name="postalCode"
        label={t.checkout.postalCode}
        value={value.postalCode}
        onChange={set("postalCode")}
        error={errors.postalCode}
        required
        inputMode="numeric"
        maxLength={5}
        autoComplete="postal-code"
      />
    </div>
  );
}
