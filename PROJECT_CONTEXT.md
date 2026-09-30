# Co.meet Space — Project Context

## 1. Project overview

Co.meet Space is a professional training-center website and admin platform for a formation business based in Sfax, Tunisia. The product combines a public-facing corporate site with an administrative dashboard for managing courses, sessions, site content, and business hours.

---

## 2. Technology stack

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | TanStack Start v1.168 + React 19 + Tailwind 4 + Vite 8 | SSR, file-based routing |
| UI components | shadcn/ui (Radix UI) + Lucide icons | `src/components/ui/` |
| Hosting | Firebase Hosting — `commit-8da1d` | Vercel also connected for CI/CD |
| Database | Firestore | Public read, auth-gated write |
| Auth | Firebase Auth | Email/password — admin only (`admin@comeet.space`) |
| Images | Static `.webp` files in `public/venue/` | 11 named photos |

---

## 3. Repository structure

```
/
├── src/
│   ├── routes/
│   │   ├── __root.tsx             # Root layout — Header + Footer + BusinessHoursContext
│   │   ├── index.tsx              # Homepage
│   │   ├── formations.index.tsx   # Catalog with filters
│   │   ├── formations.$slug.tsx   # Course detail page
│   │   ├── a-propos.tsx           # About page + VenueCarousel
│   │   ├── contact.tsx            # Contact form + address + hours
│   │   └── admin.tsx              # Admin dashboard (3 tabs)
│   ├── components/
│   │   ├── site/
│   │   │   ├── SiteChrome.tsx     # Header + Footer
│   │   │   ├── CourseCard.tsx     # Reusable course card (per-field visibility)
│   │   │   └── ComingSoon.tsx     # Coming-soon gate page
│   │   └── ui/                    # shadcn/ui components
│   ├── lib/
│   │   ├── firebase.ts            # Firebase app init
│   │   ├── auth.ts                # useAuth hook, signIn, logOut
│   │   ├── courses-api.ts         # listCourses / getCourse — Firestore SDK
│   │   ├── settings-api.ts        # comingSoon + businessHours Firestore settings
│   │   ├── venue-images.ts        # VENUE_IMAGES — shared photo list
│   │   ├── fade-in.tsx            # FadeIn / useFadeIn animation primitives
│   │   └── env.ts                 # frontendEnv — typed VITE_* vars
│   └── data/
│       └── courses.ts             # Course types + formatDate / formatPrice (TND)
├── functions/
│   ├── src/                       # Cloud Function (Express API)
│   └── scripts/
│       ├── seed-firestore.ts      # Seeds courses collection
│       ├── add-design-interieur.ts
│       └── create-admin-user.ts   # Creates admin@comeet.space in Firebase Auth
├── public/
│   ├── brand-logo.png
│   ├── footer-logo.png
│   ├── favicon.png
│   └── venue/                     # 11 real venue photos (.webp)
├── firebase.json
├── firestore.rules
├── .env                           # Local secrets (not committed)
├── AGENTS.md
├── CHANGELOG.md
└── PROJECT_CONTEXT.md             # This file
```

---

## 4. Environment variables (`.env`)

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=commit-8da1d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=commit-8da1d
VITE_FIREBASE_STORAGE_BUCKET=commit-8da1d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

VITE_API_URL=http://localhost:5001/commit-8da1d/europe-west1/api

