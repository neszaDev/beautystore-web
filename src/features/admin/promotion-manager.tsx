"use client";

import { useState } from "react";
import { savePromotion } from "./actions";
import { bangkokLocalToIso, isDecimal, isoToBangkokLocal, orNull } from "./lib";
import { Badge, dt } from "./shared";
import { BTN_GHOST, CARD, TABLE, TD, TH } from "./styles";
import type { Promotion } from "./types";
import { Check, Field, Notice, Select, SubmitRow, useAct } from "./ui";

const blank = { id: null as number | null, code: "", type: "PERCENT", value: "", minSubtotal: "0", maxDiscount: "", startsAt: "", endsAt: "", usageLimit: "", perCustomerLimit: "", active: true, usedCount: 0 };
type Form = typeof blank;
const intOrNull = (s: string) => (s.trim() === "" ? null : Number(s));

export function PromotionManager({ items }: { items: Promotion[] }) {
  const [f, setF] = useState<Form>(blank);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));
  const { pending, error, done, act, fail } = useAct();
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <div className="overflow-x-auto rounded-lg border border-line bg-white self-start">
        <table className={TABLE}><caption className="sr-only">Promotions</caption>
          <thead><tr>{["Code", "Discount", "Min subtotal", "Window (Bangkok)", "Used", "Active", ""].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
          <tbody>{items.map((p) => (
            <tr key={p.id}><th scope="row" className={`${TD} font-semibold`}>{p.code}</th>
              <td className={TD}>{p.type === "PERCENT" ? `${p.value}%` : `฿${p.value}`}{p.maxDiscount ? ` (max ฿${p.maxDiscount})` : ""}</td><td className={TD}>{p.minSubtotal}</td>
              <td className={TD}>{p.startsAt ? dt(p.startsAt) : "any time"} → {p.endsAt ? dt(p.endsAt) : "no end"}</td>
              <td className={TD}>{p.usedCount}{p.usageLimit ? ` / ${p.usageLimit}` : ""}</td><td className={TD}>{p.active ? <Badge tone="PUBLISHED">Active</Badge> : <Badge>Off</Badge>}</td>
              <td className={TD}><button className={BTN_GHOST} onClick={() => setF({ id: p.id, code: p.code, type: p.type, value: p.value, minSubtotal: p.minSubtotal, maxDiscount: p.maxDiscount ?? "", startsAt: isoToBangkokLocal(p.startsAt), endsAt: isoToBangkokLocal(p.endsAt), usageLimit: p.usageLimit?.toString() ?? "", perCustomerLimit: p.perCustomerLimit?.toString() ?? "", active: p.active, usedCount: p.usedCount })}>Edit<span className="sr-only"> {p.code}</span></button></td></tr>))}
          </tbody></table>
      </div>
      <form className={`${CARD} space-y-3`} aria-label={f.id ? "Edit promotion" : "New promotion"} onSubmit={(e) => {
        e.preventDefault();
        if (!/^[A-Za-z0-9_-]+$/.test(f.code.trim())) return fail("Code may contain letters, digits, hyphen and underscore. It is stored upper-case.");
        if (!isDecimal(f.value)) return fail("Value must be a decimal.");
        if (f.type === "PERCENT" && Number(f.value) > 100) return fail("A percentage cannot exceed 100.");
        if (!isDecimal(f.minSubtotal)) return fail("Minimum subtotal must be a decimal (0 for none).");
        if (f.maxDiscount.trim() && !isDecimal(f.maxDiscount)) return fail("Max discount must be a decimal.");
        for (const [k, v] of [["Usage limit", f.usageLimit], ["Per-customer limit", f.perCustomerLimit]]) if (v.trim() && !/^[1-9]\d*$/.test(v.trim())) return fail(`${k} must be a whole number >= 1.`);
        const startsAt = bangkokLocalToIso(f.startsAt), endsAt = bangkokLocalToIso(f.endsAt);
        if (startsAt && endsAt && endsAt <= startsAt) return fail("The end must be after the start.");
        act(() => savePromotion(f.id, { code: f.code.trim().toUpperCase(), type: f.type as "PERCENT" | "FIXED", value: f.value.trim(), minSubtotal: f.minSubtotal.trim(),
          maxDiscount: orNull(f.maxDiscount), startsAt, endsAt, usageLimit: intOrNull(f.usageLimit), perCustomerLimit: intOrNull(f.perCustomerLimit), active: f.active }), { onOk: () => !f.id && setF(blank) });
      }}>
        <h2 className="text-lg">{f.id ? `Edit ${f.code}` : "New promotion"}</h2>
        {f.id && <p className="text-sm text-ink-soft">Used {f.usedCount} time(s). Promotions cannot be deleted; untick Active to stop one.</p>}
        <Field label="Code" required value={f.code} onChange={(v) => set("code", v)} />
        <Select label="Type" value={f.type} onChange={(v) => set("type", v)}><option value="PERCENT">PERCENT (% off)</option><option value="FIXED">FIXED (THB off)</option></Select>
        <Field label={f.type === "PERCENT" ? "Value (%)" : "Value (THB)"} inputMode="decimal" required value={f.value} onChange={(v) => set("value", v)} />
        <Field label="Minimum subtotal (THB)" inputMode="decimal" value={f.minSubtotal} onChange={(v) => set("minSubtotal", v)} />
        <Field label="Max discount (THB, optional)" inputMode="decimal" value={f.maxDiscount} onChange={(v) => set("maxDiscount", v)} />
        <Field label="Starts (Bangkok time)" type="datetime-local" value={f.startsAt} onChange={(v) => set("startsAt", v)} />
        <Field label="Ends (Bangkok time)" type="datetime-local" value={f.endsAt} onChange={(v) => set("endsAt", v)} />
        <Field label="Usage limit (optional)" inputMode="numeric" value={f.usageLimit} onChange={(v) => set("usageLimit", v)} />
        <Field label="Per-customer limit (optional)" inputMode="numeric" value={f.perCustomerLimit} onChange={(v) => set("perCustomerLimit", v)} />
        <Check label="Active" checked={f.active} onChange={(v) => set("active", v)} />
        <Notice error={error} done={done} />
        <div className="flex gap-2"><SubmitRow pending={pending} />{f.id && <button type="button" className={BTN_GHOST} onClick={() => setF(blank)}>New instead</button>}</div>
      </form>
    </div>
  );
}
