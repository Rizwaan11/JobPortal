import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3000),

  MONGO_URI: z.string().url(),

  REDIS_URL: z.string().url(),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().default('noreply@jobportal.local'),
  OTP_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(15),

  INVITATION_EXPIRES_IN_HOURS: z.coerce.number().int().positive().default(72),
  APP_BASE_URL: z.string().url().default('http://localhost:3000'),

  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment configuration:",
    parsed.error.flatten().fieldErrors
  );

  process.exit(1);
}

export const config = parsed.data;
