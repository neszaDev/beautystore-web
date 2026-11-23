export type Params = Record<string, string | undefined>;

/** "?a=1&b=2" (or "") from params, dropping empty values; `overrides` win (undefined removes). */
export function buildQuery(params: Params, overrides: Params = {}): string {
  const merged: Params = { ...params, ...overrides };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Next.js searchParams -> flat string params (first value wins). */
export function flattenSearchParams(sp: Record<string, string | string[] | undefined>): Params {
  const out: Params = {};
  for (const [k, v] of Object.entries(sp)) out[k] = Array.isArray(v) ? v[0] : v;
  return out;
}
