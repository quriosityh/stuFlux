import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../../db/schema.js';
import { env } from '../../config/env.js';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });

export const testConnection = async (): Promise<boolean> => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database connected successfully at:', result.rows[0].current_time);
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    if (client) client.release();
  }
};

export const closePool = async (): Promise<void> => {
  try {
    pool.removeAllListeners();
    await pool.end();
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error: any) {
    console.error('❌ Error closing connection pool:', error.message);
    throw error;
  }
};

export const healthCheck = async (): Promise<{ status: string; timestamp: string; error?: string }> => {
  try {
    await testConnection();
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
};

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('🔌 New database connection established');
  }
});

pool.on('error', (err: Error) => {
  console.error('💥 Database connection pool error:', err.message);
});

pool.on('remove', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('🔌 Database connection removed from pool');
  }
});

if (process.env.NODE_ENV !== 'test') {
  testConnection().then(success => {
    if (!success) {
      console.warn('⚠️  Initial database connection test failed');
    }
  });
}

export default pool;
