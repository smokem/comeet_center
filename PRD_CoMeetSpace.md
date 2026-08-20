# Product Requirements Document — Co.meet Space

**Type:** Centre de Formation (Training Center) Platform with Admin Space
**Version:** 1.0 (Draft)
**Date:** July 31, 2026

---

## 1. Overview

Co.meet Space is a web platform for a training center (*centre de formation*) that lets the organization publish and manage courses/sessions, handle enrollments, and run day-to-day operations through a dedicated admin space — while giving trainers and learners their own dashboards. The platform is enhanced with a small set of AI features powered by OpenRouter (model: `openai/gpt-4o-mini`) to reduce manual admin/trainer workload.

### 1.1 Goals
- Give the center a professional public-facing site to showcase and sell courses/sessions.
- Give admins full control over courses, users, sessions, and content — no code changes needed for daily operations.
- Give trainers a simple space to manage their sessions, attendance, and materials.
- Give learners a self-service space to browse, enroll, track progress, and download certificates.
- Use AI to cut down repetitive content-creation and support work (course descriptions, FAQs, quiz drafts).
- Ship a clean, maintainable, well-separated codebase (`/front`, `/backend`) deployable independently.

### 1.2 Out of Scope (v1)
- Native mobile apps.
- Live video conferencing / virtual classroom (sessions are assumed in-person or hybrid, with links to an external tool like Zoom/Meet if needed).
- Full LMS features like SCORM packages, adaptive learning paths.

---

## 2. Target Users / Roles

| Role | Description |
|---|---|
| **Super Admin** | Full access — manages users, roles, courses, payments, site content, AI settings. |
| **Admin / Staff** | Manages courses, sessions, enrollments, and learners day-to-day. |
| **Trainer (Formateur)** | Manages own sessions, marks attendance, uploads materials, grades. |
| **Learner (Apprenant)** | Browses catalog, enrolls, tracks progress, downloads certificates. |
| **Guest (visitor)** | Browses public site, contacts, sees course catalog without login. |

---

## 3. Functional Requirements

### 3.1 Public Website
- Home page (hero, value proposition, featured courses, testimonials, CTA) — styled per DESIGN.md.
- Course catalog with filters (category, level, format: in-person/online/hybrid, price, dates).
- Course detail page (description, syllabus, trainer bio, schedule, price, "Enroll" CTA).
- About / Contact page with a contact form.
- Blog / News (optional, phase 2) for SEO and community content.
- Multi-language ready (FR default, EN secondary) via i18n library.

### 3.2 Authentication & Accounts
- Email/password signup + login (JWT access token + refresh token).
- Role-based access control (RBAC): super_admin, admin, trainer, learner.
- Email verification and password reset flows.
- Optional: Google OAuth login for learners.

### 3.3 Course & Session Management (Admin/Trainer)
- CRUD for Courses (title, description, category, level, price, cover image, syllabus).
- CRUD for Sessions per course (start/end date, capacity, location or online link, assigned trainer, status: draft/published/full/completed/cancelled).
- Category & tag management.
- Trainer assignment per session.
- Attendance tracking per session (present/absent/late) — trainer or admin marks it.
- Materials upload per session (PDF, slides, links) stored via cloud storage.

### 3.4 Enrollment & Learner Journey
- Learner enrolls in a session (subject to capacity).
- Enrollment status: pending, confirmed, waitlisted, cancelled, completed.
- Optional payment step (Stripe integration — can be phased in; manual/offline payment marking supported from day one for admin).
- Automatic email confirmations (enrollment confirmed, reminder before session, certificate ready).
- Certificate generation (PDF) on session completion, downloadable from learner dashboard.
- Learner dashboard: "My Courses", progress/attendance history, certificates, invoices.

### 3.5 Admin Dashboard
- Overview stats: active learners, upcoming sessions, revenue (if payments enabled), enrollment trends.
- User management (create/edit/deactivate accounts, assign roles).
- Course/session management (see 3.3).
- Enrollment management (approve waitlist, cancel, refund flag).
- Content management for public pages (hero text, featured courses, testimonials) — a lightweight CMS-style panel so non-devs can edit copy without a deploy.
- Basic reporting/export (CSV) of learners, enrollments, attendance.
- AI settings panel (enable/disable AI features, view usage/costs if tracked).

### 3.6 Trainer Dashboard
- List of assigned sessions (upcoming/past).
- Attendance marking per session.
- Upload/manage session materials.
- View enrolled learners per session (contact info, notes).

### 3.7 AI Features (via OpenRouter, `openai/gpt-4o-mini`)
All AI calls are proxied server-side (backend) — the OpenRouter API key never touches the frontend.

