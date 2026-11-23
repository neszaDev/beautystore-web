"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AddressFields, EMPTY_ADDRESS, useAddressMessages } from "@/components/address-fields";
import { useI18n } from "@/components/i18n-provider";
import type { Address, AddressInput } from "@/lib/types";
import { validateAddress, type AddressErrors } from "@/lib/validation";
import { deleteAddress, saveAddress } from "./actions";

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const { t, err } = useI18n();
  const router = useRouter();
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<AddressInput>(EMPTY_ADDRESS);
  const [isDefault, setIsDefault] = useState(false);
  const [issues, setIssues] = useState<AddressErrors>({});
  const [server, setServer] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const messages = useAddressMessages(issues, server);

  function open(a?: Address) {
    setEditing(a ? a.id : "new");
    setForm(a ? { recipient: a.recipient, phone: a.phone, line1: a.line1, line2: a.line2 ?? "", subdistrict: a.subdistrict, district: a.district, province: a.province, postalCode: a.postalCode } : EMPTY_ADDRESS);
    setIsDefault(a?.isDefault ?? addresses.length === 0);
    setIssues({}); setServer({}); setMessage(null);
  }

  return (
    <div className="space-y-6">
      {addresses.length === 0 && editing === null && <p className="text-ink-soft">{t.account.noAddresses}</p>}
      <ul className="grid gap-4 md:grid-cols-2">
        {addresses.map((a) => (
          <li key={a.id} className="space-y-2 border-2 border-ink bg-white p-4" data-testid="address-card">
            {a.isDefault && <span className="label-type bg-butter px-2 py-0.5 text-sm">{t.account.defaultBadge}</span>}
            <address className="not-italic">
              <strong>{a.recipient}</strong> · {a.phone}<br />
              {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
              {a.subdistrict}, {a.district}, {a.province} {a.postalCode}
            </address>
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => open(a)}>{t.common.edit}</button>
              <button type="button" className="btn btn-ghost" disabled={pending} onClick={() => {
                if (!window.confirm(t.account.confirmDelete)) return;
                start(async () => { const r = await deleteAddress(a.id); if (r.ok) router.refresh(); else setMessage(err(r.code)); });
              }}>{t.common.delete}</button>
            </div>
          </li>
        ))}
      </ul>
      {message && editing === null && <p role="alert" className="err">{message}</p>}
      {editing === null ? (
        <button type="button" className="btn btn-ink" onClick={() => open()}>{t.account.addAddress}</button>
      ) : (
        <form className="space-y-4 border-2 border-ink bg-white p-4" noValidate onSubmit={(e) => {
          e.preventDefault();
          const v = validateAddress(form);
          setIssues(v); setServer({});
          if (Object.keys(v).length) return;
          start(async () => {
            const r = await saveAddress(editing === "new" ? null : editing, { ...form, isDefault });
            if (r.ok) { setEditing(null); router.refresh(); }
            else { setServer(r.fieldErrors ?? {}); setMessage(err(r.code)); }
          });
        }}>
          <h2 className="text-2xl">{editing === "new" ? t.account.addAddress : t.account.editAddress}</h2>
          <AddressFields idp="ad" value={form} onChange={setForm} errors={messages} />
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" className="h-5 w-5 accent-cherry" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            {t.checkout.makeDefault}
          </label>
          {message && <p role="alert" className="err">{message}</p>}
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={pending}>{t.common.save}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>{t.common.cancel}</button>
          </div>
        </form>
      )}
    </div>
  );
}
