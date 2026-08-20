import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { env } from "../config/env.js";
import { courses, type BackendCourse } from "../data/courses.js";

export interface CourseRepository {
  listCourses(): Promise<BackendCourse[]>;
  getCourseBySlug(slug: string): Promise<BackendCourse | null>;
}

function cloneCourse(course: BackendCourse): BackendCourse {
  return { ...course };
}

export function createInMemoryCourseRepository(seedCourses: BackendCourse[] = courses): CourseRepository {
  const items = seedCourses.map(cloneCourse);

  return {
    async listCourses() {
      return items.map(cloneCourse);
    },
    async getCourseBySlug(slug: string) {
      const course = items.find((item) => item.slug === slug);
      return course ? cloneCourse(course) : null;
    },
  };
}

function parseCourseData(data: Record<string, unknown>, slug: string): BackendCourse | null {
  const title = typeof data.title === "string" ? data.title : undefined;
  const category = typeof data.category === "string" ? data.category : undefined;
  const level = data.level;
  const mode = data.mode;
  const price = typeof data.price === "number" ? data.price : Number.NaN;
  const durationHours = typeof data.durationHours === "number" ? data.durationHours : Number.NaN;

  if (!title || !category) return null;
  if (level !== "Débutant" && level !== "Intermédiaire" && level !== "Avancé") return null;
  if (mode !== "presentiel" && mode !== "hybride" && mode !== "en-ligne") return null;
  if (!Number.isFinite(price) || !Number.isFinite(durationHours)) return null;

  return {
    slug,
    title,
    category,
    level,
    mode,
    price,
    durationHours,
  };
}

export function createFirestoreCourseRepository(firestore: Firestore): CourseRepository {
  const collection = firestore.collection("courses");

  return {
    async listCourses() {
      const snapshot = await collection.get();
      return snapshot.docs
        .map((document) => parseCourseData(document.data() as Record<string, unknown>, document.id))
        .filter((course): course is BackendCourse => course !== null);
    },
    async getCourseBySlug(slug: string) {
      const document = await collection.doc(slug).get();
      if (document.exists) {
        const course = parseCourseData(document.data() as Record<string, unknown>, document.id);
        if (course) return course;
      }

      const snapshot = await collection.where("slug", "==", slug).limit(1).get();
      const [match] = snapshot.docs;
      if (!match) return null;

      return parseCourseData(match.data() as Record<string, unknown>, match.id);
    },
  };
}

export function createDefaultCourseRepository(): CourseRepository {
  const projectId = env.FIREBASE_PROJECT_ID;
  const clientEmail = env.FIREBASE_CLIENT_EMAIL;
  const privateKey = env.FIREBASE_PRIVATE_KEY;
  if (projectId && clientEmail && privateKey) {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
    }

    return createFirestoreCourseRepository(getFirestore());
  }

  return createInMemoryCourseRepository();
}