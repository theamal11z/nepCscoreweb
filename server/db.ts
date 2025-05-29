import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Function to test database connection
export async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to Neon PostgreSQL database');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    return false;
  }
}