/**
 * Exchanges the Firebase CLI refresh token for a fresh access token,
 * then writes all courses to Firestore via REST.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const PROJECT_ID = "commit-8da1d";
const CONFIG_PATH = join(homedir(), ".config", "configstore", "firebase-tools.json");

// ---------------------------------------------------------------------------
// Refresh the access token using the stored refresh_token
// ---------------------------------------------------------------------------
async function refreshAccessToken(): Promise<string> {
  const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf8")) as {
    tokens: { refresh_token: string; access_token: string; expires_at: number };
  };

  const now = Date.now();
  // If token still valid (with 60s buffer), reuse it
  if (raw.tokens.expires_at - now > 60_000) {
    console.log("Using cached access token.");
    return raw.tokens.access_token;
  }

  console.log("Refreshing access token...");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
      client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
      refresh_token: raw.tokens.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed ${res.status}: ${body}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  
  // Update config
  raw.tokens.access_token = data.access_token;
  raw.tokens.expires_at = now + data.expires_in * 1000;
  writeFileSync(CONFIG_PATH, JSON.stringify(raw, null, "\t"));

  console.log("Token refreshed successfully.");
  return data.access_token;
}

// ---------------------------------------------------------------------------
// Firestore REST helpers
// ---------------------------------------------------------------------------
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function toValue(v: unknown): unknown {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === "object") {
    const fields: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      fields[k] = toValue(val);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function toDocument(data: Record<string, unknown>) {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) fields[k] = toValue(v);
  return { fields };
}

async function upsert(slug: string, data: Record<string, unknown>, token: string) {
  const url = `${BASE}/courses/${slug}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(toDocument(data)),
  });
  if (!res.ok) throw new Error(`PATCH ${slug} ${res.status}: ${await res.text()}`);
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
const courses = [
  { slug: "management-equipe-hybride", title: "Manager une équipe hybride", category: "Management", level: "Intermédiaire", mode: "hybride", price: 1450, durationHours: 21, featured: true, excerpt: "Structurer le travail à distance, maintenir l'engagement et piloter la performance d'une équipe répartie.", description: "Trois jours pour outiller les managers confrontés au travail hybride : rituels d'équipe, communication asynchrone, feedback continu et pilotage par les résultats plutôt que par la présence.", objectives: ["Concevoir des rituels d'équipe adaptés au travail hybride", "Animer des réunions courtes et réellement utiles", "Donner un feedback régulier et actionnable", "Piloter la charge et prévenir l'isolement"], syllabus: [{ title: "Jour 1 — Cadre et rituels", detail: "Diagnostic d'équipe, charte de fonctionnement, rythmes de synchronisation." }, { title: "Jour 2 — Communication", detail: "Asynchrone vs synchrone, écrits managériaux, animation de réunions hybrides." }, { title: "Jour 3 — Performance", detail: "Objectifs, feedback, entretiens individuels, plan d'action personnel." }], trainer: { name: "Sofia Merabet", role: "Coach en management", bio: "15 ans d'expérience en direction d'équipes produit, accompagne des managers de PME et scale-ups depuis 2018.", initials: "SM" }, sessions: [{ start: "2026-09-14", end: "2026-09-16", city: "Sfax", seatsLeft: 4 }, { start: "2026-11-02", end: "2026-11-04", city: "Sfax", seatsLeft: 9 }] },
  { slug: "prise-de-parole-en-public", title: "Prise de parole en public", category: "Communication", level: "Débutant", mode: "presentiel", price: 890, durationHours: 14, featured: true, excerpt: "Gagner en aisance, structurer un message clair et tenir une salle, même sous pression.", description: "Une formation intensive et très pratique : chaque participant passe au moins six fois devant le groupe, avec retours vidéo et coaching individuel.", objectives: ["Structurer un message en moins de 10 minutes", "Maîtriser voix, respiration et posture", "Gérer le trac et les questions difficiles", "Adapter son discours à son auditoire"], syllabus: [{ title: "Jour 1 — Le corps et la voix", detail: "Ancrage, respiration, regard, gestion du silence." }, { title: "Jour 2 — Le message", detail: "Structures narratives, ouverture, chute, séance de questions/réponses." }], trainer: { name: "Thomas Ferrand", role: "Comédien et formateur", bio: "Formé au théâtre, il accompagne dirigeants et experts techniques dans leurs prises de parole depuis 12 ans.", initials: "TF" }, sessions: [{ start: "2026-09-24", end: "2026-09-25", city: "Sfax", seatsLeft: 2 }, { start: "2026-10-15", end: "2026-10-16", city: "Sfax", seatsLeft: 8 }] },
  { slug: "ia-generative-au-quotidien", title: "IA générative au quotidien", category: "Numérique", level: "Débutant", mode: "en-ligne", price: 490, durationHours: 7, featured: true, excerpt: "Intégrer les assistants IA dans ses tâches quotidiennes sans compromettre la qualité ni la confidentialité.", description: "Une journée pour passer de l'usage curieux à l'usage professionnel : cas d'usage métier, rédaction de consignes efficaces, relecture critique et cadre de confidentialité.", objectives: ["Identifier les tâches réellement automatisables", "Rédiger des consignes précises et réutilisables", "Vérifier et corriger une production IA", "Appliquer les règles de confidentialité de son organisation"], syllabus: [{ title: "Matin — Fondamentaux", detail: "Fonctionnement, limites, biais, cadre RGPD et données sensibles." }, { title: "Après-midi — Atelier", detail: "Cas d'usage sur vos propres documents, bibliothèque de consignes." }], trainer: { name: "Nadia Roux", role: "Consultante numérique", bio: "Accompagne des organisations publiques et privées dans l'adoption raisonnée des outils d'IA.", initials: "NR" }, sessions: [{ start: "2026-09-08", end: "2026-09-08", city: "Distanciel", seatsLeft: 12 }, { start: "2026-10-06", end: "2026-10-06", city: "Distanciel", seatsLeft: 15 }] },
  { slug: "gestion-de-projet-agile", title: "Gestion de projet agile", category: "Management", level: "Intermédiaire", mode: "presentiel", price: 1590, durationHours: 21, featured: false, excerpt: "Cadrer, prioriser et livrer par itérations, avec des rituels qui tiennent dans la durée.", description: "De la vision produit au sprint review : une mise en pratique complète sur un projet fil rouge apporté par le groupe.", objectives: ["Cadrer un projet et découper la valeur", "Animer les rituels d'une équipe agile", "Estimer et prioriser un backlog", "Mesurer l'avancement sans micro-management"], syllabus: [{ title: "Jour 1 — Cadrage", detail: "Vision, personas, découpage en incréments de valeur." }, { title: "Jour 2 — Rituels", detail: "Planification, points quotidiens, revue, rétrospective." }, { title: "Jour 3 — Pilotage", detail: "Indicateurs, gestion des imprévus, amélioration continue." }], trainer: { name: "Karim Belhadj", role: "Coach agile", bio: "Ancien chef de projet industriel, il forme des équipes pluridisciplinaires aux méthodes itératives.", initials: "KB" }, sessions: [{ start: "2026-10-20", end: "2026-10-22", city: "Sfax", seatsLeft: 6 }] },
  { slug: "bureautique-avancee-excel", title: "Excel avancé et tableaux de bord", category: "Bureautique", level: "Avancé", mode: "hybride", price: 780, durationHours: 14, featured: false, excerpt: "Construire des tableaux de bord fiables : formules matricielles, tableaux croisés, Power Query.", description: "Pour les profils déjà à l'aise qui veulent industrialiser leurs fichiers et arrêter de les refaire chaque mois.", objectives: ["Nettoyer et consolider des données avec Power Query", "Concevoir des tableaux croisés dynamiques robustes", "Automatiser les mises à jour mensuelles", "Mettre en forme un tableau de bord lisible"], syllabus: [{ title: "Jour 1 — Données", detail: "Import, transformation, modèles de données." }, { title: "Jour 2 — Restitution", detail: "TCD, graphiques, indicateurs, diffusion." }], trainer: { name: "Élise Dumont", role: "Analyste de données", bio: "Contrôleuse de gestion devenue formatrice, spécialiste des tableaux de bord opérationnels.", initials: "ED" }, sessions: [{ start: "2026-11-17", end: "2026-11-18", city: "Sfax", seatsLeft: 10 }] },
  { slug: "accueil-et-relation-client", title: "Accueil et relation client", category: "Communication", level: "Débutant", mode: "presentiel", price: 420, durationHours: 7, featured: false, excerpt: "Poser un cadre d'accueil chaleureux et gérer les situations tendues avec méthode.", description: "Une journée orientée mises en situation, pensée pour les équipes en contact direct avec le public.", objectives: ["Structurer un accueil physique et téléphonique", "Écouter activement et reformuler", "Désamorcer une réclamation", "Préserver son énergie sur la journée"], syllabus: [{ title: "Matin — Les fondamentaux", detail: "Premiers mots, posture, écoute active." }, { title: "Après-midi — Situations difficiles", detail: "Réclamations, agressivité, mise en pratique filmée." }], trainer: { name: "Sofia Merabet", role: "Coach en management", bio: "15 ans d'expérience en direction d'équipes produit, accompagne des managers de PME et scale-ups depuis 2018.", initials: "SM" }, sessions: [{ start: "2026-09-30", end: "2026-09-30", city: "Sfax", seatsLeft: 7 }] },
];

async function seed() {
  const token = await refreshAccessToken();
  console.log(`\nSeeding ${courses.length} courses → Firestore production (parallel)...`);
  await Promise.all(
    courses.map(async (course) => {
      await upsert(course.slug, course as unknown as Record<string, unknown>, token);
      console.log(`  ✓ ${course.slug}`);
    })
  );
  console.log(`\n✅ Done — ${courses.length} courses seeded into ${PROJECT_ID}`);
}

seed().catch((err: unknown) => {
  console.error("❌ Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
