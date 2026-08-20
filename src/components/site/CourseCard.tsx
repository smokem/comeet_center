import { formatPrice, modeLabel, type Course } from "@/data/courses";
import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Users } from "lucide-react";

export function CourseCard({ course }: { course: Course }) {
  const next = course.sessions[0];

  return (
    <Link
      to="/formations/$slug"
      params={{ slug: course.slug }}
      className="surface-card group flex flex-col overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-level-2"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-sage/60 px-6 py-4">
        <span className="text-label-sm uppercase text-primary">{course.category}</span>
        <span className="rounded-full bg-primary-fixed px-2.5 py-1 text-label-sm text-primary">
          {modeLabel[course.mode]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-headline-md text-foreground transition-colors duration-300 group-hover:text-primary">
          {course.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{course.excerpt}</p>

        <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
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

        <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-5">
          <span className="font-display text-lg font-bold text-primary">
            {formatPrice(course.price)}
          </span>
          <span className="text-sm font-semibold text-secondary transition-transform duration-300 group-hover:translate-x-1">
            Voir la formation →
          </span>
        </div>
      </div>
    </Link>
  );
}
