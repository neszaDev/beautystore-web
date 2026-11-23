import { BRAND } from "@/lib/brand";
import { Starburst } from "./starburst";

/** The only place the (provisional) brand is rendered as a logo. Replace when a logo is approved. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`label-type inline-flex items-center gap-1.5 text-2xl font-semibold tracking-tight ${className}`}>
      <Starburst className="h-6 w-6" fill="var(--color-strawberry)" />
      <span>{BRAND.name}</span>
    </span>
  );
}
