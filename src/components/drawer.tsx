"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useI18n } from "./i18n-provider";

/**
 * Accessible modal built on <dialog>.showModal(): focus moves in and is trapped, Escape closes,
 * focus returns to the invoking control, and the page behind is inert. Content is mounted only
 * while open so repeated server-rendered forms never duplicate ids.
 */
export function Drawer({
  open,
  onClose,
  title,
  side = "right",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "right" | "bottom" | "left";
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { t } = useI18n();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const pos =
    side === "bottom"
      ? "from-bottom mt-auto w-full max-h-[90dvh] rounded-t-2xl"
      : side === "left"
        ? "from-right h-dvh w-[min(22rem,100vw)] mr-auto"
        : "from-right h-dvh w-[min(26rem,100vw)] ml-auto";

  return (
    <dialog
      ref={ref}
      className={`sheet ${pos} overflow-y-auto`}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {open && (
        <div className="flex min-h-full flex-col p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id={titleId} className="text-xl">
              {title}
            </h2>
            <button type="button" className="btn btn-ghost !px-3" onClick={onClose} aria-label={t.common.close}>
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
