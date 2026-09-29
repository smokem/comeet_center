/**
 * Course data access.
 *
 * Always uses the Firestore client SDK directly — works in both the browser
 * and on the SSR server because the Firebase client SDK is isomorphic.
 *
 * Firestore rules must allow public reads on the `courses` collection.
 * Deploy rules with: firebase deploy --only firestore:rules
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    where,
} from "firebase/firestore";

import { type Course } from "@/data/courses";
import { db } from "./firebase";

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------
function parseCourse(data: Record<string, unknown>, slug: string): Course | null {
  const title = typeof data["title"] === "string" ? data["title"] : undefined;
  const category = typeof data["category"] === "string" ? data["category"] : undefined;
  if (!title || !category) return null;

  return {
    slug,
    title,
    category,
    level: (data["level"] as Course["level"]) ?? "Débutant",
    mode: (data["mode"] as Course["mode"]) ?? "presentiel",
    price: typeof data["price"] === "number" ? data["price"] : 0,
    durationHours: typeof data["durationHours"] === "number" ? data["durationHours"] : 0,
    excerpt: typeof data["excerpt"] === "string" ? data["excerpt"] : title,
    description: typeof data["description"] === "string" ? data["description"] : title,
    objectives: Array.isArray(data["objectives"]) ? (data["objectives"] as string[]) : [],
    syllabus: Array.isArray(data["syllabus"]) ? (data["syllabus"] as Course["syllabus"]) : [],
    trainer: (data["trainer"] as Course["trainer"]) ?? {
      name: "À assigner",
      role: "Formateur",
      bio: "",
      initials: "AA",
    },
    sessions: Array.isArray(data["sessions"]) ? (data["sessions"] as Course["sessions"]) : [],
    featured: Boolean(data["featured"]),
    cardTextVisibility: (data["cardTextVisibility"] as Course["cardTextVisibility"]) ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function listCourses(): Promise<Course[]> {
  const snap = await getDocs(collection(db, "courses"));
  return snap.docs
    .map((d) => parseCourse(d.data() as Record<string, unknown>, d.id))
    .filter((c): c is Course => c !== null);
}

export async function getCourse(slug: string): Promise<Course | null> {
  const snap = await getDoc(doc(db, "courses", slug));
  if (snap.exists()) {
    return parseCourse(snap.data() as Record<string, unknown>, snap.id);
  }
  // fallback: query by slug field
  const q = query(collection(db, "courses"), where("slug", "==", slug), limit(1));
  const result = await getDocs(q);
  const match = result.docs[0];
  if (!match) return null;
  return parseCourse(match.data() as Record<string, unknown>, match.id);
}
