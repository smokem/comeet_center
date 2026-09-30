# What Changed — Co.meet Space

Summary of all new features, migrations, and cleanups applied to the project.

---

## New Files Added

### `src/lib/cdn.ts`
Cloudinary URL helper — plain string composition, no SDK.  
Exports:
- `cdn(publicId, width)` — single URL at 480 / 768 / 1280 px
- `cdnSrcSet(publicId)` — full `srcset` string covering all three widths
- `cdnBlur(publicId)` — tiny 24 px blurred placeholder URL for CSS background

Cloud name: `jhaaukjn`. All image transforms use `f_auto,q_auto` (format and quality negotiated by Cloudinary).

---

### `src/components/site/Img.tsx`
Smart venue-photo component. Replaces all raw `<img src="/venue/...">` tags across the site.

Features:
- `srcSet` + `sizes` via `cdnSrcSet()` — responsive images at 480 / 768 / 1280 w
- Blurred CSS background placeholder from `cdnBlur()` while the real image loads
- `priority` prop — `true` sets `loading="eager" fetchpriority="high" decoding="sync"` for the LCP hero; default is lazy
- Two-step `onError` fallback: tries 480 w first, then a neutral inline SVG — never a broken icon
- Explicit `width` / `height` from `VenueImage` prevent CLS
- `onClick` forwarded to the underlying `<img>` for lightbox triggers

---

### `src/components/ui/feature-carousel.tsx`
3D fan carousel used on `/a-propos`.

Features:
- Perspective CSS transforms: center card full size, adjacent cards scaled to 0.85 and blurred, rest hidden
- Auto-advances every 4 s
- Click center card → opens `ImageGallery` lightbox at current index
- Click adjacent card → jumps to that slide
- Prev / Next icon buttons with `stopPropagation`

---

### `src/components/ui/image-gallery.tsx`
Accordion-style horizontal lightbox.  
Used by `feature-carousel.tsx` (a-propos) and `index.tsx` (timeline section click-to-expand).

---

### `scripts/check-cdn.mjs`
Dev utility — validates that all 11 Cloudinary images resolve (3 widths + blur per image = 44 requests).  
Run with: `npm run check:cdn`

---

## Migrations

### Venue images → Cloudinary
`src/lib/venue-images.ts` was migrated from local `/venue/*.webp` paths to Cloudinary `publicId` strings.

`VenueImage` type changed:
```ts
// Before
{ src: string; label: string }

// After
{ publicId: string; label: string; alt: string; width: number; height: number }
```

All 11 images now have descriptive `alt` text and intrinsic dimensions for CLS prevention.  
Added `venueImageById(publicId)` lookup helper.

---

### Homepage timeline (`src/routes/index.tsx`)
- Replaced raw `<img src="/venue/...">` with `<Img>` component
- Added `ImageGallery` lightbox — clicking the photo panel opens a full gallery
- Desktop: tab-based layout; mobile: swipe carousel
- Timeline times sourced from `BusinessHoursSettings` (Firestore-backed, editable in Admin)
- Hero image preloaded via `<link rel="preload">` pointing to Cloudinary

---

### Root layout (`src/routes/__root.tsx`)
- Replaced 3 s polling interval with focus / `visibilitychange` event-driven refetch with a 60 s cooldown
- Adds `<link rel="preload">` for the hero LCP image (Cloudinary 1280 w URL)

---

### `Img.tsx` — `onClick` prop
Added `onClick?: React.MouseEventHandler<HTMLImageElement>` to `ImgProps` and forwarded it to the underlying `<img>` tag, fixing a TypeScript error when passing a click handler on the timeline photo panel.

---

## Files Removed

| File | Reason |
|------|--------|
| `src/lib/api.ts` | Never imported — `getApiUrl` / `apiGet` replaced by direct Firestore SDK reads |
| `src/assets/hero-formation.jpg` | Orphaned local hero image, replaced by Cloudinary `accueil-du-centre` |
| `src/hooks/use-mobile.tsx` | Only used by `sidebar.tsx`, which itself is unused in the app |
| `scripts/check-images.mjs` | Stale — parsed a `src:` field that no longer exists after the Cloudinary migration |
| `scripts/generate-webp-variants.ts` | Superseded by Cloudinary CDN transforms (`w_480`, `w_768`, `w_1280`) |
| Root junk files: `14)`, `bytes`, `TND`, `console.log(x.f`, `f.endsWith('.webp'))` | Terminal paste artifacts |
| `qssets/` directory | Stray typo directory |
| `bunfig.toml` | Bun config file — project uses npm |
| `_cloudinary_list.bat` | One-off batch runner, no longer needed |
| `_seed.bat` | One-off batch runner, no longer needed |

---

## Dependencies Removed

| Package | Reason |
|---------|--------|
| `@cloudinary/react` | Never imported — `cdn.ts` uses plain string composition instead |
| `@cloudinary/url-gen` | Same — no SDK used anywhere in `src/` |

---

## npm Scripts Removed

| Script | Reason |
|--------|--------|
| `check:images` | Ran the now-deleted `scripts/check-images.mjs` |
