import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { validateEnv } from './validate.js';

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
    config({ path, override: true });
  });
};

loadEnvFiles();
export const env = validateEnv();