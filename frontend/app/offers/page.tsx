'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Scale, Loader2, Plus, Trash2, Trophy, Clock, Award, ThumbsUp, AlertCircle } from 'lucide-react';
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
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([emptyOffer(), emptyOffer()]);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'offerComparisons', 'latest'));
        if (snap.exists()) {
          const d = snap.data();
          setResult(d.result);
          setSavedAt(d.comparedAt);
          if (d.offers) setOffers(d.offers);
        }
      } catch (e) { console.error('Failed to load:', e); }
    })();
  }, [user]);

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
            recommendation: 'string (which offer to take and why, 1-2 sentences)',
            reasoning: 'string (detailed 2-3 sentence reasoning)',
            offerRankings: [{ company: 'string', rank: 'number', pros: ['string'], cons: ['string'] }],
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
        await setDoc(doc(db, 'users', user.uid, 'offerComparisons', 'latest'), {
          result: data, offers: valid, comparedAt: now,
        });
      }
    } catch {
      setError('Failed to compare offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canCompare = offers.filter(o => o.company.trim()).length >= 2;
  const rankColors = ['border-teal-400 bg-teal-50', 'border-slate-300 bg-white', 'border-amber-300 bg-amber-50'];
  const rankBadges = ['🥇', '🥈', '🥉'];

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

        {savedAt && !loading && result && (
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            Last compared: {new Date(savedAt).toLocaleString()}
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
          <button onClick={compare} disabled={loading || !canCompare}
            className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Comparing...</> : <><Scale className="w-4 h-4" /> Compare Offers</>}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* AI Verdict */}
              <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-6 h-6" />
                  <p className="font-bold text-lg">AI Verdict</p>
                </div>
                <p className="font-semibold text-xl mb-2">{result.recommendation}</p>
                <p className="text-teal-100 text-sm leading-relaxed">{result.reasoning}</p>
              </div>

              {/* Ranked Offers */}
              <div className="space-y-4">
                {result.offerRankings?.sort((a, b) => a.rank - b.rank).map((o, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.1 }}
                    className={`border-2 rounded-2xl p-5 shadow-sm ${rankColors[i] || 'border-slate-200 bg-white'}`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{rankBadges[i] || `#${o.rank}`}</span>
                      <h3 className="font-bold text-slate-900 text-lg">{o.company}</h3>
                      {i === 0 && <span className="text-xs bg-teal-500 text-white px-3 py-1 rounded-full font-bold ml-auto">✨ RECOMMENDED</span>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Pros</p>
                        {o.pros?.map((p, j) => (
                          <div key={j} className="flex items-start gap-2 text-sm text-emerald-700">
                            <span className="text-emerald-500 shrink-0">✅</span>{p}
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Cons</p>
                        {o.cons?.map((c, j) => (
                          <div key={j} className="flex items-start gap-2 text-sm text-red-600">
                            <span className="shrink-0">⚠️</span>{c}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
