'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { ListTodo, Loader2, CheckCircle2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Question {
  question: string;
  hint: string;
  context: string;
}

type QuestionStatus = 'new' | 'practiced' | 'mastered';

interface SavedQuestion extends Question {
  status: QuestionStatus;
}

export default function QuestionBankPage() {
  const { user } = useAuth();
  const [targetRole, setTargetRole] = useState('');
  const [company, setCompany] = useState('');
  const [questions, setQuestions] = useState<SavedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'practiced' | 'mastered'>('all');
  const [savedKey, setSavedKey] = useState('');

  useEffect(() => {
    if (!user || !savedKey) return;
    getDoc(doc(db, 'users', user.uid, 'questionBanks', savedKey)).then(snap => {
      if (snap.exists()) setQuestions(snap.data().questions || []);
    });
  }, [user, savedKey]);

  const generate = async () => {
    if (!targetRole.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an expert technical recruiter. Generate 10 targeted interview questions for a candidate applying for a "${targetRole}" role${company ? ` at ${company}` : ''}. Make them specific, realistic, and progressive in difficulty. Include a hint and context for each.`,
          schema: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                question: { type: 'STRING' },
                hint: { type: 'STRING', description: 'A brief tip or approach hint' },
                context: { type: 'STRING', description: 'Why this question is asked / what it tests' },
              },
              required: ['question', 'hint', 'context'],
            },
          },
        }),
      });
      const { text } = await res.json();
      const parsed: Question[] = JSON.parse(text || '[]').slice(0, 10);
      const withStatus: SavedQuestion[] = parsed.map(q => ({ ...q, status: 'new' }));
      setQuestions(withStatus);
      const key = `${targetRole.replace(/\s+/g, '-').toLowerCase()}-${company.replace(/\s+/g, '-').toLowerCase() || 'general'}`;
      setSavedKey(key);
      if (user) await setDoc(doc(db, 'users', user.uid, 'questionBanks', key), { questions: withStatus, targetRole, company });
    } catch { /* ignore */ }
    setLoading(false);
  };

  const updateStatus = async (i: number, status: QuestionStatus) => {
    const updated = questions.map((q, idx) => idx === i ? { ...q, status } : q);
    setQuestions(updated);
    if (user && savedKey) await setDoc(doc(db, 'users', user.uid, 'questionBanks', savedKey), { questions: updated, targetRole, company });
  };

  const filtered = filter === 'all' ? questions : questions.filter(q => q.status === filter);

  const statusStyles: Record<QuestionStatus, string> = {
    new: 'bg-slate-100 text-slate-600',
    practiced: 'bg-blue-100 text-blue-700',
    mastered: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <ListTodo className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Interview Question Bank</h1>
              <p className="text-slate-500 mt-1">Get targeted questions for your role and track your practice.</p>
            </div>
          </div>
        </motion.div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Target Role *</label>
              <input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Frontend Engineer Intern" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Target Company (optional)</label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, Zomato, Razorpay" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
          </div>
          <button onClick={generate} disabled={loading || !targetRole.trim()} className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Questions...</> : <><BookOpen className="w-4 h-4" /> Generate Question Bank</>}
          </button>
        </div>

        {questions.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {(['all', 'practiced', 'mastered'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {f} {f === 'all' ? `(${questions.length})` : `(${questions.filter(q => q.status === f).length})`}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {filtered.map((q, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="font-semibold text-slate-800 text-sm leading-snug flex-1">Q{questions.indexOf(q) + 1}. {q.question}</p>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusStyles[q.status]}`}>{q.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1"><span className="font-semibold">💡 Hint:</span> {q.hint}</p>
                    <p className="text-xs text-slate-400 mb-4"><span className="font-semibold">🎯 Tests:</span> {q.context}</p>
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(questions.indexOf(q), 'practiced')} className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${q.status === 'practiced' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                        Practiced
                      </button>
                      <button onClick={() => updateStatus(questions.indexOf(q), 'mastered')} className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${q.status === 'mastered' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Mastered
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
