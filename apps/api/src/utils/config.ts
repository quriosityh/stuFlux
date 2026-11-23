import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

// Validate required environment variables
const required = ['DATABASE_URL'];
for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

export const DATABASE_URL = process.env.DATABASE_URL;
export const PORT = process.env.PORT || 4000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
