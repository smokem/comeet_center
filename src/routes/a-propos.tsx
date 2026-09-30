import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Building2, HeartHandshake, LayoutGrid, Target } from "lucide-react";

import { FeatureCarousel } from "@/components/ui/feature-carousel";
import { FadeIn } from "@/lib/fade-in";
import { pageHead } from "@/lib/seo";
import { VENUE_IMAGES } from "@/lib/venue-images";
import { useBusinessHours } from "./__root";

export const Route = createFileRoute("/a-propos")({
  loader: () => ({}),

  head: () => ({
    ...pageHead({
      title:       "Le centre de formation Co.meet Space — Sfax",
      description: "Co.meet Space est un centre de formation professionnelle à Sfax, Tunisie. 400 m², 3 salles, formateurs praticiens, groupes de 15 personnes maximum.",
      path:        "/a-propos",
    }),
  }),
  component: About,
});

// ---------------------------------------------------------------------------
// Values
// ---------------------------------------------------------------------------
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
// Space stats — the 3 blocks requested
// ---------------------------------------------------------------------------
const spaceStats = [
  {
    icon: LayoutGrid,
    value: "400 m²",
    label: "Espace total",
    description: "Bibliothèque, salle de repos, terrasse et zones de coworking ouvertes toute la journée.",
  },
  {
    icon: BookOpen,
    value: "3 salles",
    label: "Salles de formation",
    description: "Chaque salle est équipée pour des groupes de 15 personnes maximum, avec matériel audiovisuel.",
  },
  {
    icon: Building2,
    value: "2 espaces",
    label: "Coworking & Bibliothèque",
    description: "Un espace coworking avec postes de travail et wifi rapide, et une bibliothèque professionnelle.",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
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
            {/* Quotable entity sentence */}
            <p className="mt-4 text-base font-medium text-foreground">
              Co.meet Space est un centre de formation professionnelle à Sfax, Tunisie,
              ouvert aux professionnels et aux entreprises qui souhaitent monter en compétences
              en management, communication, numérique, bureautique et design.
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
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

      {/* ── Space stats — 400 m² / 3 salles / Coworking & Bibliothèque ── */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-page py-16">
          <FadeIn>
            <p className="text-label-sm uppercase text-inverse-primary">L'espace</p>
            <h2 className="mt-2 text-headline-lg">Un lieu conçu pour apprendre et travailler</h2>
          </FadeIn>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {spaceStats.map((s, i) => (
              <FadeIn key={s.label} delay={i * 80}>
                <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-7 transition-all duration-300 hover:bg-primary-foreground/10">
                  <div className="flex size-11 items-center justify-center rounded-full bg-cta/20 text-cta">
                    <s.icon className="size-5" />
                  </div>
                  <p className="mt-5 font-display text-4xl font-extrabold text-inverse-primary">
                    {s.value}
                  </p>
                  <p className="mt-1 text-base font-semibold text-primary-foreground">
                    {s.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-primary-foreground/60">
                    {s.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Venue gallery — 3D fan carousel ──────────────────────── */}
      <section className="container-page py-16">
        <FadeIn>
          <p className="text-label-sm uppercase text-secondary">Visite virtuelle</p>
          <h2 className="mt-2 text-headline-lg text-primary">
            Le centre en images
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            {VENUE_IMAGES.length} photos — accueil, salles d'atelier, coins pause et zones de travail.
          </p>
        </FadeIn>
        <div className="mt-10">
          <FeatureCarousel images={VENUE_IMAGES} />
        </div>
        {/* Active slide label shown below the carousel */}
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
