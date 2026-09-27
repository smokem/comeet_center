# Co.meet Space — Project Context

## 1. Project overview

Co.meet Space is a professional training-center website and admin platform for a formation business based in Sfax. The product combines a public-facing corporate site with an administrative area for managing courses, sessions, enrollments, content, and rollout status.

The platform is designed to help the center:

- showcase courses and sessions publicly
- manage training catalog content without code changes
- handle admin tasks and upcoming launch controls
- support trainers and learners with structured workflows
- maintain a modern, premium visual identity aligned to a training brand

---

## 2. Product goals

- Present a polished public website for course discovery and enrollment
- Support a course catalog with filters and detail pages
- Make the site usable for a training center, not only for a generic business
- Offer an admin dashboard for courses, content, and launch settings
- Keep the codebase modular and maintainable
- Support future AI-assisted content features and operational automation

---

## 3. Current business model and scope

### Core use cases

- Public visitors browse training offerings
- Visitors can view course details, formats, pricing, and locations
- Staff/admins can manage course and session data
- Trainers can manage their assigned sessions and attendance
- Learners can enroll and track progress in future phases

### In-scope v1 direction

- Public marketing website
- Course catalog and course detail pages
- Contact and about pages
- Admin management space
- Basic launch gating / coming-soon system
- Local static gallery and venue content

### Out of scope / future phases

- Native mobile app
- Full LMS module with deep learner progress workflows
- Live classroom features
- Complex payment flows at first launch
- Full AI tooling as a production system without review

---

## 4. Product roles

- Super Admin: full control over users, content, routing, configuration
- Admin / Staff: manages course and session operations
- Trainer: manages assigned sessions, attendance, and materials
- Learner: browses, enrolls, tracks training outcomes
- Visitor / guest: browses public info and contacts the business

---

## 5. Primary user experience

The app is designed around a premium, professional, modern training-center experience. The tone is:

- trustworthy
- grounded
- human-centered
- clean and contemporary
- high-clarity and conversion focused

The design emphasizes:

- deep teal as primary brand color
- warm orange for action and highlights
- soft sage/slate surfaces for balance
- large typography and whitespace for clarity
- subtle motion and scroll-based reveal effects

---

## 6. Technology stack

### Frontend

- React + TypeScript
- Vite
- Tailwind CSS
- TanStack Router / TanStack Start patterns
- Firebase client integration for auth and Firestore access
- Local image assets served from the public folder

### Backend / functions

- Firebase Cloud Functions
- Node.js + TypeScript
- Express-style server setup for API endpoints
- Firestore as the database layer

### Supporting infrastructure

- Firebase Hosting
- Firebase Auth
- Firestore
- Firestore rules for public read and authenticated write access

---

## 7. Repository structure

```text
comeet_center/
├── README.md
├── PRD_CoMeetSpace.md
├── DESIGN.md
├── STATUS.md
├── PROJECT_CONTEXT.md
├── package.json
├── vite.config.ts
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── public/
│   ├── favicon.png
│   ├── brand-logo.png
│   ├── footer-logo.png
│   └── venue/
├── src/
│   ├── routes/
│   ├── components/
│   ├── lib/
│   ├── data/
│   ├── assets/
│   ├── styles.css
│   └── router.tsx
├── functions/
│   ├── src/
│   ├── scripts/
│   └── package.json
├── backend/
│   ├── src/
│   ├── test/
│   └── package.json
└── ...
```

---

## 8. Main routes and status

| Route | Status | Notes |
|---|---|---|
| `/` | Works | Landing page with hero, featured courses, stats, testimonial loop, CTA |
| `/formations` | Works | Full training catalog and filtering |
| `/formations/$slug` | Works | Individual course detail page |
| `/a-propos` | Works | About page + venue gallery slideshow |
| `/contact` | Works | Contact page with form and contact details |
| `/admin` | Loads partially | Login UI exists but admin access depends on Firebase setup |

---

## 9. Current app behavior

### Public website

The public landing page includes:

- hero banner with strong brand CTA
- feature course cards
- training stats
- timeline-style storytelling section
- journey steps
- testimonial marquee
- WhatsApp CTA integration
- sticky header with scroll-aware behavior

### About page

The about page contains:

- brand story and center values
- pedagogy section and metrics
- venue slideshow showing local photo assets from public/venue
- CTA to contact the center

### Course flow

The product is structured around training discovery and future conversion: visitors can browse available programs, understand the format, and follow a clear next-step flow toward WhatsApp/contact booking.

---

## 10. Design system summary

### Brand colors

- Primary: deep teal
- Accent: vibrant orange
- Surface: soft white, sage, slate
- Text: dark neutral for readability

### Typography

- Headings: Manrope
- Body/UI: Inter

### Shape and spacing

- Use high-radius geometry for cards and panels
- Generous whitespace and 8px base spacing rhythm
- Balanced layouts with clear section separation

### Motion language

The frontend uses:

- fade-in transitions
- upward motion on reveal
- hover lifts on buttons and cards
- sticky scroll storytelling patterns
- slow floating ambient backgrounds
- marquee-style continuous content motion

The main animation logic is defined in the frontend utility layer and global CSS theme.

---

## 11. Important implementation details

### Coming-soon system

The app includes a launch gate that can hide the public site before a target date. The logic is built around:

- root-level gate checks
- Firestore-backed settings
- a preview/admin override state
- live update polling

This is used to control whether the site is open to the public or still in pre-launch mode.

### Venue/photo assets

The website uses static local images in the public venue folder. These are served directly through Vite and displayed in auto-advancing slideshow sections.

### WhatsApp CTA pattern

The project strongly favors direct conversion through WhatsApp rather than long forms. This is a recurring UX strategy throughout the site.

---

## 12. Key files to understand the project

- README.md — project intro and local setup
- PRD_CoMeetSpace.md — product requirements and feature vision
- DESIGN.md — visual system, colors, typography, spacing, brand rules
- STATUS.md — current project state, known issues, deployment notes
- src/routes/index.tsx — public home page implementation
- src/routes/a-propos.tsx — about page and venue gallery
- src/routes/contact.tsx — contact page and form behavior
- src/routes/formations.index.tsx — catalog page
- src/routes/formations.$slug.tsx — detailed course page
- src/components/site/SiteChrome.tsx — header and footer system
- src/lib/fade-in.tsx — reveal animation primitive
- src/styles.css — theme tokens and custom animations
- src/lib/courses-api.ts — course fetching logic
- src/lib/firebase.ts — Firebase setup
- firestore.rules — database permissions
- functions/scripts/seed-firestore.ts — data seeding

---

## 13. Current status and blockers

### Working

- public pages render with course data
- course listings and detail pages work
- venue assets and slideshow are in place
- design system is implemented
- site structure is established

### Needs attention

- admin user creation in Firebase Auth
- Firestore rules deployment
- coming-soon settings seeding
- EmailJS template configuration for contact form
- production deployment and final environment setup

---

## 14. Summary

This project is a modern professional training-center website built with a modular frontend and Firebase-based backend infrastructure. The app is designed around a premium education brand, with a product vision that balances marketing, course discovery, trainer operations, admin control, and future AI automation.

The overall direction is clear, the frontend is already implemented with a strong identity, and the remaining work is mainly environment, deployment, and operational setup rather than a total redesign.

---

## 15. Recommended next steps

1. Validate Firebase auth setup and create the admin account.
2. Deploy Firestore rules.
3. Seed the coming-soon settings document.
4. Configure the contact email template.
5. Test the full public/admin flow.
6. Prepare final production deployment and QA pass.

This file should be treated as the single source of project reference for technical and product context.
