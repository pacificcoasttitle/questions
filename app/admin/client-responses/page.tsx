'use client';

import { useState, useEffect } from 'react';

const TOOLS = [
  {
    key: 'title-profile',
    name: 'Title Profile',
    prefix: 'tp',
    questions: [
      'Do you know how to access Title Profile?',
      'Do you know how to set up clients to receive profiles or alerts?',
      'Can you run property profiles?',
      'Can you explain profile sections to a client?',
      'Can you search by APN, owner, or address?',
    ],
  },
  {
    key: 'title-toolbox',
    name: 'Title Tool Box',
    prefix: 'ttb',
    questions: [
      'Know how to log in / access',
      'Know how to create a client farm',
      'Know how to set up client saved searches',
      'Can create farm lists',
      'Can build targeted lists (NOD, equity, absentee, etc.)',
      'Can export lists',
    ],
  },
  {
    key: 'pacific-agent-one',
    name: 'Pacific Agent ONE',
    prefix: 'pao',
    questions: [
      'Know how to access & install the app',
      'Know how to add clients into the app',
      'Know how to brand the app with their info',
      'Can generate seller net sheets & buyer estimates',
      'Can share branded live net sheets with clients',
    ],
  },
  {
    key: 'pct-smart-direct',
    name: 'PCT Smart Direct',
    prefix: 'psd',
    questions: [
      'Know how to access Smart Direct',
      'Can set up new client campaigns',
      'Can create mailing lists',
      'Can generate postcards',
      'Can filter properly (distress, equity, absentee, etc.)',
    ],
  },
  {
    key: 'pct-website',
    name: 'PCT Website',
    prefix: 'pw',
    questions: [
      'Know how to navigate the website',
      'Know how to set up clients with tools or resources',
      'Can find all available resources',
      'Can guide clients through the site',
    ],
  },
  {
    key: 'trainings',
    name: 'Trainings Offered by PCT',
    prefix: 'tr',
    questions: [
      'Know what trainings are available',
      'Know how to access training schedules',
      'Know how to enroll clients in trainings',
      'Know how to leverage training content',
    ],
  },
  {
    key: 'sales-dashboard',
    name: 'Sales Dashboard',
    prefix: 'sd',
    questions: [
      'Do you know how to access your PCT Sales Dashboard?',
      'Do you know how to read your numbers?',
      'Are you checking weekly? (Sales Units, Refi Units, Revenue, Pipeline, etc.)',
      'Do you know how to track personal goals, monthly targets, etc.?',
    ],
  },
];

const NEEDS_LABELS: Record<string, string> = {
  needs_title_search: 'Title Search & Examination',
  needs_escrow_services: 'Escrow Services',
  needs_property_profiles: 'Property Profiles & Reports',
  needs_farm_lists: 'Farm Lists & Targeted Marketing',
  needs_direct_mail: 'Direct Mail Campaigns',
  needs_mobile_app: 'Mobile App (Pacific Agent ONE)',
  needs_training: 'Training & Education',
};

