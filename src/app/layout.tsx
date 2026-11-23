import type { Metadata } from "next";
import { headers } from "next/headers";
import { Anuphan, Mitr } from "next/font/google";
import { getEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";
import { DEFAULT_LOCALE, isLocale } from "@/lib/locale";
import "./globals.css";

const display = Mitr({ weight: ["500", "600"], subsets: ["thai", "latin"], variable: "--font-mitr", display: "swap" });
const body = Anuphan({ weight: ["400", "500", "600"], subsets: ["thai", "latin"], variable: "--font-anuphan", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(getEnv().siteUrl),
    title: { default: BRAND.name, template: `%s | ${BRAND.name}` },
    applicationName: BRAND.name,
  };
}

/** Root layout is shared with /admin: html lang comes from the x-locale header set in proxy.ts. */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const h = await headers();
  const l = h.get("x-locale");
  const lang = isLocale(l) ? l : DEFAULT_LOCALE;
  return (
    <html lang={lang} className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
