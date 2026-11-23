"use client";

import { useState } from "react";
import { saveShipping } from "./actions";
import { isDecimal, orNull } from "./lib";
import { Badge } from "./shared";
import { BTN_GHOST, CARD, TABLE, TD, TH } from "./styles";
import type { ShippingRow } from "./types";
import { Check, Field, Notice, SubmitRow, useAct } from "./ui";

const blank = { id: null as number | null, code: "", nameTh: "", nameEn: "", fee: "", freeOver: "", active: true, sortOrder: "0" };
type Form = typeof blank;

export function ShippingManager({ items }: { items: ShippingRow[] }) {
  const [f, setF] = useState<Form>(blank);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));
  const { pending, error, done, act, fail } = useAct();
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <div className="overflow-x-auto rounded-lg border border-line bg-white self-start">
        <table className={TABLE}><caption className="sr-only">Shipping methods</caption>
          <thead><tr>{["Code", "Name EN", "Name TH", "Fee (THB)", "Free over", "Sort", "Active", ""].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
          <tbody>{items.map((s) => (
            <tr key={s.id}><th scope="row" className={`${TD} font-normal`}>{s.code}</th><td className={TD}>{s.nameEn}</td><td className={TD} lang="th">{s.nameTh}</td><td className={TD}>{s.fee}</td>
              <td className={TD}>{s.freeOver ?? "—"}</td><td className={TD}>{s.sortOrder}</td><td className={TD}>{s.active ? <Badge tone="PUBLISHED">Active</Badge> : <Badge>Off</Badge>}</td>
              <td className={TD}><button className={BTN_GHOST} onClick={() => setF({ id: s.id, code: s.code, nameTh: s.nameTh, nameEn: s.nameEn, fee: s.fee, freeOver: s.freeOver ?? "", active: s.active, sortOrder: String(s.sortOrder) })}>Edit<span className="sr-only"> {s.code}</span></button></td></tr>))}
          </tbody></table>
      </div>
      <form className={`${CARD} space-y-3`} aria-label={f.id ? "Edit shipping method" : "New shipping method"} onSubmit={(e) => {
        e.preventDefault();
        if (!f.code.trim() || !f.nameTh.trim() || !f.nameEn.trim()) return fail("Code and both names are required.");
        if (!isDecimal(f.fee)) return fail("Fee must be a decimal like 40 or 40.00.");
        if (f.freeOver.trim() && !isDecimal(f.freeOver)) return fail("Free-over amount must be a decimal.");
        if (!/^-?\d+$/.test(f.sortOrder.trim())) return fail("Sort order must be a whole number.");
        act(() => saveShipping(f.id, { code: f.code.trim(), nameTh: f.nameTh.trim(), nameEn: f.nameEn.trim(), fee: f.fee.trim(), freeOver: orNull(f.freeOver), active: f.active, sortOrder: Number(f.sortOrder) }), { onOk: () => !f.id && setF(blank) });
      }}>
        <h2 className="text-lg">{f.id ? `Edit ${f.code}` : "New shipping method"}</h2>
        <p className="rounded-md bg-butter/40 p-2 text-sm">Fees and free-shipping thresholds are the store owner&apos;s decision. Change them only on the owner&apos;s instruction.</p>
        <Field label="Code" required value={f.code} onChange={(v) => set("code", v)} />
        <Field label="Name (TH)" lang="th" required value={f.nameTh} onChange={(v) => set("nameTh", v)} />
        <Field label="Name (EN)" required value={f.nameEn} onChange={(v) => set("nameEn", v)} />
        <Field label="Fee (THB)" inputMode="decimal" required value={f.fee} onChange={(v) => set("fee", v)} />
        <Field label="Free over (THB, optional)" inputMode="decimal" value={f.freeOver} onChange={(v) => set("freeOver", v)} hint="Subtotal after discount at which shipping becomes free." />
        <Field label="Sort order" inputMode="numeric" value={f.sortOrder} onChange={(v) => set("sortOrder", v)} />
        <Check label="Active" checked={f.active} onChange={(v) => set("active", v)} />
        <Notice error={error} done={done} />
        <div className="flex gap-2"><SubmitRow pending={pending} />{f.id && <button type="button" className={BTN_GHOST} onClick={() => setF(blank)}>New instead</button>}</div>
      </form>
    </div>
  );
}