1. **AI Course Description Assistant** (Admin/Trainer tool)
   Given a short input (title, topics, target audience), generates a draft course description, learning objectives, and syllabus outline. Editable before publishing.

2. **AI Support Chatbot** (Public site)
   A chat widget for visitors that answers FAQs about courses, schedules, pricing, and enrollment process, grounded in the current course catalog (fetched from the DB and passed as context — not hallucinated). Escalates to a "contact us" form if it can't answer.

3. **AI Quiz/Exercise Generator** (Trainer tool)
   From a session's materials or a topic prompt, generates a draft quiz (MCQ/short answer) that the trainer can review, edit, and attach to the session.

4. **AI Content Summarizer** (Trainer/Learner tool, optional phase 2)
   Summarizes uploaded session materials (PDF/text) into key bullet points for learners to review before/after a session.

> All AI outputs are treated as **drafts requiring human review** before being published or sent to learners — no AI output goes live automatically.

### 3.8 Notifications
- Transactional emails: welcome, verification, enrollment confirmation, session reminder (24h before), certificate ready, password reset.
- Provider-agnostic email service (e.g., Resend or SendGrid) via a single backend service module.

---

## 4. Non-Functional Requirements

- **Performance:** Public pages should target good Core Web Vitals (SSR/SSG for public/catalog pages if using Next.js on the front, or pre-rendering/caching if using plain React+Vite).
- **Security:** Password hashing (bcrypt/argon2), rate limiting on auth and AI endpoints, input validation (zod), HTTPS everywhere, RBAC enforced server-side (never trust the client role).
- **Accessibility:** WCAG 2.1 AA target — proper contrast (design tokens already meet this), keyboard navigation, alt text, focus states.
- **Responsiveness:** Mobile-first, following the breakpoints defined in DESIGN.md (4-col mobile / 8-col tablet / 12-col desktop).
- **Internationalization:** FR primary, EN secondary, structured via i18n keys from the start even if only FR ships in v1.
- **Observability:** Basic logging (backend), error tracking (e.g., Sentry), uptime monitoring on Render.

---

## 5. Architecture

### 5.1 Monorepo Structure
```
co-meet-space/
├── front/                 # React + TypeScript + Tailwind (deployed to Vercel)
│   ├── src/
│   │   ├── app/            # routes/pages
│   │   ├── components/     # UI components (design-system based)
│   │   ├── features/       # feature modules (courses, auth, admin, ai-chat...)
│   │   ├── hooks/
│   │   ├── lib/             # api client, utils
│   │   ├── styles/          # tailwind config, design tokens
│   │   └── types/
│   ├── tailwind.config.ts   # generated from DESIGN.md tokens
│   └── package.json
│
├── backend/                # Node + TypeScript + Express (deployed to Render)
│   ├── src/
│   │   ├── modules/         # auth, users, courses, sessions, enrollments, ai, payments
│   │   ├── middlewares/     # auth guard, RBAC, error handler, rate limiter
│   │   ├── services/        # email service, ai (OpenRouter) service, storage service
│   │   ├── db/               # Prisma schema, migrations, seed
│   │   ├── routes/
│   │   └── config/
│   ├── prisma/schema.prisma
│   └── package.json
│
└── README.md
```

### 5.2 Frontend Stack
- **React 18 + TypeScript + Vite** (fast builds, clean Vercel deploy). *Next.js is an alternative if SEO/SSR on the public catalog becomes a hard requirement — flagged as an open decision below.*
- **Tailwind CSS**, configured directly from the DESIGN.md tokens (colors, typography scale, spacing, radii) as the single source of truth for the design system.
- **React Router** for routing, **TanStack Query** for server state/data fetching, **Zustand** for lightweight client state (e.g., auth session, UI state).
- **React Hook Form + Zod** for forms and validation.

### 5.3 Backend Stack
- **Node.js + Express + TypeScript.**
- **PostgreSQL** as the primary database, via **Prisma ORM** (clean migrations, type-safe queries).
- **JWT** auth (access + refresh tokens), **bcrypt** for password hashing.
- **Multer / cloud storage SDK** (e.g., Cloudinary or S3-compatible) for file uploads (course images, materials).
- **OpenRouter integration** isolated in a single `ai.service.ts` so the model/provider can be swapped later without touching feature code.

> **Note on "Node or Express or Next" for the backend:** for a clean, framework-light REST API deployed to Render, **Express + TypeScript** is the simplest and most maintainable choice, and keeps a hard separation from the frontend (which is the architecture you asked for). Next.js is more useful when frontend and backend share a runtime (e.g., both on Vercel) — since you're splitting Vercel/Render, plain Express avoids unnecessary overhead. Recommendation: **Express**, unless you want SSR on the public site, in which case Next.js on the frontend (still deployed to Vercel) with the same Express API backend is also a valid combo.

