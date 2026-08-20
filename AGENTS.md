Keep the branch history stable and avoid force-pushing shared commits.

---

## Project — Co.meet Space

Training centre website built with TanStack Start (SSR React 19), Firebase, and Cloudinary.
Location: Sfax, Tunisia. Language: French.

---

## Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | TanStack Start v1.168 + React 19 + Tailwind 4 + Vite 8 | SSR, file-based routing |
| UI components | shadcn/ui (Radix UI) + Lucide icons | `src/components/ui/` |
| Hosting | Firebase Hosting — `commit-8da1d` | `dist/client` → `site: commit-8da1d` |
| API | Cloud Functions v2 `api` (Express 4, Node 20) | `functions/` — `europe-west1` |
| Database | Firestore | Public read, auth-gated write |
| Auth | Firebase Auth | Email/password — admin only |
| Images | Cloudinary — account `znl6toem`, folder `comeet` | 9 venue photos |

---

## Repository structure

```
/
├── src/
│   ├── routes/               # TanStack Start file-based routes
│   │   ├── __root.tsx        # Root layout — Header + Footer + QueryClient
│   │   ├── index.tsx         # Homepage — featured courses from Firestore
│   │   ├── formations.index.tsx  # Catalog with category/level/mode filters
│   │   ├── formations.$slug.tsx  # Course detail — objectives, syllabus, sessions
│   │   ├── a-propos.tsx      # About — dynamic Cloudinary gallery (Search API)
│   │   ├── contact.tsx       # Contact form + address + hours
│   │   └── admin.tsx         # Admin dashboard — Firebase Auth + Firestore CRUD
│   ├── components/
│   │   ├── site/
│   │   │   ├── SiteChrome.tsx    # Header (nav + phone CTA) + Footer
│   │   │   └── CourseCard.tsx    # Reusable course card
│   │   └── ui/               # shadcn/ui components
│   ├── lib/
│   │   ├── firebase.ts       # Firebase app init — exports auth, db, app
│   │   ├── auth.ts           # useAuth hook, signIn, logOut
│   │   ├── courses-api.ts    # listCourses / getCourse via Firestore SDK (isomorphic)
│   │   ├── cloudinary.ts     # cloudinaryImageUrl — URL builder with transforms
│   │   ├── cloudinary-admin.ts  # listFolderImages — Cloudinary Search API (SSR only)
│   │   ├── api.ts            # apiGet — HTTP client pointing at VITE_API_URL
│   │   └── env.ts            # frontendEnv — typed VITE_* env vars
│   └── data/
│       └── courses.ts        # Course/Session/Mode/Level types + formatDate/formatPrice
├── functions/                # Cloud Function (Express API)
│   ├── src/
│   │   ├── index.ts          # onRequest export — wraps Express app
│   │   ├── app.ts            # Express factory with CORS, helmet, morgan
│   │   ├── config/env.ts     # Zod env schema (no PORT in CF runtime)
│   │   ├── data/courses.ts   # BackendCourse type + seed data
│   │   ├── lib/course-repository.ts  # Firestore + in-memory repositories
│   │   └── routes/           # /api/health + /api/courses/:slug
│   └── scripts/
│       ├── refresh-token.ts  # Re-seed Firestore using CLI OAuth token
│       ├── seed-firestore.ts # One-time seed via firebase-admin
│       └── create-admin-user.ts  # Creates admin@comeet.space in Firebase Auth
├── backend/                  # Legacy Express server (local dev + unit tests only)
├── firebase.json             # Hosting + Functions + Firestore + Emulators config
├── .firebaserc               # Project alias: commit-8da1d
├── firestore.rules           # Public read, auth-gated write
├── firestore.indexes.json    # No composite indexes yet
├── STATUS.md                 # Current project state and known issues
└── AGENTS.md                 # This file
```

---

## Environment variables (`.env`)

