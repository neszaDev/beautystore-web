import type { Metadata } from "next";
import { ResetForm } from "@/features/auth/auth-forms";
import { getDictionary } from "@/i18n";
import { pageMetadata, resolveLocale } from "@/lib/route";
import { flattenSearchParams } from "@/lib/url";

export async function generateMetadata({ params }: PageProps<"/[locale]/reset-password">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({ locale, path: "/reset-password", title: getDictionary(locale).auth.resetTitle, noindex: true });
}

export default async function Page({ params, searchParams }: PageProps<"/[locale]/reset-password">) {
  await resolveLocale(params);
  const sp = flattenSearchParams(await searchParams);
  return <ResetForm token={sp.token} />;
}
