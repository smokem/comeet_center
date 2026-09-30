Keep the branch history stable and avoid force-pushing shared commits.

---

## Project — Co.meet Space

Training centre website built with TanStack Start (SSR React 19), Firebase, and static venue photos.
Location: Sfax, Tunisia. Language: French.

---

## Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | TanStack Start v1.168 + React 19 + Tailwind 4 + Vite 8 | SSR, file-based routing |
| UI components | shadcn/ui (Radix UI) + Lucide icons | `src/components/ui/` |
| Hosting | Firebase Hosting — `commit-8da1d` | Vercel CI/CD on push to `main` |
| API | Cloud Functions v2 `api` (Express 4, Node 20) | `functions/` — `europe-west1` |
| Database | Firestore | Public read, auth-gated write |
| Auth | Firebase Auth | Email/password — admin only |
| Images | Static `.webp` in `public/venue/` | 11 real named venue photos |

---

## Repository structure

```
/
├── src/
│   ├── routes/
│   │   ├── __root.tsx             # Root layout — Header + Footer + BusinessHoursContext
│   │   ├── index.tsx              # Homepage
│   │   ├── formations.index.tsx   # Catalog with category/level/mode filters
│   │   ├── formations.$slug.tsx   # Course detail — objectives, syllabus, sessions
│   │   ├── a-propos.tsx           # About — VenueCarousel (manual + auto-advance)
│   │   ├── contact.tsx            # Contact form + address + live business hours
│   │   └── admin.tsx              # Admin dashboard — 3 tabs
│   ├── components/
│   │   ├── site/
│   │   │   ├── SiteChrome.tsx     # Header (nav + WhatsApp CTA) + Footer
│   │   │   ├── CourseCard.tsx     # Reusable course card with per-field visibility
│   │   │   └── ComingSoon.tsx     # Coming-soon gate component
│   │   └── ui/                    # shadcn/ui components
│   ├── lib/
│   │   ├── firebase.ts            # Firebase app init — exports auth, db, app
│   │   ├── auth.ts                # useAuth hook, signIn, logOut
│   │   ├── courses-api.ts         # listCourses / getCourse — Firestore SDK (isomorphic)
│   │   ├── settings-api.ts        # comingSoon + businessHours Firestore settings
│   │   ├── venue-images.ts        # VENUE_IMAGES — single source of truth for photos
│   │   ├── fade-in.tsx            # FadeIn / useFadeIn animation primitives
│   │   └── env.ts                 # frontendEnv — typed VITE_* env vars
│   └── data/
│       └── courses.ts             # Course/Session/Mode/Level types + formatDate/formatPrice
├── functions/
│   ├── src/                       # Cloud Function — Express API
│   └── scripts/
│       ├── seed-firestore.ts      # Seeds courses collection
│       ├── add-design-interieur.ts
│       └── create-admin-user.ts   # Creates admin@comeet.space in Firebase Auth
├── public/
│   └── venue/                     # 11 venue photos (.webp, named descriptively)
├── firebase.json
├── firestore.rules
├── AGENTS.md                      # This file
├── CHANGELOG.md
└── PROJECT_CONTEXT.md             # Full project context
```

---

## Environment variables (`.env`)

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

## Key data flows

### Courses (SSR + client)
`listCourses()` → Firestore `courses` collection → `parseCourse()` → `Course[]`
`parseCourse()` includes `cardTextVisibility` — controls which fields show on the card.

### Business hours (live, Firestore-backed)
Root loader fetches `settings/businessHours` → `BusinessHoursContext` → `useBusinessHours()` hook.
Used by: `index.tsx` (hero tagline, map section, timeline), `contact.tsx` (table + prose), `a-propos.tsx` (CTA).
Polled every 3s. Editable from Admin → Horaires tab.

### Coming-soon gate
Root loader fetches `settings/comingSoon`. Gate logic: `forceState` or `now < targetDate`.
Admin route always bypasses the gate.

### Venue photos
`VENUE_IMAGES` in `src/lib/venue-images.ts` = single source of truth.
Labels = filename without `.webp` extension.
Used by: `/a-propos` carousel, homepage hero (IMG_4061.webp), homepage timeline steps.

### Admin auth
`useAuth()` → `onAuthStateChanged` → `LoginScreen` or `Dashboard`
Course save: `setDoc(doc(db, "courses", slug), courseObject)` — full overwrite (no merge)
Hours save: `saveBusinessHours()` → `setDoc(doc(db, "settings", "businessHours"), ...)`

---

## Admin dashboard tabs

| Tab | What it edits |
|-----|---------------|
| Formations | Full course CRUD — all fields including trainer, sessions, cardTextVisibility |
| Page d'attente | Coming-soon gate content and forceState |
| Horaires | Business hours shown site-wide — tagline, table, prose, timeline times |

---

## Firestore schema — `courses` collection

Document ID = slug (e.g. `design-interieur`)

```ts
{
  slug: string
  title: string
  category: string           // "Management"|"Communication"|"Numérique"|"Bureautique"|"Design"
  level: "Débutant" | "Intermédiaire" | "Avancé"
  mode: "presentiel" | "hybride" | "en-ligne"
  price: number              // TND
  durationHours: number
  excerpt: string            // catalog card text
  description: string        // detail page only
  objectives: string[]
  syllabus: { title: string; detail: string }[]
  trainer: { name: string; role: string; bio: string; initials: string }
  sessions: { start: string; end: string; city: string; seatsLeft: number }[]
  featured?: boolean
  cardTextVisibility?: {     // all default true when absent
    badges?: boolean; title?: boolean; excerpt?: boolean
    meta?: boolean; price?: boolean; cta?: boolean
  }
}
```

## Firestore schema — `settings` collection

| Document | Purpose |
|----------|---------|
| `comingSoon` | Gate settings — targetDate, forceState, headline, CTA |
| `businessHours` | Hours strings shown on every page — tagline, table, prose, timeline times |

---

## Centre info (Sfax)

- **Address:** Rte de Mahdia Km 5.5, 3011 Sfax
- **Phone:** +216 92 489 103
- **Email:** contact@comeetspace.com
- **Hours:** Lun–Sam 8h 30min–22h · Dim 8h 30min–17h
- **Admin:** admin@comeet.space / ComeetAdmin2026!

---

## Local development

```bash
npm run dev   # → http://localhost:5173
```

Frontend reads Firestore directly. Functions emulator only needed for `/api/*` endpoints.

---

## Deployment

```bash
npm run deploy          # Full deploy
npm run deploy:hosting  # Frontend only
```

GitHub: https://github.com/smokem/comeet_center.git — Vercel auto-deploys on push to `main`.
