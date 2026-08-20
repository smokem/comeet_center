import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { createInMemoryCourseRepository } from "../src/lib/course-repository.js";
import { courses } from "../src/data/courses.js";

describe("backend API", () => {
  const app = createApp({
    courseRepository: createInMemoryCourseRepository(courses),
  });

  it("returns the health payload", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "ok",
      service: "co-meet-space-backend",
    });
    expect(response.body.uptime).toEqual(expect.any(Number));
  });

  it("lists courses", async () => {
    const response = await request(app).get("/api/courses");

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(courses.length);
    expect(response.body.items).toHaveLength(courses.length);
  });

  it("returns a single course by slug", async () => {
    const response = await request(app).get("/api/courses/management-equipe-hybride");

    expect(response.status).toBe(200);
    expect(response.body.item).toMatchObject({
      slug: "management-equipe-hybride",
      title: "Manager une équipe hybride",
    });
  });

  it("returns 404 for a missing course", async () => {
    const response = await request(app).get("/api/courses/not-a-real-course");

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ message: "Course not found" });
  });
});