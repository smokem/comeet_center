import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Check,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CourseCard } from "@/components/site/CourseCard";
import { FaqSection } from "@/components/site/FaqSection";
import { Img } from "@/components/site/Img";
import { ImageGallery } from "@/components/ui/image-gallery";
import { type Course } from "@/data/courses";
import { buildFaq } from "@/data/faq";
import { listCourses } from "@/lib/courses-api";
import { FadeIn, useFadeIn } from "@/lib/fade-in";
import { homepageJsonLd, pageHead } from "@/lib/seo";
import { venueImageById, type VenueImage } from "@/lib/venue-images";
import { useBusinessHours } from "./__root";

const WA_HREF = "https://wa.me/21692489103";
const WA_NUMBER = "+216 92 489 103";

// ---------------------------------------------------------------------------
// Venue photo helper — look up by Cloudinary publicId
// ---------------------------------------------------------------------------
function venueImage(publicId: string): VenueImage {
  return (
    venueImageById(publicId) ?? {
      publicId,
      label: publicId,
      alt:   publicId,
      width: 4032,
      height: 3024,
    }
  );
}

export const Route = createFileRoute("/")({
  loader: async (): Promise<{ featured: Course[] }> => {
    try {
      const items = await listCourses();
      return { featured: items.filter((c) => c.featured) };
    } catch {
      return { featured: [] };
    }
  },
  head: () => ({
    ...pageHead({
      title:       "Co.meet Space — Centre de formation professionnelle à Sfax",
      description: "Formations courtes en management, communication et numérique à Sfax. Groupes de 15 max, formateurs praticiens. Inscription rapide sur WhatsApp.",
      path:        "/",
      jsonLd:      homepageJsonLd(),
    }),
  }),
  component: Home,
});

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
// timelineMoments is built at render time so the 4 times come from
// BusinessHoursSettings rather than being hardcoded.
function buildTimelineMoments(h: { timelineStep1: string; timelineStep2: string; timelineStep3: string; timelineStep4: string }) {
  return [
    {
      time: h.timelineStep1,
      label: "L'arrivée",
      text: "Café, bibliothèque ouverte, wifi. Le centre accueille dès 8h 30min — pas besoin de courir.",
      image: venueImage("accueil-du-centre"),
    },
    {
      time: h.timelineStep2,
      label: "En pleine session",
      text: "Groupe de 15 maximum. Le formateur pratique encore son métier. Vous travaillez sur vos vrais cas.",
      image: venueImage("salle_de_formation"),
    },
    {
      time: h.timelineStep3,
      label: "Espace de coworking",
      text: "Entre deux sessions, le centre reste ouvert. Postes de travail, wifi rapide, café — les participants restent, travaillent, échangent.",
      image: venueImage("coworking-space"),
    },
    {
      time: h.timelineStep4,
      label: "Le cours du soir",
      text: "Le centre est ouvert jusqu'à 22h. Idéal pour les professionnels qui ne peuvent pas se libérer en journée.",
      image: venueImage("salle-formation"),
    },
  ] as const;
}

const journeySteps = [
  {
    number: "01",
    icon: BookOpen,
    title: "Choisissez une formation",
    text: "Management, communication, numérique ou bureautique. Filtrez par niveau et format dans le catalogue.",
    cta: null,
    highlight: false,
  },
  {
    number: "02",
    icon: MessageCircle,
    title: "Appelez ou écrivez sur WhatsApp",
    text: "On répond en moins de 2 minutes. On vérifie les places disponibles et on bloque votre session.",
    cta: { label: "Nous écrire sur WhatsApp", href: WA_HREF },
    highlight: true,
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Suivez la session",
    text: "Présentiel à Sfax, hybride ou en ligne. Supports remis le jour même, formateur joignable après.",
    cta: null,
    highlight: false,
  },
  {
    number: "04",
    icon: GraduationCap,
    title: "Recevez votre certificat",
    text: "Attestation de formation délivrée sous 48h. Suivi à 30 jours inclus.",
    cta: null,
    highlight: false,
  },
];

