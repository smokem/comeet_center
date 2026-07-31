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

export const courses: Course[] = [
  {
    slug: "management-equipe-hybride",
    title: "Manager une équipe hybride",
    category: "Management",
    level: "Intermédiaire",
    mode: "hybride",
    durationHours: 21,
    price: 1450,
    excerpt:
      "Structurer le travail à distance, maintenir l'engagement et piloter la performance d'une équipe répartie.",
    description:
      "Trois jours pour outiller les managers confrontés au travail hybride : rituels d'équipe, communication asynchrone, feedback continu et pilotage par les résultats plutôt que par la présence.",
    objectives: [
      "Concevoir des rituels d'équipe adaptés au travail hybride",
      "Animer des réunions courtes et réellement utiles",
      "Donner un feedback régulier et actionnable",
      "Piloter la charge et prévenir l'isolement",
    ],
    syllabus: [
      { title: "Jour 1 — Cadre et rituels", detail: "Diagnostic d'équipe, charte de fonctionnement, rythmes de synchronisation." },
      { title: "Jour 2 — Communication", detail: "Asynchrone vs synchrone, écrits managériaux, animation de réunions hybrides." },
      { title: "Jour 3 — Performance", detail: "Objectifs, feedback, entretiens individuels, plan d'action personnel." },
    ],
    trainer: {
      name: "Sofia Merabet",
      role: "Coach en management",
      bio: "15 ans d'expérience en direction d'équipes produit, accompagne des managers de PME et scale-ups depuis 2018.",
      initials: "SM",
    },
    sessions: [
      { start: "2026-09-14", end: "2026-09-16", city: "Lyon", seatsLeft: 4 },
      { start: "2026-11-02", end: "2026-11-04", city: "Paris", seatsLeft: 9 },
    ],
    featured: true,
  },
  {
    slug: "prise-de-parole-en-public",
    title: "Prise de parole en public",
    category: "Communication",
    level: "Débutant",
    mode: "presentiel",
    durationHours: 14,
    price: 890,
    excerpt:
      "Gagner en aisance, structurer un message clair et tenir une salle, même sous pression.",
    description:
      "Une formation intensive et très pratique : chaque participant passe au moins six fois devant le groupe, avec retours vidéo et coaching individuel.",
    objectives: [
      "Structurer un message en moins de 10 minutes",
      "Maîtriser voix, respiration et posture",
      "Gérer le trac et les questions difficiles",
      "Adapter son discours à son auditoire",
    ],
    syllabus: [
      { title: "Jour 1 — Le corps et la voix", detail: "Ancrage, respiration, regard, gestion du silence." },
      { title: "Jour 2 — Le message", detail: "Structures narratives, ouverture, chute, séance de questions/réponses." },
    ],
    trainer: {
      name: "Thomas Ferrand",
      role: "Comédien et formateur",
      bio: "Formé au théâtre, il accompagne dirigeants et experts techniques dans leurs prises de parole depuis 12 ans.",
      initials: "TF",
    },
    sessions: [
      { start: "2026-09-24", end: "2026-09-25", city: "Lyon", seatsLeft: 2 },
      { start: "2026-10-15", end: "2026-10-16", city: "Bordeaux", seatsLeft: 8 },
    ],
    featured: true,
  },
  {
    slug: "ia-generative-au-quotidien",
    title: "IA générative au quotidien",
    category: "Numérique",
    level: "Débutant",
    mode: "en-ligne",
    durationHours: 7,
    price: 490,
    excerpt:
      "Intégrer les assistants IA dans ses tâches quotidiennes sans compromettre la qualité ni la confidentialité.",
    description:
      "Une journée pour passer de l'usage curieux à l'usage professionnel : cas d'usage métier, rédaction de consignes efficaces, relecture critique et cadre de confidentialité.",
    objectives: [
      "Identifier les tâches réellement automatisables",
      "Rédiger des consignes précises et réutilisables",
      "Vérifier et corriger une production IA",
      "Appliquer les règles de confidentialité de son organisation",
    ],
    syllabus: [
      { title: "Matin — Fondamentaux", detail: "Fonctionnement, limites, biais, cadre RGPD et données sensibles." },
      { title: "Après-midi — Atelier", detail: "Cas d'usage sur vos propres documents, bibliothèque de consignes." },
    ],
    trainer: {
      name: "Nadia Roux",
      role: "Consultante numérique",
      bio: "Accompagne des organisations publiques et privées dans l'adoption raisonnée des outils d'IA.",
      initials: "NR",
    },
    sessions: [
      { start: "2026-09-08", end: "2026-09-08", city: "Distanciel", seatsLeft: 12 },
      { start: "2026-10-06", end: "2026-10-06", city: "Distanciel", seatsLeft: 15 },
    ],
    featured: true,
  },
  {
    slug: "gestion-de-projet-agile",
    title: "Gestion de projet agile",
    category: "Management",
    level: "Intermédiaire",
    mode: "presentiel",
    durationHours: 21,
    price: 1590,
    excerpt:
      "Cadrer, prioriser et livrer par itérations, avec des rituels qui tiennent dans la durée.",
    description:
      "De la vision produit au sprint review : une mise en pratique complète sur un projet fil rouge apporté par le groupe.",
    objectives: [
      "Cadrer un projet et découper la valeur",
      "Animer les rituels d'une équipe agile",
      "Estimer et prioriser un backlog",
      "Mesurer l'avancement sans micro-management",
    ],
    syllabus: [
      { title: "Jour 1 — Cadrage", detail: "Vision, personas, découpage en incréments de valeur." },
      { title: "Jour 2 — Rituels", detail: "Planification, points quotidiens, revue, rétrospective." },
      { title: "Jour 3 — Pilotage", detail: "Indicateurs, gestion des imprévus, amélioration continue." },
    ],
    trainer: {
      name: "Karim Belhadj",
      role: "Coach agile",
      bio: "Ancien chef de projet industriel, il forme des équipes pluridisciplinaires aux méthodes itératives.",
      initials: "KB",
    },
    sessions: [{ start: "2026-10-20", end: "2026-10-22", city: "Lyon", seatsLeft: 6 }],
  },
  {
    slug: "bureautique-avancee-excel",
    title: "Excel avancé et tableaux de bord",
    category: "Bureautique",
    level: "Avancé",
    mode: "hybride",
    durationHours: 14,
    price: 780,
    excerpt:
      "Construire des tableaux de bord fiables : formules matricielles, tableaux croisés, Power Query.",
    description:
      "Pour les profils déjà à l'aise qui veulent industrialiser leurs fichiers et arrêter de les refaire chaque mois.",
    objectives: [
      "Nettoyer et consolider des données avec Power Query",
      "Concevoir des tableaux croisés dynamiques robustes",
      "Automatiser les mises à jour mensuelles",
      "Mettre en forme un tableau de bord lisible",
    ],
    syllabus: [
      { title: "Jour 1 — Données", detail: "Import, transformation, modèles de données." },
      { title: "Jour 2 — Restitution", detail: "TCD, graphiques, indicateurs, diffusion." },
    ],
    trainer: {
      name: "Élise Dumont",
      role: "Analyste de données",
      bio: "Contrôleuse de gestion devenue formatrice, spécialiste des tableaux de bord opérationnels.",
      initials: "ED",
    },
    sessions: [{ start: "2026-11-17", end: "2026-11-18", city: "Lyon", seatsLeft: 10 }],
  },
  {
    slug: "accueil-et-relation-client",
    title: "Accueil et relation client",
    category: "Communication",
    level: "Débutant",
    mode: "presentiel",
    durationHours: 7,
    price: 420,
    excerpt:
      "Poser un cadre d'accueil chaleureux et gérer les situations tendues avec méthode.",
    description:
      "Une journée orientée mises en situation, pensée pour les équipes en contact direct avec le public.",
    objectives: [
      "Structurer un accueil physique et téléphonique",
      "Écouter activement et reformuler",
      "Désamorcer une réclamation",
      "Préserver son énergie sur la journée",
    ],
    syllabus: [
      { title: "Matin — Les fondamentaux", detail: "Premiers mots, posture, écoute active." },
      { title: "Après-midi — Situations difficiles", detail: "Réclamations, agressivité, mise en pratique filmée." },
    ],
    trainer: {
      name: "Sofia Merabet",
      role: "Coach en management",
      bio: "15 ans d'expérience en direction d'équipes produit, accompagne des managers de PME et scale-ups depuis 2018.",
      initials: "SM",
    },
    sessions: [{ start: "2026-09-30", end: "2026-09-30", city: "Lyon", seatsLeft: 7 }],
  },
];

export const categories = Array.from(new Set(courses.map((c) => c.category)));
export const levels: Level[] = ["Débutant", "Intermédiaire", "Avancé"];

export function getCourse(slug: string) {
  return courses.find((c) => c.slug === slug);
}

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
