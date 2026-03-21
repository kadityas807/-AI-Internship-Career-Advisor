'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion } from 'motion/react';

export default function Onboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ role: '', background: '', timeline: '' });

  const completeOnboarding = async () => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'profile', 'onboarding'), {
      ...data,
      completed: true,
      createdAt: serverTimestamp(),
    });
    router.push('/dashboard');
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full"
      >
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step {step} of {totalSteps}</span>
            <span className="text-xs font-bold text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-indigo-600 rounded-full"
            />
          </div>
        </div>

        {step === 1 && (
          <div>
            <label htmlFor="role" className="block text-3xl font-bold mb-6 text-slate-900">What is your target role?</label>
            <input 
              id="role"
              value={data.role}
              className="w-full p-4 border border-slate-200 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Backend SDE Intern"
              onChange={(e) => setData({...data, role: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && data.role.trim() && setStep(2)}
            />
            <button
              onClick={() => setStep(2)}
              disabled={!data.role.trim()}
              className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <label htmlFor="background" className="block text-3xl font-bold mb-6 text-slate-900">Describe your background</label>
            <textarea 
              id="background"
              value={data.background}
              className="w-full p-4 border border-slate-200 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-32"
              placeholder="e.g. Final year CS student with 2 projects"
              onChange={(e) => setData({...data, background: e.target.value})}
            />
            <button
              onClick={() => setStep(3)}
              disabled={!data.background.trim()}
              className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
        {step === 3 && (
          <div>
            <label htmlFor="timeline" className="block text-3xl font-bold mb-6 text-slate-900">When is your target internship?</label>
            <input 
              id="timeline"
              value={data.timeline}
              className="w-full p-4 border border-slate-200 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Summer 2025"
              onChange={(e) => setData({...data, timeline: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && data.timeline.trim() && completeOnboarding()}
            />
            <button
              onClick={completeOnboarding}
              disabled={!data.timeline.trim()}
              className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Finish
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
