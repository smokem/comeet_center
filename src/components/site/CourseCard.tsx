import { formatPrice, modeLabel, type Course } from "@/data/courses";
import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Users } from "lucide-react";

// ---------------------------------------------------------------------------
// Resolve per-field visibility — every key defaults to true when absent.
// This means existing courses with no cardTextVisibility field are unaffected.
// ---------------------------------------------------------------------------
function vis(course: Course) {
  const v = course.cardTextVisibility ?? {};
  return {
    badges:  v.badges  !== false,
    title:   v.title   !== false,
    excerpt: v.excerpt !== false,
    meta:    v.meta    !== false,
    price:   v.price   !== false,
    cta:     v.cta     !== false,
  };
}

export function CourseCard({ course }: { course: Course }) {
  const next = course.sessions[0];
  const show = vis(course);

  // If every field is hidden, we still need an accessible label for screen readers.
  const allHidden = !show.badges && !show.title && !show.excerpt && !show.meta && !show.price && !show.cta;

  // Whether the bottom price/cta bar has anything to render
  const showBottomBar = show.price || show.cta;

  // Whether the body section has anything to render (title, excerpt, meta, or bottom bar)
  const showBody = show.title || show.excerpt || show.meta || showBottomBar;

  return (
    <Link
      to="/formations/$slug"
      params={{ slug: course.slug }}
      className="surface-card group flex flex-col overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-level-2"
    >
      {/* Always-present sr-only label when all visible text is hidden */}
      {allHidden && (
        <span className="sr-only">
          {course.title} — {course.category} — {modeLabel[course.mode]}
        </span>
      )}

      {/* ── Top badges strip ──────────────────────────────────────── */}
      {show.badges && (
        <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-sage/60 px-6 py-4">
          <span className="text-label-sm uppercase text-primary">{course.category}</span>
          <span className="rounded-full bg-primary-fixed px-2.5 py-1 text-label-sm text-primary">
            {modeLabel[course.mode]}
          </span>
        </div>
      )}

      {/* ── Body ─────────────────────────────────────────────────── */}
      {showBody && (
        <div className="flex flex-1 flex-col p-6">
          {show.title && (
            <h3 className="text-headline-md text-foreground transition-colors duration-300 group-hover:text-primary">
              {course.title}
            </h3>
          )}

          {/* sr-only title when title is hidden but card is otherwise visible */}
          {!show.title && !allHidden && (
            <span className="sr-only">{course.title}</span>
          )}

          {show.excerpt && (
            <p className={`${show.title ? "mt-3" : ""} flex-1 text-sm leading-6 text-muted-foreground`}>
              {course.excerpt}
            </p>
          )}

          {show.meta && (
            <dl className={`${show.title || show.excerpt ? "mt-5" : ""} flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground`}>
              <div className="flex items-center gap-1.5">
                <Clock className="size-4 text-primary/70" />
                {course.durationHours} h
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="size-4 text-primary/70" />
                {course.level}
              </div>
              {next && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-primary/70" />
                  {next.city}
                </div>
              )}
            </dl>
          )}

          {showBottomBar && (
            <div className={`${show.title || show.excerpt || show.meta ? "mt-6 border-t border-border/70 pt-5" : ""} flex items-center justify-between`}>
              {show.price && (
                <span className="font-display text-lg font-bold text-primary">
                  {formatPrice(course.price)}
                </span>
              )}
              {show.cta && (
                <span className={`${!show.price ? "ml-auto" : ""} text-sm font-semibold text-secondary transition-transform duration-300 group-hover:translate-x-1`}>
                  Voir la formation →
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Placeholder block when everything is hidden ───────────── */}
      {allHidden && (
        <div className="flex flex-1 items-center justify-center bg-sage/40 min-h-[220px] relative overflow-hidden">
          <span
            aria-hidden="true"
            className="select-none font-display text-[8rem] font-extrabold leading-none text-primary/10 transition-colors duration-300 group-hover:text-primary/15"
          >
            {course.title.charAt(0)}
          </span>
          <div className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/5" />
        </div>
      )}
    </Link>
  );
}
