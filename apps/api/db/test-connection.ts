import { db, testConnection } from './index.js';
import { sql } from 'drizzle-orm';
import { env } from '../src/config/env.js';

async function verifyDatabase() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Try a direct pool query first
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : true,
    });

    console.log('Testing direct pool connection...');
    const poolResult = await pool.query('SELECT NOW()');
    console.log('✅ Direct pool connection successful:', poolResult.rows[0]);

    // Now test the drizzle connection
    console.log('\nTesting drizzle connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Drizzle connection failed');
    }

    console.log('\nTesting version query...');
    // Test basic query using drizzle's sql
    const version = await db.execute(sql`SELECT version()`);
    // @ts-ignore drizzle returns adapter-specific result
    console.log('✅ Database version:', version.rows?.[0]?.version ?? version[0]?.version ?? 'unknown');
    
    // Test schema access
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    // @ts-ignore normalize output
    const tableNames = (tables.rows ?? tables).map((r: any) => r.table_name);
    console.log('✅ Available tables:', tableNames);
    
  } catch (error: any) {
    console.error('❌ Database query failed:', error.message);
    process.exit(1);
  }
}

verifyDatabase();