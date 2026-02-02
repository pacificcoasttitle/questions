const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://wizard_collection_user:9WgUdd1kmeoxnWrUam0tb7X5slInA0bc@dpg-d5282fmr433s73fld6kg-a.oregon-postgres.render.com/wizard_collection',
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  const client = await pool.connect();
  try {
    // List all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('✅ Tables in wizard_collection database:\n');
    for (const row of tables.rows) {
      const countResult = await client.query(`SELECT COUNT(*) FROM ${row.table_name}`);
      console.log(`  • ${row.table_name} (${countResult.rows[0].count} records)`);
    }
    
    // Show sales reps count
    const reps = await client.query('SELECT COUNT(*) FROM sales_reps WHERE is_active = true');
    console.log(`\n📊 Active Sales Reps: ${reps.rows[0].count}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTables();
