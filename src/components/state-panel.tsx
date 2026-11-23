import type { ReactNode } from "react";

/** Calm empty / error panel used for API-down, no results, empty cart... */
export function StatePanel({
  title,
  children,
  tone = "neutral",
}: {
  title: string;
  children?: ReactNode;
  tone?: "neutral" | "error";
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={`mx-auto my-10 max-w-xl border-2 border-ink p-6 text-center ${tone === "error" ? "bg-butter" : "bg-white"}`}
    >
      <h2 className="text-xl">{title}</h2>
      {children && <div className="mt-3 space-y-4 text-ink-soft">{children}</div>}
    </div>
  );
}
