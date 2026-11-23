"use client";

import { Container } from "@/components/container";
import { StatePanel } from "@/components/state-panel";
import { useI18n } from "@/components/i18n-provider";

export default function LocaleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  return (
    <Container>
      <StatePanel tone="error" title={t.errors.errorTitle}>
        <p>{t.errors.generic}</p>
        <button type="button" className="btn btn-primary" onClick={reset}>{t.common.tryAgain}</button>
      </StatePanel>
    </Container>
  );
}
