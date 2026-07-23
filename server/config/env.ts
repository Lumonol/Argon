import { z } from 'zod';
import { config } from 'dotenv';

config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().default('sqlite.db'),
  NODE_ENV: z.string().default('development'),
  JWT_SECRET: z.string().default('fallback_secret'),
  ARGON_EDITION: z.enum(['community', 'datacenter']).default('community'),
  AUTH_PROVIDER: z.string().optional(),
  AUTH_SECRET_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
