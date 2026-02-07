import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { config } from 'dotenv';
config();

if (!process.env.DATABASE_URL) {
  console.error(
    '❌ DATABASE_URL is missing from environment variables'
  );
  throw new Error('DATABASE_URL is missing');
} else {
  console.log('✅ Database connection initialized');
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(process.env.DATABASE_URL, { prepare: false });
export const db = drizzle(client, { schema });
