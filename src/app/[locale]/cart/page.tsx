import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CartPageView } from "@/features/cart/cart-page-view";
import { getDictionary } from "@/i18n";
import { pageMetadata, resolveLocale } from "@/lib/route";

export async function generateMetadata({ params }: PageProps<"/[locale]/cart">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({ locale, path: "/cart", title: getDictionary(locale).cart.title, noindex: true });
}

export default async function CartPage({ params }: PageProps<"/[locale]/cart">) {
  await resolveLocale(params);
  return (
    <Container>
      <CartPageView />
    </Container>
  );
}
