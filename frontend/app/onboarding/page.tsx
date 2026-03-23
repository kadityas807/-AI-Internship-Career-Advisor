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

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full"
      >
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold mb-6">What is your target role?</h1>
            <input 
              className="w-full p-4 border rounded-xl mb-6"
              placeholder="e.g. Backend SDE Intern"
              onChange={(e) => setData({...data, role: e.target.value})}
            />
            <button onClick={() => setStep(2)} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold">Next</button>
          </div>
        )}
        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Describe your background</h1>
            <textarea 
              className="w-full p-4 border rounded-xl mb-6"
              placeholder="e.g. Final year CS student with 2 projects"
              onChange={(e) => setData({...data, background: e.target.value})}
            />
            <button onClick={() => setStep(3)} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold">Next</button>
          </div>
        )}
        {step === 3 && (
          <div>
            <h1 className="text-3xl font-bold mb-6">When is your target internship?</h1>
            <input 
              className="w-full p-4 border rounded-xl mb-6"
              placeholder="e.g. Summer 2025"
              onChange={(e) => setData({...data, timeline: e.target.value})}
            />
            <button onClick={completeOnboarding} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold">Finish</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
