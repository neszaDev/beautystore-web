import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { StatePanel } from "@/components/state-panel";
import { CheckoutForm } from "@/features/checkout/checkout-form";
import { getQuote } from "@/features/checkout/actions";
import { getDictionary } from "@/i18n";
import { tryApi } from "@/lib/api";
import { localePath } from "@/lib/locale";
import { getAddresses, getShippingMethods } from "@/lib/queries";
import { pageMetadata, resolveLocale } from "@/lib/route";
import { getCurrentUser } from "@/lib/session";

export async function generateMetadata({ params }: PageProps<"/[locale]/checkout">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return pageMetadata({ locale, path: "/checkout", title: getDictionary(locale).checkout.title, noindex: true });
}

export default async function CheckoutPage({ params }: PageProps<"/[locale]/checkout">) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  const [methods, addresses] = await Promise.all([
    tryApi(() => getShippingMethods(locale)),
    user ? tryApi(() => getAddresses()) : Promise.resolve({ ok: true as const, data: [] }),
  ]);
  if (!methods.ok) {
    return (
      <Container>
        <StatePanel tone="error" title={t.errors.errorTitle}>
          <p>{t.errors.apiDown}</p>
          <Link href={localePath(locale, "/cart")} className="btn btn-ghost">{t.checkout.backToCart}</Link>
        </StatePanel>
      </Container>
    );
  }
  const first = methods.data[0];
  const quote = first ? await getQuote(first.code, locale) : null;
  return (
    <Container>
      <h1 className="mb-6 text-3xl">{t.checkout.title}</h1>
      <CheckoutForm
        methods={methods.data}
        initialQuote={quote && quote.ok ? quote.data : null}
        addresses={addresses.ok ? addresses.data : []}
        user={user}
        idempotencyKey={crypto.randomUUID()}
      />
    </Container>
  );
}
