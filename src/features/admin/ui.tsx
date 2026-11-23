"use client";

import { useEffect, useId, useRef, useState, useTransition, type InputHTMLAttributes, type ReactNode } from "react";
import type { ActionResult } from "@/lib/action";
import { adminError } from "./lib";
import { BTN_GHOST, BTN_PRIMARY, INPUT, LABEL } from "./styles";

/** Runs a Server Action in a transition and keeps its outcome as a message. */
export function useAct() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  function act<T>(fn: () => Promise<ActionResult<T>>, opts: { success?: string; onOk?: (d: T) => void } = {}) {
    setError(null); setDone(null); setFields({});
    start(async () => {
      const r = await fn();
      if (r.ok) { setDone(opts.success ?? "Saved."); opts.onOk?.(r.data); }
      else { setError(adminError(r.code, r.fieldErrors)); setFields(r.fieldErrors ?? {}); }
    });
  }
  return { pending, error, done, fields, act, fail: (m: string) => { setDone(null); setError(m); } };
}

export function Notice({ error, done }: { error?: string | null; done?: string | null }) {
  if (error) return <p role="alert" className="rounded-md border border-cherry-deep bg-[#fff4f6] px-3 py-2 text-sm text-cherry-deep">{error}</p>;
  if (done) return <p role="status" className="rounded-md border border-line bg-[#effaf4] px-3 py-2 text-sm">{done}</p>;
  return <div role="status" aria-live="polite" />;
}

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  label: string; value: string; onChange: (v: string) => void; hint?: string; error?: string;
};
export function Field({ label, value, onChange, hint, error, className, ...rest }: FieldProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className={LABEL}>{label}{rest.required && <span aria-hidden="true"> *</span>}</label>
      <input id={id} className={INPUT} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? `${id}-d` : undefined} {...rest} />
      {(hint || error) && <p id={`${id}-d`} className={`mt-1 text-xs ${error ? "text-cherry-deep" : "text-ink-soft"}`}>{error ?? hint}</p>}
    </div>
  );
}

export function TextArea({ label, value, onChange, rows = 3, ...rest }: { label: string; value: string; onChange: (v: string) => void; rows?: number; lang?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL}>{label}</label>
      <textarea id={id} rows={rows} className={INPUT} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </div>
  );
}

export function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL}>{label}</label>
      <select id={id} className={INPUT} value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
    </div>
  );
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold">
      <input type="checkbox" className="size-4 accent-cherry" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}
    </label>
  );
}

export function SubmitRow({ pending, label = "Save" }: { pending: boolean; label?: string }) {
  return <button type="submit" className={BTN_PRIMARY} disabled={pending}>{pending ? "Saving..." : label}</button>;
}

/** Native <dialog> modal: focus trapped by showModal(), Escape closes, content mounted only while open. */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby={titleId}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-lg border border-ink bg-white p-0 text-ink backdrop:bg-ink/50">
      {open && (
        <div className="space-y-3 p-5">
          <h2 id={titleId} className="text-lg">{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}

/** Button that opens a confirm dialog before running a destructive action. */
export function ConfirmButton({ label, title, children, confirmLabel, onConfirm, className = BTN_GHOST }: {
  label: string; title: string; children: ReactNode; confirmLabel: string; onConfirm: () => Promise<ActionResult<unknown>>; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { pending, error, act } = useAct();
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>{label}</button>
      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <div className="text-sm text-ink-soft">{children}</div>
        <Notice error={error} />
        <div className="flex justify-end gap-2">
          <button type="button" className={BTN_GHOST} onClick={() => setOpen(false)}>Keep</button>
          <button type="button" className={BTN_PRIMARY} disabled={pending} onClick={() => act(onConfirm, { onOk: () => setOpen(false) })}>
            {pending ? "Working..." : confirmLabel}
          </button>
        </div>
      </Modal>
    </>
  );
}
