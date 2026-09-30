/**
 * /llms.txt — compact site index for AI assistants.
 *
 * NOTE: llms.txt is a proposed convention (https://llmstxt.org) with no proven
 * adoption as of 2026. Low-cost, no negative effect if ignored by crawlers.
 */
import { defineEventHandler, setHeader } from "h3";
import { collection, getDocs } from "firebase/firestore/lite";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

const SITE_URL = process.env["VITE_SITE_URL"] ?? "https://comeetspace.com";
const PHONE    = "+216 92 489 103";
const EMAIL    = "contact@comeetspace.com";
const ADDRESS  = "Route de Mahdia Km 5,5, 3011 Sfax, Tunisie";

function getDb() {
  const existing = getApps()[0];
  const app = existing ?? initializeApp({
    apiKey:     process.env["VITE_FIREBASE_API_KEY"],
    authDomain: process.env["VITE_FIREBASE_AUTH_DOMAIN"],
    projectId:  process.env["VITE_FIREBASE_PROJECT_ID"],
  });
  return getFirestore(app);
}

export default defineEventHandler(async (event) => {
  setHeader(event, "Content-Type", "text/plain; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=3600");

  let courseLines = "";
  try {
    const db   = getDb();
    const snap = await getDocs(collection(db, "courses"));
    courseLines = snap.docs
      .map((d) => {
        const data = d.data() as { title?: string; excerpt?: string };
        const title   = data["title"]   ?? d.id;
        const excerpt = data["excerpt"] ?? "";
        return `- [${title}](${SITE_URL}/formations/${d.id})${excerpt ? `: ${excerpt}` : ""}`;
      })
      .join("\n");
  } catch {
    courseLines = "- (catalogue temporairement indisponible)";
  }

  return `# Co.meet Space

Centre de formation professionnelle à Sfax, Tunisie. Formations courtes en management, communication, numérique et bureautique. Groupes de 15 personnes maximum, formateurs praticiens, sessions en présentiel, hybride ou en ligne.

## Catalogue de formations
${courseLines}

## Pages principales

- [Accueil](${SITE_URL}/): Présentation du centre, formations à la une, parcours d'inscription.
- [Catalogue](${SITE_URL}/formations): Toutes les formations avec filtres par catégorie, niveau et format.
- [Le centre](${SITE_URL}/a-propos): Histoire, valeurs, espace et approche pédagogique.
- [Contact](${SITE_URL}/contact): Formulaire de contact, adresse, horaires, téléphone.
- [FAQ](${SITE_URL}/#faq-heading): Réponses aux questions fréquentes.

## Informations de contact

- Adresse : ${ADDRESS}
- Téléphone / WhatsApp : ${PHONE}
- E-mail : ${EMAIL}
`;
});
