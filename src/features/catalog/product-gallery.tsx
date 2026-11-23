"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ProductImage } from "@/components/product-image";

export function ProductGallery({ media, name }: { media: { url: string; alt: string | null }[]; name: string }) {
  const { t, f } = useI18n();
  const [i, setI] = useState(0);
  const current = media[i];
  return (
    <div role="group" aria-label={t.product.gallery} className="space-y-3">
      <ProductImage src={current?.url ?? null} alt={current?.alt ?? name} sizes="(min-width:1024px) 50vw, 100vw" priority />
      {media.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {media.map((m, idx) => (
            <li key={m.url}>
              <button
                type="button"
                onClick={() => setI(idx)}
                aria-label={f(t.product.showImage, { n: idx + 1 })}
                aria-current={idx === i}
                className={`block w-full border-2 ${idx === i ? "border-cherry" : "border-ink"}`}
              >
                <ProductImage src={m.url} alt="" sizes="96px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
