// Script to create the sales_reps and client_responses tables
// Run with: node scripts/create-client-tables.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://wizard_collection_user:9WgUdd1kmeoxnWrUam0tb7X5slInA0bc@dpg-d5282fmr433s73fld6kg-a.oregon-postgres.render.com/wizard_collection',
  ssl: { rejectUnauthorized: false }
});

const createSalesRepsTableSQL = `
CREATE TABLE IF NOT EXISTS sales_reps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    title VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_reps_slug ON sales_reps(slug);
CREATE INDEX IF NOT EXISTS idx_sales_reps_active ON sales_reps(is_active);
`;

const createClientResponsesTableSQL = `
CREATE TABLE IF NOT EXISTS client_responses (
    id SERIAL PRIMARY KEY,
    
    -- Sales Rep Reference
    sales_rep_id INTEGER REFERENCES sales_reps(id),
    sales_rep_slug VARCHAR(255) NOT NULL,
    
    -- Client Lead Information
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    client_company VARCHAR(255),
    
    -- Needs Assessment
    needs_title_search BOOLEAN DEFAULT false,
    needs_escrow_services BOOLEAN DEFAULT false,
    needs_property_profiles BOOLEAN DEFAULT false,
    needs_farm_lists BOOLEAN DEFAULT false,
    needs_direct_mail BOOLEAN DEFAULT false,
    needs_mobile_app BOOLEAN DEFAULT false,
    needs_training BOOLEAN DEFAULT false,
    needs_other TEXT,
    timeline VARCHAR(100),
    additional_notes TEXT,
    
    -- Submission tracking
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Title Profile Questions (5)
    tp_q1 BOOLEAN, tp_q2 BOOLEAN, tp_q3 BOOLEAN, tp_q4 BOOLEAN, tp_q5 BOOLEAN,
    
    -- Title Tool Box Questions (6)
    ttb_q1 BOOLEAN, ttb_q2 BOOLEAN, ttb_q3 BOOLEAN, ttb_q4 BOOLEAN, ttb_q5 BOOLEAN, ttb_q6 BOOLEAN,
    
    -- Pacific Agent ONE Questions (5)
    pao_q1 BOOLEAN, pao_q2 BOOLEAN, pao_q3 BOOLEAN, pao_q4 BOOLEAN, pao_q5 BOOLEAN,
    
    -- PCT Smart Direct Questions (5)
    psd_q1 BOOLEAN, psd_q2 BOOLEAN, psd_q3 BOOLEAN, psd_q4 BOOLEAN, psd_q5 BOOLEAN,
    
    -- PCT Website Questions (4)
    pw_q1 BOOLEAN, pw_q2 BOOLEAN, pw_q3 BOOLEAN, pw_q4 BOOLEAN,
    
    -- Trainings Questions (4)
    tr_q1 BOOLEAN, tr_q2 BOOLEAN, tr_q3 BOOLEAN, tr_q4 BOOLEAN,
    
    -- Sales Dashboard Questions (4)
    sd_q1 BOOLEAN, sd_q2 BOOLEAN, sd_q3 BOOLEAN, sd_q4 BOOLEAN,
    
    -- Title Profile Confidence Ratings
    tp_awareness INT, tp_access INT, tp_setup INT, tp_usage INT, tp_need_training INT,
    
    -- Title Tool Box Confidence Ratings
    ttb_awareness INT, ttb_access INT, ttb_setup INT, ttb_usage INT, ttb_need_training INT,
    
    -- Pacific Agent ONE Confidence Ratings
    pao_awareness INT, pao_access INT, pao_setup INT, pao_usage INT, pao_need_training INT,
    
    -- PCT Smart Direct Confidence Ratings
    psd_awareness INT, psd_access INT, psd_setup INT, psd_usage INT, psd_need_training INT,
    
    -- PCT Website Confidence Ratings
    pw_awareness INT, pw_access INT, pw_setup INT, pw_usage INT, pw_need_training INT,
    
    -- Trainings Confidence Ratings
    tr_awareness INT, tr_access INT, tr_setup INT, tr_usage INT, tr_need_training INT,
    
    -- Sales Dashboard Confidence Ratings
    sd_awareness INT, sd_access INT, sd_setup INT, sd_usage INT, sd_need_training INT,
    
    -- Calculated Scores
    capability_score DECIMAL(5,2),
    avg_confidence_score DECIMAL(3,2)
);

CREATE INDEX IF NOT EXISTS idx_client_responses_rep ON client_responses(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_client_responses_submitted ON client_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_responses_slug ON client_responses(sales_rep_slug);
`;

