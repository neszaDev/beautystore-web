import type { ReactNode } from "react";

/** Die-cut starburst path (signature device #1: campaign / sale / sample stickers). */
function burstPath(points: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}
const PATH = burstPath(14, 49, 41);

export function Starburst({
  className = "",
  fill = "var(--color-butter)",
  children,
}: {
  className?: string;
  fill?: string;
  children?: ReactNode;
}) {
  return (
    <span className={`relative inline-grid place-items-center ${className}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 h-full w-full">
        <path d={PATH} fill={fill} stroke="var(--color-ink)" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      {children && <span className="label-type relative max-w-[72%] text-center leading-tight text-ink">{children}</span>}
    </span>
  );
}
