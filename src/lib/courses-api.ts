/**
 * courses-api.ts
 *
 * Public read-only access to the courses collection.
 * Uses firebase/firestore/lite — one-time reads, smaller bundle.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    where,
} from "firebase/firestore/lite";

import { type Course } from "@/data/courses";
import { dbLite } from "./firebase-lite";

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function parseCourse(data: Record<string, unknown>, slug: string): Course | null {
  const title    = typeof data["title"]    === "string" ? data["title"]    : undefined;
  const category = typeof data["category"] === "string" ? data["category"] : undefined;
  if (!title || !category) return null;

  const base: Course = {
    slug,
    title,
    category,
    level:         (data["level"]    as Course["level"])  ?? "Débutant",
    mode:          (data["mode"]     as Course["mode"])   ?? "presentiel",
    price:         typeof data["price"]         === "number" ? data["price"]         : 0,
    durationHours: typeof data["durationHours"] === "number" ? data["durationHours"] : 0,
    excerpt:       typeof data["excerpt"]       === "string" ? data["excerpt"]       : title,
    description:   typeof data["description"]   === "string" ? data["description"]   : title,
    objectives:    Array.isArray(data["objectives"]) ? (data["objectives"] as string[]) : [],
    syllabus:      Array.isArray(data["syllabus"])   ? (data["syllabus"]   as Course["syllabus"]) : [],
    trainer:       (data["trainer"] as Course["trainer"]) ?? {
      name: "À assigner", role: "Formateur", bio: "", initials: "AA",
    },
    sessions:  Array.isArray(data["sessions"]) ? (data["sessions"] as Course["sessions"]) : [],
    featured:  Boolean(data["featured"]),
  };

  // exactOptionalPropertyTypes: only set cardTextVisibility when present —
  // assigning undefined to an optional property is disallowed under this flag.
  if (data["cardTextVisibility"] != null) {
    base.cardTextVisibility = data["cardTextVisibility"] as NonNullable<Course["cardTextVisibility"]>;
  }

  return base;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function listCourses(): Promise<Course[]> {
  const snap = await getDocs(collection(dbLite, "courses"));
  return snap.docs
    .map((d) => parseCourse(d.data() as Record<string, unknown>, d.id))
    .filter((c): c is Course => c !== null);
}

export async function getCourse(slug: string): Promise<Course | null> {
  // Fast path: document ID == slug
  const snap = await getDoc(doc(dbLite, "courses", slug));
  if (snap.exists()) {
    return parseCourse(snap.data() as Record<string, unknown>, snap.id);
  }
  // Fallback: query by slug field for docs whose ID differs
  const q = query(
    collection(dbLite, "courses"),
    where("slug", "==", slug),
    limit(1),
  );
  const result = await getDocs(q);
  const match = result.docs[0];
  if (!match) return null;
  return parseCourse(match.data() as Record<string, unknown>, match.id);
}