// Initial sales reps data from SalesReps.md
const salesRepsData = [
  { name: 'Neil Torquato', email: 'neil@pct.com', phone: '949.278.0118', title: 'SVP – Regional Sales Manager' },
  { name: 'Angeline Ahn', email: 'aahn@angelineahn.com', phone: '949.545.8859', title: null },
  { name: 'Michael Ahn', email: 'mike@angelineahn.com', phone: '949.568.5140', title: null },
  { name: 'Richard Bohn', email: 'rbohn@pct.com', phone: '760.519.3115', title: null },
  { name: 'Linda Ruiz', email: 'lruiz@pct.com', phone: '714.308.6000', title: null },
  { name: 'Mike Johnson', email: 'mike@joinmikej.com', phone: '949.584.7705', title: null },
  { name: 'Sonia Flores', email: 'sflores@pct.com', phone: '714.943.7149', title: null },
  { name: 'Sandra Millar', email: 'smillar@pct.com', phone: '714.323.2360', title: null },
  { name: 'Nick Watt', email: 'nwatt@pct.com', phone: '714.747.5189', title: null },
  { name: 'Briann Bohn', email: 'bbohn@pct.com', phone: null, title: null },
  { name: 'Christy Coffey', email: 'ccoffey@pct.com', phone: '949.887.0338', title: null },
  { name: 'Laurie Briggs', email: 'lbriggs@pct.com', phone: '949.370.9064', title: null },
  { name: 'Anthony Zamora', email: 'anthony@teammeza.com', phone: '562.631.6100', title: 'VP Sales Manager' },
  { name: 'Jorge Mesa', email: 'jorge@teammeza.com', phone: '562.343.3725', title: 'VP Sales Manager' },
  { name: 'Steve Lee', email: 'slee@pct.com', phone: '818.261.5036', title: null },
  { name: 'Michael Nouri', email: 'mnouri@pct.com', phone: '818.979.5152', title: null },
  { name: 'Esperanza Mesa', email: 'esperanza@teammeza.com', phone: '562.343.3781', title: null },
  { name: 'David Gomez', email: 'dgomez@pct.com', phone: '562.619.6062', title: null },
  { name: 'Maria Basilio', email: 'mbasilio@pct.com', phone: '909.248.6048', title: null },
  { name: 'Vito D\'Alessandro', email: 'vdalessandro@pct.com', phone: '626.824.8812', title: null },
  { name: 'Justin Nouri', email: 'jnouri@pct.com', phone: '818.231.7265', title: null },
  { name: 'Nini Kerns', email: 'nkerns@pct.com', phone: '714.496.4501', title: null },
  { name: 'Corey Velasquez', email: 'cvelasquez@pct.com', phone: '626.392.7993', title: null },
];

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function createTables() {
  const client = await pool.connect();
  try {
    console.log('Creating sales_reps table...');
    await client.query(createSalesRepsTableSQL);
    console.log('✅ sales_reps table created!');

    console.log('\nCreating client_responses table...');
    await client.query(createClientResponsesTableSQL);
    console.log('✅ client_responses table created!');

    // Insert sales reps
    console.log('\nInserting sales reps...');
    for (const rep of salesRepsData) {
      const slug = generateSlug(rep.name);
      try {
        await client.query(
          `INSERT INTO sales_reps (name, slug, email, phone, title) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (slug) DO UPDATE SET 
             name = EXCLUDED.name,
             email = EXCLUDED.email,
             phone = EXCLUDED.phone,
             title = EXCLUDED.title,
             updated_at = CURRENT_TIMESTAMP`,
          [rep.name, slug, rep.email, rep.phone, rep.title]
        );
        console.log(`  ✓ ${rep.name} → /client/${slug}`);
      } catch (err) {
        console.error(`  ✗ Failed to insert ${rep.name}:`, err.message);
      }
    }

    // Show all reps
    const result = await client.query('SELECT id, name, slug, email FROM sales_reps ORDER BY name');
    console.log(`\n✅ ${result.rows.length} sales reps in database:`);
    result.rows.forEach(r => {
      console.log(`   [${r.id}] ${r.name} → /client/${r.slug}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTables();
