import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-title-officer';

export async function POST(request: NextRequest) {
  try {
    const { 
      company, 
      titleOfficerName, 
      titleUnitLocation, 
      evaluationPeriod, 
      dateCompleted, 
      responses 
    } = await request.json();

    // Validate required fields
    if (!company || !titleOfficerName || !titleUnitLocation || !evaluationPeriod || !dateCompleted) {
      return NextResponse.json(
        { error: 'All header fields are required' }, 
        { status: 400 }
      );
    }

    // Validate responses
    const requiredQuestions = [
      'q1_title_knowledge',
      'q2_risk_identification',
      'q3_workload_management',
      'q4_process_consistency',
      'q5_customer_service',
      'q6_internal_external_communication',
      'q7_team_leadership',
      'q8_training_succession',
      'q9_underwriting_compliance',
      'q10_overall_evaluation'
    ];

    for (const q of requiredQuestions) {
      if (!responses[q] || responses[q].trim().length < 50) {
        return NextResponse.json(
          { error: `Response for ${q} is required and must be at least 50 characters` },
          { status: 400 }
        );
      }
    }

    const sql = `
      INSERT INTO title_officer_evaluations (
        company,
        title_officer_name,
        title_unit_location,
        evaluation_period,
        date_completed,
        q1_title_knowledge,
        q2_risk_identification,
        q3_workload_management,
        q4_process_consistency,
        q5_customer_service,
        q6_internal_external_communication,
        q7_team_leadership,
        q8_training_succession,
        q9_underwriting_compliance,
        q10_overall_evaluation
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, submitted_at
    `;

    const values = [
      company,
      titleOfficerName,
      titleUnitLocation,
      evaluationPeriod,
      dateCompleted,
      responses.q1_title_knowledge,
      responses.q2_risk_identification,
      responses.q3_workload_management,
      responses.q4_process_consistency,
      responses.q5_customer_service,
      responses.q6_internal_external_communication,
      responses.q7_team_leadership,
      responses.q8_training_succession,
      responses.q9_underwriting_compliance,
      responses.q10_overall_evaluation
    ];

    const result = await query(sql, values);

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      submittedAt: result.rows[0].submitted_at
    });
  } catch (error) {
    console.error('Title Officer evaluation save error:', error);
    return NextResponse.json(
      { error: 'Failed to save evaluation' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await query(
      `SELECT * FROM title_officer_evaluations ORDER BY submitted_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const count = await query('SELECT COUNT(*) FROM title_officer_evaluations');

    return NextResponse.json({
      evaluations: result.rows,
      total: parseInt(count.rows[0].count)
    });
  } catch (error) {
    console.error('Title Officer evaluation fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' }, 
      { status: 500 }
    );
  }
}

// Update scores (for management use)
export async function PATCH(request: NextRequest) {
  try {
    const { 
      id,
      scoreTechnicalCompetency,
      scoreOperationalPerformance,
      scoreCustomerCommunication,
      scoreLeadership,
      scoreCompliance,
      scoreOverall,
      executiveNotes,
      scoredBy
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Evaluation ID is required' }, 
        { status: 400 }
      );
    }

    const sql = `
      UPDATE title_officer_evaluations SET
        score_technical_competency = $2,
        score_operational_performance = $3,
        score_customer_communication = $4,
        score_leadership = $5,
        score_compliance = $6,
        score_overall = $7,
        executive_notes = $8,
        scored_by = $9,
        scored_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, scored_at
    `;

    const values = [
      id,
      scoreTechnicalCompetency,
      scoreOperationalPerformance,
      scoreCustomerCommunication,
      scoreLeadership,
      scoreCompliance,
      scoreOverall,
      executiveNotes,
      scoredBy
    ];

    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evaluation not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      scoredAt: result.rows[0].scored_at
    });
  } catch (error) {
    console.error('Title Officer evaluation update error:', error);
    return NextResponse.json(
      { error: 'Failed to update evaluation' }, 
      { status: 500 }
    );
  }
}
