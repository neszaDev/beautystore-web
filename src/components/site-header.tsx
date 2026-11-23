"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BagIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";
import { Drawer } from "./drawer";
import { useI18n } from "./i18n-provider";
import { LanguageSwitch } from "./language-switch";
import { useShop } from "./shop-provider";
import { Wordmark } from "./wordmark";
import { localePath } from "@/lib/locale";

function SearchForm({ autoFocus = false, className = "" }: { autoFocus?: boolean; className?: string }) {
  const { locale, t } = useI18n();
  return (
    <form action={localePath(locale, "/products")} method="get" role="search" className={`flex gap-2 ${className}`}>
      <label className="sr-only" htmlFor={`q-${autoFocus ? "m" : "d"}`}>
        {t.nav.search}
      </label>
      <input
        id={`q-${autoFocus ? "m" : "d"}`}
        name="q"
        type="search"
        autoFocus={autoFocus}
        placeholder={t.nav.searchPlaceholder}
        className="field min-w-0 flex-1"
      />
      <button type="submit" className="btn btn-ink !px-3" aria-label={t.nav.search}>
        <SearchIcon />
      </button>
    </form>
  );
}

export function SiteHeader() {
  const { locale, t, f } = useI18n();
  const { cart, user, openCart } = useShop();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenu(false);
    setSearch(false);
  }

  const links = [
    { href: localePath(locale, "/products"), label: t.nav.all },
    { href: localePath(locale, "/c/lips"), label: t.nav.lips },
    { href: localePath(locale, "/c/cheeks"), label: t.nav.cheeks },
    { href: `${localePath(locale, "/products")}?kind=SKINCARE`, label: t.nav.skincare },
  ];
  const iconBtn =
    "relative inline-flex h-11 min-w-11 items-center justify-center rounded-full hover:bg-ink hover:text-cream";

  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-cream">
      <a href="#main" className="sr-only-focusable btn btn-ink absolute left-2 top-2 z-50">
        {t.common.skipToContent}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-1 px-4 sm:gap-3">
        <button type="button" className={`${iconBtn} lg:hidden`} aria-label={t.nav.menu} onClick={() => setMenu(true)}>
          <MenuIcon />
        </button>
        <Link href={localePath(locale)} aria-label={t.common.brandAlt} className="mr-auto lg:mr-6">
          <Wordmark />
        </Link>
        <nav aria-label={t.nav.primary} className="mr-auto hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3 py-2 font-semibold hover:bg-ink hover:text-cream">
              {l.label}
            </Link>
          ))}
        </nav>
        <SearchForm className="hidden w-64 xl:flex" />
        <button type="button" className={`${iconBtn} xl:hidden`} aria-label={t.nav.search} onClick={() => setSearch(true)}>
          <SearchIcon />
        </button>
        <Link
          href={user ? localePath(locale, "/account") : localePath(locale, "/login")}
          className={iconBtn}
          aria-label={user ? t.nav.account : t.nav.signIn}
          data-testid="account-link"
        >
          <UserIcon />
        </Link>
        {user && (
          <Link href={localePath(locale, "/account/wishlist")} className={`${iconBtn} hidden sm:inline-flex`} aria-label={t.nav.wishlist}>
            <HeartIcon />
          </Link>
        )}
        <button
          type="button"
          className={iconBtn}
          onClick={openCart}
          aria-label={f(t.nav.bagWithCount, { n: cart.itemCount })}
          aria-haspopup="dialog"
          data-testid="bag-button"
        >
          <BagIcon />
          {cart.itemCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-strawberry px-1 text-xs font-bold text-ink"
            >
              {cart.itemCount}
            </span>
          )}
        </button>
        <div className="hidden sm:block">
          <LanguageSwitch />
        </div>
      </div>

      <Drawer open={menu} onClose={() => setMenu(false)} title={t.nav.menu} side="left">
        <nav aria-label={t.nav.primary} className="flex flex-col">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="label-type border-b border-line py-3 text-xl">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 flex flex-col gap-3">
          <Link href={user ? localePath(locale, "/account") : localePath(locale, "/login")} className="btn btn-ghost">
            {user ? t.nav.account : t.nav.signIn}
          </Link>
          <LanguageSwitch />
        </div>
      </Drawer>
      <Drawer open={search} onClose={() => setSearch(false)} title={t.nav.search} side="bottom">
        <SearchForm autoFocus />
      </Drawer>
    </header>
  );
}
