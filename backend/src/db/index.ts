
import dotenv, { config } from 'dotenv';
dotenv.config();
import path from 'path';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Load environment variables
config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment variables');
}


const sql = neon(process.env.DATABASE_URL)

export const db = drizzle(sql, {
	schema,
});
