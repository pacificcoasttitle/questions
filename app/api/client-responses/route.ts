import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-title-officer';

const TOOL_MAP: Record<string, { prefix: string; questions: number }> = {
  'title-profile': { prefix: 'tp', questions: 5 },
  'title-toolbox': { prefix: 'ttb', questions: 6 },
  'pacific-agent-one': { prefix: 'pao', questions: 5 },
  'pct-smart-direct': { prefix: 'psd', questions: 5 },
  'pct-website': { prefix: 'pw', questions: 4 },
  'trainings': { prefix: 'tr', questions: 4 },
  'sales-dashboard': { prefix: 'sd', questions: 4 }
};

export async function POST(request: NextRequest) {
  try {
    const { 
      salesRepSlug,
      clientName, 
      clientEmail, 
      clientPhone,
      clientCompany,
      needsAssessment,
      responses, 
      confidenceRatings 
    } = await request.json();

    if (!salesRepSlug || !clientName || !clientEmail) {
      return NextResponse.json({ error: 'Sales rep, client name, and email are required' }, { status: 400 });
    }

    // Get sales rep ID
    const repResult = await query('SELECT id FROM sales_reps WHERE slug = $1', [salesRepSlug]);
    const salesRepId = repResult.rows[0]?.id || null;

    // Build columns and values
    const columns: string[] = [
      'sales_rep_id', 'sales_rep_slug', 
      'client_name', 'client_email', 'client_phone', 'client_company'
    ];
    const values: any[] = [
      salesRepId, salesRepSlug,
      clientName, clientEmail, clientPhone || null, clientCompany || null
    ];

    // Needs assessment fields
    if (needsAssessment) {
      columns.push(
        'needs_title_search', 'needs_escrow_services', 'needs_property_profiles',
        'needs_farm_lists', 'needs_direct_mail', 'needs_mobile_app',
        'needs_training', 'needs_other', 'timeline', 'additional_notes'
      );
      values.push(
        needsAssessment.titleSearch || false,
        needsAssessment.escrowServices || false,
        needsAssessment.propertyProfiles || false,
        needsAssessment.farmLists || false,
        needsAssessment.directMail || false,
        needsAssessment.mobileApp || false,
        needsAssessment.training || false,
        needsAssessment.other || null,
        needsAssessment.timeline || null,
        needsAssessment.additionalNotes || null
      );
    }

    // Tool questions
    for (const [toolKey, config] of Object.entries(TOOL_MAP)) {
      const toolResponses = responses?.[toolKey] || {};
      for (let i = 1; i <= config.questions; i++) {
        columns.push(`${config.prefix}_q${i}`);
        values.push(toolResponses[`q${i}`] ?? null);
      }
    }

    // Confidence ratings
    for (const [toolKey, config] of Object.entries(TOOL_MAP)) {
      const ratings = confidenceRatings?.[toolKey] || {};
      columns.push(`${config.prefix}_awareness`);
      values.push(ratings.awareness ?? null);
      columns.push(`${config.prefix}_access`);
      values.push(ratings.access ?? null);
      columns.push(`${config.prefix}_setup`);
      values.push(ratings.setup ?? null);
      columns.push(`${config.prefix}_usage`);
      values.push(ratings.usage ?? null);
      columns.push(`${config.prefix}_need_training`);
      values.push(ratings.needTraining ?? null);
    }

    // Calculate scores
    const allResponses = Object.values(responses || {}).flatMap(t => Object.values(t as Record<string, boolean>));
    const yesCount = allResponses.filter(v => v === true).length;
    const capabilityScore = allResponses.length > 0 ? (yesCount / 33) * 100 : 0;
    
    const allConfidence = Object.values(confidenceRatings || {}).flatMap(t => Object.values(t as Record<string, number>));
    const avgConfidence = allConfidence.length > 0 ? allConfidence.reduce((a, b) => a + b, 0) / allConfidence.length : 0;

    columns.push('capability_score', 'avg_confidence_score');
    values.push(capabilityScore.toFixed(2), avgConfidence.toFixed(2));

    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO client_responses (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id, submitted_at`;
    
    const result = await query(sql, values);

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      submittedAt: result.rows[0].submitted_at,
      scores: { 
        capability: Math.round(capabilityScore), 
        capabilityRaw: `${yesCount}/33`, 
        confidence: avgConfidence.toFixed(1) 
      }
    });
  } catch (error) {
    console.error('Client response save error:', error);
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const repSlug = searchParams.get('rep');

    let sql = `
      SELECT cr.*, sr.name as sales_rep_name, sr.email as sales_rep_email
      FROM client_responses cr
      LEFT JOIN sales_reps sr ON cr.sales_rep_id = sr.id
    `;
    const params: any[] = [];

    if (repSlug) {
      sql += ' WHERE cr.sales_rep_slug = $1';
      params.push(repSlug);
      sql += ` ORDER BY cr.submitted_at DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      sql += ` ORDER BY cr.submitted_at DESC LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }

    const result = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) FROM client_responses';
    const countParams: any[] = [];
    if (repSlug) {
      countSql += ' WHERE sales_rep_slug = $1';
      countParams.push(repSlug);
    }
    const count = await query(countSql, countParams);

    return NextResponse.json({ 
      responses: result.rows, 
      total: parseInt(count.rows[0].count) 
    });
  } catch (error) {
    console.error('Client responses fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}
