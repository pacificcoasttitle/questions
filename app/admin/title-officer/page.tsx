'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';

const SECTIONS = [
  {
    id: 'technical',
    title: 'Section I – Technical Title Competency',
    questions: [
      { key: 'q1_title_knowledge', label: '1. Title Knowledge & Expertise' },
      { key: 'q2_risk_identification', label: '2. Risk Identification & Problem Resolution' },
    ],
    scoreKey: 'score_technical_competency'
  },
  {
    id: 'operational',
    title: 'Section II – Operational Performance',
    questions: [
      { key: 'q3_workload_management', label: '3. Workload Management & Turnaround Times' },
      { key: 'q4_process_consistency', label: '4. Process Consistency & Quality Control' },
    ],
    scoreKey: 'score_operational_performance'
  },
  {
    id: 'customer',
    title: 'Section III – Customer Interaction & Communication',
    questions: [
      { key: 'q5_customer_service', label: '5. Customer Service & Client Experience' },
      { key: 'q6_internal_external_communication', label: '6. Internal & External Communication' },
    ],
    scoreKey: 'score_customer_communication'
  },
  {
    id: 'leadership',
    title: 'Section IV – Leadership & Management',
    questions: [
      { key: 'q7_team_leadership', label: '7. Team Leadership & Accountability' },
      { key: 'q8_training_succession', label: '8. Training, Cross-Training & Succession Risk' },
    ],
    scoreKey: 'score_leadership'
  },
  {
    id: 'compliance',
    title: 'Section V – Compliance & Judgment',
    questions: [
      { key: 'q9_underwriting_compliance', label: '9. Underwriting, Compliance & Decision-Making' },
    ],
    scoreKey: 'score_compliance'
  },
  {
    id: 'overall',
    title: 'Section VI – Overall Assessment',
    questions: [
      { key: 'q10_overall_evaluation', label: '10. Overall Unit Evaluation & Improvement Plan' },
    ],
    scoreKey: 'score_overall'
  }
];

