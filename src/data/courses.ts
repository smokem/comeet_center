// Types and pure utilities only — no hardcoded data.
// Course data is fetched from the API (/api/courses).

export type Mode = "presentiel" | "hybride" | "en-ligne";
export type Level = "Débutant" | "Intermédiaire" | "Avancé";

export type Session = {
  start: string;
  end: string;
  city: string;
  seatsLeft: number;
};

export type Course = {
  slug: string;
  title: string;
  category: string;
  level: Level;
  mode: Mode;
  durationHours: number;
  price: number;
  excerpt: string;
  description: string;
  objectives: string[];
  syllabus: { title: string; detail: string }[];
  trainer: { name: string; role: string; bio: string; initials: string };
  sessions: Session[];
  featured?: boolean;
  /**
   * Per-field visibility controls for the catalog card.
   * Every key defaults to true when the field or individual key is absent,
   * so existing courses render unchanged unless explicitly toggled off.
   *
   * Fields:
   *   badges   — category label + mode pill (top strip)
   *   title    — course title (h3)
   *   excerpt  — short description text
   *   meta     — duration / level / city row
   *   price    — formatted price
   *   cta      — "Voir la formation →" link text
   */
  cardTextVisibility?: {
    badges?: boolean;
    title?: boolean;
    excerpt?: boolean;
    meta?: boolean;
    price?: boolean;
    cta?: boolean;
  };
};

export const modeLabel: Record<Mode, string> = {
  presentiel: "Présentiel",
  hybride: "Hybride",
  "en-ligne": "En ligne",
};

export const levels: Level[] = ["Débutant", "Intermédiaire", "Avancé"];

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatPrice(value: number) {
  return (
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(value) + " TND"
  );
}
