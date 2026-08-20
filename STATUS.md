# Project Status — Co.meet Space
> Last updated: 2026-08-20

---

## Architecture overview

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | TanStack Start v1.168 (SSR React 19) + Tailwind 4 + Vite 8 | ✅ Running locally |
| Hosting | Firebase Hosting — site `commit-8da1d` | ⚠️ Not yet deployed |
| API | Cloud Functions v2 `api` (Express 4, Node 20, `europe-west1`) | ⚠️ Not yet deployed |
| Database | Firestore — project `commit-8da1d` | ✅ 6 courses seeded |
| Auth | Firebase Auth | ⚠️ Admin user not created yet |
| Firestore rules | `firestore.rules` — public read, auth-gated write | ⚠️ Written, **not deployed** |
| Images | Local static assets in `public/venue/` (9 `.webp` files) | ✅ Served by Vite |

---

## Pages

| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ Works | Hero, featured courses from Firestore, stats, steps, testimonials |
| `/formations` | ✅ Works | Full catalog, filter by category / level / mode |
| `/formations/$slug` | ✅ Works | Full course detail, sessions, trainer, pricing |
| `/a-propos` | ✅ Works | Auto-crossfade slideshow from local `public/venue/` assets, venue stats, values |
| `/contact` | ✅ Works | Contact form (local state only — no email backend), address, hours |
| `/admin` | ⚠️ Loads | Login UI works — fails because admin user not yet created |

---

## Coming Soon system

The site has a full pre-launch gate. Before `targetDate` (Africa/Tunis timezone), all routes
except `/admin` show the `ComingSoon` component instead of the real site.

| Part | File | Description |
|------|------|-------------|
| Gate logic | `src/routes/__root.tsx` | Root loader fetches settings from Firestore; `shouldShowComingSoon()` decides; polls every 3 s for live updates |
| Gate logic | `src/lib/settings-api.ts` | `shouldShowComingSoon()`, `getComingSoonSettings()`, `saveComingSoonSettings()`, `DEFAULT_SETTINGS` |
| UI | `src/components/site/ComingSoon.tsx` | Countdown timer, CTA button, brand logo, bilingual headline |
| Admin control | `src/routes/admin.tsx` — "Page d'attente" tab | Edit headline, date, CTA, forceState; live preview embedded |
| Seed script | `functions/scripts/seed-coming-soon.ts` | Seeds `settings/comingSoon` in Firestore |

### forceState values

| Value | Behaviour |
|-------|-----------|
| `auto` | Shows Coming Soon if `now < targetDate`, real site otherwise |
| `show` | Always shows Coming Soon regardless of date |
| `hide` | Always shows real site regardless of date |

Default `targetDate`: **2026-08-29T00:00:00** (Africa/Tunis = UTC+1)

---

## Known issues (must fix before production)

### 🔴 1 — Firestore rules not deployed

**Symptom:** SSR renders empty courses; client-side navigation throws "Something went wrong".

**Root cause:** `firestore.rules` has `allow read: if true` but has never been pushed to Firestore.
The live database still runs default rules that block unauthenticated reads.

**Fix:**
```
firebase deploy --only firestore:rules
```

This fixes all three symptoms at once:
- SSR Firestore reads returning empty on first load
- Client-side navigation crashing
- Admin dashboard failing to load courses

---

### 🔴 2 — Admin user does not exist in Firebase Auth

**Symptom:** Login always shows "Identifiants invalides" regardless of credentials.

**Root cause:** No user has been created in Firebase Auth for project `commit-8da1d`.
The creation script exists but could not run (outbound network blocked in the Kiro runner).

**Fix — run in your terminal:**
```
cd "c:\Users\User\Desktop\commit space 20\code\forge-fun-factory\functions"
node_modules\.bin\tsx.cmd scripts/create-admin-user.ts
```

Creates:
- Email: `admin@comeet.space`
- Password: `ComeetAdmin2026!`

Change the password after first login.

---

### 🔴 3 — `settings/comingSoon` document not seeded in Firestore

**Symptom:** Coming Soon gate falls back to `DEFAULT_SETTINGS` (hardcoded `targetDate: 2026-08-29`).
The admin "Page d'attente" tab loads defaults and any save will create the document, but it's
cleaner to seed it explicitly before deploying.

**Fix — run in your terminal:**
```
cd "c:\Users\User\Desktop\commit space 20\code\forge-fun-factory\functions"
node_modules\.bin\tsx.cmd scripts/seed-coming-soon.ts
```

Or just save from the admin dashboard after creating the admin user (step 2) — the `setDoc` write
creates the document if it doesn't exist.

---

### 🟡 4 — Contact form — EmailJS template not yet created

**Symptom:** Submitting the form will call EmailJS but fail until `VITE_EMAILJS_TEMPLATE_ID` is filled in.

**Root cause:** The EmailJS account and Gmail relay service (`service_bb3m7vm`) are ready, but the
email template hasn't been created in the EmailJS dashboard yet.

