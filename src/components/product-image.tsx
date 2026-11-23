import Image from "next/image";
import { Starburst } from "./starburst";

/** Square product image (demo SVG packshots or /media/... proxied uploads). Placeholder when missing. */
export function ProductImage({
  src,
  alt,
  sizes = "(min-width:1024px) 25vw, 50vw",
  priority = false,
  className = "",
}: {
  src: string | null;
  alt: string | null;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div className={`grid aspect-square place-items-center bg-lilac ${className}`} role="img" aria-label={alt ?? ""}>
        <Starburst className="h-1/3 w-1/3" />
      </div>
    );
  }
  return (
    <div className={`relative aspect-square overflow-hidden bg-mint ${className}`}>
      <Image src={src} alt={alt ?? ""} fill sizes={sizes} unoptimized priority={priority} className="object-cover" />
    </div>
  );
}
