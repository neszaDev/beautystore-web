import type { Metadata } from "next";
import { ProfileForms } from "@/features/account/profile-forms";
import { getDictionary } from "@/i18n";
import { localePath } from "@/lib/locale";
import { pageMetadata, resolveLocale } from "@/lib/route";
import { requireUser } from "@/lib/session";

export async function generateMetadata({ params }: PageProps<"/[locale]/account">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({ locale, path: "/account", title: getDictionary(locale).account.title, noindex: true });
}

export default async function AccountPage({ params }: PageProps<"/[locale]/account">) {
  const locale = await resolveLocale(params);
  const user = await requireUser(locale, localePath(locale, "/account"));
  return <ProfileForms user={user} />;
}
