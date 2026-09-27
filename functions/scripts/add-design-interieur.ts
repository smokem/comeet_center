/**
 * One-shot script — adds the "Design d'Intérieur" course to Firestore.
 *
 * Run from repo root:
 *   npx tsx functions/scripts/add-design-interieur.ts
 *
 * ⚠️  PLACEHOLDERS to fill via admin panel before going live:
 *   - price (currently 0)
 *   - durationHours (currently 0)
 *   - level / mode (currently Intermédiaire / presentiel — adjust if needed)
 *   - trainer (name, role, bio, initials)
 *   - sessions (no dates/city/seats yet)
 *   - featured: keep false until above are complete
 */

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const PROJECT_ID = "commit-8da1d";
const SLUG = "design-interieur";

function getToken(): string {
  const configPath = join(homedir(), ".config", "configstore", "firebase-tools.json");
  const raw = JSON.parse(readFileSync(configPath, "utf8")) as {
    tokens: { access_token: string };
  };
  return raw.tokens.access_token;
}

function toValue(v: unknown): unknown {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number")
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
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
  for (const [k, val] of Object.entries(data)) fields[k] = toValue(val);
  return { fields };
}

const course = {
  slug: SLUG,
  title: "Design d'Intérieur",
  category: "Design",
  level: "Intermédiaire",
  mode: "presentiel",
  price: 0,
  durationHours: 0,
  featured: false,
  excerpt: "AutoCAD, SketchUp, Lumion, IA — les outils du design d'intérieur d'aujourd'hui.",
  description:
    "Maîtrisez les outils d'aujourd'hui pour concevoir les espaces de demain. Cette formation vous fait passer du plan technique à la modélisation 3D, puis au rendu réaliste — et bien plus. Encadrement par un professionnel, petits groupes, projets pratiques réels, supports de cours et vidéos, attestation de formation à la clé. Plus qu'une formation, c'est un tremplin vers votre carrière. Apprenez, créez, réalisez.",
  objectives: [
    "Maîtriser les outils d'aujourd'hui pour concevoir les espaces de demain",
    "Passer du plan 2D à la modélisation 3D, puis au rendu réaliste",
    "Obtenir une attestation de formation reconnue",
  ],
  syllabus: [
    { title: "AutoCAD", detail: "Plans 2D et plans techniques" },
    { title: "SketchUp", detail: "Modélisation 3D — conception rapide et efficace" },
    { title: "Lumion", detail: "Rendus réalistes et animations" },
    { title: "IA — Intelligence Artificielle", detail: "Créativité et productivité" },
  ],
  trainer: {
    name: "PLACEHOLDER",
    role: "PLACEHOLDER",
    bio: "PLACEHOLDER",
    initials: "??",
  },
  sessions: [],
};

async function run() {
  const token = getToken();
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/courses/${SLUG}`;
  const fieldPaths = Object.keys(course)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join("&");

  const res = await fetch(`${url}?${fieldPaths}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(toDocument(course)),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PATCH failed ${res.status}: ${body}`);
  }

  console.log(`✅ Course "${course.title}" written to Firestore.`);
  console.log(`   Slug: ${SLUG}`);
  console.log(`   URL:  https://console.firebase.google.com/project/${PROJECT_ID}/firestore/data/courses/${SLUG}`);
  console.log(`\n⚠️  Don't forget to fill in via admin panel:`);
  console.log(`   price · durationHours · trainer · sessions`);
}

run().catch((err: unknown) => {
  console.error("❌", err instanceof Error ? err.message : err);
  process.exit(1);
});
