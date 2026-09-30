/**
 * <Img> — venue photo component used everywhere on the site.
 *
 * All images are served from Cloudinary (no local /venue/ paths).
 *
 * Features
 * --------
 * • srcSet via cdnSrcSet() — 480w / 768w / 1280w, f_auto q_auto
 * • Blurred placeholder background from cdnBlur() while the image loads
 * • priority=true  → loading="eager" fetchpriority="high" decoding="sync"  (hero)
 * • priority=false → loading="lazy"  decoding="async"                      (others)
 * • onError: fall back to the neutral SVG placeholder — never a broken icon
 * • Explicit width/height (aspect ratio) prevents CLS
 */
import { useCallback, useRef, useState } from "react";

import { cdn, cdnBlur, cdnSrcSet } from "@/lib/cdn";
import type { VenueImage } from "@/lib/venue-images";

/** Neutral inline SVG placeholder — shown if Cloudinary fails entirely. */
const PLACEHOLDER_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3Crect width='4' height='3' fill='%23d4dcd6'/%3E%3C/svg%3E";

export interface ImgProps {
  image: VenueImage;
  /** CSS sizes attribute. Provide a value matching the rendered layout. */
  sizes?: string;
  className?: string;
  /**
   * true  → eager + fetchpriority=high (hero / LCP image)
   * false → lazy + async               (default, everything else)
   */
  priority?: boolean;
  /** Override alt text (defaults to image.alt). */
  alt?: string;
  /** Optional click handler forwarded to the underlying <img>. */
  onClick?: React.MouseEventHandler<HTMLImageElement>;
}

export function Img({
  image,
  sizes = "100vw",
  className = "",
  priority = false,
  alt,
  onClick,
}: ImgProps) {
  const [loaded,   setLoaded]   = useState(false);
  // Track whether we've already retried to avoid loops.
  const retried                 = useRef(false);
  // current src — starts at the 1280-wide CDN URL; falls back to placeholder.
  const [src, setSrc]           = useState(() => cdn(image.publicId, 1280));

  // When the image prop changes (carousel advancing), reset state.
  const expectedSrc = cdn(image.publicId, 1280);
  if (src !== expectedSrc && src !== PLACEHOLDER_SRC) {
    retried.current = false;
    setSrc(expectedSrc);
    setLoaded(false);
  }

  const handleError = useCallback(() => {
    if (!retried.current) {
      // First failure: try the 480w variant (smaller, different CDN edge).
      retried.current = true;
      setSrc(cdn(image.publicId, 480));
    } else {
      // Second failure: neutral placeholder — never a broken icon.
      setSrc(PLACEHOLDER_SRC);
      setLoaded(true);
    }
  }, [image.publicId]);

  const isPlaceholder = src === PLACEHOLDER_SRC;

  // Blurred placeholder background via CSS — visible until the image paints.
  const blurBg = `url("${cdnBlur(image.publicId)}")`;

  return (
    <img
      src={src}
      srcSet={isPlaceholder ? undefined : cdnSrcSet(image.publicId)}
      sizes={isPlaceholder ? undefined : sizes}
      alt={alt ?? image.alt}
      width={image.width}
      height={image.height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      {...(priority ? { fetchPriority: "high" as "auto" } : {})}
      onLoad={() => setLoaded(true)}
      onError={handleError}
      onClick={onClick}
      className={className}
      style={{
        backgroundImage:    loaded || isPlaceholder ? "none" : blurBg,
        backgroundSize:     "cover",
        backgroundPosition: "center",
        transition:         "background-image 0.3s ease",
      }}
    />
  );
}
