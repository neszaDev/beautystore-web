import { type NextRequest } from "next/server";
import { getEnv } from "@/lib/env";

/** GET /media/{key} -> API /api/v1/media/{key}. Streams image bytes; keeps the API's cache + nosniff headers. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/media/[...key]">) {
  const { key } = await ctx.params;
  if (key.some((s) => !s || s === "." || s === ".." || s.includes("\\"))) return new Response(null, { status: 404 });
  try {
    const res = await fetch(`${getEnv().apiInternalUrl}/api/v1/media/${key.map(encodeURIComponent).join("/")}`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok || !res.body) return new Response(null, { status: res.status === 404 ? 404 : 502 });
    return new Response(res.body, {
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/octet-stream",
        "cache-control": res.headers.get("cache-control") ?? "public, max-age=3600",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