```
# Firebase client SDK (browser + SSR)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=commit-8da1d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=commit-8da1d
VITE_FIREBASE_STORAGE_BUCKET=commit-8da1d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

# API base URL — points at Functions emulator in dev, empty in production
VITE_API_URL=http://localhost:5001/commit-8da1d/europe-west1/api

# Cloudinary — all three required for the /a-propos gallery loader
VITE_CLOUDINARY_CLOUD_NAME=znl6toem
VITE_CLOUDINARY_API_KEY=651327213585551
VITE_CLOUDINARY_API_SECRET=<secret>
```

**Important:** `VITE_CLOUDINARY_API_KEY` and `VITE_CLOUDINARY_API_SECRET` are
only used in `src/lib/cloudinary-admin.ts` which runs exclusively in SSR loaders.
They are technically exposed in the Vite build but never used client-side.
If this is a security concern, switch to a server-only env mechanism.

---

## Key data flows

### Course pages (SSR)
`route loader` → `listCourses()` / `getCourse()` in `courses-api.ts`
→ Firestore client SDK (`getDocs` / `getDoc`) → parses to `Course[]`

### Venue gallery (/a-propos)
`route loader` → `listFolderImages("comeet")` in `cloudinary-admin.ts`
→ Cloudinary Search API POST (`expression: "folder:comeet"`)
→ returns `CloudinaryImage[]` with `publicId` + `secure_url`
→ `cloudinaryImageUrl(publicId, {width,height,crop})` builds CDN URL

### Admin auth
`useAuth()` hook → `onAuthStateChanged(auth)` → renders `LoginScreen` or `Dashboard`
`signIn(email, password)` → `signInWithEmailAndPassword(auth, ...)`
`handleSaveCourse()` → `setDoc(doc(db, "courses", slug), data)`
`handleDeleteCourse(slug)` → `deleteDoc(doc(db, "courses", slug))`

### Production API (Cloud Function)
Browser `apiGet("/api/courses")` → Firebase Hosting rewrite → Cloud Function `api`
→ Express `/api/courses` route → `CourseRepository.listCourses()` → Firestore Admin SDK

---

## Local development

```bash
# Frontend only (most common — reads Firestore directly, no emulator needed)
npm run dev
# → http://localhost:5173

# With Firebase emulators (needed only to test the Cloud Function HTTP API)
npm run functions:build
npm run emulate
# Emulator UI: http://localhost:4000
# Functions:   http://localhost:5001
# Hosting:     http://localhost:5000
```

**Note:** The frontend reads Firestore directly via the Firebase client SDK in route
loaders. The Functions emulator is only needed if testing `/api/*` HTTP endpoints.
For normal development, `npm run dev` is sufficient.

---

## Deployment

```bash
# Full deploy (frontend build + hosting + functions + firestore rules)
npm run deploy

# Partial deploys
firebase deploy --only firestore:rules   # Push rules only
npm run deploy:functions                  # Functions only
npm run deploy:hosting                    # Frontend only
```

**Pending before first production deploy:**
1. `firebase deploy --only firestore:rules` — fixes permissions errors
2. Run `functions/scripts/create-admin-user.ts` — creates admin login
3. `npm run deploy` — ships everything

---

## Firestore schema — `courses` collection

Document ID = slug (e.g. `management-equipe-hybride`)

```ts
{
  slug: string
  title: string
  category: string                          // "Management" | "Communication" | "Numérique" | "Bureautique"
  level: "Débutant" | "Intermédiaire" | "Avancé"
  mode: "presentiel" | "hybride" | "en-ligne"
  price: number                             // EUR
  durationHours: number
  excerpt: string
  description: string
  objectives: string[]
  syllabus: { title: string; detail: string }[]
  trainer: { name: string; role: string; bio: string; initials: string }
  sessions: { start: string; end: string; city: string; seatsLeft: number }[]
  featured: boolean
}
```

---

## Centre info (Sfax)

- **Address:** Rte de Mahdia Km 5.5, 3011 Sfax
- **Phone:** +216 22 489 100
- **Email:** contact@comeetspace.com
- **Hours:** Lundi–Samedi 8h–22h · Dimanche 8h–17h
- **Rooms:** 3 salles de formation · Bibliothèque · Salle de repos · Salle de jeux
