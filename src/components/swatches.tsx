import { safeHex } from "@/lib/variants";

/** Shade dots (signature device #2), always the real variant swatch colours. */
export function SwatchDots({ colors, size = 14 }: { colors: string[]; size?: number }) {
  const valid = colors.map(safeHex).filter((c): c is string => Boolean(c));
  if (!valid.length) return null;
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      {valid.map((c, i) => (
        <span
          key={`${c}-${i}`}
          className="inline-block rounded-full border border-ink"
          style={{ width: size, height: size, backgroundColor: c }}
        />
      ))}
    </span>
  );
}
