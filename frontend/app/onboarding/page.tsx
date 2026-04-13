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
    await setDoc(doc(db, 'users', user.uid, 'profile', 'onboarding'), { ...data, completed: true, createdAt: serverTimestamp() });
    router.push('/dashboard');
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2 text-xs font-bold uppercase tracking-wider">
            <span className="text-indigo-600">Step {step} of 3</span>
            <span className="text-slate-400">{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-indigo-600" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>
        {step === 1 && (
          <div>
            <label htmlFor="role" className="block text-3xl font-bold mb-6">What is your target role?</label>
            <input id="role" className="w-full p-4 border rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Backend SDE Intern" value={data.role} onChange={(e) => setData({...data, role: e.target.value})} autoFocus />
            <button onClick={() => setStep(2)} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Next</button>
          </div>
        )}
        {step === 2 && (
          <div>
            <label htmlFor="background" className="block text-3xl font-bold mb-6">Describe your background</label>
            <textarea id="background" className="w-full p-4 border rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px]" placeholder="e.g. Final year CS student with 2 projects" value={data.background} onChange={(e) => setData({...data, background: e.target.value})} autoFocus />
            <button onClick={() => setStep(3)} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Next</button>
          </div>
        )}
        {step === 3 && (
          <div>
            <label htmlFor="timeline" className="block text-3xl font-bold mb-6">When is your target internship?</label>
            <input id="timeline" className="w-full p-4 border rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Summer 2025" value={data.timeline} onChange={(e) => setData({...data, timeline: e.target.value})} autoFocus />
            <button onClick={completeOnboarding} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Finish</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
