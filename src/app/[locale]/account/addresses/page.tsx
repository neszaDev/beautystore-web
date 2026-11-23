import type { Metadata } from "next";
import { StatePanel } from "@/components/state-panel";
import { AddressManager } from "@/features/account/address-manager";
import { getDictionary } from "@/i18n";
import { tryApi } from "@/lib/api";
import { localePath } from "@/lib/locale";
import { getAddresses } from "@/lib/queries";
import { pageMetadata, resolveLocale } from "@/lib/route";
import { requireUser } from "@/lib/session";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/addresses">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({ locale, path: "/account/addresses", title: getDictionary(locale).account.addresses, noindex: true });
}

export default async function AddressesPage({ params }: PageProps<"/[locale]/account/addresses">) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  await requireUser(locale, localePath(locale, "/account/addresses"));
  const res = await tryApi(() => getAddresses());
  if (!res.ok) return <StatePanel tone="error" title={t.errors.errorTitle}><p>{t.errors.apiDown}</p></StatePanel>;
  return (
    <>
      <h2 className="mb-4 text-2xl">{t.account.addresses}</h2>
      <AddressManager addresses={res.data} />
    </>
  );
}
