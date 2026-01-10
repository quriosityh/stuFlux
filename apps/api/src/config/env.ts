import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { validateEnv }  from './validate.js';

// Get the directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadEnvFiles = () => {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const envPaths = [
    join(__dirname, '../../', `.env.${NODE_ENV}`),
    join(__dirname, '../../', '.env'),
  ];

  // Load local overrides last
  if (NODE_ENV !== 'production') {
    envPaths.push(join(__dirname, '../../', '.env.local'));
  }

  envPaths.forEach(path => {
    config({ path, override: true } as any);
  });
};

loadEnvFiles();

// Set defaults for the requested vars if not provided
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
process.env.SOCKET_PORT = process.env.SOCKET_PORT || '5000';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
process.env.ALLOWED_ORIGINS =
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:3000,https://stuflux.vercel.app';

export const env = validateEnv();