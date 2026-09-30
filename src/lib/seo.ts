/**
 * seo.ts — Single source of truth for all SEO metadata.
 *
 * Exports:
 *   SITE_URL   — canonical origin, no trailing slash
 *   BUSINESS   — entity facts reused in JSON-LD, footer, FAQ, llms.txt
 *   OG_IMAGE   — absolute URL for social previews (Cloudinary forced JPG 1200×630)
 *   pageHead() — returns a TanStack Start `head` object for any route
 *
 * Rules followed:
 *   • Titles   ~50-60 chars
 *   • Descriptions ~120-160 chars, unique per page
 *   • Canonical = og:url = sitemap URL (same form, no trailing slash)
 *   • og:image is an absolute JPG (not f_auto — social crawlers need a fixed format)
 *   • No meta keywords
 *   • /admin stays noindex (enforced in the admin route head, not here)
 *   • sameAs: empty TODO array — add real profile URLs when available
 */

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

/** Canonical public URL — set VITE_SITE_URL in Vercel dashboard + .env */
export const SITE_URL: string =
  (typeof import.meta !== "undefined" && (import.meta.env as Record<string, string | undefined>)["VITE_SITE_URL"]) ||
  "https://comeetspace.com";

// ---------------------------------------------------------------------------
// Business entity constants
// Reused verbatim in JSON-LD, footer, FAQ answers, llms.txt so facts never drift.
// ---------------------------------------------------------------------------
export const BUSINESS = {
  name:        "Co.meet Space",
  nameFull:    "Co.meet Space — Centre de formation professionnelle",
  description: "Centre de formation professionnelle à Sfax, Tunisie. Formations courtes en management, communication, numérique et bureautique. Groupes de 15 personnes maximum, formateurs praticiens, sessions en présentiel, hybride ou en ligne.",
  address: {
    streetAddress:   "Route de Mahdia Km 5,5",
    addressLocality: "Sfax",
    postalCode:      "3011",
    addressCountry:  "TN",
  },
  geo: {
    latitude:  "34.784211",
    longitude: "10.775500",
  },
  phone:    "+216 92 489 103",
  phoneE164: "+21692489103",
  email:    "contact@comeetspace.com",
  url:      SITE_URL,
  logo:     `${SITE_URL}/brand-logo.png`,
  /**
   * sameAs: add REAL social/directory profile URLs here when available.
   * TODO: provide Facebook, Instagram, LinkedIn, Google Business Profile URLs.
   */
  sameAs: [] as string[],
} as const;

// ---------------------------------------------------------------------------
// OG image
// Cloudinary: f_jpg forces JPEG (not WebP) so social crawlers always get
// a supported format. c_fill crops to exactly 1200×630.
// ---------------------------------------------------------------------------
export const OG_IMAGE =
  "https://res.cloudinary.com/jhaaukjn/image/upload/f_jpg,q_80,w_1200,h_630,c_fill/accueil-du-centre";
export const OG_IMAGE_WIDTH  = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT    = "Accueil du centre Co.meet Space à Sfax";

// ---------------------------------------------------------------------------
// pageHead helper
// ---------------------------------------------------------------------------

export interface PageHeadOptions {
  /** Page title — ~50-60 chars. Do NOT include brand suffix; it is appended. */
  title: string;
  /** Meta description — ~120-160 chars, unique per page. */
  description: string;
  /** Route path, e.g. "/" or "/formations" or "/formations/excel-avance" */
  path: string;
  /** Optional JSON-LD graph nodes (already serialized to string). */
  jsonLd?: string;
  /** Set to true for pages that should not be indexed (e.g. /admin). */
  noindex?: boolean;
}

/** Full title shown in <title> and og:title */
function fullTitle(title: string): string {
  // If title already contains brand name avoid duplication
  if (title.includes("Co.meet")) return title;
  return `${title} — Co.meet Space`;
}

export function pageHead(opts: PageHeadOptions) {
  const canonical = `${SITE_URL}${opts.path === "/" ? "" : opts.path}`;
  const ft        = fullTitle(opts.title);
  const robots    = opts.noindex ? "noindex, nofollow" : "index, follow";

  const meta = [
    { title: ft },
    { name: "description",       content: opts.description },
    { name: "robots",            content: robots },
    // Open Graph
    { property: "og:type",       content: "website" },
    { property: "og:url",        content: canonical },
    { property: "og:title",      content: ft },
    { property: "og:description",content: opts.description },
    { property: "og:image",      content: OG_IMAGE },
    { property: "og:image:width",content: String(OG_IMAGE_WIDTH) },
    { property: "og:image:height",content: String(OG_IMAGE_HEIGHT) },
    { property: "og:image:alt",  content: OG_IMAGE_ALT },
    { property: "og:site_name",  content: BUSINESS.name },
    { property: "og:locale",     content: "fr_FR" },
    // Twitter / X
    { name: "twitter:card",      content: "summary_large_image" },
    { name: "twitter:title",     content: ft },
    { name: "twitter:description",content: opts.description },
    { name: "twitter:image",     content: OG_IMAGE },
    { name: "twitter:image:alt", content: OG_IMAGE_ALT },
  ];

  const links = [
    { rel: "canonical", href: canonical },
  ];

  // JSON-LD script tag — emitted server-side so it is in the initial HTML
  const scripts = opts.jsonLd
    ? [{ type: "application/ld+json", children: opts.jsonLd }]
    : [];

  return { meta, links, scripts };
}

