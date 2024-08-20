
import dotenv, { config } from 'dotenv';
dotenv.config();
import path from 'path';
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import postgres from 'postgres';

// Load environment variables
config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment variables');
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

export const db = drizzle(sql, {
  schema,
});