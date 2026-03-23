'use client';

import { useState } from 'react';
import { Target, Loader2, ChevronRight, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface SkillsGapProps {
  userSkills: string[];
}

interface GapResult {
  requiredSkills: string[];
  categories: string[];
  matchingSkills: string[];
  missingSkills: string[];
  coveragePercent: number;
}

export default function SkillsGap({ userSkills }: SkillsGapProps) {
  const [targetRole, setTargetRole] = useState('');
  const [result, setResult] = useState<GapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!targetRole.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const prompt = `You are a hiring expert. The user wants to become a "${targetRole}". List the 10 most important skills typically required for this role. Then check which of the user's skills match and which are missing.\n\nUser's current skills: ${userSkills.join(', ') || 'None listed yet'}\n\nBe specific — use exact technology names (e.g. "React" not "Frontend frameworks"). Return structured JSON.`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          schema: {
            type: 'OBJECT',
            properties: {
              requiredSkills: { type: 'ARRAY', items: { type: 'STRING' } },
              matchingSkills: { type: 'ARRAY', items: { type: 'STRING' } },
              missingSkills: { type: 'ARRAY', items: { type: 'STRING' } },
              coveragePercent: { type: 'NUMBER' },
            },
            required: ['requiredSkills', 'matchingSkills', 'missingSkills', 'coveragePercent'],
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to analyze');
      const { text } = await res.json();
      const data = JSON.parse(text || '{}');
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? {
    labels: result.requiredSkills.slice(0, 10),
    datasets: [
      {
        label: 'Have ✓',
        data: result.requiredSkills.slice(0, 10).map(s =>
          result.matchingSkills.some(m => m.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(m.toLowerCase())) ? 1 : 0
        ),
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Missing ✗',
        data: result.requiredSkills.slice(0, 10).map(s =>
          result.matchingSkills.some(m => m.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(m.toLowerCase())) ? 0 : 1
        ),
        backgroundColor: '#f87171',
        borderRadius: 6,
      },
    ],
  } : null;

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ctx.dataset.label,
        },
      },
    },
    scales: {
      x: { display: false, max: 1, stacked: true },
      y: { stacked: true, grid: { display: false }, ticks: { font: { size: 12 } } },
    },
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mt-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
          <Target className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Skills Gap Analysis</h2>
          <p className="text-sm text-slate-500">See what you need for your target role</p>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <input
          type="text"
          value={targetRole}
          onChange={e => setTargetRole(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && analyze()}
          placeholder="e.g. Frontend Intern at Google, ML Engineer, DevOps"
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={analyze}
          disabled={loading || !targetRole.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
          Analyze
        </motion.button>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Coverage score */}
            <div className="flex items-center gap-4 mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <circle
                    cx="28" cy="28" r="22" fill="none"
                    stroke={result.coveragePercent >= 70 ? '#10b981' : result.coveragePercent >= 40 ? '#f59e0b' : '#f87171'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${138.23 * result.coveragePercent / 100} 138.23`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800">
                  {Math.round(result.coveragePercent)}%
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {result.matchingSkills.length} of {result.requiredSkills.length} required skills
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {result.coveragePercent >= 70 ? '🎉 Strong match! You\'re well-prepared.' : result.coveragePercent >= 40 ? '👍 Good foundation, some gaps to fill.' : '📚 Focus on the missing skills below.'}
                </p>
              </div>
              <div className="ml-auto">
                <TrendingUp className={`w-6 h-6 ${result.coveragePercent >= 70 ? 'text-emerald-500' : result.coveragePercent >= 40 ? 'text-amber-500' : 'text-red-400'}`} />
              </div>
            </div>

            {/* Bar chart */}
            {chartData && (
              <div className="mb-5 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Have</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Missing</span>
                </div>
                <div style={{ height: `${result.requiredSkills.slice(0, 10).length * 32 + 20}px` }}>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            )}

            {/* Missing skills tags */}
            {result.missingSkills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills to acquire</p>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-medium"
                    >
                      + {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.matchingSkills.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills you already have</p>
                <div className="flex flex-wrap gap-2">
                  {result.matchingSkills.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