VITE_EMAILJS_SERVICE_ID=service_bb3m7vm
VITE_EMAILJS_TEMPLATE_ID=template_f88tppx
VITE_EMAILJS_PUBLIC_KEY=H2Wj9cZD_jHFv1Dmq
```

---

## 5. Routes and status

| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ Working | Hero, featured courses, timeline carousel, journey steps, booking, map |
| `/formations` | ✅ Working | Catalog with category / level / mode filters |
| `/formations/$slug` | ✅ Working | Course detail — objectives, syllabus, sessions, trainer |
| `/a-propos` | ✅ Working | About page + VenueCarousel (manual + auto-advance) |
| `/contact` | ✅ Working | EmailJS form + sidebar with live business hours |
| `/admin` | ✅ Working | 3 tabs: Formations, Page d'attente, Horaires |

---

## 6. Key data flows

### Courses (SSR + client)
`listCourses()` in `courses-api.ts` → Firestore `courses` collection → `Course[]`

`parseCourse()` maps Firestore documents to the `Course` type, including `cardTextVisibility`.

### Business hours (live)
Root loader fetches `settings/businessHours` from Firestore in parallel with `settings/comingSoon`.
Exposed via `BusinessHoursContext` (React context) + `useBusinessHours()` hook.
All hardcoded hour strings on every page read from this context — no static strings.
Polled every 3s so admin changes appear without a page reload.

### Coming-soon gate
Root loader fetches `settings/comingSoon`. If `forceState === "show"` or current time < `targetDate`, the `<ComingSoon>` component replaces the entire site. Admin route is always exempt.

### Venue photos
`VENUE_IMAGES` in `src/lib/venue-images.ts` is the single source of truth for all photo lists.
Images are static `.webp` files in `public/venue/`. Labels show filenames without the `.webp` extension.
Used by: `/a-propos` carousel, homepage hero, homepage timeline steps.

---

## 7. Admin dashboard

Three tabs accessible at `/admin` after Firebase Auth login:

### Formations tab
Full CRUD for courses:
- Fields: title, category (dropdown), level, mode, price (TND), duration, excerpt, description, objectives, syllabus, trainer (name/role/bio/initials), sessions (add/remove rows with dates/city/seats), featured toggle
- Per-field card visibility: `cardTextVisibility` object controls which text elements show on the catalog card (badges, title, excerpt, meta, price, cta)
- Incomplete badge: courses missing price/duration/trainer/sessions show an orange "⚠ incomplet" badge

### Page d'attente tab
Controls the coming-soon gate:
- `forceState`: Auto / Forcer ON / Forcer OFF
- `targetDate`: date/time in Africa/Tunis timezone
- Headline (FR + EN), supporting line, CTA (type + label + value)
- Live scaled preview

### Horaires tab
Edits all business hours shown site-wide — stored in `settings/businessHours`:
- `tagline`: short string in hero + map section
- `weekdayLabel` / `weekdayHours` / `sundayLabel` / `sundayHours`: contact page table
- `weekdayHoursProse` / `sundayHoursProse`: long-form prose text
- `timelineHeading`: heading of the "Une journée au centre" section
- `timelineStep1`–`timelineStep4`: the 4 time labels (e.g. "8h 30min", "10h00")
- Live preview panel

---

## 8. Firestore schema

### `courses` collection — document ID = slug

```ts
{
  slug: string
  title: string
  category: string           // "Management" | "Communication" | "Numérique" | "Bureautique" | "Design"
  level: "Débutant" | "Intermédiaire" | "Avancé"
  mode: "presentiel" | "hybride" | "en-ligne"
  price: number              // TND
  durationHours: number
  excerpt: string            // shown on catalog card
  description: string        // shown on detail page only
  objectives: string[]
  syllabus: { title: string; detail: string }[]
  trainer: { name: string; role: string; bio: string; initials: string }
  sessions: { start: string; end: string; city: string; seatsLeft: number }[]
  featured?: boolean
  cardTextVisibility?: {
    badges?: boolean
    title?: boolean
    excerpt?: boolean
    meta?: boolean
    price?: boolean
    cta?: boolean
  }
}
```

### `settings/comingSoon` document

```ts
{
  targetDate: string         // ISO datetime — Africa/Tunis
  headlineFr: string
  headlineEn: string
  supportingLine: string
  ctaLabel: string
  ctaType: "tel" | "mailto" | "url"
  ctaValue: string
  forceState: "auto" | "show" | "hide"
  updatedAt: Timestamp
  updatedBy: string
}
```

### `settings/businessHours` document

```ts
{
  tagline: string              // "Lun–Sam 8h 30min–22h · Dim 8h 30min–17h"
  weekdayLabel: string
  weekdayHours: string
  sundayLabel: string
  sundayHours: string
  weekdayHoursProse: string
  sundayHoursProse: string
  timelineHeading: string
  timelineStep1: string        // "8h 30min"
  timelineStep2: string        // "10h00"
  timelineStep3: string        // "13h00"
  timelineStep4: string        // "19h00"
  updatedAt: Timestamp
  updatedBy: string
}
```

---

## 9. Centre info (Sfax)

- **Address:** Rte de Mahdia Km 5.5, 3011 Sfax
- **Phone:** +216 92 489 103
- **Email:** contact@comeetspace.com
- **Hours:** Lun–Sam 8h 30min–22h · Dim 8h 30min–17h
- **Admin login:** admin@comeet.space

---

## 10. Local development

```bash
npm run dev
# → http://localhost:5173
```

The frontend reads Firestore directly. The Functions emulator is only needed to test `/api/*` Cloud Function endpoints.

---

## 11. Deployment

```bash
npm run deploy          # Full deploy (hosting + functions + rules)
npm run deploy:hosting  # Frontend only
```

GitHub repo: https://github.com/smokem/comeet_center.git  
Vercel auto-deploys on push to `main`.

---

## 12. Known design decisions

- **Currency:** prices displayed in TND (`formatPrice` uses `Intl.NumberFormat fr-FR` + " TND")
- **Photos:** static `.webp` in `public/venue/`, named descriptively, captions = filename without extension
- **WhatsApp:** primary conversion channel — phone number in all CTAs, no digits shown on buttons (label: "Nous contacter" etc.)
- **Business hours:** fully Firestore-backed via `settings/businessHours`, editable from Admin → Horaires, defaults fallback so site never breaks if document missing
- **cardTextVisibility:** each field defaults to `true` when absent — existing courses unaffected unless explicitly toggled in admin
- **Group size:** 15 participants maximum (updated from 12)
- **Timeline section:** desktop = click-tabs (no scroll-scrub), mobile = swipe carousel with arrows + dot indicators
