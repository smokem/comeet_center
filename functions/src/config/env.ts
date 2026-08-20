import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  CORS_ORIGIN: z.string().default("*"),
});

export const env = envSchema.parse(process.env);
