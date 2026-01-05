const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://wizard_collection_user:9WgUdd1kmeoxnWrUam0tb7X5slInA0bc@dpg-d5282fmr433s73fld6kg-a.oregon-postgres.render.com/wizard_collection',
  ssl: { rejectUnauthorized: false }
});

const sql = `
CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    respondent_name VARCHAR(255) NOT NULL,
    respondent_email VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tp_q1 BOOLEAN, tp_q2 BOOLEAN, tp_q3 BOOLEAN, tp_q4 BOOLEAN, tp_q5 BOOLEAN,
    ttb_q1 BOOLEAN, ttb_q2 BOOLEAN, ttb_q3 BOOLEAN, ttb_q4 BOOLEAN, ttb_q5 BOOLEAN, ttb_q6 BOOLEAN,
    pao_q1 BOOLEAN, pao_q2 BOOLEAN, pao_q3 BOOLEAN, pao_q4 BOOLEAN, pao_q5 BOOLEAN,
    psd_q1 BOOLEAN, psd_q2 BOOLEAN, psd_q3 BOOLEAN, psd_q4 BOOLEAN, psd_q5 BOOLEAN,
    pw_q1 BOOLEAN, pw_q2 BOOLEAN, pw_q3 BOOLEAN, pw_q4 BOOLEAN,
    tr_q1 BOOLEAN, tr_q2 BOOLEAN, tr_q3 BOOLEAN, tr_q4 BOOLEAN,
    sd_q1 BOOLEAN, sd_q2 BOOLEAN, sd_q3 BOOLEAN, sd_q4 BOOLEAN,
    tp_awareness INT, tp_access INT, tp_setup INT, tp_usage INT, tp_need_training INT,
    ttb_awareness INT, ttb_access INT, ttb_setup INT, ttb_usage INT, ttb_need_training INT,
    pao_awareness INT, pao_access INT, pao_setup INT, pao_usage INT, pao_need_training INT,
    psd_awareness INT, psd_access INT, psd_setup INT, psd_usage INT, psd_need_training INT,
    pw_awareness INT, pw_access INT, pw_setup INT, pw_usage INT, pw_need_training INT,
    tr_awareness INT, tr_access INT, tr_setup INT, tr_usage INT, tr_need_training INT,
    sd_awareness INT, sd_access INT, sd_setup INT, sd_usage INT, sd_need_training INT,
    capability_score DECIMAL(5,2),
    avg_confidence_score DECIMAL(3,2)
);
`;

async function createTable() {
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('✅ Table "responses" created successfully!');
  } catch (err) {
    console.error('❌ Error creating table:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createTable();



