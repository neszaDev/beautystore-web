import type { MetadataRoute } from "next";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const site = getEnv().siteUrl;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/checkout", "/api", "/th/account", "/en/account", "/th/checkout", "/en/checkout"] }],
    sitemap: `${site}/sitemap.xml`,
  };
}