// ---------------------------------------------------------------------------
// JSON-LD helpers
// ---------------------------------------------------------------------------

/** Escape "<" so user-supplied text cannot break the script tag. */
export function safeJson(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

/** WebSite + EducationalOrganization/LocalBusiness — emitted on homepage. */
export function homepageJsonLd(): string {
  const graph = [
    {
      "@type": ["EducationalOrganization", "LocalBusiness"],
      "@id":   `${SITE_URL}/#organization`,
      name:    BUSINESS.name,
      description: BUSINESS.description,
      url:     SITE_URL,
      logo: {
        "@type":      "ImageObject",
        url:          BUSINESS.logo,
        width:        "200",
        height:       "60",
      },
      telephone: BUSINESS.phoneE164,
      email:     BUSINESS.email,
      address: {
        "@type":           "PostalAddress",
        streetAddress:     BUSINESS.address.streetAddress,
        addressLocality:   BUSINESS.address.addressLocality,
        postalCode:        BUSINESS.address.postalCode,
        addressCountry:    BUSINESS.address.addressCountry,
      },
      geo: {
        "@type":    "GeoCoordinates",
        latitude:   BUSINESS.geo.latitude,
        longitude:  BUSINESS.geo.longitude,
      },
      sameAs: BUSINESS.sameAs,
    },
    {
      "@type":        "WebSite",
      "@id":          `${SITE_URL}/#website`,
      url:            SITE_URL,
      name:           BUSINESS.name,
      publisher:      { "@id": `${SITE_URL}/#organization` },
      inLanguage:     "fr-FR",
    },
  ];
  return safeJson({ "@context": "https://schema.org", "@graph": graph });
}

/** BreadcrumbList for catalog page. */
export function catalogBreadcrumbJsonLd(): string {
  const graph = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil",    item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Formations", item: `${SITE_URL}/formations` },
      ],
    },
  ];
  return safeJson({ "@context": "https://schema.org", "@graph": graph });
}

/** Course + BreadcrumbList for a single course page. */
export function courseJsonLd(course: {
  slug: string;
  title: string;
  description: string;
  price: number;
  durationHours: number;
  level: string;
  mode: string;
  sessions: { start: string; end: string; city: string; seatsLeft: number }[];
  objectives: string[];
  trainer: { name: string; role: string };
}): string {
  const courseUrl = `${SITE_URL}/formations/${course.slug}`;

  // CourseInstance only for sessions with parseable dates
  const instances = course.sessions
    .filter((s) => !isNaN(Date.parse(s.start)))
    .map((s) => ({
      "@type":          "CourseInstance",
      courseMode:       course.mode === "en-ligne" ? "Online" : "Blended",
      location:         s.city,
      startDate:        s.start,
      endDate:          s.end,
      remainingAttendeeCapacity: s.seatsLeft,
    }));

  const courseNode: Record<string, unknown> = {
    "@type":       "Course",
    "@id":         `${courseUrl}/#course`,
    name:          course.title,
    description:   course.description,
    url:           courseUrl,
    provider:      { "@id": `${SITE_URL}/#organization` },
    timeRequired:  `PT${course.durationHours}H`,
    educationalLevel: course.level,
    teaches:       course.objectives.join("; "),
    inLanguage:    "fr-FR",
    ...(course.price > 0 ? {
      offers: {
        "@type":       "Offer",
        price:         course.price,
        priceCurrency: "TND",
        availability:  "https://schema.org/InStock",
        url:           courseUrl,
      },
    } : {}),
    ...(instances.length > 0 ? { hasCourseInstance: instances } : {}),
    instructor: {
      "@type": "Person",
      name:    course.trainer.name,
      jobTitle: course.trainer.role,
    },
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil",    item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Formations", item: `${SITE_URL}/formations` },
      { "@type": "ListItem", position: 3, name: course.title, item: courseUrl },
    ],
  };

  return safeJson({ "@context": "https://schema.org", "@graph": [courseNode, breadcrumb] });
}
