import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "co-meet-space-backend",
    uptime: process.uptime(),
  });
});
