'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    salesRepResponses: 0,
    clientResponses: 0,
    titleOfficerEvaluations: 0,
    activeSalesReps: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth
    const isAuth = document.cookie.includes('pct_admin_auth=authenticated');
    if (!isAuth) {
      router.push('/admin/login');
      return;
    }

    // Fetch stats
    Promise.all([
      fetch('/api/responses?limit=1').then(r => r.json()),
      fetch('/api/client-responses?limit=1').then(r => r.json()),
      fetch('/api/title-officer?limit=1').then(r => r.json()),
      fetch('/api/sales-reps').then(r => r.json())
    ]).then(([respData, clientData, titleData, repsData]) => {
      setStats({
        salesRepResponses: respData.total || 0,
        clientResponses: clientData.total || 0,
        titleOfficerEvaluations: titleData.total || 0,
        activeSalesReps: repsData.reps?.length || 0
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [router]);

  return (
    <AdminLayout currentPage="dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of all assessment systems</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Sales Rep Assessments</div>
            <div className="mt-2 text-4xl font-bold text-blue-600">
              {loading ? '...' : stats.salesRepResponses}
            </div>
            <a href="/admin/responses" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
              View responses →
            </a>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Client Surveys</div>
            <div className="mt-2 text-4xl font-bold text-indigo-600">
              {loading ? '...' : stats.clientResponses}
            </div>
            <a href="/admin/client-responses" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">
              View responses →
            </a>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Title Officer Evals</div>
            <div className="mt-2 text-4xl font-bold text-amber-600">
              {loading ? '...' : stats.titleOfficerEvaluations}
            </div>
            <a href="/admin/title-officer" className="text-sm text-amber-600 hover:underline mt-2 inline-block">
              View evaluations →
            </a>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Active Sales Reps</div>
            <div className="mt-2 text-4xl font-bold text-green-600">
              {loading ? '...' : stats.activeSalesReps}
            </div>
            <a href="/admin/sales-reps" className="text-sm text-green-600 hover:underline mt-2 inline-block">
              Manage reps →
            </a>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a 
              href="/admin/sales-reps"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-slate-800">Add Sales Rep</div>
                <div className="text-sm text-slate-500">Create new survey link</div>
              </div>
            </a>

            <a 
              href="/"
              target="_blank"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-slate-800">Preview Survey</div>
                <div className="text-sm text-slate-500">Sales Rep Assessment</div>
              </div>
            </a>

            <a 
              href="/title-officer"
              target="_blank"
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-slate-800">Preview Survey</div>
                <div className="text-sm text-slate-500">Title Officer Evaluation</div>
              </div>
            </a>
          </div>
        </div>

        {/* Survey Links Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Survey Links</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-blue-700 font-medium">Sales Rep Self-Assessment:</span>
              <code className="bg-white px-2 py-1 rounded text-blue-800">/</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-700 font-medium">Title Officer Evaluation:</span>
              <code className="bg-white px-2 py-1 rounded text-blue-800">/title-officer</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-700 font-medium">Client Survey (per rep):</span>
              <code className="bg-white px-2 py-1 rounded text-blue-800">/client/[rep-slug]</code>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
