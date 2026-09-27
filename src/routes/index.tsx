import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CourseCard } from "@/components/site/CourseCard";
import { type Course } from "@/data/courses";
import { listCourses } from "@/lib/courses-api";
import { VENUE_IMAGES } from "@/lib/venue-images";

const WA_HREF = "https://wa.me/21622489100";
const WA_NUMBER = "+216 22 489 100";

// ---------------------------------------------------------------------------
// Venue photo helpers — resolve paths from the shared VENUE_IMAGES list
// so the timeline and hero stay in sync with the single source of truth.
// ---------------------------------------------------------------------------
function venuePhoto(filename: string): string {
  const match = VENUE_IMAGES.find((img) => img.src.endsWith(filename));
  return match?.src ?? `/venue/${filename}`;
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
    meta: [
      { title: "Co.meet Space — Centre de formation professionnelle à Sfax" },
      { name: "description", content: "Formations courtes en management, communication et numérique à Sfax. Appelez le +216 22 489 100." },
      { property: "og:title", content: "Co.meet Space — Centre de formation à Sfax" },
    ],
  }),
  component: Home,
});

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

// Each timeline step carries its own photo, sourced from venue-images.ts.
// Step 3 title is "Espace de coworking" (placeholder — confirm wording before
// shipping; description text also needs updating to match, see index.tsx note).
const timelineMoments = [
  {
    time: "08h30",
    label: "L'arrivée",
    text: "Café, bibliothèque ouverte, wifi. Le centre accueille dès 8h du matin — pas besoin de courir.",
    photo: venuePhoto("IMG_4061.webp"),
  },
  {
    time: "10h00",
    label: "En pleine session",
    text: "Groupe de 12 maximum. Le formateur pratique encore son métier. Vous travaillez sur vos vrais cas.",
    photo: venuePhoto("IMG_4058.webp"),
  },
  {
    time: "13h00",
    label: "Espace de coworking",
    text: "Entre deux sessions, le centre reste ouvert. Postes de travail, wifi rapide, café — les participants restent, travaillent, échangent.",
    photo: venuePhoto("IMG_4063.webp"),
  },
  {
    time: "19h00",
    label: "Le cours du soir",
    text: "Le centre est ouvert jusqu'à 22h. Idéal pour les professionnels qui ne peuvent pas se libérer en journée.",
    photo: venuePhoto("IMG_4053.webp"),
  },
];

