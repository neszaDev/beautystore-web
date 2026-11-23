import type { Metadata } from "next";
import Link from "next/link";
import { StatePanel } from "@/components/state-panel";
import { ProductCard } from "@/features/catalog/product-card";
import { getDictionary } from "@/i18n";
import { api, tryApi } from "@/lib/api";
import { localePath } from "@/lib/locale";
import { pageMetadata, resolveLocale } from "@/lib/route";
import { requireUser } from "@/lib/session";
import type { ProductCard as Card } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/wishlist">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({ locale, path: "/account/wishlist", title: getDictionary(locale).account.wishlist, noindex: true });
}

export default async function WishlistPage({ params }: PageProps<"/[locale]/account/wishlist">) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  await requireUser(locale, localePath(locale, "/account/wishlist"));
  const res = await tryApi(() => api<Card[]>("/me/wishlist", { locale }));
  if (!res.ok) return <StatePanel tone="error" title={t.errors.errorTitle}><p>{t.errors.apiDown}</p></StatePanel>;
  if (res.data.length === 0) {
    return (
      <StatePanel title={t.account.noWishlist}>
        <Link href={localePath(locale, "/products")} className="btn btn-primary">{t.cart.continueShopping}</Link>
      </StatePanel>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
      {res.data.map((p) => <li key={p.id}><ProductCard product={p} locale={locale} t={t} /></li>)}
    </ul>
  );
}
