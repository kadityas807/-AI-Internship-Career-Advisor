'use client';

import AppLayout from '@/components/AppLayout';
import { useState } from 'react';
import { Linkedin, Loader2, ArrowRight, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LinkedInResult {
  headlineRewrite: string;
  aboutRewrite: string;
  tips: string[];
}

export default function LinkedInPage() {
  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  const [result, setResult] = useState<LinkedInResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimize = async () => {
    if (!headline.trim() && !about.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are a LinkedIn profile expert specializing in optimizing profiles to attract recruiters for tech internships and entry-level roles.\n\nCurrent Headline: ${headline}\nCurrent About Section: ${about}\n\nRewrite the headline and about section for maximum recruiter impact. Also provide 3 specific tips.`,
          schema: {
            type: 'OBJECT',
            properties: {
              headlineRewrite: { type: 'STRING', description: 'Optimized LinkedIn headline' },
              aboutRewrite: { type: 'STRING', description: 'Optimized About section' },
              tips: { type: 'ARRAY', items: { type: 'STRING' }, description: '3 specific optimization tips' },
            },
            required: ['headlineRewrite', 'aboutRewrite', 'tips'],
          },
        }),
      });
      if (!res.ok) throw new Error('API Error');
      const { text } = await res.json();
      setResult(JSON.parse(text || '{}'));
    } catch {
      setError('Failed to optimize profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center">
              <Linkedin className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">LinkedIn Profile Optimizer</h1>
              <p className="text-slate-500 mt-1">Get AI-powered rewrites to attract more recruiters.</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Current Headline</label>
            <input
              type="text"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              placeholder="e.g. Computer Science Student | Aspiring Developer"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Current "About" Section</label>
            <textarea
              value={about}
              onChange={e => setAbout(e.target.value)}
              rows={6}
              placeholder="Paste your LinkedIn About section here..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-sm resize-none"
            />
          </div>
          <button
            onClick={optimize}
            disabled={loading || (!headline.trim() && !about.trim())}
            className="w-full py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Optimizing...</> : <><Linkedin className="w-4 h-4" /> Optimize My Profile</>}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Headline Comparison */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="font-bold text-slate-900 mb-4 text-lg">📝 Headline</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Before</p>
                    <p className="text-sm text-slate-700">{headline || '(empty)'}</p>
                  </div>
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-2">After ✨</p>
                    <p className="text-sm text-slate-800 font-medium">{result.headlineRewrite}</p>
                  </div>
                </div>
              </div>

              {/* About Comparison */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="font-bold text-slate-900 mb-4 text-lg">📖 About Section</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Before</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{about || '(empty)'}</p>
                  </div>
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-2">After ✨</p>
                    <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap">{result.aboutRewrite}</p>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
                <h3 className="font-bold text-indigo-800 mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Pro Tips</h3>
                <ul className="space-y-3">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-indigo-700 flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />{tip}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
