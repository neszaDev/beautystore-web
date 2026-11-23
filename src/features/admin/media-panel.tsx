"use client";

import { useRef } from "react";
import { deleteMedia, uploadMedia } from "./actions";
import { BTN_GHOST, CARD, INPUT, LABEL } from "./styles";
import { ConfirmButton, Notice, SubmitRow, useAct } from "./ui";

type M = { id: number; url: string; altTh: string | null; altEn: string | null; sortOrder: number };

export function MediaPanel({ productId, media }: { productId: number; media: M[] }) {
  const form = useRef<HTMLFormElement>(null);
  const { pending, error, done, act } = useAct();
  return (
    <section className={`${CARD} mt-6`} aria-labelledby="media-h">
      <h2 id="media-h" className="mb-3 text-lg">Images</h2>
      {media.length === 0 ? <p className="text-sm text-ink-soft">No images yet.</p> : (
        <ul className="mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {media.map((m) => (
            <li key={m.id} className="rounded-md border border-line p-2 text-xs">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of API-hosted media */}
              <img src={m.url} alt={m.altEn ?? m.altTh ?? ""} className="aspect-square w-full rounded object-cover" />
              <p className="mt-1">EN: {m.altEn ?? "—"}</p><p lang="th">TH: {m.altTh ?? "—"}</p><p>Order {m.sortOrder}</p>
              <ConfirmButton label="Delete" className={`${BTN_GHOST} mt-1`} title="Delete this image?" confirmLabel="Delete image" onConfirm={() => deleteMedia(productId, m.id)}>
                The image is removed from the product and cannot be restored.
              </ConfirmButton>
            </li>
          ))}
        </ul>
      )}
      <form ref={form} className="grid gap-3 sm:grid-cols-4" onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        act(() => uploadMedia(productId, fd), { success: "Image uploaded.", onOk: () => form.current?.reset() });
      }}>
        <div className="sm:col-span-4">
          <label htmlFor="file" className={LABEL}>Upload image (PNG, JPEG or WebP, max 5 MB)</label>
          <input id="file" name="file" type="file" accept="image/png,image/jpeg,image/webp" required className={INPUT} />
        </div>
        <div><label htmlFor="altTh" className={LABEL}>Alt text (TH)</label><input id="altTh" name="altTh" lang="th" className={INPUT} /></div>
        <div><label htmlFor="altEn" className={LABEL}>Alt text (EN)</label><input id="altEn" name="altEn" className={INPUT} /></div>
        <div><label htmlFor="sortOrder" className={LABEL}>Sort order</label><input id="sortOrder" name="sortOrder" inputMode="numeric" defaultValue={String(media.length)} className={INPUT} /></div>
        <div className="space-y-2 sm:col-span-4"><Notice error={error} done={done} /><SubmitRow pending={pending} label="Upload" /></div>
      </form>
    </section>
  );
}
