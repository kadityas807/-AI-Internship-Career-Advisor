'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { CalendarDays, Loader2, RefreshCw, BookOpen, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DayPlan {
  day: string;
  topic: string;
  tasks: string[];
  resources: { title: string; url: string }[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StudyPlanPage() {
  const { user } = useAuth();
  const [targetRole, setTargetRole] = useState('');
  const [plan, setPlan] = useState<DayPlan[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid, 'studyPlan', 'current')).then(snap => {
      if (snap.exists()) {
        setPlan(snap.data().plan);
        setTargetRole(snap.data().targetRole || '');
      }
      setLoading(false);
    });
  }, [user]);

  // Try to prefill from roadmap
  useEffect(() => {
    if (!user || targetRole) return;
    getDoc(doc(db, 'users', user.uid, 'roadmap', 'current')).then(snap => {
      if (snap.exists()) setTargetRole(snap.data().targetRole || '');
    }).catch(() => {});
  }, [user]);

  const generate = async () => {
    if (!targetRole.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a detailed 7-day study plan for a student preparing to become a "${targetRole}". Each day should focus on a specific topic with 3-4 concrete tasks and 2 learning resources (with real URLs from platforms like YouTube, freeCodeCamp, Coursera, MDN, official docs etc.). Plan should be balanced with weekends being lighter.`,
          schema: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                day: { type: 'STRING', description: 'Day name e.g. Monday' },
                topic: { type: 'STRING', description: 'Main topic for the day' },
                tasks: { type: 'ARRAY', items: { type: 'STRING' }, description: '3-4 specific study tasks' },
                resources: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      title: { type: 'STRING' },
                      url: { type: 'STRING', description: 'Real URL to the resource' },
                    },
                    required: ['title', 'url'],
                  },
                },
              },
              required: ['day', 'topic', 'tasks', 'resources'],
            },
          },
        }),
      });
      if (!res.ok) throw new Error('API Error');
      const { text } = await res.json();
      
      let parsed: DayPlan[] = [];
      try {
        parsed = JSON.parse(text || '[]');
        if (!Array.isArray(parsed)) {
          // If it returned an object with a field
          if ((parsed as any).plan) parsed = (parsed as any).plan;
          else if ((parsed as any).studyPlan) parsed = (parsed as any).studyPlan;
          else if ((parsed as any).items) parsed = (parsed as any).items;
          else throw new Error('Not an array');
        }
      } catch (e) {
        console.error('Parse error:', e, 'Raw text:', text);
        throw new Error('Invalid JSON format from AI');
      }

      const finalPlan = parsed.slice(0, 7);
      setPlan(finalPlan);
      if (user) await setDoc(doc(db, 'users', user.uid, 'studyPlan', 'current'), { plan: finalPlan, targetRole, updatedAt: new Date().toISOString() });
    } catch (err: any) {
      console.error('Generation failure:', err);
      setError(err.message === 'Invalid JSON format from AI' 
        ? 'The AI returned an invalid format. Please try again with a simpler role.' 
        : 'Failed to generate study plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const dayColors = ['bg-blue-500', 'bg-violet-500', 'bg-indigo-500', 'bg-purple-500', 'bg-teal-500', 'bg-amber-500', 'bg-rose-500'];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Daily Study Plan</h1>
              <p className="text-slate-500 mt-1">A personalized 7-day study schedule for your target role.</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex justify-between">
            <span>{error}</span><button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="Target role e.g. Full Stack Developer, ML Engineer" className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <button onClick={generate} disabled={generating || !targetRole.trim()} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors whitespace-nowrap">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : plan ? <><RefreshCw className="w-4 h-4" /> Regenerate</> : <><CalendarDays className="w-4 h-4" /> Generate Plan</>}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : (
          <AnimatePresence>
            {plan && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Day tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                  {plan.map((day, i) => (
                    <button key={i} onClick={() => setSelectedDay(i)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${selectedDay === i ? `${dayColors[i]} text-white shadow-md` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {day.day || DAYS[i]}
                    </button>
                  ))}
                </div>

                {/* Day detail */}
                {plan[selectedDay] && (
                  <motion.div key={selectedDay} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Topic */}
                    <div className={`md:col-span-1 ${dayColors[selectedDay]} text-white rounded-2xl p-6`}>
                      <p className="text-xs font-semibold text-white/70 uppercase mb-1">{plan[selectedDay].day || DAYS[selectedDay]}</p>
                      <h2 className="text-2xl font-bold leading-tight">{plan[selectedDay].topic}</h2>
                    </div>

                    <div className="md:col-span-2 space-y-5">
                      {/* Tasks */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-500" /> Today&apos;s Tasks</h3>
                        <ul className="space-y-3">
                          {plan[selectedDay].tasks?.map((task, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                              <span className={`w-6 h-6 rounded-full ${dayColors[selectedDay]} text-white flex items-center justify-center text-xs font-bold shrink-0`}>{i + 1}</span>
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Resources */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Link2 className="w-4 h-4 text-indigo-500" /> Learning Resources</h3>
                        <div className="space-y-3">
                          {plan[selectedDay].resources?.map((r, i) => (
                            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
                              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">{r.title}</span>
                              <span className="text-xs text-slate-400 group-hover:text-blue-400 truncate max-w-[160px] text-right">{r.url}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </AppLayout>
  );
}
