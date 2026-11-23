import "server-only";
import { cookies, headers } from "next/headers";
import { COOKIE_CART, COOKIE_SESSION } from "./cookie-names";
import { getEnv } from "./env";
import type { Locale } from "./locale";

/**
 * Server-only API client (the browser never talks to the API).
 *
 *   const cart = await api<Cart>("/cart", { locale, cart: true });
 *   await api("/me/wishlist/5", { method: "PUT" });           // 204 -> undefined
 *   await api<Cart>("/cart/merge", { method: "POST", bearer: token, cart: true });
 *
 * Forwards bs_session as Bearer (unless `auth: false`), bs_cart as X-Cart-Token (when `cart: true`),
 * an order token as X-Order-Token, and X-Forwarded-For. Throws ApiError on non-2xx
 * (status 0 / code UNREACHABLE when the API cannot be reached).
 */
export type QueryValue = string | number | boolean | null | undefined;

export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** JSON-serialised unless it is FormData (multipart, for admin uploads). */
  body?: unknown;
  locale?: Locale;
  query?: Record<string, QueryValue>;
  /** Forward the session cookie as Bearer. Default true. */
  auth?: boolean;
  /** Use this token instead of the cookie (e.g. right after login, before the cookie is readable). */
  bearer?: string;
  /** Forward bs_cart as X-Cart-Token. Default false. */
  cart?: boolean;
  /** Explicit guest cart token (overrides the cookie). */
  cartToken?: string;
  orderToken?: string;
  headers?: Record<string, string>;
  /** Seconds to cache a public GET in the Next data cache. Default: no-store. */
  revalidate?: number;
  timeoutMs?: number;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail: string | null;
  readonly fieldErrors: Record<string, string> | null;
  readonly details: Record<string, unknown> | null;
  constructor(
    status: number,
    code: string,
    title: string,
    detail: string | null = null,
    fieldErrors: Record<string, string> | null = null,
    details: Record<string, unknown> | null = null,
  ) {
    super(title);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.fieldErrors = fieldErrors;
    this.details = details;
  }
  get unreachable(): boolean {
    return this.status === 0 || this.status >= 502;
  }
}

type Problem = {
  title?: string;
  detail?: string;
  code?: string;
  fieldErrors?: Record<string, string>;
  details?: Record<string, unknown>;
};

export async function api<T = void>(path: string, opts: ApiOptions = {}): Promise<T> {
  const env = getEnv();
  const url = new URL(`${env.apiInternalUrl}/api/v1${path}`);
  if (opts.locale) url.searchParams.set("locale", opts.locale);
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }

  const jar = await cookies();
  const hdrs = new Headers({ Accept: "application/json", ...opts.headers });
  const bearer = opts.bearer ?? (opts.auth === false ? undefined : jar.get(COOKIE_SESSION)?.value);
  if (bearer) hdrs.set("Authorization", `Bearer ${bearer}`);
  const cartToken = opts.cartToken ?? (opts.cart ? jar.get(COOKIE_CART)?.value : undefined);
  if (cartToken) hdrs.set("X-Cart-Token", cartToken);
  if (opts.orderToken) hdrs.set("X-Order-Token", opts.orderToken);
  const incoming = await headers();
  const xff = incoming.get("x-forwarded-for") ?? incoming.get("x-real-ip");
  if (xff) hdrs.set("X-Forwarded-For", xff);

  let body: BodyInit | undefined;
  if (opts.body instanceof FormData) body = opts.body;
  else if (opts.body !== undefined) {
    body = JSON.stringify(opts.body);
    hdrs.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? "GET",
      headers: hdrs,
      body,
      signal: AbortSignal.timeout(opts.timeoutMs ?? 10_000),
      ...(opts.revalidate ? { next: { revalidate: opts.revalidate } } : { cache: "no-store" as const }),
    });
  } catch {
    throw new ApiError(0, "UNREACHABLE", "API unreachable");
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!res.ok) {
    let p: Problem = {};
    try {
      p = JSON.parse(text) as Problem;
    } catch {
      /* non-JSON error body (gateway page) */
    }
    throw new ApiError(
      res.status,
      p.code ?? (res.status >= 500 ? "UPSTREAM_ERROR" : "UNKNOWN"),
      p.title ?? res.statusText,
      p.detail ?? null,
      p.fieldErrors ?? null,
      p.details ?? null,
    );
  }
  try {
    return (text ? JSON.parse(text) : undefined) as T;
  } catch {
    throw new ApiError(502, "UPSTREAM_ERROR", "Invalid API response");
  }
}

export type Attempt<T> = { ok: true; data: T } | { ok: false; error: ApiError };

/** Run an API read and capture failure instead of throwing, so pages can render an error state. */
export async function tryApi<T>(fn: () => Promise<T>): Promise<Attempt<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, error: e };
    throw e;
  }
}
