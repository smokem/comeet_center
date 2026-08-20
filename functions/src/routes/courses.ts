import { Router } from "express";
import type { CourseRepository } from "../lib/course-repository";

export function createCoursesRouter(
  courseRepository: CourseRepository,
): Router {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      const items = await courseRepository.listCourses();
      res.json({ items, count: items.length });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:slug", async (req, res, next) => {
    try {
      const course = await courseRepository.getCourseBySlug(req.params.slug);
      if (!course) {
        res.status(404).json({ message: "Course not found" });
        return;
      }
      res.json({ item: course });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
