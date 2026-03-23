'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Linkedin, Loader2, ArrowRight, Lightbulb, Copy, CheckCheck, Clock, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LinkedInResult {
  headlineRewrite: string;
  aboutRewrite: string;
  tips: string[];
}

export default function LinkedInPage() {
  const { user } = useAuth();
  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  const [result, setResult] = useState<LinkedInResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [copiedH, setCopiedH] = useState(false);
  const [copiedA, setCopiedA] = useState(false);

  // Load last saved
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'linkedinOptimization', 'latest'));
        if (snap.exists()) {
          const d = snap.data();
          setResult(d.result);
          setSavedAt(d.optimizedAt);
          if (d.headline) setHeadline(d.headline);
          if (d.about) setAbout(d.about);
        }
      } catch (e) { console.error('Failed to load:', e); }
    })();
  }, [user]);

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
            headlineRewrite: 'string (optimized LinkedIn headline)',
            aboutRewrite: 'string (optimized About section, 3-4 paragraphs)',
            tips: ['string (specific optimization tip)'],
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
        await setDoc(doc(db, 'users', user.uid, 'linkedinOptimization', 'latest'), {
          result: data, headline, about, optimizedAt: now,
        });
      }
    } catch {
      setError('Failed to optimize profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
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
            <span>{error}</span><button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {savedAt && !loading && result && (
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            Last optimized: {new Date(savedAt).toLocaleString()}
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Current Headline</label>
            <input
              type="text" value={headline} onChange={e => setHeadline(e.target.value)}
              placeholder="e.g. Computer Science Student | Aspiring Developer"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Current &quot;About&quot; Section</label>
            <textarea
              value={about} onChange={e => setAbout(e.target.value)} rows={6}
              placeholder="Paste your LinkedIn About section here..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-sm resize-none"
            />
          </div>
          <button onClick={optimize} disabled={loading || (!headline.trim() && !about.trim())}
            className="w-full py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Optimizing...</> : <><Linkedin className="w-4 h-4" /> Optimize My Profile</>}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Headline Before/After */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-900 text-lg">📝 Headline</h2>
                  <button onClick={() => copyText(result.headlineRewrite, setCopiedH)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors">
                    {copiedH ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Before</p>
                    <p className="text-sm text-slate-600">{headline || '(empty)'}</p>
                  </div>
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 relative">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center shadow-md hidden md:flex">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-2">After ✨</p>
                    <p className="text-sm text-slate-800 font-medium">{result.headlineRewrite}</p>
                  </div>
                </div>
              </div>

              {/* About Before/After */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-900 text-lg">📖 About Section</h2>
                  <button onClick={() => copyText(result.aboutRewrite, setCopiedA)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors">
                    {copiedA ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Before</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{about || '(empty)'}</p>
                  </div>
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center shadow-md hidden md:flex">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-2">After ✨</p>
                    <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap">{result.aboutRewrite}</p>
                  </div>
                </div>
              </div>

              {/* Tips — enhanced with numbering and icons */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-6">
                <h3 className="font-bold text-indigo-800 mb-5 flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Pro Tips to Stand Out</h3>
                <div className="space-y-3">
                  {result.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl border border-indigo-100">
                      <span className="w-7 h-7 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <p className="text-sm text-indigo-700 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-5 rounded-2xl flex items-center justify-between">
                <p className="text-sm font-medium">Ready to update your LinkedIn profile?</p>
                <a href="https://www.linkedin.com/in/me/" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors">
                  Open LinkedIn <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
