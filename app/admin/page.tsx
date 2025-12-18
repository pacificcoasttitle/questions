'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">PCT Assessment Responses</h1>
      <p className="mb-4 text-gray-600">Total: {responses.length} submissions</p>
      
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-center">Capability</th>
              <th className="px-4 py-3 text-center">Confidence</th>
              <th className="px-4 py-3 text-left">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{r.respondent_name}</td>
                <td className="px-4 py-3 text-gray-600">{r.respondent_email}</td>
                <td className="px-4 py-3 text-center font-medium">{r.capability_score}%</td>
                <td className="px-4 py-3 text-center">{r.avg_confidence_score}/5</td>
                <td className="px-4 py-3 text-gray-500 text-sm">
                  {new Date(r.submitted_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {responses.length === 0 && (
          <p className="text-center py-8 text-gray-500">No responses yet</p>
        )}
      </div>
    </div>
  );
}

