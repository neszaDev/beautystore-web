import { type NextRequest } from "next/server";
import { getEnv } from "@/lib/env";

/**
 * Webhook relay: the API is internal in Azure, so the PSP calls the storefront and we forward the
 * RAW body untouched plus content-type and every X-*  header (signatures) to the API.
 * Verification happens in the API's provider adapter; this route never parses the payload.
 */
const MAX_BYTES = 1_000_000;

export async function POST(request: NextRequest, ctx: RouteContext<"/api/webhooks/payments/[provider]">) {
  const { provider } = await ctx.params;
  if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(provider)) return new Response(null, { status: 404 });

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) return new Response(null, { status: 413 });
  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BYTES) return new Response(null, { status: 413 });

  const headers = new Headers();
  headers.set("content-type", request.headers.get("content-type") ?? "application/json");
  request.headers.forEach((value, key) => {
    if (key.toLowerCase().startsWith("x-") && key.toLowerCase() !== "x-forwarded-for") headers.set(key, value);
  });
  const xff = request.headers.get("x-forwarded-for");
  if (xff) headers.set("x-forwarded-for", xff);

  try {
    const res = await fetch(`${getEnv().apiInternalUrl}/api/v1/payments/webhooks/${provider}`, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    return new Response(await res.arrayBuffer(), {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ code: "UNREACHABLE" }), { status: 502, headers: { "content-type": "application/json" } });
  }
}
