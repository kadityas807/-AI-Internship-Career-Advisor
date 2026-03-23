'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { motion } from 'motion/react';
import React from 'react';

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

  const handleKeyDown = (e: React.KeyboardEvent, nextStep?: number) => {
    if (e.key === 'Enter') {
      if (nextStep) {
        setStep(nextStep);
      } else {
        completeOnboarding();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden"
      >
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Step {step} of 3</span>
            <span className="text-xs font-medium text-slate-400">{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              className="h-full bg-indigo-600"
            />
          </div>
        </div>

        {step === 1 && (
          <div>
            <label htmlFor="role-input" className="block text-3xl font-bold mb-6">What is your target role?</label>
            <input 
              id="role-input"
              className="w-full p-4 border border-slate-200 rounded-xl mb-6 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              placeholder="e.g. Backend SDE Intern"
              onChange={(e) => setData({...data, role: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, 2)}
            />
            <button onClick={() => setStep(2)} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">Next</button>
          </div>
        )}
        {step === 2 && (
          <div>
            <label htmlFor="background-input" className="block text-3xl font-bold mb-6">Describe your background</label>
            <textarea 
              id="background-input"
              className="w-full p-4 border border-slate-200 rounded-xl mb-6 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none h-32 resize-none"
              placeholder="e.g. Final year CS student with 2 projects"
              onChange={(e) => setData({...data, background: e.target.value})}
            />
            <button onClick={() => setStep(3)} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">Next</button>
          </div>
        )}
        {step === 3 && (
          <div>
            <label htmlFor="timeline-input" className="block text-3xl font-bold mb-6">When is your target internship?</label>
            <input 
              id="timeline-input"
              className="w-full p-4 border border-slate-200 rounded-xl mb-6 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              placeholder="e.g. Summer 2025"
              onChange={(e) => setData({...data, timeline: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e)}
            />
            <button onClick={completeOnboarding} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">Finish</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
