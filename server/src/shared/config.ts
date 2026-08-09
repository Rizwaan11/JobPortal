import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: z.url(),
  REDIS_URL: z.url(),
  JWT_SECRET: z.string().min(10),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

export const config = parsed.data;