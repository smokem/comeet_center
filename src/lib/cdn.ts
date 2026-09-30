/**
 * cdn.ts — Cloudinary URL helpers.
 *
 * Cloud name : jhaaukjn
 * URL pattern: https://res.cloudinary.com/jhaaukjn/image/upload/<transforms>/<publicId>
 *
 * No @cloudinary/react or @cloudinary/url-gen. Plain string composition only.
 * f_auto lets Cloudinary serve avif/webp/jpg depending on Accept header.
 * q_auto picks the best quality/size trade-off automatically.
 */

const CLOUD = "jhaaukjn";
const BASE  = `https://res.cloudinary.com/${CLOUD}/image/upload`;

/** Widths generated for srcset. */
export const CDN_WIDTHS = [480, 768, 1280] as const;
export type  CdnWidth   = (typeof CDN_WIDTHS)[number];

/**
 * Single Cloudinary URL at a given width.
 * f_auto,q_auto — let Cloudinary choose format and quality.
 */
export function cdn(publicId: string, width: CdnWidth): string {
  return `${BASE}/f_auto,q_auto,w_${width}/${publicId}`;
}

/**
 * Full srcset string for use in <img srcSet="...">.
 * Covers 480w, 768w and 1280w.
 */
export function cdnSrcSet(publicId: string): string {
  return CDN_WIDTHS.map((w) => `${cdn(publicId, w)} ${w}w`).join(", ");
}

/**
 * Tiny blurred placeholder URL (24 px wide, blur:800, quality 1).
 * Use as a CSS background-image while the real image loads.
 */
export function cdnBlur(publicId: string): string {
  return `${BASE}/f_auto,q_1,w_24,e_blur:800/${publicId}`;
}
