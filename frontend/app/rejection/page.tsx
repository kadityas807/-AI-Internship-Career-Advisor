'use client';

import AppLayout from '@/components/AppLayout';
import { useState } from 'react';
import { MailX, Loader2, Target, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RejectionResult {
  tone: string;
  likelyReason: string;
  improvements: string[];
  encouragement: string;
}

export default function RejectionPage() {
  const [emailText, setEmailText] = useState('');
  const [result, setResult] = useState<RejectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!emailText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are a brutally honest but empathetic career coach analyzing a rejection email. Your goal is to give the applicant real, actionable insight.\n\nRejection email:\n${emailText}\n\nAnalyze this rejection email and provide: the tone, the most likely real reason for rejection, 3 specific improvements for their next application, and a brief encouraging message.`,
          schema: {
            type: 'OBJECT',
            properties: {
              tone: { type: 'STRING', description: 'The tone of the rejection email e.g. Generic, Personalized, Encouraging' },
              likelyReason: { type: 'STRING', description: '2-3 sentences on the most likely real reason for rejection' },
              improvements: { type: 'ARRAY', items: { type: 'STRING' }, description: '3 specific things to improve for next application' },
              encouragement: { type: 'STRING', description: 'A brief encouraging note (1-2 sentences)' },
            },
            required: ['tone', 'likelyReason', 'improvements', 'encouragement'],
          },
        }),
      });
      if (!res.ok) throw new Error('API Error');
      const { text } = await res.json();
      setResult(JSON.parse(text || '{}'));
    } catch {
      setError('Failed to analyze. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-slate-500 mt-1">Understand the real reason and get 3 specific ways to improve.</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex justify-between">
            <span>{error}</span><button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Paste the Rejection Email</label>
          <textarea
            value={emailText}
            onChange={e => setEmailText(e.target.value)}
            rows={10}
            placeholder="Dear [Name], Thank you for your interest in [Company]..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none text-sm resize-none"
          />
          <button
            onClick={analyze}
            disabled={loading || !emailText.trim()}
            className="mt-4 w-full py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Brain className="w-4 h-4" /> Analyze Rejection</>}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-900 text-white p-6 rounded-2xl">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Email Tone</p>
                  <p className="text-xl font-bold">{result.tone}</p>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl">
                  <p className="text-xs text-rose-600 font-semibold uppercase tracking-wider mb-2">Likely Real Reason</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.likelyReason}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-indigo-500" /> 3 Things to Improve</h3>
                <div className="space-y-3">
                  {result.improvements.map((imp, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <span className="w-7 h-7 rounded-full bg-amber-400 text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <p className="text-sm text-amber-900 leading-relaxed">{imp}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white p-6 rounded-2xl text-center">
                <p className="text-lg font-semibold">💪 {result.encouragement}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
