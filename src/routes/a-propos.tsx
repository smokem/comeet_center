import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ChevronLeft, ChevronRight, HeartHandshake, Target } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { FadeIn } from "@/lib/fade-in";
import { VENUE_IMAGES } from "@/lib/venue-images";
import { useBusinessHours } from "./__root";

export const Route = createFileRoute("/a-propos")({
  loader: () => ({}),

  head: () => ({
    meta: [
      { title: "Le centre de formation — Co.meet Space Sfax" },
      {
        name: "description",
        content:
          "Co.meet Space, centre de formation professionnelle à Sfax : pédagogie active, formateurs praticiens, groupes de 15 personnes maximum.",
      },
      { property: "og:title", content: "Le centre — Co.meet Space" },
      {
        property: "og:description",
        content:
          "Pédagogie active, formateurs praticiens, groupes de 15 personnes maximum, à Sfax.",
      },
    ],
  }),
  component: About,
});

const values = [
  {
    icon: Target,
    title: "Utile dès lundi",
    text: "Chaque module se termine par un plan d'action personnel, revu 30 jours plus tard.",
  },
  {
    icon: HeartHandshake,
    title: "Des praticiens, pas des récitants",
    text: "Nos formateurs exercent encore leur métier. Ils apportent des cas réels, pas des slides.",
  },
  {
    icon: Building2,
    title: "Un lieu, pas une salle",
    text: "400 m² à Sfax : bibliothèque, salle de repos, salle de jeux et espaces de formation ouverts toute la journée.",
  },
];

// ---------------------------------------------------------------------------
// VenueCarousel — manual swipe/click with auto-advance
// Auto-advances every SLIDE_DURATION ms; manual interaction resets the timer.
// ---------------------------------------------------------------------------
const SLIDE_DURATION = 5000; // ms between auto-advances

function VenueCarousel() {
  const [current, setCurrent] = useState(0);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX = useRef<number | null>(null);
  const total = VENUE_IMAGES.length;

  // Reset the auto-advance timer (called after any manual navigation)
  const resetTimer = useCallback(() => {
    if (autoTimer.current) clearInterval(autoTimer.current);
    autoTimer.current = setInterval(() => {
      setCurrent((i) => (i + 1) % total);
    }, SLIDE_DURATION);
  }, [total]);

  // Start auto-advance on mount
  useEffect(() => {
    resetTimer();
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, [resetTimer]);

  function goTo(index: number) {
    setCurrent((index + total) % total);
    resetTimer();
  }

  function prev() { goTo(current - 1); }
  function next() { goTo(current + 1); }

  // Touch / mouse swipe
  function onDragStart(x: number) { dragStartX.current = x; }
  function onDragEnd(x: number) {
    if (dragStartX.current === null) return;
    const delta = dragStartX.current - x;
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev();
    dragStartX.current = null;
  }

  const image = VENUE_IMAGES[current];
  if (!image) return null;

  return (
    <div
      className="relative aspect-[16/11] overflow-hidden rounded-3xl border border-border bg-sage/30 shadow-level-3 cursor-grab active:cursor-grabbing select-none"
      onMouseDown={(e) => onDragStart(e.clientX)}
      onMouseUp={(e) => onDragEnd(e.clientX)}
      onMouseLeave={() => { dragStartX.current = null; }}
      onTouchStart={(e) => onDragStart(e.touches[0]!.clientX)}
      onTouchEnd={(e) => onDragEnd(e.changedTouches[0]!.clientX)}
    >
      {/* Image — CSS fade between slides */}
      <img
        key={image.src}
        src={image.src}
        alt={image.label}
        className="h-full w-full object-cover transition-opacity duration-500 pointer-events-none"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent pointer-events-none" />

      {/* Prev / Next arrows */}
      <button
        type="button"
        aria-label="Photo précédente"
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-primary/60 text-primary-foreground backdrop-blur-sm transition hover:bg-primary"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Photo suivante"
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-primary/60 text-primary-foreground backdrop-blur-sm transition hover:bg-primary"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Slide label */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground pointer-events-none">
        <p className="text-label-sm uppercase text-primary-foreground/60">
          {String(current + 1).padStart(2, "0")} / {total}
        </p>
        <h3 className="mt-1 font-display text-2xl font-bold">{image.label}</h3>
      </div>

      {/* Dot indicators — clickable */}
      <div className="absolute bottom-5 right-6 flex gap-1.5">
        {VENUE_IMAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Photo ${i + 1}`}
            onClick={() => goTo(i)}
            className="block rounded-full transition-all duration-300"
            style={{
              width: i === current ? "1rem" : "0.375rem",
              height: "0.375rem",
              background: i === current ? "white" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function About() {
  const hours = useBusinessHours();
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="border-b border-border/70 bg-sage/50">
        <div className="container-page py-16">
          <FadeIn>
            <p className="text-label-sm uppercase text-secondary">Le centre</p>
            <h1 className="mt-2 max-w-3xl text-display-lg text-primary">
              Un centre de formation né dans un espace de coworking
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Co.meet Space est né de la rencontre entre un espace de coworking
              sfaxien et des indépendants qui se formaient entre eux.
              Aujourd'hui, nous sommes un centre de formation professionnelle
              à Sfax — avec l'esprit d'atelier des débuts.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────── */}
      <section className="container-page grid gap-6 py-16 md:grid-cols-3">
        {values.map((v, i) => (
          <FadeIn key={v.title} delay={i * 80}>
            <div className="surface-card p-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-level-2">
              <div className="flex size-11 items-center justify-center rounded-full bg-primary-fixed text-primary">
                <v.icon className="size-5" />
              </div>
              <h2 className="mt-5 text-headline-md">{v.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{v.text}</p>
            </div>
          </FadeIn>
        ))}
      </section>

      {/* ── Pedagogy ──────────────────────────────────────────────── */}
      <section className="container-page pb-16">
        <FadeIn>
          <div className="surface-card p-8 md:p-12">
            <h2 className="text-headline-lg">Notre approche pédagogique</h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Les groupes sont limités à 15 personnes pour garantir du temps
              de parole à chacun. Nos formateurs exercent encore leur métier —
              ils apportent des cas réels, pas des slides. Chaque session est
              évaluée à chaud puis à froid.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ── Venue gallery ─────────────────────────────────────────── */}
      <section className="container-page pb-16">
        <FadeIn>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">

            {/* Left — info panel */}
            <div className="surface-card overflow-hidden p-8 md:p-10">
              <h2 className="mt-5 text-headline-lg text-primary">
                Un lieu vivant, pas juste des murs
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Voici le centre en images — {VENUE_IMAGES.length} photos.
                Chaque vue montre un détail de l'espace : accueil, salles d'atelier, coins pause et zones de travail.
              </p>
            </div>

            {/* Right — manual carousel with auto-advance */}
            <VenueCarousel />
          </div>
        </FadeIn>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="container-page pb-24">
        <FadeIn>
          <div className="rounded-3xl bg-tertiary px-8 py-14 text-tertiary-foreground md:px-14">
            <h2 className="max-w-xl text-headline-lg">Venez visiter le centre</h2>
            <p className="mt-4 max-w-xl text-sm text-tertiary-foreground/70">
              Rte de Mahdia 5.5, Sfax 3011. Ouvert du lundi au samedi de
              <strong> {hours.weekdayHoursProse}</strong> et le dimanche de
              <strong> {hours.sundayHoursProse}</strong>.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex rounded-xl bg-cta px-6 py-3.5 font-semibold text-cta-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-level-2"
            >
              Nous écrire
            </Link>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
