import { CartDrawer } from "@/features/cart/cart-drawer";
import { getDictionary } from "@/i18n";
import { I18nProvider } from "@/components/i18n-provider";
import { ShopProvider } from "@/components/shop-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { api } from "@/lib/api";
import { getCart } from "@/lib/queries";
import { resolveLocale } from "@/lib/route";
import { getCurrentUser } from "@/lib/session";
import type { Cart, ProductCard } from "@/lib/types";

const EMPTY_CART: Cart = {
  token: null,
  currency: "THB",
  items: [],
  itemCount: 0,
  subtotal: "0.00",
  promotion: null,
  discountTotal: "0.00",
  estimatedTotal: "0.00",
  hasProblems: false,
};

async function orFallback<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback; // API down: the shell still renders; pages show their own error state
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const [cart, user] = await Promise.all([orFallback(getCart(locale), EMPTY_CART), getCurrentUser()]);
  const wishlist = user ? await orFallback(api<ProductCard[]>("/me/wishlist", { locale }), []) : [];

  return (
    <I18nProvider locale={locale} dict={t}>
      <ShopProvider cart={cart} user={user} wishlistIds={wishlist.map((p) => p.id)}>
        <SiteHeader />
        <main id="main" className="w-full flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} t={t} />
        <CartDrawer />
      </ShopProvider>
    </I18nProvider>
  );
}
