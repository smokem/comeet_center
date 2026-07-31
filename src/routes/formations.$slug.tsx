import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Check, Clock, MapPin, Users } from "lucide-react";
import { formatDate, formatPrice, getCourse, modeLabel, type Course } from "@/data/courses";

export const Route = createFileRoute("/formations/$slug")({
  loader: ({ params }): { course: Course } => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    return { course };
  },

  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Formation introuvable — Co.meet Space" }, { name: "robots", content: "noindex" }],
      };
    }
    const { course } = loaderData;
    const description = course.excerpt;
    return {
      meta: [
        { title: `${course.title} — Formation Co.meet Space` },
        { name: "description", content: description },
        { property: "og:title", content: `${course.title} — Co.meet Space` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CourseDetail,
});

function CourseDetail() {
  const { course } = Route.useLoaderData() as { course: Course };

  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="container-page py-14">
          <Link
            to="/formations"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground"
          >
            <ArrowLeft className="size-4" /> Retour au catalogue
          </Link>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary-foreground/10 px-3 py-1.5 text-label-sm uppercase text-inverse-primary">
              {course.category}
            </span>
            <span className="rounded-full bg-primary-foreground/10 px-3 py-1.5 text-label-sm uppercase text-inverse-primary">
              {modeLabel[course.mode]}
            </span>
            <span className="rounded-full bg-primary-foreground/10 px-3 py-1.5 text-label-sm uppercase text-inverse-primary">
              {course.level}
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl text-display-lg">{course.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-primary-foreground/75">
            {course.description}
          </p>
        </div>
      </section>

      <section className="container-page grid gap-10 py-14 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="space-y-10">
          <div>
            <h2 className="text-headline-lg">Objectifs pédagogiques</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {course.objectives.map((o) => (
                <li key={o} className="flex gap-3 rounded-2xl bg-sage/60 p-4 text-sm leading-6">
                  <Check className="mt-0.5 size-4 shrink-0 text-secondary" />
                  {o}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-headline-lg">Programme</h2>
            <ol className="mt-6 space-y-4">
              {course.syllabus.map((s, i) => (
                <li key={s.title} className="surface-card flex gap-5 p-6">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-display font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-headline-lg">Votre formateur</h2>
            <div className="surface-card mt-6 flex flex-wrap items-center gap-5 p-6">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                {course.trainer.initials}
              </span>
              <div className="min-w-56 flex-1">
                <p className="font-display text-lg font-semibold">{course.trainer.name}</p>
                <p className="text-sm text-secondary">{course.trainer.role}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{course.trainer.bio}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="surface-card sticky top-24 overflow-hidden">
          <div className="border-b border-border/70 bg-sage/60 px-6 py-5">
            <p className="text-label-sm uppercase text-muted-foreground">Tarif par personne</p>
            <p className="font-display text-3xl font-extrabold text-primary">
              {formatPrice(course.price)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Net de taxes · finançable OPCO</p>
          </div>

          <div className="space-y-3 px-6 py-5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Clock className="size-4 text-primary/70" /> {course.durationHours} heures
            </p>
            <p className="flex items-center gap-2">
              <Users className="size-4 text-primary/70" /> 12 participants maximum
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-primary/70" /> {modeLabel[course.mode]}
            </p>
          </div>

          <div className="border-t border-border/70 px-6 py-5">
            <p className="text-label-sm uppercase text-muted-foreground">Prochaines sessions</p>
            <ul className="mt-4 space-y-3">
              {course.sessions.map((s) => (
                <li key={s.start} className="rounded-2xl border border-border p-4">
                  <p className="flex items-center gap-2 font-semibold">
                    <CalendarDays className="size-4 text-secondary" />
                    {formatDate(s.start)}
                    {s.end !== s.start && ` → ${formatDate(s.end)}`}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.city} · {s.seatsLeft} place{s.seatsLeft > 1 ? "s" : ""} restante
                    {s.seatsLeft > 1 ? "s" : ""}
                  </p>
                </li>
              ))}
            </ul>

            <Link
              to="/contact"
              className="mt-5 flex w-full items-center justify-center rounded-xl bg-cta px-5 py-3.5 font-semibold text-cta-foreground transition-transform hover:-translate-y-0.5"
            >
              Demander une inscription
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
