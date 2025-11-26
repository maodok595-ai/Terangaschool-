import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configuration for standard PostgreSQL (works with Render and other providers)
const poolConfig: any = {
  connectionString: process.env.DATABASE_URL,
};

// Add SSL configuration for production (required by Render)
if (process.env.NODE_ENV === 'production') {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

export const pool = new Pool(poolConfig);
export const db = drizzle(pool, { schema });
