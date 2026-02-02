// Script to create the title_officer_evaluations table
// Run with: node scripts/create-title-officer-table.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://wizard_collection_user:9WgUdd1kmeoxnWrUam0tb7X5slInA0bc@dpg-d5282fmr433s73fld6kg-a.oregon-postgres.render.com/wizard_collection',
  ssl: { rejectUnauthorized: false }
});

const createTableSQL = `
CREATE TABLE IF NOT EXISTS title_officer_evaluations (
    id SERIAL PRIMARY KEY,
    
    -- Header Information
    company VARCHAR(255) NOT NULL,
    title_officer_name VARCHAR(255) NOT NULL,
    title_unit_location VARCHAR(255) NOT NULL,
    evaluation_period VARCHAR(255) NOT NULL,
    date_completed DATE NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Section I: Technical Title Competency
    q1_title_knowledge TEXT,
    q2_risk_identification TEXT,
    
    -- Section II: Operational Performance
    q3_workload_management TEXT,
    q4_process_consistency TEXT,
    
    -- Section III: Customer Interaction & Communication
    q5_customer_service TEXT,
    q6_internal_external_communication TEXT,
    
    -- Section IV: Leadership & Management
    q7_team_leadership TEXT,
    q8_training_succession TEXT,
    
    -- Section V: Compliance & Judgment
    q9_underwriting_compliance TEXT,
    
    -- Section VI: Overall Assessment
    q10_overall_evaluation TEXT,
    
    -- Executive Scoring (Management Use)
    score_technical_competency INTEGER CHECK (score_technical_competency BETWEEN 1 AND 5),
    score_operational_performance INTEGER CHECK (score_operational_performance BETWEEN 1 AND 5),
    score_customer_communication INTEGER CHECK (score_customer_communication BETWEEN 1 AND 5),
    score_leadership INTEGER CHECK (score_leadership BETWEEN 1 AND 5),
    score_compliance INTEGER CHECK (score_compliance BETWEEN 1 AND 5),
    score_overall INTEGER CHECK (score_overall BETWEEN 1 AND 5),
    executive_notes TEXT,
    scored_by VARCHAR(255),
    scored_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_title_officer_evaluations_submitted_at ON title_officer_evaluations(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_title_officer_evaluations_company ON title_officer_evaluations(company);
CREATE INDEX IF NOT EXISTS idx_title_officer_evaluations_officer ON title_officer_evaluations(title_officer_name);
`;

async function createTable() {
  const client = await pool.connect();
  try {
    console.log('Creating title_officer_evaluations table...');
    await client.query(createTableSQL);
    console.log('Table created successfully!');
    
    // Verify table exists
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'title_officer_evaluations'
      ORDER BY ordinal_position
    `);
    console.log('\nTable columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTable();