**Fix:**
1. Log in to [emailjs.com](https://www.emailjs.com) and create a new template.
2. Set **To Email** to `contact@comeetspace.com` (fixed recipient).
3. Set **Reply To** to `{{email}}` (the visitor's submitted address).
4. Use template variables: `{{name}}`, `{{email}}`, `{{message}}`, `{{company}}`, `{{course}}`.
5. Copy the template ID and paste it into `.env`:
   ```
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   ```

---

### 🟠 5 — `backend/` service account is placeholder

**Symptom:** `npm run dev` inside `backend/` uses in-memory course data instead of Firestore.

**Root cause:** `backend/.env` has placeholder values for `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`.

**Note:** Not a production blocker. The deployed Cloud Function (`functions/`) gets credentials
automatically from the runtime. `backend/` is local dev / unit tests only.

---

## What works today

| Item | Detail |
|------|--------|
| ✅ Firebase project linked | `commit-8da1d`, CLI authenticated as `ziedcherif.dev@gmail.com` |
| ✅ Firestore seeded | 6 courses with full data (sessions in Sfax) |
| ✅ Courses read via Firestore SDK | `src/lib/courses-api.ts` — isomorphic, works SSR + browser |
| ✅ Firebase client SDK | `src/lib/firebase.ts` exports `auth`, `db`, `app` |
| ✅ Firebase Auth wired | `src/lib/auth.ts` — `useAuth`, `signIn`, `logOut` |
| ✅ Admin login UI | `signInWithEmailAndPassword`, error display, loading state |
| ✅ Admin dashboard — Formations tab | CRUD via `setDoc` / `deleteDoc`, live course list, search, stats |
| ✅ Admin dashboard — Page d'attente tab | Edit Coming Soon content + forceState, live preview, save with `router.invalidate()` |
| ✅ Coming Soon gate | Root loader + `shouldShowComingSoon()`, 3 s live poll, admin bypass |
| ✅ Coming Soon UI | Countdown, bilingual headline, CTA button (tel/mailto/url), brand logo |
| ✅ Cloud Function builds | `functions/` — `tsc` clean, Express 4 wrapped in `onRequest` v2 |
| ✅ Venue gallery | 9 local `.webp` files in `public/venue/`, auto-crossfade slideshow with dots |
| ✅ All text = Sfax | Pages, meta, seed scripts, contact address, opening hours |
| ✅ Opening hours | Mon–Sat 8h–22h, Sun 8h–17h |
| ✅ Venue rooms | 3 salles · Bibliothèque · Salle de repos · Salle de jeux |
| ✅ Contact form — EmailJS wired | `@emailjs/browser` — sends to `contact@comeetspace.com`, reply-to = visitor; loading + error states |
| ✅ WhatsApp CTA in navbar | `https://wa.me/21622489100` — "Nous appeler" label, green button, desktop + mobile |
| ✅ Firestore rules file | Public read, auth-gated writes |
| ✅ TypeScript clean | `tsc --noEmit` passes with zero errors |

---

## Remaining tasks (in order)

| # | Task | Command / action |
|---|------|---------|
| 1 | Deploy Firestore rules | `firebase deploy --only firestore:rules` |
| 2 | Create admin user | Run `functions/scripts/create-admin-user.ts` |
| 3 | Seed `settings/comingSoon` | Run `functions/scripts/seed-coming-soon.ts` **or** save from admin dashboard |
| 4 | Create EmailJS template + fill `VITE_EMAILJS_TEMPLATE_ID` | EmailJS dashboard (see issue #4 above) |
| 5 | Set `forceState` to `hide` (or adjust `targetDate`) | Admin → Page d'attente tab |
| 6 | Deploy to production | `npm run deploy` |
| 7 | Wire contact form emails | ✅ Done via EmailJS — just needs the template ID |
| 8 | Download service account key | Firebase Console → Service accounts (optional) |

---

## Key files for AI context

| File | Purpose |
|------|---------|
| `src/routes/__root.tsx` | Root layout + Coming Soon gate + 3 s poll |
| `src/lib/settings-api.ts` | `ComingSoonSettings` type, `shouldShowComingSoon()`, Firestore read/write |
| `src/components/site/ComingSoon.tsx` | Coming Soon page component (countdown, CTA, preview) |
| `src/routes/admin.tsx` | Admin dashboard — `LoginScreen`, `Dashboard`, `FormationsTab`, `ComingSoonTab` |
| `src/routes/a-propos.tsx` | About page — `VenueSlideshow` with local `public/venue/` assets |
| `src/components/site/SiteChrome.tsx` | `Header` (nav + WhatsApp CTA), `Footer` |
| `src/lib/courses-api.ts` | `listCourses()` / `getCourse()` via Firestore client SDK (isomorphic) |
| `src/lib/firebase.ts` | Firebase app init — exports `auth`, `db`, `app` |
| `src/lib/auth.ts` | `useAuth` hook, `signIn`, `logOut` |
| `functions/scripts/seed-coming-soon.ts` | Seeds `settings/comingSoon` document |
| `functions/scripts/create-admin-user.ts` | Creates `admin@comeet.space` in Firebase Auth |
| `functions/scripts/seed-firestore.ts` | Seeds the `courses` collection |

---

## Local dev commands

```bash
# Start frontend only (Vite SSR dev server on :5173)
npm run dev

# Start Firebase emulators (Firestore :8080, Functions :5001, Hosting :5000, UI :4000)
npm run emulate

# Build Cloud Functions
npm run functions:build

# Re-seed Firestore courses (production)
cd functions && node_modules\.bin\tsx.cmd scripts/refresh-token.ts

# Seed coming-soon settings (production)
cd functions && node_modules\.bin\tsx.cmd scripts/seed-coming-soon.ts
```
