import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import { env } from '../src/configs/index.js';


const pool = new Pool({
  connectionString: env.DATABASE_URL, // Your Neon connection string
  ssl: (env.NODE_ENV === 'production') ? { rejectUnauthorized: false } : true, // Neon requires SSL
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });

// Database connection test function
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

// Graceful shutdown handler
export const closePool = async (): Promise<void> => {
  try {
    // Remove all listeners before closing
    pool.removeAllListeners();
    
    // Wait for all clients to finish
    await pool.end();
    
    // Optional: wait a bit to ensure all connections are properly closed
    await new Promise(resolve => setTimeout(resolve, 100));
    
  } catch (error: any) {
    console.error('❌ Error closing connection pool:', error.message);
    throw error;
  }
};

// Health check for the database
export const healthCheck = async (): Promise<{ status: string; timestamp: string; error?: string }> => {
  try {
    await testConnection();
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
};

// Event listeners for connection pool
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

// Test connection on startup (optional)
if (process.env.NODE_ENV !== 'test') {
  testConnection().then(success => {
    if (!success) {
      console.warn('⚠️  Initial database connection test failed');
    }
  });
}

export default pool;