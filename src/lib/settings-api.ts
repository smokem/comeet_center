/**
 * settings-api.ts
 *
 * Read / write Firestore settings documents.
 * Works isomorphically — safe to call from SSR loaders and browser code.
 *
 * Documents:
 *   settings/comingSoon     — coming-soon gate + content
 *   settings/businessHours  — hours displayed site-wide + timeline times
 *
 * Bundle strategy
 * ---------------
 * Reads use firebase/firestore/lite (smaller, one-time reads only).
 * Writes lazy-import firebase/firestore (full SDK) so the extra weight is
 * only paid on /admin where writes actually happen.
 */

import { doc, getDoc } from "firebase/firestore/lite";

import { dbLite } from "./firebase-lite";

// ---------------------------------------------------------------------------
// Coming-soon types
// ---------------------------------------------------------------------------

export type ForceState = "auto" | "show" | "hide";
export type CtaType = "tel" | "mailto" | "url";

export interface ComingSoonSettings {
  targetDate: string;
  headlineFr: string;
  headlineEn: string;
  supportingLine: string;
  ctaLabel: string;
  ctaType: CtaType;
  ctaValue: string;
  forceState: ForceState;
  updatedAt?: null;
  updatedBy?: string;
}

export const DEFAULT_SETTINGS: ComingSoonSettings = {
  targetDate: "2026-08-29T00:00:00",
  headlineFr: "Ouverture le 29 Août",
  headlineEn: "Opening August 29",
  supportingLine: "Un nouvel espace de formation arrive à Sfax.",
  ctaLabel: "Nous contacter",
  ctaType: "tel",
  ctaValue: "+21692489103",
  forceState: "auto",
  updatedAt: null,
  updatedBy: "",
};

// ---------------------------------------------------------------------------
// Business hours types
// ---------------------------------------------------------------------------

export interface BusinessHoursSettings {
  /** Short tagline shown in hero + map section e.g. "Lun–Sam 8h–22h · Dim 8h–17h" */
  tagline: string;
  /** Weekday label in contact page table e.g. "Lundi – samedi" */
  weekdayLabel: string;
  /** Weekday hours e.g. "8 h – 22 h" */
  weekdayHours: string;
  /** Sunday label e.g. "Dimanche" */
  sundayLabel: string;
  /** Sunday hours e.g. "8 h – 17 h" */
  sundayHours: string;
  /** Long-form weekday hours for prose e.g. "8 h à 22 h" */
  weekdayHoursProse: string;
  /** Long-form sunday hours for prose e.g. "8 h à 17 h" */
  sundayHoursProse: string;
  /** Timeline heading e.g. "Ouvert de 8h à 22h." */
  timelineHeading: string;
  /** 4 timeline step times */
  timelineStep1: string;
  timelineStep2: string;
  timelineStep3: string;
  timelineStep4: string;
  updatedAt?: null;
  updatedBy?: string;
}

export const DEFAULT_BUSINESS_HOURS: BusinessHoursSettings = {
  tagline: "Lun–Sam 8h 30min–22h · Dim 8h 30min–17h",
  weekdayLabel: "Lundi – samedi",
  weekdayHours: "8h 30min – 22 h",
  sundayLabel: "Dimanche",
  sundayHours: "8h 30min – 17 h",
  weekdayHoursProse: "8h 30min à 22 h",
  sundayHoursProse: "8h 30min à 17 h",
  timelineHeading: "Ouvert de 8h 30min à 22h.",
  timelineStep1: "8h 30min",
  timelineStep2: "10h00",
  timelineStep3: "13h00",
  timelineStep4: "19h00",
  updatedAt: null,
  updatedBy: "",
};

// ---------------------------------------------------------------------------
// Coming-soon: read (Firestore Lite)
// ---------------------------------------------------------------------------

export async function getComingSoonSettings(): Promise<ComingSoonSettings> {
  try {
    const snap = await getDoc(doc(dbLite, "settings", "comingSoon"));
    if (!snap.exists()) return { ...DEFAULT_SETTINGS };

    const d = snap.data() as Partial<ComingSoonSettings>;
    return {
      targetDate:    typeof d.targetDate    === "string" ? d.targetDate    : DEFAULT_SETTINGS.targetDate,
      headlineFr:    typeof d.headlineFr    === "string" ? d.headlineFr    : DEFAULT_SETTINGS.headlineFr,
      headlineEn:    typeof d.headlineEn    === "string" ? d.headlineEn    : DEFAULT_SETTINGS.headlineEn,
      supportingLine:typeof d.supportingLine=== "string" ? d.supportingLine: DEFAULT_SETTINGS.supportingLine,
      ctaLabel:      typeof d.ctaLabel      === "string" ? d.ctaLabel      : DEFAULT_SETTINGS.ctaLabel,
      ctaType: (d.ctaType === "tel" || d.ctaType === "mailto" || d.ctaType === "url")
        ? d.ctaType : DEFAULT_SETTINGS.ctaType,
      ctaValue:      typeof d.ctaValue      === "string" ? d.ctaValue      : DEFAULT_SETTINGS.ctaValue,
      forceState: (d.forceState === "auto" || d.forceState === "show" || d.forceState === "hide")
        ? d.forceState : DEFAULT_SETTINGS.forceState,
      updatedAt: null,
      updatedBy: typeof d.updatedBy === "string" ? d.updatedBy : "",
    };
  } catch (err) {
    console.warn("[settings-api] getComingSoonSettings failed, using defaults:",
      err instanceof Error ? err.message : err);
    return { ...DEFAULT_SETTINGS };
  }
}

