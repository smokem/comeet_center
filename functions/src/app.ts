import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import {
  createDefaultCourseRepository,
  type CourseRepository,
} from "./lib/course-repository";
import { createCoursesRouter } from "./routes/courses";
import { healthRouter } from "./routes/health";

type AppDependencies = {
  courseRepository?: CourseRepository;
};

export function createApp(
  { courseRepository = createDefaultCourseRepository() }: AppDependencies = {},
) {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
    }),
  );
  app.use(express.json());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/", (_req, res) => {
    res.json({ name: "Co.meet Space API", version: "0.1.0" });
  });

  app.use("/api/health", healthRouter);
  app.use("/api/courses", createCoursesRouter(courseRepository));

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _next: express.NextFunction,
    ) => {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    },
  );

  return app;
}