// ---------------------------------------------------------------------------
// WhatsApp icon SVG
// ---------------------------------------------------------------------------
function WaIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.528 5.847L0 24l6.335-1.508A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.374l-.36-.214-3.722.886.935-3.612-.235-.372A9.818 9.818 0 1 1 12 21.818z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Notification animation
// ---------------------------------------------------------------------------
function BookingNotification() {
  const [show, setShow] = useState(false);
  const { ref, visible } = useFadeIn(0.3);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShow(true), 600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [visible]);

  return (
    <div ref={ref} className="flex justify-center">
      <div className={`relative transition-all duration-700 ease-out ${show ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}>
        <div className="surface-card flex max-w-sm items-start gap-4 p-5 shadow-level-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
            <WaIcon className="size-5 text-white" />
          </div>
          <div>
            <p className="text-label-sm font-semibold uppercase text-[#25D366]">Co.meet Space</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              ✅ Votre place est confirmée
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Votre formation · Sfax
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">maintenant</span>
        </div>
        <div className={`absolute -inset-1 rounded-2xl border-2 border-[#25D366]/30 transition-all duration-1000 ${show ? "opacity-0 scale-110" : "opacity-0"}`} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeline — DESKTOP: click-tabs (no scroll scrub). MOBILE: swipe carousel.
// ---------------------------------------------------------------------------
function Timeline() {
  const hours = useBusinessHours();
  const timelineMoments = buildTimelineMoments(hours);
  const [activeIndex, setActiveIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Mobile carousel: track touch/pointer for swipe detection
  const dragStartX = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  function handleDragStart(x: number) {
    dragStartX.current = x;
  }

  function handleDragEnd(x: number) {
    if (dragStartX.current === null) return;
    const delta = dragStartX.current - x;
    if (Math.abs(delta) > 40) {
      if (delta > 0) {
        setActiveIndex((i) => Math.min(i + 1, timelineMoments.length - 1));
      } else {
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
    }
    dragStartX.current = null;
  }

  const active = timelineMoments[activeIndex]!;

  return (
    <div className="container-page py-16">
      <FadeIn>
        <p className="text-label-sm uppercase text-secondary">Une journée au centre</p>
        <h2 className="mt-3 text-headline-lg text-primary">
          {hours.timelineHeading}<br />Chaque heure compte.
        </h2>
      </FadeIn>

      {/* ── DESKTOP: tab row + photo panel ── */}
      <div className="mt-10 hidden lg:block">
        {/* Tab buttons */}
        <div className="flex gap-2">
          {timelineMoments.map((m, i) => (
            <button
              key={m.time}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`flex items-center gap-3 rounded-2xl px-5 py-3 text-left transition-all duration-200 ${
                i === activeIndex
                  ? "bg-primary text-primary-foreground shadow-level-2"
                  : "bg-background border border-border text-muted-foreground hover:bg-primary/5 hover:text-foreground"
              }`}
            >
              <span className={`text-sm font-semibold ${
                i === activeIndex ? "text-primary-foreground" : "text-foreground"
              }`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>

        {/* Photo + text panel */}
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_auto] lg:items-start">
          <div className="relative overflow-hidden rounded-3xl bg-primary/10" style={{ height: "min(60vh, 520px)" }}>
            <Img
              key={active.image.publicId}
              image={active.image}
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="h-full w-full object-cover transition-opacity duration-500 cursor-zoom-in"
              onClick={() => setGalleryOpen(true)}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent cursor-zoom-in"
              onClick={() => setGalleryOpen(true)}
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 pointer-events-none">
              <h3 className="font-display text-2xl font-bold text-primary-foreground">{active.label}</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-primary-foreground/80">{active.text}</p>
            </div>
          </div>
          {/* Progress bar — outside photo on desktop */}
          <div className="flex items-center self-stretch pt-2">
            <div className="flex flex-col gap-1.5">
              {timelineMoments.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === activeIndex ? "w-8 bg-cta" : i < activeIndex ? "w-4 bg-primary/40" : "w-4 bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE: swipe carousel ── */}
      <div className="mt-8 lg:hidden">
        {/* Swipeable photo — touch-action:pan-y keeps vertical scroll working */}
        <div
          ref={carouselRef}
          className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-primary/10 cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: "pan-y" }}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseUp={(e) => handleDragEnd(e.clientX)}
          onMouseLeave={() => { dragStartX.current = null; }}
          onTouchStart={(e) => handleDragStart(e.touches[0]!.clientX)}
          onTouchEnd={(e) => handleDragEnd(e.changedTouches[0]!.clientX)}
        >
          <Img
            key={active.image.publicId}
            image={active.image}
            sizes="100vw"
            className="h-full w-full object-cover transition-opacity duration-400 pointer-events-none"
          />
          {/* Preload next slide — lazy fetch, visually hidden */}
          {activeIndex < timelineMoments.length - 1 && (
            <Img
              image={timelineMoments[activeIndex + 1]!.image}
              sizes="1px"
              className="sr-only pointer-events-none"
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent pointer-events-none" />
          {/* Label overlay — no time */}
          <div
            className="absolute inset-0 cursor-zoom-in"
            onClick={() => setGalleryOpen(true)}
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
            <p className="font-display text-lg font-bold text-primary-foreground">{active.label}</p>
          </div>
          {/* Prev/next arrows — 44×44 px touch targets */}
          {activeIndex > 0 && (
            <button
              type="button"
              aria-label="Précédent"
              onClick={() => setActiveIndex((i) => i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-primary/70 text-primary-foreground transition hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-5" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}
          {activeIndex < timelineMoments.length - 1 && (
            <button
              type="button"
              aria-label="Suivant"
              onClick={() => setActiveIndex((i) => i + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-primary/70 text-primary-foreground transition hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-5" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
          {/* Dot indicators — each has a ≥44px invisible tap area via padding */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {timelineMoments.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Étape ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                className="flex items-center justify-center p-3"
              >
                <span className={`block rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Step text */}
        <div className="mt-4">
          <p className="font-display text-xl font-bold text-primary">{active.label}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{active.text}</p>
        </div>

        {/* Step tabs below */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {timelineMoments.map((m, i) => (
            <button
              key={m.time}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all ${
                i === activeIndex
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-background border border-border text-muted-foreground"
              }`}
            >
              <span className="font-semibold">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <a
          href={WA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-level-2 transition-all hover:-translate-y-0.5"
        >
          <WaIcon className="size-4" />
          Venez voir le centre
        </a>
      </div>

      {/* Lightbox — accordion gallery */}
      {galleryOpen && (
        <ImageGallery
          images={timelineMoments.map((m) => m.image)}
          initialIndex={activeIndex}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Journey steps — with per-step lucide icons
// ---------------------------------------------------------------------------
function JourneySteps() {
  return (
    <div className="relative">
      {/* Vertical rail */}
      <div className="absolute left-8 top-0 hidden h-full w-px bg-border/70 lg:block" />

      <div className="space-y-4">
        {journeySteps.map((step, i) => (
          <FadeIn key={step.number} delay={i * 80}>
            <div
              className={`relative flex gap-8 rounded-3xl p-7 transition-all duration-300 ${
                step.highlight
                  ? "bg-primary text-primary-foreground shadow-level-3"
                  : "surface-card hover:shadow-level-2"
              }`}
            >
              {/* Desktop: step number on the rail */}
              <div className="hidden shrink-0 items-center justify-center lg:flex">
                <span
                  className={`flex size-9 items-center justify-center rounded-full font-display text-sm font-extrabold ${
                    step.highlight ? "bg-cta text-white" : "bg-primary-fixed text-primary"
                  }`}
                >
                  {step.number}
                </span>
              </div>

              <div className="flex-1">
                {/* Mobile: number bubble */}
                <span
                  className={`mb-2 inline-flex size-8 items-center justify-center rounded-full font-display text-xs font-extrabold lg:hidden ${
                    step.highlight ? "bg-cta text-white" : "bg-primary-fixed text-primary"
                  }`}
                >
                  {step.number}
                </span>

                {/* Icon + title row */}
                <div className="flex items-center gap-3">
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                    step.highlight ? "bg-primary-foreground/15" : "bg-primary-fixed"
                  }`}>
                    <step.icon className={`size-5 ${step.highlight ? "text-primary-foreground" : "text-primary"}`} />
                  </div>
                  <h3 className={`font-display text-xl font-bold ${
                    step.highlight ? "text-primary-foreground" : "text-foreground"
                  }`}>
                    {step.title}
                  </h3>
                </div>

                <p className={`mt-3 text-sm leading-6 ${
                  step.highlight ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}>
                  {step.text}
                </p>

                {step.cta && (
                  <a
                    href={step.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 font-semibold text-white shadow-level-2 transition-all hover:-translate-y-0.5 hover:shadow-level-3"
                  >
                    <WaIcon className="size-5" />
                    {step.cta.label}
                  </a>
                )}
              </div>

              {step.highlight && (
                <div className="pointer-events-none absolute -right-3 -top-3 flex size-12 items-center justify-center rounded-full bg-cta text-white shadow-level-2">
                  <Check className="size-5" />
                </div>
              )}
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Home component
// ---------------------------------------------------------------------------
function Home() {
  const { featured } = Route.useLoaderData();
  const hours = useBusinessHours();

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-inverse-primary/10 animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-cta/10 animate-float-slow [animation-delay:-4s]" />

        <div className="container-page relative grid gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div className="">
            <p className="text-label-sm uppercase text-inverse-primary">Sfax · {hours.tagline}</p>
            <h1 className="mt-4 text-display-lg">
              Des formations qui tiennent<br />dans le vrai travail.
            </h1>
            {/* Quotable entity sentence for AI assistants and search crawlers */}
            <p className="mt-3 text-base font-medium text-primary-foreground/90">
              Co.meet Space est un centre de formation professionnelle à Sfax, Tunisie,
              spécialisé en management, communication, numérique et bureautique.
            </p>
            <p className="mt-3 max-w-xl text-lg leading-8 text-primary-foreground/75">
              Management, communication, numérique. Groupes de 15 maximum,
              formateurs encore en activité. Résultats applicables dès le lundi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={WA_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 font-semibold text-white shadow-level-2 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-level-3"
              >
                <WaIcon className="size-5" />
                Nous contacter
              </a>
              <Link
                to="/formations"
                className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/25 px-6 py-3.5 font-semibold text-primary-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-primary-foreground/10"
              >
                Voir le catalogue <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Hero photo — priority (eager + fetchpriority=high), explicit aspect ratio
              so mobile layout reserves space before the image is fetched */}
          <div className="relative aspect-[4/3] rounded-3xl bg-primary/20">
            <Img
              image={venueImage("accueil-du-centre")}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full rounded-3xl border border-primary-foreground/15 object-cover shadow-level-3 transition-transform duration-500 ease-out hover:scale-[1.01]"
            />
          </div>
        </div>
      </section>

      {/* ── Featured courses ──────────────────────────────────────── */}
      <section className="container-page py-20">
        <FadeIn>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-label-sm uppercase text-secondary">Catalogue</p>
              <h2 className="mt-2 text-headline-lg">Formations à la une</h2>
            </div>
            <Link to="/formations" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Tout le catalogue →
            </Link>
          </div>
        </FadeIn>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((c, i) => (
            <FadeIn key={c.slug} delay={i * 80}>
              <CourseCard course={c} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────────────────── */}
      <section className="bg-sage/30">
        <Timeline />
      </section>

      {/* ── Journey steps ─────────────────────────────────────────── */}
      <section className="container-page py-20">
        <FadeIn>
          <div className="mb-12 max-w-xl">
            <p className="text-label-sm uppercase text-secondary">Comment ça marche</p>
            <h2 className="mt-2 text-headline-lg">De la décision à la certification</h2>
            <p className="mt-3 text-muted-foreground">
              Quatre étapes. La deuxième prend moins de 2 minutes.
            </p>
          </div>
        </FadeIn>
        <JourneySteps />
      </section>

      {/* ── Booking notification ──────────────────────────────────── */}
      <section className="container-page py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <div>
              <p className="text-label-sm uppercase text-secondary">Réservation rapide</p>
              <h2 className="mt-2 text-headline-lg">
                Votre place en 2 minutes<br />sur WhatsApp.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Pas de formulaire. Pas de délai de 48h. On vérifie les disponibilités
                et on vous confirme immédiatement.
              </p>
              <a
                href={WA_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 font-semibold text-white shadow-level-2 transition-all hover:-translate-y-0.5"
              >
                <WaIcon className="size-5" />
                Écrire maintenant sur WhatsApp
              </a>
            </div>
          </FadeIn>
          <BookingNotification />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <FaqSection items={buildFaq(hours)} />

      {/* ── Location map ──────────────────────────────────────────── */}
      <section className="bg-primary py-20 text-primary-foreground">
        <FadeIn>
          <div className="container-page">
            <p className="text-label-sm uppercase text-inverse-primary">Nous trouver</p>
            <h2 className="mt-3 max-w-xl text-display-lg">
              Comeet Space, Sfax.
            </h2>
            <p className="mt-4 max-w-lg text-lg text-primary-foreground/70">
              Rte de Mahdia Km 5.5, 3011 Sfax · {hours.tagline}
            </p>
            <div
              className="mt-8 w-full overflow-hidden rounded-3xl border border-primary-foreground/15 shadow-level-3"
              style={{ aspectRatio: "4/3", maxHeight: "480px" }}
            >
              <iframe
                title="Localisation Co.meet Space"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3276.863523698389!2d10.77550011094249!3d34.78421087861503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1301d34ae0af3fbb%3A0x336b30919b7fc3d6!2sCoMeetSpace!5e0!3m2!1sfr!2stn!4v1790507237330!5m2!1sfr!2stn"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
