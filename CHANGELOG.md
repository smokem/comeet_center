# Changelog

## 2026-09-27

### Step 1 — Venue photos on Accueil and Formations

**New file:** `src/lib/venue-images.ts`
Single source of truth for all venue photos. Previously the image list was hardcoded inside `a-propos.tsx` only. Now all three pages import from this shared module — update it once and all pages reflect the change.

**Modified:** `src/routes/a-propos.tsx`
Removed local `VENUE_IMAGES` array and `VenueImage` type. Now imports from `src/lib/venue-images.ts`.

**Modified:** `src/routes/index.tsx`
Added a compact 6-photo grid after the "Formations à la une" section. Heading: "Un lieu conçu pour apprendre" with a link to `/a-propos`.

**Modified:** `src/routes/formations.index.tsx`
Added the same 6-photo grid in a tinted section at the bottom of the catalog page. Heading: "Apprenez dans un espace fait pour ça".

---

### Step 2 — Currency changed from EUR to TND

**Modified:** `src/data/courses.ts`
`formatPrice()` no longer uses `Intl.NumberFormat` with `currency: "EUR"`. It now formats the number in French locale and appends `" TND"`. Example output: `490 TND`.

All price display locations that call `formatPrice()` update automatically:
- Course cards (`src/components/site/CourseCard.tsx`)
- Course detail page (`src/routes/formations.$slug.tsx`)

**Modified:** `src/routes/admin.tsx`
Three raw `€` occurrences updated to `TND`:
- "Prix moyen" stat card value
- Price input field label: `Prix (€)` → `Prix (TND)`
- Course list item subtitle: `{course.price} €` → `{course.price} TND`

> ⚠️ **Action required:** Existing course prices stored in Firestore were entered as EUR amounts. The symbol now reads TND but the numbers are unchanged. Re-enter correct TND prices for each course in the admin panel.

---

### Step 3 — Removed "Ce qu'ils en disent" testimonials section

**Modified:** `src/routes/index.tsx`
Removed the testimonial marquee section entirely:
- `testimonials` data array deleted
- `TestimonialMarquee` component function deleted
- `Star` icon import removed from lucide-react
- `<section>` block with "Ce qu'ils en disent" label removed
- `@keyframes marquee` and related `<style>` block removed

---

### Step 4 — Replaced "Prêt à commencer ?" CTA with Google Maps embed

**Modified:** `src/routes/index.tsx`
The final `bg-primary` section no longer shows the phone/WhatsApp CTA. It now shows:
- Heading: "Co.meet Space, Sfax."
- Address and hours line
- Responsive Google Maps iframe of the centre location

Map embed URL points to **CoMeetSpace** at Rte de Mahdia Km 5.5, 3011 Sfax.

Implementation details:
- Wrapper uses `aspect-ratio: 4/3` with `maxHeight: 480px` and `width: 100%` — scales correctly on mobile without overflow
- `title="Localisation Co.meet Space"` for accessibility
- `loading="lazy"` and `referrerPolicy="no-referrer-when-downgrade"` preserved from the original embed code