### 5.4 Data Model (core entities)
- `User` (id, name, email, passwordHash, role, createdAt…)
- `Course` (id, title, slug, description, categoryId, level, coverImageUrl, price, status)
- `Category`
- `Session` (id, courseId, trainerId, startDate, endDate, capacity, location, mode, status)
- `Enrollment` (id, userId, sessionId, status, paymentStatus, enrolledAt)
- `Attendance` (id, sessionId, userId, status, markedAt)
- `Material` (id, sessionId, fileUrl, type, uploadedBy)
- `Certificate` (id, userId, sessionId, issuedAt, fileUrl)
- `Payment` (id, enrollmentId, amount, provider, status) — phase 2 if Stripe is added
- `AiLog` (id, feature, userId, prompt, response, createdAt) — for auditing AI usage

### 5.5 API Structure (high level, REST)
```
/api/auth/*            signup, login, refresh, verify, reset-password
/api/users/*           profile, admin user management
/api/courses/*         public list/detail + admin CRUD
/api/sessions/*        public list/detail + admin/trainer CRUD, attendance
/api/enrollments/*     enroll, cancel, admin management
/api/certificates/*    generate, list, download
/api/materials/*       upload, list, delete
/api/ai/describe-course
/api/ai/chat
/api/ai/generate-quiz
/api/ai/summarize
```

### 5.6 Design System Integration
The Tailwind config on `/front` maps directly to DESIGN.md:
- Color tokens (primary `#003633`, secondary/CTA orange `#fd761a`, surfaces, on-surface, etc.) become Tailwind theme colors.
- Typography scale (Manrope for headings, Inter for body) becomes Tailwind `fontFamily` + custom text-style utility classes matching `display-lg`, `headline-lg`, `body-md`, etc.
- Spacing (`8px` base grid), radii (`rounded-2xl`/`rounded-3xl` for cards), and elevation levels (border + soft shadow tiers) are implemented as reusable component classes (`Card`, `Button`, `Chip`, `Input`) so every screen stays consistent without re-deriving styles.
- Logo and brand colors (deep teal / orange / sage) drive the navigation, buttons, and status-dot active-link indicator described in DESIGN.md.

---

## 6. Third-Party Integrations
- **OpenRouter API** (`openai/gpt-4o-mini`) — AI features, called only from the backend.
- **Email provider** (Resend or SendGrid) — transactional emails.
- **File storage** (Cloudinary or S3-compatible bucket) — images, materials, certificates.
- **Stripe** (phase 2, optional) — online payments for enrollments.
- **Sentry** (or similar) — error monitoring on both front and back.

---

## 7. Deployment

| | Frontend | Backend |
|---|---|---|
| **Host** | Vercel | Render |
| **Build** | `vite build` (or `next build`) | `tsc build` → `node dist/server.js` |
| **Env vars** | `VITE_API_URL`, analytics keys | `DATABASE_URL`, `JWT_SECRET`, `OPENROUTER_API_KEY`, email/storage keys |
| **Database** | — | Render PostgreSQL (or Supabase/Neon as alternative) |
| **CI/CD** | GitHub Actions → Vercel auto-deploy on push to `main` | GitHub Actions → Render auto-deploy on push to `main` |
| **Environments** | Preview deploys per PR (Vercel default) | Staging + Production services on Render |

CORS on the backend restricted to the deployed frontend origin(s).

---

## 8. Roadmap

**Phase 1 — MVP**
- Public site + course catalog, auth, RBAC.
- Course/Session CRUD (admin), enrollment (manual/offline payment), learner dashboard.
- Trainer dashboard (sessions, attendance, materials).
- Transactional emails.
- AI: course description assistant + support chatbot.

**Phase 2**
- Stripe payments, certificates PDF generation.
- AI: quiz generator, content summarizer.
- Lightweight CMS for public page content.
- Reporting/exports.

**Phase 3**
- Multi-language (EN), blog/SEO content, advanced analytics, waitlists automation.

---

## 9. Success Metrics
- Time admins spend creating a new course/session (target: reduce via AI description assistant).
- % of learner support questions resolved by the chatbot without escalation.
- Enrollment completion rate (catalog view → enrolled).
- Session capacity fill rate.

---

## 10. Open Questions
- Is online/live payment required for v1, or is manual/offline confirmation acceptable at launch?
- Should the public site be SSR (Next.js) for SEO, or is client-rendered React acceptable initially?
- Confirm product name: **Co.meet Space** (per uploaded logo/DESIGN.md) vs. "Commit Space" mentioned in the brief.
- Any existing course/trainer data to migrate, or fully greenfield?
