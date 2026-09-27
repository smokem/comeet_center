# Frontend Design Animations and Scrolling — Co.meet Space

This document captures the visual motion system and scroll interactions currently used across the frontend of this project.

## 1. Design animation system

### 1.1 Core animation primitives

The project uses a small but consistent motion language based on:

- soft fades
- subtle upward motion
- smooth card hover transforms
- delayed reveal on viewport entry
- slow ambient floating background orbs
- marquee motion for testimonials

The main implementation is split across:

- [src/lib/fade-in.tsx](src/lib/fade-in.tsx)
- [src/styles.css](src/styles.css)
- [src/routes/index.tsx](src/routes/index.tsx)
- [src/components/site/SiteChrome.tsx](src/components/site/SiteChrome.tsx)

### 1.2 Reusable reveal animation

The main scroll-reveal utility is `FadeIn` / `useFadeIn` from [src/lib/fade-in.tsx](src/lib/fade-in.tsx).

It uses `IntersectionObserver` to trigger visibility when an element enters the viewport:

- default threshold: `0.15`
- initial state: `opacity-0 translate-y-6`
- visible state: `opacity-100 translate-y-0`
- transition: `transition-all duration-700 ease-out`

This is used across landing pages for titles, cards, and information blocks.

### 1.3 CSS animation utilities

The global motion utilities are defined in [src/styles.css](src/styles.css):

- `animate-fade-in-up`
  - `fade-in-up 700ms cubic-bezier(0.16, 1, 0.3, 1)`
  - used for hero content and stat blocks
- `animate-float-slow`
  - `float-slow 12s ease-in-out infinite`
  - used for background blurred circles behind the hero and key sections
- `@keyframes marquee`
  - horizontal looping movement for testimonial cards

### 1.4 Typical motion patterns

Across the project, the most common animation style is:

- `transition-all duration-300` or `duration-500`
- `hover:-translate-y-0.5`
- `hover:shadow-level-3`
- `ease-out` transitions for UI polish
- delayed staggered entrance with `style={{ animationDelay: ... }}` or `delay={i * 80}`

Examples:

- CTA buttons lift on hover
- hero content appears with fade-up movement
- cards reveal sequentially with increasing delay
- the WhatsApp booking panel animates in after viewport detection

---

## 2. Scroll interactions in the project

### 2.1 Sticky header behavior

The header in [src/components/site/SiteChrome.tsx](src/components/site/SiteChrome.tsx) listens to `window.scrollY` and changes state when the page scrolls past 40px.

Behavior:

- header becomes compact when scrolling down
- logo shrinks slightly
- CTA button compresses
- background becomes more solid with translucent blur
- border appears
- sticky header remains fixed to the top

Scroll logic:

- `useEffect` attaches a `scroll` listener
- `setScrolled(window.scrollY > 40)`
- `transition-all duration-300` for smooth shrink/expand motion

### 2.2 Scroll-triggered reveal

The `FadeIn` component is the main reveal pattern. It triggers when a section enters the viewport using `IntersectionObserver`.

Use cases:

- testimonials
- course cards
- journey steps
- about page blocks
- contact info blocks
- formation detail sections

This gives the site a calm, premium motion style without oversaturating the experience.

### 2.3 Timeline scroll scrub interaction

The landing page in [src/routes/index.tsx](src/routes/index.tsx) contains a custom timeline section that behaves like a vertical scroll-scrub experience.

Features:

- the section has a tall container height (`timelineMoments.length * 100vh`)
- the inner block uses `position: sticky` with `top-14`
- as the user scrolls, an active time slot is computed from progress
- the main photo and text update according to the active moment
- the time column on the left highlights the active slot
- clicking a time marker smoothly scrolls to a matching section position

This is the strongest “scroll storytelling” interaction in the project.

### 2.4 Marquee / continuous motion

The testimonial section uses a horizontal marquee animation from [src/routes/index.tsx](src/routes/index.tsx):

- `doubled = [...testimonials, ...testimonials]`
- each card set is repeated to create a seamless loop
- CSS keyframe `marquee 40s linear infinite`
- hover pause state via `.overflow-hidden:hover .flex[style*="marquee"] { animation-play-state: paused; }`

This creates a continuous showcase of client feedback without requiring complex JS.

---

## 3. Screen-by-screen animation usage

### 3.1 Hero section

In [src/routes/index.tsx](src/routes/index.tsx):

- the hero uses `animate-fade-in-up`
- the right-side image enters with a slight delay (`[animation-delay:120ms]`)
- the floating gradient orbs animate with `animate-float-slow`
- CTA buttons have `transition-all duration-300 ease-out hover:-translate-y-0.5`

This creates the first major impression: strong, polished, and calm.

### 3.2 Featured course cards

Course blocks use:

- staggered `FadeIn` delays
- smooth hover translation
- card container depth and shadow
- soft transitions between states

This suggests a premium learning platform rather than a harsh SaaS interface.

### 3.3 Journey steps

The numbered process section in [src/routes/index.tsx](src/routes/index.tsx) uses:

- a left vertical rail
- cards revealing in sequence
- highlight state for the “active” step
- check badge on the highlighted step
- hover transitions on non-highlight cards

The sequence is highly readable and supports conversion because the second step includes WhatsApp CTA.

### 3.4 Booking / confirmation notification

The `BookingNotification` component uses `useFadeIn(0.3)` plus a delayed `setTimeout` to reveal the confirmation box after visibility.

It includes:

- subtle scale animation
- vertical translation
- pulse ring effect
- smooth confirmation card appearance

This is intended to feel like a real-time positive interaction during the user journey.

---

## 4. Motion principles used by the project

The frontend uses a restrained, premium motion identity:

- subtle rather than aggressive
- mostly fade + lift transitions
- smooth 300–700ms durations
- very light parallax-like change in scroll-driven sections
- no heavy 3D transforms or complex choreography

This aligns with the brand intent of a professional training center: trustworthy, calm, modern, and human.

---

## 5. Design conventions to keep in mind

When continuing the frontend, this project is best served by preserving these rules:

1. Use soft fade-up entry animations on major sections.
2. Keep hover motion small and elegant.
3. Use sticky scroll storytelling only for content that benefits from timeline sequencing.
4. Prefer `IntersectionObserver` over heavy animation libraries unless a complex motion system is required.
5. Respect the brand rhythm:
   - deep teal primary palette
   - warm orange accent
   - soft sage backgrounds
   - minimal but purposeful motion

---

## 6. Summary

The current implementation is built around a lightweight custom animation system rather than a large animation library. It mixes:

- viewport-based reveal
- CSS utility keyframes
- scroll-driven sticky states
- horizontal marquee movement
- modest button and card microinteractions

This creates a professional, smooth front-end experience that feels polished without becoming distracting.

## 7. Relevant files

- [src/lib/fade-in.tsx](src/lib/fade-in.tsx)
- [src/styles.css](src/styles.css)
- [src/routes/index.tsx](src/routes/index.tsx)
- [src/components/site/SiteChrome.tsx](src/components/site/SiteChrome.tsx)
- [src/routes/a-propos.tsx](src/routes/a-propos.tsx)
- [src/routes/contact.tsx](src/routes/contact.tsx)
- [src/routes/formations.index.tsx](src/routes/formations.index.tsx)
- [src/routes/formations.$slug.tsx](src/routes/formations.$slug.tsx)