export default function ClientResponsesAdminPage() {
  const [responses, setResponses] = useState<any[]>([]);
  const [reps, setReps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterRep, setFilterRep] = useState<string>('');

  useEffect(() => {
    Promise.all([
      fetch('/api/client-responses?limit=100').then(r => r.json()),
      fetch('/api/sales-reps').then(r => r.json())
    ]).then(([respData, repData]) => {
      setResponses(respData.responses || []);
      setReps(repData.reps || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = filterRep 
      ? `/api/client-responses?limit=100&rep=${filterRep}`
      : '/api/client-responses?limit=100';
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setResponses(data.responses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterRep]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderYesNo = (value: boolean | null) => {
    if (value === true) return <span className="text-green-600 font-medium">✓ Yes</span>;
    if (value === false) return <span className="text-red-500 font-medium">✗ No</span>;
    return <span className="text-gray-400">—</span>;
  };

  const renderConfidence = (value: number | null) => {
    if (value === null || value === undefined) return <span className="text-gray-400">—</span>;
    const colors = ['', 'bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 'bg-yellow-100 text-yellow-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700'];
    return <span className={`px-2 py-0.5 rounded text-sm font-medium ${colors[value] || ''}`}>{value}/5</span>;
  };

  const getNeeds = (r: any) => {
    const needs: string[] = [];
    Object.entries(NEEDS_LABELS).forEach(([key, label]) => {
      if (r[key]) needs.push(label);
    });
    return needs;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-slate-600">Loading responses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Client Survey Responses</h1>
            <p className="text-slate-600 mt-1">
              {responses.length} response{responses.length !== 1 ? 's' : ''} from clients
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Filter by Sales Rep:</label>
              <select
                value={filterRep}
                onChange={(e) => setFilterRep(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white min-w-[200px]"
              >
                <option value="">All Sales Reps</option>
                {reps.map(rep => (
                  <option key={rep.id} value={rep.slug}>{rep.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="/admin/sales-reps" className="text-blue-700 hover:underline font-medium">
              ← Manage Sales Reps
            </a>
            <a href="/admin" className="text-blue-700 hover:underline">
              Sales Rep Assessments
            </a>
            <a href="/admin/title-officer" className="text-blue-700 hover:underline">
              Title Officer Evaluations
            </a>
          </div>
        </div>

        {/* Responses List */}
        <div className="space-y-4">
          {responses.map((r) => {
            const needs = getNeeds(r);
            
            return (
              <div key={r.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Summary Row */}
                <div 
                  className="p-5 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between"
                  onClick={() => toggleExpand(r.id)}
                >
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="font-semibold text-lg text-slate-800">{r.client_name}</div>
                      <div className="text-slate-500 text-sm">{r.client_email}</div>
                      {r.client_company && (
                        <div className="text-slate-400 text-sm">{r.client_company}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-slate-500 uppercase mb-1">Sales Rep</div>
                      <div className="font-medium text-blue-700">{r.sales_rep_name || r.sales_rep_slug}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{r.capability_score}%</div>
                      <div className="text-xs text-slate-500">Capability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{r.avg_confidence_score}/5</div>
                      <div className="text-xs text-slate-500">Confidence</div>
                    </div>
                    <div className="text-sm text-slate-500">
                      {new Date(r.submitted_at).toLocaleDateString()}
                    </div>
                    <div className="text-slate-400 text-xl">
                      {expandedId === r.id ? '▼' : '▶'}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === r.id && (
                  <div className="border-t border-slate-200 p-6 bg-slate-50">
                    {/* Client Info */}
                    <div className="grid md:grid-cols-4 gap-4 mb-6 p-4 bg-white rounded-lg border">
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Name</div>
                        <div className="font-medium text-slate-800">{r.client_name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Email</div>
                        <div className="font-medium text-slate-800">{r.client_email}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Phone</div>
                        <div className="font-medium text-slate-800">{r.client_phone || '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Company</div>
                        <div className="font-medium text-slate-800">{r.client_company || '—'}</div>
                      </div>
                    </div>

                    {/* Needs Assessment */}
                    {(needs.length > 0 || r.needs_other || r.timeline || r.additional_notes) && (
                      <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <h3 className="font-semibold text-indigo-900 mb-3">Needs Assessment</h3>
                        {needs.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-indigo-700 uppercase tracking-wide mb-2">Interested In:</div>
                            <div className="flex flex-wrap gap-2">
                              {needs.map((need, i) => (
                                <span key={i} className="px-3 py-1 bg-white rounded-full text-sm text-indigo-700 border border-indigo-200">
                                  {need}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {r.needs_other && (
                          <div className="mb-3">
                            <div className="text-xs text-indigo-700 uppercase tracking-wide">Other Needs:</div>
                            <div className="text-indigo-900">{r.needs_other}</div>
                          </div>
                        )}
                        {r.timeline && (
                          <div className="mb-3">
                            <div className="text-xs text-indigo-700 uppercase tracking-wide">Timeline:</div>
                            <div className="text-indigo-900 font-medium">{r.timeline}</div>
                          </div>
                        )}
                        {r.additional_notes && (
                          <div>
                            <div className="text-xs text-indigo-700 uppercase tracking-wide">Additional Notes:</div>
                            <div className="text-indigo-900">{r.additional_notes}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tool Responses */}
                    <div className="grid gap-6">
                      {TOOLS.map((tool) => {
                        const yesCount = tool.questions.filter((_, i) => 
                          r[`${tool.prefix}_q${i + 1}`] === true
                        ).length;
                        
                        return (
                          <div key={tool.key} className="bg-white rounded-lg p-4 border">
                            <div className="flex justify-between items-center mb-3">
                              <h3 className="font-semibold text-lg text-slate-800">{tool.name}</h3>
                              <span className="text-sm bg-slate-100 px-2 py-1 rounded">
                                {yesCount}/{tool.questions.length} Yes
                              </span>
                            </div>
                            
                            {/* Questions */}
                            <div className="space-y-2 mb-4">
                              {tool.questions.map((q, i) => (
                                <div key={i} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                                  <span className="text-sm text-slate-700">{q}</span>
                                  {renderYesNo(r[`${tool.prefix}_q${i + 1}`])}
                                </div>
                              ))}
                            </div>

                            {/* Confidence Ratings */}
                            <div className="pt-3 border-t">
                              <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Confidence Ratings</div>
                              <div className="flex flex-wrap gap-3">
                                {[
                                  { key: 'awareness', label: 'Awareness' },
                                  { key: 'access', label: 'Access' },
                                  { key: 'setup', label: 'Setup' },
                                  { key: 'usage', label: 'Usage' },
                                  { key: 'need_training', label: 'Need Training' },
                                ].map((conf) => (
                                  <div key={conf.key} className="text-center">
                                    <div className="text-xs text-slate-500">{conf.label}</div>
                                    {renderConfidence(r[`${tool.prefix}_${conf.key}`])}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {responses.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-slate-500 text-lg">
                {filterRep ? 'No responses from this sales rep yet' : 'No client responses yet'}
              </div>
              <p className="text-slate-400 mt-2">
                Share survey links with clients to start collecting responses
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
