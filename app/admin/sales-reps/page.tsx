'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';

type SalesRep = {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  title: string | null;
  is_active: boolean;
  created_at: string;
};

export default function SalesRepsAdminPage() {
  const [reps, setReps] = useState<SalesRep[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [editingRep, setEditingRep] = useState<SalesRep | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTitle, setFormTitle] = useState('');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    fetchReps();
  }, [showInactive]);

  const fetchReps = () => {
    setLoading(true);
    fetch(`/api/sales-reps?active=${!showInactive}`)
      .then(res => res.json())
      .then(data => {
        setReps(data.reps || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormTitle('');
    setEditingRep(null);
    setIsAdding(false);
    setError(null);
  };

  const startEdit = (rep: SalesRep) => {
    setEditingRep(rep);
    setFormName(rep.name);
    setFormEmail(rep.email);
    setFormPhone(rep.phone || '');
    setFormTitle(rep.title || '');
    setIsAdding(false);
  };

  const startAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formEmail.trim()) {
      setError('Name and email are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingRep) {
        // Update existing
        const res = await fetch('/api/sales-reps', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingRep.id,
            name: formName,
            email: formEmail,
            phone: formPhone || null,
            title: formTitle || null
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        // Create new
        const res = await fetch('/api/sales-reps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            phone: formPhone || null,
            title: formTitle || null
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      resetForm();
      fetchReps();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (rep: SalesRep) => {
    try {
      await fetch('/api/sales-reps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rep.id, isActive: !rep.is_active })
      });
      fetchReps();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${baseUrl}/client/${slug}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <AdminLayout currentPage="sales-reps">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Sales Representatives</h1>
            <p className="text-slate-600 mt-1">
              Manage your team and their unique survey links
            </p>
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded"
              />
              Show inactive
            </label>
            <button
              onClick={startAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Add Sales Rep
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || editingRep) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              {editingRep ? 'Edit Sales Rep' : 'Add New Sales Rep'}
            </h2>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="john@pct.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="949.555.1234"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="VP Sales Manager"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {formName && (
              <div className="bg-slate-50 p-3 rounded-lg mb-4 text-sm">
                <span className="text-slate-500">Survey URL will be: </span>
                <span className="font-mono text-blue-600">
                  {baseUrl}/client/{formName.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
                </span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : (editingRep ? 'Update' : 'Add Sales Rep')}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reps List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Survey Link</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reps.map((rep) => (
                <tr key={rep.id} className={`hover:bg-slate-50 ${!rep.is_active ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{rep.name}</div>
                    {rep.title && <div className="text-sm text-slate-500">{rep.title}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{rep.email}</div>
                    {rep.phone && <div className="text-sm text-slate-500">{rep.phone}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-slate-100 px-2 py-1 rounded text-blue-700">
                        /client/{rep.slug}
                      </code>
                      <button
                        onClick={() => copyLink(rep.slug)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        title="Copy full URL"
                      >
                        Copy
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      rep.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {rep.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => startEdit(rep)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(rep)}
                      className={`text-sm font-medium ${
                        rep.is_active 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-green-600 hover:text-green-700'
                      }`}
                    >
                      {rep.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {reps.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No sales reps found. Click "Add Sales Rep" to create one.
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
