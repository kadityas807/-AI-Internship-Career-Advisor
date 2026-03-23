'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { FileSearch, Loader2, CheckCircle2, AlertTriangle, TrendingUp, Download, Clock, Star, Zap, Copy, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ResumeResult {
  overallScore: number;
  sectionScores: { section: string; score: number; comment: string }[];
  strengths: string[];
  improvements: string[];
}

const scoreColor = (score: number) => {
  if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', ring: '#10b981', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Excellent' };
  if (score >= 60) return { text: 'text-amber-500', bg: 'bg-amber-500', ring: '#f59e0b', badge: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Good' };
  return { text: 'text-red-500', bg: 'bg-red-500', ring: '#ef4444', badge: 'bg-red-100 text-red-700 border-red-200', label: 'Needs Work' };
};

const priorityTag = (i: number) => {
  if (i === 0) return { bg: 'bg-red-100 text-red-700 border-red-200', label: '🔴 High Priority' };
  if (i === 1) return { bg: 'bg-amber-100 text-amber-700 border-amber-200', label: '🟡 Medium' };
  return { bg: 'bg-blue-100 text-blue-700 border-blue-200', label: '🔵 Low' };
};

export default function ResumePage() {
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load last saved result
  useEffect(() => {
    if (!user) return;
    const loadSaved = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'resumeAnalysis', 'latest'));
        if (snap.exists()) {
          const data = snap.data();
          setResult(data.result);
          setSavedAt(data.analyzedAt);
        }
      } catch (e) { console.error('Failed to load saved resume analysis:', e); }
    };
    loadSaved();
  }, [user]);

  const analyze = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an expert resume coach. Analyze the following resume text and provide a score out of 100 with detailed section-by-section feedback.\n\nResume:\n${resumeText}`,
          schema: {
            overallScore: 'number (0-100)',
            sectionScores: [{ section: 'string (e.g. Summary, Experience, Skills, Education, Formatting)', score: 'number (0-100)', comment: 'string (specific, actionable feedback)' }],
            strengths: ['string (specific strength found)'],
            improvements: ['string (specific, actionable improvement — be very specific with examples)'],
          },
        }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const { text } = await res.json();
      const data = JSON.parse(text || '{}');
      setResult(data);
      // Save to Firestore
      const now = new Date().toISOString();
      setSavedAt(now);
      if (user) {
        await setDoc(doc(db, 'users', user.uid, 'resumeAnalysis', 'latest'), {
          result: data,
          resumeText,
          analyzedAt: now,
        });
      }
    } catch (err: any) {
      setError('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyImprovements = () => {
    if (!result) return;
    const text = result.improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const avgSectionScore = result ? Math.round(result.sectionScores.reduce((a, b) => a + b.score, 0) / result.sectionScores.length) : 0;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <FileSearch className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Resume Analyzer</h1>
              <p className="text-slate-500 mt-1">Get an AI-powered score & actionable feedback on your resume.</p>
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
          <label className="block text-sm font-semibold text-slate-700 mb-2">Paste your resume text</label>
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            rows={12}
            placeholder="Paste your full resume content here..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-slate-400">{resumeText.length} characters</span>
            <button
              onClick={analyze}
              disabled={loading || !resumeText.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><FileSearch className="w-4 h-4" /> Analyze Resume</>}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Score Hero Card */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative flex-shrink-0">
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r="60" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                      <circle
                        cx="70" cy="70" r="60" fill="none"
                        stroke={scoreColor(result.overallScore).ring}
                        strokeWidth="12" strokeLinecap="round"
                        strokeDasharray={`${376.8 * result.overallScore / 100} 376.8`}
                        transform="rotate(-90 70 70)"
                        className="transition-all duration-1000"
                      />
                      <text x="70" y="65" textAnchor="middle" fill="#0f172a" fontSize="32" fontWeight="bold">{result.overallScore}</text>
                      <text x="70" y="85" textAnchor="middle" fill="#94a3b8" fontSize="12">/100</text>
                    </svg>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                      <h2 className="text-2xl font-bold text-slate-900">Resume Score</h2>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${scoreColor(result.overallScore).badge}`}>
                        {result.overallScore >= 80 ? '🎉 ' : result.overallScore >= 60 ? '👍 ' : '⚠️ '}
                        {scoreColor(result.overallScore).label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">
                      {result.overallScore >= 80 ? 'Your resume is in great shape! Minor tweaks will make it stand out.' : 
                       result.overallScore >= 60 ? 'Good foundation — focus on the improvements below to level up.' : 
                       'Your resume needs significant work. Follow the action items for quick wins.'}
                    </p>
                    {/* Quick Stats */}
                    <div className="flex gap-4 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                        <Star className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-700">{result.strengths.length} Strengths</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-700">{result.improvements.length} Action Items</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-semibold text-blue-700">Avg Section: {avgSectionScore}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Scores — visual bar chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-5 text-lg">📊 Section Breakdown</h3>
                <div className="space-y-4">
                  {result.sectionScores.map((sec, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-slate-700">{sec.section}</span>
                        <span className={`text-sm font-bold ${scoreColor(sec.score).text}`}>{sec.score}/100</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${sec.score}%` }} 
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className={`h-full rounded-full ${scoreColor(sec.score).bg}`} 
                        />
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed pl-1">{sec.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Improvements — enhanced cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                  <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> What&apos;s Working Well</h3>
                  <ul className="space-y-3">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-emerald-700 flex items-start gap-3 p-2.5 bg-white/60 rounded-xl border border-emerald-100">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-amber-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Action Items</h3>
                    <button onClick={copyImprovements} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-amber-200/50 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors">
                      {copied ? <><CheckCheck className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy All</>}
                    </button>
                  </div>
                  <ul className="space-y-3">
                    {result.improvements.map((s, i) => {
                      const priority = priorityTag(i);
                      return (
                        <li key={i} className="text-sm text-amber-900 p-3 bg-white/60 rounded-xl border border-amber-100">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priority.bg}`}>{priority.label}</span>
                          </div>
                          <p className="leading-relaxed">{s}</p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
