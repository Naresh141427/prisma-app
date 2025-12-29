import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string({ message: "DATABASE_URL is missing" }),
  PORT: z.string().default("3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  JWT_ACCESS_SECRET: z.string({ message: " JWT_ACCESS_SECRET is missing" }),
  JWT_REFRESH_SECRET: z.string({ message: " JWT_REFRESH_SECRET is missing" }),

  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  REDIS_HOST: z
    .string({ message: "REDIS_HOST is required" })
    .default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().default(6379),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Invalid environment variables : ", _env.error);
  process.exit(1);
}

export const env = _env.data;
