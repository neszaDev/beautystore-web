import type { Metadata } from "next";
import { ForgotForm } from "@/features/auth/auth-forms";
import { getDictionary } from "@/i18n";
import { pageMetadata, resolveLocale } from "@/lib/route";

export async function generateMetadata({ params }: PageProps<"/[locale]/forgot-password">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({ locale, path: "/forgot-password", title: getDictionary(locale).auth.forgotTitle, noindex: true });
}

export default async function Page({ params }: PageProps<"/[locale]/forgot-password">) {
  await resolveLocale(params);
  return <ForgotForm />;
}
