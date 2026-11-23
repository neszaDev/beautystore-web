import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/auth-forms";
import { getDictionary } from "@/i18n";
import { pageMetadata, resolveLocale } from "@/lib/route";
import { safeNext } from "@/lib/session";
import { flattenSearchParams } from "@/lib/url";

export async function generateMetadata({ params }: PageProps<"/[locale]/register">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({ locale, path: "/register", title: getDictionary(locale).auth.registerTitle, noindex: true });
}

export default async function Page({ params, searchParams }: PageProps<"/[locale]/register">) {
  await resolveLocale(params);
  const sp = flattenSearchParams(await searchParams);
  return <RegisterForm next={safeNext(sp.next, "") || undefined} />;
}
