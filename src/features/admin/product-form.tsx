"use client";

import Link from "next/link";
import { useState } from "react";
import { saveProduct, setProductStatus } from "./actions";
import {
  emptyTr, emptyVariant, formToTr, orNull, SLUG, trToForm, variantToRow, variantsToPayload, type TrForm, type VariantRow,
} from "./lib";
import { BTN_GHOST, BTN_PRIMARY, CARD, INPUT, LINK, TABLE, TD, TH } from "./styles";
import type { AdminCategory, AdminProduct } from "./types";
import { Check, Field, Notice, Select, SubmitRow, TextArea, useAct } from "./ui";

type Loc = "th" | "en";
const LOCALES: Loc[] = ["th", "en"];
const FIELDS: { k: keyof TrForm; label: string; rows: number }[] = [
  { k: "name", label: "Name", rows: 1 }, { k: "description", label: "Description", rows: 4 },
  { k: "howToUse", label: "How to use", rows: 3 }, { k: "ingredients", label: "Ingredients", rows: 3 }, { k: "warnings", label: "Warnings", rows: 2 },
];

/** Status buttons + form; the form remounts (key) whenever the server version changes so ids and version stay in sync. */
export function ProductEditor({ product, categories }: { product: AdminProduct; categories: AdminCategory[] }) {
  const [saved, setSaved] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <StatusPanel product={product} />
      {saved && <p role="status" className="rounded-md border border-line bg-[#effaf4] px-3 py-2 text-sm">{saved}</p>}
      <ProductForm key={product.version} categories={categories} product={product} onSaved={() => setSaved("Saved.")} />
    </div>
  );
}

function StatusPanel({ product }: { product: AdminProduct }) {
  const { pending, error, done, act } = useAct();
  const set = (s: "DRAFT" | "PUBLISHED" | "ARCHIVED") => act(() => setProductStatus(product.id, s), { success: `Status is now ${s}.` });
  return (
    <section className={CARD} aria-labelledby="st-h">
      <h2 id="st-h" className="mb-2 text-lg">Status: {product.status}</h2>
      {product.missingLocales.length > 0 && <p className="mb-2 text-sm text-cherry-deep">Missing translation: {product.missingLocales.map((l) => l.toUpperCase()).join(", ")}. Both languages are required to publish.</p>}
      <div className="flex flex-wrap gap-2">
        {product.status !== "PUBLISHED" && <button className={BTN_PRIMARY} disabled={pending} onClick={() => set("PUBLISHED")}>Publish</button>}
        {product.status !== "DRAFT" && <button className={BTN_GHOST} disabled={pending} onClick={() => set("DRAFT")}>Move to draft</button>}
        {product.status !== "ARCHIVED" && <button className={BTN_GHOST} disabled={pending} onClick={() => set("ARCHIVED")}>Archive</button>}
      </div>
      <div className="mt-2"><Notice error={error} done={done} /></div>
      <p className="mt-2 text-xs text-ink-soft">Save pending edits first: status changes act on the saved version.</p>
    </section>
  );
}

