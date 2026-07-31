import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, CalendarDays, Sparkles, Users } from "lucide-react";
import heroImage from "@/assets/hero-formation.jpg";
import { CourseCard } from "@/components/site/CourseCard";
import { courses } from "@/data/courses";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Co.meet Space — Centre de formation professionnelle à Lyon" },
      {
        name: "description",
        content:
          "Formations courtes en management, communication et numérique. Sessions en présentiel, hybride ou à distance, éligibles au financement OPCO.",
      },
      { property: "og:title", content: "Co.meet Space — Centre de formation à Lyon" },
      {
        property: "og:description",
        content:
          "Formations courtes en management, communication et numérique, animées par des praticiens.",
      },
    ],
  }),
  component: Home,
});

const stats = [
  { value: "1 200+", label: "apprenants formés" },
  { value: "96 %", label: "de satisfaction" },
  { value: "28", label: "formateurs praticiens" },
  { value: "12", label: "ans d'expérience" },
];

const steps = [
  {
    icon: CalendarDays,
    title: "Choisissez votre session",
    text: "Catalogue à jour, dates et places restantes affichées en temps réel.",
  },
  {
    icon: Users,
    title: "Inscrivez vos équipes",
    text: "Inscription individuelle ou groupée, prise en charge OPCO accompagnée.",
  },
  {
    icon: BadgeCheck,
    title: "Repartez avec du concret",
    text: "Supports, attestation et suivi post-formation à 30 jours.",
  },
];

const testimonials = [
  {
    quote:
      "Une formation dense, sans blabla. Nos managers ont mis les rituels en place la semaine suivante.",
    name: "Claire Vasseur",
    role: "DRH, Groupe Métalis",
  },
  {
    quote:
      "L'accompagnement administratif sur le financement nous a fait gagner un temps fou.",
    name: "Julien Mercier",
    role: "Dirigeant, Atelier Nord",
  },
];

function Home() {
  const featured = courses.filter((c) => c.featured);

  return (
    <>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-inverse-primary/10" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-cta/10" />
        <div className="container-page relative grid gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-label-sm uppercase text-inverse-primary">
              <Sparkles className="size-3.5" /> Certifié Qualiopi
            </span>
            <h1 className="mt-6 text-display-lg">
              Des formations qui tiennent
              <br />
              dans le vrai travail.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-primary-foreground/75">
              Co.meet Space forme les équipes de PME et de collectivités à Lyon :
              management, communication, numérique. Des sessions courtes, animées
              par des praticiens, immédiatement applicables.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/formations"
                className="inline-flex items-center gap-2 rounded-xl bg-cta px-6 py-3.5 font-semibold text-cta-foreground transition-transform hover:-translate-y-0.5"
              >
                Voir le catalogue <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center rounded-xl border border-primary-foreground/25 px-6 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                Formation sur mesure
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Session de formation professionnelle dans les locaux de Co.meet Space"
              width={1600}
              height={1200}
              className="w-full rounded-3xl border border-primary-foreground/15 object-cover shadow-level-3"
            />
          </div>
        </div>

        <div className="border-t border-primary-foreground/10">
          <dl className="container-page grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-3xl font-extrabold text-inverse-primary">
                  {s.value}
                </dt>
                <dd className="mt-1 text-sm text-primary-foreground/60">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-label-sm uppercase text-secondary">Catalogue</p>
            <h2 className="mt-2 text-headline-lg">Formations à la une</h2>
          </div>
          <Link to="/formations" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Toutes les formations →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      </section>

      <section className="bg-sage/50 py-20">
        <div className="container-page">
          <h2 className="max-w-lg text-headline-lg">Comment se déroule une inscription</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="surface-card p-7">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary-fixed text-primary">
                  <s.icon className="size-5" />
                </div>
                <p className="mt-5 text-label-sm uppercase text-muted-foreground">
                  Étape {i + 1}
                </p>
                <h3 className="mt-1 text-headline-md">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <figure key={t.name} className="surface-card p-8">
              <blockquote className="font-display text-xl leading-8 text-foreground">
                « {t.quote} »
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </span>
                <span className="text-sm">
                  <span className="block font-semibold">{t.name}</span>
                  <span className="text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="container-page pb-8">
        <div className="rounded-3xl bg-tertiary px-8 py-14 text-tertiary-foreground md:px-14">
          <h2 className="max-w-xl text-headline-lg">
            Un besoin spécifique ? Nous construisons la formation avec vous.
          </h2>
          <p className="mt-4 max-w-xl text-tertiary-foreground/70">
            Audit des besoins, programme sur mesure, animation dans vos locaux ou
            chez nous. Réponse sous 48 h ouvrées.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cta px-6 py-3.5 font-semibold text-cta-foreground transition-transform hover:-translate-y-0.5"
          >
            Parler de mon projet <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
