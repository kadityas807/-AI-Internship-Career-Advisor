'use client';

import AppLayout from '@/components/AppLayout';
import { useState } from 'react';
import { DollarSign, Loader2, TrendingUp, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SalaryResult {
  minStipend: number;
  maxStipend: number;
  avgStipend: number;
  currency: string;
  insights: string[];
  topCompanies: { name: string; stipend: string }[];
  negotiationTips: string[];
}

export default function SalaryPage() {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [result, setResult] = useState<SalaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!role.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are a compensation expert with knowledge of tech internship and entry-level salaries in India and globally. Provide realistic internship stipend/salary data for:\n\nRole: ${role}\nLocation: ${location || 'India (general)'}\n\nProvide monthly stipend ranges in the most relevant currency, key insights, top companies hiring for this role with their typical stipend, and negotiation tips.`,
          schema: {
            type: 'OBJECT',
            properties: {
              minStipend: { type: 'INTEGER', description: 'Minimum monthly stipend' },
              maxStipend: { type: 'INTEGER', description: 'Maximum monthly stipend' },
              avgStipend: { type: 'INTEGER', description: 'Average monthly stipend' },
              currency: { type: 'STRING', description: 'Currency code e.g. INR, USD' },
              insights: { type: 'ARRAY', items: { type: 'STRING' }, description: '3 market insights' },
              topCompanies: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: { name: { type: 'STRING' }, stipend: { type: 'STRING' } },
                  required: ['name', 'stipend'],
                },
              },
              negotiationTips: { type: 'ARRAY', items: { type: 'STRING' }, description: '3 negotiation tips' },
            },
            required: ['minStipend', 'maxStipend', 'avgStipend', 'currency', 'insights', 'topCompanies', 'negotiationTips'],
          },
        }),
      });
      if (!res.ok) throw new Error('API Error');
      const { text } = await res.json();
      setResult(JSON.parse(text || '{}'));
    } catch {
      setError('Failed to fetch salary insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amt: number, currency: string) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0 }).format(amt);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Salary Insights</h1>
              <p className="text-slate-500 mt-1">Discover internship stipend ranges and negotiate better.</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex justify-between">
            <span>{error}</span><button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Target Role *</label>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Data Science Intern, SWE Intern" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Bangalore, Mumbai, Remote" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          </div>
          <button onClick={search} disabled={loading || !role.trim()} className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading insights...</> : <><TrendingUp className="w-4 h-4" /> Get Salary Insights</>}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Stipend Range Card */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-2xl">
                <p className="text-green-100 text-sm font-medium mb-4">Monthly Stipend Range for {role} {location ? `in ${location}` : ''}</p>
                <div className="flex items-end gap-6 mb-5">
                  <div>
                    <p className="text-xs text-green-200 mb-1">Minimum</p>
                    <p className="text-2xl font-bold">{formatAmount(result.minStipend, result.currency)}</p>
                  </div>
                  <div className="text-green-300 text-2xl font-thin">—</div>
                  <div>
                    <p className="text-xs text-green-200 mb-1">Maximum</p>
                    <p className="text-3xl font-black">{formatAmount(result.maxStipend, result.currency)}</p>
                  </div>
                </div>
                {/* Range bar */}
                <div className="w-full bg-green-400/30 rounded-full h-3">
                  <div className="h-full bg-white rounded-full" style={{ width: `${(result.avgStipend - result.minStipend) / (result.maxStipend - result.minStipend + 1) * 100}%` }} />
                </div>
                <p className="text-center text-green-100 text-sm mt-3">Avg: <span className="font-bold text-white">{formatAmount(result.avgStipend, result.currency)}/mo</span></p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Companies */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">🏢 Top Companies Hiring</h3>
                  <div className="space-y-3">
                    {result.topCompanies?.map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <span className="text-sm font-medium text-slate-700">{c.name}</span>
                        <span className="text-sm font-bold text-green-600">{c.stipend}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insights */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4">📊 Market Insights</h3>
                  <ul className="space-y-3">
                    {result.insights?.map((ins, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />{ins}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Negotiation Tips */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
                <h3 className="font-bold text-indigo-800 mb-4">💬 Negotiation Tips</h3>
                <div className="space-y-3">
                  {result.negotiationTips?.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-800 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <p className="text-sm text-indigo-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
