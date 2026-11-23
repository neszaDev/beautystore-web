import { formatMoney } from "@/lib/money";
import type { Locale } from "@/lib/locale";
import { isOnSale } from "@/lib/variants";

export function Price({
  amount,
  compareAt,
  locale,
  prefix,
  className = "",
}: {
  amount: string;
  compareAt?: string | null;
  locale: Locale;
  prefix?: string;
  className?: string;
}) {
  const sale = isOnSale(amount, compareAt ?? null);
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      {prefix && <span className="text-sm text-ink-soft">{prefix}</span>}
      <span className={`font-semibold ${sale ? "text-cherry-deep" : ""}`}>{formatMoney(amount, locale)}</span>
      {sale && compareAt && (
        <s className="text-sm text-ink-soft">
          <span className="sr-only">{locale === "th" ? "ราคาเดิม " : "Was "}</span>
          {formatMoney(compareAt, locale)}
        </s>
      )}
    </span>
  );
}
