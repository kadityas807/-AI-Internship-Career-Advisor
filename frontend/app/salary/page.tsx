'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { DollarSign, Loader2, TrendingUp, ArrowRight, Clock, Building2, MapPin, Briefcase } from 'lucide-react';
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
  const { user } = useAuth();
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [result, setResult] = useState<SalaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'salaryInsights', 'latest'));
        if (snap.exists()) {
          const d = snap.data();
          setResult(d.result);
          setSavedAt(d.searchedAt);
          if (d.role) setRole(d.role);
          if (d.location) setLocation(d.location);
        }
      } catch (e) { console.error('Failed to load:', e); }
    })();
  }, [user]);

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
            minStipend: 'number (minimum monthly stipend)',
            maxStipend: 'number (maximum monthly stipend)',
            avgStipend: 'number (average monthly stipend)',
            currency: 'string (currency code e.g. INR, USD)',
            insights: ['string (market insight)'],
            topCompanies: [{ name: 'string', stipend: 'string (e.g. ₹50k/mo)' }],
            negotiationTips: ['string (negotiation tip)'],
          },
        }),
      });
      if (!res.ok) throw new Error('API Error');
      const { text } = await res.json();
      const data = JSON.parse(text || '{}');
      setResult(data);
      const now = new Date().toISOString();
      setSavedAt(now);
      if (user) {
        await setDoc(doc(db, 'users', user.uid, 'salaryInsights', 'latest'), {
          result: data, role, location, searchedAt: now,
        });
      }
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
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Salary Insights</h1>
              <p className="text-slate-500 mt-1">Discover realistic compensation ranges and negotiate better.</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex justify-between">
            <span>{error}</span><button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {savedAt && !loading && result && (
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            Last searched: {new Date(savedAt).toLocaleString()}
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> Target Role *</label>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Data Science Intern" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Bangalore, Remote" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          <button onClick={search} disabled={loading || !role.trim()} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Fetching insights...</> : <><TrendingUp className="w-4 h-4" /> Get Salary Insights</>}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Stipend Range Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10"><DollarSign className="w-32 h-32" /></div>
                <div className="relative z-10">
                  <p className="text-emerald-100 text-sm font-medium mb-6 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Monthly Range for {role} {location ? `in ${location}` : ''}
                  </p>
                  <div className="flex flex-wrap items-end gap-x-8 gap-y-4 mb-8">
                    <div>
                      <p className="text-xs text-emerald-200 mb-1 font-medium">Minimum</p>
                      <p className="text-3xl font-bold">{formatAmount(result.minStipend, result.currency)}</p>
                    </div>
                    <div className="hidden md:block text-emerald-300 text-2xl font-thin pb-1">—</div>
                    <div>
                      <p className="text-xs text-emerald-200 mb-1 font-medium">Average</p>
                      <p className="text-4xl font-black">{formatAmount(result.avgStipend, result.currency)}</p>
                    </div>
                    <div className="hidden md:block text-emerald-300 text-2xl font-thin pb-1">—</div>
                    <div>
                      <p className="text-xs text-emerald-200 mb-1 font-medium">Maximum</p>
                      <p className="text-3xl font-bold">{formatAmount(result.maxStipend, result.currency)}</p>
                    </div>
                  </div>
                  {/* Range visualizer */}
                  <div className="relative pt-1">
                    <div className="w-full bg-emerald-900/30 rounded-full h-3 overflow-hidden">
                      <div className="absolute bg-white/50 h-3 rounded-full" 
                        style={{ 
                          left: '0%', 
                          width: `${((result.avgStipend - result.minStipend) / (result.maxStipend - result.minStipend)) * 100}%` 
                        }} 
                      />
                      <div className="absolute bg-white shadow-lg h-5 w-5 rounded-full -top-1 border-2 border-emerald-500"
                        style={{ 
                          left: `calc(${((result.avgStipend - result.minStipend) / (result.maxStipend - result.minStipend)) * 100}% - 10px)` 
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Insights */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                  <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-600" /> Market Insights</h3>
                  <ul className="space-y-4 flex-1">
                    {result.insights?.map((ins, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-3">
                        <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Top Companies */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                  <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2"><Building2 className="w-5 h-5 text-emerald-600" /> Top Companies Hiring</h3>
                  <div className="space-y-3 flex-1">
                    {result.topCompanies?.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                        <span className="text-sm font-semibold text-slate-700">{c.name}</span>
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{c.stipend}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Negotiation Tips */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
                <h3 className="font-bold text-teal-800 mb-5 flex items-center gap-2">💬 Negotiation Tips</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {result.negotiationTips?.map((tip, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 text-sm font-bold flex items-center justify-center mb-3">{i + 1}</div>
                      <p className="text-sm text-teal-800 leading-relaxed">{tip}</p>
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
