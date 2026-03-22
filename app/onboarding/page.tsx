'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function Onboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ role: '', background: '', timeline: '' });

  const completeOnboarding = async () => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'profile', 'onboarding'), {
      ...data, completed: true, createdAt: serverTimestamp(),
    });
    router.push('/dashboard');
  };

  const handleKeyDown = (e: React.KeyboardEvent, next: number | 'f') => {
    if (e.key === 'Enter') next === 'f' ? completeOnboarding() : setStep(next);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-widest mb-3 uppercase">
          <span>Onboarding Progress</span><span>Step {step} of 3</span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <motion.div animate={{ width: `${(step / 3) * 100}%` }} className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]" />
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-12 rounded-[2rem] shadow-2xl border border-slate-100 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <label htmlFor="role" className="block text-3xl font-bold mb-6 text-slate-900 tracking-tight">What is your target role?</label>
              <input id="role" className="w-full p-4 border border-slate-200 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. Backend SDE Intern" value={data.role} onChange={(e) => setData({...data, role: e.target.value})} onKeyDown={(e) => handleKeyDown(e, 2)} autoFocus />
              <button onClick={() => setStep(2)} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200/50">Next Step</button>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <label htmlFor="bg" className="block text-3xl font-bold mb-6 text-slate-900 tracking-tight">Describe your background</label>
              <textarea id="bg" className="w-full p-4 border border-slate-200 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[140px]" placeholder="e.g. CS student with 2 projects" value={data.background} onChange={(e) => setData({...data, background: e.target.value})} autoFocus />
              <button onClick={() => setStep(3)} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200/50">Next Step</button>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <label htmlFor="time" className="block text-3xl font-bold mb-6 text-slate-900 tracking-tight">When is your target internship?</label>
              <input id="time" className="w-full p-4 border border-slate-200 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. Summer 2025" value={data.timeline} onChange={(e) => setData({...data, timeline: e.target.value})} onKeyDown={(e) => handleKeyDown(e, 'f')} autoFocus />
              <button onClick={completeOnboarding} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200/50">Finish Onboarding</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