const journeySteps = [
  {
    number: "01",
    title: "Choisissez une formation",
    text: "Management, communication, numérique ou bureautique. Filtrez par niveau et format dans le catalogue.",
    cta: null,
  },
  {
    number: "02",
    title: "Appelez ou écrivez sur WhatsApp",
    text: "On répond en moins de 2 minutes. On vérifie les places disponibles et on bloque votre session.",
    cta: { label: WA_NUMBER, href: WA_HREF },
    highlight: true,
  },
  {
    number: "03",
    title: "Suivez la session",
    text: "Présentiel à Sfax, hybride ou en ligne. Supports remis le jour même, formateur joignable après.",
    cta: null,
  },
  {
    number: "04",
    title: "Recevez votre certificat",
    text: "Attestation de formation délivrée sous 48h. Suivi à 30 jours inclus.",
    cta: null,
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

import { FadeIn, useFadeIn } from "@/lib/fade-in";

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
              Manager une équipe hybride · Lun 14h · Sfax
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">maintenant</span>
        </div>
        {/* Pulse ring */}
        <div className={`absolute -inset-1 rounded-2xl border-2 border-[#25D366]/30 transition-all duration-1000 ${show ? "opacity-0 scale-110" : "opacity-0"}`} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeline — progress indicator bar
// Rendered OUTSIDE the photo container on desktop (to the right of the image).
// On mobile it appears as a small badge in the top-right corner of each photo.
// ---------------------------------------------------------------------------
function ProgressBar({
  activeIndex,
  total,
}: {
  activeIndex: number;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-500 ${
            i === activeIndex
              ? "w-8 bg-cta"
              : i < activeIndex
              ? "w-4 bg-primary/40"
              : "w-4 bg-border"
          }`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sticky timeline — desktop: pinned scroll-scrub with side-by-side layout.
// Mobile: simple stacked sequence, no pinning.
// ---------------------------------------------------------------------------
function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const { top, height } = container.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -top / (height - window.innerHeight)));
      setActiveIndex(
        Math.min(timelineMoments.length - 1, Math.floor(progress * timelineMoments.length)),
      );
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = timelineMoments[activeIndex]!;

  return (
    <div ref={containerRef} style={{ height: `${timelineMoments.length * 100}vh` }} className="relative">

      {/* ── DESKTOP: sticky side-by-side panel ── */}
      <div className="sticky top-14 hidden h-[calc(100vh-3.5rem)] items-center overflow-hidden lg:flex">
        <div className="container-page grid h-full w-full gap-8 py-12 lg:grid-cols-[1fr_1.4fr_auto] lg:items-center">

          {/* Col 1 — time scrubber */}
          <div className="flex flex-col justify-center">
            <FadeIn>
              <p className="text-label-sm uppercase text-secondary">Une journée au centre</p>
              <h2 className="mt-3 text-headline-lg text-primary">
                Ouvert de 8h à 22h.<br />Chaque heure compte.
              </h2>
            </FadeIn>

            <div className="mt-10 space-y-2">
              {timelineMoments.map((m, i) => (
                <button
                  key={m.time}
                  type="button"
                  onClick={() => {
                    const container = containerRef.current;
                    if (!container) return;
                    const targetProgress = (i + 0.5) / timelineMoments.length;
                    const containerTop =
                      container.getBoundingClientRect().top + window.scrollY;
                    const scrollTarget =
                      containerTop +
                      targetProgress * (container.offsetHeight - window.innerHeight);
                    window.scrollTo({ top: scrollTarget, behavior: "smooth" });
                  }}
                  className={`group flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-all duration-300 ${
                    i === activeIndex
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/5 text-muted-foreground"
                  }`}
                >
                  <span
                    className={`font-display text-2xl font-extrabold tabular-nums transition-all ${
                      i === activeIndex ? "text-inverse-primary" : "text-primary/30"
                    }`}
                  >
                    {m.time}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        i === activeIndex ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {m.label}
                    </p>
                    {i === activeIndex && (
                      <p className="mt-0.5 text-xs leading-5 text-primary-foreground/75 line-clamp-2">
                        {m.text}
                      </p>
                    )}
                  </div>
                </button>
              ))}
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
          </div>

          {/* Col 2 — photo (no indicator inside) */}
          <div
            className="relative overflow-hidden rounded-3xl bg-primary/10"
            style={{ height: "min(70vh, 560px)" }}
          >
            <img
              key={active.photo}
              src={active.photo}
              alt={active.label}
              className="h-full w-full object-cover transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="font-display text-3xl font-extrabold text-inverse-primary">
                {active.time}
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold text-primary-foreground">
                {active.label}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-primary-foreground/80">
                {active.text}
              </p>
            </div>
          </div>

          {/* Col 3 — progress indicator, outside the photo to its right */}
          <div className="flex items-center self-center">
            <ProgressBar activeIndex={activeIndex} total={timelineMoments.length} />
          </div>
        </div>
      </div>

      {/* ── MOBILE: stacked sequence, no pinning ── */}
      <div className="lg:hidden">
        <div className="container-page py-12">
          <p className="text-label-sm uppercase text-secondary">Une journée au centre</p>
          <h2 className="mt-3 text-headline-lg text-primary">
            Ouvert de 8h à 22h.<br />Chaque heure compte.
          </h2>

          <div className="mt-8 space-y-10">
            {timelineMoments.map((m) => (
              <div key={m.time} className="space-y-4">
                {/* Photo with time badge in top-right corner */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-primary/10">
                  <img
                    src={m.photo}
                    alt={m.label}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                  {/* Time badge — top-right corner of the photo */}
                  <div className="absolute right-3 top-3 rounded-xl bg-cta px-3 py-1.5 font-display text-sm font-extrabold text-white shadow-level-2">
                    {m.time}
                  </div>
                </div>
                {/* Text block */}
                <div>
                  <p className="font-display text-xl font-bold text-primary">{m.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
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
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Journey steps (scroll-reveal numbered list)
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
              {/* Step number bubble on the rail */}
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
                {/* Mobile number */}
                <span
                  className={`mb-2 inline-flex size-8 items-center justify-center rounded-full font-display text-xs font-extrabold lg:hidden ${
                    step.highlight ? "bg-cta text-white" : "bg-primary-fixed text-primary"
                  }`}
                >
                  {step.number}
                </span>
                <h3
                  className={`font-display text-xl font-bold ${
                    step.highlight ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`mt-2 text-sm leading-6 ${
                    step.highlight ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
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

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-inverse-primary/10 animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-cta/10 animate-float-slow [animation-delay:-4s]" />

        <div className="container-page relative grid gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div className="animate-fade-in-up">
            <p className="text-label-sm uppercase text-inverse-primary">Sfax · Lun–Sam 8h–22h · Dim 8h–17h</p>
            <h1 className="mt-4 text-display-lg">
              Des formations qui tiennent<br />dans le vrai travail.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-primary-foreground/75">
              Management, communication, numérique. Groupes de 12 maximum,
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
                {WA_NUMBER}
              </a>
              <Link
                to="/formations"
                className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/25 px-6 py-3.5 font-semibold text-primary-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-primary-foreground/10"
              >
                Voir le catalogue <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Hero photo — real venue photo 4061 (Accueil) */}
          <div className="relative animate-fade-in-up [animation-delay:120ms]">
            <img
              src={venuePhoto("IMG_4061.webp")}
              alt="Accueil du centre Co.meet Space à Sfax"
              width={1600}
              height={1200}
              className="w-full rounded-3xl border border-primary-foreground/15 object-cover shadow-level-3 transition-transform duration-500 ease-out hover:scale-[1.01]"
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
                Écrire maintenant — {WA_NUMBER}
              </a>
            </div>
          </FadeIn>
          <BookingNotification />
        </div>
      </section>

      {/* ── Location map ──────────────────────────────────────────── */}
      <section className="bg-primary py-20 text-primary-foreground">
        <FadeIn>
          <div className="container-page">
            <p className="text-label-sm uppercase text-inverse-primary">Nous trouver</p>
            <h2 className="mt-3 max-w-xl text-display-lg">
              Co.meet Space, Sfax.
            </h2>
            <p className="mt-4 max-w-lg text-lg text-primary-foreground/70">
              Rte de Mahdia Km 5.5, 3011 Sfax · Lun–Sam 8h–22h · Dim 8h–17h
            </p>
            {/* Responsive map container — aspect-ratio 4/3 matches the 800×600 embed */}
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
