import Link from "next/link";
import { Container } from "@/components/container";
import { StatePanel } from "@/components/state-panel";
import { getDictionary, fmt } from "@/i18n";
import { tryApi } from "@/lib/api";
import type { Locale } from "@/lib/locale";
import { getProducts } from "@/lib/queries";
import { buildQuery, type Params } from "@/lib/url";
import { FilterDrawer, Pagination, SortSelect } from "./listing-controls";
import { ProductCard } from "./product-card";

const SORTS = ["newest", "price_asc", "price_desc", "name"];
const KINDS = ["COSMETICS", "SKINCARE"];

/** Parse + sanitise URL params once; the API re-validates (sort is an allowlist there too). */
export function parseListingParams(sp: Params) {
  const page = Math.max(1, Math.trunc(Number(sp.page)) || 1);
  const num = (v?: string) => (v && /^\d{1,7}(\.\d{1,2})?$/.test(v) ? v : undefined);
  return {
    q: sp.q?.trim().slice(0, 100) || undefined,
    kind: sp.kind && KINDS.includes(sp.kind) ? sp.kind : undefined,
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    inStock: sp.inStock === "true" ? "true" : undefined,
    sort: sp.sort && SORTS.includes(sp.sort) ? sp.sort : "newest",
    page,
  };
}

function FilterForm({
  idp, basePath, p, t, showKind,
}: {
  idp: string;
  basePath: string;
  p: ReturnType<typeof parseListingParams>;
  t: ReturnType<typeof getDictionary>;
  showKind: boolean;
}) {
  return (
    <form method="get" action={basePath} className="space-y-5">
      {p.q && <input type="hidden" name="q" value={p.q} />}
      {p.sort !== "newest" && <input type="hidden" name="sort" value={p.sort} />}
      {showKind && (
        <fieldset>
          <legend className="label">{t.listing.kind}</legend>
          {[["", t.listing.kindAll], ["COSMETICS", t.listing.kindCosmetics], ["SKINCARE", t.listing.kindSkincare]].map(([v, label]) => (
            <label key={v} className="flex min-h-11 items-center gap-2">
              <input type="radio" name="kind" value={v} defaultChecked={(p.kind ?? "") === v} className="h-5 w-5 accent-cherry" />
              {label}
            </label>
          ))}
        </fieldset>
      )}
      <fieldset>
        <legend className="label">{t.listing.price}</legend>
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor={`${idp}-min`} className="text-sm">{t.listing.minPrice}</label>
            <input id={`${idp}-min`} name="minPrice" inputMode="decimal" defaultValue={p.minPrice} className="field" />
          </div>
          <div className="flex-1">
            <label htmlFor={`${idp}-max`} className="text-sm">{t.listing.maxPrice}</label>
            <input id={`${idp}-max`} name="maxPrice" inputMode="decimal" defaultValue={p.maxPrice} className="field" />
          </div>
        </div>
      </fieldset>
      <label className="flex min-h-11 items-center gap-2 font-semibold">
        <input type="checkbox" name="inStock" value="true" defaultChecked={p.inStock === "true"} className="h-5 w-5 accent-cherry" />
        {t.listing.inStock}
      </label>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-ink flex-1">{t.listing.applyFilters}</button>
        <Link href={basePath + buildQuery({ q: p.q, sort: p.sort === "newest" ? undefined : p.sort })} className="btn btn-ghost">
          {t.listing.clearFilters}
        </Link>
      </div>
    </form>
  );
}

export async function ProductListing({
  locale, basePath, title, category, searchParams,
}: {
  locale: Locale;
  basePath: string; // locale-prefixed path of this page
  title: string;
  category?: string;
  searchParams: Params;
}) {
  const t = getDictionary(locale);
  const p = parseListingParams(searchParams);
  const res = await tryApi(() =>
    getProducts(locale, {
      category,
      kind: p.kind,
      q: p.q,
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      inStock: p.inStock,
      sort: p.sort === "newest" ? undefined : p.sort,
      page: p.page - 1,
    }),
  );
  const urlParams: Params = { q: p.q, kind: p.kind, minPrice: p.minPrice, maxPrice: p.maxPrice, inStock: p.inStock, sort: p.sort === "newest" ? undefined : p.sort };
  const active = [p.kind, p.minPrice, p.maxPrice, p.inStock].filter(Boolean).length;
  const showKind = !category;
  const heading = p.q ? fmt(t.listing.searchTitle, { q: p.q }) : title;

  return (
    <Container>
      <h1 className="mb-1 text-3xl sm:text-4xl">{heading}</h1>
      {!res.ok ? (
        <StatePanel tone="error" title={t.errors.errorTitle}>
          <p>{t.errors.apiDown}</p>
        </StatePanel>
      ) : (
        <div className="mt-4 grid gap-8 lg:grid-cols-[15rem_1fr]">
          <aside className="hidden lg:block" aria-label={t.listing.filters}>
            <FilterForm idp="d" basePath={basePath} p={p} t={t} showKind={showKind} />
          </aside>
          <section aria-label={heading}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-ink-soft" aria-live="polite">{fmt(t.listing.results, { n: res.data.totalItems })}</p>
              <div className="flex flex-wrap items-center gap-3">
                <FilterDrawer activeCount={active}>
                  <FilterForm idp="m" basePath={basePath} p={p} t={t} showKind={showKind} />
                </FilterDrawer>
                <SortSelect basePath={basePath} params={urlParams} value={p.sort} />
              </div>
            </div>
            {res.data.items.length === 0 ? (
              <StatePanel title={t.listing.noResults}>
                <p>{t.listing.noResultsHint}</p>
                <Link href={basePath} className="btn btn-ghost">{t.listing.clearFilters}</Link>
              </StatePanel>
            ) : (
              <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
                {res.data.items.map((item, i) => (
                  <li key={item.id}><ProductCard product={item} locale={locale} t={t} priority={i < 4} /></li>
                ))}
              </ul>
            )}
            <Pagination basePath={basePath} params={urlParams} page={p.page} totalPages={res.data.totalPages} />
          </section>
        </div>
      )}
    </Container>
  );
}
