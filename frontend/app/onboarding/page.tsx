'use client';

import { useState, useEffect, useRef } from 'react';
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
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus the input/textarea whenever the step changes
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400); // Wait for entry animation
    return () => clearTimeout(timer);
  }, [step]);

  const completeOnboarding = async () => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'profile', 'onboarding'), {
      ...data,
      completed: true,
      createdAt: serverTimestamp(),
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden"
      >
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step {step} of 3</span>
            <span className="text-xs font-bold text-indigo-600">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              className="h-full bg-indigo-600 rounded-full"
            />
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            <label htmlFor="role-input" className="block text-3xl font-bold mb-6 text-slate-900 cursor-text">
              What is your target role?
            </label>
            <input 
              id="role-input"
              ref={inputRef as any}
              className="w-full p-4 border border-slate-200 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Backend SDE Intern"
              value={data.role}
              onChange={(e) => setData({...data, role: e.target.value})}
            />
            <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">Next</button>
          </form>
        )}
        {step === 2 && (
          <div>
            <label htmlFor="background-input" className="block text-3xl font-bold mb-6 text-slate-900 cursor-text">
              Describe your background
            </label>
            <textarea 
              id="background-input"
              ref={inputRef as any}
              className="w-full p-4 border border-slate-200 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-32"
              placeholder="e.g. Final year CS student with 2 projects"
              value={data.background}
              onChange={(e) => setData({...data, background: e.target.value})}
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 bg-slate-100 text-slate-600 p-4 rounded-xl font-bold hover:bg-slate-200 transition-colors">Back</button>
              <button type="button" onClick={() => setStep(3)} className="flex-[2] bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">Next</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <form onSubmit={(e) => { e.preventDefault(); completeOnboarding(); }}>
            <label htmlFor="timeline-input" className="block text-3xl font-bold mb-6 text-slate-900 cursor-text">
              When is your target internship?
            </label>
            <input 
              id="timeline-input"
              ref={inputRef as any}
              className="w-full p-4 border border-slate-200 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Summer 2025"
              value={data.timeline}
              onChange={(e) => setData({...data, timeline: e.target.value})}
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="flex-1 bg-slate-100 text-slate-600 p-4 rounded-xl font-bold hover:bg-slate-200 transition-colors">Back</button>
              <button type="submit" className="flex-[2] bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">Finish</button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