// ---------------------------------------------------------------------------
// Business hours: read (Firestore Lite)
// ---------------------------------------------------------------------------

export async function getBusinessHours(): Promise<BusinessHoursSettings> {
  try {
    const snap = await getDoc(doc(dbLite, "settings", "businessHours"));
    if (!snap.exists()) return { ...DEFAULT_BUSINESS_HOURS };

    const d = snap.data() as Partial<BusinessHoursSettings>;
    return {
      tagline:           typeof d.tagline           === "string" ? d.tagline           : DEFAULT_BUSINESS_HOURS.tagline,
      weekdayLabel:      typeof d.weekdayLabel      === "string" ? d.weekdayLabel      : DEFAULT_BUSINESS_HOURS.weekdayLabel,
      weekdayHours:      typeof d.weekdayHours      === "string" ? d.weekdayHours      : DEFAULT_BUSINESS_HOURS.weekdayHours,
      sundayLabel:       typeof d.sundayLabel       === "string" ? d.sundayLabel       : DEFAULT_BUSINESS_HOURS.sundayLabel,
      sundayHours:       typeof d.sundayHours       === "string" ? d.sundayHours       : DEFAULT_BUSINESS_HOURS.sundayHours,
      weekdayHoursProse: typeof d.weekdayHoursProse === "string" ? d.weekdayHoursProse : DEFAULT_BUSINESS_HOURS.weekdayHoursProse,
      sundayHoursProse:  typeof d.sundayHoursProse  === "string" ? d.sundayHoursProse  : DEFAULT_BUSINESS_HOURS.sundayHoursProse,
      timelineHeading:   typeof d.timelineHeading   === "string" ? d.timelineHeading   : DEFAULT_BUSINESS_HOURS.timelineHeading,
      timelineStep1:     typeof d.timelineStep1     === "string" ? d.timelineStep1     : DEFAULT_BUSINESS_HOURS.timelineStep1,
      timelineStep2:     typeof d.timelineStep2     === "string" ? d.timelineStep2     : DEFAULT_BUSINESS_HOURS.timelineStep2,
      timelineStep3:     typeof d.timelineStep3     === "string" ? d.timelineStep3     : DEFAULT_BUSINESS_HOURS.timelineStep3,
      timelineStep4:     typeof d.timelineStep4     === "string" ? d.timelineStep4     : DEFAULT_BUSINESS_HOURS.timelineStep4,
      updatedAt: null,
      updatedBy: typeof d.updatedBy === "string" ? d.updatedBy : "",
    };
  } catch (err) {
    console.warn("[settings-api] getBusinessHours failed, using defaults:",
      err instanceof Error ? err.message : err);
    return { ...DEFAULT_BUSINESS_HOURS };
  }
}

// ---------------------------------------------------------------------------
// Coming-soon: write (full Firestore — lazy-imported, admin only)
// ---------------------------------------------------------------------------

export async function saveComingSoonSettings(
  settings: Omit<ComingSoonSettings, "updatedAt" | "updatedBy">,
  userEmail: string,
): Promise<void> {
  // Lazy import keeps firebase/firestore out of the public-page bundle.
  const { doc: docFull, setDoc, serverTimestamp } = await import("firebase/firestore");
  const { db } = await import("./firebase");
  await setDoc(docFull(db, "settings", "comingSoon"), {
    ...settings,
    updatedAt: serverTimestamp(),
    updatedBy: userEmail,
  });
}

// ---------------------------------------------------------------------------
// Business hours: write (full Firestore — lazy-imported, admin only)
// ---------------------------------------------------------------------------

export async function saveBusinessHours(
  settings: Omit<BusinessHoursSettings, "updatedAt" | "updatedBy">,
  userEmail: string,
): Promise<void> {
  const { doc: docFull, setDoc, serverTimestamp } = await import("firebase/firestore");
  const { db } = await import("./firebase");
  await setDoc(docFull(db, "settings", "businessHours"), {
    ...settings,
    updatedAt: serverTimestamp(),
    updatedBy: userEmail,
  });
}

// ---------------------------------------------------------------------------
// Gate logic (pure — no Firebase dependency)
// ---------------------------------------------------------------------------

export function shouldShowComingSoon(settings: ComingSoonSettings): boolean {
  if (settings.forceState === "show") return true;
  if (settings.forceState === "hide") return false;
  return new Date() < new Date(settings.targetDate);
}
