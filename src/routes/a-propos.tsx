import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, HeartHandshake, Sparkles, Target } from "lucide-react";
import { useEffect, useState } from "react";

import { FadeIn } from "@/lib/fade-in";
import { VENUE_IMAGES } from "@/lib/venue-images";

export const Route = createFileRoute("/a-propos")({
  loader: () => ({}),

  head: () => ({
    meta: [
      { title: "Le centre de formation — Co.meet Space Sfax" },
      {
        name: "description",
        content:
          "Co.meet Space, centre de formation certifié Qualiopi à Sfax : pédagogie active, formateurs praticiens, groupes de 12 personnes maximum.",
      },
      { property: "og:title", content: "Le centre — Co.meet Space" },
      {
        property: "og:description",
        content:
          "Pédagogie active, formateurs praticiens, groupes de 12 personnes maximum, à Sfax.",
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
// Auto-advancing crossfade slideshow — no controls, pure CSS opacity
// ---------------------------------------------------------------------------
const SLIDE_DURATION = 4000; // ms each slide is visible
const FADE_DURATION  = 800;  // ms CSS transition (must match className below)

function VenueSlideshow() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (VENUE_IMAGES.length < 2) return;

    const timer = setInterval(() => {
      // Fade out
      setVisible(false);
      setTimeout(() => {
        // Advance, then fade in
        setCurrent((i) => (i + 1) % VENUE_IMAGES.length);
        setVisible(true);
      }, FADE_DURATION);
    }, SLIDE_DURATION + FADE_DURATION);

    return () => clearInterval(timer);
  }, []);

  const image = VENUE_IMAGES[current];
  if (!image) return null;

  return (
    <div className="relative aspect-[16/11] overflow-hidden rounded-3xl border border-border bg-sage/30 shadow-level-3">
      <img
        key={image.src}
        src={image.src}
        alt={image.label}
        className="h-full w-full object-cover"
        style={{
          opacity: visible ? 1 : 0,
          transition: `opacity ${FADE_DURATION}ms ease-in-out`,
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent pointer-events-none" />
      {/* Slide label */}
      <div
        className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground"
        style={{
          opacity: visible ? 1 : 0,
          transition: `opacity ${FADE_DURATION}ms ease-in-out`,
        }}
      >
        <p className="text-label-sm uppercase text-primary-foreground/60">
          {String(current + 1).padStart(2, "0")} / {VENUE_IMAGES.length}
        </p>
        <h3 className="mt-1 font-display text-2xl font-bold">{image.label}</h3>
      </div>
      {/* Dot indicators */}
      <div className="absolute bottom-5 right-6 flex gap-1.5">
        {VENUE_IMAGES.map((_, i) => (
          <span
            key={i}
            className="block size-1.5 rounded-full transition-all duration-300"
            style={{
              background: i === current ? "white" : "rgba(255,255,255,0.35)",
              transform: i === current ? "scale(1.4)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function About() {
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
              Co.meet Space est né en 2014 de la rencontre entre un espace de
              coworking sfaxien et des indépendants qui se formaient entre eux.
              Douze ans plus tard, nous sommes un organisme certifié Qualiopi qui
              forme plus de 1 200 personnes par an — sans avoir perdu l'esprit
              d'atelier des débuts.
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
          <div className="surface-card grid gap-8 p-8 md:grid-cols-2 md:p-12">
            <div>
              <h2 className="text-headline-lg">Notre approche pédagogique</h2>
              <p className="mt-4 text-muted-foreground">
                70 % de pratique, 30 % d'apport théorique. Les groupes sont limités
                à 12 personnes pour garantir du temps de parole à chacun, et chaque
                session est évaluée à chaud puis à froid.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-6">
              {[
                ["12", "participants max"],
                ["70 %", "de mise en pratique"],
                ["48 h", "de délai de réponse"],
                ["30 j", "de suivi post-formation"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-sage/60 p-5">
                  <dt className="font-display text-2xl font-extrabold text-primary">{value}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </FadeIn>
      </section>

      {/* ── Venue gallery ─────────────────────────────────────────── */}
      <section className="container-page pb-16">
        <FadeIn>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">

            {/* Left — info panel */}
            <div className="surface-card overflow-hidden p-8 md:p-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-3 py-1.5 text-label-sm uppercase text-primary">
                <Sparkles className="size-3.5" /> Visite guidée
              </div>
              <h2 className="mt-5 text-headline-lg text-primary">
                Un lieu vivant, pas juste des murs
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Voici le centre en images — {VENUE_IMAGES.length} photos.
                Chaque vue montre un détail de l'espace : accueil, salles d'atelier, coins pause et zones de travail.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  ["400 m²", "d'espaces modulables"],
                  ["3 salles", "de formation"],
                  ["Bibliothèque", "en accès libre"],
                  ["Salle de repos", "+ salle de jeux"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border bg-background p-4 transition-transform duration-300 ease-out hover:-translate-y-0.5"
                  >
                    <p className="font-display text-2xl font-extrabold text-primary">{value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — auto-crossfade slideshow */}
            <VenueSlideshow />
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
              <strong> 8 h à 22 h</strong> et le dimanche de
              <strong> 8 h à 17 h</strong>.
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
