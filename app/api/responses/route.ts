import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
    const { respondentName, respondentEmail, responses, confidenceRatings } = await request.json();
    if (!respondentName || !respondentEmail) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
    }
    const columns: string[] = ['respondent_name', 'respondent_email'];
    const values: any[] = [respondentName, respondentEmail];
    for (const [toolKey, config] of Object.entries(TOOL_MAP)) {
      const toolResponses = responses[toolKey] || {};
      for (let i = 1; i <= config.questions; i++) {
        columns.push(`${config.prefix}_q${i}`);
        values.push(toolResponses[`q${i}`] ?? null);
      }
    }
    for (const [toolKey, config] of Object.entries(TOOL_MAP)) {
      const ratings = confidenceRatings[toolKey] || {};
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
    const allResponses = Object.values(responses).flatMap(t => Object.values(t as Record<string, boolean>));
    const yesCount = allResponses.filter(v => v === true).length;
    const capabilityScore = allResponses.length > 0 ? (yesCount / 33) * 100 : 0;
    const allConfidence = Object.values(confidenceRatings).flatMap(t => Object.values(t as Record<string, number>));
    const avgConfidence = allConfidence.length > 0 ? allConfidence.reduce((a, b) => a + b, 0) / allConfidence.length : 0;
    columns.push('capability_score', 'avg_confidence_score');
    values.push(capabilityScore.toFixed(2), avgConfidence.toFixed(2));
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO responses (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id, submitted_at`;
    const result = await query(sql, values);
    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      submittedAt: result.rows[0].submitted_at,
      scores: { capability: Math.round(capabilityScore), capabilityRaw: `${yesCount}/33`, confidence: avgConfidence.toFixed(1) }
    });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const result = await query(`SELECT id, respondent_name, respondent_email, submitted_at, capability_score, avg_confidence_score FROM responses ORDER BY submitted_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    const count = await query('SELECT COUNT(*) FROM responses');
    return NextResponse.json({ responses: result.rows, total: parseInt(count.rows[0].count) });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
