import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_USER: z.string().min(1, 'DATABASE_USER is required'),
  DATABASE_PASSWORD: z.string().min(1, 'DATABASE_PASSWORD is required'),
  DATABASE_HOST: z.string().min(1, 'DATABASE_HOST is required'),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_NAME: z.string().min(1, 'DATABASE_NAME is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.log('Invalid enviroment variables', _env.error.format());

  throw new Error('Invalid enviroment variables');
}

export const env = _env.data;
