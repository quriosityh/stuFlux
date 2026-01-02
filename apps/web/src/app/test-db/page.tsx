// apps/web/src/app/test-db/page.tsx
import { getDb } from "@/lib/db";
import { users } from "../../../../api/db/schema";
import { sql } from "drizzle-orm";

export default async function TestDbPage() {
  try {
    const db = getDb();
    const connectionTest = await db.execute(sql`SELECT version();`);
    
    // Check if users table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const usersTableExists = tableCheck.rows?.[0]?.exists;
    const result = usersTableExists 
      ? await db.select().from(users).limit(1)
      : [];

    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">🧠 Database Connection Test</h1>
        <div className="mt-4 space-y-4">
          <div>
            <h2 className="font-semibold">Connection Status:</h2>
            <pre className="mt-2 bg-green-50 text-green-700 p-4 rounded">Connected successfully!</pre>
          </div>
          <div>
            <h2 className="font-semibold">Database Version:</h2>
            <pre className="mt-2 bg-gray-100 p-4 rounded">
              {JSON.stringify(connectionTest.rows?.[0], null, 2)}
            </pre>
          </div>
          <div>
            <h2 className="font-semibold">Users Table Sample:</h2>
            <pre className="mt-2 bg-gray-100 p-4 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    console.error('Database connection error:', error);
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">🧠 Database Connection Test</h1>
        <div className="mt-4 bg-red-50 text-red-700 p-4 rounded">
          <h2 className="font-semibold">Error connecting to database:</h2>
          <pre className="mt-2">{error.message}</pre>
        </div>
      </div>
    );
  }
}

