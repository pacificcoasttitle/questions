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

const CONFIDENCE_LABELS = ['Awareness', 'Access', 'Setup', 'Usage', 'Need Training'];

export default function AdminPage() {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/responses?limit=100')
      .then(res => res.json())
      .then(data => {
        setResponses(data.responses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">PCT Assessment Responses</h1>
      <p className="mb-4 text-gray-600">Total: {responses.length} submissions</p>
      
      <div className="space-y-4">
        {responses.map((r) => (
          <div key={r.id} className="bg-white rounded-lg shadow">
            {/* Summary Row */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
              onClick={() => toggleExpand(r.id)}
            >
              <div className="flex items-center gap-6">
                <div>
                  <div className="font-semibold text-lg">{r.respondent_name}</div>
                  <div className="text-gray-500 text-sm">{r.respondent_email}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{r.capability_score}%</div>
                  <div className="text-xs text-gray-500">Capability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{r.avg_confidence_score}/5</div>
                  <div className="text-xs text-gray-500">Confidence</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(r.submitted_at).toLocaleDateString()}
                </div>
                <div className="text-gray-400 text-xl">
                  {expandedId === r.id ? '▼' : '▶'}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === r.id && (
              <div className="border-t p-6 bg-gray-50">
                <div className="grid gap-6">
                  {TOOLS.map((tool) => {
                    const yesCount = tool.questions.filter((_, i) => 
                      r[`${tool.prefix}_q${i + 1}`] === true
                    ).length;
                    
                    return (
                      <div key={tool.key} className="bg-white rounded-lg p-4 border">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-lg">{tool.name}</h3>
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {yesCount}/{tool.questions.length} Yes
                          </span>
                        </div>
                        
                        {/* Questions */}
                        <div className="space-y-2 mb-4">
                          {tool.questions.map((q, i) => (
                            <div key={i} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                              <span className="text-sm text-gray-700">{q}</span>
                              {renderYesNo(r[`${tool.prefix}_q${i + 1}`])}
                            </div>
                          ))}
                        </div>

                        {/* Confidence Ratings */}
                        <div className="pt-3 border-t">
                          <div className="text-xs text-gray-500 mb-2 font-medium">CONFIDENCE RATINGS</div>
                          <div className="flex flex-wrap gap-3">
                            {[
                              { key: 'awareness', label: 'Awareness' },
                              { key: 'access', label: 'Access' },
                              { key: 'setup', label: 'Setup' },
                              { key: 'usage', label: 'Usage' },
                              { key: 'need_training', label: 'Need Training' },
                            ].map((conf) => (
                              <div key={conf.key} className="text-center">
                                <div className="text-xs text-gray-500">{conf.label}</div>
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
        ))}

        {responses.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No responses yet
          </div>
        )}
      </div>
    </div>
  );
}
