'use client';

import AppLayout from '@/components/AppLayout';
import { useState } from 'react';
import { FileSearch, Loader2, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ResumeResult {
  overallScore: number;
  sectionScores: { section: string; score: number; comment: string }[];
  strengths: string[];
  improvements: string[];
}

export default function ResumePage() {
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            type: 'OBJECT',
            properties: {
              overallScore: { type: 'INTEGER', description: 'Overall resume score out of 100' },
              sectionScores: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    section: { type: 'STRING', description: 'Section name e.g. Summary, Experience, Skills, Education' },
                    score: { type: 'INTEGER', description: 'Score out of 100 for this section' },
                    comment: { type: 'STRING', description: 'One sentence feedback for this section' },
                  },
                  required: ['section', 'score', 'comment'],
                },
              },
              strengths: { type: 'ARRAY', items: { type: 'STRING' }, description: '3 key strengths of the resume' },
              improvements: { type: 'ARRAY', items: { type: 'STRING' }, description: '3 specific, actionable improvements' },
            },
            required: ['overallScore', 'sectionScores', 'strengths', 'improvements'],
          },
        }),
      });
      if (!res.ok) throw new Error('API Error');
      const { text } = await res.json();
      setResult(JSON.parse(text || '{}'));
    } catch {
      setError('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', ring: '#10b981' };
    if (score >= 60) return { text: 'text-amber-600', bg: 'bg-amber-500', ring: '#f59e0b' };
    return { text: 'text-red-500', bg: 'bg-red-500', ring: '#ef4444' };
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <FileSearch className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Resume Analyzer</h1>
              <p className="text-slate-500 mt-1">Paste your resume and get an AI score with actionable feedback.</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Paste Your Resume Text</label>
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            rows={12}
            placeholder="Paste your full resume content here (work experience, skills, education, etc.)..."
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
              {/* Overall Score */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
                <div className="relative flex-shrink-0">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke={scoreColor(result.overallScore).ring}
                      strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${326.56 * result.overallScore / 100} 326.56`}
                      transform="rotate(-90 60 60)"
                    />
                    <text x="60" y="67" textAnchor="middle" fill="#0f172a" fontSize="26" fontWeight="bold">{result.overallScore}</text>
                  </svg>
                  <p className="text-center text-xs text-slate-500 mt-1">out of 100</p>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Overall Resume Score</h2>
                  <p className={`text-lg font-semibold mb-4 ${scoreColor(result.overallScore).text}`}>
                    {result.overallScore >= 80 ? '🎉 Excellent Resume!' : result.overallScore >= 60 ? '👍 Good — Room to Improve' : '⚠️ Needs Significant Work'}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {result.sectionScores.map((sec, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-600">{sec.section}</span>
                          <span className={`text-xs font-bold ${scoreColor(sec.score).text}`}>{sec.score}/100</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1.5">
                          <div className={`h-full rounded-full ${scoreColor(sec.score).bg}`} style={{ width: `${sec.score}%` }} />
                        </div>
                        <p className="text-xs text-slate-500 leading-snug">{sec.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                  <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Strengths</h3>
                  <ul className="space-y-3">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 shrink-0 mt-0.5" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Improvements</h3>
                  <ul className="space-y-3">
                    {result.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center">{i + 1}</span>{s}
                      </li>
                    ))}
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
