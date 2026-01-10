import { z } from 'zod';

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Socket
  SOCKET_PORT: z.coerce.number().default(5000),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_SSL: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().default(true)),

  // Auth
  CLERK_SECRET_KEY: z.string().startsWith('sk_'),
  CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  JWT_SECRET: z.string().min(1).default('your_jwt_secret'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // CORS
  CORS_ORIGIN: z.string().default('*'),
  ALLOWED_ORIGINS: z.preprocess((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return val;
  }, z.array(z.string()).default([
    'http://localhost:3000',
    'https://stuflux.vercel.app',
  ])),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (): Env => {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('❌ Unexpected error during validation:', error);
    }
    process.exit(1);
  }
};