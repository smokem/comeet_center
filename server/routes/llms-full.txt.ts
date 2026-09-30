/**
 * /llms-full.txt — extended plain-text facts for AI assistants.
 * See /llms.txt for the compact index version.
 */
import { defineEventHandler, setHeader } from "h3";
import { collection, doc, getDoc, getDocs } from "firebase/firestore/lite";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

const SITE_URL = process.env["VITE_SITE_URL"] ?? "https://comeetspace.com";
const PHONE    = "+216 92 489 103";
const EMAIL    = "contact@comeetspace.com";
const ADDRESS  = "Route de Mahdia Km 5,5, 3011 Sfax, Tunisie";

// Default hours used as fallback when Firestore is unreachable
const DEFAULT_HOURS = {
  weekdayLabel: "Lundi – samedi",
  weekdayHours: "8h 30min – 22 h",
  sundayLabel:  "Dimanche",
  sundayHours:  "8h 30min – 17 h",
};

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

  const db = getDb();

  // Fetch hours and courses in parallel
  const [hoursSnap, coursesSnap] = await Promise.allSettled([
    getDoc(doc(db, "settings", "businessHours")),
    getDocs(collection(db, "courses")),
  ]);

  const hoursData = hoursSnap.status === "fulfilled" && hoursSnap.value.exists()
    ? (hoursSnap.value.data() as typeof DEFAULT_HOURS)
    : DEFAULT_HOURS;

  const courses = coursesSnap.status === "fulfilled"
    ? coursesSnap.value.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }))
    : [];

  const courseDetails = courses
    .map((c) => {
      const lines = [
        `### ${(c["title"] as string | undefined) ?? c.id}`,
        `URL: ${SITE_URL}/formations/${c.id}`,
        c["category"] ? `Catégorie: ${c["category"]}` : "",
        c["level"]    ? `Niveau: ${c["level"]}` : "",
        c["mode"]     ? `Format: ${c["mode"]}` : "",
        c["durationHours"] ? `Durée: ${c["durationHours"]} heures` : "",
        (c["price"] as number | undefined) && (c["price"] as number) > 0
          ? `Tarif: ${c["price"]} TND par personne`
          : "Tarif: nous contacter",
        c["description"] ? `Description: ${c["description"]}` : "",
      ];
      return lines.filter(Boolean).join("\n");
    })
    .join("\n\n");

  const faqItems = [
    { q: "Où se trouve Co.meet Space ?",        a: `${ADDRESS}.` },
    { q: "Quels sont les horaires d'ouverture ?", a: `${hoursData.weekdayLabel} : ${hoursData.weekdayHours}. ${hoursData.sundayLabel} : ${hoursData.sundayHours}.` },
    { q: "Comment s'inscrire ?",                 a: `Par téléphone ou WhatsApp au ${PHONE}, ou via le formulaire sur ${SITE_URL}/contact.` },
    { q: "Formats disponibles ?",                a: "Présentiel à Sfax, hybride ou entièrement en ligne." },
    { q: "Taille des groupes ?",                 a: "15 participants maximum." },
    { q: "Certificat ?",                         a: "Attestation délivrée sous 48 heures. Suivi à 30 jours inclus." },
    { q: "Intra-entreprise ?",                   a: `Oui. Devis sur demande : ${PHONE} ou ${EMAIL}.` },
  ];
  const faqText = faqItems.map((i) => `Q: ${i.q}\nR: ${i.a}`).join("\n\n");

  return `# Co.meet Space — Centre de formation professionnelle

## Identité

Nom: Co.meet Space
Adresse: ${ADDRESS}
Téléphone / WhatsApp: ${PHONE}
E-mail: ${EMAIL}
Site web: ${SITE_URL}

## Horaires d'ouverture

${hoursData.weekdayLabel}: ${hoursData.weekdayHours}
${hoursData.sundayLabel}: ${hoursData.sundayHours}

## Caractéristiques

- Groupes limités à 15 participants maximum
- Formateurs praticiens (encore en activité dans leur domaine)
- Formats : présentiel à Sfax, hybride, en ligne
- Domaines : management, communication, numérique, bureautique, design
- Niveaux : Débutant, Intermédiaire, Avancé
- Attestation de formation délivrée sous 48 heures
- Suivi à 30 jours inclus
- Formations intra-entreprise et sur mesure disponibles
- Espace de 400 m² : 3 salles de formation, coworking, bibliothèque

## Catalogue de formations

${courseDetails || "(aucune formation disponible pour le moment)"}

## FAQ

${faqText}

## Pages du site

- Accueil: ${SITE_URL}/
- Catalogue: ${SITE_URL}/formations
- Le centre: ${SITE_URL}/a-propos
- Contact: ${SITE_URL}/contact
`;
});
