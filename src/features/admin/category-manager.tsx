"use client";

import { useState } from "react";
import { saveCategory } from "./actions";
import { SLUG } from "./lib";
import { BTN_GHOST, CARD, TABLE, TD, TH } from "./styles";
import type { AdminCategory } from "./types";
import { Badge } from "./shared";
import { Check, Field, Notice, Select, SubmitRow, TextArea, useAct } from "./ui";

const blank = { id: null as number | null, slug: "", kind: "COSMETICS", sortOrder: "0", active: true, nameTh: "", nameEn: "", descTh: "", descEn: "" };
type Form = typeof blank;
const toForm = (c: AdminCategory): Form => ({
  id: c.id, slug: c.slug, kind: c.kind, sortOrder: String(c.sortOrder), active: c.active,
  nameTh: c.translations.th?.name ?? "", nameEn: c.translations.en?.name ?? "", descTh: c.translations.th?.description ?? "", descEn: c.translations.en?.description ?? "",
});
const tr = (name: string, description: string) => (name.trim() || description.trim() ? { name: name.trim(), description: description.trim() || null } : null);

export function CategoryManager({ items }: { items: AdminCategory[] }) {
  const [f, setF] = useState<Form>(blank);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));
  const { pending, error, done, act, fail } = useAct();
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <div className="overflow-x-auto rounded-lg border border-line bg-white self-start">
        <table className={TABLE}><caption className="sr-only">Categories</caption>
          <thead><tr>{["Slug", "Name (EN)", "Name (TH)", "Kind", "Sort", "Active", ""].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
          <tbody>{items.map((c) => (
            <tr key={c.id}><th scope="row" className={`${TD} font-normal`}>{c.slug}</th><td className={TD}>{c.translations.en?.name ?? <Badge tone="FAILED">Missing EN</Badge>}</td>
              <td className={TD} lang="th">{c.translations.th?.name ?? <Badge tone="FAILED">Missing TH</Badge>}</td><td className={TD}>{c.kind}</td><td className={TD}>{c.sortOrder}</td><td className={TD}>{c.active ? "Yes" : "No"}</td>
              <td className={TD}><button className={BTN_GHOST} onClick={() => setF(toForm(c))}>Edit<span className="sr-only"> {c.slug}</span></button></td></tr>))}
          </tbody></table>
      </div>
      <form className={`${CARD} space-y-3`} aria-label={f.id ? "Edit category" : "New category"} onSubmit={(e) => {
        e.preventDefault();
        if (!SLUG.test(f.slug.trim())) return fail("Slug must be lowercase letters, digits and single hyphens.");
        if (!/^-?\d+$/.test(f.sortOrder.trim())) return fail("Sort order must be a whole number.");
        act(() => saveCategory(f.id, { slug: f.slug.trim(), kind: f.kind as "COSMETICS" | "SKINCARE", sortOrder: Number(f.sortOrder), active: f.active,
          translations: { th: tr(f.nameTh, f.descTh), en: tr(f.nameEn, f.descEn) } }), { onOk: () => !f.id && setF(blank) });
      }}>
        <h2 className="text-lg">{f.id ? `Edit ${f.slug}` : "New category"}</h2>
        <Field label="Slug" required value={f.slug} onChange={(v) => set("slug", v)} />
        <Select label="Kind" value={f.kind} onChange={(v) => set("kind", v)}><option>COSMETICS</option><option>SKINCARE</option></Select>
        <Field label="Sort order" inputMode="numeric" value={f.sortOrder} onChange={(v) => set("sortOrder", v)} />
        <Field label="Name (TH)" lang="th" value={f.nameTh} onChange={(v) => set("nameTh", v)} />
        <TextArea label="Description (TH)" lang="th" value={f.descTh} onChange={(v) => set("descTh", v)} />
        <Field label="Name (EN)" value={f.nameEn} onChange={(v) => set("nameEn", v)} />
        <TextArea label="Description (EN)" value={f.descEn} onChange={(v) => set("descEn", v)} />
        <Check label="Active" checked={f.active} onChange={(v) => set("active", v)} />
        <Notice error={error} done={done} />
        <div className="flex gap-2"><SubmitRow pending={pending} />{f.id && <button type="button" className={BTN_GHOST} onClick={() => setF(blank)}>New instead</button>}</div>
      </form>
    </div>
  );
}
