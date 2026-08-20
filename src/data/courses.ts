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
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
