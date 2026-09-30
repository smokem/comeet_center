/**
 * faq.ts — FAQ data for Co.meet Space.
 *
 * buildFaq(hours) accepts the live BusinessHoursSettings so the opening-hours
 * answer is always in sync with Firestore and never goes stale.
 *
 * All answers are derived exclusively from existing site copy and verified facts.
 * Items marked ⚠️ FLAG should be confirmed by the owner before publishing.
 */

import type { BusinessHoursSettings } from "@/lib/settings-api";

export interface FaqItem {
  question: string;
  answer:   string;
}

export function buildFaq(hours: BusinessHoursSettings): FaqItem[] {
  return [
    {
      question: "Où se trouve Co.meet Space ?",
      answer:
        "Co.meet Space est situé Route de Mahdia Km 5,5, 3011 Sfax, Tunisie. " +
        "Vous pouvez nous localiser sur Google Maps en cherchant « CoMeetSpace ».",
    },
    {
      question: "Quels sont les horaires d'ouverture ?",
      answer:
        `${hours.weekdayLabel} : ${hours.weekdayHours}. ` +
        `${hours.sundayLabel} : ${hours.sundayHours}.`,
    },
    {
      question: "Comment s'inscrire à une formation ?",
      answer:
        "L'inscription se fait directement par téléphone ou WhatsApp au +216 92 489 103. " +
        "Vous pouvez aussi utiliser le formulaire de contact sur cette page. " +
        "Un conseiller vérifie les places disponibles et confirme votre inscription immédiatement.",
    },
    {
      question: "Les formations sont-elles disponibles en ligne ou uniquement en présentiel ?",
      answer:
        "Co.meet Space propose trois formats : présentiel à Sfax, hybride (mixte présentiel et distanciel), " +
        "et entièrement en ligne. Chaque formation indique son format dans le catalogue.",
    },
    {
      question: "Dans quels domaines proposez-vous des formations ?",
      answer:
        "Le catalogue couvre le management, la communication, le numérique, la bureautique et le design. " +
        "Les formations sont disponibles pour les niveaux Débutant, Intermédiaire et Avancé.",
    },
    {
      question: "Combien de participants y a-t-il par session ?",
      // ⚠️ FLAG: 15 participants max — confirmed in PROJECT_CONTEXT.md and site copy.
      answer:
        "Les groupes sont limités à 15 participants maximum afin de garantir " +
        "un temps de parole suffisant à chacun et un suivi personnalisé.",
    },
    {
      question: "Qui sont les formateurs ?",
      answer:
        "Nos formateurs exercent encore leur métier au moment de la formation. " +
        "Ils apportent des cas réels issus de leur pratique professionnelle, " +
        "et non uniquement des présentations théoriques.",
    },
    {
      question: "Proposez-vous des formations intra-entreprise ou sur mesure ?",
      answer:
        "Oui. Co.meet Space propose des formations intra-entreprise et des programmes " +
        "entièrement sur mesure adaptés à vos besoins spécifiques. " +
        "Contactez-nous au +216 92 489 103 ou par e-mail à contact@comeetspace.com pour obtenir un devis.",
    },
  ];
}
