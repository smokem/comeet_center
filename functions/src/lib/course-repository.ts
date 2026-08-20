import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { courses, type BackendCourse } from "../data/courses";

export interface CourseRepository {
  listCourses(): Promise<BackendCourse[]>;
  getCourseBySlug(slug: string): Promise<BackendCourse | null>;
}

function cloneCourse(course: BackendCourse): BackendCourse {
  return { ...course };
}

export function createInMemoryCourseRepository(
  seedCourses: BackendCourse[] = courses,
): CourseRepository {
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

function parseCourseData(
  data: Record<string, unknown>,
  slug: string,
): BackendCourse | null {
  const title = typeof data.title === "string" ? data.title : undefined;
  const category =
    typeof data.category === "string" ? data.category : undefined;
  const level = data.level;
  const mode = data.mode;
  const price =
    typeof data.price === "number" ? data.price : Number.NaN;
  const durationHours =
    typeof data.durationHours === "number" ? data.durationHours : Number.NaN;

  if (!title || !category) return null;
  if (
    level !== "Débutant" &&
    level !== "Intermédiaire" &&
    level !== "Avancé"
  )
    return null;
  if (
    mode !== "presentiel" &&
    mode !== "hybride" &&
    mode !== "en-ligne"
  )
    return null;
  if (!Number.isFinite(price) || !Number.isFinite(durationHours)) return null;

  return { slug, title, category, level, mode, price, durationHours };
}

export function createFirestoreCourseRepository(
  firestore: Firestore,
): CourseRepository {
  const collection = firestore.collection("courses");

  return {
    async listCourses() {
      const snapshot = await collection.get();
      return snapshot.docs
        .map((doc) =>
          parseCourseData(doc.data() as Record<string, unknown>, doc.id),
        )
        .filter((c): c is BackendCourse => c !== null);
    },
    async getCourseBySlug(slug: string) {
      const doc = await collection.doc(slug).get();
      if (doc.exists) {
        const course = parseCourseData(
          doc.data() as Record<string, unknown>,
          doc.id,
        );
        if (course) return course;
      }

      const snapshot = await collection
        .where("slug", "==", slug)
        .limit(1)
        .get();
      const [match] = snapshot.docs;
      if (!match) return null;
      return parseCourseData(
        match.data() as Record<string, unknown>,
        match.id,
      );
    },
  };
}

// Always use Firestore in the Functions environment — Admin SDK is
// initialised automatically by the Firebase runtime (no credentials needed).
export function createDefaultCourseRepository(): CourseRepository {
  return createFirestoreCourseRepository(getFirestore());
}
