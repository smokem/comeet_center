import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { CourseCard } from "@/components/site/CourseCard";
import { levels, modeLabel, type Course, type Mode } from "@/data/courses";
import { listCourses } from "@/lib/courses-api";
import { FadeIn } from "@/lib/fade-in";
import { catalogBreadcrumbJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/formations/")({
  loader: async (): Promise<{ courses: Course[] }> => {
    try {
      const courses = await listCourses();
      return { courses };
    } catch {
      return { courses: [] };
    }
  },

  head: () => ({
    ...pageHead({
      title:       "Catalogue de formations — Co.meet Space",
      description: "Toutes les formations Co.meet Space à Sfax : management, communication, numérique et bureautique. Présentiel, hybride ou en ligne. Inscriptions ouvertes.",
      path:        "/formations",
      jsonLd:      catalogBreadcrumbJsonLd(),
    }),
  }),

  component: Catalog,
});

const modes: Mode[] = ["presentiel", "hybride", "en-ligne"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={active
        ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        : "rounded-full bg-primary-fixed/60 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-fixed"
      }>
      {children}
    </button>
  );
}

function Catalog() {
  const { courses } = Route.useLoaderData();

  const categories = useMemo(
    () => Array.from(new Set(courses.map((c) => c.category))).sort(),
    [courses],
  );

  const [category, setCategory] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);

  const filtered = useMemo(
    () => courses.filter((c) =>
      (!category || c.category === category) &&
      (!level || c.level === level) &&
      (!mode || c.mode === mode),
    ),
    [courses, category, level, mode],
  );

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border/70 bg-sage/50">
        <div className="container-page py-14">
          <FadeIn>
            <p className="text-label-sm uppercase text-secondary">Catalogue 2026</p>
            <h1 className="mt-2 max-w-2xl text-display-lg text-primary">
              Trouvez la formation qu'il vous faut
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              {courses.length} formation{courses.length > 1 ? "s" : ""} disponible
              {courses.length > 1 ? "s" : ""}, en présentiel à Sfax, en hybride ou à distance.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="container-page py-10">
        <FadeIn>
          <div className="surface-card space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-label-sm uppercase text-muted-foreground">Catégorie</span>
              <Chip active={!category} onClick={() => setCategory(null)}>Toutes</Chip>
              {categories.map((c) => (
                <Chip key={c} active={category === c} onClick={() => setCategory(c)}>{c}</Chip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-label-sm uppercase text-muted-foreground">Niveau</span>
              <Chip active={!level} onClick={() => setLevel(null)}>Tous</Chip>
              {levels.map((l) => (
                <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l}</Chip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-label-sm uppercase text-muted-foreground">Format</span>
              <Chip active={!mode} onClick={() => setMode(null)}>Tous</Chip>
              {modes.map((m) => (
                <Chip key={m} active={mode === m} onClick={() => setMode(m)}>{modeLabel[m]}</Chip>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <p className="mt-8 text-sm text-muted-foreground">
            {filtered.length} formation{filtered.length > 1 ? "s" : ""} correspondante{filtered.length > 1 ? "s" : ""}
          </p>
        </FadeIn>

        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <FadeIn key={c.slug} delay={i * 60}>
              <CourseCard course={c} />
            </FadeIn>
          ))}
        </div>

        {filtered.length === 0 && (
          <FadeIn>
            <div className="surface-card mt-4 p-10 text-center text-muted-foreground">
              Aucune formation ne correspond à ces critères pour le moment.
            </div>
          </FadeIn>
        )}
      </section>
    </>
  );
}
