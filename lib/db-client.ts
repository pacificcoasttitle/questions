import { Pool } from 'pg';

// Database connection for Client Surveys and Sales Reps
const pool = new Pool({
  connectionString: process.env.CLIENT_DATABASE_URL || 'postgresql://wizard_collection_user:9WgUdd1kmeoxnWrUam0tb7X5slInA0bc@dpg-d5282fmr433s73fld6kg-a.oregon-postgres.render.com/wizard_collection',
  ssl: { rejectUnauthorized: false }
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export default pool;