const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  5: { label: 'Exceptional', color: 'bg-green-100 text-green-800 border-green-200' },
  4: { label: 'Strong', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  3: { label: 'Satisfactory', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  2: { label: 'Needs Improvement', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  1: { label: 'Deficient', color: 'bg-red-100 text-red-800 border-red-200' },
};

type Evaluation = {
  id: number;
  company: string;
  title_officer_name: string;
  title_unit_location: string;
  evaluation_period: string;
  date_completed: string;
  submitted_at: string;
  q1_title_knowledge: string;
  q2_risk_identification: string;
  q3_workload_management: string;
  q4_process_consistency: string;
  q5_customer_service: string;
  q6_internal_external_communication: string;
  q7_team_leadership: string;
  q8_training_succession: string;
  q9_underwriting_compliance: string;
  q10_overall_evaluation: string;
  score_technical_competency: number | null;
  score_operational_performance: number | null;
  score_customer_communication: number | null;
  score_leadership: number | null;
  score_compliance: number | null;
  score_overall: number | null;
  executive_notes: string | null;
  scored_by: string | null;
  scored_at: string | null;
};

export default function TitleOfficerAdminPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [scoring, setScoring] = useState<{
    id: number;
    scores: Record<string, number>;
    notes: string;
    scoredBy: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = () => {
    fetch('/api/title-officer?limit=100')
      .then(res => res.json())
      .then(data => {
        setEvaluations(data.evaluations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    setScoring(null);
  };

  const startScoring = (evaluation: Evaluation) => {
    setScoring({
      id: evaluation.id,
      scores: {
        score_technical_competency: evaluation.score_technical_competency || 0,
        score_operational_performance: evaluation.score_operational_performance || 0,
        score_customer_communication: evaluation.score_customer_communication || 0,
        score_leadership: evaluation.score_leadership || 0,
        score_compliance: evaluation.score_compliance || 0,
        score_overall: evaluation.score_overall || 0,
      },
      notes: evaluation.executive_notes || '',
      scoredBy: evaluation.scored_by || ''
    });
  };

  const handleScoreChange = (key: string, value: number) => {
    if (scoring) {
      setScoring({
        ...scoring,
        scores: { ...scoring.scores, [key]: value }
      });
    }
  };

  const handleSaveScores = async () => {
    if (!scoring) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/title-officer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: scoring.id,
          scoreTechnicalCompetency: scoring.scores.score_technical_competency || null,
          scoreOperationalPerformance: scoring.scores.score_operational_performance || null,
          scoreCustomerCommunication: scoring.scores.score_customer_communication || null,
          scoreLeadership: scoring.scores.score_leadership || null,
          scoreCompliance: scoring.scores.score_compliance || null,
          scoreOverall: scoring.scores.score_overall || null,
          executiveNotes: scoring.notes || null,
          scoredBy: scoring.scoredBy || null
        })
      });
      
      if (res.ok) {
        fetchEvaluations();
        setScoring(null);
      }
    } catch (error) {
      console.error('Failed to save scores:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderScore = (score: number | null) => {
    if (!score) return <span className="text-gray-400 text-sm">Not scored</span>;
    const info = SCORE_LABELS[score];
    return (
      <span className={`px-2 py-1 rounded text-sm font-medium border ${info.color}`}>
        {score} - {info.label}
      </span>
    );
  };

  const getAverageScore = (evaluation: Evaluation) => {
    const scores = [
      evaluation.score_technical_competency,
      evaluation.score_operational_performance,
      evaluation.score_customer_communication,
      evaluation.score_leadership,
      evaluation.score_compliance,
      evaluation.score_overall
    ].filter(s => s !== null) as number[];
    
    if (scores.length === 0) return null;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  return (
    <AdminLayout currentPage="title-officer">
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">Title Officer Evaluations</h1>
          <p className="text-stone-600 dark:text-stone-300 mt-1">
            {evaluations.length} evaluation{evaluations.length !== 1 ? 's' : ''} submitted
          </p>
        </div>

        {/* Scoring Legend */}
        <div className="bg-white dark:bg-stone-800 rounded-xl p-4 mb-6 shadow-sm">
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200 mb-3">Executive Scoring Rubric</h3>
          <div className="flex flex-wrap gap-3">
            {[5, 4, 3, 2, 1].map(score => (
              <div key={score} className={`px-3 py-1.5 rounded-lg text-sm border ${SCORE_LABELS[score].color}`}>
                <span className="font-bold">{score}</span> – {SCORE_LABELS[score].label}
              </div>
            ))}
          </div>
        </div>

        {/* Evaluations List */}
        <div className="space-y-4">
          {evaluations.map((evaluation) => {
            const avgScore = getAverageScore(evaluation);
            
            return (
              <div key={evaluation.id} className="bg-white dark:bg-stone-800 rounded-xl shadow-sm overflow-hidden">
                {/* Summary Row */}
                <div 
                  className="p-5 cursor-pointer hover:bg-amber-50 dark:hover:bg-stone-700 transition-colors flex items-center justify-between"
                  onClick={() => toggleExpand(evaluation.id)}
                >
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="font-semibold text-lg text-stone-800 dark:text-stone-100">
                        {evaluation.title_officer_name}
                      </div>
                      <div className="text-stone-500 dark:text-stone-400 text-sm">
                        {evaluation.company} • {evaluation.title_unit_location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-stone-500 dark:text-stone-400">Period</div>
                      <div className="font-medium text-stone-700 dark:text-stone-200">{evaluation.evaluation_period}</div>
                    </div>
                    {avgScore && (
                      <div className="text-center">
                        <div className="text-sm text-stone-500 dark:text-stone-400">Avg Score</div>
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{avgScore}/5</div>
                      </div>
                    )}
                    <div className="text-sm text-stone-500 dark:text-stone-400">
                      {new Date(evaluation.submitted_at).toLocaleDateString()}
                    </div>
                    <div className="text-stone-400 text-xl">
                      {expandedId === evaluation.id ? '▼' : '▶'}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === evaluation.id && (
                  <div className="border-t border-stone-200 dark:border-stone-700 p-6 bg-stone-50 dark:bg-stone-900">
                    {/* Header Info */}
                    <div className="grid md:grid-cols-4 gap-4 mb-6 p-4 bg-white dark:bg-stone-800 rounded-lg">
                      <div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">Company</div>
                        <div className="font-medium text-stone-800 dark:text-stone-100">{evaluation.company}</div>
                      </div>
                      <div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">Title Officer</div>
                        <div className="font-medium text-stone-800 dark:text-stone-100">{evaluation.title_officer_name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">Unit/Location</div>
                        <div className="font-medium text-stone-800 dark:text-stone-100">{evaluation.title_unit_location}</div>
                      </div>
                      <div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">Evaluation Period</div>
                        <div className="font-medium text-stone-800 dark:text-stone-100">{evaluation.evaluation_period}</div>
                      </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-6">
                      {SECTIONS.map((section) => (
                        <div key={section.id} className="bg-white dark:bg-stone-800 rounded-lg p-5 border border-stone-200 dark:border-stone-700">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg text-stone-800 dark:text-stone-100">{section.title}</h3>
                            {!scoring && renderScore(evaluation[section.scoreKey as keyof Evaluation] as number | null)}
                          </div>
                          
                          {/* Questions & Responses */}
                          <div className="space-y-4">
                            {section.questions.map((q) => (
                              <div key={q.key} className="space-y-2">
                                <h4 className="font-medium text-stone-700 dark:text-stone-200">{q.label}</h4>
                                <div className="bg-stone-50 dark:bg-stone-900 rounded-lg p-4 text-stone-600 dark:text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">
                                  {evaluation[q.key as keyof Evaluation] as string || 'No response'}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Scoring input */}
                          {scoring && scoring.id === evaluation.id && (
                            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                              <label className="text-sm font-medium text-stone-700 dark:text-stone-200 block mb-2">
                                Score for {section.title.replace('Section ', '').split(' – ')[1]}
                              </label>
                              <div className="flex gap-2">
                                {[0, 1, 2, 3, 4, 5].map((score) => (
                                  <button
                                    key={score}
                                    onClick={() => handleScoreChange(section.scoreKey, score)}
                                    className={`w-12 h-10 rounded-lg font-semibold transition-colors ${
                                      scoring.scores[section.scoreKey] === score
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                                    }`}
                                  >
                                    {score === 0 ? '—' : score}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Executive Scoring Section */}
                    <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-5 border border-amber-200 dark:border-amber-800">
                      <h3 className="font-semibold text-lg text-amber-900 dark:text-amber-100 mb-4">
                        Executive Scoring (Management Use Only)
                      </h3>
                      
                      {scoring && scoring.id === evaluation.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-amber-800 dark:text-amber-200 block mb-2">
                              Scored By
                            </label>
                            <input
                              type="text"
                              value={scoring.scoredBy}
                              onChange={(e) => setScoring({ ...scoring, scoredBy: e.target.value })}
                              placeholder="Enter your name"
                              className="w-full px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-amber-800 dark:text-amber-200 block mb-2">
                              Executive Notes
                            </label>
                            <textarea
                              value={scoring.notes}
                              onChange={(e) => setScoring({ ...scoring, notes: e.target.value })}
                              placeholder="Add notes about this evaluation..."
                              rows={3}
                              className="w-full px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handleSaveScores}
                              disabled={saving}
                              className="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              {saving ? 'Saving...' : 'Save Scores'}
                            </button>
                            <button
                              onClick={() => setScoring(null)}
                              className="px-6 py-2 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg font-medium hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {evaluation.scored_by && (
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wide">Scored By</div>
                                <div className="font-medium text-amber-900 dark:text-amber-100">{evaluation.scored_by}</div>
                              </div>
                              <div>
                                <div className="text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wide">Scored At</div>
                                <div className="font-medium text-amber-900 dark:text-amber-100">
                                  {evaluation.scored_at ? new Date(evaluation.scored_at).toLocaleString() : '—'}
                                </div>
                              </div>
                            </div>
                          )}
                          {evaluation.executive_notes && (
                            <div>
                              <div className="text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-1">Executive Notes</div>
                              <div className="text-amber-900 dark:text-amber-100 whitespace-pre-wrap">{evaluation.executive_notes}</div>
                            </div>
                          )}
                          <button
                            onClick={() => startScoring(evaluation)}
                            className="px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium transition-colors"
                          >
                            {evaluation.scored_by ? 'Edit Scores' : 'Add Scores'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {evaluations.length === 0 && !loading && (
            <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm p-12 text-center">
              <div className="text-stone-500 dark:text-stone-400 text-lg">No evaluations submitted yet</div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
