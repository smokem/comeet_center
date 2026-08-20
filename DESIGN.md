---
name: Nexus Collective
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#404847'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#707977'
  outline-variant: '#bfc8c6'
  surface-tint: '#316763'
  primary: '#003633'
  on-primary: '#ffffff'
  primary-container: '#134e4a'
  on-primary-container: '#87beb8'
  inverse-primary: '#9ad1cb'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#223142'
  on-tertiary: '#ffffff'
  tertiary-container: '#384759'
  on-tertiary-container: '#a6b5ca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b5ede7'
  primary-fixed-dim: '#9ad1cb'
  on-primary-fixed: '#00201e'
  on-primary-fixed-variant: '#144f4b'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#d4e4fa'
  tertiary-fixed-dim: '#b9c8de'
  on-tertiary-fixed: '#0d1c2d'
  on-tertiary-fixed-variant: '#39485a'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

The design system is built for a collaborative workspace platform that bridges the gap between high-end corporate reliability and the warmth of a community-driven environment. The personality is **Professional, Grounded, and Human-Centric**. 

The visual style is **Corporate Modern with a Geometric Twist**, leaning heavily into high-clarity typography and intentional whitespace. It borrows from Minimalism to ensure focus on community tasks, while utilizing "Soft Geometric" elements—derived from the interlocking circles of the logo—to create a sense of connection. The aesthetic avoids the sterility of typical SaaS products by introducing organic sage tones and vibrant orange accents, ensuring the digital environment feels as welcoming as a physical coworking space.

## Colors

The palette is anchored by **Deep Teal**, providing a sophisticated, stable foundation. **Vibrant Orange** is used sparingly as a high-contrast action color to guide users toward primary conversions and notifications. 

- **Primary (Deep Teal):** Used for navigation backgrounds, primary headings, and brand-heavy components.
- **Accent (Orange):** Reserved for "Call to Action" buttons, active states, and critical highlights.
- **Surface Tones:** A mix of clean whites and muted Sage/Slate grays (derived from the logo's secondary marks) creates a layered, "room-like" feel in the UI, moving away from pure grayscale to something more organic and inviting.

## Typography

This design system utilizes a dual-sans-serif pairing to distinguish between "Identity" and "Utility." 

**Manrope** is the voice of the brand. Its geometric construction and wide apertures feel modern and architectural. It is used for all headlines and display text. 

**Inter** handles the heavy lifting of the user interface. It provides maximum legibility for data-heavy views, booking schedules, and long-form community posts. Use tight tracking for large display headers and standard tracking for body copy to maintain a professional, editorial look.

## Layout & Spacing

The layout philosophy follows a **Fluid-Fixed Hybrid**. Content is contained within a 1280px max-width container on desktop to maintain readability, while backgrounds and decorative geometric elements bleed to the edges.

A strict **8px grid** governs all internal component spacing. Generous whitespace (LG/XL units) should be used between major sections to evoke the feeling of "space" and "breathing room." 

**Breakpoints:**
- **Desktop:** 12-column grid, 24px gutters.
- **Tablet:** 8-column grid, 20px gutters.
- **Mobile:** 4-column grid, 16px margins. Reflow all side-by-side cards into a single-column vertical stack.

## Elevation & Depth

To maintain a "Modern Professional" feel, this design system avoids heavy, dark shadows. Instead, it utilizes **Tonal Layering** supplemented by **Ambient Soft Shadows**.

1.  **Level 0 (Floor):** Neutral Slate-50 background.
2.  **Level 1 (Cards/Containers):** White background with a 1px border (#E2E8F0) and no shadow.
3.  **Level 2 (Interactive/Floating):** White background with a 1px border and a very soft, diffused shadow (Blur: 12px, Y: 4px, Opacity: 4% Black). Use this for hover states and dropdowns.
4.  **Level 3 (Modals):** High-diffusion shadow (Blur: 24px, Y: 8px, Opacity: 8% Black) to create distinct separation.

Incorporate **Backdrop Blurs (12px-16px)** for sticky navigation bars to provide a sense of glass-like transparency without cluttering the visual field.

## Shapes

The shape language is defined by **High-Radius Geometry**. While the base `roundedness` is set to 2 (0.5rem), the system leans heavily into `rounded-2xl` (1rem) and `rounded-3xl` (1.5rem) for large containers and cards. 

Buttons should utilize a semi-pill shape or a generous `rounded-xl` to feel approachable. Circular elements, echoing the logo, should be used for avatars and status indicators. Icons should follow a "Line-Art" style with rounded caps to match the font's terminal style.

## Components

### Buttons
- **Primary:** Deep Teal background, white text. Transitions to a slightly darker teal on hover.
- **Secondary:** White background, Teal border, Teal text.
- **CTA:** Vibrant Orange background. Only one per view to maintain impact.

### Input Fields
- Use a light gray background (#F1F5F9) with a 1px border. On focus, the border changes to Deep Teal with a 2px outer "glow" in the same color at 10% opacity.

### Cards
- Standard cards use `rounded-2xl`. Header sections within cards should use a subtle Sage background to separate metadata from the primary content.

### Chips & Tags
- Used for "Amenities" or "Room Types." These should use low-contrast backgrounds (e.g., light teal with deep teal text) to avoid competing with primary buttons.

### Navigation
- A top-bar approach with centered links. Use a "dot" indicator (Orange) beneath the active link, mimicking the circular dots in the brand logo.