'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { MailX, Loader2, Target, Brain, Clock, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RejectionResult {
  tone: string;
  likelyReason: string;
  improvements: string[];
  encouragement: string;
}

const toneConfig: Record<string, { emoji: string; color: string; bg: string }> = {
  'Generic': { emoji: '📋', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200' },
  'Personalized': { emoji: '💬', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'Encouraging': { emoji: '💪', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'Cold': { emoji: '❄️', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
  'Harsh': { emoji: '⚡', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

export default function RejectionPage() {
  const { user } = useAuth();
  const [emailText, setEmailText] = useState('');
  const [result, setResult] = useState<RejectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'rejectionAnalysis', 'latest'));
        if (snap.exists()) {
          const d = snap.data();
          setResult(d.result);
          setSavedAt(d.analyzedAt);
        }
      } catch (e) { console.error('Failed to load:', e); }
    })();
  }, [user]);

  const analyze = async () => {
    if (!emailText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are a brutally honest but empathetic career coach analyzing a rejection email. Your goal is to give the applicant real, actionable insight.\n\nRejection email:\n${emailText}\n\nAnalyze this rejection email and provide: the tone (one word like Generic, Personalized, Encouraging, Cold, or Harsh), the most likely real reason for rejection, 3 specific improvements for their next application, and a brief encouraging message.`,
          schema: {
            tone: 'string (one word: Generic, Personalized, Encouraging, Cold, or Harsh)',
            likelyReason: 'string (2-3 sentences on the most likely real reason)',
            improvements: ['string (specific actionable improvement)'],
            encouragement: 'string (1-2 encouraging sentences)',
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
        await setDoc(doc(db, 'users', user.uid, 'rejectionAnalysis', 'latest'), {
          result: data, analyzedAt: now,
        });
      }
    } catch {
      setError('Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tone = result ? toneConfig[result.tone] || toneConfig['Generic'] : null;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
              <MailX className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Rejection Email Analyzer</h1>
              <p className="text-slate-500 mt-1">Understand the real reason and get specific ways to improve.</p>
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
            Last analyzed: {new Date(savedAt).toLocaleString()}
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Paste the Rejection Email</label>
          <textarea
            value={emailText} onChange={e => setEmailText(e.target.value)} rows={10}
            placeholder="Dear [Name], Thank you for your interest in [Company]..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none text-sm resize-none"
          />
          <button onClick={analyze} disabled={loading || !emailText.trim()}
            className="mt-4 w-full py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Brain className="w-4 h-4" /> Analyze Rejection</>}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Tone & Reason — side by side hero cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={`p-6 rounded-2xl border ${tone?.bg || 'bg-slate-100 border-slate-200'}`}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Email Tone</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{tone?.emoji || '📋'}</span>
                    <p className={`text-2xl font-bold ${tone?.color || 'text-slate-700'}`}>{result.tone}</p>
                  </div>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl">
                  <p className="text-xs text-rose-600 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Likely Real Reason
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.likelyReason}</p>
                </div>
              </div>

              {/* Improvement Action Plan */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" /> Your Action Plan
                </h3>
                <div className="space-y-4">
                  {result.improvements.map((imp, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.15 }}
                      className="flex items-start gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <span className="w-8 h-8 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        {i < result.improvements.length - 1 && <div className="w-0.5 h-6 bg-indigo-200 mt-1" />}
                      </div>
                      <div className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-sm text-slate-700 leading-relaxed">{imp}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Encouragement */}
              <div className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white p-6 rounded-2xl text-center">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-white/80" />
                <p className="text-lg font-semibold">💪 {result.encouragement}</p>
                <p className="text-sm text-white/60 mt-2">Remember: every rejection is a redirect to something better.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
