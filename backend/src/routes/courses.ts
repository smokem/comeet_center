import { Router } from "express";

import type { CourseRepository } from "../lib/course-repository.js";

export function createCoursesRouter(courseRepository: CourseRepository) {
  const coursesRouter = Router();

  coursesRouter.get("/", async (_req, res, next) => {
    try {
      const items = await courseRepository.listCourses();
      res.json({ items, count: items.length });
    } catch (error) {
      next(error);
    }
  });

  coursesRouter.get("/:slug", async (req, res, next) => {
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

  return coursesRouter;
}