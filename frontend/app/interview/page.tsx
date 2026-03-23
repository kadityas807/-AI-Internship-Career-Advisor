'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Mic, ChevronRight, Loader2, CheckCircle2, RotateCcw, Star, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Phase = 'setup' | 'interview' | 'results';

interface Question {
  question: string;
  hint?: string;
}

interface GradeResult {
  score: number; // 1-5
  feedback: string;
  improve: string;
}

export default function InterviewPage() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('setup');
  const [targetRole, setTargetRole] = useState('');
  const [interviewType, setInterviewType] = useState<'Behavioral' | 'Technical'>('Behavioral');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [grades, setGrades] = useState<GradeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, 'users', user.uid, 'skills')).then(snap => {
      setUserSkills(snap.docs.map(d => d.data().name as string));
    }).catch(() => {});
  }, [user]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const skillsHint = userSkills.length > 0 ? ` The candidate's skills include: ${userSkills.slice(0, 8).join(', ')}.` : '';
      const prompt = `Generate exactly 5 ${interviewType.toLowerCase()} interview questions for a candidate applying for the role of "${targetRole}".${skillsHint} Make the questions realistic, progressive in difficulty, and include a brief hint for the last one. Return a JSON array.`;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          schema: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                question: { type: 'STRING' },
                hint: { type: 'STRING' },
              },
              required: ['question'],
            },
          },
        }),
      });
      if (!res.ok) throw new Error('AI error');
      const { text } = await res.json();
      const qs: Question[] = JSON.parse(text || '[]').slice(0, 5);
      if (!qs.length) throw new Error('No questions generated');
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(''));
      setCurrentQ(0);
      setCurrentAnswer('');
      setPhase('interview');
    } catch (e: any) {
      alert('Failed to generate questions: ' + (e.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    const updated = [...answers];
    updated[currentQ] = currentAnswer;
    setAnswers(updated);
    setCurrentAnswer('');
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      gradeAll(updated);
    }
  };

  const gradeAll = async (finalAnswers: string[]) => {
    setGrading(true);
    setPhase('results');
    setGrades([]);
    try {
      const gradingRequests = questions.map((q, i) =>
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `You are an experienced ${interviewType === 'Technical' ? 'software engineering' : 'HR'} interviewer. Grade this answer for the role of "${targetRole}".\n\nQuestion: ${q.question}\nAnswer: ${finalAnswers[i] || '(No answer given)'}\n\nProvide a score from 1-5 (5 = excellent), concise feedback (2-3 sentences), and one specific improvement suggestion.`,
            schema: {
              type: 'OBJECT',
              properties: {
                score: { type: 'NUMBER' },
                feedback: { type: 'STRING' },
                improve: { type: 'STRING' },
              },
              required: ['score', 'feedback', 'improve'],
            },
          }),
        }).then(r => r.json()).then(({ text }) => JSON.parse(text || '{}')).catch(() => ({ score: 3, feedback: 'Could not grade.', improve: 'Try again.' }))
      );

      const results = await Promise.all(gradingRequests);
      setGrades(results);
    } catch {
      // empty
    } finally {
      setGrading(false);
    }
  };

  const restart = () => {
    setPhase('setup');
    setQuestions([]);
    setAnswers([]);
    setCurrentQ(0);
    setCurrentAnswer('');
    setGrades([]);
  };

  const totalScore = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length * 20) : 0;

  const scoreColor = (score: number) => {
    if (score >= 4) return 'text-emerald-600';
    if (score >= 3) return 'text-amber-600';
    return 'text-red-500';
  };

  const scoreRingColor = (pct: number) => {
    if (pct >= 80) return '#10b981';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center">
            <Mic className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-display tracking-tight">Mock Interview</h1>
            <p className="text-slate-500 mt-1">Practice with AI-powered role-specific questions and instant feedback.</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── Setup Phase ── */}
        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Set Up Your Interview</h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Target Role</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && targetRole && startInterview()}
                      placeholder="e.g. Frontend Intern, Data Analyst, SWE Intern"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Interview Type</label>
                    <div className="flex gap-3">
                      {(['Behavioral', 'Technical'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setInterviewType(type)}
                          className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                            interviewType === type
                              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300'
                          }`}
                        >
                          {type === 'Behavioral' ? '🗣 Behavioral' : '💻 Technical'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {userSkills.length > 0 && (
                    <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                      <p className="text-xs font-semibold text-violet-700 mb-2">✨ AI will tailor questions to your skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {userSkills.slice(0, 6).map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-white text-violet-700 border border-violet-200 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startInterview}
                    disabled={!targetRole.trim() || loading}
                    className="w-full py-4 bg-violet-600 text-white rounded-xl font-semibold text-base hover:bg-violet-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Generating Questions...</>
                    ) : (
                      <><Mic className="w-5 h-5" /> Start Interview (5 Questions)</>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Interview Phase ── */}
        {phase === 'interview' && (
          <motion.div key="interview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="max-w-2xl mx-auto">
              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-8">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                      i < currentQ ? 'bg-violet-500' : i === currentQ ? 'bg-violet-300' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-violet-500 uppercase tracking-wider">Question {currentQ + 1} of {questions.length}</span>
                    <p className="text-lg font-semibold text-slate-900 mt-1 leading-snug">{questions[currentQ]?.question}</p>
                    {questions[currentQ]?.hint && (
                      <p className="text-sm text-slate-400 mt-2 italic">💡 {questions[currentQ].hint}</p>
                    )}
                  </div>
                </div>

                <textarea
                  value={currentAnswer}
                  onChange={e => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here... Be specific and give examples where possible."
                  rows={7}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between mt-5">
                  <span className="text-xs text-slate-400">{currentAnswer.length} / ~300 recommended chars</span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={nextQuestion}
                    className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors shadow-sm"
                  >
                    {currentQ === questions.length - 1 ? 'Submit & Get Feedback' : 'Next Question'}
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Results Phase ── */}
        {phase === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="max-w-2xl mx-auto">
              {/* Score card */}
              {grades.length === questions.length && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 mb-6 text-white text-center"
                >
                  <svg className="mx-auto mb-4" width="88" height="88" viewBox="0 0 88 88">
                    <circle cx="44" cy="44" r="38" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                    <circle
                      cx="44" cy="44" r="38" fill="none"
                      stroke={scoreRingColor(totalScore)}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${238.76 * totalScore / 100} 238.76`}
                      transform="rotate(-90 44 44)"
                    />
                    <text x="44" y="50" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{totalScore}%</text>
                  </svg>
                  <h2 className="text-2xl font-bold mb-1">Interview Complete!</h2>
                  <p className="text-violet-200 text-sm">
                    {totalScore >= 80 ? '🎉 Outstanding performance!' : totalScore >= 60 ? '👍 Good effort, keep practicing!' : '📚 Review the feedback and try again.'}
                  </p>
                </motion.div>
              )}

              {/* Per-question grades */}
              <div className="space-y-4">
                {questions.map((q, i) => {
                  const grade = grades[i];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <p className="text-sm font-semibold text-slate-800 flex-1">Q{i + 1}: {q.question}</p>
                        {grade ? (
                          <div className={`text-2xl font-black shrink-0 ${scoreColor(grade.score)}`}>
                            {grade.score}/5
                            <div className="flex mt-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3 h-3 ${s <= grade.score ? 'fill-current' : 'text-slate-200 fill-slate-200'}`} />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <Loader2 className="w-5 h-5 animate-spin text-violet-400 shrink-0" />
                        )}
                      </div>

                      {answers[i] && (
                        <div className="bg-slate-50 rounded-xl p-3 mb-3 text-sm text-slate-600 line-clamp-3 border border-slate-100">
                          <span className="font-semibold text-slate-500 block text-xs mb-1">Your answer:</span>
                          {answers[i]}
                        </div>
                      )}

                      {grade && (
                        <div className="space-y-2">
                          <p className="text-sm text-slate-700">{grade.feedback}</p>
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                            <p className="text-xs font-semibold text-amber-700 mb-1">💡 How to improve:</p>
                            <p className="text-xs text-amber-800">{grade.improve}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={restart}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
