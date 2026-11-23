import Link from "next/link";
import { Container } from "@/components/container";
import { getDictionary } from "@/i18n";
import { localePath } from "@/lib/locale";
import { resolveLocale } from "@/lib/route";
import { requireUser } from "@/lib/session";

export default async function AccountLayout({ children, params }: LayoutProps<"/[locale]/account">) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  await requireUser(locale, localePath(locale, "/account"));
  const tabs = [
    ["", t.account.profile],
    ["/addresses", t.account.addresses],
    ["/orders", t.account.orders],
    ["/wishlist", t.account.wishlist],
  ] as const;
  return (
    <Container>
      <h1 className="mb-4 text-3xl">{t.account.title}</h1>
      <nav aria-label={t.account.nav} className="mb-6 flex flex-wrap gap-2">
        {tabs.map(([path, label]) => (
          <Link key={path} href={localePath(locale, `/account${path}`)} className="btn btn-ghost">{label}</Link>
        ))}
      </nav>
      {children}
    </Container>
  );
}
