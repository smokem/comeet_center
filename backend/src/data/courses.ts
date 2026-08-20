export type BackendCourse = {
  slug: string;
  title: string;
  category: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  mode: "presentiel" | "hybride" | "en-ligne";
  price: number;
  durationHours: number;
};

export const courses: BackendCourse[] = [
  {
    slug: "management-equipe-hybride",
    title: "Manager une équipe hybride",
    category: "Management",
    level: "Intermédiaire",
    mode: "hybride",
    price: 1450,
    durationHours: 21,
  },
  {
    slug: "prise-de-parole-en-public",
    title: "Prise de parole en public",
    category: "Communication",
    level: "Débutant",
    mode: "presentiel",
    price: 890,
    durationHours: 14,
  },
  {
    slug: "ia-generative-au-quotidien",
    title: "IA générative au quotidien",
    category: "Numérique",
    level: "Débutant",
    mode: "en-ligne",
    price: 490,
    durationHours: 7,
  },
];