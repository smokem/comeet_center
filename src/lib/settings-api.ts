/**
 * settings-api.ts
 *
 * Read / write the settings/comingSoon Firestore document.
 * Works isomorphically — safe to call from SSR loaders and browser code.
 */

import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import { db } from "./firebase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ForceState = "auto" | "show" | "hide";
export type CtaType = "tel" | "mailto" | "url";

export interface ComingSoonSettings {
  targetDate: string;       // ISO e.g. "2026-08-29T00:00:00" — Africa/Tunis
  headlineFr: string;       // "Ouverture le 29 Août"
  headlineEn: string;       // "Opening August 29"
  supportingLine: string;   // "Un nouvel espace de formation arrive à Sfax."
  ctaLabel: string;         // "Nous contacter"
  ctaType: CtaType;
  ctaValue: string;         // "+21622489100"
  forceState: ForceState;
  // Metadata — never used for gate logic, always null in serialized loader data
  updatedAt?: null;
  updatedBy?: string;
}

// Hardcoded fallback — matches the approved screenshot so the page never
// crashes even if the Firestore document is missing.
export const DEFAULT_SETTINGS: ComingSoonSettings = {
  targetDate: "2026-08-29T00:00:00",
  headlineFr: "Ouverture le 29 Août",
  headlineEn: "Opening August 29",
  supportingLine: "Un nouvel espace de formation arrive à Sfax.",
  ctaLabel: "Nous contacter",
  ctaType: "tel",
  ctaValue: "+21622489100",
  forceState: "auto",
  updatedAt: null,
  updatedBy: "",
};

const SETTINGS_REF = () => doc(db, "settings", "comingSoon");

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getComingSoonSettings(): Promise<ComingSoonSettings> {
  try {
    const snap = await getDoc(SETTINGS_REF());
    if (!snap.exists()) return { ...DEFAULT_SETTINGS };

    const d = snap.data() as Partial<ComingSoonSettings>;
    return {
      targetDate: typeof d.targetDate === "string" ? d.targetDate : DEFAULT_SETTINGS.targetDate,
      headlineFr: typeof d.headlineFr === "string" ? d.headlineFr : DEFAULT_SETTINGS.headlineFr,
      headlineEn: typeof d.headlineEn === "string" ? d.headlineEn : DEFAULT_SETTINGS.headlineEn,
      supportingLine: typeof d.supportingLine === "string" ? d.supportingLine : DEFAULT_SETTINGS.supportingLine,
      ctaLabel: typeof d.ctaLabel === "string" ? d.ctaLabel : DEFAULT_SETTINGS.ctaLabel,
      ctaType: (d.ctaType === "tel" || d.ctaType === "mailto" || d.ctaType === "url")
        ? d.ctaType
        : DEFAULT_SETTINGS.ctaType,
      ctaValue: typeof d.ctaValue === "string" ? d.ctaValue : DEFAULT_SETTINGS.ctaValue,
      forceState: (d.forceState === "auto" || d.forceState === "show" || d.forceState === "hide")
        ? d.forceState
        : DEFAULT_SETTINGS.forceState,
      // Convert Firestore Timestamp → plain ISO string so seroval can serialize
      // the loader return value without crashing during SSR dehydration.
      updatedAt: null,
      updatedBy: typeof d.updatedBy === "string" ? d.updatedBy : "",
    };
  } catch (err) {
    // Firestore unavailable (rules not deployed, network error, SSR cold start)
    // — silently fall back to defaults so the page never crashes
    if (typeof console !== "undefined") {
      console.warn("[settings-api] Could not fetch comingSoon settings, using defaults:", err instanceof Error ? err.message : err);
    }
    return { ...DEFAULT_SETTINGS };
  }
}

// ---------------------------------------------------------------------------
// Write (admin only — Firestore rules enforce authentication)
// ---------------------------------------------------------------------------

export async function saveComingSoonSettings(
  settings: Omit<ComingSoonSettings, "updatedAt" | "updatedBy">,
  userEmail: string,
): Promise<void> {
  await setDoc(SETTINGS_REF(), {
    ...settings,
    updatedAt: serverTimestamp(),
    updatedBy: userEmail,
  });
}

// ---------------------------------------------------------------------------
// Gate logic — call this from the root loader to decide which page to show
// ---------------------------------------------------------------------------

export function shouldShowComingSoon(settings: ComingSoonSettings): boolean {
  if (settings.forceState === "show") return true;
  if (settings.forceState === "hide") return false;

  // "auto" — compare current time to targetDate in Africa/Tunis
  const now = new Date();
  const target = new Date(settings.targetDate);
  return now < target;
}
