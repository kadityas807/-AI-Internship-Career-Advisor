'use client';

import AppLayout from '@/components/AppLayout';
import { useState } from 'react';
import { Scale, Loader2, Plus, Trash2, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Offer {
  company: string;
  stipend: string;
  location: string;
  techStack: string;
  growth: number;
}

interface ComparisonResult {
  recommendation: string;
  reasoning: string;
  offerRankings: { company: string; rank: number; pros: string[]; cons: string[] }[];
}

const emptyOffer = (): Offer => ({ company: '', stipend: '', location: '', techStack: '', growth: 5 });

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([emptyOffer(), emptyOffer()]);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOffer = (i: number, field: keyof Offer, val: string | number) => {
    setOffers(prev => prev.map((o, idx) => idx === i ? { ...o, [field]: val } : o));
  };

  const addOffer = () => setOffers(prev => [...prev, emptyOffer()]);
  const removeOffer = (i: number) => setOffers(prev => prev.filter((_, idx) => idx !== i));

  const compare = async () => {
    const valid = offers.filter(o => o.company.trim());
    if (valid.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an expert career advisor helping a student compare internship offers. Analyze these offers and give a clear recommendation.\n\nOffers:\n${JSON.stringify(valid, null, 2)}\n\nConsider: stipend, location, tech stack relevance, growth potential, and overall career impact. Rank the offers and give pros/cons for each.`,
          schema: {
            type: 'OBJECT',
            properties: {
              recommendation: { type: 'STRING', description: 'Which offer to take and why, in 1-2 sentences' },
              reasoning: { type: 'STRING', description: 'Detailed 2-3 sentence reasoning' },
              offerRankings: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    company: { type: 'STRING' },
                    rank: { type: 'INTEGER' },
                    pros: { type: 'ARRAY', items: { type: 'STRING' } },
                    cons: { type: 'ARRAY', items: { type: 'STRING' } },
                  },
                  required: ['company', 'rank', 'pros', 'cons'],
                },
              },
            },
            required: ['recommendation', 'reasoning', 'offerRankings'],
          },
        }),
      });
      if (!res.ok) throw new Error('API Error');
      const { text } = await res.json();
      setResult(JSON.parse(text || '{}'));
    } catch {
      setError('Failed to compare offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canCompare = offers.filter(o => o.company.trim()).length >= 2;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Offer Comparison Tool</h1>
              <p className="text-slate-500 mt-1">Enter your internship offers and get an AI recommendation.</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex justify-between">
            <span>{error}</span><button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {offers.map((offer, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 relative">
              {offers.length > 2 && (
                <button onClick={() => removeOffer(i)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <h3 className="font-bold text-slate-700">Offer {i + 1}</h3>
              <input value={offer.company} onChange={e => updateOffer(i, 'company', e.target.value)} placeholder="Company name *" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              <input value={offer.stipend} onChange={e => updateOffer(i, 'stipend', e.target.value)} placeholder="Stipend (e.g. ₹25,000/month)" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              <input value={offer.location} onChange={e => updateOffer(i, 'location', e.target.value)} placeholder="Location (e.g. Bangalore, Remote)" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              <input value={offer.techStack} onChange={e => updateOffer(i, 'techStack', e.target.value)} placeholder="Tech stack (e.g. React, Python)" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
              <div>
                <label className="text-xs text-slate-500 font-medium">Growth Potential: {offer.growth}/10</label>
                <input type="range" min={1} max={10} value={offer.growth} onChange={e => updateOffer(i, 'growth', parseInt(e.target.value))} className="w-full accent-teal-600 mt-1" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          {offers.length < 3 && (
            <button onClick={addOffer} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm">
              <Plus className="w-4 h-4" /> Add Third Offer
            </button>
          )}
          <button
            onClick={compare}
            disabled={loading || !canCompare}
            className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Comparing...</> : <><Scale className="w-4 h-4" /> Compare Offers</>}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-3"><Trophy className="w-5 h-5" /><p className="font-bold text-lg">AI Verdict</p></div>
                <p className="font-semibold text-xl mb-2">{result.recommendation}</p>
                <p className="text-teal-100 text-sm">{result.reasoning}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {result.offerRankings?.sort((a, b) => a.rank - b.rank).map((o, i) => (
                  <div key={i} className={`bg-white border rounded-2xl p-5 shadow-sm ${i === 0 ? 'border-teal-300' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600'}`}>#{o.rank}</span>
                      <h3 className="font-bold text-slate-900">{o.company}</h3>
                      {i === 0 && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold ml-auto">Recommended</span>}
                    </div>
                    <div className="space-y-2">
                      {o.pros?.map((p, j) => <p key={j} className="text-xs text-emerald-700 flex items-start gap-1.5"><span>✅</span>{p}</p>)}
                      {o.cons?.map((c, j) => <p key={j} className="text-xs text-red-600 flex items-start gap-1.5"><span>⚠️</span>{c}</p>)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
