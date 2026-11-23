import Link from "next/link";
import { Container } from "@/components/container";
import { StatePanel } from "@/components/state-panel";
import { getDictionary } from "@/i18n";
import { DEFAULT_LOCALE, isLocale, localePath } from "@/lib/locale";
import { headers } from "next/headers";

export default async function LocaleNotFound() {
  const l = (await headers()).get("x-locale");
  const locale = isLocale(l) ? l : DEFAULT_LOCALE;
  const t = getDictionary(locale);
  return (
    <Container>
      <StatePanel title={t.errors.notFoundTitle}>
        <p>{t.errors.notFoundText}</p>
        <Link href={localePath(locale)} className="btn btn-primary">{t.nav.home}</Link>
      </StatePanel>
    </Container>
  );
}
