import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, HeartHandshake, Target } from "lucide-react";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "Le centre de formation — Co.meet Space Lyon" },
      {
        name: "description",
        content:
          "Co.meet Space, centre de formation certifié Qualiopi à Lyon : pédagogie active, formateurs praticiens, groupes de 12 personnes maximum.",
      },
      { property: "og:title", content: "Le centre — Co.meet Space" },
      {
        property: "og:description",
        content: "Pédagogie active, formateurs praticiens, groupes de 12 personnes maximum, à Lyon.",
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
    text: "400 m² à Lyon 2e : salles modulables, espaces de travail et coin café ouvert toute la journée.",
  },
];

function About() {
  return (
    <>
      <section className="border-b border-border/70 bg-sage/50">
        <div className="container-page py-16">
          <p className="text-label-sm uppercase text-secondary">Le centre</p>
          <h1 className="mt-2 max-w-3xl text-display-lg text-primary">
            Un centre de formation né dans un espace de coworking
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Co.meet Space est né en 2014 de la rencontre entre un espace de
            coworking lyonnais et des indépendants qui se formaient entre eux.
            Douze ans plus tard, nous sommes un organisme certifié Qualiopi qui
            forme plus de 1 200 personnes par an — sans avoir perdu l'esprit
            d'atelier des débuts.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-6 py-16 md:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="surface-card p-7">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary-fixed text-primary">
              <v.icon className="size-5" />
            </div>
            <h2 className="mt-5 text-headline-md">{v.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{v.text}</p>
          </div>
        ))}
      </section>

      <section className="container-page pb-16">
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
      </section>

      <section className="container-page pb-8">
        <div className="rounded-3xl bg-tertiary px-8 py-14 text-tertiary-foreground md:px-14">
          <h2 className="max-w-xl text-headline-lg">Venez visiter le centre</h2>
          <p className="mt-4 max-w-xl text-tertiary-foreground/70">
            12 rue de la Fabrique, Lyon 2e. Portes ouvertes le premier jeudi de
            chaque mois, de 17 h à 19 h.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex rounded-xl bg-cta px-6 py-3.5 font-semibold text-cta-foreground transition-transform hover:-translate-y-0.5"
          >
            Nous écrire
          </Link>
        </div>
      </section>
    </>
  );
}