export function ProductForm({ product, categories, onSaved }: { product: AdminProduct | null; categories: AdminCategory[]; onSaved?: () => void }) {
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(String(product?.categoryId ?? categories[0]?.id ?? ""));
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [tr, setTr] = useState<Record<Loc, TrForm>>({ th: product ? trToForm(product.translations.th) : emptyTr(), en: product ? trToForm(product.translations.en) : emptyTr() });
  const [rows, setRows] = useState<VariantRow[]>(product ? product.variants.map(variantToRow) : [emptyVariant()]);
  const [tab, setTab] = useState<Loc>("th");
  const [preview, setPreview] = useState(false);
  const { pending, error, done, fields, act, fail } = useAct();
  const stock = new Map(product?.variants.map((v) => [v.id, v]) ?? []);

  const setTrField = (l: Loc, k: keyof TrForm, v: string) => setTr((s) => ({ ...s, [l]: { ...s[l], [k]: v } }));
  const setRow = (i: number, patch: Partial<VariantRow>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const missing = (l: Loc) => tr[l].name.trim() === "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!SLUG.test(slug.trim())) return fail("Slug must be lowercase letters, digits and single hyphens, e.g. velvet-lip-cream.");
    if (!categoryId) return fail("Choose a category.");
    for (const l of LOCALES) if (missing(l) && formToTr(tr[l]) !== null) return fail(`The ${l.toUpperCase()} translation has content but no name.`);
    const { payload, errors } = variantsToPayload(rows);
    if (errors.length) return fail(errors.join(" · "));
    act(() => saveProduct(product?.id ?? null, {
      slug: slug.trim(), categoryId: Number(categoryId), brand: orNull(brand),
      translations: { th: formToTr(tr.th), en: formToTr(tr.en) }, variants: payload,
    }, product?.version), { success: "Saved.", onOk: () => onSaved?.() });
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <section className={`${CARD} grid gap-3 sm:grid-cols-3`}>
        <Field label="Slug" required value={slug} onChange={setSlug} error={fields.slug} hint="Lowercase, hyphenated. Part of the public URL." />
        <Select label="Category" value={categoryId} onChange={setCategoryId}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.translations.en?.name ?? c.slug}</option>)}
        </Select>
        <Field label="Brand" value={brand} onChange={setBrand} />
      </section>

      <section className={CARD} aria-labelledby="copy-h">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="copy-h" className="text-lg">Copy</h2>
          <Check label="Preview" checked={preview} onChange={setPreview} />
        </div>
        <div role="tablist" aria-label="Language" className="mb-3 flex gap-1">
          {LOCALES.map((l) => (
            <button key={l} type="button" role="tab" id={`tab-${l}`} aria-selected={tab === l} aria-controls={`panel-${l}`}
              onClick={() => setTab(l)} className={`rounded-md border border-line px-3 py-1.5 text-sm font-semibold ${tab === l ? "bg-ink text-cream" : "bg-white"}`}>
              {l === "th" ? "Thai" : "English"}{missing(l) && <span className="ml-1 rounded bg-butter px-1 text-xs text-ink">missing</span>}
            </button>
          ))}
        </div>
        {LOCALES.map((l) => (
          <div key={l} role="tabpanel" id={`panel-${l}`} aria-labelledby={`tab-${l}`} hidden={tab !== l} className="space-y-3">
            {missing(l) && <p className="text-sm text-cherry-deep">No {l === "th" ? "Thai" : "English"} name yet. This language is flagged as missing and blocks publishing. Nothing is copied from the other language.</p>}
            {FIELDS.map((f) => (f.rows === 1
              ? <Field key={f.k} lang={l} label={`${f.label} (${l.toUpperCase()})`} value={tr[l][f.k]} onChange={(v) => setTrField(l, f.k, v)} />
              : <TextArea key={f.k} lang={l} rows={f.rows} label={`${f.label} (${l.toUpperCase()})`} value={tr[l][f.k]} onChange={(v) => setTrField(l, f.k, v)} />))}
          </div>
        ))}
        {preview && (
          <div className="mt-4 grid gap-3 border-t border-line pt-4 md:grid-cols-2" aria-label="Copy preview">
            {LOCALES.map((l) => (
              <article key={l} lang={l} className="rounded-md bg-cream p-3 text-sm">
                <p className="mb-1 text-xs font-semibold uppercase text-ink-soft">{l === "th" ? "Thai storefront" : "English storefront"}</p>
                {missing(l) ? <p className="text-cherry-deep">Missing: this language will not display until a name is added.</p> : (<>
                  <h3 className="text-base">{tr[l].name}</h3>{brand && <p className="text-ink-soft">{brand}</p>}
                  {FIELDS.slice(1).map((f) => tr[l][f.k].trim() && <div key={f.k} className="mt-2"><h4 className="font-semibold">{f.label}</h4><p className="whitespace-pre-line">{tr[l][f.k]}</p></div>)}
                </>)}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={CARD} aria-labelledby="var-h">
        <h2 id="var-h" className="text-lg">Variants</h2>
        <p className="mb-3 text-sm text-ink-soft">Existing variants cannot be deleted because past orders reference them. Untick <em>Active</em> to retire one. Prices are in THB, e.g. 259 or 259.50. Stock is changed in Inventory only.</p>
        <div className="overflow-x-auto">
          <table className={TABLE}>
            <caption className="sr-only">Variant editor</caption>
            <thead><tr>{["SKU", "Label TH", "Label EN", "Swatch", "Price", "Compare at", "Max/order", "Sort", "Active", "Stock", ""].map((h) => <th key={h} scope="col" className={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => {
                const s = r.id ? stock.get(r.id) : undefined;
                const cell = (k: keyof VariantRow, label: string, w = "w-24", extra: object = {}) => (
                  <input aria-label={`${label}, variant ${i + 1}`} className={`${INPUT} ${w}`} value={String(r[k])} onChange={(e) => setRow(i, { [k]: e.target.value })} {...extra} />);
                return (
                  <tr key={r.id ?? `new-${i}`}>
                    <td className={TD}>{cell("sku", "SKU", "w-32")}</td>
                    <td className={TD}>{cell("labelTh", "Label TH", "w-28", { lang: "th" })}</td>
                    <td className={TD}>{cell("labelEn", "Label EN", "w-28")}</td>
                    <td className={TD}><span className="flex items-center gap-1">
                      <input type="color" aria-label={`Swatch colour picker, variant ${i + 1}`} className="size-9 rounded border border-line" value={/^#[0-9a-fA-F]{6}$/.test(r.swatchHex) ? r.swatchHex : "#ffffff"} onChange={(e) => setRow(i, { swatchHex: e.target.value })} />
                      {cell("swatchHex", "Swatch hex", "w-24", { placeholder: "#RRGGBB" })}</span></td>
                    <td className={TD}>{cell("price", "Price", "w-24", { inputMode: "decimal" })}</td>
                    <td className={TD}>{cell("compareAtPrice", "Compare-at price", "w-24", { inputMode: "decimal" })}</td>
                    <td className={TD}>{cell("maxPerOrder", "Max per order", "w-16", { inputMode: "numeric" })}</td>
                    <td className={TD}>{cell("sortOrder", "Sort order", "w-16", { inputMode: "numeric" })}</td>
                    <td className={TD}><input type="checkbox" className="size-5 accent-cherry" aria-label={`Active, variant ${i + 1}`} checked={r.active} onChange={(e) => setRow(i, { active: e.target.checked })} /></td>
                    <td className={TD}>{s ? <>on hand {s.onHand}, reserved {s.reserved}<br /><Link className={LINK} href={`/admin/inventory/${s.id}?sku=${encodeURIComponent(s.sku)}`} aria-label={`Inventory for ${s.sku}`}>Inventory</Link></> : "—"}</td>
                    <td className={TD}>{!r.id && rows.length > 1 && <button type="button" className={BTN_GHOST} onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>Remove</button>}</td>
                  </tr>);
              })}
            </tbody>
          </table>
        </div>
        <button type="button" className={`${BTN_GHOST} mt-3`} onClick={() => setRows((rs) => [...rs, emptyVariant(rs.length)])}>Add variant</button>
      </section>

      <Notice error={error} done={done} />
      <SubmitRow pending={pending} label={product ? "Save changes" : "Create draft"} />
    </form>
  );
}
